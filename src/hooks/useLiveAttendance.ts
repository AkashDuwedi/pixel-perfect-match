// Reads and writes real attendance rows for the signed-in user's school.
// Records are keyed the same way the UI keys them: `${sectionLabel}|${dateKey}`.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AttendanceMarks = Record<string, string>;
export type AttendanceRecords = Record<string, AttendanceMarks>;

export interface LiveSectionMeta {
  id: string;
  label: string;
  schoolId: string;
}

type SectionRow = {
  id: string;
  name: string;
  school_id: string;
  classes: { name: string } | null;
};

async function fetchSectionMeta(): Promise<LiveSectionMeta[]> {
  const { data, error } = await supabase
    .from("sections")
    .select("id, name, school_id, classes(name)")
    .order("name", { ascending: true });

  if (error) {
    console.error("[attendance] failed to load sections:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as SectionRow[])
    .map((s) => ({
      id: s.id,
      schoolId: s.school_id,
      label: `${s.classes?.name ?? "—"} - ${s.name}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Live attendance for one date. Returns the records map, the section list and
 * a save function that persists marks to the database.
 */
export function useLiveAttendance(enabled: boolean, dateKey: string) {
  const [records, setRecords] = useState<AttendanceRecords>({});
  const [sections, setSections] = useState<LiveSectionMeta[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) return;

    setLoading(true);
    const metas = await fetchSectionMeta();
    const byId = new Map(metas.map((m) => [m.id, m.label]));

    const { data, error } = await supabase
      .from("attendance")
      .select("student_id, section_id, status")
      .eq("date", dateKey);

    if (error) console.error("[attendance] failed to load records:", error.message);

    const next: AttendanceRecords = {};
    for (const row of (data ?? []) as {
      student_id: string;
      section_id: string | null;
      status: string;
    }[]) {
      const label = row.section_id ? byId.get(row.section_id) : undefined;
      if (!label) continue;
      const key = `${label}|${dateKey}`;
      next[key] = { ...(next[key] ?? {}), [row.student_id]: row.status };
    }

    setSections(metas);
    setRecords(next);
    setLoading(false);
  }, [dateKey]);

  useEffect(() => {
    if (!enabled) {
      setRecords({});
      setSections([]);
      return;
    }
    void load();
  }, [enabled, load]);

  /** Persist marks for a section label. Ignores ids that aren't real students. */
  const save = useCallback(
    async (sectionLabel: string, marks: AttendanceMarks) => {
      const meta = sections.find((s) => s.label === sectionLabel);
      if (!meta) return { saved: 0 };

      const { data: userRes } = await supabase.auth.getUser();
      const rows = Object.entries(marks)
        .filter(([studentId]) => /^[0-9a-f-]{36}$/i.test(studentId))
        .map(([studentId, status]) => ({
          school_id: meta.schoolId,
          section_id: meta.id,
          student_id: studentId,
          date: dateKey,
          status,
          marked_by: userRes.user?.id ?? null,
        }));

      if (!rows.length) return { saved: 0 };

      const { error } = await supabase
        .from("attendance")
        .upsert(rows, { onConflict: "student_id,date" });

      if (error) {
        console.error("[attendance] failed to save:", error.message);
        return { saved: 0, error: error.message };
      }

      setRecords((prev) => ({ ...prev, [`${sectionLabel}|${dateKey}`]: marks }));
      return { saved: rows.length };
    },
    [sections, dateKey],
  );

  return { records, sections, loading, save, reload: load };
}
