// Role-based access helpers for the School OS shell.
// Menu entries and screens are gated by the permissions stored per role in the database.
import { ShieldAlert, LayoutGrid, Users, Briefcase, IndianRupee, ClipboardCheck, BarChart3 } from "lucide-react";

// Screen id -> permission needed to open it. Screens not listed are open to anyone the menu shows them to.
export const VIEW_PERMISSIONS: Record<string, string> = {
  fees: "fees.read",
  staff: "staff.read",
  teachers: "staff.read",
  classes: "classes.read",
  capacity: "classes.read",
  attendance: "attendance.read",
  gradebook: "exams.write",
  results: "exams.read",
  students: "students.read",
  strength: "students.read",
  risk: "students.read",
  settings: "settings.write",
  transport: "settings.write",
  hostel: "settings.write",
  billing: "settings.write",
  reports: "reports.read",
};

export function canView(view: string, perms: string[] | null) {
  if (!perms) return true; // permissions not loaded (demo/offline) — don't lock the user out
  const need = VIEW_PERMISSIONS[view];
  return !need || perms.includes(need);
}

export function filterNav<T extends { id: string }>(items: T[], perms: string[] | null): T[] {
  return items.filter((i) => canView(i.id, perms));
}

export const EXTRA_NAV = {
  receptionist: [
    { id: "dashboard", label: "Front Desk", icon: LayoutGrid },
    { id: "students", label: "Student Lookup", icon: Users },
    { id: "staff", label: "Staff Directory", icon: Briefcase },
  ],
  accounts: [
    { id: "dashboard", label: "Accounts Home", icon: LayoutGrid },
    { id: "fees", label: "Fee Collection", icon: IndianRupee },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ],
  hr: [
    { id: "dashboard", label: "HR Home", icon: LayoutGrid },
    { id: "staff", label: "Staff Directory", icon: Briefcase },
    { id: "reports", label: "Reports", icon: ClipboardCheck },
  ],
};

export function AccessDenied({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-md mx-auto mt-16 text-center rounded-2xl border border-border bg-card p-8">
      <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
      <h1 className="mt-3 text-lg font-semibold text-foreground">You don't have access to this page</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your role doesn't include this section. Ask your school admin if you need it.</p>
      <button onClick={onBack} className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Back to dashboard</button>
    </div>
  );
}

export function RoleWorkspace({ roleLabel, view, perms }: { roleLabel: string; view: string; perms: string[] | null }) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-foreground">{roleLabel} · {view === "dashboard" ? "Home" : view[0].toUpperCase() + view.slice(1)}</h1>
      <p className="mt-2 text-sm text-muted-foreground">This workspace is being built. Here is what your role is allowed to do:</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(perms ?? []).map((p) => (
          <span key={p} className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground">{p}</span>
        ))}
      </div>
    </div>
  );
}
