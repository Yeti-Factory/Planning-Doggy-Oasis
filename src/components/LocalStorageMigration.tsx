import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Upload, Database, Users, Calendar, ClipboardList, Settings, Loader2 } from 'lucide-react';
import { Category, CODE_MAP } from '@/types/planning';

interface MigrationData {
  people: { id: string; name: string; category: Category; code: string }[];
  assignments: Record<string, { date: string; morning: (string | undefined)[]; afternoon: (string | undefined)[]; fullDay: (string | undefined)[] }>;
  events: Record<string, string[]>;
  customTasks: string[];
  weeklyTasks: Record<string, { weekStartDate: string; personId: string; day: number; period: string; tasks: string }>;
  settings: { hoursForMorning?: number; hoursForAfternoon?: number; hoursForFullDay?: number };
}

const KNOWN_KEYS = [
  'planning-storage',
  'annual-planning-storage', 
  'custom-tasks-storage',
  'weekly-tasks-storage',
];

function scanLocalStorage(): MigrationData {
  const result: MigrationData = {
    people: [],
    assignments: {},
    events: {},
    customTasks: [],
    weeklyTasks: {},
    settings: {},
  };

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || key === 'migration-done') continue;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);

      // Zustand persist format: { state: { ... }, version: ... }
      const state = parsed?.state || parsed;

      // Detect people array
      if (Array.isArray(state?.people) && state.people.length > 0 && state.people[0]?.name) {
        result.people = state.people.map((p: any) => ({
          id: p.id || Date.now().toString() + Math.random().toString(36).slice(2),
          name: p.name,
          category: p.category || 'Bénévole',
          code: p.code || CODE_MAP[p.category as Category] || 'b',
        }));
      }

      // Detect assignments
      if (state?.assignments && typeof state.assignments === 'object' && !Array.isArray(state.assignments)) {
        const keys = Object.keys(state.assignments);
        if (keys.length > 0 && keys[0].match(/^\d{4}-\d{2}-\d{2}$/)) {
          result.assignments = state.assignments;
        }
      }

      // Detect annual events
      if (state?.events && typeof state.events === 'object' && !Array.isArray(state.events)) {
        const keys = Object.keys(state.events);
        if (keys.length > 0 && Array.isArray(state.events[keys[0]])) {
          result.events = state.events;
        }
      }

      // Detect custom tasks
      if (Array.isArray(state?.customTasks) && state.customTasks.length > 0 && typeof state.customTasks[0] === 'string') {
        result.customTasks = state.customTasks;
      }

      // Detect weekly tasks
      if (state?.assignments && typeof state.assignments === 'object') {
        const keys = Object.keys(state.assignments);
        if (keys.length > 0 && keys[0].match(/^\d{4}-\d{2}-\d{2}-/) && state.assignments[keys[0]]?.personId) {
          result.weeklyTasks = state.assignments;
        }
      }

      // Detect settings
      if (state?.settings && typeof state.settings === 'object') {
        if ('hoursForMorning' in state.settings || 'hoursForAfternoon' in state.settings || 'hoursForFullDay' in state.settings) {
          result.settings = state.settings;
        }
      }

    } catch {
      // Not JSON, skip
    }
  }

  return result;
}

function hasData(data: MigrationData): boolean {
  return (
    data.people.length > 0 ||
    Object.keys(data.assignments).length > 0 ||
    Object.keys(data.events).length > 0 ||
    data.customTasks.length > 0 ||
    Object.keys(data.weeklyTasks).length > 0 ||
    Object.keys(data.settings).length > 0
  );
}

