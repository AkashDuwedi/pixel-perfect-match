// Bridges real schools rows into the SCHOOLS UI shape used by the
// superadmin dashboard, billing and school browser. Mock rows remain.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LiveSchool {
  id: string;
  name: string;
  city: string;
  cityName: string;
  state: string;
  locality: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
  principal: string;
  color: string;
  colorSoft: string;
  students: number;
  logo: string;
  board: string;
  established: number | null;
  rating: number;
  feeRange: string;
  about: string;
  agreementStatus: string;
  isLive: true;
}

type SchoolRow = {
  id: string;
  name: string;
  code: string;
  city: string | null;
  state: string | null;
  pincode: string | null;
  address: string | null;
  board: string | null;
  principal_name: string | null;
  subscription_status: string | null;
  is_active: boolean | null;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export async function fetchLiveSchools(): Promise<LiveSchool[]> {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) return [];

  const [{ data, error }, { data: students }] = await Promise.all([
    supabase
      .from("schools")
      .select(
        "id, name, code, city, state, pincode, address, board, principal_name, subscription_status, is_active",
      )
      .order("name", { ascending: true }),
    supabase.from("students").select("school_id"),
  ]);

  if (error) {
    console.error("[schools] failed to load live schools:", error.message);
    return [];
  }

  const counts = new Map<string, number>();
  for (const s of (students ?? []) as { school_id: string | null }[]) {
    if (s.school_id) counts.set(s.school_id, (counts.get(s.school_id) ?? 0) + 1);
  }

  return ((data ?? []) as SchoolRow[]).map((s) => ({
    id: s.id,
    name: s.name,
    city: [s.city, s.state].filter(Boolean).join(", ") || "—",
    cityName: s.city ?? "—",
    state: s.state ?? "",
    locality: s.address ?? "",
    pincode: s.pincode ?? "",
    lat: null,
    lng: null,
    principal: s.principal_name ?? "—",
    color: "#2563EB",
    colorSoft: "#EFF6FF",
    students: counts.get(s.id) ?? 0,
    logo: initials(s.name) || s.code.slice(0, 2).toUpperCase(),
    board: s.board ?? "CBSE",
    established: null,
    rating: 0,
    feeRange: "—",
    about: `${s.name} is onboarded on Vedaalay.`,
    agreementStatus: s.is_active === false ? "pending" : (s.subscription_status ?? "active"),
    isLive: true as const,
  }));
}

/** Live schools visible to the signed-in user (RLS scoped). */
export function useLiveSchools(enabled: boolean) {
  const [live, setLive] = useState<LiveSchool[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLive([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const rows = await fetchLiveSchools();
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
