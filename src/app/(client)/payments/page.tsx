import { redirect } from "next/navigation";
import { getClientProject, gbp, ukDate, type Payment } from "@/lib/data";
import { splitPayments } from "@/lib/journey";

const badge = { paid: "bg-ok/10 text-ok", due: "bg-warn/10 text-warn", overdue: "bg-bad/10 text-bad" } as const;

export default async function PaymentsPage() {
  const { supabase, project } = await getClientProject();
  if (!project?.modules.payments) redirect("/dashboard");
  const { data } = await supabase.from("payments").select("*").eq("project_id", project.id).order("due_date");
  const payments = (data ?? []) as Payment[];
  const [{ data: agreements }] = await Promise.all([supabase.from("agreements").select("signed_at").eq("project_id", project.id)]);
  const signed = !project.modules.agreement || ((agreements ?? []).length > 0 && (agreements ?? []).every((a) => a.signed_at));
  const { balance } = splitPayments(payments);
  // Same order as the steps on the Progress page: deposit after signing, balance after the 1-1 handover.
  const unlocked = (p: Payment) => (p.id === balance?.id ? !!project.journey?.handover_done_at : signed);
  return (
    <div className="space-y-6">
      <div><h1 className="h1">Payments</h1><p className="text-muted mt-1">{project.package}: {gbp(project.price_pence)} total.</p></div>
      <div className="card p-0 overflow-hidden">
        {payments.length ? (
          <ul className="divide-y divide-line">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <div className="font-medium">{p.label}</div>
                  <div className="text-sm text-muted">{p.status === "paid" ? `Paid ${ukDate(p.paid_at)}` : p.due_date ? `Due ${ukDate(p.due_date)}` : ""}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{gbp(p.amount_pence)}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badge[p.status]}`}>{p.status}</span>
                  {p.status !== "paid" && !unlocked(p) && <span className="text-xs text-muted">🔒 {p.id === balance?.id ? "Unlocks after your 1-1" : "Unlocks after you sign"}</span>}
                  {p.status !== "paid" && unlocked(p) && <a href={`/api/pay/${p.id}`} className="btn">Pay now</a>}
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="p-5 text-sm text-muted">No payments scheduled yet.</p>}
      </div>
    </div>
  );
}
