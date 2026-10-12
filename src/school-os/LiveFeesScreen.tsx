// Real fee invoices from the database. Family roles see their own child's
// invoices (RLS scoped); admin/accounts/principal can record payments.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Invoice = {
  id: string;
  title: string;
  amount: number;
  due_date: string | null;
  status: string;
  paid_amount: number;
  paid_on: string | null;
  students: { full_name: string; admission_number: string } | null;
};

const rs = (n: number) => `Rs ${Number(n).toLocaleString("en-IN")}`;

export function LiveFeesScreen({ canCollect }: { canCollect: boolean }) {
  const [rows, setRows] = useState<Invoice[] | null>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("fee_invoices")
      .select("id, title, amount, due_date, status, paid_amount, paid_on, students(full_name, admission_number)")
      .order("due_date", { ascending: true });
    if (error) console.error("[fees]", error.message);
    setRows((data ?? []) as unknown as Invoice[]);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const markPaid = async (inv: Invoice) => {
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from("fee_invoices")
      .update({ status: "paid", paid_amount: inv.amount, paid_on: today, receipt_no: `RCPT-${Date.now().toString().slice(-6)}` })
      .eq("id", inv.id);
    if (error) return alert(`Could not record payment: ${error.message}`);
    void load();
  };

  if (!rows) return <div className="text-sm text-muted-foreground py-6">Loading fees…</div>;
  if (!rows.length && !canCollect) return null;

  const total = rows.reduce((s, r) => s + Number(r.amount), 0);
  const paid = rows.reduce((s, r) => s + Number(r.paid_amount), 0);
  const list = rows.filter((r) =>
    !q || `${r.students?.full_name} ${r.students?.admission_number} ${r.title}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <section className="mt-6 max-w-4xl">
      <h2 className="text-lg font-semibold text-foreground">Fee records</h2>
      <p className="text-[13px] text-muted-foreground mb-3">Saved fee invoices for this school.</p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[["Billed", total], ["Collected", paid], ["Outstanding", total - paid]].map(([l, v]) => (
          <div key={l as string} className="rounded-xl border border-border bg-card p-3">
            <div className="text-[12px] text-muted-foreground">{l}</div>
            <div className="text-base font-semibold text-foreground">{rs(v as number)}</div>
          </div>
        ))}
      </div>
      {canCollect && (
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search student or fee…"
          className="mb-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      )}
      {!list.length ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No fee records yet. Import them with the Fees sheet on the Onboard page.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {list.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium text-foreground truncate">{r.title}</div>
                <div className="text-[12px] text-muted-foreground truncate">
                  {r.students?.full_name} · {r.students?.admission_number}{r.due_date ? ` · Due ${r.due_date}` : ""}
                </div>
              </div>
              <span className="text-[13.5px] font-semibold text-foreground">{rs(r.amount)}</span>
              {r.status === "paid" ? (
                <span className="text-[11.5px] px-2.5 py-1 rounded-full bg-success/10 text-success">Paid</span>
              ) : canCollect ? (
                <button onClick={() => markPaid(r)} className="text-[12px] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">
                  Mark paid
                </button>
              ) : (
                <span className="text-[11.5px] px-2.5 py-1 rounded-full bg-warning/10 text-warning capitalize">{r.status}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
