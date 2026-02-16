import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { useAnnualPlanningStore } from '@/hooks/useAnnualPlanningStore';
import { MONTHS_FR } from '@/types/planning';

interface DayEventsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateKey: string; // YYYY-MM-DD
  dayNumber: number;
  month: number;
  year: number;
}

export function DayEventsDialog({
  open,
  onOpenChange,
  dateKey,
  dayNumber,
  month,
  year,
}: DayEventsDialogProps) {
  const { events, setEvents } = useAnnualPlanningStore();
  const [localEvents, setLocalEvents] = useState<string[]>([]);
  const [newEvent, setNewEvent] = useState('');

  useEffect(() => {
    if (open) {
      setLocalEvents([...(events[dateKey] || [])]);
      setNewEvent('');
    }
  }, [open, dateKey, events]);

  const handleAdd = () => {
    const trimmed = newEvent.trim();
    if (trimmed) {
      setLocalEvents([...localEvents, trimmed]);
      setNewEvent('');
    }
  };

  const handleRemove = (index: number) => {
    setLocalEvents(localEvents.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, value: string) => {
    const updated = [...localEvents];
    updated[index] = value;
    setLocalEvents(updated);
  };

  const handleSave = () => {
    const filtered = localEvents.filter((e) => e.trim() !== '');
    setEvents(dateKey, filtered);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {dayNumber} {MONTHS_FR[month]} {year}
          </DialogTitle>
          <DialogDescription>
            Ajoutez ou modifiez les événements de cette journée.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {localEvents.map((event, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={event}
                onChange={(e) => handleUpdate(idx, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(idx)}
                className="shrink-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nouvel événement..."
            className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
