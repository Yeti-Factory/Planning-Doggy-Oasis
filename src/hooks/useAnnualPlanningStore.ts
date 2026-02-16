import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface AnnualEvent {
  text: string;
  color: string | null;
}

interface AnnualPlanningState {
  events: Record<string, AnnualEvent[]>;
  loading: boolean;
  loaded: boolean;
  fetchEvents: () => Promise<void>;
  addEvent: (dateKey: string, text: string, color?: string | null) => void;
  updateEvent: (dateKey: string, index: number, text: string) => void;
  removeEvent: (dateKey: string, index: number) => void;
  setEvents: (dateKey: string, events: AnnualEvent[]) => void;
  subscribeRealtime: () => () => void;
}

export const useAnnualPlanningStore = create<AnnualPlanningState>()((set, get) => ({
  events: {},
  loading: false,
  loaded: false,

  fetchEvents: async () => {
    if (get().loaded) return;
    set({ loading: true });
    const { data, error } = await supabase
      .from('annual_events')
      .select('*')
      .order('date')
      .order('position');
    
    if (error) {
      console.error('Error fetching annual events:', error);
      set({ loading: false });
      return;
    }

    const events: Record<string, AnnualEvent[]> = {};
    for (const row of data || []) {
      if (!events[row.date]) events[row.date] = [];
      events[row.date].push({ text: row.event_text, color: (row as any).color ?? null });
    }
    set({ events, loading: false, loaded: true });
  },

  addEvent: (dateKey, text, color = null) => {
    const current = get().events[dateKey] || [];
    const position = current.length;
    
    set((state) => ({
      events: {
        ...state.events,
        [dateKey]: [...current, { text, color }],
      },
    }));

    supabase.from('annual_events')
      .insert({ date: dateKey, event_text: text, position, color } as any)
      .then(({ error }) => {
        if (error) console.error('Error adding event:', error);
      });
  },

  updateEvent: (dateKey, index, text) => {
    set((state) => {
      const current = [...(state.events[dateKey] || [])];
      current[index] = { ...current[index], text };
      return { events: { ...state.events, [dateKey]: current } };
    });

    supabase.from('annual_events')
      .update({ event_text: text })
      .eq('date', dateKey)
      .eq('position', index)
      .then(({ error }) => {
        if (error) console.error('Error updating event:', error);
      });
  },

  removeEvent: (dateKey, index) => {
    const current = [...(get().events[dateKey] || [])];
    current.splice(index, 1);
    
    const newEvents = { ...get().events };
    if (current.length === 0) {
      delete newEvents[dateKey];
    } else {
      newEvents[dateKey] = current;
    }
    set({ events: newEvents });

    (async () => {
      await supabase.from('annual_events')
        .delete()
        .eq('date', dateKey)
        .eq('position', index);
      
      const remaining = current;
      for (let i = index; i < remaining.length; i++) {
        await supabase.from('annual_events')
          .update({ position: i })
          .eq('date', dateKey)
          .eq('position', i + 1);
      }
    })();
  },

  setEvents: (dateKey, events) => {
    const newEventsMap = { ...get().events };
    if (events.length === 0) {
      delete newEventsMap[dateKey];
    } else {
      newEventsMap[dateKey] = events;
    }
    set({ events: newEventsMap });

    (async () => {
      await supabase.from('annual_events')
        .delete()
        .eq('date', dateKey);
      
      if (events.length > 0) {
        const rows = events.map((evt, i) => ({
          date: dateKey,
          event_text: evt.text,
          position: i,
          color: evt.color,
        }));
        await supabase.from('annual_events').insert(rows as any);
      }
    })();
  },

  subscribeRealtime: () => {
    const channel = supabase
      .channel('annual-events-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'annual_events' },
        () => {
          set({ loaded: false });
          get().fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
