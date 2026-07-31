export type HiveStatus = "active" | "pending" | "renewal";

export type PlacementType = "friche" | "site" | "partage";

export type Hive = {
  id: string;
  name: string;
  site: string;
  region: string;
  client: string;
  startDate: string; // ISO
  revenue: number;
  hiveCount: number;
  placement: PlacementType;
  /** Détail propre au type d'implantation (surface, type d'espace, apiculteur…). */
  placementDetail: string;
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

export const FAREINS_SITE = "Fareins (01)";
export const FAREINS_REGION = "Auvergne-Rhône-Alpes";

export const PLACEMENTS: Array<{
  id: PlacementType;
  label: string;
  /** Adresse exacte demandée uniquement pour ces implantations. */
  needsAddress: boolean;
  addressPlaceholder?: string;
}> = [
  { id: "friche", label: "Fareins", needsAddress: false },
  {
    id: "site",
    label: "Sur site",
    needsAddress: true,
    addressPlaceholder: "12 rue des Acacias, 69003 Lyon",
  },
  {
    id: "partage",
    label: "Rucher partagé",
    needsAddress: true,
    addressPlaceholder: "Rucher des Dombes, 01330 Villars-les-Dombes",
  },
];

export const placementLabel: Record<PlacementType, string> = {
  friche: "Fareins",
  site: "Sur site",
  partage: "Rucher partagé",
};


export const initialHives: Hive[] = [];

/** Prix public d'une ruche : 1 440 € HT / an. */
export const PRICE_PER_HIVE = 1440;

export function annualRevenue(hiveCount: number) {
  return hiveCount * PRICE_PER_HIVE;
}

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Day-truncated "now" so SSR and client render identical values. */
function today() {
  return new Date(Math.floor(Date.now() / DAY_MS) * DAY_MS);
}

/** Progress of the 3-year engagement, 0 → 1. */
export function engagementProgress(startDate: string, now = today()): number {
  const start = new Date(startDate).getTime();
  const elapsed = now.getTime() - start;
  return Math.min(1, Math.max(0, elapsed / (3 * YEAR_MS)));
}

export function monthsRemaining(startDate: string, now = today()): number {
  const end = new Date(startDate).getTime() + 3 * YEAR_MS;
  return Math.max(0, Math.round((end - now.getTime()) / (YEAR_MS / 12)));
}

/** Date de fin de l'engagement de 3 ans. */
export function engagementEnd(startDate: string): Date {
  return new Date(new Date(startDate).getTime() + 3 * YEAR_MS);
}

/** L'engagement de 3 ans est-il arrivé à son terme ? */
export function engagementCompleted(startDate: string, now = today()): boolean {
  return engagementEnd(startDate).getTime() <= now.getTime();
}

/** Statut calculé : à installer, en cours ou renouvellement (fin des 3 ans). */
export function computeStatus(startDate: string, now = today()): HiveStatus {
  if (new Date(startDate).getTime() > now.getTime()) return "pending";
  return engagementCompleted(startDate, now) ? "renewal" : "active";
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
