import { getDaysInMonth, getMonthName, groupDaysByWeek, getWeekNumber } from '@/lib/dateUtils';
import { DayRow } from './DayRow';
import { WeekSummary } from './WeekSummary';
import { Calendar } from 'lucide-react';

interface MonthPlanningProps {
  year: number;
  month: number;
}

export function MonthPlanning({ year, month }: MonthPlanningProps) {
  const days = getDaysInMonth(year, month);
  const weekGroups = groupDaysByWeek(days);
  const sortedWeeks = Array.from(weekGroups.entries()).sort((a, b) => {
    // Sort by first day of week to handle year boundaries
    return a[1][0].getTime() - b[1][0].getTime();
  });

  return (
    <div className="p-6 animate-fade-in">
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-primary text-primary-foreground">
          <Calendar className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Planning – {getMonthName(month)} {year}
        </h1>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 rounded-lg bg-card border border-border">
        <span className="text-sm font-medium text-muted-foreground">Légende :</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-shift-morning"></div>
          <span className="text-sm">Matin</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-shift-afternoon"></div>
          <span className="text-sm">Après-midi / Journée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-weekend border border-border"></div>
          <span className="text-sm">Week-end</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-weekband"></div>
          <span className="text-sm">Bandeau semaine</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
        <table className="w-full border-collapse bg-card">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="px-3 py-3 text-left text-sm font-semibold w-28">Date</th>
              <th className="px-3 py-3 text-left text-sm font-semibold w-28">Jour</th>
              <th className="px-3 py-3 text-center text-sm font-semibold w-20">Semaine</th>
              <th className="px-3 py-3 text-center text-sm font-semibold w-44">Matin</th>
              <th className="px-3 py-3 text-center text-sm font-semibold w-44">Après-midi</th>
              <th className="px-3 py-3 text-center text-sm font-semibold w-44">Journée</th>
            </tr>
          </thead>
          <tbody>
            {sortedWeeks.map(([weekNum, weekDays]) => (
              <>
                {/* Week band */}
                <tr key={`week-band-${weekNum}`} className="bg-weekband border-y-2 border-primary">
                  <td colSpan={6} className="px-3 py-2 font-semibold text-weekband-text">
                    Semaine {weekNum}
                  </td>
                </tr>

                {/* Day rows */}
                {weekDays.map((day) => (
                  <DayRow key={day.toISOString()} date={day} />
                ))}

                {/* Week summary */}
                <WeekSummary weekNumber={weekNum} days={weekDays} />
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
