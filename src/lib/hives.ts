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

export const PLACEMENTS: Array<{
  id: PlacementType;
  label: string;
  description: string;
  detailLabel: string;
  detailPlaceholder: string;
}> = [
  {
    id: "friche",
    label: "Friche",
    description: "Terrain naturel ou friche réhabilitée en zone de butinage.",
    detailLabel: "Surface & commune",
    detailPlaceholder: "2,5 ha · Friche de Fareins (01)",
  },
  {
    id: "site",
    label: "Sur site client",
    description: "Ruches installées directement chez le client (toit, jardin, parking végétalisé).",
    detailLabel: "Type d'espace",
    detailPlaceholder: "Toiture-terrasse du siège, accès sécurisé",
  },
  {
    id: "partage",
    label: "Rucher partagé",
    description: "Ruches hébergées sur un rucher collectif IziGreen géré par un apiculteur partenaire.",
    detailLabel: "Rucher & apiculteur partenaire",
    detailPlaceholder: "Rucher des Dombes · Apiculteur Julien M.",
  },
];

export const placementLabel: Record<PlacementType, string> = {
  friche: "Friche",
  site: "Sur site client",
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
