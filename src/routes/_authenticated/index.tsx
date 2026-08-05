import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Archive, Hexagon, Leaf, LogOut, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { AddHiveDialog } from "@/components/dashboard/add-hive-dialog";
import { CountUp } from "@/components/dashboard/count-up";

import { HiveTable } from "@/components/dashboard/hive-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { celebrate } from "@/lib/celebrate";
import { useHiveStore } from "@/lib/hive-store";
import {
  annualRevenue,
  formatEuro,
  statusLabel,
  type Hive,
  type HiveStatus,
} from "@/lib/hives";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/izigreen-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard IziGreen · Pilotage des ruchers" },
      {
        name: "description",
        content:
          "Pilotez vos ruchers IziGreen : chiffre d'affaires, engagements 3 ans et ajout de ruches en quelques secondes.",
      },
      { property: "og:title", content: "Dashboard IziGreen · Pilotage des ruchers" },
      {
        property: "og:description",
        content:
          "Suivi gamifié des ruchers IziGreen : KPI en temps réel, progression des contrats et création guidée de ruches.",
      },
    ],
  }),
  component: Dashboard,
});

const filters: Array<{ id: HiveStatus | "all"; label: string }> = [
  { id: "all", label: "Toutes" },
  { id: "active", label: statusLabel.active },
  { id: "pending", label: statusLabel.pending },
  { id: "renewal", label: statusLabel.renewal },
];

function Dashboard() {
  const { hives, archives, addHive, removeHive } = useHiveStore();
  const [filter, setFilter] = useState<HiveStatus | "all">("all");
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const signOut = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };


  const visible = useMemo(
    () => (filter === "all" ? hives : hives.filter((h) => h.status === filter)),
    [hives, filter],
  );

  const revenue = hives.reduce((sum, h) => sum + h.revenue, 0);
  const hiveCount = hives.reduce((sum, h) => sum + h.hiveCount, 0);
  const clientCount = new Set(
    hives.map((h) => h.client.trim().toLowerCase()).filter(Boolean),
  ).size;

  const create = (hive: Omit<Hive, "id" | "revenue" | "status">) => {
    addHive(hive);
    celebrate();
    toast.success(`${hive.name} rejoint le réseau IziGreen 🐝`, {
      description: `${hive.hiveCount} ruche(s) · ${formatEuro(annualRevenue(hive.hiveCount))} de CA annuel HT`,
    });
  };

  const handleDelete = (id: string) => {
    const hive = hives.find((h) => h.id === id);
    removeHive(id);
    toast.success(`${hive?.name ?? "Rucher"} supprimé`, {
      description: "Les indicateurs de l'année en cours ont été mis à jour.",
    });
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 flex items-center gap-3"
      >
        <img
          src={logoAsset.url}
          alt="IziGreen"
          className="h-8 w-auto md:h-10"
        />
        <h2 className="font-display text-lg font-semibold text-foreground md:text-xl">
          Suivi des ruches
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="ml-auto rounded-xl text-muted-foreground"
        >
          <LogOut className="size-4" /> Se déconnecter
        </Button>
      </motion.div>


      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-end justify-between gap-6"
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Leaf className="size-3.5" /> IziGreen · Saison {year}
          </span>
          <h1 className="mt-3 font-display text-4xl font-semibold text-foreground md:text-5xl">
            Vos ruchers, en un coup d'œil
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Chiffres clés du 1<sup>er</sup> janvier au 31 décembre {year} · clôture et archivage
            automatiques chaque 1<sup>er</sup> janvier.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="glass" size="lg" className="rounded-2xl">
            <Link to="/historique">
              <Archive className="size-4" /> Historique
              {archives.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary">
                  {archives.length}
                </span>
              )}
            </Link>
          </Button>
          <AddHiveDialog onCreate={create} />
        </div>
      </motion.header>

      <section className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          icon={<Hexagon className="size-5" />}
          label={`Ruches installées ${year}`}
          delay={0}
          value={<CountUp value={hiveCount} />}
          hint={`${hives.length} rucher${hives.length > 1 ? "s" : ""} suivi${hives.length > 1 ? "s" : ""}`}
        />
        <KpiCard
          icon={<Users className="size-5" />}
          label="Clients uniques"
          delay={0.06}
          value={<CountUp value={clientCount} />}
          hint="Parrains distincts cette année"
        />
        <KpiCard
          icon={<TrendingUp className="size-5" />}
          label="Chiffre d'affaires"
          accent="honey"
          delay={0.12}
          value={<CountUp value={revenue} format={(n) => formatEuro(n)} />}
          hint="Cumul annuel contractualisé HT"
        />
      </section>


      <section className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card flex flex-wrap items-center gap-2 rounded-3xl p-3"
        >
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "relative rounded-2xl px-4 py-2 text-sm font-medium transition-colors duration-300",
                filter === f.id
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {filter === f.id && (
                <motion.span
                  layoutId="filter-pill"
                  className="gradient-forest absolute inset-0 rounded-2xl"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{f.label}</span>
            </button>
          ))}
          <span className="ml-auto pr-2 text-xs text-muted-foreground">
            {visible.length} rucher{visible.length > 1 ? "s" : ""}
          </span>
        </motion.div>
      </section>


      <section className="mt-4">
        <HiveTable hives={visible} onDelete={handleDelete} />
      </section>
    </main>
  );
}
