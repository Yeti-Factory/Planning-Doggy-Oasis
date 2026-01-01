import { forwardRef } from 'react';
import { usePlanningStore } from '@/hooks/usePlanningStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PersonSelectProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  disabledIds?: string[];
  slotType: 'morning' | 'afternoon' | 'fullDay';
  className?: string;
}

export const PersonSelect = forwardRef<HTMLButtonElement, PersonSelectProps>(
  function PersonSelect(
    { value, onChange, disabledIds = [], slotType, className },
    ref
  ) {
    const { people, getPersonById } = usePlanningStore();
    const selectedPerson = value ? getPersonById(value) : undefined;

    const getSlotStyles = () => {
      if (!value) return '';
      switch (slotType) {
        case 'morning':
          return 'bg-shift-morning text-shift-morning-text border-shift-morning';
        case 'afternoon':
        case 'fullDay':
          return 'bg-shift-afternoon text-shift-afternoon-text border-shift-afternoon';
        default:
          return '';
      }
    };

    return (
      <Select
        value={value || '__empty__'}
        onValueChange={(v) => onChange(v === '__empty__' ? undefined : v)}
      >
        <SelectTrigger
          ref={ref}
          className={cn(
            'h-8 text-xs font-medium transition-all',
            getSlotStyles(),
            className
          )}
        >
          <SelectValue placeholder="—">
            {selectedPerson ? `[${selectedPerson.code}] ${selectedPerson.name}` : '—'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__empty__" className="text-muted-foreground">
            — Aucun —
          </SelectItem>
          {people.map((person) => (
            <SelectItem
              key={person.id}
              value={person.id}
              disabled={disabledIds.includes(person.id)}
              className={cn(
                disabledIds.includes(person.id) && 'opacity-50 line-through'
              )}
            >
              [{person.code}] {person.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);
