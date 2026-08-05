import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, Download, Hexagon, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { downloadArchive, useHiveStore } from "@/lib/hive-store";
import { formatEuro, placementLabel } from "@/lib/hives";

export const Route = createFileRoute("/_authenticated/historique")({
  head: () => ({
    meta: [
      { title: "Historique annuel · Ruchers IziGreen" },
      {
        name: "description",
        content:
          "Consultez et téléchargez les données archivées de chaque année passée : ruchers, ruches installées et chiffre d'affaires.",
      },
      { property: "og:title", content: "Historique annuel · Ruchers IziGreen" },
      {
        property: "og:description",
        content:
          "Archives IziGreen clôturées chaque 1er janvier : CA annuel, ruches et ruchers, exportables en CSV.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { archives, hydrated } = useHiveStore();

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 rounded-xl">
            <Link to="/">
              <ArrowLeft className="size-4" /> Dashboard
            </Link>
          </Button>
          <h1 className="mt-2 font-display text-4xl font-semibold text-foreground md:text-5xl">
            Historique annuel
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Chaque 1<sup>er</sup> janvier, les données de l'année écoulée sont figées ici et
            restent téléchargeables au format CSV.
          </p>
        </div>
      </motion.header>

      <section className="mt-8 space-y-4">
        {hydrated && archives.length === 0 && (
          <div className="glass-card rounded-3xl px-6 py-16 text-center">
            <p className="font-display text-xl font-semibold text-foreground">
              Aucune année archivée pour l'instant
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              L'année {new Date().getFullYear()} est en cours : elle sera automatiquement
              archivée au 1<sup>er</sup> janvier {new Date().getFullYear() + 1}.
            </p>
          </div>
        )}

        {archives.map((archive, i) => (
          <motion.article
            key={archive.year}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-3xl p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Exercice clôturé
                </p>
                <h2 className="font-display text-3xl font-semibold text-foreground">
                  {archive.year}
                </h2>
              </div>
              <Button
                variant="honey"
                className="rounded-2xl"
                onClick={() => downloadArchive(archive)}
              >
                <Download className="size-4" /> Télécharger le CSV
              </Button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-background/70 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <TrendingUp className="size-3.5" /> CA annuel
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
                  {formatEuro(archive.revenue)}
                </p>
              </div>
              <div className="rounded-2xl bg-background/70 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <Hexagon className="size-3.5" /> Ruchers
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
                  {archive.apiaryCount}
                </p>
              </div>
              <div className="rounded-2xl bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Ruches installées
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">
                  {archive.hiveCount}
                </p>
              </div>
            </div>

            <div className="mt-4 divide-y divide-border/50 rounded-2xl border border-border/60">
              {archive.hives.map((h) => (
                <div
                  key={h.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-foreground">{h.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.client} · {h.site} · {placementLabel[h.placement]} · {h.hiveCount} ruche
                      {h.hiveCount > 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="font-display font-semibold tabular-nums text-foreground">
                    {formatEuro(h.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </motion.article>
        ))}
      </section>
    </main>
  );
}
