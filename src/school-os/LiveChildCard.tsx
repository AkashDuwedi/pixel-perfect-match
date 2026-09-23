import { useMyChild } from "@/hooks/useMyChild";

export function LiveChildCard() {
  const d = useMyChild(true);
  if (!d) return null;
  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[12px] uppercase tracking-wide text-muted-foreground">Live from school records</p>
          <p className="text-[15px] font-semibold text-foreground">{d.name} · {d.classLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-[22px] font-semibold text-primary">{d.percent === null ? "—" : `${d.percent}%`}</p>
          <p className="text-[12px] text-muted-foreground">Attendance (30 days) · {d.present}/{d.total}</p>
        </div>
      </div>
      <div className="mt-3">
        <p className="mb-1.5 text-[12.5px] font-medium text-foreground">Today's classes</p>
        {d.today.length === 0 ? (
          <p className="text-[12.5px] text-muted-foreground">No classes scheduled.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {d.today.map((t) => (
              <span key={t.period} className="rounded-lg bg-muted px-2.5 py-1 text-[12.5px] text-foreground">
                P{t.period} · {t.subject}{t.time ? ` · ${t.time}` : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
