import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TEMPLATES, downloadAll, downloadOne, readWorkbook, validate, importTable, type TableKey } from "@/lib/schoolTemplates";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { createSchoolAdmin } from "@/lib/onboarding.functions";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboard a School — Vedaalay School OS" },
      { name: "description", content: "Create a school, its admin login, and import students and staff from Excel." },
      { property: "og:title", content: "Onboard a School — Vedaalay School OS" },
      { property: "og:description", content: "Create a school, its admin login, and import students and staff from Excel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OnboardingPage,
  ssr: false,
});

type School = { id: string; name: string; code: string };


const card = "bg-card border border-border rounded-2xl p-5 mb-5";
const input = "w-full border border-input bg-background rounded-lg px-3 py-2 text-sm";
const btn = "bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50";
const btn2 = "border border-border rounded-lg px-3 py-2 text-sm";

function OnboardingPage() {
  const [role, setRole] = useState<string | null | undefined>(undefined);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolId, setSchoolId] = useState("");

  const loadSchools = async () => {
    const { data } = await supabase.from("schools").select("id,name,code").order("created_at");
    setSchools(data ?? []);
    if (data?.length && !schoolId) setSchoolId(data[data.length - 1].id);
  };
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return setRole(null);
      const { data: p } = await supabase.from("profiles").select("role,school_id").eq("id", u.user.id).maybeSingle();
      setRole(p?.role ?? null);
      if (p?.role !== "superadmin" && p?.school_id) setSchoolId(p.school_id);
      loadSchools();
    })();
  }, []);

  if (role === undefined) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!role || !["superadmin", "admin"].includes(role))
    return <div className="p-8">Please <Link to="/" className="underline">sign in</Link> as the superadmin or a school admin to onboard data.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8">
      <Link to="/" className="text-sm text-muted-foreground">← Back to app</Link>
      <h1 className="text-2xl font-semibold mt-2 mb-1">Onboard a school</h1>
      <p className="text-sm text-muted-foreground mb-6">1. Create the school → 2. Create its admin login → 3. Import students and staff from Excel.</p>

      {role === "superadmin" && <CreateSchool onCreated={async (id) => { await loadSchools(); setSchoolId(id); }} />}

      <div className={card}>
        <label className="text-sm font-medium block mb-1">Working on school</label>
        <select className={input} value={schoolId} onChange={(e) => setSchoolId(e.target.value)} disabled={role !== "superadmin"}>
          {schools.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.code})</option>)}
        </select>
      </div>

      {schoolId && role === "superadmin" && <CreateAdmin schoolId={schoolId} />}
      {schoolId && <DataImport schoolId={schoolId} />}
    </div>
  );
}

function CreateSchool({ onCreated }: { onCreated: (id: string) => void }) {
  const [f, setF] = useState({ name: "", code: "", city: "", state: "", board: "", principal_name: "", phone: "", email: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  async function save() {
    if (!f.name.trim() || !f.code.trim()) return setMsg("Name and school code are required.");
    setBusy(true); setMsg("");
    const payload = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim() || null])) as typeof f;
    const { data, error } = await supabase.from("schools").insert({ ...payload, code: f.code.trim().toUpperCase() }).select("id").single();
    setBusy(false);
    if (error) return setMsg(error.message);
    setMsg("School created ✓");
    setF({ name: "", code: "", city: "", state: "", board: "", principal_name: "", phone: "", email: "" });
    onCreated(data.id);
  }
  return (
    <div className={card}>
      <h2 className="font-semibold mb-3">Step 1 — Create school</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <input className={input} placeholder="School name *" value={f.name} onChange={set("name")} />
        <input className={input} placeholder="School code * (e.g. OAKWD)" value={f.code} onChange={set("code")} />
        <input className={input} placeholder="City" value={f.city} onChange={set("city")} />
        <input className={input} placeholder="State" value={f.state} onChange={set("state")} />
        <input className={input} placeholder="Board (CBSE, ICSE…)" value={f.board} onChange={set("board")} />
        <input className={input} placeholder="Principal name" value={f.principal_name} onChange={set("principal_name")} />
        <input className={input} placeholder="Phone" value={f.phone} onChange={set("phone")} />
        <input className={input} placeholder="Email" value={f.email} onChange={set("email")} />
      </div>
      <div className="flex items-center gap-3 mt-3">
        <button className={btn} disabled={busy} onClick={save}>{busy ? "Creating…" : "Create school"}</button>
        <span className="text-sm text-muted-foreground">{msg}</span>
      </div>
    </div>
  );
}

