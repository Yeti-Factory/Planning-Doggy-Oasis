import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface CustomTasksStore {
  customTasks: string[];
  loading: boolean;
  loaded: boolean;
  fetchCustomTasks: () => Promise<void>;
  addCustomTask: (task: string) => void;
  removeCustomTask: (task: string) => void;
  subscribeRealtime: () => () => void;
}

export const useCustomTasksStore = create<CustomTasksStore>()((set, get) => ({
  customTasks: [],
  loading: false,
  loaded: false,

  fetchCustomTasks: async () => {
    if (get().loaded) return;
    set({ loading: true });

    const { data, error } = await supabase
      .from('custom_tasks')
      .select('*')
      .order('created_at');

    if (error) {
      console.error('Error fetching custom tasks:', error);
      set({ loading: false });
      return;
    }

    set({
      customTasks: (data || []).map((t) => t.name),
      loading: false,
      loaded: true,
    });
  },

  addCustomTask: (task: string) => {
    const trimmed = task.trim();
    if (!trimmed) return;

    set((state) => {
      if (state.customTasks.includes(trimmed)) return state;
      return { customTasks: [...state.customTasks, trimmed] };
    });

    supabase.from('custom_tasks')
      .insert({ name: trimmed })
      .then(({ error }) => {
        if (error) console.error('Error adding custom task:', error);
      });
  },

  removeCustomTask: (task: string) => {
    set((state) => ({
      customTasks: state.customTasks.filter((t) => t !== task),
    }));

    supabase.from('custom_tasks')
      .delete()
      .eq('name', task)
      .then(({ error }) => {
        if (error) console.error('Error removing custom task:', error);
      });
  },

  subscribeRealtime: () => {
    const channel = supabase
      .channel('custom-tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'custom_tasks' },
        () => {
          set({ loaded: false });
          get().fetchCustomTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
