import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface AnnualPlanningState {
  events: Record<string, string[]>;
  loading: boolean;
  loaded: boolean;
  fetchEvents: () => Promise<void>;
  addEvent: (dateKey: string, text: string) => void;
  updateEvent: (dateKey: string, index: number, text: string) => void;
  removeEvent: (dateKey: string, index: number) => void;
  setEvents: (dateKey: string, events: string[]) => void;
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

    const events: Record<string, string[]> = {};
    for (const row of data || []) {
      if (!events[row.date]) events[row.date] = [];
      events[row.date].push(row.event_text);
    }
    set({ events, loading: false, loaded: true });
  },

  addEvent: (dateKey, text) => {
    const current = get().events[dateKey] || [];
    const position = current.length;
    
    // Optimistic update
    set((state) => ({
      events: {
        ...state.events,
        [dateKey]: [...current, text],
      },
    }));

    supabase.from('annual_events')
      .insert({ date: dateKey, event_text: text, position })
      .then(({ error }) => {
        if (error) console.error('Error adding event:', error);
      });
  },

  updateEvent: (dateKey, index, text) => {
    set((state) => {
      const current = [...(state.events[dateKey] || [])];
      current[index] = text;
      return { events: { ...state.events, [dateKey]: current } };
    });

    // Update in DB: find by date + position
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

    // Delete from DB and re-index positions
    (async () => {
      // Delete by date + position
      await supabase.from('annual_events')
        .delete()
        .eq('date', dateKey)
        .eq('position', index);
      
      // Re-index remaining events
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

    // Replace all events for this date in DB
    (async () => {
      await supabase.from('annual_events')
        .delete()
        .eq('date', dateKey);
      
      if (events.length > 0) {
        const rows = events.map((text, i) => ({
          date: dateKey,
          event_text: text,
          position: i,
        }));
        await supabase.from('annual_events').insert(rows);
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
          // Refetch all events on any change
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
