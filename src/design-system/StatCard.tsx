import { memo, type ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./AnimatedNumber";

export interface StatCardProps {
  label: string;
  value: number | string;
  format?: (n: number) => string;
  icon?: ReactNode;
  /** Percentage change vs previous period. Positive = up. */
  delta?: number;
  deltaLabel?: string;
  /** Set true when an increase is bad (e.g. absentees). */
  invertDelta?: boolean;
  footer?: ReactNode;
  className?: string;
}

/** Premium KPI card: micro-label, animated metric, trend indicator, hover lift. */
export const StatCard = memo(function StatCard({
  label,
  value,
  format,
  icon,
  delta,
  deltaLabel,
  invertDelta = false,
  footer,
  className,
}: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  const good = invertDelta ? !positive : positive;
  const TrendIcon = positive ? TrendingUp : TrendingDown;

  return (
    <div className={cn("ds-card-interactive p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="ds-label">{label}</p>
        {icon && (
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-muted text-primary">
            {icon}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end gap-3">
        <span className="text-metric text-foreground">
          {typeof value === "number" ? <AnimatedNumber value={value} format={format} /> : value}
        </span>
        {typeof delta === "number" && (
          <span
            className={cn(
              "mb-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-semibold",
              good ? "bg-success-muted text-success" : "bg-danger-muted text-danger",
            )}
          >
            <TrendIcon className="size-3.5" aria-hidden="true" />
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>

      {(deltaLabel || footer) && (
        <div className="mt-2 text-xs text-muted-foreground">{footer ?? deltaLabel}</div>
      )}
    </div>
  );
});
