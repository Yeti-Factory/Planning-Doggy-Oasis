export type Category = 'Salarié' | 'Bénévole' | 'Prestataire' | 'Woofer';
export type CategoryCode = 's' | 'b' | 'p' | 'w';

export interface Person {
  id: string;
  name: string;
  category: Category;
  code: CategoryCode;
}

export interface DayAssignment {
  date: string; // YYYY-MM-DD
  morning: (string | undefined)[]; // up to 6 person ids
  afternoon: (string | undefined)[]; // up to 6 person ids
  fullDay: (string | undefined)[]; // up to 6 person ids
}

export const MAX_PEOPLE_PER_SLOT = 6;

export interface Settings {
  hoursForMorning: number;
  hoursForAfternoon: number;
  hoursForFullDay: number;
}

export interface PlanningState {
  people: Person[];
  assignments: Record<string, DayAssignment>;
  settings: Settings;
}

export const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'Salarié', label: 'Salarié' },
  { value: 'Bénévole', label: 'Bénévole' },
  { value: 'Prestataire', label: 'Prestataire' },
  { value: 'Woofer', label: 'Woofer' },
];

export const CODE_MAP: Record<Category, CategoryCode> = {
  'Salarié': 's',
  'Bénévole': 'b',
  'Prestataire': 'p',
  'Woofer': 'w',
};
