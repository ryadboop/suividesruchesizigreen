import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

/** Indique si l'utilisateur connecté est administrateur. */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        if (!cancelled) setChecked(true);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", auth.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;
      setIsAdmin(Boolean(data));
      setChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { isAdmin, checked };
}
