import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const dotTone: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-muted-foreground",
};

export interface StatusBadgeProps {
  tone?: StatusTone;
  label: string;
  withDot?: boolean;
  className?: string;
}

/** Consistent status pill used across tables, cards and detail headers. */
export const StatusBadge = memo(function StatusBadge({
  tone = "neutral",
  label,
  withDot = true,
  className,
}: StatusBadgeProps) {
  return (
    <Badge variant={tone} className={cn("gap-1.5 rounded-full px-2.5 py-0.5", className)}>
      {withDot && <span className={cn("size-1.5 rounded-full", dotTone[tone])} aria-hidden="true" />}
      {label}
    </Badge>
  );
});
