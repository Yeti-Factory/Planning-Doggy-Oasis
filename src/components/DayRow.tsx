import { usePlanningStore } from '@/hooks/usePlanningStore';
import { formatDate, formatDateKey, getDayName, isWeekend, getWeekNumber } from '@/lib/dateUtils';
import { PersonSelect } from './PersonSelect';
import { cn } from '@/lib/utils';
import { MAX_PEOPLE_PER_SLOT } from '@/types/planning';

interface DayRowProps {
  date: Date;
}

export function DayRow({ date }: DayRowProps) {
  const { getAssignment, setAssignment } = usePlanningStore();
  const dateKey = formatDateKey(date);
  const assignment = getAssignment(dateKey);
  const weekend = isWeekend(date);
  const weekNum = getWeekNumber(date);

  const morning = assignment?.morning || [];
  const afternoon = assignment?.afternoon || [];
  const fullDay = assignment?.fullDay || [];

  // Get all assigned IDs for a day (to prevent duplicates)
  const getAllAssignedIds = (excludeSlot: 'morning' | 'afternoon' | 'fullDay', excludeIndex: number) => {
    const ids: string[] = [];
    
    const slots = { morning, afternoon, fullDay };
    for (const [slotName, slotValues] of Object.entries(slots)) {
      slotValues.forEach((id, idx) => {
        if (id && !(slotName === excludeSlot && idx === excludeIndex)) {
          ids.push(id);
        }
      });
    }
    
    return ids;
  };

  const renderSlotSelects = (
    slotType: 'morning' | 'afternoon' | 'fullDay',
    values: (string | undefined)[]
  ) => {
    return (
      <div className="flex flex-col gap-1">
        {Array.from({ length: MAX_PEOPLE_PER_SLOT }).map((_, index) => (
          <PersonSelect
            key={index}
            value={values[index]}
            onChange={(v) => setAssignment(dateKey, slotType, index, v)}
            disabledIds={getAllAssignedIds(slotType, index)}
            slotType={slotType}
          />
        ))}
      </div>
    );
  };

  return (
    <tr className={cn(
      'transition-colors hover:bg-accent/50',
      weekend && 'bg-weekend'
    )}>
      <td className="px-3 py-2 text-sm font-medium border-r border-border align-top">
        {formatDate(date)}
      </td>
      <td className={cn(
        'px-3 py-2 text-sm border-r border-border align-top',
        weekend && 'text-weekend-text'
      )}>
        {getDayName(date)}
      </td>
      <td className="px-3 py-2 text-sm text-center border-r border-border font-medium text-muted-foreground align-top">
        {weekNum}
      </td>
      <td className="px-2 py-1.5 border-r border-border align-top">
        {renderSlotSelects('morning', morning)}
      </td>
      <td className="px-2 py-1.5 border-r border-border align-top">
        {renderSlotSelects('afternoon', afternoon)}
      </td>
      <td className="px-2 py-1.5 align-top">
        {renderSlotSelects('fullDay', fullDay)}
      </td>
    </tr>
  );
}
