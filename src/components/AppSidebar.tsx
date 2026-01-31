import { useState } from 'react';
import { MONTHS_FR } from '@/types/planning';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Users,
  Settings,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import logo from '@/assets/logo.png';

type View = 'guide' | 'people' | 'settings' | 'tasks' | { type: 'month'; year: number; month: number };

interface AppSidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  const currentYear = new Date().getFullYear();
  const [expandedYears, setExpandedYears] = useState<number[]>([2026, currentYear]);
  const years = [2026, 2027, 2028];

  const toggleYear = (year: number) => {
    setExpandedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const isMonthActive = (year: number, month: number) => {
    return (
      typeof currentView === 'object' &&
      currentView.type === 'month' &&
      currentView.year === year &&
      currentView.month === month
    );
  };

  return (
    <aside className="w-64 h-screen bg-sidebar text-sidebar-foreground flex flex-col shrink-0 border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center mb-3">
          <img src={logo} alt="Doggy Oasis International" className="h-12 w-auto" />
        </div>
        <h1 className="text-lg font-bold text-sidebar-primary text-center">
          Planning Pro
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {/* Guide */}
        <button
          onClick={() => onViewChange('guide')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1',
            currentView === 'guide'
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'hover:bg-sidebar-accent text-sidebar-foreground'
          )}
        >
          <BookOpen className="w-4 h-4" />
          Mode d'emploi
        </button>

        {/* Personnel */}
        <button
          onClick={() => onViewChange('people')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1',
            currentView === 'people'
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'hover:bg-sidebar-accent text-sidebar-foreground'
          )}
        >
          <Users className="w-4 h-4" />
          Personnel
        </button>

        {/* Settings */}
        <button
          onClick={() => onViewChange('settings')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1',
            currentView === 'settings'
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'hover:bg-sidebar-accent text-sidebar-foreground'
          )}
        >
          <Settings className="w-4 h-4" />
          Paramètres
        </button>

        {/* Tasks Planner */}
        <button
          onClick={() => onViewChange('tasks')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1',
            currentView === 'tasks'
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'hover:bg-sidebar-accent text-sidebar-foreground'
          )}
        >
          <ClipboardList className="w-4 h-4" />
          Planificateur de tâches
        </button>

        {/* Separator */}
        <div className="h-px bg-sidebar-border my-3" />

        {/* Years & Months */}
        <div className="space-y-1">
          {years.map((year) => (
            <div key={year}>
              <button
                onClick={() => toggleYear(year)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
              >
                {expandedYears.includes(year) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Calendar className="w-4 h-4" />
                {year}
              </button>

              {expandedYears.includes(year) && (
                <div className="ml-4 mt-1 space-y-0.5 animate-slide-in">
                  {MONTHS_FR.map((month, idx) => (
                    <button
                      key={`${year}-${idx}`}
                      onClick={() => onViewChange({ type: 'month', year, month: idx })}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                        isMonthActive(year, idx)
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/50 text-center">
        Données sauvegardées localement
      </div>
    </aside>
  );
}
