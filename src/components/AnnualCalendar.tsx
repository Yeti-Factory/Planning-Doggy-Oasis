import { useState, useCallback } from 'react';
import { MONTHS_FR } from '@/types/planning';
import { getDaysInMonth, formatDateKey, isWeekend } from '@/lib/dateUtils';
import { useAnnualPlanningStore } from '@/hooks/useAnnualPlanningStore';
import { DayEventsDialog } from '@/components/DayEventsDialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

const DAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

interface MonthGridProps {
  year: number;
  month: number;
  events: Record<string, { text: string; color: string | null }[]>;
  onDayClick: (dateKey: string, day: number, month: number, year: number) => void;
}

function MonthGrid({ year, month, events, onDayClick }: MonthGridProps) {
  const days = getDaysInMonth(year, month);

  // Build weeks grid (Monday = 0, Sunday = 6)
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  // Fill leading empty cells
  const firstDayOfWeek = (days[0].getDay() + 6) % 7; // Monday=0
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill trailing empty cells
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="break-inside-avoid mb-6">
      <h3 className="text-sm font-bold text-center py-2 bg-primary text-primary-foreground rounded-t-md print:text-xs">
        {MONTHS_FR[month]} {year}
      </h3>
      <table className="w-full border-collapse border border-border text-xs">
        <thead>
          <tr>
            {DAYS_SHORT.map((d, i) => (
              <th
                key={i}
                className={cn(
                  'border border-border px-1 py-1 text-center font-semibold',
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
                    <td key={di} className="border border-border bg-muted/10 h-16 print:h-12" />
                  );
                }
                const dateKey = formatDateKey(day);
                const dayEvents = events[dateKey] || [];
                const weekend = isWeekend(day);

                return (
                  <td
                    key={di}
                    onClick={() => onDayClick(dateKey, day.getDate(), month, year)}
                    className={cn(
                      'border border-border h-16 print:h-12 align-top p-0.5 cursor-pointer transition-colors hover:bg-accent/50 relative',
                      weekend && 'bg-weekend'
                    )}
                    style={{ width: '14.28%' }}
                  >
                    <div className="text-[10px] font-semibold text-muted-foreground leading-none mb-0.5">
                      {day.getDate()}
                    </div>
                    <div className="space-y-0 overflow-hidden max-h-[48px] print:max-h-[36px]">
                      {dayEvents.map((evt, ei) => (
                        <div
                          key={ei}
                          className="text-[9px] leading-tight truncate text-foreground print:text-[7px] rounded px-0.5"
                          style={{ backgroundColor: evt.color ? `${evt.color}66` : undefined }}
                          title={evt.text}
                        >
                          {evt.text}
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
    </div>
  );
}

interface AnnualCalendarProps {
  year: number;
}

export function AnnualCalendar({ year }: AnnualCalendarProps) {
  const { events } = useAnnualPlanningStore();
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    dateKey: string;
    day: number;
    month: number;
    year: number;
  }>({ open: false, dateKey: '', day: 1, month: 0, year: 2026 });

  const handleDayClick = useCallback(
    (dateKey: string, day: number, month: number, yr: number) => {
      setDialogState({ open: true, dateKey, day, month, year: yr });
    },
    []
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 print:p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 no-print">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <h2 className="text-xl font-bold text-foreground">
            Calendrier annuel {year}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
      </div>

      {/* Print header */}
      <div className="hidden print:flex items-center justify-center gap-3 mb-4">
        <img src={logo} alt="Logo" className="h-8 w-auto" />
        <h2 className="text-lg font-bold">Calendrier annuel {year}</h2>
      </div>

      {/* 12 months grid - 2 columns on screen, print optimized */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
        {Array.from({ length: 12 }, (_, i) => (
          <MonthGrid
            key={i}
            year={year}
            month={i}
            events={events}
            onDayClick={handleDayClick}
          />
        ))}
      </div>

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
