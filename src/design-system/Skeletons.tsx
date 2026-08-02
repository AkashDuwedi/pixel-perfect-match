import { memo } from "react";
import { cn } from "@/lib/utils";

/** Shimmering placeholder block. Prefer this over spinners. */
export const SkeletonBlock = memo(function SkeletonBlock({
  className,
}: {
  className?: string;
}) {
  return <div className={cn("ds-skeleton h-4 w-full", className)} aria-hidden="true" />;
});

/** Skeleton matching the StatCard footprint. */
export const SkeletonStatCard = memo(function SkeletonStatCard() {
  return (
    <div className="ds-card p-5">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="mt-4 h-8 w-32" />
      <SkeletonBlock className="mt-3 h-3 w-20" />
    </div>
  );
});

/** Skeleton matching a data table body. */
export const SkeletonTable = memo(function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="ds-card divide-y divide-border overflow-hidden" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <SkeletonBlock className="size-8 rounded-full" />
          <SkeletonBlock className="h-3 w-1/4" />
          <SkeletonBlock className="h-3 w-1/6" />
          <SkeletonBlock className="ml-auto h-3 w-16" />
        </div>
      ))}
    </div>
  );
});
