CREATE TABLE public.hives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  site text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  client text NOT NULL DEFAULT '',
  start_date date NOT NULL,
  hive_count integer NOT NULL DEFAULT 1,
  placement text NOT NULL DEFAULT 'friche',
  placement_detail text NOT NULL DEFAULT '',
  beekeeper text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hives TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hives TO authenticated;
GRANT ALL ON public.hives TO service_role;

ALTER TABLE public.hives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hives_public_read" ON public.hives FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "hives_public_insert" ON public.hives FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "hives_public_update" ON public.hives FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "hives_public_delete" ON public.hives FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE public.year_archives (
  year integer PRIMARY KEY,
  closed_at timestamptz NOT NULL DEFAULT now(),
  hives jsonb NOT NULL DEFAULT '[]'::jsonb,
  revenue integer NOT NULL DEFAULT 0,
  hive_count integer NOT NULL DEFAULT 0,
  apiary_count integer NOT NULL DEFAULT 0
);

GRANT SELECT, INSERT ON public.year_archives TO anon;
GRANT SELECT, INSERT ON public.year_archives TO authenticated;
GRANT ALL ON public.year_archives TO service_role;

ALTER TABLE public.year_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "archives_public_read" ON public.year_archives FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "archives_public_insert" ON public.year_archives FOR INSERT TO anon, authenticated WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.hives;
ALTER PUBLICATION supabase_realtime ADD TABLE public.year_archives;