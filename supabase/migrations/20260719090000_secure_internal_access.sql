-- Planning Pro is an internal application. Access is restricted to explicitly
-- approved Supabase Auth users, even if public sign-up is enabled by mistake.

CREATE TABLE IF NOT EXISTS public.app_members (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'administrator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.app_members FROM anon, authenticated;

-- Preserve access for Auth users that already exist when this migration runs.
INSERT INTO public.app_members (user_id, role)
SELECT id, 'administrator'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_planning_member()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.app_members
    WHERE user_id = (SELECT auth.uid())
  );
$$;

REVOKE ALL ON FUNCTION public.is_planning_member() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_planning_member() TO authenticated;

DROP POLICY IF EXISTS "Allow all access to people" ON public.people;
DROP POLICY IF EXISTS "Allow all access to planning_assignments" ON public.planning_assignments;
DROP POLICY IF EXISTS "Allow all access to annual_events" ON public.annual_events;
DROP POLICY IF EXISTS "Allow all access to weekly_tasks" ON public.weekly_tasks;
DROP POLICY IF EXISTS "Allow all access to custom_tasks" ON public.custom_tasks;
DROP POLICY IF EXISTS "Allow all access to settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all access to rest_days" ON public.rest_days;

CREATE POLICY "Approved members can manage people"
  ON public.people FOR ALL TO authenticated
  USING ((SELECT public.is_planning_member()))
  WITH CHECK ((SELECT public.is_planning_member()));

CREATE POLICY "Approved members can manage planning assignments"
  ON public.planning_assignments FOR ALL TO authenticated
  USING ((SELECT public.is_planning_member()))
  WITH CHECK ((SELECT public.is_planning_member()));

CREATE POLICY "Approved members can manage annual events"
  ON public.annual_events FOR ALL TO authenticated
  USING ((SELECT public.is_planning_member()))
  WITH CHECK ((SELECT public.is_planning_member()));

CREATE POLICY "Approved members can manage weekly tasks"
  ON public.weekly_tasks FOR ALL TO authenticated
  USING ((SELECT public.is_planning_member()))
  WITH CHECK ((SELECT public.is_planning_member()));

CREATE POLICY "Approved members can manage custom tasks"
  ON public.custom_tasks FOR ALL TO authenticated
  USING ((SELECT public.is_planning_member()))
  WITH CHECK ((SELECT public.is_planning_member()));

CREATE POLICY "Approved members can manage settings"
  ON public.settings FOR ALL TO authenticated
  USING ((SELECT public.is_planning_member()))
  WITH CHECK ((SELECT public.is_planning_member()));

CREATE POLICY "Approved members can manage rest days"
  ON public.rest_days FOR ALL TO authenticated
  USING ((SELECT public.is_planning_member()))
  WITH CHECK ((SELECT public.is_planning_member()));

-- Backups are managed only by the Edge Function's service-role client.
DROP POLICY IF EXISTS "Admin can manage backups" ON storage.objects;

-- Remove orphan weekly tasks before enforcing the missing relationship.
DELETE FROM public.weekly_tasks AS weekly_task
WHERE NOT EXISTS (
  SELECT 1 FROM public.people WHERE people.id = weekly_task.person_id
);

ALTER TABLE public.weekly_tasks
  DROP CONSTRAINT IF EXISTS weekly_tasks_person_id_fkey;

ALTER TABLE public.weekly_tasks
  ADD CONSTRAINT weekly_tasks_person_id_fkey
  FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;

-- Existing assignments take precedence over contradictory rest-day markers.
DELETE FROM public.rest_days AS rest_day
WHERE EXISTS (
  SELECT 1
  FROM public.planning_assignments AS assignment
  WHERE assignment.person_id = rest_day.person_id
    AND assignment.date = rest_day.date
);

CREATE OR REPLACE FUNCTION public.prevent_rest_assignment_conflict()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_TABLE_NAME = 'rest_days' THEN
    IF EXISTS (
      SELECT 1
      FROM public.planning_assignments
      WHERE person_id = NEW.person_id AND date = NEW.date
    ) THEN
      RAISE EXCEPTION 'A person with an assignment cannot be marked as resting';
    END IF;
  ELSIF EXISTS (
    SELECT 1
    FROM public.rest_days
    WHERE person_id = NEW.person_id AND date = NEW.date
  ) THEN
    RAISE EXCEPTION 'A person marked as resting cannot receive an assignment';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_assignment_for_resting_person ON public.planning_assignments;
CREATE TRIGGER prevent_assignment_for_resting_person
  BEFORE INSERT OR UPDATE OF date, person_id ON public.planning_assignments
  FOR EACH ROW EXECUTE FUNCTION public.prevent_rest_assignment_conflict();

DROP TRIGGER IF EXISTS prevent_rest_for_assigned_person ON public.rest_days;
CREATE TRIGGER prevent_rest_for_assigned_person
  BEFORE INSERT OR UPDATE OF date, person_id ON public.rest_days
  FOR EACH ROW EXECUTE FUNCTION public.prevent_rest_assignment_conflict();

-- Replace a whole day in one database transaction. This prevents the previous
-- delete-then-insert flow from leaving a day empty after a network error.
CREATE OR REPLACE FUNCTION public.replace_day_assignments(p_date TEXT, p_rows JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF p_date !~ '^\d{4}-\d{2}-\d{2}$' THEN
    RAISE EXCEPTION 'Invalid date format';
  END IF;

  IF jsonb_typeof(p_rows) <> 'array' THEN
    RAISE EXCEPTION 'p_rows must be a JSON array';
  END IF;

  DELETE FROM public.planning_assignments WHERE date = p_date;

  INSERT INTO public.planning_assignments (date, slot, slot_index, person_id)
  SELECT
    p_date,
    row_data.slot,
    row_data.slot_index,
    row_data.person_id
  FROM jsonb_to_recordset(p_rows) AS row_data(
    slot TEXT,
    slot_index INTEGER,
    person_id TEXT
  );
END;
$$;

REVOKE ALL ON FUNCTION public.replace_day_assignments(TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.replace_day_assignments(TEXT, JSONB) TO authenticated;
