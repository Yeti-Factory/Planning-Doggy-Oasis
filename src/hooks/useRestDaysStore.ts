import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface RestDaysStore {
  restDays: Set<string>; // "personId:YYYY-MM-DD"
  loading: boolean;
  fetchRestDays: () => Promise<void>;
  toggleRestDay: (personId: string, date: string) => void;
  isRestDay: (personId: string, date: string) => boolean;
  subscribeRealtime: () => () => void;
}

const makeKey = (personId: string, date: string) => `${personId}:${date}`;

export const useRestDaysStore = create<RestDaysStore>()((set, get) => ({
  restDays: new Set<string>(),
  loading: false,

  fetchRestDays: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from('rest_days').select('*');
    if (error) {
      console.error('Error fetching rest days:', error);
      set({ loading: false });
      return;
    }
    const restDays = new Set<string>();
    for (const row of data || []) {
      restDays.add(makeKey(row.person_id, row.date));
    }
    set({ restDays, loading: false });
  },

  toggleRestDay: (personId: string, date: string) => {
    const key = makeKey(personId, date);
    const current = get().restDays;
    const isRest = current.has(key);

    // Optimistic update
    const next = new Set(current);
    if (isRest) {
      next.delete(key);
    } else {
      next.add(key);
    }
    set({ restDays: next });

    // DB
    if (isRest) {
      supabase.from('rest_days').delete()
        .eq('person_id', personId)
        .eq('date', date)
        .then(({ error }) => {
          if (error) console.error('Error removing rest day:', error);
        });
    } else {
      supabase.from('rest_days').insert({ person_id: personId, date })
        .then(({ error }) => {
          if (error) console.error('Error adding rest day:', error);
        });
    }
  },

  isRestDay: (personId: string, date: string) => {
    return get().restDays.has(makeKey(personId, date));
  },

  subscribeRealtime: () => {
    const channel = supabase.channel('rest-days-changes').on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rest_days' },
      () => { get().fetchRestDays(); }
    ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
