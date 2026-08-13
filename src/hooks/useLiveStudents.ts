// Bridges real database students into the School OS UI shape.
// Mock data stays untouched: live rows are merged in only when they exist.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LiveStudent {
  id: string;
  dbId: string;
  inquiryId: null;
  name: string;
  parentName: string | null;
  phone: string | null;
  classApplied: string | null;
  allocated: boolean;
  academicYear: string | null;
  section: string | null;
  rollNumber: string | null;
  house: string | null;
  busRoute: string | null;
  hostel: string;
  classTeacher: null;
  status: string;
  photo: null;
  admissionNo: string | null;
  credentials: null;
  isLive: true;
}

type Row = {
  id: string;
  full_name: string;
  admission_number: string;
  roll_number: string | null;
  house: string | null;
  bus_route: string | null;
  status: string;
  classes: { name: string } | null;
  sections: { name: string } | null;
};

export async function fetchLiveStudents(): Promise<LiveStudent[]> {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) return [];

  const { data, error } = await supabase
    .from("students")
    .select(
      "id, full_name, admission_number, roll_number, house, bus_route, status, classes(name), sections(name)",
    )
    .order("admission_number", { ascending: true });

  if (error) {
    console.error("[students] failed to load live roster:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as Row[]).map((s) => ({
    id: `DB-${s.id.slice(0, 8)}`,
    dbId: s.id,
    inquiryId: null,
    name: s.full_name,
    parentName: null,
    phone: null,
    classApplied: s.classes?.name ?? null,
    allocated: !!s.sections?.name,
    academicYear: null,
    section: s.sections?.name ?? null,
    rollNumber: s.roll_number,
    house: s.house,
    busRoute: s.bus_route,
    hostel: "Not Applicable",
    classTeacher: null,
    status: s.status === "Active" ? "Allocated" : s.status,
    photo: null,
    admissionNo: s.admission_number,
    credentials: null,
    isLive: true,
  }));
}

/** Live roster for the signed-in user's school; empty until a session exists. */
export function useLiveStudents(enabled: boolean) {
  const [live, setLive] = useState<LiveStudent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLive([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const rows = await fetchLiveStudents();
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