export function LocalStorageMigration() {
  const [data, setData] = useState<MigrationData | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const scanned = scanLocalStorage();
    setData(scanned);
  }, []);

  const handleMigrate = async () => {
    if (!data) return;
    setMigrating(true);
    setResult(null);

    try {
      const errors: string[] = [];
      let totalInserted = 0;

      // 1. Migrate people (upsert by name)
      if (data.people.length > 0) {
        for (const person of data.people) {
          // Check if person already exists by name
          const { data: existing } = await supabase
            .from('people')
            .select('id')
            .eq('name', person.name)
            .maybeSingle();

          if (!existing) {
            const { error } = await supabase.from('people').insert({
              id: person.id,
              name: person.name,
              category: person.category,
              code: person.code,
            });
            if (error) errors.push(`Personne "${person.name}": ${error.message}`);
            else totalInserted++;
          }
        }
      }

      // Build a name->id map from DB for assignment resolution
      const { data: dbPeople } = await supabase.from('people').select('id, name');
      const peopleNameToId: Record<string, string> = {};
      const peopleIdToId: Record<string, string> = {};
      for (const p of dbPeople || []) {
        peopleNameToId[p.name] = p.id;
      }
      // Map old IDs to DB IDs via name matching
      for (const p of data.people) {
        const dbId = peopleNameToId[p.name];
        if (dbId) peopleIdToId[p.id] = dbId;
      }

      // 2. Migrate planning assignments
      const assignmentKeys = Object.keys(data.assignments);
      if (assignmentKeys.length > 0) {
        const rows: { date: string; slot: string; slot_index: number; person_id: string }[] = [];
        for (const [date, assignment] of Object.entries(data.assignments)) {
          for (const slot of ['morning', 'afternoon', 'fullDay'] as const) {
            const people = assignment[slot] || [];
            for (let i = 0; i < people.length; i++) {
              const pid = people[i];
              if (pid) {
                const resolvedId = peopleIdToId[pid] || pid;
                rows.push({ date, slot, slot_index: i, person_id: resolvedId });
              }
            }
          }
        }
        if (rows.length > 0) {
          // Batch insert, ignore conflicts
          const { error } = await supabase.from('planning_assignments').upsert(rows, { onConflict: 'date,slot,slot_index' });
          if (error) errors.push(`Affectations: ${error.message}`);
          else totalInserted += rows.length;
        }
      }

      // 3. Migrate annual events
      const eventKeys = Object.keys(data.events);
      if (eventKeys.length > 0) {
        const rows: { date: string; event_text: string; position: number }[] = [];
        for (const [date, texts] of Object.entries(data.events)) {
          texts.forEach((text, i) => {
            rows.push({ date, event_text: text, position: i });
          });
        }
        if (rows.length > 0) {
          const { error } = await supabase.from('annual_events').insert(rows);
          if (error) errors.push(`Événements: ${error.message}`);
          else totalInserted += rows.length;
        }
      }

      // 4. Migrate custom tasks
      if (data.customTasks.length > 0) {
        for (const task of data.customTasks) {
          const { data: existing } = await supabase
            .from('custom_tasks')
            .select('id')
            .eq('name', task)
            .maybeSingle();

          if (!existing) {
            const { error } = await supabase.from('custom_tasks').insert({ name: task });
            if (error) errors.push(`Tâche "${task}": ${error.message}`);
            else totalInserted++;
          }
        }
      }

      // 5. Migrate weekly tasks
      const weeklyKeys = Object.keys(data.weeklyTasks);
      if (weeklyKeys.length > 0) {
        const rows: { week_start_date: string; person_id: string; day: number; period: string; tasks: string }[] = [];
        for (const assignment of Object.values(data.weeklyTasks)) {
          const resolvedId = peopleIdToId[assignment.personId] || assignment.personId;
          rows.push({
            week_start_date: assignment.weekStartDate,
            person_id: resolvedId,
            day: assignment.day,
            period: assignment.period,
            tasks: assignment.tasks,
          });
        }
        if (rows.length > 0) {
          const { error } = await supabase.from('weekly_tasks').upsert(rows, { onConflict: 'week_start_date,person_id,day,period' });
          if (error) errors.push(`Tâches hebdo: ${error.message}`);
          else totalInserted += rows.length;
        }
      }

      // 6. Migrate settings
      if (Object.keys(data.settings).length > 0) {
        for (const [key, value] of Object.entries(data.settings)) {
          if (value !== undefined) {
            const { error } = await supabase.from('settings').upsert(
              { key, value: String(value), updated_at: new Date().toISOString() },
              { onConflict: 'key' }
            );
            if (error) errors.push(`Paramètre "${key}": ${error.message}`);
            else totalInserted++;
          }
        }
      }

      // Mark migration as done
      localStorage.setItem('migration-done', 'true');

      if (errors.length > 0) {
        setResult({
          success: false,
          message: `${totalInserted} éléments migrés avec ${errors.length} erreur(s) :\n${errors.join('\n')}`,
        });
      } else {
        setResult({
          success: true,
          message: `Migration réussie ! ${totalInserted} éléments transférés vers la base partagée.`,
        });
      }
    } catch (err: any) {
      setResult({ success: false, message: `Erreur inattendue : ${err.message}` });
    } finally {
      setMigrating(false);
    }
  };

  if (!data) return null;

  const peopleCount = data.people.length;
  const assignmentsCount = Object.values(data.assignments).reduce((acc, a) => {
    return acc + [a.morning, a.afternoon, a.fullDay].flat().filter(Boolean).length;
  }, 0);
  const eventsCount = Object.values(data.events).flat().length;
  const customTasksCount = data.customTasks.length;
  const weeklyTasksCount = Object.keys(data.weeklyTasks).length;
  const settingsCount = Object.keys(data.settings).length;
  const totalCount = peopleCount + assignmentsCount + eventsCount + customTasksCount + weeklyTasksCount + settingsCount;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Import des données locales</h1>
          <p className="text-muted-foreground">Transférer les données de ce navigateur vers la base partagée</p>
        </div>
      </div>

      {!hasData(data) && !result && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Aucune donnée trouvée</AlertTitle>
          <AlertDescription>
            Ce navigateur ne contient pas de données locales à migrer. Assurez-vous d'ouvrir cette page depuis le navigateur de l'admin qui avait saisi les données.
          </AlertDescription>
        </Alert>
      )}

      {hasData(data) && (
        <Card>
          <CardHeader>
            <CardTitle>Données trouvées dans ce navigateur</CardTitle>
            <CardDescription>
              Ces données seront transférées vers la base partagée, accessibles par toute l'équipe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {peopleCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">{peopleCount}</span> personne(s)
              </div>
            )}
            {assignmentsCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">{assignmentsCount}</span> affectation(s) de planning
              </div>
            )}
            {eventsCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-shift-morning" />
                <span className="font-medium">{eventsCount}</span> événement(s) annuel(s)
              </div>
            )}
            {customTasksCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <ClipboardList className="w-4 h-4 text-primary" />
                <span className="font-medium">{customTasksCount}</span> tâche(s) personnalisée(s)
              </div>
            )}
            {weeklyTasksCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <ClipboardList className="w-4 h-4 text-accent-foreground" />
                <span className="font-medium">{weeklyTasksCount}</span> affectation(s) de tâches hebdo
              </div>
            )}
            {settingsCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{settingsCount}</span> paramètre(s)
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Total : <span className="font-bold text-foreground">{totalCount}</span> éléments à transférer
              </p>
              <Button
                onClick={handleMigrate}
                disabled={migrating || result?.success === true}
                size="lg"
                className="w-full"
              >
                {migrating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Migration en cours...
                  </>
                ) : result?.success ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Migration terminée
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Migrer les données vers la base partagée
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <AlertTitle>{result.success ? 'Succès !' : 'Erreurs'}</AlertTitle>
          <AlertDescription className="whitespace-pre-line">{result.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export function hasLocalDataToMigrate(): boolean {
  if (localStorage.getItem('migration-done') === 'true') return false;
  const data = scanLocalStorage();
  return hasData(data);
}
