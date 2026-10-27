import Link from "next/link";
import { getClientProject, progressOf, gbp, ukDate, type Stage, type Payment } from "@/lib/data";
import { ProgressRing } from "@/components/ProgressChart";
import { StageTimeline } from "@/components/StageTimeline";

export default async function Dashboard() {
  const { supabase, profile, project } = await getClientProject();
  if (!project) {
    return <div className="card"><h1 className="h1">Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}</h1><p className="text-muted mt-2">Your project is being set up. We&apos;ll email you as soon as it&apos;s ready.</p></div>;
  }
  const [{ data: stages }, { data: payments }, { data: consult }, { data: agreements }] = await Promise.all([
    supabase.from("stages").select("*").eq("project_id", project.id).order("position"),
    supabase.from("payments").select("*").eq("project_id", project.id).order("due_date"),
    supabase.from("consultations").select("submitted_at").eq("project_id", project.id).maybeSingle(),
    supabase.from("agreements").select("id, signed_at").eq("project_id", project.id),
  ]);
  const st = (stages ?? []) as Stage[];
  const pay = (payments ?? []) as Payment[];
  const paid = pay.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount_pence, 0);
  const current = st.find((s) => s.status === "in_progress") ?? st.find((s) => s.status === "todo");

  const todos = [
    project.modules.consultation && !consult?.submitted_at && { href: "/brief", text: "Complete your consultation form" },
    project.modules.agreement && (agreements ?? []).some((a) => !a.signed_at) && { href: "/agreement", text: "Sign your website agreement" },
    project.modules.payments && pay.some((p) => p.status !== "paid") && { href: "/payments", text: "Make your next payment" },
  ].filter(Boolean) as { href: string; text: string }[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">{project.name}</h1>
        <p className="text-muted mt-1">{project.package} · started {ukDate(project.start_date)}</p>
      </div>

      {todos.length > 0 && (
        <div className="card border-brand/40 bg-brand/5">
          <h2 className="h2 mb-3">Your next steps</h2>
          <ul className="space-y-2">
            {todos.map((t) => (
              <li key={t.href}><Link href={t.href} className="flex items-center justify-between rounded-lg bg-panel border border-line px-4 py-3 hover:border-brand"><span>{t.text}</span><span className="text-brand">→</span></Link></li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card flex flex-col items-center justify-center gap-3">
          <ProgressRing value={progressOf(st)} />
          {current && <p className="text-sm text-muted text-center">Now: <span className="text-ink font-medium">{current.name}</span></p>}
        </div>
        <div className="card md:col-span-2">
          <h2 className="h2 mb-4">Your 7-day build</h2>
          <StageTimeline stages={st} />
        </div>
      </div>

      {project.modules.payments && pay.length > 0 && (
        <div className="card">
          <div className="flex justify-between text-sm mb-2"><span className="font-medium">Payments</span><span className="text-muted">{gbp(paid)} of {gbp(project.price_pence)} paid</span></div>
          <div className="h-2 rounded-full bg-line overflow-hidden"><div className="h-full bg-ok" style={{ width: `${Math.min(100, (paid / project.price_pence) * 100)}%` }} /></div>
        </div>
      )}
    </div>
  );
}
