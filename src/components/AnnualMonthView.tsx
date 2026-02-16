import { useState, useCallback } from 'react';
import { MONTHS_FR, DAYS_FR } from '@/types/planning';
import { getDaysInMonth, formatDateKey, isWeekend } from '@/lib/dateUtils';
import { useAnnualPlanningStore } from '@/hooks/useAnnualPlanningStore';
import { DayEventsDialog } from '@/components/DayEventsDialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

const DAYS_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

interface AnnualMonthViewProps {
  year: number;
  month: number;
}

export function AnnualMonthView({ year, month }: AnnualMonthViewProps) {
  const { events } = useAnnualPlanningStore();
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    dateKey: string;
    day: number;
    month: number;
    year: number;
  }>({ open: false, dateKey: '', day: 1, month: 0, year: 2026 });

  const handleDayClick = useCallback(
    (dateKey: string, day: number, m: number, yr: number) => {
      setDialogState({ open: true, dateKey, day, month: m, year: yr });
    },
    []
  );

  const days = getDaysInMonth(year, month);

  // Build weeks grid (Monday = 0, Sunday = 6)
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];
  const firstDayOfWeek = (days[0].getDay() + 6) % 7;
  for (let i = 0; i < firstDayOfWeek; i++) currentWeek.push(null);
  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return (
    <div className="p-6 print:p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <h2 className="text-2xl font-bold text-foreground">
            {MONTHS_FR[month]} {year}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
      </div>

      {/* Print header */}
      <div className="hidden print:flex items-center justify-center gap-3 mb-4">
        <img src={logo} alt="Logo" className="h-8 w-auto" />
        <h2 className="text-lg font-bold">{MONTHS_FR[month]} {year}</h2>
      </div>

      {/* Large month grid */}
      <table className="w-full border-collapse border border-border">
        <thead>
          <tr>
            {DAYS_FULL.map((d, i) => (
              <th
                key={i}
                className={cn(
                  'border border-border px-2 py-3 text-center font-semibold text-sm',
                  i >= 5 ? 'bg-weekend' : 'bg-weekband'
                )}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((day, di) => {
                if (!day) {
                  return (
                    <td key={di} className="border border-border bg-muted/10 h-28 print:h-20" />
                  );
                }
                const dateKey = formatDateKey(day);
                const dayEvents = events[dateKey] || [];
                const weekend = isWeekend(day);

                return (
                  <td
                    key={di}
                    onClick={() => handleDayClick(dateKey, day.getDate(), month, year)}
                    className={cn(
                      'border border-border h-28 print:h-20 align-top p-1.5 cursor-pointer transition-colors hover:bg-accent/50 relative',
                      weekend ? 'bg-weekend' : dayEvents.length > 0 && 'bg-shift-morning/20'
                    )}
                    style={{ width: '14.28%' }}
                  >
                    <div className="text-sm font-bold text-muted-foreground leading-none mb-1">
                      {day.getDate()}
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      {dayEvents.map((evt, ei) => (
                        <div
                          key={ei}
                          className="text-xs leading-tight truncate text-foreground bg-shift-morning/40 rounded px-1 py-0.5"
                          title={evt}
                        >
                          {evt}
                        </div>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <DayEventsDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((s) => ({ ...s, open }))}
        dateKey={dialogState.dateKey}
        dayNumber={dialogState.day}
        month={dialogState.month}
        year={dialogState.year}
      />
    </div>
  );
}
