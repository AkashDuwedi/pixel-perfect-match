// Access & Logins: school admins invite staff, parents and students by email.
// Each invite creates the auth user (the signup trigger builds the profile from
// metadata) and links it to the matching staff/guardian/student row.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const STAFF_INVITE_ROLES = [
  "principal",
  "coordinator",
  "counselor",
  "teacher",
  "receptionist",
  "accounts",
  "hr",
] as const;

export type AccessPerson = {
  id: string;
  schoolId: string | null;
  name: string;
  subtitle: string | null;
  email: string | null;
  profileId: string | null;
};

export type AccessOverview = {
  role: string;
  staff: AccessPerson[];
  guardians: AccessPerson[];
  students: AccessPerson[];
};

export const getAccessOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccessOverview> => {
    const { data: role } = await context.supabase.rpc("get_my_role");
    if (role !== "admin" && role !== "superadmin")
      throw new Error("Only school admins can manage logins.");

    const [staff, guardians, students] = await Promise.all([
      context.supabase
        .from("staff")
        .select("id, school_id, full_name, designation, email, profile_id")
        .order("full_name"),
      context.supabase
        .from("guardians")
        .select("id, school_id, full_name, relation, email, profile_id")
        .order("full_name"),
      context.supabase
        .from("students")
        .select("id, school_id, full_name, admission_number, profile_id, classes(name), sections(name)")
        .order("full_name"),
    ]);

    if (staff.error) throw new Error(staff.error.message);
    if (guardians.error) throw new Error(guardians.error.message);
    if (students.error) throw new Error(students.error.message);

    return {
      role: (role as string) ?? "admin",
      staff: (staff.data ?? []).map((s: Record<string, unknown>) => ({
        id: s.id as string,
        schoolId: (s.school_id as string) ?? null,
        name: s.full_name as string,
        subtitle: (s.designation as string) || "Staff",
        email: (s.email as string) || null,
        profileId: (s.profile_id as string) || null,
      })),
      guardians: (guardians.data ?? []).map((g: Record<string, unknown>) => ({
        id: g.id as string,
        schoolId: (g.school_id as string) ?? null,
        name: g.full_name as string,
        subtitle: (g.relation as string) || "Guardian",
        email: (g.email as string) || null,
        profileId: (g.profile_id as string) || null,
      })),
      students: (students.data ?? []).map((s: Record<string, unknown>) => {
        const klass = s.classes as { name?: string } | null;
        const section = s.sections as { name?: string } | null;
        return {
          id: s.id as string,
          schoolId: (s.school_id as string) ?? null,
          name: s.full_name as string,
          subtitle: [klass?.name && `Class ${klass.name}`, section?.name && `Sec ${section.name}`, (s.admission_number as string) && `Adm ${s.admission_number}`]
            .filter(Boolean)
            .join(" · ") || "Student",
          email: null,
          profileId: (s.profile_id as string) || null,
        };
      }),
    };
  });

export const inviteLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        kind: z.enum(["staff", "guardian", "student"]),
        id: z.string().uuid(),
        email: z.string().email().max(255),
        role: z.enum(STAFF_INVITE_ROLES).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: myRole } = await context.supabase.rpc("get_my_role");
    if (myRole !== "admin" && myRole !== "superadmin")
      throw new Error("Only school admins can send invites.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Load the target row through the caller's client — RLS scopes admins to
    // their own school, so a foreign id simply won't resolve.
    let schoolId: string | null = null;
    let fullName = "";
    let appRole: string;

    if (data.kind === "staff") {
      const { data: s, error } = await context.supabase
        .from("staff")
        .select("id, school_id, full_name, profile_id")
        .eq("id", data.id)
        .maybeSingle();
      if (error || !s) throw new Error("Staff member not found in your school.");
      if (s.profile_id) throw new Error("This person already has a login.");
      schoolId = s.school_id;
      fullName = s.full_name;
      appRole = data.role ?? "teacher";
    } else if (data.kind === "guardian") {
      const { data: g, error } = await context.supabase
        .from("guardians")
        .select("id, school_id, full_name, profile_id")
        .eq("id", data.id)
        .maybeSingle();
      if (error || !g) throw new Error("Guardian not found in your school.");
      if (g.profile_id) throw new Error("This person already has a login.");
      schoolId = g.school_id;
      fullName = g.full_name;
      appRole = "parent";
    } else {
      const { data: st, error } = await context.supabase
        .from("students")
        .select("id, school_id, full_name, profile_id")
        .eq("id", data.id)
        .maybeSingle();
      if (error || !st) throw new Error("Student not found in your school.");
      if (st.profile_id) throw new Error("This student already has a login.");
      schoolId = st.school_id;
      fullName = st.full_name;
      appRole = "student";
    }

    // Refuse to double-create an account for an email that already exists.
    const { data: listed, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) throw new Error(listErr.message);
    const clash = listed.users.find(
      (u) => (u.email ?? "").toLowerCase() === data.email.toLowerCase(),
    );
    if (clash)
      throw new Error(
        `No email sent — ${data.email} already has a login in Vedaalay (another role is using it). Please use a different email address.`,
      );

    // The set-password link should land on the same site the invite was sent from.
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const origin = getRequestHeader("origin") || undefined;

    const { data: invited, error: invErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.email,
      {
        data: { full_name: fullName, role: appRole, school_id: schoolId },
        ...(origin ? { redirectTo: `${origin}/reset-password` } : {}),
      },
    );
    if (invErr) throw new Error(invErr.message);
    if (!invited.user) throw new Error("Invite could not be created.");

    // Link the new profile to the staff/guardian/student row.
    const table = data.kind === "staff" ? "staff" : data.kind === "guardian" ? "guardians" : "students";
    const { error: linkErr } = await supabaseAdmin
      .from(table)
      .update({ profile_id: invited.user.id })
      .eq("id", data.id);
    if (linkErr) throw new Error(linkErr.message);

    return { userId: invited.user.id, role: appRole };
  });
