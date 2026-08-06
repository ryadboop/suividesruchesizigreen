ALTER TABLE public.hives
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS price integer;

DROP POLICY IF EXISTS hives_auth_update ON public.hives;
DROP POLICY IF EXISTS hives_auth_delete ON public.hives;

CREATE POLICY hives_admin_update ON public.hives
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY hives_admin_delete ON public.hives
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));