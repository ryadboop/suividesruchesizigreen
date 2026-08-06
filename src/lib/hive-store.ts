import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { computeStatus, effectiveRevenue, type Hive, type PlacementType } from "./hives";

export type YearArchive = {
  year: number;
  closedAt: string;
  hives: Hive[];
  revenue: number;
  hiveCount: number;
  apiaryCount: number;
};

type HiveRow = {
  id: string;
  name: string;
  site: string;
  region: string;
  client: string;
  start_date: string;
  hive_count: number;
  placement: string;
  placement_detail: string;
  beekeeper: string;
  latitude: number | null;
  longitude: number | null;
  price: number | null;
};

function toHive(row: HiveRow): Hive {
  return {
    id: row.id,
    name: row.name,
    site: row.site,
    region: row.region,
    client: row.client,
    startDate: row.start_date,
    hiveCount: row.hive_count,
    placement: row.placement as PlacementType,
    placementDetail: row.placement_detail,
    beekeeper: row.beekeeper,
    latitude: row.latitude,
    longitude: row.longitude,
    price: row.price,
    revenue: effectiveRevenue(row.hive_count, row.price),
    status: computeStatus(row.start_date),
  };
}


/** Clôture automatique : archive l'année écoulée si ce n'est pas déjà fait. */
async function ensureRollover(hives: Hive[]) {
  const currentYear = new Date().getFullYear();
  const previous = currentYear - 1;
  const cutoff = new Date(Date.UTC(currentYear, 0, 1)).getTime();
  const closing = hives.filter((h) => new Date(h.startDate).getTime() < cutoff);
  if (closing.length === 0) return;

  const { data } = await supabase
    .from("year_archives")
    .select("year")
    .eq("year", previous)
    .maybeSingle();
  if (data) return;

  await supabase.from("year_archives").insert({
    year: previous,
    closed_at: new Date(Date.UTC(currentYear, 0, 1)).toISOString(),
    hives: closing as unknown as never,
    revenue: closing.reduce((s, h) => s + annualRevenue(h.hiveCount), 0),
    hive_count: closing.reduce((s, h) => s + h.hiveCount, 0),
    apiary_count: closing.length,
  });
}

export function useHiveStore() {
  const [hives, setHives] = useState<Hive[]>([]);
  const [archives, setArchives] = useState<YearArchive[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const load = useCallback(async () => {
    const [hivesRes, archivesRes] = await Promise.all([
      supabase.from("hives").select("*").order("created_at", { ascending: false }),
      supabase.from("year_archives").select("*").order("year", { ascending: false }),
    ]);

    const list = (hivesRes.data ?? []).map((r) => toHive(r as HiveRow));
    setHives(list);
    setArchives(
      (archivesRes.data ?? []).map((a) => ({
        year: a.year,
        closedAt: a.closed_at,
        hives: (a.hives ?? []) as unknown as Hive[],
        revenue: a.revenue,
        hiveCount: a.hive_count,
        apiaryCount: a.apiary_count,
      })),
    );
    setHydrated(true);
    return list;
  }, []);

  useEffect(() => {
    let cancelled = false;

    void load().then(async (list) => {
      if (cancelled) return;
      await ensureRollover(list);
    });

    const channel = supabase
      .channel("izigreen-hives")
      .on("postgres_changes", { event: "*", schema: "public", table: "hives" }, () => {
        void load();
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "year_archives" },
        () => {
          void load();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const addHive = useCallback(
    async (hive: Omit<Hive, "id" | "revenue" | "status">) => {
      await supabase.from("hives").insert({
        name: hive.name,
        site: hive.site,
        region: hive.region,
        client: hive.client,
        start_date: hive.startDate,
        hive_count: hive.hiveCount,
        placement: hive.placement,
        placement_detail: hive.placementDetail,
        beekeeper: hive.beekeeper ?? "",
      });
      await load();
    },
    [load],
  );

  const removeHive = useCallback(
    async (id: string) => {
      await supabase.from("hives").delete().eq("id", id);
      await load();
    },
    [load],
  );

  return { hives, archives, hydrated, addHive, removeHive };
}

export function archiveToCsv(archive: YearArchive) {
  const head = [
    "Rucher",
    "Client",
    "Commune",
    "Région",
    "Implantation",
    "Détail",
    "Apiculteur",
    "Ruches",
    "CA annuel (€ HT)",
    "Début engagement",
    "Statut",
  ];
  const rows = archive.hives.map((h) => [
    h.name,
    h.client,
    h.site,
    h.region,
    h.placement,
    h.placementDetail,
    h.beekeeper ?? "",
    String(h.hiveCount),
    String(annualRevenue(h.hiveCount)),
    h.startDate,
    h.status,
  ]);
  return [head, ...rows]
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";"))
    .join("\n");
}

export function downloadArchive(archive: YearArchive) {
  const blob = new Blob(["\uFEFF" + archiveToCsv(archive)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `izigreen-ruchers-${archive.year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
