import { getDaysInMonth, getMonthName, groupDaysByWeek, getWeekNumber, formatDateKey } from '@/lib/dateUtils';
import { DayRow } from './DayRow';
import { WeekSummary } from './WeekSummary';
import { Calendar, Printer, Copy, ClipboardPaste, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { usePlanningStore } from '@/hooks/usePlanningStore';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
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

  const { assignments, people, copyWeek, pasteToWeek, clearWeek, clipboard, loading } = usePlanningStore();

  if (loading && people.length === 0) {
    return (
      <div className="p-6 animate-fade-in space-y-4">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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

  const handleCopyWeek = (weekNum: number, weekDays: Date[]) => {
    const dateKeys = weekDays.map(d => formatDateKey(d));
    copyWeek(dateKeys);
    toast({
      title: "Semaine copiée",
      description: `Les affectations de la semaine ${weekNum} ont été copiées.`,
    });
  };

  const handlePasteWeek = (weekNum: number, weekDays: Date[]) => {
    const dateKeys = weekDays.map(d => formatDateKey(d));
    pasteToWeek(dateKeys);
    toast({
      title: "Semaine collée",
      description: `Les affectations ont été collées sur la semaine ${weekNum}.`,
    });
  };

  const handleClearWeek = (weekNum: number, weekDays: Date[]) => {
    const dateKeys = weekDays.map(d => formatDateKey(d));
    clearWeek(dateKeys);
    toast({
      title: "Semaine effacée",
      description: `Les affectations de la semaine ${weekNum} ont été effacées.`,
    });
  };

  const canPasteWeek = clipboard !== null;

  const weekHasAssignments = (weekDays: Date[]) => {
    return weekDays.some(day => {
      const key = formatDateKey(day);
      const assignment = assignments[key];
      if (!assignment) return false;
      return (
        (assignment.morning || []).some(Boolean) ||
        (assignment.afternoon || []).some(Boolean) ||
        (assignment.fullDay || []).some(Boolean)
      );
    });
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
                const key = formatDateKey(day);
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
                <tr key={`week-band-${weekNum}`} className="bg-weekband border-y-2 border-primary group">
                  <td colSpan={6} className="px-3 py-2 font-semibold text-weekband-text">
                    <div className="flex items-center justify-between">
                      <span>Semaine {weekNum}</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs bg-background/50 hover:bg-background"
                          onClick={() => handleCopyWeek(weekNum, weekDays)}
                          title="Copier cette semaine"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copier
                        </Button>
                        {canPasteWeek && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs bg-background/50 hover:bg-background"
                            onClick={() => handlePasteWeek(weekNum, weekDays)}
                            title="Coller sur cette semaine"
                          >
                            <ClipboardPaste className="w-3 h-3 mr-1" />
                            Coller
                          </Button>
                        )}
                        {weekHasAssignments(weekDays) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs bg-background/50 hover:bg-background text-destructive hover:text-destructive"
                            onClick={() => handleClearWeek(weekNum, weekDays)}
                            title="Effacer cette semaine"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Effacer
                          </Button>
                        )}
                      </div>
                    </div>
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
