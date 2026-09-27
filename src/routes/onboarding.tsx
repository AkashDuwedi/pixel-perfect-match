import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
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
type Row = Record<string, unknown>;

const STUDENT_COLS = ["full_name", "admission_number", "class", "section", "roll_number", "date_of_birth", "gender", "guardian_name", "guardian_phone", "guardian_email"];
const STAFF_COLS = ["full_name", "employee_code", "designation", "department", "subject", "phone", "email", "joining_date"];

const card = "bg-card border border-border rounded-2xl p-5 mb-5";
const input = "w-full border border-input bg-background rounded-lg px-3 py-2 text-sm";
const btn = "bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50";
const btn2 = "border border-border rounded-lg px-3 py-2 text-sm";

const s = (v: unknown) => (v === undefined || v === null ? "" : String(v).trim());
const norm = (r: Row) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k.toLowerCase().trim().replace(/\s+/g, "_"), v]));
function toDate(v: unknown) {
  if (typeof v === "number") { const d = XLSX.SSF.parse_date_code(v); return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`; }
  const t = s(v); return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : null;
}

function downloadTemplate(cols: string[], name: string) {
  const ws = XLSX.utils.aoa_to_sheet([cols]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, name);
}

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
      {schoolId && <Importer kind="students" schoolId={schoolId} />}
      {schoolId && <Importer kind="staff" schoolId={schoolId} />}
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

function Importer({ kind, schoolId }: { kind: "students" | "staff"; schoolId: string }) {
  const cols = kind === "students" ? STUDENT_COLS : STAFF_COLS;
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(file: File) {
    const wb = XLSX.read(await file.arrayBuffer());
    const data = XLSX.utils.sheet_to_json<Row>(wb.Sheets[wb.SheetNames[0]], { defval: "" }).map(norm);
    setRows(data); setMsg(`${data.length} rows ready to import`);
  }
  const problems = rows.map((r, i) => {
    if (!s(r.full_name)) return `Row ${i + 2}: missing full_name`;
    if (kind === "students" && !s(r.admission_number)) return `Row ${i + 2}: missing admission_number`;
    if (kind === "staff" && !s(r.employee_code)) return `Row ${i + 2}: missing employee_code`;
    return null;
  }).filter(Boolean) as string[];

  async function run() {
    setBusy(true); setMsg("Importing…");
    try {
      if (kind === "staff") {
        const payload = rows.map((r) => ({
          school_id: schoolId, full_name: s(r.full_name), employee_code: s(r.employee_code),
          designation: s(r.designation) || null, department: s(r.department) || null, subject: s(r.subject) || null,
          phone: s(r.phone) || null, email: s(r.email) || null, joining_date: toDate(r.joining_date),
        }));
        const { error } = await supabase.from("staff").insert(payload);
        if (error) throw error;
        setMsg(`Imported ${payload.length} staff ✓`);
      } else {
        // Ensure classes & sections exist
        const { data: cls } = await supabase.from("classes").select("id,name").eq("school_id", schoolId);
        const classMap = new Map((cls ?? []).map((c) => [c.name.toLowerCase(), c.id]));
        for (const name of new Set(rows.map((r) => s(r.class)).filter(Boolean))) {
          if (classMap.has(name.toLowerCase())) continue;
          const g = parseInt(name.replace(/\D/g, ""), 10);
          const { data, error } = await supabase.from("classes").insert({ school_id: schoolId, name, grade_level: isNaN(g) ? null : g }).select("id").single();
          if (error) throw error;
          classMap.set(name.toLowerCase(), data.id);
        }
        const { data: secs } = await supabase.from("sections").select("id,name,class_id").eq("school_id", schoolId);
        const secMap = new Map((secs ?? []).map((x) => [`${x.class_id}|${x.name.toLowerCase()}`, x.id]));
        for (const r of rows) {
          const cid = classMap.get(s(r.class).toLowerCase()); const sn = s(r.section);
          if (!cid || !sn || secMap.has(`${cid}|${sn.toLowerCase()}`)) continue;
          const { data, error } = await supabase.from("sections").insert({ school_id: schoolId, class_id: cid, name: sn }).select("id").single();
          if (error) throw error;
          secMap.set(`${cid}|${sn.toLowerCase()}`, data.id);
        }
        const payload = rows.map((r) => {
          const cid = classMap.get(s(r.class).toLowerCase()) ?? null;
          return {
            school_id: schoolId, full_name: s(r.full_name), admission_number: s(r.admission_number),
            class_id: cid, section_id: cid ? secMap.get(`${cid}|${s(r.section).toLowerCase()}`) ?? null : null,
            roll_number: s(r.roll_number) || null, date_of_birth: toDate(r.date_of_birth), gender: s(r.gender) || null,
          };
        });
        const { data: inserted, error } = await supabase.from("students").insert(payload).select("id,admission_number");
        if (error) throw error;
        // Guardians
        const idByAdm = new Map((inserted ?? []).map((x) => [x.admission_number, x.id]));
        let g = 0;
        for (const r of rows) {
          if (!s(r.guardian_name)) continue;
          const { data: gd, error: ge } = await supabase.from("guardians").insert({ school_id: schoolId, full_name: s(r.guardian_name), phone: s(r.guardian_phone) || null, email: s(r.guardian_email) || null }).select("id").single();
          if (ge) throw ge;
          const sid = idByAdm.get(s(r.admission_number));
          if (sid) await supabase.from("student_guardians").insert({ student_id: sid, guardian_id: gd.id, is_primary: true });
          g++;
        }
        setMsg(`Imported ${payload.length} students and ${g} guardians ✓`);
      }
      setRows([]);
    } catch (e) {
      setMsg(`Import failed: ${(e as { message?: string }).message ?? e}. Nothing after the failing step was saved.`);
    }
    setBusy(false);
  }

  return (
    <div className={card}>
      <h2 className="font-semibold mb-1">Step 3 — Import {kind} from Excel</h2>
      <p className="text-xs text-muted-foreground mb-3">Columns: {cols.join(", ")}. Dates as YYYY-MM-DD.</p>
      <div className="flex flex-wrap gap-2 items-center">
        <button className={btn2} onClick={() => downloadTemplate(cols, `${kind}-template.xlsx`)}>Download template</button>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} className="text-sm" />
      </div>
      {rows.length > 0 && (
        <>
          <div className="overflow-x-auto mt-3 border border-border rounded-lg max-h-64">
            <table className="text-xs w-full">
              <thead className="bg-muted"><tr>{cols.map((c) => <th key={c} className="px-2 py-1 text-left">{c}</th>)}</tr></thead>
              <tbody>{rows.slice(0, 20).map((r, i) => <tr key={i} className="border-t border-border">{cols.map((c) => <td key={c} className="px-2 py-1">{s(r[c])}</td>)}</tr>)}</tbody>
            </table>
          </div>
          {problems.length > 0 && <ul className="text-xs text-destructive mt-2">{problems.slice(0, 10).map((p) => <li key={p}>{p}</li>)}</ul>}
          <button className={`${btn} mt-3`} disabled={busy || problems.length > 0} onClick={run}>Import {rows.length} {kind}</button>
        </>
      )}
      {msg && <p className="text-sm text-muted-foreground mt-2">{msg}</p>}
    </div>
  );
}
