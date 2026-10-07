// Superadmin: take schools offline / back online, or permanently remove them.
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Power, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { deleteSchool, setSchoolActive } from "@/lib/schools.functions";

type Row = { id: string; name: string; code: string; city: string | null; is_active: boolean };

export function SchoolControlScreen() {
  const toggleFn = useServerFn(setSchoolActive);
  const deleteFn = useServerFn(deleteSchool);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    const { data, error } = await supabase.from("schools").select("id,name,code,city,is_active").order("name");
    if (error) setMsg(error.message);
    setRows((data ?? []) as Row[]);
  }
  useEffect(() => { load(); }, []);

  async function toggle(s: Row) {
    const goingOffline = s.is_active;
    if (goingOffline && !confirm(`Take ${s.name} offline? Its staff, parents and students lose access until you turn it back on. No data is deleted.`)) return;
    setBusy(s.id);
    try {
      await toggleFn({ data: { schoolId: s.id, active: !s.is_active } });
      setMsg(`${s.name} is now ${goingOffline ? "offline" : "online"}.`);
      await load();
    } catch (e) { setMsg((e as Error).message); }
    setBusy(null);
  }

  async function remove(s: Row) {
    const code = prompt(`This permanently deletes ${s.name}, all its records and all its logins. This cannot be undone.\n\nType the school code (${s.code}) to confirm:`);
    if (!code) return;
    setBusy(s.id);
    try {
      await deleteFn({ data: { schoolId: s.id, confirmCode: code } });
      setMsg(`${s.name} was removed.`);
      await load();
    } catch (e) { setMsg((e as Error).message); }
    setBusy(null);
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold text-foreground mb-1">Manage Schools</h1>
      <p className="text-sm text-muted-foreground mb-5">Take a school offline to pause its access, or remove it permanently.</p>
      {msg && <div className="mb-4 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground">{msg}</div>}
      <div className="bg-card border border-border rounded-2xl divide-y divide-border">
        {!rows && <div className="p-5 text-sm text-muted-foreground">Loading…</div>}
        {rows?.length === 0 && <div className="p-5 text-sm text-muted-foreground">No schools yet.</div>}
        {rows?.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-48">
              <div className="font-medium text-foreground flex items-center gap-2">
                {s.name}
                <span className={"rounded-full px-2 py-0.5 text-[11px] " + (s.is_active ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}>
                  {s.is_active ? "Online" : "Offline"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">{s.code}{s.city ? ` · ${s.city}` : ""}</div>
            </div>
            <button disabled={busy === s.id} onClick={() => toggle(s)} className="border border-border rounded-lg px-3 py-2 text-sm inline-flex items-center gap-1 disabled:opacity-50">
              <Power size={14} /> {s.is_active ? "Take offline" : "Bring online"}
            </button>
            <button disabled={busy === s.id} onClick={() => remove(s)} className="border border-destructive text-destructive rounded-lg px-3 py-2 text-sm inline-flex items-center gap-1 disabled:opacity-50">
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
