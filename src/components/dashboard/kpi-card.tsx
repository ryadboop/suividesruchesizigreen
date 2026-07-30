import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
  trend?: string;
  accent?: "forest" | "honey";
  delay?: number;
};

export function KpiCard({ icon, label, value, hint, trend, accent = "forest", delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      className="glass-card group relative overflow-hidden rounded-3xl p-5 transition-shadow duration-300 hover:shadow-[var(--shadow-lifted)]"
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70",
          accent === "honey" ? "bg-honey/40" : "bg-primary/25",
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-2xl",
            accent === "honey"
              ? "gradient-honey text-honey-foreground shadow-[var(--shadow-honey)]"
              : "gradient-forest text-primary-foreground",
          )}
        >
          {icon}
        </span>
        {trend && (
          <span className="rounded-full bg-honey-soft px-2.5 py-1 text-xs font-semibold text-honey-foreground">
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 font-display text-3xl font-semibold tabular-nums text-foreground">
        {value}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </motion.div>
  );
}
