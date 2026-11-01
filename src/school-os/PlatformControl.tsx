// Superadmin control centre: live platform numbers, growth, activity, per-school drill-down, quick actions.
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Building2, Users, Briefcase, IndianRupee, Activity, KeyRound, Power, PlusCircle, RefreshCw, ShieldCheck, Search, Download, UserPlus, GraduationCap, Wallet, ChevronDown } from "lucide-react";
import { getPlatformStats, getPlatformPulse } from "@/lib/platform.functions";

type Stats = Awaited<ReturnType<typeof getPlatformStats>>;
type Pulse = Awaited<ReturnType<typeof getPlatformPulse>>;
type SchoolRow = Stats["schools"][number];
const rs = (n: number) => `Rs ${Math.round(n).toLocaleString("en-IN")}`;

const PLAN_LABEL: Record<string, string> = { trial: "Trial", starter: "Starter", standard: "Standard", premium: "Premium" };
const STATUS_LABEL: Record<string, string> = { trialing: "Trialing", active: "Active", past_due: "Past due", suspended: "Suspended" };

export function PlatformControl({ onNavigate, onAddSchool }: { onNavigate: (v: string) => void; onAddSchool: () => void }) {
  const fetchStats = useServerFn(getPlatformStats);
  const fetchPulse = useServerFn(getPlatformPulse);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  const [openSchool, setOpenSchool] = useState<string | null>(null);

  async function load() {
    setErr("");
    try {
      setStats(await fetchStats());
      setPulse(await fetchPulse());
    } catch (e) { setErr((e as Error).message); }
  }
  useEffect(() => { load(); }, []);

  const t = stats?.totals;
  const rate = t && t.billed ? Math.round((t.collected / t.billed) * 100) : 0;
  const list = (stats?.schools ?? []).filter((s) =>
    (filter === "all" || (filter === "online" ? s.is_active : !s.is_active)) &&
    (s.name + s.code + (s.city ?? "")).toLowerCase().includes(q.toLowerCase()));
  const maxRole = Math.max(1, ...Object.values(stats?.roles ?? {}));
  const growth = pulse?.growth ?? [];
  const maxGrowth = Math.max(1, ...growth.map((g) => g.students + g.logins));

  const kpis = [
    { label: "Schools", value: t ? `${t.online}/${t.schools} online` : "…", icon: Building2 },
    { label: "Students", value: t?.students.toLocaleString("en-IN") ?? "…", icon: GraduationCap },
    { label: "Staff", value: t?.staff.toLocaleString("en-IN") ?? "…", icon: Briefcase },
    { label: "Logins", value: t?.users.toLocaleString("en-IN") ?? "…", icon: ShieldCheck },
    { label: "New logins · 7 days", value: t ? `+${t.newLogins7d}` : "…", icon: UserPlus },
    { label: "Fees collected", value: t ? `${rs(t.collected)} (${rate}%)` : "…", icon: Wallet },
    { label: "Attendance today", value: t ? (t.attendanceMarked ? `${Math.round((t.present / t.attendanceMarked) * 100)}% present` : "Not marked") : "…", icon: Activity },
  ];
  const actions = [
    { label: "Onboard school", icon: PlusCircle, go: onAddSchool },
    { label: "Manage schools", icon: Power, go: () => onNavigate("manage-schools") },
    { label: "Access & Logins", icon: KeyRound, go: () => onNavigate("access") },
    { label: "Billing", icon: IndianRupee, go: () => onNavigate("billing") },
  ];

  function exportCsv() {
    if (!stats) return;
    const head = ["School", "Code", "City", "Status", "Plan", "Subscription", "Students", "Staff", "Logins", "Classes", "Fees billed", "Fees collected", "Attendance today", "Onboarded on"];
    const lines = stats.schools.map((s) => [
      s.name, s.code, s.city ?? "", s.is_active ? "Online" : "Offline",
      s.subscription_plan ?? "", s.subscription_status ?? "",
      s.students, s.staff, s.users, s.classes, s.billed, s.collected,
      s.attendanceToday ?? "", (s.created_at ?? "").slice(0, 10),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `vedaalay-platform-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="max-w-6xl mb-8 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Control Centre</h1>
          <p className="text-sm text-muted-foreground">Live numbers, growth and activity from every school on Vedaalay</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} disabled={!stats} className="border border-border rounded-lg px-3 py-2 text-sm inline-flex items-center gap-1.5 text-foreground disabled:opacity-50"><Download size={14} /> Export CSV</button>
          <button onClick={load} className="border border-border rounded-lg px-3 py-2 text-sm inline-flex items-center gap-1.5 text-foreground"><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>
      {err && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
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
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground text-sm">Growth · last 30 days</h3>
            <div className="flex gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> Students</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Logins</span>
            </div>
          </div>
          <div className="flex items-end gap-[3px] h-28">
            {growth.map((g) => (
              <div key={g.date} className="flex-1 flex flex-col justify-end gap-[2px] group relative" title={`${g.date.slice(5)} · ${g.students} students · ${g.logins} logins`}>
                <div className="rounded-t-sm bg-amber-500/80" style={{ height: `${(g.logins / maxGrowth) * 100}%`, minHeight: g.logins ? 3 : 0 }} />
                <div className="rounded-t-sm bg-primary/80" style={{ height: `${(g.students / maxGrowth) * 100}%`, minHeight: g.students ? 3 : 0 }} />
              </div>
            ))}
            {growth.length === 0 && <div className="text-sm text-muted-foreground">Loading…</div>}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground"><span>{growth[0]?.date.slice(5)}</span><span>Today</span></div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-semibold text-foreground text-sm mb-3">Logins by role</h3>
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {Object.entries(stats?.roles ?? {}).sort((a, b) => b[1] - a[1]).map(([r, n]) => (
              <div key={r} className="text-xs">
                <div className="flex justify-between text-foreground capitalize"><span>{r}</span><span>{n}</span></div>
                <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(n / maxRole) * 100}%` }} /></div>
              </div>
            ))}
            {!stats && <div className="text-xs text-muted-foreground">Loading…</div>}
          </div>
          <h3 className="font-semibold text-foreground text-sm mt-5 mb-2">Fee collection</h3>
          <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${rate}%` }} /></div>
          <div className="mt-1 text-xs text-muted-foreground">{t ? `${rs(t.collected)} of ${rs(t.billed)} · ${rs(t.billed - t.collected)} outstanding` : "…"}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
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
                {["School", "Status", "Plan", "Students", "Fees", "Today"].map((h) => <th key={h} className="font-medium px-3 py-2">{h}</th>)}
              </tr></thead>
              <tbody>
                {!stats && <tr><td colSpan={6} className="px-3 py-4 text-muted-foreground">Loading…</td></tr>}
                {stats && list.length === 0 && <tr><td colSpan={6} className="px-3 py-4 text-muted-foreground">No schools match.</td></tr>}
                {list.map((s) => {
                  const open = openSchool === s.id;
                  return (
                    <>
                      <tr key={s.id} onClick={() => setOpenSchool(open ? null : s.id)} className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50">
                        <td className="px-3 py-2"><div className="font-medium text-foreground flex items-center gap-1">{s.name}<ChevronDown size={13} className={"text-muted-foreground transition-transform " + (open ? "rotate-180" : "")} /></div><div className="text-xs text-muted-foreground">{s.code}{s.city ? ` · ${s.city}` : ""}</div></td>
                        <td className="px-3 py-2"><span className={"rounded-full px-2 py-0.5 text-[11px] " + (s.is_active ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}>{s.is_active ? "Online" : "Offline"}</span></td>
                        <td className="px-3 py-2 text-foreground capitalize text-xs">{PLAN_LABEL[s.subscription_plan ?? ""] ?? s.subscription_plan ?? "—"}</td>
                        <td className="px-3 py-2 text-foreground">{s.students}</td>
                        <td className="px-3 py-2 text-foreground whitespace-nowrap">{rs(s.collected)} / {rs(s.billed)}</td>
                        <td className="px-3 py-2 text-foreground">{s.attendanceToday === null ? "—" : `${s.attendanceToday}%`}</td>
                      </tr>
                      {open && (
                        <tr key={s.id + "-d"} className="bg-muted/40 border-b border-border">
                          <td colSpan={6} className="px-4 py-3">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              {[
                                ["Students", s.students], ["Staff", s.staff], ["Logins", s.users], ["Classes", s.classes],
                                ["Fees billed", rs(s.billed)], ["Collected", rs(s.collected)], ["Outstanding", rs(s.billed - s.collected)],
                                ["Attendance today", s.attendanceToday === null ? "—" : `${s.attendanceToday}%`],
                                ["Subscription", STATUS_LABEL[s.subscription_status ?? ""] ?? s.subscription_status ?? "—"],
                                ["Onboarded", (s.created_at ?? "").slice(0, 10)],
                              ].map(([k, v]) => (
                                <div key={String(k)}><div className="text-muted-foreground">{k}</div><div className="text-foreground font-medium">{v}</div></div>
                              ))}
                            </div>
                            <div className="mt-3 text-[11px] text-muted-foreground">Open <button className="underline" onClick={(e) => { e.stopPropagation(); onNavigate("manage-schools"); }}>Manage schools</button> to change this school's plan, pause access or remove it.</div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-semibold text-foreground text-sm mb-3">Recent activity</h3>
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {(pulse?.events ?? []).map((e) => (
              <div key={e.id} className="flex gap-2.5 text-xs">
                <span className={"mt-1 w-1.5 h-1.5 rounded-full shrink-0 " + (e.kind === "fee" ? "bg-amber-500" : e.kind === "school" ? "bg-primary" : e.kind === "student" ? "bg-emerald-500" : "bg-slate-400")} />
                <div className="min-w-0">
                  <div className="text-foreground font-medium">{e.label}</div>
                  <div className="text-muted-foreground truncate">{e.detail}{e.school ? ` · ${e.school}` : ""}</div>
                  <div className="text-[10px] text-muted-foreground">{new Date(e.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}{String(e.at).includes(":") ? ` · ${new Date(e.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}</div>
                </div>
              </div>
            ))}
            {!pulse && <div className="text-xs text-muted-foreground">Loading…</div>}
            {pulse && pulse.events.length === 0 && <div className="text-xs text-muted-foreground">No recent events.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
