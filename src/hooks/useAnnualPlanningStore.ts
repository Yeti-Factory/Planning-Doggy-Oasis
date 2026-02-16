import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AnnualPlanningState {
  // Record<dateKey "YYYY-MM-DD", string[]>
  events: Record<string, string[]>;
  addEvent: (dateKey: string, text: string) => void;
  updateEvent: (dateKey: string, index: number, text: string) => void;
  removeEvent: (dateKey: string, index: number) => void;
  setEvents: (dateKey: string, events: string[]) => void;
}

export const useAnnualPlanningStore = create<AnnualPlanningState>()(
  persist(
    (set) => ({
      events: {},
      addEvent: (dateKey, text) =>
        set((state) => ({
          events: {
            ...state.events,
            [dateKey]: [...(state.events[dateKey] || []), text],
          },
        })),
      updateEvent: (dateKey, index, text) =>
        set((state) => {
          const current = [...(state.events[dateKey] || [])];
          current[index] = text;
          return { events: { ...state.events, [dateKey]: current } };
        }),
      removeEvent: (dateKey, index) =>
        set((state) => {
          const current = [...(state.events[dateKey] || [])];
          current.splice(index, 1);
          const newEvents = { ...state.events };
          if (current.length === 0) {
            delete newEvents[dateKey];
          } else {
            newEvents[dateKey] = current;
          }
          return { events: newEvents };
        }),
      setEvents: (dateKey, events) =>
        set((state) => {
          const newEvents = { ...state.events };
          if (events.length === 0) {
            delete newEvents[dateKey];
          } else {
            newEvents[dateKey] = events;
          }
          return { events: newEvents };
        }),
    }),
    { name: 'annual-planning-storage' }
  )
);
