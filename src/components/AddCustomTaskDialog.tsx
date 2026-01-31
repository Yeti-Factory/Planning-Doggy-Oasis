import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCustomTasksStore } from '@/hooks/useCustomTasksStore';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function AddCustomTaskDialog() {
  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState('');
  const { customTasks, addCustomTask, removeCustomTask } = useCustomTasksStore();

  const handleAddTask = () => {
    const trimmed = newTask.trim();
    if (!trimmed) {
      toast.error('Veuillez entrer un nom de tâche');
      return;
    }
    if (customTasks.includes(trimmed)) {
      toast.error('Cette tâche existe déjà');
      return;
    }
    addCustomTask(trimmed);
    setNewTask('');
    toast.success('Tâche ajoutée');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  };

  const handleRemoveTask = (task: string) => {
    removeCustomTask(task);
    toast.success('Tâche supprimée');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Gérer les tâches
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gérer les tâches personnalisées</DialogTitle>
          <DialogDescription>
            Ajoutez des tâches personnalisées qui apparaîtront dans la liste de sélection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="new-task">Nouvelle tâche</Label>
              <Input
                id="new-task"
                placeholder="Ex: réunion d'équipe"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button onClick={handleAddTask}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>

          {customTasks.length > 0 && (
            <div className="space-y-2">
              <Label>Tâches personnalisées ({customTasks.length})</Label>
              <ScrollArea className="h-[200px] rounded-md border p-2">
                <div className="space-y-1">
                  {customTasks.map((task) => (
                    <div
                      key={task}
                      className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted group"
                    >
                      <span className="text-sm">{task}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveTask(task)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {customTasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune tâche personnalisée. Ajoutez-en une ci-dessus.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
