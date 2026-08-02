import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Meaningful empty state: illustration slot, guidance copy, primary action. */
export const EmptyState = memo(function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <span className="mb-4 grid size-12 place-items-center rounded-full bg-primary-muted text-primary">
          {icon}
        </span>
      )}
      <h3 className="text-section text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
});
