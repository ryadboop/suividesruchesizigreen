import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Archive, Award, Hexagon, Leaf, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { AddHiveDialog } from "@/components/dashboard/add-hive-dialog";
import { CountUp } from "@/components/dashboard/count-up";
import { EngagementRing } from "@/components/dashboard/engagement-ring";
import { HiveTable } from "@/components/dashboard/hive-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { celebrate } from "@/lib/celebrate";
import { useHiveStore } from "@/lib/hive-store";
import {
  annualRevenue,
  engagementProgress,
  formatEuro,
  statusLabel,
  type Hive,
  type HiveStatus,
} from "@/lib/hives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
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
  const [hives, setHives] = useState<Hive[]>(initialHives);
  const [filter, setFilter] = useState<HiveStatus | "all">("all");

  const visible = useMemo(
    () => (filter === "all" ? hives : hives.filter((h) => h.status === filter)),
    [hives, filter],
  );

  const revenue = hives.reduce((sum, h) => sum + h.revenue, 0);
  const hiveCount = hives.reduce((sum, h) => sum + h.hiveCount, 0);
  const avgProgress =
    hives.reduce((sum, h) => sum + engagementProgress(h.startDate), 0) / (hives.length || 1);

  const addHive = (hive: Omit<Hive, "id">) => {
    setHives((prev) => [
      { ...hive, id: `IZG-${String(prev.length + 1).padStart(3, "0")}` },
      ...prev,
    ]);
    celebrate();
    toast.success(`${hive.name} rejoint le réseau IziGreen 🐝`, {
      description: `${hive.hiveCount} ruche(s) · ${formatEuro(hive.revenue)} de CA annuel`,
    });
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-end justify-between gap-6"
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Leaf className="size-3.5" /> IziGreen · Saison 2026
          </span>
          <h1 className="mt-3 font-display text-4xl font-semibold text-foreground md:text-5xl">
            Vos ruchers, en un coup d'œil
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Suivez le chiffre d'affaires, la vitalité des colonies et la progression des
            engagements de 3 ans.
          </p>
        </div>
        <AddHiveDialog onCreate={addHive} />
      </motion.header>

      <section className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<TrendingUp className="size-5" />}
          label="Chiffre d'affaires"
          accent="honey"
          trend="+12,4%"
          delay={0}
          value={<CountUp value={revenue} format={(n) => formatEuro(n)} />}
          hint="Cumul annuel contractualisé"
        />
        <KpiCard
          icon={<Hexagon className="size-5" />}
          label="Ruchers actifs"
          delay={0.06}
          value={<CountUp value={hives.length} />}
          hint={`${hiveCount} ruche${hiveCount > 1 ? "s" : ""} installée${hiveCount > 1 ? "s" : ""}`}
        />
        <KpiCard
          icon={<Leaf className="size-5" />}
          label="Abeilles parrainées"
          delay={0.12}
          value={<CountUp value={hiveCount * 40000} format={(n) => Math.round(n).toLocaleString("fr-FR")} />}
          hint="Impact pollinisation local"
        />
        <KpiCard
          icon={<Award className="size-5" />}
          label="Engagements honorés"
          accent="honey"
          delay={0.18}
          value={<CountUp value={avgProgress * 100} format={(n) => `${Math.round(n)} %`} />}
          hint="Progression moyenne des 3 ans"
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
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

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card flex items-center justify-between gap-4 rounded-3xl p-4"
        >
          <EngagementRing
            progress={avgProgress}
            size={72}
            label="Niveau du réseau"
            sublabel="Badge Miel d'Or à 80 %"
          />
          <Button variant="glass" size="sm" className="rounded-xl">
            <Award className="size-4" /> Badges
          </Button>
        </motion.div>
      </section>

      <section className="mt-4">
        <HiveTable hives={visible} />
      </section>
    </main>
  );
}
