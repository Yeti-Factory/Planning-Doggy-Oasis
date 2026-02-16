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
import { useAnnualPlanningStore, AnnualEvent } from '@/hooks/useAnnualPlanningStore';
import { MONTHS_FR } from '@/types/planning';
import { cn } from '@/lib/utils';

const EVENT_COLORS = [
  { name: 'Jaune', value: '#FFD966' },
  { name: 'Vert', value: '#92D050' },
  { name: 'Bleu', value: '#5B9BD5' },
  { name: 'Rose', value: '#FF6B8A' },
  { name: 'Orange', value: '#FFA550' },
  { name: 'Violet', value: '#B07DD0' },
  { name: 'Gris', value: '#C0C0C0' },
  { name: 'Aucune', value: null },
];

interface DayEventsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateKey: string;
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
  const [localEvents, setLocalEvents] = useState<AnnualEvent[]>([]);
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
      setLocalEvents([...localEvents, { text: trimmed, color: '#FFD966' }]);
      setNewEvent('');
    }
  };

  const handleRemove = (index: number) => {
    setLocalEvents(localEvents.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, text: string) => {
    const updated = [...localEvents];
    updated[index] = { ...updated[index], text };
    setLocalEvents(updated);
  };

  const handleColorChange = (index: number, color: string | null) => {
    const updated = [...localEvents];
    updated[index] = { ...updated[index], color };
    setLocalEvents(updated);
  };

  const handleSave = () => {
    const filtered = localEvents.filter((e) => e.text.trim() !== '');
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

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {localEvents.map((event, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2">
                <Input
                  value={event.text}
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
              <div className="flex items-center gap-1.5 pl-1">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    onClick={() => handleColorChange(idx, c.value)}
                    className={cn(
                      'w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 shrink-0',
                      event.color === c.value
                        ? 'border-foreground scale-110'
                        : 'border-muted-foreground/30',
                      !c.value && 'bg-background'
                    )}
                    style={c.value ? { backgroundColor: c.value } : undefined}
                  />
                ))}
              </div>
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
