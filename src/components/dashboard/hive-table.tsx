import { AnimatePresence, motion } from "motion/react";
import { Hexagon } from "lucide-react";

import { EngagementRing } from "./engagement-ring";
import {
  engagementProgress,
  formatEuro,
  monthsRemaining,
  placementLabel,
  statusLabel,
  type Hive,
} from "@/lib/hives";
import { cn } from "@/lib/utils";

const statusStyles: Record<Hive["status"], string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-accent text-accent-foreground",
  renewal: "bg-honey-soft text-honey-foreground",
};

export function HiveTable({ hives }: { hives: Hive[] }) {
  return (
    <div className="glass-card overflow-hidden rounded-3xl">
      <div className="hidden grid-cols-[1.6fr_1.2fr_1fr_1.4fr_0.8fr] gap-4 border-b border-border/60 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
        <span>Rucher</span>
        <span>Client</span>
        <span>CA annuel</span>
        <span>Engagement 3 ans</span>
        <span className="text-right">Statut</span>
      </div>

      <div className="divide-y divide-border/50">
        <AnimatePresence initial={false} mode="popLayout">
          {hives.map((hive, i) => {
            const progress = engagementProgress(hive.startDate);
            return (
              <motion.div
                key={hive.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.32, delay: Math.min(i * 0.03, 0.2), ease: [0.22, 1, 0.36, 1] }}
                className="group grid grid-cols-1 gap-4 px-6 py-4 transition-colors duration-300 hover:bg-accent/40 md:grid-cols-[1.6fr_1.2fr_1fr_1.4fr_0.8fr] md:items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <Hexagon className="size-4" />
                  </span>
                  <div className="leading-tight">
                    <p className="font-semibold text-foreground">{hive.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {hive.site} · {hive.hiveCount} ruche{hive.hiveCount > 1 ? "s" : ""} · {placementLabel[hive.placement]}
                    </p>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="text-foreground">{hive.client}</p>
                  <p className="text-xs text-muted-foreground">{hive.region}</p>
                </div>

                <p className="font-display text-lg font-semibold tabular-nums text-foreground">
                  {formatEuro(hive.revenue)}
                </p>

                <EngagementRing
                  progress={progress}
                  size={44}
                  label={`${monthsRemaining(hive.startDate)} mois restants`}
                  sublabel={`Depuis le ${new Date(hive.startDate).toLocaleDateString("fr-FR")}`}
                />

                <div className="md:text-right">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                      statusStyles[hive.status],
                    )}
                  >
                    {statusLabel[hive.status]}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {hives.length === 0 && (
          <p className="px-6 py-14 text-center text-sm text-muted-foreground">
            Aucune ruche pour le moment · ajoutez votre première ruche pour démarrer.
          </p>
        )}
      </div>
    </div>
  );
}
