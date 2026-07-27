// Shim so `src/school-os/App.tsx` can import `../lib/supabaseClient`.
// Uses the auto-generated Lovable Cloud client under the hood.
import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role:
    | "superadmin"
    | "admin"
    | "principal"
    | "counselor"
    | "coordinator"
    | "teacher"
    | "parent"
    | "student";
  school_id: string | null;
};

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles" as any)
    .select("id, email, full_name, role, school_id")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Failed to load profile:", error.message);
    return null;
  }
  return data as unknown as Profile;
}
