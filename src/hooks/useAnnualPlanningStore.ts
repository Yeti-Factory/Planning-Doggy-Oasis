import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const INITIAL_EVENTS: Record<string, string[]> = {
  // JANVIER 2026
  "2026-01-02": ["ehpad edmar lama"],
  "2026-01-05": ["fourrière"],
  "2026-01-06": ["visite 2 mois arthy", "apadag au refuge 14h30 16h", "ehpad palmiste"],
  "2026-01-07": ["EPICERIE"],
  "2026-01-08": ["apadag au refuge 14h30 16h"],
  "2026-01-09": ["transfert diret kalvin verona odessa oreo toledo"],
  "2026-01-12": ["médiation ecole rolland lucile 10h30", "semaine veto balmelle"],
  "2026-01-13": ["ehpad serge gerante", "transfert SPA"],
  "2026-01-14": ["ime"],
  "2026-01-15": ["EPICERIE"],
  "2026-01-16": ["ehpad edmar lama"],
  "2026-01-17": ["viste prague et lary"],
  "2026-01-18": ["visite 6 mois youbi"],
  "2026-01-19": ["médiation ecole rolland lucile 10h30"],
  "2026-01-20": ["visite krakow"],
  "2026-01-22": ["EPICERIE", "visite paz entre 11h et 15h", "depart bayamo depot aeroport"],
  "2026-01-23": ["TRANSFERT DIRECT togo houston doha suva goma pokhara", "LYCEE ANNE MARIE JAVOUHEY AU REFUGE JOURNEE ENTIERE 8h 16H"],
  "2026-01-24": ["visite chou 24"],
  "2026-01-26": ["visite 6 mois mojo", "college"],
  "2026-01-27": ["mediation ecole rolland luciel 10h30"],
  "2026-01-28": ["ime"],
  "2026-01-29": ["EPICERIE"],
  "2026-01-30": ["ehpad edmar lama"],
  "2026-01-31": ["scouts 14h-17h", "jeune de tikaz 8h 12h30"],

  // FEVRIER 2026
  "2026-02-02": ["ecole rolland lucile"],
  "2026-02-03": ["ehpad saint paul", "apadag au refuge 14h30 16h", "transfert castillon"],
  "2026-02-04": ["visite sarlat 2 mois"],
  "2026-02-05": ["EPICERIE"],
  "2026-02-06": ["apadag au refuge 14h30 16h", "visite loreto 2 mois"],
  "2026-02-08": ["visite 6 mois liwa"],
  "2026-02-09": ["AGAV pointe buzarre 10H", "apapag a kourou 10h30 12h", "maison Nobel 14h30 15h30"],
  "2026-02-10": ["ehpad serge gerante", "maison nobel 14h30 15h30"],
  "2026-02-11": ["ime", "Maison Anse 14h30 15h30"],
  "2026-02-12": ["EPICERIE", "APAJH au refuge", "Anse 14h30 15h30"],
  "2026-02-13": ["ehpas edmar lama"],
  "2026-02-15": ["visiste 1 an nimes"],
  "2026-02-16": ["visite Azul 11h30"],
  "2026-02-17": ["adapei pole autisme au refuge"],
  "2026-02-19": ["EPICERIE"],
  "2026-02-20": ["visite krakow"],
  "2026-02-22": ["visite 6 mois pasto"],
  "2026-02-23": ["ecole rolland lucille"],
  "2026-02-24": ["ecole rolland lucile", "visite 6 mois malo", "transfert spa"],
  "2026-02-25": ["ime"],
  "2026-02-26": ["EPICERIE"],
  "2026-02-27": ["ehpad edmar lama"],
  "2026-02-28": ["tikaz 14h 18h"],

  // MARS 2026
  "2026-03-02": ["ecole rolland lucile", "visite pita", "semaine veto benoit"],
  "2026-03-03": ["ehpad saint paul", "apadag au refuge 14h30 16h"],
  "2026-03-05": ["EPICERIE"],
  "2026-03-06": ["visiste 6 mois pipo et xena", "apadag au refuge 14h30 16h"],
  "2026-03-07": ["visite 1 an pompei"],
  "2026-03-08": ["visite 1 an clichy"],
  "2026-03-10": ["ehpad serge gerante"],
  "2026-03-11": ["ime"],
  "2026-03-12": ["visite 6 mois cairo", "EPICERIE"],
  "2026-03-13": ["ehpad edmar lama"],
  "2026-03-14": ["visite 1 an cholet"],
  "2026-03-15": ["visiste 1 an rox", "visiste 6 mois limbe"],
  "2026-03-16": ["touchatout remire a camp du tigre . 9h45"],
  "2026-03-17": ["ecole rolland lucile"],
  "2026-03-19": ["EPICERIE"],
  "2026-03-20": ["visite 6 mois catane"],
  "2026-03-21": ["visite 1 an baika"],
  "2026-03-23": ["stagiaire oceane et kenny"],
  "2026-03-24": ["transfert spa"],
  "2026-03-25": ["ime"],
  "2026-03-26": ["visite 6 mois goya", "EPICERIE"],
  "2026-03-27": ["ehpas edmar lama"],
  "2026-03-30": ["stagiaire oceane et kenny"],

  // AVRIL 2026
  "2026-04-01": ["stagiaire oceane et kenny"],
  "2026-04-02": ["EPICERIE"],
  "2026-04-03": ["visite 6 mois hobart st lau"],
  "2026-04-04": ["visite 6 mois manila"],
  "2026-04-07": ["ehpad saint paul", "transfert spa"],
  "2026-04-08": ["ime"],
  "2026-04-09": ["EPICERIE"],
  "2026-04-10": ["ehpad edmar lama"],
  "2026-04-14": ["ehpad serge gerante"],
  "2026-04-16": ["EPICERIE"],
  "2026-04-17": ["apadag au refuge 14h30 16h"],
  "2026-04-20": ["visite 6 mois victoria"],
  "2026-04-22": ["ime"],
  "2026-04-23": ["EPICERIE"],
  "2026-04-24": ["ehpad edmar lama"],
  "2026-04-25": ["marchévaux plantes remire"],
  "2026-04-28": ["visite 6 mois dagu beijing", "apadag au refuge 14h30 16h", "stransfert Spa"],
  "2026-04-30": ["EPICERIE"],

  // MAI 2026
  "2026-05-01": ["visite 6 mois macou"],
  "2026-05-05": ["ehpas saint paul"],
  "2026-05-06": ["ime", "visite 6 mois arthy"],
  "2026-05-07": ["visite 6 mois zagreb"],
  "2026-05-08": ["visite 6 mois medan"],
  "2026-05-09": ["visite 6 mois monroe"],
  "2026-05-10": ["visite 6 mois lexie"],
  "2026-05-12": ["ehpad serge gerante", "visite 6 mois rex", "apadag au refuge 14h30 16h"],
  "2026-05-15": ["visite 6 mois labra", "edmar lama"],
  "2026-05-19": ["visite 1 an pantera"],
  "2026-05-20": ["ime"],
  "2026-05-26": ["transfert spa"],
  "2026-05-29": ["edmar lama"],

  // JUIN 2026
  "2026-06-02": ["ehpad saint paul"],
  "2026-06-03": ["ime"],
  "2026-06-04": ["visite 1 an soya"],
  "2026-06-05": ["apadag au refuge 14h30 16h"],
  "2026-06-09": ["ehpad serge gerante", "apadag au refuge 14h30 16h"],
  "2026-06-12": ["ehpad edmar lama"],
  "2026-06-17": ["ime"],
  "2026-06-23": ["transfert spa"],
  "2026-06-26": ["ehpad edmar lama"],
  "2026-06-28": ["visiste 1 an awara"],

  // JUILLET 2026
  "2026-07-01": ["ime"],
  "2026-07-03": ["apadag au refuge 14h30 16h"],
  "2026-07-04": ["visite 1 an nola"],
  "2026-07-05": ["visiste 1 an tulear"],
  "2026-07-07": ["ehpad saint paul"],
  "2026-07-10": ["ehpad edmar lama"],
  "2026-07-14": ["ehpad serge gerante"],
  "2026-07-15": ["ime"],
  "2026-07-18": ["visiste 1 an youbi"],
  "2026-07-24": ["ehpad edmar lama"],
  "2026-07-26": ["visite 1 an mojo"],
  "2026-07-29": ["ime"],

  // AOUT 2026
  "2026-08-02": ["visite 1 an quito"],
  "2026-08-04": ["ehpad saint paul"],
  "2026-08-07": ["ehpad edmar lama"],
  "2026-08-08": ["visite 1 an liwa"],
  "2026-08-09": ["visite 1 an cookie st lau"],
  "2026-08-11": ["ehpad serge gerante", "transfert spa"],
  "2026-08-12": ["ime"],
  "2026-08-21": ["ehpad edmar lama"],
  "2026-08-22": ["visite 1 an pasto"],
  "2026-08-23": ["visite 1 an happy st lau"],
  "2026-08-24": ["visite 1 an malo", "visite 1 an gao"],
  "2026-08-26": ["ime"],
  "2026-08-31": ["visiste 1 an pita"],

  // SEPTEMBRE 2026
  "2026-09-01": ["ehpad saint paul"],
  "2026-09-04": ["ehpad edmar lama"],
  "2026-09-06": ["visite 1 an pipo et xena"],
  "2026-09-08": ["ehpad serge gerante"],
  "2026-09-09": ["ime"],
  "2026-09-12": ["visite 1 an cairo"],
  "2026-09-15": ["visite 1 an limbe"],
  "2026-09-18": ["ehpad edmar lama"],
  "2026-09-20": ["visite 1 an catane"],
  "2026-09-23": ["ime"],
  "2026-09-26": ["visite 1 an goya"],
  "2026-09-29": ["transfert spa"],

  // OCTOBRE 2026
  "2026-10-02": ["ehpad edmar lama"],
  "2026-10-03": ["visite 1 an hobart st lau"],
  "2026-10-04": ["visite 1 an manila"],
  "2026-10-06": ["ehpar saint paul"],
  "2026-10-07": ["ime"],
  "2026-10-13": ["ehpad serge gerante"],
  "2026-10-16": ["ehpad edmar lama"],
  "2026-10-20": ["visite 1 an victoria", "transfert spa"],
  "2026-10-21": ["ime"],
  "2026-10-25": ["visite 1 an split"],
  "2026-10-28": ["visite 1 an dagu beijing"],
  "2026-10-30": ["ehpad edmar lama"],

  // NOVEMBRE 2026
  "2026-11-01": ["visite 1 an macou"],
  "2026-11-03": ["ehpad saint paul"],
  "2026-11-04": ["ime"],
  "2026-11-06": ["visite 1 an arthy"],
  "2026-11-07": ["visite 1 an zagreb"],
  "2026-11-08": ["visite 1 an medan"],
  "2026-11-09": ["visite 1 an monroe"],
  "2026-11-10": ["ehpad serge gerante", "visite 1 an lexie"],
  "2026-11-12": ["visite 1 an rex"],
  "2026-11-13": ["ehpad edmar lama"],
  "2026-11-15": ["visite 1 an labra"],
  "2026-11-17": ["transfert spa"],
  "2026-11-18": ["ime"],
  "2026-11-27": ["ehpad edmar lama"],

  // DECEMBRE 2026
  "2026-12-01": ["ehpad saint paul"],
  "2026-12-02": ["ime"],
  "2026-12-08": ["ehpad serge gerrante"],
  "2026-12-11": ["ehpad edmar lama"],
  "2026-12-15": ["transfert spa"],
  "2026-12-16": ["ime"],
  "2026-12-30": ["ime"],
};

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
      events: INITIAL_EVENTS,
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
    {
      name: 'annual-planning-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Merge initial Excel data with any existing user events
          const existingEvents = persistedState?.events || {};
          const mergedEvents = { ...INITIAL_EVENTS };
          for (const [key, value] of Object.entries(existingEvents)) {
            if (Array.isArray(value) && value.length > 0) {
              mergedEvents[key] = value as string[];
            }
          }
          return { ...persistedState, events: mergedEvents };
        }
        return persistedState as AnnualPlanningState;
      },
    }
  )
);
