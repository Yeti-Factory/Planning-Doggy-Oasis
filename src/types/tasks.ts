// Tâches avec horaires fixes (matin)
export const MORNING_TASKS_WITH_TIME = [
  '9h aide au nettoyage',
  '9h traitement',
  '9h50 départ médiation école',
  '10h45 préparation des gamelles',
  '11h départ pour le fret',
  '11h20 nourrissage',
  '11h45 balade',
  '11h45 balade chef de meute',
  '12h30 passer du temps en quarantaine',
] as const;

// Tâches avec horaires fixes (après-midi)
export const AFTERNOON_TASKS_WITH_TIME = [
  '12h nettoyage algeco',
  '12h lavage des gamelles',
  '14h/14h45 traitement antipuce et vermifuge',
  '14h/14h45 médiation APADAG',
  '14h/14h45 remplir tableau suivis des chiens',
  '14h/15h45 traitement antipuce et vermifuge',
  '16h30 balade',
  '16h30 balade chef de meute',
] as const;

// Tâches générales (sans horaire fixe)
export const GENERAL_TASKS = [
  'repos',
  'congé',
  'bureau',
  'nettoyage',
  'préparation des gamelles',
  'balade',
  'balade chef de meute',
  'balade en ville',
  'sortie des chiens',
  'sortie des chiens infirmerie',
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

// Liste complète pour rétro-compatibilité
export const PREDEFINED_TASKS = [
  ...GENERAL_TASKS,
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
