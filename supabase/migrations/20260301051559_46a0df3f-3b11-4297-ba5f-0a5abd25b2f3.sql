
-- Create rest_days table
CREATE TABLE public.rest_days (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id text NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  date text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(person_id, date)
);

-- Enable RLS
ALTER TABLE public.rest_days ENABLE ROW LEVEL SECURITY;

-- Allow all access (same pattern as other tables in this project)
CREATE POLICY "Allow all access to rest_days"
  ON public.rest_days
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.rest_days;
