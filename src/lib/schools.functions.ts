import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertSuperadmin(supabase: { rpc: (fn: "get_my_role") => PromiseLike<{ data: unknown }> }) {
  const { data } = await supabase.rpc("get_my_role");
  if (data !== "superadmin") throw new Error("Only the superadmin can do this.");
}

// Superadmin: take a school offline (its users lose access) or bring it back.
export const setSchoolActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ schoolId: z.string().uuid(), active: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperadmin(context.supabase as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("schools")
      .update({ is_active: data.active, subscription_status: data.active ? "active" : "suspended" })
      .eq("id", data.schoolId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Superadmin: permanently delete a school, all its records and its logins.
export const deleteSchool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ schoolId: z.string().uuid(), confirmCode: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperadmin(context.supabase as never);
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { data: school } = await db.from("schools").select("code").eq("id", data.schoolId).maybeSingle();
    if (!school) throw new Error("School not found.");
    if (school.code.toUpperCase() !== data.confirmCode.trim().toUpperCase())
      throw new Error("The school code you typed doesn't match.");

    const id = data.schoolId;
    const check = (r: { error: { message: string } | null }, what: string) => {
      if (r.error) throw new Error(`${what}: ${r.error.message}`);
    };
    const { data: studs } = await db.from("students").select("id").eq("school_id", id);
    const studentIds = (studs ?? []).map((s) => s.id);
    if (studentIds.length) check(await db.from("student_guardians").delete().in("student_id", studentIds), "parent links");
    for (const t of ["attendance", "timetable_slots", "teacher_assignments", "guardians", "students", "subjects"] as const)
      check(await db.from(t).delete().eq("school_id", id), t);
    check(await db.from("sections").delete().eq("school_id", id), "sections");
    for (const t of ["staff", "classes", "user_roles"] as const) check(await db.from(t).delete().eq("school_id", id), t);

    const { data: users } = await db.from("profiles").select("id,role").eq("school_id", id);
    for (const u of users ?? []) {
      if (u.role === "superadmin") continue;
      check(await db.from("profiles").delete().eq("id", u.id), "profiles");
      await db.auth.admin.deleteUser(u.id);
    }
    check(await db.from("schools").delete().eq("id", id), "school");
    return { ok: true };
  });
