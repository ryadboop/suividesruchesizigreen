import { useCallback, useEffect, useState } from "react";

import { annualRevenue, computeStatus, type Hive } from "./hives";

export type YearArchive = {
  year: number;
  closedAt: string;
  hives: Hive[];
  revenue: number;
  hiveCount: number;
  apiaryCount: number;
};

type Persisted = {
  hives: Hive[];
  archives: YearArchive[];
  /** Dernière année pour laquelle le dashboard a été ouvert. */
  lastYear: number;
};

const KEY = "izigreen.hives.v1";

const empty: Persisted = { hives: [], archives: [], lastYear: new Date().getFullYear() };

function snapshot(year: number, hives: Hive[]): YearArchive {
  return {
    year,
    closedAt: new Date(year + 1, 0, 1).toISOString(),
    hives,
    revenue: hives.reduce((s, h) => s + annualRevenue(h.hiveCount), 0),
    hiveCount: hives.reduce((s, h) => s + h.hiveCount, 0),
    apiaryCount: hives.length,
  };
}

/** Clôture automatique au 1er janvier : chaque année passée est archivée. */
function rollover(state: Persisted, currentYear: number): Persisted {
  if (currentYear <= state.lastYear) return state;
  const archives = [...state.archives];
  for (let y = state.lastYear; y < currentYear; y++) {
    if (!archives.some((a) => a.year === y)) archives.push(snapshot(y, state.hives));
  }
  return { ...state, archives: archives.sort((a, b) => b.year - a.year), lastYear: currentYear };
}

function read(): Persisted {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = { ...empty, ...(JSON.parse(raw) as Partial<Persisted>) };
    return rollover(parsed, new Date().getFullYear());
  } catch {
    return empty;
  }
}

export function useHiveStore() {
  const [state, setState] = useState<Persisted>(empty);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota / mode privé */
    }
  }, [state, hydrated]);

  const addHive = useCallback((hive: Omit<Hive, "id" | "revenue" | "status">) => {
    setState((s) => ({
      ...s,
      hives: [
        {
          ...hive,
          id: `IZG-${Date.now().toString(36).toUpperCase()}`,
          revenue: annualRevenue(hive.hiveCount),
          status: computeStatus(hive.startDate),
        },
        ...s.hives,
      ],
    }));
  }, []);

  const removeHive = useCallback((id: string) => {
    setState((s) => ({ ...s, hives: s.hives.filter((h) => h.id !== id) }));
  }, []);

  // Recalcule statut + CA à chaque rendu (prix et engagement pilotés par la règle métier).
  const hives = state.hives.map((h) => ({
    ...h,
    revenue: annualRevenue(h.hiveCount),
    status: computeStatus(h.startDate),
  }));

  return { hives, archives: state.archives, hydrated, addHive, removeHive };
}

export function archiveToCsv(archive: YearArchive) {
  const head = [
    "Rucher",
    "Client",
    "Commune",
    "Région",
    "Implantation",
    "Détail",
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
