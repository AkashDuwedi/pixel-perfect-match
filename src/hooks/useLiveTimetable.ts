// Bridges real timetable_slots rows into the teacher dashboard shape.
// Mock periods stay as a fallback when the school has no slots yet.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LiveTimetableEntry {
  period: number;
  subject: string;
  section: string;
  time: string;
  isLive: true;
}

type SlotRow = {
  id: string;
  weekday: number;
  period_no: number;
  start_time: string | null;
  end_time: string | null;
  subjects: { name: string } | null;
  sections: { name: string; classes: { name: string } | null } | null;
};

function fmt(t: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${m} ${suffix}`;
}

/** Slots for one weekday (1 = Monday … 5 = Friday). */
export async function fetchLiveTimetable(weekday: number): Promise<LiveTimetableEntry[]> {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) return [];

  const { data, error } = await supabase
    .from("timetable_slots")
    .select("id, weekday, period_no, start_time, end_time, subjects(name), sections(name, classes(name))")
    .eq("weekday", weekday)
    .order("period_no", { ascending: true });

  if (error) {
    console.error("[timetable] failed to load slots:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as SlotRow[]).map((s) => ({
    period: s.period_no,
    subject: s.subjects?.name ?? "—",
    section: `${s.sections?.classes?.name ?? "—"} - ${s.sections?.name ?? ""}`.trim(),
    time: [fmt(s.start_time), fmt(s.end_time)].filter(Boolean).join(" - "),
    isLive: true as const,
  }));
}

/** Today's live timetable for the signed-in user's school. */
export function useLiveTimetable(enabled: boolean) {
  const [live, setLive] = useState<LiveTimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLive([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const jsDay = new Date().getDay(); // 0 = Sunday
    const weekday = jsDay === 0 || jsDay === 6 ? 1 : jsDay;
    (async () => {
      const rows = await fetchLiveTimetable(weekday);
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
