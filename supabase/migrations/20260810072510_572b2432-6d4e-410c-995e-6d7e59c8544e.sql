ALTER TABLE public.hives
  ADD COLUMN IF NOT EXISTS share_role text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS host_hive_id uuid REFERENCES public.hives(id) ON DELETE SET NULL;