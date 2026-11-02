import { notFound } from "next/navigation";
import { requireAdmin, progressOf, gbp, ukDate, type Stage, type Payment, type Agreement, type Project } from "@/lib/data";
import { BRIEF_SECTIONS } from "@/lib/brief";
import { ProgressRing } from "@/components/ProgressChart";
import { updateStage, updateProject, upsertPayment, updateAgreement, adminMarkStep } from "../../actions";
import { buildJourney } from "@/lib/journey";

export default async function ProjectAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: project } = await supabase.from("projects").select("*, profiles(full_name, company, email)").eq("id", id).maybeSingle();
  if (!project) notFound();
  const p = project as Project & { profiles: { full_name: string; company: string; email: string } };
  const [{ data: stages }, { data: payments }, { data: consult }, { data: agreements }, { data: files }] = await Promise.all([
    supabase.from("stages").select("*").eq("project_id", id).order("position"),
    supabase.from("payments").select("*").eq("project_id", id).order("due_date"),
    supabase.from("consultations").select("*").eq("project_id", id).maybeSingle(),
    supabase.from("agreements").select("*").eq("project_id", id),
    supabase.from("files").select("*").eq("project_id", id).order("created_at", { ascending: false }),
  ]);
  const st = (stages ?? []) as Stage[];
  const answers = (consult?.answers ?? {}) as Record<string, string>;
  const fileLinks = await Promise.all((files ?? []).map(async (f) => {
    const { data } = await supabase.storage.from("client-files").createSignedUrl(f.path, 3600);
    return { ...f, url: data?.signedUrl };
  }));

  const journey = p.journey ?? {};
  const steps = buildJourney({
    briefSubmitted: !p.modules.consultation || !!consult?.submitted_at,
    agreementSigned: !p.modules.agreement || ((agreements ?? []).length > 0 && (agreements ?? []).every((a) => a.signed_at)),
    payments: (payments ?? []) as Payment[],
    journey,
  });
  const tick = { done: "text-ok", current: "text-brand", waiting: "text-warn", locked: "text-muted" } as const;

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="h2 mb-3">Client steps</h2>
        <ol className="grid gap-2 sm:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s.key} className="flex items-center justify-between gap-3 rounded-xl bg-field border border-line px-3 py-2 text-sm">
              <span className={tick[s.state]}>{s.state === "done" ? "✓" : `${i + 1}.`} {s.title}{s.status ? " (client says paid; mark it paid below)" : ""}</span>
              {s.state !== "done" && (s.key === "book_call" || s.key === "handover") && (
                <form action={adminMarkStep}><input type="hidden" name="project_id" value={p.id} /><input type="hidden" name="step" value={s.key === "book_call" ? "call_booked" : "handover_done"} /><button className="btn-ghost text-xs px-3 py-1">Mark done</button></form>
              )}
            </li>
          ))}
        </ol>
        {journey.handover_done_note && <p className="text-sm mt-3"><span className="text-muted">Client&apos;s changes:</span> <span className="whitespace-pre-wrap">{journey.handover_done_note}</span></p>}
      </section>

      <div className="flex flex-wrap items-center gap-6">
        <ProgressRing value={progressOf(st)} />
        <div>
          <h1 className="h1">{p.profiles.company || p.profiles.full_name}</h1>
          <p className="text-muted">{p.profiles.full_name} · {p.profiles.email}</p>
          <p className="text-muted">{p.name} · {gbp(p.price_pence)} · started {ukDate(p.start_date)}</p>
        </div>
      </div>

      <section className="card">
        <h2 className="h2 mb-4">Build stages</h2>
        <div className="space-y-3">
          {st.map((s) => (
            <form key={s.id} action={updateStage} className="grid gap-2 sm:grid-cols-[8rem_9rem_10rem_1fr_auto] items-center">
              <input type="hidden" name="id" value={s.id} />
              <span className="font-medium">{s.name}</span>
              <select name="status" defaultValue={s.status} className="input"><option value="todo">Up next</option><option value="in_progress">In progress</option><option value="done">Done</option></select>
              <input type="date" name="due_date" defaultValue={s.due_date ?? ""} className="input" />
              <input name="client_note" defaultValue={s.client_note ?? ""} placeholder="Note the client will see" className="input" />
              <button className="btn-ghost">Save</button>
            </form>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="h2 mb-1">Customise this client&apos;s portal</h2>
        <p className="text-sm text-muted mb-4">Choose what this client sees and which consultation questions apply to them.</p>
        <form action={updateProject} className="space-y-4">
          <input type="hidden" name="id" value={p.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Project name</label><input name="name" defaultValue={p.name} className="input" /></div>
            <div><label className="label">Package</label><input name="package" defaultValue={p.package} className="input" /></div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            {(["consultation", "uploads", "agreement", "payments"] as const).map((m) => (
              <label key={m} className="flex items-center gap-2 capitalize"><input type="checkbox" name={`m_${m}`} defaultChecked={p.modules[m]} /> {m}</label>
            ))}
          </div>
          <div>
            <span className="label">Consultation sections</span>
            <div className="flex flex-wrap gap-4 text-sm">
              {BRIEF_SECTIONS.map((s) => (
                <label key={s.id} className="flex items-center gap-2"><input type="checkbox" name="brief_sections" value={s.id} defaultChecked={p.brief_sections.includes(s.id)} /> {s.title}</label>
              ))}
            </div>
          </div>
          <div><label className="label">Internal notes (not shown to client)</label><textarea name="notes" defaultValue={p.notes ?? ""} rows={3} className="input" /></div>
          <button className="btn">Save</button>
        </form>
      </section>

      <section className="card">
        <h2 className="h2 mb-4">Consultation {consult?.submitted_at ? <span className="text-sm text-ok font-normal">submitted {ukDate(consult.submitted_at)}</span> : <span className="text-sm text-muted font-normal">not submitted</span>}</h2>
        {Object.keys(answers).length ? (
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
            {BRIEF_SECTIONS.flatMap((s) => s.questions).filter((q) => answers[q.id]).map((q) => (
              <div key={q.id}><dt className="text-muted">{q.label}</dt><dd className="whitespace-pre-wrap">{answers[q.id]}</dd></div>
            ))}
          </dl>
        ) : <p className="text-sm text-muted">No answers yet.</p>}
        {fileLinks.length > 0 && (
          <div className="mt-4"><h3 className="font-medium mb-2">Files</h3><ul className="text-sm space-y-1">{fileLinks.map((f) => <li key={f.id}><a className="text-brand" href={f.url} target="_blank" rel="noopener noreferrer">{f.name}</a></li>)}</ul></div>
        )}
      </section>

      <section className="card">
        <h2 className="h2 mb-4">Payments</h2>
        <div className="space-y-3">
          {((payments ?? []) as Payment[]).concat([{ id: "", label: "", amount_pence: 0, due_date: null, status: "due", payment_url: null, paid_at: null }]).map((pay) => (
            <form key={pay.id || "new"} action={upsertPayment} className="grid gap-2 sm:grid-cols-[1fr_6rem_9rem_7rem_1fr_auto] items-center">
              <input type="hidden" name="id" value={pay.id} />
              <input type="hidden" name="project_id" value={p.id} />
              <input name="label" defaultValue={pay.label} placeholder="New payment label" required className="input" />
              <input name="amount" type="number" step="0.01" defaultValue={pay.amount_pence / 100 || ""} placeholder="£" required className="input" />
              <input name="due_date" type="date" defaultValue={pay.due_date ?? ""} className="input" />
              <select name="status" defaultValue={pay.status} className="input"><option value="due">Due</option><option value="paid">Paid</option><option value="overdue">Overdue</option></select>
              <input name="payment_url" defaultValue={pay.payment_url ?? ""} placeholder="PayPal / Stripe payment link" className="input" />
              <button className="btn-ghost">{pay.id ? "Save" : "Add"}</button>
            </form>
          ))}
        </div>
      </section>

      {((agreements ?? []) as Agreement[]).map((a) => (
        <section key={a.id} className="card">
          <h2 className="h2 mb-1">Agreement</h2>
          {a.signed_at ? (
            <>
              <p className="text-sm text-ok mb-3">Signed by {a.signed_name} on {new Date(a.signed_at).toLocaleString("en-GB")}</p>
              <div className="whitespace-pre-wrap text-sm">{a.body}</div>
            </>
          ) : (
            <form action={updateAgreement} className="space-y-3">
              <p className="text-sm text-muted">Not signed yet. You can edit it until the client signs.</p>
              <input type="hidden" name="id" value={a.id} />
              <input name="title" defaultValue={a.title} className="input" />
              <textarea name="body" defaultValue={a.body} rows={14} className="input font-mono text-xs" />
              <button className="btn">Save agreement</button>
            </form>
          )}
        </section>
      ))}
    </div>
  );
}
