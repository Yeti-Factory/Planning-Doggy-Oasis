import { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { MonthPlanning } from '@/components/MonthPlanning';
import { PeopleManager } from '@/components/PeopleManager';
import { SettingsPanel } from '@/components/SettingsPanel';
import { UserGuide } from '@/components/UserGuide';
import { Helmet } from 'react-helmet-async';

type View = 'guide' | 'people' | 'settings' | { type: 'month'; year: number; month: number };

const Index = () => {
  const [currentView, setCurrentView] = useState<View>({ type: 'month', year: 2026, month: 0 });

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
    if (typeof currentView === 'object' && currentView.type === 'month') {
      return <MonthPlanning year={currentView.year} month={currentView.month} />;
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
          {renderContent()}
        </main>
      </div>
    </>
  );
};

export default Index;
