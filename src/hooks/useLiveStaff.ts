// Bridges real database staff rows into the School OS staff directory shape.
// Mock rows stay untouched: live rows are merged in only when they exist.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LiveStaff {
  name: string;
  role: string;
  subject: string;
  email: string;
  status: string;
  isLive: true;
}

type Row = {
  id: string;
  full_name: string;
  designation: string | null;
  department: string | null;
  subject: string | null;
  email: string | null;
  status: string;
};

export async function fetchLiveStaff(): Promise<LiveStaff[]> {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) return [];

  const { data, error } = await supabase
    .from("staff")
    .select("id, full_name, designation, department, subject, email, status")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("[staff] failed to load live directory:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as Row[]).map((s) => ({
    name: s.full_name,
    role: s.designation ?? "Staff",
    subject: s.subject ?? s.department ?? "—",
    email: s.email ?? "—",
    status: s.status,
    isLive: true as const,
  }));
}

/** Live staff directory for the signed-in user's school. */
export function useLiveStaff(enabled: boolean) {
  const [live, setLive] = useState<LiveStaff[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLive([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const rows = await fetchLiveStaff();
      if (!cancelled) {
        setLive(rows);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { live, loading };
}
