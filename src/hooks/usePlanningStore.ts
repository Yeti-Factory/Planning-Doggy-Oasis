import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Person, DayAssignment, Settings, PlanningState, CODE_MAP, Category, MAX_PEOPLE_PER_SLOT } from '@/types/planning';

interface ClipboardData {
  type: 'day' | 'week';
  data: DayAssignment | DayAssignment[];
}

interface PlanningStore extends PlanningState {
  clipboard: ClipboardData | null;
  loading: boolean;
  loaded: boolean;
  fetchAll: () => Promise<void>;
  addPerson: (name: string, category: Category) => void;
  updatePerson: (id: string, name: string, category: Category) => void;
  removePerson: (id: string) => void;
  setAssignment: (date: string, slot: 'morning' | 'afternoon' | 'fullDay', index: number, personId: string | undefined) => void;
  setDayAssignment: (date: string, assignment: Omit<DayAssignment, 'date'>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  getPersonById: (id: string) => Person | undefined;
  getAssignment: (date: string) => DayAssignment | undefined;
  copyDay: (date: string) => void;
  copyWeek: (dates: string[]) => void;
  pasteToDay: (date: string) => void;
  pasteToWeek: (dates: string[]) => void;
  clearClipboard: () => void;
  clearDay: (date: string) => void;
  clearWeek: (dates: string[]) => void;
  subscribeRealtime: () => () => void;
}

const createEmptySlots = (): (string | undefined)[] => Array(MAX_PEOPLE_PER_SLOT).fill(undefined);

const DEFAULT_SETTINGS: Settings = {
  hoursForMorning: 6,
  hoursForAfternoon: 6,
  hoursForFullDay: 9,
};

// Helper to save a full day assignment to DB
const saveDayToDb = async (date: string, assignment: Omit<DayAssignment, 'date'>) => {
  // Delete existing for this date
  await supabase.from('planning_assignments').delete().eq('date', date);
  
  const rows: { date: string; slot: string; slot_index: number; person_id: string }[] = [];
  const slots = ['morning', 'afternoon', 'fullDay'] as const;
  
  for (const slot of slots) {
    const people = assignment[slot] || createEmptySlots();
    for (let i = 0; i < people.length; i++) {
      if (people[i]) {
        rows.push({ date, slot, slot_index: i, person_id: people[i] as string });
      }
    }
  }
  
  if (rows.length > 0) {
    await supabase.from('planning_assignments').insert(rows);
  }
};

export const usePlanningStore = create<PlanningStore>()((set, get) => ({
  people: [],
  assignments: {},
  settings: DEFAULT_SETTINGS,
  clipboard: null,
  loading: false,
  loaded: false,

  fetchAll: async () => {
    set({ loading: true });

    const [peopleRes, assignmentsRes, settingsRes] = await Promise.all([
      supabase.from('people').select('*').order('created_at'),
      supabase.from('planning_assignments').select('*'),
      supabase.from('settings').select('*'),
    ]);

    // People
    const people: Person[] = (peopleRes.data || []).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category as Category,
      code: p.code as Person['code'],
    }));

    // Assignments
    const assignments: Record<string, DayAssignment> = {};
    for (const row of assignmentsRes.data || []) {
      if (!assignments[row.date]) {
        assignments[row.date] = {
          date: row.date,
          morning: createEmptySlots(),
          afternoon: createEmptySlots(),
          fullDay: createEmptySlots(),
        };
      }
      const slot = row.slot as 'morning' | 'afternoon' | 'fullDay';
      assignments[row.date][slot][row.slot_index] = row.person_id || undefined;
    }

    // Settings
    const settings = { ...DEFAULT_SETTINGS };
    for (const row of settingsRes.data || []) {
      if (row.key in settings) {
        (settings as Record<string, number>)[row.key] = Number(row.value);
      }
    }

    set({ people, assignments, settings, loading: false, loaded: true });
  },

  addPerson: (name: string, category: Category) => {
    const code = CODE_MAP[category];
    const id = Date.now().toString();
    const newPerson: Person = { id, name, category, code };
    set((state) => ({ people: [...state.people, newPerson] }));

    supabase.from('people').insert({ id, name, category, code }).then(({ error }) => {
      if (error) console.error('Error adding person:', error);
    });
  },

  updatePerson: (id: string, name: string, category: Category) => {
    const code = CODE_MAP[category];
    set((state) => ({
      people: state.people.map((p) => (p.id === id ? { ...p, name, category, code } : p)),
    }));

    supabase.from('people').update({ name, category, code }).eq('id', id).then(({ error }) => {
      if (error) console.error('Error updating person:', error);
    });
  },

