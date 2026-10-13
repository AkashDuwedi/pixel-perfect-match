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

export const getPlatformStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: role } = await context.supabase.rpc("get_my_role");
    if (role !== "superadmin") throw new Error("Only the superadmin can see this.");
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const today = new Date().toISOString().slice(0, 10);
    const [schools, students, staff, profiles, fees, att, classes] = await Promise.all([
      db.from("schools").select("id,name,code,city,is_active,created_at").order("created_at", { ascending: false }),
      db.from("students").select("school_id"),
      db.from("staff").select("school_id"),
      db.from("profiles").select("role,school_id"),
      db.from("fee_invoices").select("school_id,amount,paid_amount,status"),
      db.from("attendance").select("school_id,status").eq("date", today),
      db.from("classes").select("school_id"),
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
        billed: feeRows.reduce((t, r) => t + Number(r.amount), 0),
        collected: feeRows.reduce((t, r) => t + Number(r.paid_amount), 0),
        attendanceMarked: attRows.length,
        present: attRows.filter((r) => r.status === "present").length,
      },
      roles,
    };
  });
