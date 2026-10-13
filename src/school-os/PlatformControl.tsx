// Superadmin control centre: live platform numbers, per-school health, quick actions.
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Building2, Users, Briefcase, IndianRupee, Activity, KeyRound, Power, PlusCircle, RefreshCw, ShieldCheck, Search } from "lucide-react";
import { getPlatformStats } from "@/lib/platform.functions";

type Stats = Awaited<ReturnType<typeof getPlatformStats>>;
const rs = (n: number) => `Rs ${Math.round(n).toLocaleString("en-IN")}`;

export function PlatformControl({ onNavigate, onAddSchool }: { onNavigate: (v: string) => void; onAddSchool: () => void }) {
  const fetchStats = useServerFn(getPlatformStats);
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");

  async function load() {
    setErr("");
    try { setStats(await fetchStats()); } catch (e) { setErr((e as Error).message); }
  }
  useEffect(() => { load(); }, []);

  const t = stats?.totals;
  const rate = t && t.billed ? Math.round((t.collected / t.billed) * 100) : 0;
  const list = (stats?.schools ?? []).filter((s) =>
    (filter === "all" || (filter === "online" ? s.is_active : !s.is_active)) &&
    (s.name + s.code + (s.city ?? "")).toLowerCase().includes(q.toLowerCase()));
  const maxRole = Math.max(1, ...Object.values(stats?.roles ?? {}));

  const kpis = [
    { label: "Schools", value: t ? `${t.online}/${t.schools} online` : "…", icon: Building2 },
    { label: "Students", value: t?.students.toLocaleString("en-IN") ?? "…", icon: Users },
    { label: "Staff", value: t?.staff.toLocaleString("en-IN") ?? "…", icon: Briefcase },
    { label: "Logins", value: t?.users.toLocaleString("en-IN") ?? "…", icon: ShieldCheck },
    { label: "Fees collected", value: t ? `${rs(t.collected)} (${rate}%)` : "…", icon: IndianRupee },
    { label: "Attendance today", value: t ? (t.attendanceMarked ? `${Math.round((t.present / t.attendanceMarked) * 100)}% present` : "Not marked") : "…", icon: Activity },
  ];
  const actions = [
    { label: "Onboard school", icon: PlusCircle, go: onAddSchool },
    { label: "Manage schools", icon: Power, go: () => onNavigate("manage-schools") },
    { label: "Access & Logins", icon: KeyRound, go: () => onNavigate("access") },
    { label: "Billing", icon: IndianRupee, go: () => onNavigate("billing") },
  ];

  return (
    <div className="max-w-6xl mb-8 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Control Centre</h1>
          <p className="text-sm text-muted-foreground">Live numbers from every school on Vedaalay</p>
        </div>
        <button onClick={load} className="border border-border rounded-lg px-3 py-2 text-sm inline-flex items-center gap-1.5 text-foreground"><RefreshCw size={14} /> Refresh</button>
      </div>
      {err && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-card border border-border rounded-2xl p-4">
            <k.icon size={16} className="text-primary" />
            <div className="mt-2 text-xs text-muted-foreground">{k.label}</div>
            <div className="text-base font-semibold text-foreground">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((a) => (
          <button key={a.label} onClick={a.go} className="bg-card border border-border rounded-2xl p-4 text-left hover:border-primary transition-colors">
            <a.icon size={18} className="text-primary" />
            <div className="mt-2 text-sm font-medium text-foreground">{a.label}</div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm flex-1">School health</h3>
            <div className="flex items-center gap-1 border border-border rounded-lg px-2">
              <Search size={13} className="text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="bg-transparent py-1.5 text-sm outline-none w-28 text-foreground" />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="border border-border rounded-lg px-2 py-1.5 text-sm bg-card text-foreground">
              <option value="all">All</option><option value="online">Online</option><option value="offline">Offline</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="text-xs text-muted-foreground border-b border-border">
                {["School", "Status", "Students", "Staff", "Logins", "Fees", "Today"].map((h) => <th key={h} className="font-medium px-3 py-2">{h}</th>)}
              </tr></thead>
              <tbody>
                {!stats && <tr><td colSpan={7} className="px-3 py-4 text-muted-foreground">Loading…</td></tr>}
                {stats && list.length === 0 && <tr><td colSpan={7} className="px-3 py-4 text-muted-foreground">No schools match.</td></tr>}
                {list.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2"><div className="font-medium text-foreground">{s.name}</div><div className="text-xs text-muted-foreground">{s.code}{s.city ? ` · ${s.city}` : ""}</div></td>
                    <td className="px-3 py-2"><span className={"rounded-full px-2 py-0.5 text-[11px] " + (s.is_active ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}>{s.is_active ? "Online" : "Offline"}</span></td>
                    <td className="px-3 py-2 text-foreground">{s.students}</td>
                    <td className="px-3 py-2 text-foreground">{s.staff}</td>
                    <td className="px-3 py-2 text-foreground">{s.users}</td>
                    <td className="px-3 py-2 text-foreground whitespace-nowrap">{rs(s.collected)} / {rs(s.billed)}</td>
                    <td className="px-3 py-2 text-foreground">{s.attendanceToday === null ? "—" : `${s.attendanceToday}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-semibold text-foreground text-sm mb-3">Logins by role</h3>
          <div className="space-y-2">
            {Object.entries(stats?.roles ?? {}).sort((a, b) => b[1] - a[1]).map(([r, n]) => (
              <div key={r} className="text-xs">
                <div className="flex justify-between text-foreground capitalize"><span>{r}</span><span>{n}</span></div>
                <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(n / maxRole) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-foreground text-sm mt-5 mb-2">Fee collection</h3>
          <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${rate}%` }} /></div>
          <div className="mt-1 text-xs text-muted-foreground">{t ? `${rs(t.collected)} of ${rs(t.billed)} · ${rs(t.billed - t.collected)} outstanding` : "…"}</div>
        </div>
      </div>
    </div>
  );
}
