export type HiveStatus = "active" | "pending" | "renewal";

export type Hive = {
  id: string;
  name: string;
  site: string;
  region: string;
  client: string;
  startDate: string; // ISO
  revenue: number;
  colonies: number;
  status: HiveStatus;
};

export const REGIONS = [
  "Auvergne-Rhône-Alpes",
  "Occitanie",
  "Bretagne",
  "Nouvelle-Aquitaine",
  "Grand Est",
  "Provence-Alpes-Côte d'Azur",
];

export const initialHives: Hive[] = [
  {
    id: "IZG-001",
    name: "Rucher des Cèdres",
    site: "Toit Siège Lyon",
    region: "Auvergne-Rhône-Alpes",
    client: "Groupe Verdier",
    startDate: "2024-04-12",
    revenue: 4800,
    colonies: 6,
    status: "active",
  },
  {
    id: "IZG-002",
    name: "Rucher Garrigue",
    site: "Campus Montpellier",
    region: "Occitanie",
    client: "NovaTech",
    startDate: "2023-06-02",
    revenue: 7200,
    colonies: 9,
    status: "renewal",
  },
  {
    id: "IZG-003",
    name: "Rucher Armor",
    site: "Site logistique Rennes",
    region: "Bretagne",
    client: "Mareva Logistics",
    startDate: "2025-03-21",
    revenue: 3100,
    colonies: 4,
    status: "active",
  },
  {
    id: "IZG-004",
    name: "Rucher Pins Blancs",
    site: "Domaine Bordeaux Sud",
    region: "Nouvelle-Aquitaine",
    client: "Cave Lascombe",
    startDate: "2026-01-15",
    revenue: 1500,
    colonies: 3,
    status: "pending",
  },
  {
    id: "IZG-005",
    name: "Rucher Vosges",
    site: "Usine Strasbourg",
    region: "Grand Est",
    client: "Alsatis Industries",
    startDate: "2024-09-08",
    revenue: 5600,
    colonies: 7,
    status: "active",
  },
  {
    id: "IZG-006",
    name: "Rucher Calanques",
    site: "Marina Marseille",
    region: "Provence-Alpes-Côte d'Azur",
    client: "Port Azur",
    startDate: "2023-11-27",
    revenue: 6400,
    colonies: 8,
    status: "renewal",
  },
];

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

/** Progress of the 3-year engagement, 0 → 1. */
export function engagementProgress(startDate: string, now = new Date()): number {
  const start = new Date(startDate).getTime();
  const elapsed = now.getTime() - start;
  return Math.min(1, Math.max(0, elapsed / (3 * YEAR_MS)));
}

export function monthsRemaining(startDate: string, now = new Date()): number {
  const end = new Date(startDate).getTime() + 3 * YEAR_MS;
  return Math.max(0, Math.round((end - now.getTime()) / (YEAR_MS / 12)));
}

export const statusLabel: Record<HiveStatus, string> = {
  active: "En cours",
  pending: "À installer",
  renewal: "Renouvellement",
};

export function formatEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