  removePerson: (id: string) => {
    set((state) => {
      const newAssignments: Record<string, DayAssignment> = {};
      for (const [date, a] of Object.entries(state.assignments)) {
        newAssignments[date] = {
          ...a,
          morning: a.morning.map((pid) => (pid === id ? undefined : pid)),
          afternoon: a.afternoon.map((pid) => (pid === id ? undefined : pid)),
          fullDay: a.fullDay.map((pid) => (pid === id ? undefined : pid)),
        };
      }
      return {
        people: state.people.filter((p) => p.id !== id),
        assignments: newAssignments,
      };
    });

    // CASCADE will handle planning_assignments cleanup
    supabase.from('people').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Error removing person:', error);
    });
  },

  setAssignment: (date, slot, index, personId) => {
    set((state) => {
      const current = state.assignments[date] || {
        date,
        morning: createEmptySlots(),
        afternoon: createEmptySlots(),
        fullDay: createEmptySlots(),
      };
      const newSlot = [...current[slot]];
      newSlot[index] = personId;

      const updated = { ...current, [slot]: newSlot };
      return { assignments: { ...state.assignments, [date]: updated } };
    });

    // Save to DB
    if (personId) {
      supabase.from('planning_assignments')
        .upsert({ date, slot, slot_index: index, person_id: personId }, { onConflict: 'date,slot,slot_index' })
        .then(({ error }) => { if (error) console.error('Error setting assignment:', error); });
    } else {
      supabase.from('planning_assignments')
        .delete()
        .eq('date', date)
        .eq('slot', slot)
        .eq('slot_index', index)
        .then(({ error }) => { if (error) console.error('Error clearing assignment:', error); });
    }
  },

  setDayAssignment: (date, assignment) => {
    const full: DayAssignment = {
      date,
      morning: assignment.morning || createEmptySlots(),
      afternoon: assignment.afternoon || createEmptySlots(),
      fullDay: assignment.fullDay || createEmptySlots(),
    };
    set((state) => ({ assignments: { ...state.assignments, [date]: full } }));
    saveDayToDb(date, full);
  },

  updateSettings: (newSettings: Partial<Settings>) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));

    for (const [key, value] of Object.entries(newSettings)) {
      supabase.from('settings')
        .upsert({ key, value: String(value), updated_at: new Date().toISOString() }, { onConflict: 'key' })
        .then(({ error }) => { if (error) console.error('Error updating setting:', error); });
    }
  },

  getPersonById: (id) => get().people.find((p) => p.id === id),
  getAssignment: (date) => get().assignments[date],

  copyDay: (date) => {
    const assignment = get().assignments[date] || {
      date,
      morning: createEmptySlots(),
      afternoon: createEmptySlots(),
      fullDay: createEmptySlots(),
    };
    set({ clipboard: { type: 'day', data: { ...assignment } } });
  },

  copyWeek: (dates) => {
    const weekAssignments = dates.map((date) => {
      return get().assignments[date] || {
        date,
        morning: createEmptySlots(),
        afternoon: createEmptySlots(),
        fullDay: createEmptySlots(),
      };
    });
    set({ clipboard: { type: 'week', data: weekAssignments } });
  },

  pasteToDay: (date) => {
    const { clipboard } = get();
    if (!clipboard || clipboard.type !== 'day') return;

    const sourceData = clipboard.data as DayAssignment;
    const pasted: DayAssignment = {
      date,
      morning: [...(sourceData.morning || createEmptySlots())],
      afternoon: [...(sourceData.afternoon || createEmptySlots())],
      fullDay: [...(sourceData.fullDay || createEmptySlots())],
    };
    set((state) => ({ assignments: { ...state.assignments, [date]: pasted } }));
    saveDayToDb(date, pasted);
  },

  pasteToWeek: (dates) => {
    const { clipboard } = get();
    if (!clipboard) return;

    if (clipboard.type === 'week') {
      const sourceData = clipboard.data as DayAssignment[];
      set((state) => {
        const newAssignments = { ...state.assignments };
        dates.forEach((date, index) => {
          if (sourceData[index]) {
            newAssignments[date] = {
              date,
              morning: [...(sourceData[index].morning || createEmptySlots())],
              afternoon: [...(sourceData[index].afternoon || createEmptySlots())],
              fullDay: [...(sourceData[index].fullDay || createEmptySlots())],
            };
            saveDayToDb(date, newAssignments[date]);
          }
        });
        return { assignments: newAssignments };
      });
    } else {
      const sourceData = clipboard.data as DayAssignment;
      set((state) => {
        const newAssignments = { ...state.assignments };
        dates.forEach((date) => {
          newAssignments[date] = {
            date,
            morning: [...(sourceData.morning || createEmptySlots())],
            afternoon: [...(sourceData.afternoon || createEmptySlots())],
            fullDay: [...(sourceData.fullDay || createEmptySlots())],
          };
          saveDayToDb(date, newAssignments[date]);
        });
        return { assignments: newAssignments };
      });
    }
  },

  clearClipboard: () => set({ clipboard: null }),

  clearDay: (date) => {
    const empty: DayAssignment = {
      date,
      morning: createEmptySlots(),
      afternoon: createEmptySlots(),
      fullDay: createEmptySlots(),
    };
    set((state) => ({ assignments: { ...state.assignments, [date]: empty } }));
    supabase.from('planning_assignments').delete().eq('date', date).then(({ error }) => {
      if (error) console.error('Error clearing day:', error);
    });
  },

  clearWeek: (dates) => {
    set((state) => {
      const newAssignments = { ...state.assignments };
      dates.forEach((date) => {
        newAssignments[date] = {
          date,
          morning: createEmptySlots(),
          afternoon: createEmptySlots(),
          fullDay: createEmptySlots(),
        };
      });
      return { assignments: newAssignments };
    });

    (async () => {
      for (const date of dates) {
        await supabase.from('planning_assignments').delete().eq('date', date);
      }
    })();
  },

  subscribeRealtime: () => {
    const channels = [
      supabase.channel('people-changes').on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'people' },
        () => { set({ loaded: false }); get().fetchAll(); }
      ).subscribe(),
      supabase.channel('assignments-changes').on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'planning_assignments' },
        () => { set({ loaded: false }); get().fetchAll(); }
      ).subscribe(),
      supabase.channel('settings-changes').on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings' },
        () => { set({ loaded: false }); get().fetchAll(); }
      ).subscribe(),
    ];

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  },
}));
