// Access & Logins screen — school admins generate logins for staff, parents
// and students. Each invite emails a set-password link; the person sets their
// own password and lands back on the app.
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { KeyRound, MailCheck, RefreshCw } from "lucide-react";
import { getAccessOverview, inviteLogin, type AccessPerson } from "@/lib/access.functions";

const STAFF_ROLE_OPTIONS = [
  { value: "principal", label: "Principal" },
  { value: "coordinator", label: "Coordinator" },
  { value: "counselor", label: "Counselor" },
  { value: "teacher", label: "Teacher" },
  { value: "receptionist", label: "Receptionist" },
  { value: "accounts", label: "Accounts" },
  { value: "hr", label: "HR" },
];

const card = "bg-card border border-border rounded-2xl p-5 mb-5";
const input = "w-full border border-input bg-background rounded-lg px-3 py-2 text-sm";
const btn = "bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2";
const btn2 = "border border-border rounded-lg px-3 py-2 text-sm";

type Group = "staff" | "guardian" | "student";

export function AccessScreen({
  schoolId,
  schools = [],
  isSuperadmin = false,
}: {
  schoolId: string | null;
  schools?: { id: string; name: string; code: string }[];
  isSuperadmin?: boolean;
}) {
  const fetchOverview = useServerFn(getAccessOverview);
  const inviteFn = useServerFn(inviteLogin);

  const [overview, setOverview] = useState<Awaited<ReturnType<typeof getAccessOverview>> | null>(null);
  const [error, setError] = useState("");
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [staffRoles, setStaffRoles] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState(schoolId ?? "");

  async function refresh() {
    try {
      const o = await fetchOverview();
      setOverview(o);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => { refresh(); }, []);

  if (error) return <div className="p-8 text-destructive">{error}</div>;
  if (!overview) return <div className="p-8 text-muted-foreground">Loading…</div>;

  const filterBySchool = (rows: AccessPerson[]) =>
    isSuperadmin && selectedSchool ? rows.filter((r) => r.schoolId === selectedSchool) : rows;
  const staff = filterBySchool(overview.staff);
  const guardians = filterBySchool(overview.guardians);
  const students = filterBySchool(overview.students);

  async function invite(p: AccessPerson, kind: Group) {
    const email = (emails[p.id] ?? p.email ?? "").trim();
    if (!email) { setLog((l) => [`✗ ${p.name}: enter an email first`, ...l]); return; }
    setBusyId(p.id);
    try {
      await inviteFn({
        data: {
          kind,
          id: p.id,
          email,
          role: kind === "staff" ? (staffRoles[p.id] || "teacher") : undefined,
        } as never,
      });
      setLog((l) => [`✓ ${p.name} — invite emailed to ${email}`, ...l]);
      await refresh();
    } catch (e) {
      setLog((l) => [`✗ ${p.name}: ${(e as Error).message}`, ...l]);
    }
    setBusyId(null);
  }

  async function inviteAll(rows: AccessPerson[], kind: Group) {
    const targets = rows.filter((r) => !r.profileId && (emails[r.id] ?? r.email ?? "").trim());
    if (targets.length === 0) { setLog((l) => ["Nothing to invite — add emails first", ...l]); return; }
    for (const t of targets) await invite(t, kind);
  }

  const renderRow = (p: AccessPerson, kind: Group, extra?: React.ReactNode) => (
    <div key={p.id} className="flex flex-wrap items-center gap-2 px-3 py-2.5 text-sm">
      <div className="flex-1 min-w-44">
        <div className="font-medium text-foreground flex items-center gap-2">
          {p.name}
          {p.profileId ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-primary">Login active</span>
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">No login yet</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{p.subtitle}</div>
      </div>
      {extra}
      {p.profileId ? (
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><MailCheck size={14} /> {p.email}</span>
      ) : (
        <>
          <input
            className={input + " max-w-56"}
            placeholder="email@example.com"
            value={emails[p.id] ?? p.email ?? ""}
            onChange={(e) => setEmails((m) => ({ ...m, [p.id]: e.target.value }))}
          />
          <button className={btn2} disabled={busyId === p.id} onClick={() => invite(p, kind)}>
            {busyId === p.id ? "Sending…" : "Send invite"}
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 mb-1">
        <KeyRound className="text-primary" size={20} />
        <h1 className="text-xl font-semibold text-foreground">Access &amp; Logins</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Send an invite and the person gets an email with a link to set their own password. Their menus and
        permissions come automatically from their role. Invited staff, parents and students only ever see your school's data.
      </p>

      {isSuperadmin && schools.length > 0 && (
        <div className={card}>
          <label className="text-sm font-medium block mb-1">School</label>
          <select className={input} value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
            <option value="">All schools</option>
            {schools.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
        </div>
      )}

      <div className={card}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-foreground">Staff logins ({staff.filter((s) => !s.profileId).length} pending)</h2>
          <button className={btn2} onClick={() => inviteAll(staff, "staff")}>Invite all with email</button>
        </div>
        <div className="border border-border rounded-lg divide-y divide-border">
          {staff.length === 0 && <div className="px-3 py-4 text-sm text-muted-foreground">No staff imported yet — use Onboarding → Import from Excel.</div>}
          {staff.map((s) => renderRow(s, "staff",
            <select
              className={input + " max-w-36"}
              value={staffRoles[s.id] ?? "teacher"}
              onChange={(e) => setStaffRoles((m) => ({ ...m, [s.id]: e.target.value }))}
            >
              {STAFF_ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          ))}
        </div>
      </div>

      <div className={card}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-foreground">Parent logins ({guardians.filter((g) => !g.profileId).length} pending)</h2>
          <button className={btn2} onClick={() => inviteAll(guardians, "guardian")}>Invite all with email</button>
        </div>
        <div className="border border-border rounded-lg divide-y divide-border">
          {guardians.length === 0 && <div className="px-3 py-4 text-sm text-muted-foreground">No guardians imported yet.</div>}
          {guardians.map((g) => renderRow(g, "guardian"))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Parents see only their own child's attendance, homework and fees.</p>
      </div>

      <div className={card}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-foreground">Student logins ({students.filter((s) => !s.profileId).length} pending)</h2>
          <button className={btn2} onClick={() => inviteAll(students, "student")}>Invite all with email</button>
        </div>
        <div className="border border-border rounded-lg divide-y divide-border">
          {students.length === 0 && <div className="px-3 py-4 text-sm text-muted-foreground">No students imported yet.</div>}
          {students.map((s) => renderRow(s, "student"))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">For younger students, use the parent's email — or a school-managed email for seniors.</p>
      </div>

      {log.length > 0 && (
        <div className={card}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-foreground">Invite log</h2>
            <button className={btn2 + " inline-flex items-center gap-1"} onClick={refresh}><RefreshCw size={14} /> Refresh</button>
          </div>
          <ul className="text-sm space-y-1">
            {log.map((l, i) => <li key={i} className={l.startsWith("✗") ? "text-destructive" : "text-foreground"}>{l}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
