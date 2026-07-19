import { lazy, Suspense, useState, useEffect } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import { usePlanningStore } from '@/hooks/usePlanningStore';
import { useAnnualPlanningStore } from '@/hooks/useAnnualPlanningStore';
import { useCustomTasksStore } from '@/hooks/useCustomTasksStore';
import { useWeeklyTasksStore } from '@/hooks/useWeeklyTasksStore';
import { useRestDaysStore } from '@/hooks/useRestDaysStore';

const AnnualCalendar = lazy(() =>
  import('@/components/AnnualCalendar').then((module) => ({ default: module.AnnualCalendar }))
);
const AnnualMonthView = lazy(() =>
  import('@/components/AnnualMonthView').then((module) => ({ default: module.AnnualMonthView }))
);
const MonthPlanning = lazy(() =>
  import('@/components/MonthPlanning').then((module) => ({ default: module.MonthPlanning }))
);
const PeopleManager = lazy(() =>
  import('@/components/PeopleManager').then((module) => ({ default: module.PeopleManager }))
);
const SettingsPanel = lazy(() =>
  import('@/components/SettingsPanel').then((module) => ({ default: module.SettingsPanel }))
);
const UserGuide = lazy(() =>
  import('@/components/UserGuide').then((module) => ({ default: module.UserGuide }))
);
const WeeklyTaskPlanner = lazy(() =>
  import('@/components/WeeklyTaskPlanner').then((module) => ({ default: module.WeeklyTaskPlanner }))
);
const LocalStorageMigration = lazy(() =>
  import('@/components/LocalStorageMigration').then((module) => ({ default: module.LocalStorageMigration }))
);

type View = 'guide' | 'people' | 'settings' | 'tasks' | 'migration' | { type: 'month'; year: number; month: number } | { type: 'annual'; year: number } | { type: 'annual-month'; year: number; month: number };

const Index = () => {
  const today = new Date();
  const [currentView, setCurrentView] = useState<View>({
    type: 'month',
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  // Fetch data from DB on mount
  const fetchPlanning = usePlanningStore((s) => s.fetchAll);
  const fetchAnnual = useAnnualPlanningStore((s) => s.fetchEvents);
  const fetchCustomTasks = useCustomTasksStore((s) => s.fetchCustomTasks);
  const subscribePlanning = usePlanningStore((s) => s.subscribeRealtime);
  const subscribeAnnual = useAnnualPlanningStore((s) => s.subscribeRealtime);
  const subscribeCustomTasks = useCustomTasksStore((s) => s.subscribeRealtime);
  const subscribeWeeklyTasks = useWeeklyTasksStore((s) => s.subscribeRealtime);
  const fetchRestDays = useRestDaysStore((s) => s.fetchRestDays);
  const subscribeRestDays = useRestDaysStore((s) => s.subscribeRealtime);

  useEffect(() => {
    fetchPlanning();
    fetchAnnual();
    fetchCustomTasks();
    fetchRestDays();
  }, [fetchPlanning, fetchAnnual, fetchCustomTasks, fetchRestDays]);

  useEffect(() => {
    const unsub1 = subscribePlanning();
    const unsub2 = subscribeAnnual();
    const unsub3 = subscribeCustomTasks();
    const unsub4 = subscribeWeeklyTasks();
    const unsub5 = subscribeRestDays();
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); };
  }, [subscribePlanning, subscribeAnnual, subscribeCustomTasks, subscribeWeeklyTasks, subscribeRestDays]);

  const renderContent = () => {
    if (currentView === 'guide') {
      return <UserGuide />;
    }
    if (currentView === 'people') {
      return <PeopleManager />;
    }
    if (currentView === 'settings') {
      return <SettingsPanel />;
    }
    if (currentView === 'tasks') {
      return <WeeklyTaskPlanner />;
    }
    if (currentView === 'migration') {
      return <LocalStorageMigration />;
    }
    if (typeof currentView === 'object' && currentView.type === 'month') {
      return <MonthPlanning year={currentView.year} month={currentView.month} />;
    }
    if (typeof currentView === 'object' && currentView.type === 'annual') {
      return <AnnualCalendar year={currentView.year} />;
    }
    if (typeof currentView === 'object' && currentView.type === 'annual-month') {
      return <AnnualMonthView year={currentView.year} month={currentView.month} />;
    }
    return null;
  };

  return (
    <>
      <Helmet>
        <title>Planning Pro - Gestion des plannings mensuels</title>
        <meta name="description" content="Application de gestion de planning mensuel avec suivi des heures par équipe et par personne." />
      </Helmet>
      <div className="flex h-screen bg-background overflow-hidden">
        <AppSidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 overflow-y-auto">
          <Suspense
            fallback={
              <div className="grid min-h-full place-items-center text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Chargement…
                </div>
              </div>
            }
          >
            {renderContent()}
          </Suspense>
        </main>
      </div>
    </>
  );
};

export default Index;
