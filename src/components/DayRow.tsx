import { useState, useEffect } from 'react';
import { usePlanningStore } from '@/hooks/usePlanningStore';
import { formatDate, formatDateKey, getDayName, isWeekend, getWeekNumber } from '@/lib/dateUtils';
import { PersonSelect } from './PersonSelect';
import { cn } from '@/lib/utils';
import { MAX_PEOPLE_PER_SLOT } from '@/types/planning';
import { Button } from './ui/button';
import { Plus, Minus, Copy, ClipboardPaste } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DayRowProps {
  date: Date;
}

export function DayRow({ date }: DayRowProps) {
  const { getAssignment, setAssignment, copyDay, pasteToDay, clipboard } = usePlanningStore();
  const dateKey = formatDateKey(date);
  const assignment = getAssignment(dateKey);
  const weekend = isWeekend(date);
  const weekNum = getWeekNumber(date);

  const morning = assignment?.morning || [];
  const afternoon = assignment?.afternoon || [];
  const fullDay = assignment?.fullDay || [];

  // Track how many selectors are visible for each slot
  const getInitialVisibleCount = (values: (string | undefined)[]) => {
    const filledCount = values.filter(Boolean).length;
    return Math.max(1, filledCount);
  };

  const [visibleCounts, setVisibleCounts] = useState({
    morning: getInitialVisibleCount(morning),
    afternoon: getInitialVisibleCount(afternoon),
    fullDay: getInitialVisibleCount(fullDay),
  });

  // Update visible counts when assignment changes (e.g., after paste)
  useEffect(() => {
    setVisibleCounts({
      morning: getInitialVisibleCount(morning),
      afternoon: getInitialVisibleCount(afternoon),
      fullDay: getInitialVisibleCount(fullDay),
    });
  }, [assignment]);

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

  const addSelector = (slot: 'morning' | 'afternoon' | 'fullDay') => {
    if (visibleCounts[slot] < MAX_PEOPLE_PER_SLOT) {
      setVisibleCounts(prev => ({ ...prev, [slot]: prev[slot] + 1 }));
    }
  };

  const removeSelector = (slot: 'morning' | 'afternoon' | 'fullDay') => {
    const slotValues = slot === 'morning' ? morning : slot === 'afternoon' ? afternoon : fullDay;
    const filledCount = slotValues.filter(Boolean).length;
    const minVisible = Math.max(1, filledCount);
    
    if (visibleCounts[slot] > minVisible) {
      setVisibleCounts(prev => ({ ...prev, [slot]: prev[slot] - 1 }));
    }
  };

  const handleCopyDay = () => {
    copyDay(dateKey);
    toast({
      title: "Journée copiée",
      description: `Les affectations du ${formatDate(date)} ont été copiées.`,
    });
  };

  const handlePasteDay = () => {
    pasteToDay(dateKey);
    toast({
      title: "Journée collée",
      description: `Les affectations ont été collées sur le ${formatDate(date)}.`,
    });
  };

  const canPaste = clipboard?.type === 'day';

  const renderSlotSelects = (
    slotType: 'morning' | 'afternoon' | 'fullDay',
    values: (string | undefined)[]
  ) => {
    const visibleCount = visibleCounts[slotType];
    const canAdd = visibleCount < MAX_PEOPLE_PER_SLOT;
    const filledCount = values.filter(Boolean).length;
    const canRemove = visibleCount > Math.max(1, filledCount);

    return (
      <div className="flex flex-col gap-1">
        {Array.from({ length: visibleCount }).map((_, index) => (
          <PersonSelect
            key={index}
            value={values[index]}
            onChange={(v) => setAssignment(dateKey, slotType, index, v)}
            disabledIds={getAllAssignedIds(slotType, index)}
            slotType={slotType}
          />
        ))}
        <div className="flex gap-1 mt-0.5">
          {canAdd && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => addSelector(slotType)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Ajouter
            </Button>
          )}
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => removeSelector(slotType)}
            >
              <Minus className="w-3 h-3 mr-1" />
              Retirer
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <tr className={cn(
      'transition-colors hover:bg-accent/50 group',
      weekend && 'bg-weekend'
    )}>
      <td className="px-3 py-2 text-sm font-medium border-r border-border align-top">
        <div className="flex items-center gap-1">
          <span>{formatDate(date)}</span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 ml-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleCopyDay}
              title="Copier cette journée"
            >
              <Copy className="w-3 h-3" />
            </Button>
            {canPaste && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handlePasteDay}
                title="Coller sur cette journée"
              >
                <ClipboardPaste className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
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
