import { useState, useRef, useEffect } from 'react';
import { PREDEFINED_TASKS } from '@/types/tasks';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronDown, X } from 'lucide-react';

interface TaskCellProps {
  value: string;
  onChange: (value: string) => void;
  personName: string;
  dayName: string;
  period: 'morning' | 'afternoon';
}

export function TaskCell({ value, onChange, personName, dayName, period }: TaskCellProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTasks = PREDEFINED_TASKS.filter((task) =>
    task.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (task: string) => {
    // If already has value, append with " + "
    if (value && value.trim() !== '') {
      onChange(`${value} + ${task}`);
    } else {
      onChange(task);
    }
    setSearchValue('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const handleCustomInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      if (value && value.trim() !== '') {
        onChange(`${value} + ${searchValue.trim()}`);
      } else {
        onChange(searchValue.trim());
      }
      setSearchValue('');
    }
  };

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const periodLabel = period === 'morning' ? 'Matin' : 'Après-midi';
  const displayValue = value || '';
  const isEmpty = !value || value.trim() === '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'w-full h-full min-h-[60px] justify-start text-left font-normal p-2 text-xs whitespace-pre-wrap',
            'hover:bg-muted/50 border border-transparent hover:border-border',
            isEmpty && 'text-muted-foreground italic'
          )}
        >
          <span className="flex-1 line-clamp-3">{displayValue || 'Cliquer pour ajouter...'}</span>
          {!isEmpty && (
            <X
              className="h-3 w-3 ml-1 shrink-0 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-popover z-50" align="start">
        <div className="p-3 border-b">
          <p className="text-sm font-medium">
            {personName} - {dayName} ({periodLabel})
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Input
              ref={inputRef}
              placeholder="Rechercher ou ajouter..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleCustomInput}
              className="h-8 text-sm"
            />
          </div>
          {searchValue && (
            <p className="text-xs text-muted-foreground mt-1">
              Appuyez sur Entrée pour ajouter "{searchValue}"
            </p>
          )}
        </div>
        <ScrollArea className="h-[200px]">
          <div className="p-2 space-y-1">
            {filteredTasks.map((task) => (
              <button
                key={task}
                onClick={() => handleSelect(task)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-left',
                  'hover:bg-accent hover:text-accent-foreground transition-colors',
                  value?.includes(task) && 'bg-accent/50'
                )}
              >
                {value?.includes(task) && <Check className="h-3 w-3" />}
                <span className={cn(value?.includes(task) && 'ml-0', !value?.includes(task) && 'ml-5')}>
                  {task}
                </span>
              </button>
            ))}
            {filteredTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune tâche trouvée. Appuyez sur Entrée pour ajouter.
              </p>
            )}
          </div>
        </ScrollArea>
        {!isEmpty && (
          <div className="p-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Tâches actuelles :</p>
            <p className="text-xs bg-muted p-2 rounded">{displayValue}</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
