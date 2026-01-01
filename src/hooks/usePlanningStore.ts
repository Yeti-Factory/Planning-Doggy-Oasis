import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Person, DayAssignment, Settings, PlanningState, CODE_MAP, Category, MAX_PEOPLE_PER_SLOT } from '@/types/planning';

interface ClipboardData {
  type: 'day' | 'week';
  data: DayAssignment | DayAssignment[];
}

interface PlanningStore extends PlanningState {
  clipboard: ClipboardData | null;
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
}

const DEFAULT_PEOPLE: Person[] = [
  { id: '1', name: 'Anne', category: 'Salarié', code: 's' },
  { id: '2', name: 'Romane', category: 'Salarié', code: 's' },
  { id: '3', name: 'Alice', category: 'Bénévole', code: 'b' },
  { id: '4', name: 'Bob', category: 'Prestataire', code: 'p' },
  { id: '5', name: 'Woofeur 1', category: 'Woofer', code: 'w' },
  { id: '6', name: 'Prestataire X', category: 'Prestataire', code: 'p' },
];

const DEFAULT_SETTINGS: Settings = {
  hoursForMorning: 6,
  hoursForAfternoon: 6,
  hoursForFullDay: 9,
};

const createEmptySlots = (): (string | undefined)[] => Array(MAX_PEOPLE_PER_SLOT).fill(undefined);

const removePersonFromSlots = (slots: (string | undefined)[] | undefined, personId: string): (string | undefined)[] => {
  if (!slots) return createEmptySlots();
  return slots.map(id => id === personId ? undefined : id);
};

export const usePlanningStore = create<PlanningStore>()(
  persist(
    (set, get) => ({
      people: DEFAULT_PEOPLE,
      assignments: {},
      settings: DEFAULT_SETTINGS,
      clipboard: null,

      addPerson: (name: string, category: Category) => {
        const code = CODE_MAP[category];
        const newPerson: Person = {
          id: Date.now().toString(),
          name,
          category,
          code,
        };
        set((state) => ({ people: [...state.people, newPerson] }));
      },

      updatePerson: (id: string, name: string, category: Category) => {
        const code = CODE_MAP[category];
        set((state) => ({
          people: state.people.map((p) =>
            p.id === id ? { ...p, name, category, code } : p
          ),
        }));
      },

      removePerson: (id: string) => {
        set((state) => ({
          people: state.people.filter((p) => p.id !== id),
          assignments: Object.fromEntries(
            Object.entries(state.assignments).map(([date, assignment]: [string, DayAssignment]) => [
              date,
              {
                ...assignment,
                morning: removePersonFromSlots(assignment.morning, id),
                afternoon: removePersonFromSlots(assignment.afternoon, id),
                fullDay: removePersonFromSlots(assignment.fullDay, id),
              },
            ])
          ),
        }));
      },

      setAssignment: (date: string, slot: 'morning' | 'afternoon' | 'fullDay', index: number, personId: string | undefined) => {
        set((state) => {
          const current = state.assignments[date] || { 
            date, 
            morning: createEmptySlots(), 
            afternoon: createEmptySlots(), 
            fullDay: createEmptySlots() 
          };
          const currentSlot = current[slot] || createEmptySlots();
          const newSlot = [...currentSlot];
          newSlot[index] = personId;
          
          return {
            assignments: {
              ...state.assignments,
              [date]: {
                ...current,
                [slot]: newSlot,
              },
            },
          };
        });
      },

      setDayAssignment: (date: string, assignment: Omit<DayAssignment, 'date'>) => {
        set((state) => ({
          assignments: {
            ...state.assignments,
            [date]: {
              date,
              morning: assignment.morning || createEmptySlots(),
              afternoon: assignment.afternoon || createEmptySlots(),
              fullDay: assignment.fullDay || createEmptySlots(),
            },
          },
        }));
      },

      updateSettings: (newSettings: Partial<Settings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      getPersonById: (id: string) => {
        return get().people.find((p) => p.id === id);
      },

      getAssignment: (date: string) => {
        return get().assignments[date];
      },

      copyDay: (date: string) => {
        const assignment = get().assignments[date];
        if (assignment) {
          set({ 
            clipboard: { 
              type: 'day', 
              data: { ...assignment } 
            } 
          });
        } else {
          set({ 
            clipboard: { 
              type: 'day', 
              data: { 
                date, 
                morning: createEmptySlots(), 
                afternoon: createEmptySlots(), 
                fullDay: createEmptySlots() 
              } 
            } 
          });
        }
      },

      copyWeek: (dates: string[]) => {
        const weekAssignments = dates.map(date => {
          const assignment = get().assignments[date];
          return assignment || { 
            date, 
            morning: createEmptySlots(), 
            afternoon: createEmptySlots(), 
            fullDay: createEmptySlots() 
          };
        });
        set({ 
          clipboard: { 
            type: 'week', 
            data: weekAssignments 
          } 
        });
      },

      pasteToDay: (date: string) => {
        const { clipboard } = get();
        if (!clipboard) return;

        if (clipboard.type === 'day') {
          const sourceData = clipboard.data as DayAssignment;
          set((state) => ({
            assignments: {
              ...state.assignments,
              [date]: {
                date,
                morning: [...(sourceData.morning || createEmptySlots())],
                afternoon: [...(sourceData.afternoon || createEmptySlots())],
                fullDay: [...(sourceData.fullDay || createEmptySlots())],
              },
            },
          }));
        }
      },

      pasteToWeek: (dates: string[]) => {
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
              }
            });
            return { assignments: newAssignments };
          });
        } else if (clipboard.type === 'day') {
          // If a day is copied, paste it to all days in the week
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
            });
            return { assignments: newAssignments };
          });
        }
      },

      clearClipboard: () => {
        set({ clipboard: null });
      },

      clearDay: (date: string) => {
        set((state) => ({
          assignments: {
            ...state.assignments,
            [date]: {
              date,
              morning: createEmptySlots(),
              afternoon: createEmptySlots(),
              fullDay: createEmptySlots(),
            },
          },
        }));
      },

      clearWeek: (dates: string[]) => {
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
      },
    }),
    {
      name: 'planning-storage',
      partialize: (state) => ({
        people: state.people,
        assignments: state.assignments,
        settings: state.settings,
        // Don't persist clipboard
      }),
    }
  )
);
