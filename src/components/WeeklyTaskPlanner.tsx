import { useState, useMemo } from 'react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { usePlanningStore } from '@/hooks/usePlanningStore';
import { useWeeklyTasksStore } from '@/hooks/useWeeklyTasksStore';
import { DAYS_OF_WEEK_FR } from '@/types/tasks';
import { TaskCell } from './TaskCell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronLeft, ChevronRight, Copy, Trash2, ClipboardPaste, Printer } from 'lucide-react';
import {
  getWeekStartDate,
  formatWeekRange,
  getNextWeekStart,
  getPreviousWeekStart,
  formatDayWithDate,
} from '@/lib/weekUtils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDateKey } from '@/lib/dateUtils';
import { Person } from '@/types/planning';

interface WeeklyTaskPlannerProps {
  initialWeekStart?: string;
}

export function WeeklyTaskPlanner({ initialWeekStart }: WeeklyTaskPlannerProps) {
  const [weekStartDate, setWeekStartDate] = useState(
    initialWeekStart || getWeekStartDate(new Date())
  );
  const [copiedWeek, setCopiedWeek] = useState<string | null>(null);

  const { people, getAssignment, getPersonById } = usePlanningStore();
  const { setTaskAssignment, getTaskAssignment, clearWeekTasks, copyWeekTasks } = useWeeklyTasksStore();

  const weekDates = useMemo(() => {
    const start = new Date(weekStartDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [weekStartDate]);

  // Get people assigned to a specific period on a specific day
  const getAssignedPeople = (dayIndex: number, period: 'morning' | 'afternoon'): Person[] => {
    const date = weekDates[dayIndex];
    const dateKey = formatDateKey(date);
    const assignment = getAssignment(dateKey);
    
    if (!assignment) return [];
    
    const assignedIds = new Set<string>();
    
    // Get people from the specific period slot
    const periodSlot = period === 'morning' ? assignment.morning : assignment.afternoon;
    periodSlot?.forEach(id => {
      if (id) assignedIds.add(id);
    });
    
    // Also include people assigned to fullDay (they work both periods)
    assignment.fullDay?.forEach(id => {
      if (id) assignedIds.add(id);
    });
    
    // Convert IDs to Person objects
    return Array.from(assignedIds)
      .map(id => getPersonById(id))
      .filter((p): p is Person => p !== undefined);
  };

  // Get all unique people assigned during the week for a period
  const getWeekAssignedPeople = (period: 'morning' | 'afternoon'): Person[] => {
    const allAssignedIds = new Set<string>();
    
    weekDates.forEach((_, dayIndex) => {
      const assigned = getAssignedPeople(dayIndex, period);
      assigned.forEach(person => allAssignedIds.add(person.id));
    });
    
    return Array.from(allAssignedIds)
      .map(id => getPersonById(id))
      .filter((p): p is Person => p !== undefined)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const handlePreviousWeek = () => {
    setWeekStartDate(getPreviousWeekStart(weekStartDate));
  };

  const handleNextWeek = () => {
    setWeekStartDate(getNextWeekStart(weekStartDate));
  };

  const handleCopyWeek = () => {
    setCopiedWeek(weekStartDate);
    toast.success('Semaine copiée');
  };

  const handlePasteWeek = () => {
    if (copiedWeek) {
      copyWeekTasks(copiedWeek, weekStartDate);
      toast.success('Semaine collée');
    }
  };

  const handleClearWeek = () => {
    clearWeekTasks(weekStartDate);
    toast.success('Semaine effacée');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTaskChange = (
    personId: string,
    day: number,
    period: 'morning' | 'afternoon',
    tasks: string
  ) => {
    setTaskAssignment(weekStartDate, personId, day, period, tasks);
  };

  const getTaskValue = (personId: string, day: number, period: 'morning' | 'afternoon'): string => {
    const assignment = getTaskAssignment(weekStartDate, personId, day, period);
    return assignment?.tasks || '';
  };

  const renderTaskTable = (period: 'morning' | 'afternoon', title: string) => {
    const weekPeople = getWeekAssignedPeople(period);
    
    if (weekPeople.length === 0) {
      return (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Aucune personne n'est affectée au créneau "{title.toLowerCase()}" pour cette semaine.
              <br />
              <span className="text-sm">Veuillez d'abord créer le planning mensuel.</span>
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="print-page mb-6">
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="pb-3 print:pb-2">
            <div className="print:flex print:items-center print:justify-between hidden">
              <CardTitle className="text-xl font-bold">{title}</CardTitle>
              <div className="text-sm text-muted-foreground">
                Semaine {formatWeekRange(weekStartDate)}
              </div>
            </div>
            <CardTitle className="text-lg font-semibold print:hidden">{title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="print:text-[11px]">
                <TableHeader>
                  <TableRow className="bg-muted/50 print:bg-primary print:text-primary-foreground">
                    <TableHead className="w-[120px] font-semibold sticky left-0 bg-muted/50 print:bg-primary print:text-primary-foreground z-10 print:static">
                      Personnel
                    </TableHead>
                    {weekDates.map((date, idx) => {
                      const isWeekend = idx >= 5;
                      return (
                        <TableHead
                          key={idx}
                          className={cn(
                            'text-center min-w-[140px] font-semibold print:min-w-0',
                            isWeekend && 'bg-orange-50 dark:bg-orange-950/20 print:bg-orange-100'
                          )}
                        >
                          <div>{DAYS_OF_WEEK_FR[idx]}</div>
                          <div className="text-xs font-normal text-muted-foreground print:text-inherit print:opacity-80">
                            {formatDayWithDate(date)}
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weekPeople.map((person) => (
                    <TableRow key={person.id} className="print:break-inside-avoid">
                      <TableCell className="font-medium sticky left-0 bg-background z-10 border-r print:static print:bg-transparent">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full print:w-2 print:h-2',
                              person.category === 'Salarié' && 'bg-blue-500',
                              person.category === 'Bénévole' && 'bg-green-500',
                              person.category === 'Prestataire' && 'bg-purple-500',
                              person.category === 'Woofer' && 'bg-orange-500'
                            )}
                          />
                          {person.name}
                        </div>
                      </TableCell>
                      {weekDates.map((date, dayIdx) => {
                        const isWeekend = dayIdx >= 5;
                        const isAssignedToday = getAssignedPeople(dayIdx, period).some(p => p.id === person.id);
                        
                        return (
                          <TableCell
                            key={dayIdx}
                            className={cn(
                              'p-0 border print:p-1',
                              isWeekend && 'bg-orange-50/50 dark:bg-orange-950/10 print:bg-orange-50',
                              !isAssignedToday && 'bg-muted/30'
                            )}
                          >
                            {isAssignedToday ? (
                              <TaskCell
                                value={getTaskValue(person.id, dayIdx, period)}
                                onChange={(tasks) => handleTaskChange(person.id, dayIdx, period, tasks)}
                                personName={person.name}
                                dayName={DAYS_OF_WEEK_FR[dayIdx]}
                                period={period}
                              />
                            ) : (
                              <div className="h-full min-h-[40px] flex items-center justify-center text-xs text-muted-foreground">
                                —
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 print:p-0">
      {/* Header - hidden on print */}
      <div className="mb-6 no-print">
        <h1 className="text-2xl font-bold mb-2">Planificateur de tâches</h1>
        <p className="text-sm text-muted-foreground">
          Attention : les tâches attribuées dans ce planning peuvent être modifiées selon les besoins du service.
        </p>
      </div>

      {/* Week Navigation - hidden on print */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 no-print">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-semibold px-4 py-2 bg-muted rounded-md min-w-[280px] text-center">
            Semaine {formatWeekRange(weekStartDate)}
          </div>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyWeek}>
            <Copy className="h-4 w-4 mr-2" />
            Copier
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePasteWeek}
            disabled={!copiedWeek}
          >
            <ClipboardPaste className="h-4 w-4 mr-2" />
            Coller
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Effacer la semaine ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action va supprimer toutes les tâches assignées pour cette semaine.
                  Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearWeek}>
                  Effacer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Task Tables */}
      {renderTaskTable('morning', 'Matin')}
      {renderTaskTable('afternoon', 'Après-midi')}

      {/* Legend - hidden on print */}
      <Card className="no-print">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Salarié</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span>Bénévole</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span>Prestataire</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Woofer</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="w-4 h-4 bg-orange-50 border rounded" />
              <span>Week-end</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
