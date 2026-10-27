import Link from "next/link";
import { requireAdmin, progressOf, gbp, type Stage } from "@/lib/data";
import { createClientProject } from "./actions";

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, price_pence, start_date, profiles(full_name, company, email), stages(*), payments(amount_pence, status), consultations(submitted_at), agreements(signed_at)")
    .order("created_at", { ascending: false });

  const rows = (projects ?? []).map((p) => {
    const paid = (p.payments ?? []).filter((x) => x.status === "paid").reduce((s, x) => s + x.amount_pence, 0);
    return { ...p, progress: progressOf((p.stages ?? []) as Stage[]), paid };
  });
  const booked = rows.reduce((s, r) => s + r.price_pence, 0);
  const collected = rows.reduce((s, r) => s + r.paid, 0);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="h1">Clients</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card"><div className="text-sm text-muted">Websites sold</div><div className="text-3xl font-semibold">{rows.length} <span className="text-base text-muted">/ 10</span></div></div>
        <div className="card"><div className="text-sm text-muted">Booked</div><div className="text-3xl font-semibold">{gbp(booked)}</div></div>
        <div className="card"><div className="text-sm text-muted">Collected</div><div className="text-3xl font-semibold">{gbp(collected)}</div></div>
      </div>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted border-b border-line">
            <tr><th className="px-5 py-3 font-medium">Client</th><th className="px-3 font-medium">Progress</th><th className="px-3 font-medium">Brief</th><th className="px-3 font-medium">Signed</th><th className="px-3 font-medium">Paid</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => {
              const prof = r.profiles as unknown as { full_name: string; company: string; email: string } | null;
              const consult = (Array.isArray(r.consultations) ? r.consultations[0] : r.consultations) as { submitted_at: string | null } | null;
              const signed = (r.agreements ?? []).length > 0 && (r.agreements ?? []).every((a) => a.signed_at);
              const late = (r.stages as Stage[]).some((s) => s.status !== "done" && s.due_date && s.due_date < today);
              return (
                <tr key={r.id} className="hover:bg-page">
                  <td className="px-5 py-3"><Link href={`/admin/projects/${r.id}`} className="font-medium hover:text-brand">{prof?.company || prof?.full_name}</Link><div className="text-muted">{r.name}</div></td>
                  <td className="px-3 min-w-32"><div className="flex items-center gap-2"><div className="h-2 flex-1 rounded-full bg-line overflow-hidden"><div className={`h-full ${late ? "bg-warn" : "bg-brand"}`} style={{ width: `${r.progress}%` }} /></div><span>{r.progress}%</span></div></td>
                  <td className="px-3">{consult?.submitted_at ? "✓" : "–"}</td>
                  <td className="px-3">{signed ? "✓" : "–"}</td>
                  <td className="px-3 whitespace-nowrap">{gbp(r.paid)} / {gbp(r.price_pence)}</td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={5} className="px-5 py-6 text-muted">No clients yet. Add your first one below.</td></tr>}
          </tbody>
        </table>
      </div>

      <form action={createClientProject} className="card grid gap-4 sm:grid-cols-2">
        <h2 className="h2 sm:col-span-2">Add a client</h2>
        <p className="text-sm text-muted sm:col-span-2 -mt-2">They&apos;ll get an email invite to set a password. Their project, 7-day stages, deposit and balance payments, and agreement are created automatically.</p>
        <div><label className="label">Full name</label><input name="full_name" required className="input" /></div>
        <div><label className="label">Email</label><input name="email" type="email" required className="input" /></div>
        <div><label className="label">Business name</label><input name="company" className="input" /></div>
        <div><label className="label">Project name</label><input name="project_name" placeholder="e.g. Bloom Florist website" className="input" /></div>
        <div><label className="label">Price (£)</label><input name="price" type="number" defaultValue={1000} className="input" /></div>
        <div><label className="label">Start date</label><input name="start_date" type="date" defaultValue={today} className="input" /></div>
        <div className="sm:col-span-2"><button className="btn">Create client and send invite</button></div>
      </form>
    </div>
  );
}
