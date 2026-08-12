import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Vedaalay" },
      { name: "description", content: "Choose a new password for your Vedaalay School OS account." },
      { property: "og:title", content: "Reset your password — Vedaalay" },
      { property: "og:description", content: "Choose a new password for your Vedaalay School OS account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setReady(!!data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit() {
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setStatus("saving");
    const { error: updateError } = await authService.updatePassword(password);
    if (updateError) {
      setStatus("idle");
      setError(updateError);
      return;
    }
    setStatus("done");
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Reset your password</h1>

        {status === "done" ? (
          <>
            <p className="mt-2 text-[13.5px] text-slate-500 dark:text-slate-400">
              Your password has been updated. You can sign in with it now.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-[14px] font-medium text-white hover:bg-indigo-700"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-[13.5px] text-slate-500 dark:text-slate-400">
              {ready
                ? "Choose a new password for your Vedaalay account."
                : "Open this page from the reset link in your email to continue."}
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-[13px] font-medium text-slate-600 dark:text-slate-300">
                  New password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-[14px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-slate-600 dark:text-slate-300">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-[14px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!ready || status === "saving"}
                className="mt-1 w-full rounded-lg bg-indigo-600 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
              >
                {status === "saving" ? "Updating..." : "Update password"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
