import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomTasksStore {
  customTasks: string[];
  addCustomTask: (task: string) => void;
  removeCustomTask: (task: string) => void;
}

export const useCustomTasksStore = create<CustomTasksStore>()(
  persist(
    (set, get) => ({
      customTasks: [],

      addCustomTask: (task: string) => {
        const trimmed = task.trim();
        if (!trimmed) return;
        
        set((state) => {
          if (state.customTasks.includes(trimmed)) {
            return state; // Already exists
          }
          return { customTasks: [...state.customTasks, trimmed] };
        });
      },

      removeCustomTask: (task: string) => {
        set((state) => ({
          customTasks: state.customTasks.filter((t) => t !== task),
        }));
      },
    }),
    {
      name: 'custom-tasks-storage',
      version: 1,
    }
  )
);
