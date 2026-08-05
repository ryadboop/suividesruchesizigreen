DROP POLICY IF EXISTS hives_public_read ON public.hives;
DROP POLICY IF EXISTS hives_public_insert ON public.hives;
DROP POLICY IF EXISTS hives_public_update ON public.hives;
DROP POLICY IF EXISTS hives_public_delete ON public.hives;
DROP POLICY IF EXISTS archives_public_read ON public.year_archives;
DROP POLICY IF EXISTS archives_public_insert ON public.year_archives;

REVOKE ALL ON public.hives FROM anon;
REVOKE ALL ON public.year_archives FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hives TO authenticated;
GRANT ALL ON public.hives TO service_role;
GRANT SELECT, INSERT ON public.year_archives TO authenticated;
GRANT ALL ON public.year_archives TO service_role;

CREATE POLICY hives_auth_select ON public.hives FOR SELECT TO authenticated USING (true);
CREATE POLICY hives_auth_insert ON public.hives FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY hives_auth_update ON public.hives FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY hives_auth_delete ON public.hives FOR DELETE TO authenticated USING (true);

CREATE POLICY archives_auth_select ON public.year_archives FOR SELECT TO authenticated USING (true);
CREATE POLICY archives_auth_insert ON public.year_archives FOR INSERT TO authenticated WITH CHECK (true);