import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyTaskAssignment, WeeklyTasksState } from '@/types/tasks';

interface WeeklyTasksStore extends WeeklyTasksState {
  loading: boolean;
  loadedWeeks: Set<string>;
  fetchWeekTasks: (weekStartDate: string) => Promise<void>;
  setTaskAssignment: (
    weekStartDate: string,
    personId: string,
    day: number,
    period: 'morning' | 'afternoon',
    tasks: string
  ) => void;
  getTaskAssignment: (
    weekStartDate: string,
    personId: string,
    day: number,
    period: 'morning' | 'afternoon'
  ) => WeeklyTaskAssignment | undefined;
  clearWeekTasks: (weekStartDate: string) => void;
  copyWeekTasks: (sourceWeekStart: string, targetWeekStart: string) => void;
  subscribeRealtime: () => () => void;
}

const createAssignmentKey = (
  weekStartDate: string,
  personId: string,
  day: number,
  period: 'morning' | 'afternoon'
): string => `${weekStartDate}-${personId}-${day}-${period}`;

export const useWeeklyTasksStore = create<WeeklyTasksStore>()((set, get) => ({
  assignments: {},
  loading: false,
  loadedWeeks: new Set(),

  fetchWeekTasks: async (weekStartDate: string) => {
    if (get().loadedWeeks.has(weekStartDate)) return;
    set({ loading: true });

    const { data, error } = await supabase
      .from('weekly_tasks')
      .select('*')
      .eq('week_start_date', weekStartDate);

    if (error) {
      console.error('Error fetching weekly tasks:', error);
      set({ loading: false });
      return;
    }

    const newAssignments: Record<string, WeeklyTaskAssignment> = {};
    for (const row of data || []) {
      const key = createAssignmentKey(row.week_start_date, row.person_id, row.day, row.period as 'morning' | 'afternoon');
      newAssignments[key] = {
        weekStartDate: row.week_start_date,
        personId: row.person_id,
        day: row.day,
        period: row.period as 'morning' | 'afternoon',
        tasks: row.tasks,
      };
    }

    set((state) => ({
      assignments: { ...state.assignments, ...newAssignments },
      loading: false,
      loadedWeeks: new Set([...state.loadedWeeks, weekStartDate]),
    }));
  },

  setTaskAssignment: (weekStartDate, personId, day, period, tasks) => {
    const key = createAssignmentKey(weekStartDate, personId, day, period);

    set((state) => {
      if (!tasks || tasks.trim() === '') {
        const { [key]: _, ...rest } = state.assignments;
        return { assignments: rest };
      }
      return {
        assignments: {
          ...state.assignments,
          [key]: { weekStartDate, personId, day, period, tasks: tasks.trim() },
        },
      };
    });

    if (!tasks || tasks.trim() === '') {
      supabase.from('weekly_tasks')
        .delete()
        .eq('week_start_date', weekStartDate)
        .eq('person_id', personId)
        .eq('day', day)
        .eq('period', period)
        .then(({ error }) => { if (error) console.error('Error deleting task:', error); });
    } else {
      supabase.from('weekly_tasks')
        .upsert(
          { week_start_date: weekStartDate, person_id: personId, day, period, tasks: tasks.trim() },
          { onConflict: 'week_start_date,person_id,day,period' }
        )
        .then(({ error }) => { if (error) console.error('Error saving task:', error); });
    }
  },

  getTaskAssignment: (weekStartDate, personId, day, period) => {
    const key = createAssignmentKey(weekStartDate, personId, day, period);
    return get().assignments[key];
  },

  clearWeekTasks: (weekStartDate) => {
    set((state) => {
      const newAssignments = { ...state.assignments };
      Object.keys(newAssignments).forEach((key) => {
        if (key.startsWith(weekStartDate)) {
          delete newAssignments[key];
        }
      });
      return { assignments: newAssignments };
    });

    supabase.from('weekly_tasks')
      .delete()
      .eq('week_start_date', weekStartDate)
      .then(({ error }) => { if (error) console.error('Error clearing week tasks:', error); });
  },

  copyWeekTasks: (sourceWeekStart, targetWeekStart) => {
    const state = get();
    const newAssignments = { ...state.assignments };
    const toInsert: { week_start_date: string; person_id: string; day: number; period: string; tasks: string }[] = [];

    Object.entries(state.assignments).forEach(([key, assignment]) => {
      if (key.startsWith(sourceWeekStart)) {
        const newKey = key.replace(sourceWeekStart, targetWeekStart);
        const copied = { ...assignment, weekStartDate: targetWeekStart };
        newAssignments[newKey] = copied;
        toInsert.push({
          week_start_date: targetWeekStart,
          person_id: copied.personId,
          day: copied.day,
          period: copied.period,
          tasks: copied.tasks,
        });
      }
    });

    set({ assignments: newAssignments });

    if (toInsert.length > 0) {
      (async () => {
        await supabase.from('weekly_tasks').delete().eq('week_start_date', targetWeekStart);
        await supabase.from('weekly_tasks').insert(toInsert);
      })();
    }
  },

  subscribeRealtime: () => {
    const channel = supabase
      .channel('weekly-tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weekly_tasks' },
        () => {
          // Reset loaded weeks to force refetch
          set({ loadedWeeks: new Set() });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
