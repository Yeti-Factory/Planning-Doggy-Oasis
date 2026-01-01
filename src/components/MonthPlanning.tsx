import { getDaysInMonth, getMonthName, groupDaysByWeek, getWeekNumber } from '@/lib/dateUtils';
import { DayRow } from './DayRow';
import { WeekSummary } from './WeekSummary';
import { Calendar, Printer } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { usePlanningStore } from '@/hooks/usePlanningStore';
import logo from '@/assets/logo.png';

interface MonthPlanningProps {
  year: number;
  month: number;
}

export function MonthPlanning({ year, month }: MonthPlanningProps) {
  const days = getDaysInMonth(year, month);
  const weekGroups = groupDaysByWeek(days);
  const sortedWeeks = Array.from(weekGroups.entries()).sort((a, b) => {
    return a[1][0].getTime() - b[1][0].getTime();
  });

  const { assignments, people } = usePlanningStore();

  const getPersonName = (personId: string | undefined) => {
    if (!personId) return '';
    const person = people.find(p => p.id === personId);
    return person ? `[${person.code}] ${person.name}` : '';
  };

  const getSlotNames = (slotIds: (string | undefined)[] | undefined): string => {
    if (!slotIds) return '';
    return slotIds
      .filter(Boolean)
      .map(id => getPersonName(id))
      .join(', ');
  };

  const handlePrint = (weekNumber?: number) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const weeksToPrint = weekNumber 
      ? sortedWeeks.filter(([num]) => num === weekNumber)
      : sortedWeeks;

    const title = weekNumber 
      ? `Planning – Semaine ${weekNumber} – ${getMonthName(month)} ${year}`
      : `Planning – ${getMonthName(month)} ${year}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; }
          .header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
          .logo { height: 50px; }
          h1 { font-size: 20px; margin: 0; color: #1f4e79; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #1f4e79; color: white; padding: 8px; text-align: center; }
          th:first-child, th:nth-child(2) { text-align: left; }
          td { border: 1px solid #ccc; padding: 6px 8px; vertical-align: top; }
          .week-band { background: #d9e1f2; font-weight: bold; }
          .weekend { background: #f2f2f2; }
          .morning { background: #ffd966; }
          .afternoon, .fullday { background: #92d050; }
          .total-row { background: #e2f0d9; font-weight: bold; }
          .legend { display: flex; gap: 16px; margin-bottom: 16px; font-size: 12px; }
          .legend-item { display: flex; align-items: center; gap: 6px; }
          .legend-box { width: 16px; height: 16px; border: 1px solid #ccc; }
          @media print {
            @page { size: A4 landscape; margin: 1cm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logo}" alt="Logo" class="logo" />
          <h1>${title}</h1>
        </div>
        <div class="legend">
          <div class="legend-item"><div class="legend-box morning"></div> Matin</div>
          <div class="legend-item"><div class="legend-box afternoon"></div> Après-midi / Journée</div>
          <div class="legend-item"><div class="legend-box weekend"></div> Week-end</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Jour</th>
              <th>Sem.</th>
              <th>Matin</th>
              <th>Après-midi</th>
              <th>Journée</th>
            </tr>
          </thead>
          <tbody>
            ${weeksToPrint.map(([weekNum, weekDays]) => `
              <tr class="week-band">
                <td colspan="6">Semaine ${weekNum}</td>
              </tr>
              ${weekDays.map(day => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                const dateStr = day.toLocaleDateString('fr-FR');
                const key = day.toISOString().split('T')[0];
                const dayAssignments = assignments[key];
                const morningNames = getSlotNames(dayAssignments?.morning);
                const afternoonNames = getSlotNames(dayAssignments?.afternoon);
                const fulldayNames = getSlotNames(dayAssignments?.fullDay);
                return `
                  <tr class="${isWeekend ? 'weekend' : ''}">
                    <td>${dateStr}</td>
                    <td>${dayNames[day.getDay()]}</td>
                    <td style="text-align:center">${weekNum}</td>
                    <td class="${morningNames ? 'morning' : ''}" style="text-align:center">${morningNames}</td>
                    <td class="${afternoonNames ? 'afternoon' : ''}" style="text-align:center">${afternoonNames}</td>
                    <td class="${fulldayNames ? 'fullday' : ''}" style="text-align:center">${fulldayNames}</td>
                  </tr>
                `;
              }).join('')}
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary text-primary-foreground">
            <Calendar className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Planning – {getMonthName(month)} {year}
          </h1>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Printer className="w-4 h-4" />
              Imprimer
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handlePrint()}>
              Mois complet
            </DropdownMenuItem>
            {sortedWeeks.map(([weekNum]) => (
              <DropdownMenuItem key={weekNum} onClick={() => handlePrint(weekNum)}>
                Semaine {weekNum}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
              <th className="px-3 py-3 text-center text-sm font-semibold min-w-[180px]">Matin</th>
              <th className="px-3 py-3 text-center text-sm font-semibold min-w-[180px]">Après-midi</th>
              <th className="px-3 py-3 text-center text-sm font-semibold min-w-[180px]">Journée</th>
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
