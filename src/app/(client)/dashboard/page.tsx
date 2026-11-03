import { getClientProject, progressOf, gbp, ukDate, type Stage, type Payment } from "@/lib/data";
import { ProgressRing } from "@/components/ProgressChart";
import { StageTimeline } from "@/components/StageTimeline";
import { JourneySteps } from "@/components/JourneySteps";
import { buildJourney, callLinkFrom, splitPayments, QUESTIONS_LINK } from "@/lib/journey";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ paid?: string; payerror?: string; cancelled?: string }> }) {
  const sp = await searchParams;
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

  const journey = project.journey ?? {};
  const steps = buildJourney({
    briefSubmitted: !project.modules.consultation || !!consult?.submitted_at,
    agreementSigned: !project.modules.agreement || ((agreements ?? []).length > 0 && (agreements ?? []).every((a) => a.signed_at)),
    payments: pay,
    journey,
  });
  const { deposit, balance } = splitPayments(pay);
  const call = callLinkFrom(deposit?.paid_at);
  const links = {
    depositId: deposit?.id, balanceId: balance?.id,
    callUrl: call.url, earliestCall: ukDate(call.earliest.toISOString().slice(0, 10)), questionsUrl: QUESTIONS_LINK(),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">{project.name}</h1>
        <p className="text-muted mt-1">{project.package} · started {ukDate(project.start_date)}</p>
      </div>

      {sp.paid && <div className="card border-ok/50 text-ok">Thank you, your payment went through. Your next step is unlocked.</div>}
      {sp.payerror && <div className="card border-bad/50 text-bad">Your payment didn&apos;t go through, and you haven&apos;t been charged. Please try again, or reply to any of our emails and we&apos;ll help.</div>}
      {sp.cancelled && <div className="card text-muted">Payment cancelled. You haven&apos;t been charged.</div>}
      <JourneySteps steps={steps} links={links} />

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
