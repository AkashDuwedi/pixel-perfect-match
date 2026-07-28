import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type StudentRow = {
  id: string;
  full_name: string;
  admission_number: string;
  roll_number: string | null;
  gender: string | null;
  house: string | null;
  status: string;
  classes: { name: string } | null;
  sections: { name: string } | null;
};

export const Route = createFileRoute("/students")({
  head: () => ({
    meta: [
      { title: "Students — Vedaalay School OS" },
      { name: "description", content: "Live roster of students from your Vedaalay school database." },
      { property: "og:title", content: "Students — Vedaalay School OS" },
      { property: "og:description", content: "Live roster of students from your Vedaalay school database." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentsPage,
  ssr: false,
});

function StudentsPage() {
  const [rows, setRows] = useState<StudentRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        setSignedIn(false);
        return;
      }
      setSignedIn(true);

      const { data: sc } = await supabase.from("schools").select("name").limit(1).maybeSingle();
      setSchoolName(sc?.name ?? null);

      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, admission_number, roll_number, gender, house, status, classes(name), sections(name)")
        .order("admission_number", { ascending: true });

      if (error) setError(error.message);
      else setRows((data ?? []) as unknown as StudentRow[]);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Students (live from database)</h1>
            <p className="text-sm text-slate-500 mt-1">
              {schoolName ? `School: ${schoolName}` : "Reading from your real Supabase tables."}
            </p>
          </div>
          <Link to="/" className="text-sm text-indigo-600 hover:underline">← Back to School OS</Link>
        </div>

        {signedIn === false && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            You're not signed in. Open the main app, sign in as the superadmin, then come back to this page.
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {signedIn && !error && rows === null && (
          <div className="text-sm text-slate-500">Loading…</div>
        )}

        {rows && rows.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
            No students visible for your school. (Superadmins see all; other roles see only their school.)
          </div>
        )}

        {rows && rows.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-2 font-medium">Admission #</th>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Class</th>
                  <th className="px-4 py-2 font-medium">Section</th>
                  <th className="px-4 py-2 font-medium">Roll</th>
                  <th className="px-4 py-2 font-medium">House</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-mono text-xs text-slate-600">{s.admission_number}</td>
                    <td className="px-4 py-2 font-medium text-slate-900">{s.full_name}</td>
                    <td className="px-4 py-2">{s.classes?.name ?? "—"}</td>
                    <td className="px-4 py-2">{s.sections?.name ?? "—"}</td>
                    <td className="px-4 py-2">{s.roll_number ?? "—"}</td>
                    <td className="px-4 py-2">{s.house ?? "—"}</td>
                    <td className="px-4 py-2">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
          <p className="font-semibold text-slate-800 mb-1">How the data model works</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><b>schools</b> — one row per school (tenant). Every other table references it via <code>school_id</code>.</li>
            <li><b>profiles</b> — one row per logged-in user, with a role and a <code>school_id</code>.</li>
            <li><b>classes / sections</b> — belong to a school; students are placed into a section.</li>
            <li><b>students</b> — the roster. Linked to school, class, section.</li>
            <li><b>guardians / student_guardians</b> — parents linked to their children.</li>
            <li><b>staff</b> — teachers/principal/counselor rows, optionally linked to a login profile.</li>
          </ul>
          <p className="mt-2">Row-Level Security ensures staff only see their own school's data; superadmins see everything.</p>
        </div>
      </div>
    </div>
  );
}
