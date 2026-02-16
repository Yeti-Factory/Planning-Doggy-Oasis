import { useState, useEffect } from 'react';
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
  FolderOpen,
  CalendarDays,
  Upload,
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { hasLocalDataToMigrate } from '@/components/LocalStorageMigration';

type View = 'guide' | 'people' | 'settings' | 'tasks' | 'migration' | { type: 'month'; year: number; month: number } | { type: 'annual'; year: number } | { type: 'annual-month'; year: number; month: number };

interface AppSidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  const currentYear = new Date().getFullYear();
  const [expandedSections, setExpandedSections] = useState<string[]>(['planning', '2026']);
  const [showMigration, setShowMigration] = useState(false);

  useEffect(() => {
    setShowMigration(hasLocalDataToMigrate());
  }, []);
  const years = [2026, 2027, 2028];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
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

  const isAnnualActive = (year: number) => {
    return (
      typeof currentView === 'object' &&
      (currentView.type === 'annual' || currentView.type === 'annual-month') &&
      currentView.year === year
    );
  };

  const isPlanningActive = typeof currentView === 'object' && currentView.type === 'month';
  const isAnnualMonthActive = (year: number, month: number) => {
    return (
      typeof currentView === 'object' &&
      currentView.type === 'annual-month' &&
      currentView.year === year &&
      currentView.month === month
    );
  };

  const isAnnualSectionActive = typeof currentView === 'object' && (currentView.type === 'annual' || currentView.type === 'annual-month');

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

        {/* Separator */}
        <div className="h-px bg-sidebar-border my-3" />

        {/* Planning Mensuel Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('planning')}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors',
              isPlanningActive
                ? 'bg-sidebar-accent text-sidebar-foreground'
                : 'hover:bg-sidebar-accent text-sidebar-foreground'
            )}
          >
            {expandedSections.includes('planning') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Calendar className="w-4 h-4" />
            Planning mensuel
          </button>

          {expandedSections.includes('planning') && (
            <div className="ml-3 space-y-0.5 animate-slide-in">
              {years.map((year) => (
                <div key={year}>
                  <button
                    onClick={() => toggleSection(year.toString())}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      typeof currentView === 'object' && currentView.year === year
                        ? 'bg-sidebar-accent/50 text-sidebar-foreground'
                        : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/90'
                    )}
                  >
                    {expandedSections.includes(year.toString()) ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    <FolderOpen className="w-3.5 h-3.5" />
                    {year}
                  </button>

                  {expandedSections.includes(year.toString()) && (
                    <div className="ml-5 mt-0.5 space-y-0.5 animate-slide-in">
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
          )}
        </div>

        {/* Calendrier annuel */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('annual')}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors',
              isAnnualSectionActive
                ? 'bg-sidebar-accent text-sidebar-foreground'
                : 'hover:bg-sidebar-accent text-sidebar-foreground'
            )}
          >
            {expandedSections.includes('annual') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <CalendarDays className="w-4 h-4" />
            Calendrier annuel
          </button>

          {expandedSections.includes('annual') && (
            <div className="ml-3 space-y-0.5 animate-slide-in">
              {years.map((year) => (
                <div key={`annual-${year}`}>
                  <button
                    onClick={() => toggleSection(`annual-${year}`)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isAnnualActive(year)
                        ? 'bg-sidebar-accent/50 text-sidebar-foreground'
                        : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/90'
                    )}
                  >
                    {expandedSections.includes(`annual-${year}`) ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    <FolderOpen className="w-3.5 h-3.5" />
                    {year}
                  </button>

                  {expandedSections.includes(`annual-${year}`) && (
                    <div className="ml-5 mt-0.5 space-y-0.5 animate-slide-in">
                      {MONTHS_FR.map((monthName, idx) => (
                        <button
                          key={`annual-${year}-${idx}`}
                          onClick={() => onViewChange({ type: 'annual-month', year, month: idx })}
                          className={cn(
                            'w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                            isAnnualMonthActive(year, idx)
                              ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                          )}
                        >
                          {monthName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-px bg-sidebar-border my-3" />

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
      </nav>

      {/* Migration button */}
      {showMigration && (
        <div className="p-2">
          <button
            onClick={() => onViewChange('migration')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              'bg-shift-morning text-foreground hover:bg-shift-morning/80',
              currentView === 'migration' && 'ring-2 ring-primary'
            )}
          >
            <Upload className="w-4 h-4" />
            Importer données locales
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/50 text-center">
        Données partagées en temps réel
      </div>
    </aside>
  );
}
