// Finds the real student linked to the signed-in parent/student login and
// returns their attendance summary and today's timetable.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchLiveTimetable, type LiveTimetableEntry } from "./useLiveTimetable";

export interface MyChildSummary {
  name: string;
  classLabel: string;
  present: number;
  total: number;
  percent: number | null;
  today: LiveTimetableEntry[];
}

export function useMyChild(enabled: boolean) {
  const [data, setData] = useState<MyChildSummary | null>(null);

  useEffect(() => {
    if (!enabled) return setData(null);
    let cancelled = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) return;

      let studentId: string | null = null;
      const { data: own } = await supabase.from("students").select("id").eq("profile_id", uid).maybeSingle();
      studentId = own?.id ?? null;
      if (!studentId) {
        const { data: g } = await supabase.from("guardians").select("id").eq("profile_id", uid).maybeSingle();
        if (g) {
          const { data: link } = await supabase
            .from("student_guardians").select("student_id").eq("guardian_id", g.id).limit(1).maybeSingle();
          studentId = link?.student_id ?? null;
        }
      }
      if (!studentId) return;

      const { data: st } = await supabase
        .from("students").select("id, full_name, section_id, classes(name), sections(name)")
        .eq("id", studentId).maybeSingle();
      if (!st) return;
      const s = st as unknown as { full_name: string; section_id: string | null; classes: { name: string } | null; sections: { name: string } | null };

      const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
      const { data: att } = await supabase
        .from("attendance").select("status").eq("student_id", studentId).gte("date", since);
      const total = att?.length ?? 0;
      const present = (att ?? []).filter((a) => a.status === "P" || a.status === "L" || a.status === "present").length;

      const jsDay = new Date().getDay();
      const weekday = jsDay === 0 || jsDay === 6 ? 1 : jsDay;
      const label = `${s.classes?.name ?? "—"} - ${s.sections?.name ?? ""}`.trim();
      const today = (await fetchLiveTimetable(weekday)).filter((t) => t.section === label);

      if (!cancelled)
        setData({ name: s.full_name, classLabel: label, present, total, percent: total ? Math.round((present / total) * 100) : null, today });
    })();
    return () => { cancelled = true; };
  }, [enabled]);

  return data;
}
