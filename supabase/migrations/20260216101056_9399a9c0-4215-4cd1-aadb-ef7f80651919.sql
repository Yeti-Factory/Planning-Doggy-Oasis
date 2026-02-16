
-- Table: people (liste des personnes)
CREATE TABLE public.people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Salarié', 'Bénévole', 'Prestataire', 'Woofer')),
  code TEXT NOT NULL CHECK (code IN ('s', 'b', 'p', 'w')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to people" ON public.people FOR ALL USING (true) WITH CHECK (true);

-- Insert default people
INSERT INTO public.people (id, name, category, code) VALUES
  ('1', 'Anne', 'Salarié', 's'),
  ('2', 'Romane', 'Salarié', 's'),
  ('3', 'Alice', 'Bénévole', 'b'),
  ('4', 'Bob', 'Prestataire', 'p'),
  ('5', 'Woofeur 1', 'Woofer', 'w'),
  ('6', 'Prestataire X', 'Prestataire', 'p');

-- Table: planning_assignments (affectations mensuelles)
CREATE TABLE public.planning_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('morning', 'afternoon', 'fullDay')),
  slot_index INTEGER NOT NULL CHECK (slot_index >= 0 AND slot_index < 6),
  person_id TEXT REFERENCES public.people(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date, slot, slot_index)
);

ALTER TABLE public.planning_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to planning_assignments" ON public.planning_assignments FOR ALL USING (true) WITH CHECK (true);

-- Table: annual_events (calendrier annuel)
CREATE TABLE public.annual_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  event_text TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.annual_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to annual_events" ON public.annual_events FOR ALL USING (true) WITH CHECK (true);

-- Table: weekly_tasks (tâches hebdomadaires)
CREATE TABLE public.weekly_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start_date TEXT NOT NULL,
  person_id TEXT NOT NULL,
  day INTEGER NOT NULL CHECK (day >= 0 AND day <= 6),
  period TEXT NOT NULL CHECK (period IN ('morning', 'afternoon')),
  tasks TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(week_start_date, person_id, day, period)
);

ALTER TABLE public.weekly_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to weekly_tasks" ON public.weekly_tasks FOR ALL USING (true) WITH CHECK (true);

-- Table: custom_tasks (tâches personnalisées)
CREATE TABLE public.custom_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to custom_tasks" ON public.custom_tasks FOR ALL USING (true) WITH CHECK (true);

-- Table: settings (paramètres)
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
  ('hoursForMorning', '6'),
  ('hoursForAfternoon', '6'),
  ('hoursForFullDay', '9');

-- Enable realtime on all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.people;
ALTER PUBLICATION supabase_realtime ADD TABLE public.planning_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.annual_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
