import { getDaysInMonth, formatDateKey } from '@/lib/dateUtils';
import { usePlanningStore } from '@/hooks/usePlanningStore';
import { useRestDaysStore } from '@/hooks/useRestDaysStore';
import { DAYS_FR } from '@/types/planning';

interface PersonGridViewProps {
  year: number;
  month: number;
}

const DAY_LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export function PersonGridView({ year, month }: PersonGridViewProps) {
  const { people, assignments } = usePlanningStore();
  const { isRestDay, toggleRestDay } = useRestDaysStore();
  const days = getDaysInMonth(year, month);

  const getCellInfo = (personId: string, day: Date) => {
    const dateKey = formatDateKey(day);
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
    const rest = isRestDay(personId, dateKey);
    const assignment = assignments[dateKey];

    let hasMorning = false;
    let hasAfternoon = false;
    let hasFullDay = false;

    if (assignment) {
      hasMorning = (assignment.morning || []).includes(personId);
      hasAfternoon = (assignment.afternoon || []).includes(personId);
      hasFullDay = (assignment.fullDay || []).includes(personId);
    }

    return { isWeekend, rest, hasMorning, hasAfternoon, hasFullDay, dateKey };
  };

  const getCellStyle = (info: ReturnType<typeof getCellInfo>) => {
    if (info.rest) return { backgroundColor: '#FF6B6B', color: 'white', fontWeight: 'bold' as const };
    if (info.hasFullDay) return { backgroundColor: '#92D050' };
    if (info.hasMorning && info.hasAfternoon) return { background: 'linear-gradient(to right, #FFD966 50%, #92D050 50%)' };
    if (info.hasAfternoon) return { backgroundColor: '#92D050' };
    if (info.hasMorning) return { backgroundColor: '#FFD966' };
    if (info.isWeekend) return { backgroundColor: '#F2F2F2' };
    return {};
  };

  const handleCellClick = (personId: string, dateKey: string) => {
    toggleRestDay(personId, dateKey);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
      <table className="border-collapse bg-card text-[11px]">
        <thead>
          {/* Day letters row */}
          <tr className="bg-primary text-primary-foreground">
            <th className="px-2 py-1 text-left font-semibold sticky left-0 bg-primary z-10 min-w-[120px]">Personne</th>
            {days.map((day) => (
              <th key={day.toISOString()} className="px-1 py-1 text-center font-medium w-7 min-w-7">
                {DAY_LETTERS[day.getDay()]}
              </th>
            ))}
          </tr>
          {/* Day numbers row */}
          <tr className="bg-primary/80 text-primary-foreground">
            <th className="px-2 py-1 text-left font-semibold sticky left-0 bg-primary/80 z-10"></th>
            {days.map((day) => (
              <th key={day.toISOString()} className="px-1 py-1 text-center font-semibold w-7 min-w-7">
                {day.getDate()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person.id} className="border-b border-border hover:bg-muted/30">
              <td className="px-2 py-1 font-medium whitespace-nowrap sticky left-0 bg-card z-10 border-r border-border">
                [{person.code}] {person.name}
              </td>
              {days.map((day) => {
                const info = getCellInfo(person.id, day);
                const style = getCellStyle(info);
                return (
                  <td
                    key={day.toISOString()}
                    className="px-0 py-0 text-center border border-border/50 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ ...style, width: 28, height: 24 }}
                    onClick={() => handleCellClick(person.id, info.dateKey)}
                    title={`${person.name} – ${day.toLocaleDateString('fr-FR')}${info.rest ? ' (Repos)' : ''}`}
                  >
                    {info.rest ? 'R' : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-3 border-t border-border bg-muted/20 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFD966' }}></div>
          <span>Matin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#92D050' }}></div>
          <span>Après-midi / Journée</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(to right, #FFD966 50%, #92D050 50%)' }}></div>
          <span>Matin + Après-midi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF6B6B' }}></div>
          <span>Repos (R)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: '#F2F2F2' }}></div>
          <span>Week-end</span>
        </div>
      </div>
    </div>
  );
}
