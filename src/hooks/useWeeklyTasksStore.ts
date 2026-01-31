import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WeeklyTaskAssignment, WeeklyTasksState } from '@/types/tasks';

interface WeeklyTasksStore extends WeeklyTasksState {
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
}

const createAssignmentKey = (
  weekStartDate: string,
  personId: string,
  day: number,
  period: 'morning' | 'afternoon'
): string => `${weekStartDate}-${personId}-${day}-${period}`;

export const useWeeklyTasksStore = create<WeeklyTasksStore>()(
  persist(
    (set, get) => ({
      assignments: {},

      setTaskAssignment: (weekStartDate, personId, day, period, tasks) => {
        const key = createAssignmentKey(weekStartDate, personId, day, period);
        
        set((state) => {
          if (!tasks || tasks.trim() === '') {
            // Remove assignment if empty
            const { [key]: _, ...rest } = state.assignments;
            return { assignments: rest };
          }
          
          return {
            assignments: {
              ...state.assignments,
              [key]: {
                weekStartDate,
                personId,
                day,
                period,
                tasks: tasks.trim(),
              },
            },
          };
        });
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
      },

      copyWeekTasks: (sourceWeekStart, targetWeekStart) => {
        set((state) => {
          const newAssignments = { ...state.assignments };
          
          Object.entries(state.assignments).forEach(([key, assignment]) => {
            if (key.startsWith(sourceWeekStart)) {
              const newKey = key.replace(sourceWeekStart, targetWeekStart);
              newAssignments[newKey] = {
                ...assignment,
                weekStartDate: targetWeekStart,
              };
            }
          });
          
          return { assignments: newAssignments };
        });
      },
    }),
    {
      name: 'weekly-tasks-storage',
      version: 1,
    }
  )
);
