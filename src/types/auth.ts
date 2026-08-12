// Shared auth/tenant types for Vedaalay.

export type RoleId =
  | "superadmin"
  | "admin"
  | "principal"
  | "coordinator"
  | "teacher"
  | "counselor"
  | "receptionist"
  | "accounts"
  | "hr"
  | "parent"
  | "student";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  status?: string | null;
  role: RoleId;
  /** Tenant key — every business query must be scoped by this. */
  school_id: string | null;
}

export interface SignInInput {
  email: string;
  password: string;
  /** Optional guard: reject the session when the profile role does not match. */
  expectedRole?: RoleId;
  /** Optional guard: reject the session when the profile belongs to another school. */
  expectedSchoolId?: string | null;
  /** When false, the session is not persisted across browser restarts. */
  remember?: boolean;
}

export interface AuthResult {
  profile: UserProfile | null;
  error: string | null;
}
