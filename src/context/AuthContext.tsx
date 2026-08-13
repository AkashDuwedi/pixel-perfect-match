// App-wide auth/session context. Additive: screens can opt in via useAuth()
// without changing any existing UI.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "@/services/auth.service";
import type { RoleId, SignInInput, UserProfile } from "@/types/auth";

interface AuthContextValue {
  profile: UserProfile | null;
  role: RoleId | null;
  schoolId: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  permissions: string[];
  can: (permission: string) => boolean;
  signIn: (input: SignInInput) => Promise<{ profile: UserProfile | null; error: string | null }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  async function refresh() {
    const next = await authService.getCurrentProfile();
    setProfile(next);
    setPermissions(next ? await authService.getPermissions(next.role) : []);
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const next = await authService.getCurrentProfile();
      if (!cancelled) {
        setProfile(next);
        setLoading(false);
        if (next) {
          const perms = await authService.getPermissions(next.role);
          if (!cancelled) setPermissions(perms);
        }
      }
    })();

    const unsubscribe = authService.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setPermissions([]);
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        void refresh();
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      role: profile?.role ?? null,
      schoolId: profile?.school_id ?? null,
      loading,
      isAuthenticated: !!profile,
      permissions,
      can: (permission: string) => permissions.includes(permission),
      async signIn(input) {
        const result = await authService.signIn(input);
        if (result.profile) {
          setProfile(result.profile);
          setPermissions(await authService.getPermissions(result.profile.role));
        }
        return result;
      },
      async signOut() {
        await authService.signOut();
        setProfile(null);
        setPermissions([]);
      },
      refresh,
    }),
    [profile, loading, permissions],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
