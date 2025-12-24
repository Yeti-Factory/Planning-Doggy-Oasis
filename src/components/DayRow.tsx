import { usePlanningStore } from '@/hooks/usePlanningStore';
import { formatDate, formatDateKey, getDayName, isWeekend, getWeekNumber } from '@/lib/dateUtils';
import { PersonSelect } from './PersonSelect';
import { cn } from '@/lib/utils';

interface DayRowProps {
  date: Date;
}

export function DayRow({ date }: DayRowProps) {
  const { getAssignment, setAssignment } = usePlanningStore();
  const dateKey = formatDateKey(date);
  const assignment = getAssignment(dateKey);
  const weekend = isWeekend(date);
  const weekNum = getWeekNumber(date);

  const morning = assignment?.morning;
  const afternoon = assignment?.afternoon;
  const fullDay = assignment?.fullDay;

  // Get disabled IDs for duplicate prevention
  const getDisabledIds = (currentSlot: 'morning' | 'afternoon' | 'fullDay') => {
    const ids: string[] = [];
    if (currentSlot !== 'morning' && morning) ids.push(morning);
    if (currentSlot !== 'afternoon' && afternoon) ids.push(afternoon);
    if (currentSlot !== 'fullDay' && fullDay) ids.push(fullDay);
    return ids;
  };

  return (
    <tr className={cn(
      'transition-colors hover:bg-accent/50',
      weekend && 'bg-weekend'
    )}>
      <td className="px-3 py-2 text-sm font-medium border-r border-border">
        {formatDate(date)}
      </td>
      <td className={cn(
        'px-3 py-2 text-sm border-r border-border',
        weekend && 'text-weekend-text'
      )}>
        {getDayName(date)}
      </td>
      <td className="px-3 py-2 text-sm text-center border-r border-border font-medium text-muted-foreground">
        {weekNum}
      </td>
      <td className="px-2 py-1.5 border-r border-border">
        <PersonSelect
          value={morning}
          onChange={(v) => setAssignment(dateKey, 'morning', v)}
          disabledIds={getDisabledIds('morning')}
          slotType="morning"
        />
      </td>
      <td className="px-2 py-1.5 border-r border-border">
        <PersonSelect
          value={afternoon}
          onChange={(v) => setAssignment(dateKey, 'afternoon', v)}
          disabledIds={getDisabledIds('afternoon')}
          slotType="afternoon"
        />
      </td>
      <td className="px-2 py-1.5">
        <PersonSelect
          value={fullDay}
          onChange={(v) => setAssignment(dateKey, 'fullDay', v)}
          disabledIds={getDisabledIds('fullDay')}
          slotType="fullDay"
        />
      </td>
    </tr>
  );
}
