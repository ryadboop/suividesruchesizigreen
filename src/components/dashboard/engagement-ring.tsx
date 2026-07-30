import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  progress: number; // 0 → 1
  size?: number;
  label?: string;
  sublabel?: string;
  className?: string;
};

export function EngagementRing({ progress, size = 48, label, sublabel, className }: Props) {
  const stroke = size >= 80 ? 8 : 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.round(progress * 100);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            className="stroke-accent"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            className={pct >= 80 ? "stroke-honey" : "stroke-primary"}
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - c * progress }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-display font-semibold text-foreground"
          style={{ fontSize: size / 4 }}
        >
          {pct}%
        </span>
      </div>
      {(label || sublabel) && (
        <div className="leading-tight">
          {label && <p className="text-sm font-semibold text-foreground">{label}</p>}
          {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}
