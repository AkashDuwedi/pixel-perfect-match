// Bridges real classes/sections (with live student counts) into the
// Class & Section manager UI shape. Mock rows remain as a fallback.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LiveSection {
  cls: string;
  section: string;
  teacher: string;
  strength: number;
  capacity: number;
  isLive: true;
}

type SectionRow = {
  id: string;
  name: string;
  capacity: number;
  classes: { name: string } | null;
  profiles: { full_name: string | null } | null;
};

export async function fetchLiveSections(): Promise<LiveSection[]> {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) return [];

  const [{ data, error }, { data: students }] = await Promise.all([
    supabase
      .from("sections")
      .select("id, name, capacity, classes(name), profiles:class_teacher_id(full_name)")
      .order("name", { ascending: true }),
    supabase.from("students").select("section_id"),
  ]);

  if (error) {
    console.error("[sections] failed to load live sections:", error.message);
    return [];
  }

  const counts = new Map<string, number>();
  for (const s of (students ?? []) as { section_id: string | null }[]) {
    if (s.section_id) counts.set(s.section_id, (counts.get(s.section_id) ?? 0) + 1);
  }

  return ((data ?? []) as unknown as SectionRow[])
    .map((s) => ({
      cls: s.classes?.name ?? "—",
      section: s.name,
      teacher: s.profiles?.full_name ?? "Unassigned",
      strength: counts.get(s.id) ?? 0,
      capacity: s.capacity || 40,
      isLive: true as const,
    }))
    .sort((a, b) => a.cls.localeCompare(b.cls) || a.section.localeCompare(b.section));
}

/** Live class/section list for the signed-in user's school. */
export function useLiveSections(enabled: boolean) {
  const [live, setLive] = useState<LiveSection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLive([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const rows = await fetchLiveSections();
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
