import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Superadmin-only: create a login for a school's admin and link it to the school.
export const createSchoolAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        schoolId: z.string().uuid(),
        email: z.string().email().max(255),
        fullName: z.string().min(1).max(120),
        password: z.string().min(8).max(72),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: role } = await context.supabase.rpc("get_my_role");
    if (role !== "superadmin") throw new Error("Only the superadmin can create school admins.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, role: "admin", school_id: data.schoolId },
    });
    if (error) throw new Error(error.message);
    const { error: pErr } = await supabaseAdmin.from("profiles").upsert({
      id: created.user.id,
      email: data.email,
      full_name: data.fullName,
      role: "admin",
      school_id: data.schoolId,
    });
    if (pErr) throw new Error(pErr.message);
    return { userId: created.user.id };
  });
