import { startOfWeek, endOfWeek, format, addWeeks, subWeeks, addDays, getWeek, setWeek, getYear } from 'date-fns';
import { fr } from 'date-fns/locale';

export const getWeekStartDate = (date: Date): string => {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
};

export const getWeekStartFromNumber = (weekNumber: number, year?: number): string => {
  const targetYear = year || getYear(new Date());
  const jan1 = new Date(targetYear, 0, 1);
  const dateInWeek = setWeek(jan1, weekNumber, { weekStartsOn: 1, firstWeekContainsDate: 4 });
  const monday = startOfWeek(dateInWeek, { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
};

export const getWeekEndDate = (date: Date): string => {
  const sunday = endOfWeek(date, { weekStartsOn: 1 });
  return format(sunday, 'yyyy-MM-dd');
};

const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getWeekDates = (weekStartDate: string): Date[] => {
  const start = parseLocalDate(weekStartDate);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const getWeekNumber = (weekStartDate: string): number => {
  const date = parseLocalDate(weekStartDate);
  return getWeek(date, { weekStartsOn: 1, firstWeekContainsDate: 4 });
};

export const formatWeekRange = (weekStartDate: string): string => {
  const start = parseLocalDate(weekStartDate);
  const end = addDays(start, 6);
  const weekNum = getWeekNumber(weekStartDate);
  return `n°${weekNum} — du ${format(start, 'dd/MM/yyyy', { locale: fr })} au ${format(end, 'dd/MM/yyyy', { locale: fr })}`; 
};

export const getNextWeekStart = (weekStartDate: string): string => {
  const current = parseLocalDate(weekStartDate);
  const next = addWeeks(current, 1);
  return format(next, 'yyyy-MM-dd');
};

export const getPreviousWeekStart = (weekStartDate: string): string => {
  const current = parseLocalDate(weekStartDate);
  const prev = subWeeks(current, 1);
  return format(prev, 'yyyy-MM-dd');
};

export const formatDayWithDate = (date: Date): string => {
  return format(date, 'dd-MMM', { locale: fr });
};
