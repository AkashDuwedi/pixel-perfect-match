import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Page/section heading with description and right-aligned actions. */
export const SectionHeader = memo(function SectionHeader({
  title,
  description,
  actions,
  level = "page",
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  level?: "page" | "section";
  className?: string;
}) {
  return (
    <header
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {level === "page" ? (
          <h1 className="truncate text-title text-foreground sm:text-display">{title}</h1>
        ) : (
          <h2 className="truncate text-section text-foreground">{title}</h2>
        )}
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
});
