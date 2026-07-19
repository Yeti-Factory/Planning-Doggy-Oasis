import { describe, expect, it } from 'vitest';
import {
  formatWeekRange,
  getNextWeekStart,
  getPreviousWeekStart,
  getWeekDates,
  getWeekStartDate,
} from './weekUtils';

describe('weekUtils', () => {
  it('starts a week on Monday', () => {
    expect(getWeekStartDate(new Date(2026, 6, 19))).toBe('2026-07-13');
  });

  it('moves between weeks without timezone shifts', () => {
    expect(getNextWeekStart('2026-12-28')).toBe('2027-01-04');
    expect(getPreviousWeekStart('2027-01-04')).toBe('2026-12-28');
    expect(getWeekDates('2026-12-28')).toHaveLength(7);
  });

  it('formats a French week range', () => {
    expect(formatWeekRange('2026-07-13')).toBe('n°29 — du 13/07/2026 au 19/07/2026');
  });
});
