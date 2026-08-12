// Reusable authentication service. All auth flows in the app go through here
// so the UI never talks to Supabase auth directly.
import { supabase } from "@/lib/supabase";
import type { AuthResult, RoleId, SignInInput, UserProfile } from "@/types/auth";

const REMEMBER_KEY = "vedaalay.remember";
const PROFILE_COLUMNS =
  "id, email, full_name, first_name, last_name, phone, status, role, school_id";

export const authService = {
  /** Load the tenant-scoped profile for a user id. */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("profiles" as never)
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[auth] failed to load profile:", error.message);
      return null;
    }
    return (data as unknown as UserProfile) ?? null;
  },

  /** Current session's profile, or null when signed out. */
  async getCurrentProfile(): Promise<UserProfile | null> {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return null;
    return authService.getProfile(user.id);
  },

  /**
   * Email + password sign in with optional role and school guards.
   * A failed guard signs the user straight back out so no partial session leaks.
   */
  async signIn({
    email,
    password,
    expectedRole,
    expectedSchoolId,
    remember = true,
  }: SignInInput): Promise<AuthResult> {
    authService.setRemember(remember);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      return { profile: null, error: "Incorrect email or password." };
    }

    const profile = await authService.getProfile(data.user.id);

    if (!profile) {
      await authService.signOut();
      return { profile: null, error: "No profile found for this account." };
    }

    if (profile.status && profile.status !== "active") {
      await authService.signOut();
      return { profile: null, error: "This account is not active. Contact your school admin." };
    }

    if (expectedRole && profile.role !== expectedRole) {
      await authService.signOut();
      return { profile: null, error: "This account doesn't have access to that role." };
    }

    if (expectedSchoolId && profile.school_id !== expectedSchoolId) {
      await authService.signOut();
      return { profile: null, error: "This account isn't linked to that school." };
    }

    return { profile, error: null };
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  /** Sends the password-reset email; the link lands on /reset-password. */
  async requestPasswordReset(email: string): Promise<{ error: string | null }> {
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    return { error: error ? error.message : null };
  },

  /** Called from /reset-password after the recovery link restores a session. */
  async updatePassword(password: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? error.message : null };
  },

  onAuthStateChange(callback: (event: string, userId: string | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session?.user?.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  },

  /** "Remember me" preference (session persistence is handled by Supabase). */
  setRemember(remember: boolean) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
    } catch {
      /* storage unavailable — ignore */
    }
  },

  getRemember(): boolean {
    if (typeof window === "undefined") return true;
    try {
      return window.localStorage.getItem(REMEMBER_KEY) !== "0";
    } catch {
      return true;
    }
  },
};

/** Roles that may sign in through the school-staff picker. */
export const STAFF_ROLE_IDS: RoleId[] = [
  "admin",
  "principal",
  "coordinator",
  "teacher",
  "counselor",
  "receptionist",
  "accounts",
  "hr",
];

export default authService;
