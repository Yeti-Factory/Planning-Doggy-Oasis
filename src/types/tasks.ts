export const PREDEFINED_TASKS = [
  'repos',
  'congé',
  'bureau',
  'nettoyage',
  'préparation des gamelles',
  'balade',
  'balade chef de meute',
  'sortie des chiens',
  'infirmerie',
  'éducation',
  'toilettage',
  'éducation ou toilettage',
  'nourrissage',
  'médiation école',
  'médiation APADAG',
  'piscine',
  'traitement antipuce',
  'vermifuge',
  'traitement antipuce et vermifuge',
  'transfert',
  'lavage des gamelles',
  'laver les toilettes',
  'mettre des dodos',
  'quarantaine',
  'passer du temps en quarantaine',
  'fret',
  'départ pour le fret',
  'nettoyage algeco',
  'remplir tableau suivis des chiens',
  'laver les chiens pour le transfert',
] as const;

export type PredefinedTask = typeof PREDEFINED_TASKS[number];

export interface WeeklyTaskAssignment {
  weekStartDate: string; // YYYY-MM-DD (Monday)
  personId: string;
  day: number; // 0-6 (Monday = 0, Sunday = 6)
  period: 'morning' | 'afternoon';
  tasks: string; // Can be predefined task or custom text
}

export interface WeeklyTasksState {
  assignments: Record<string, WeeklyTaskAssignment>; // key: `${weekStartDate}-${personId}-${day}-${period}`
}

export const DAYS_OF_WEEK_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