function CreateAdmin({ schoolId }: { schoolId: string }) {
  const create = useServerFn(createSchoolAdmin);
  const [f, setF] = useState({ fullName: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true); setMsg("");
    try { await create({ data: { ...f, schoolId } }); setMsg(`Admin login created ✓ — ${f.email}`); setF({ fullName: "", email: "", password: "" }); }
    catch (e) { setMsg((e as Error).message); }
    setBusy(false);
  }
  return (
    <div className={card}>
      <h2 className="font-semibold mb-3">Step 2 — Create school admin login</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <input className={input} placeholder="Full name" value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} />
        <input className={input} placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className={input} placeholder="Password (min 8)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      </div>
      <div className="flex items-center gap-3 mt-3">
        <button className={btn} disabled={busy} onClick={save}>{busy ? "Creating…" : "Create admin"}</button>
        <span className="text-sm text-muted-foreground">{msg}</span>
      </div>
    </div>
  );
}

function DataImport({ schoolId }: { schoolId: string }) {
  const [data, setData] = useState<Partial<Record<TableKey, Record<string, unknown>[]>>>({});
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [dlBusy, setDlBusy] = useState(false);
  const [dlErr, setDlErr] = useState("");
  const errors = TEMPLATES.flatMap((t) => (data[t.key] ? validate(t.key, data[t.key]!) : []));
  const loaded = TEMPLATES.filter((t) => data[t.key]?.length);

  async function onFile(file: File, only?: TableKey) {
    const parsed = await readWorkbook(file, only);
    setData((d) => ({ ...d, ...parsed })); setLog([]);
  }
  async function run() {
    setBusy(true); const out: string[] = [];
    for (const t of loaded) {
      try { const c = await importTable(t.key, data[t.key]!, schoolId); out.push(`✓ ${t.label}: ${c} rows`); }
      catch (e) { out.push(`✗ ${t.label}: ${(e as Error).message}. Stopped here — earlier tables were saved.`); break; }
      setLog([...out]);
    }
    setLog(out); setBusy(false);
    if (!out.some((x) => x.startsWith("✗"))) setData({});
  }

  return (
    <div className={card}>
      <h2 className="font-semibold mb-1">Step 3 — Import school data from Excel</h2>
      <p className="text-xs text-muted-foreground mb-3">Every template matches a table in the system. Download the full workbook (one sheet per table), fill it, and upload it — all tables are filled in the right order. Or use single-table templates below.</p>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <button className={btn} disabled={dlBusy} onClick={async () => { setDlBusy(true); try { await downloadAll(); } catch (e) { setDlErr(`Download failed: ${(e as Error).message}`); } setDlBusy(false); }}>{dlBusy ? "Preparing…" : "Download full workbook"}</button>
        {dlErr && <span className="text-xs text-destructive">{dlErr}</span>}
        <label className={btn2 + " cursor-pointer"}>Upload filled workbook
          <input type="file" hidden accept=".xlsx,.xls" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
        </label>
      </div>
      <div className="border border-border rounded-lg divide-y divide-border">
        {TEMPLATES.map((t, i) => (
          <div key={t.key} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">
            <span className="w-6 text-muted-foreground">{i + 1}.</span>
            <div className="flex-1 min-w-40">
              <div className="font-medium">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.columns.join(", ")}</div>
            </div>
            {data[t.key] && <span className="text-xs text-primary">{data[t.key]!.length} rows ready</span>}
            <button className={btn2} onClick={() => downloadOne(t.key)}>Template</button>
            <label className={btn2 + " cursor-pointer"}>Upload
              <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f, t.key); e.target.value = ""; }} />
            </label>
          </div>
        ))}
      </div>
      {errors.length > 0 && <ul className="text-xs text-destructive mt-3">{errors.slice(0, 10).map((p) => <li key={p}>{p}</li>)}</ul>}
      {loaded.length > 0 && (
        <button className={`${btn} mt-3`} disabled={busy || errors.length > 0} onClick={run}>
          {busy ? "Importing…" : `Import ${loaded.map((t) => t.label).join(", ")}`}
        </button>
      )}
      {log.length > 0 && <ul className="text-sm mt-3 space-y-1">{log.map((l) => <li key={l} className={l.startsWith("✗") ? "text-destructive" : ""}>{l}</li>)}</ul>}
    </div>
  );
}
