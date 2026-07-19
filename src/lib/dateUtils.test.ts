import { describe, expect, it } from 'vitest';
import { formatDateKey, getDaysInMonth, getWeekNumber, isWeekend } from './dateUtils';

describe('dateUtils', () => {
  it('includes leap day in February 2028', () => {
    const days = getDaysInMonth(2028, 1);
    expect(days).toHaveLength(29);
    expect(formatDateKey(days[28])).toBe('2028-02-29');
  });

  it('uses ISO week numbering across a year boundary', () => {
    expect(getWeekNumber(new Date(2026, 0, 1))).toBe(1);
    expect(getWeekNumber(new Date(2027, 0, 1))).toBe(53);
  });

  it('identifies Saturdays and Sundays', () => {
    expect(isWeekend(new Date(2026, 6, 18))).toBe(true);
    expect(isWeekend(new Date(2026, 6, 19))).toBe(true);
    expect(isWeekend(new Date(2026, 6, 20))).toBe(false);
  });
});
