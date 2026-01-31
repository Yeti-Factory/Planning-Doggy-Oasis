import { startOfWeek, endOfWeek, format, addWeeks, subWeeks, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export const getWeekStartDate = (date: Date): string => {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
};

export const getWeekEndDate = (date: Date): string => {
  const sunday = endOfWeek(date, { weekStartsOn: 1 });
  return format(sunday, 'yyyy-MM-dd');
};

export const getWeekDates = (weekStartDate: string): Date[] => {
  const start = new Date(weekStartDate);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const formatWeekRange = (weekStartDate: string): string => {
  const start = new Date(weekStartDate);
  const end = addDays(start, 6);
  return `du ${format(start, 'dd/MM/yyyy', { locale: fr })} au ${format(end, 'dd/MM/yyyy', { locale: fr })}`;
};

export const getNextWeekStart = (weekStartDate: string): string => {
  const current = new Date(weekStartDate);
  const next = addWeeks(current, 1);
  return format(next, 'yyyy-MM-dd');
};

export const getPreviousWeekStart = (weekStartDate: string): string => {
  const current = new Date(weekStartDate);
  const prev = subWeeks(current, 1);
  return format(prev, 'yyyy-MM-dd');
};

export const formatDayWithDate = (date: Date): string => {
  return format(date, 'dd-MMM', { locale: fr });
};
