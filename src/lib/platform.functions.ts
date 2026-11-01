import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Temporary owner shortcut: exchange the private PIN for a one-time superadmin sign-in token.
export const pinLogin = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ pin: z.string().min(4).max(12) }).parse(d))
  .handler(async ({ data }) => {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    const expected = process.env.SUPERADMIN_PIN;
    if (!expected || data.pin !== expected) throw new Error("Wrong PIN.");
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { data: sa } = await db.from("profiles").select("email").eq("role", "superadmin").limit(1).maybeSingle();
    if (!sa?.email) throw new Error("No super admin account found.");
    const { data: link, error } = await db.auth.admin.generateLink({ type: "magiclink", email: sa.email });
    if (error || !link.properties?.hashed_token) throw new Error(error?.message ?? "Could not sign in.");
    return { tokenHash: link.properties.hashed_token };
  });

async function assertSuperadmin(supabase: { rpc: (fn: "get_my_role") => PromiseLike<{ data: unknown }> }) {
  const { data } = await supabase.rpc("get_my_role");
  if (data !== "superadmin") throw new Error("Only the superadmin can do this.");
}

export const getPlatformStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperadmin(context.supabase as never);
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const [schools, students, staff, profiles, fees, att, classes, newLogins] = await Promise.all([
      db.from("schools").select("id,name,code,city,is_active,created_at,subscription_plan,subscription_status").order("created_at", { ascending: false }),
      db.from("students").select("school_id"),
      db.from("staff").select("school_id"),
      db.from("profiles").select("role,school_id"),
      db.from("fee_invoices").select("school_id,amount,paid_amount,status"),
      db.from("attendance").select("school_id,status").eq("date", today),
      db.from("classes").select("school_id"),
      db.from("profiles").select("id").gte("created_at", weekAgo),
    ]);
    const count = (rows: { school_id: string | null }[] | null, id: string) => (rows ?? []).filter((r) => r.school_id === id).length;
    const roles: Record<string, number> = {};
    for (const p of profiles.data ?? []) roles[p.role] = (roles[p.role] ?? 0) + 1;
    const feeRows = fees.data ?? [];
    const attRows = att.data ?? [];
    const perSchool = (schools.data ?? []).map((s) => {
      const f = feeRows.filter((r) => r.school_id === s.id);
      const a = attRows.filter((r) => r.school_id === s.id);
      return {
        ...s,
        students: count(students.data, s.id),
        staff: count(staff.data, s.id),
        users: count(profiles.data, s.id),
        classes: count(classes.data, s.id),
        billed: f.reduce((t, r) => t + Number(r.amount), 0),
        collected: f.reduce((t, r) => t + Number(r.paid_amount), 0),
        attendanceToday: a.length ? Math.round((a.filter((r) => r.status === "present").length / a.length) * 100) : null,
      };
    });
    return {
      schools: perSchool,
      totals: {
        schools: perSchool.length,
        online: perSchool.filter((s) => s.is_active).length,
        students: students.data?.length ?? 0,
        staff: staff.data?.length ?? 0,
        users: profiles.data?.length ?? 0,
        newLogins7d: newLogins.data?.length ?? 0,
        billed: feeRows.reduce((t, r) => t + Number(r.amount), 0),
        collected: feeRows.reduce((t, r) => t + Number(r.paid_amount), 0),
        attendanceMarked: attRows.length,
        present: attRows.filter((r) => r.status === "present").length,
      },
      roles,
    };
  });

// Superadmin: recent platform-wide events + a 30-day growth series.
export type PlatformEvent = {
  id: string;
  kind: "school" | "login" | "student" | "fee";
  at: string;
  school: string | null;
  label: string;
  detail: string;
};

export const getPlatformPulse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperadmin(context.supabase as never);
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const [schools, students, profiles, fees] = await Promise.all([
      db.from("schools").select("id,name,code,created_at").order("created_at", { ascending: false }).limit(30),
      db.from("students").select("id,full_name,school_id,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(60),
      db.from("profiles").select("id,full_name,role,school_id,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(60),
      db.from("fee_invoices").select("id,title,school_id,paid_amount,paid_on,status,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(60),
    ]);
    const nameOf = new Map((schools.data ?? []).map((s) => [s.id, s.name]));
    const events: PlatformEvent[] = [];
    for (const s of schools.data ?? [])
      if (s.created_at) events.push({ id: `sch-${s.id}`, kind: "school", at: s.created_at, school: s.name, label: "School onboarded", detail: s.code });
    for (const s of students.data ?? [])
      events.push({ id: `stu-${s.id}`, kind: "student", at: s.created_at, school: nameOf.get(s.school_id ?? "") ?? null, label: "Student admitted", detail: s.full_name });
    for (const p of profiles.data ?? [])
      events.push({ id: `log-${p.id}`, kind: "login", at: p.created_at, school: nameOf.get(p.school_id ?? "") ?? null, label: "Login created", detail: `${p.full_name ?? "User"} · ${p.role}` });
    for (const f of fees.data ?? [])
      if (Number(f.paid_amount) > 0)
        events.push({ id: `fee-${f.id}`, kind: "fee", at: f.paid_on ?? f.created_at, school: nameOf.get(f.school_id ?? "") ?? null, label: "Fee payment", detail: `${f.title} · Rs ${Math.round(Number(f.paid_amount)).toLocaleString("en-IN")}` });

    // 30-day growth series (students admitted, logins created)
    const days: { date: string; students: number; logins: number }[] = [];
    const base = new Map<string, { students: number; logins: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      base.set(d, { students: 0, logins: 0 });
      days.push({ date: d, students: 0, logins: 0 });
    }
    for (const s of students.data ?? []) { const k = (s.created_at ?? "").slice(0, 10); const b = base.get(k); if (b) b.students++; }
    for (const p of profiles.data ?? []) { const k = (p.created_at ?? "").slice(0, 10); const b = base.get(k); if (b) b.logins++; }
    for (const d of days) { const b = base.get(d.date); if (b) { d.students = b.students; d.logins = b.logins; } }

    events.sort((a, b) => (a.at < b.at ? 1 : -1));
    return { events: events.slice(0, 30), growth: days };
  });

// Superadmin: set a school's subscription plan and status.
export const updateSchoolSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    schoolId: z.string().uuid(),
    plan: z.enum(["trial", "starter", "standard", "premium"]),
    status: z.enum(["trialing", "active", "past_due", "suspended"]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperadmin(context.supabase as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("schools")
      .update({ subscription_plan: data.plan, subscription_status: data.status })
      .eq("id", data.schoolId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
