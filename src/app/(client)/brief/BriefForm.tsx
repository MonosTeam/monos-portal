"use client";
import { useState, useTransition } from "react";
import type { Section } from "@/lib/brief";
import { saveBrief } from "../actions";

export function BriefForm({ sections, initial, submittedAt }: { sections: Section[]; initial: Record<string, string>; submittedAt: string | null }) {
  const [answers, setAnswers] = useState(initial);
  const [msg, setMsg] = useState<string | null>(submittedAt ? "Submitted. You can still update your answers." : null);
  const [pending, start] = useTransition();
  const set = (id: string, v: string) => setAnswers((a) => ({ ...a, [id]: v }));

  function save(submit: boolean) {
    start(async () => {
      try {
        await saveBrief(answers, submit);
        setMsg(submit ? "Thank you! Your brief is with the MONOS team." : "Draft saved.");
      } catch (e) {
        setMsg((e as Error).message);
      }
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(true); }} className="space-y-6">
      {sections.map((s) => (
        <fieldset key={s.id} className="card space-y-4">
          <div><legend className="h2">{s.title}</legend><p className="text-sm text-muted">{s.intro}</p></div>
          {s.questions.map((q) => (
            <div key={q.id}>
              <label className="label" htmlFor={q.id}>{q.label}{q.required && <span className="text-bad"> *</span>}</label>
              {q.type === "textarea" ? (
                <textarea id={q.id} rows={3} className="input" required={q.required} value={answers[q.id] ?? ""} onChange={(e) => set(q.id, e.target.value)} />
              ) : q.type === "select" ? (
                <select id={q.id} className="input" required={q.required} value={answers[q.id] ?? ""} onChange={(e) => set(q.id, e.target.value)}>
                  <option value="">Choose…</option>
                  {q.options!.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input id={q.id} className="input" required={q.required} value={answers[q.id] ?? ""} onChange={(e) => set(q.id, e.target.value)} />
              )}
            </div>
          ))}
        </fieldset>
      ))}
      <div className="flex flex-wrap items-center gap-3 sticky bottom-0 bg-page/90 backdrop-blur py-3">
        <button type="button" className="btn-ghost" disabled={pending} onClick={() => save(false)}>Save draft</button>
        <button className="btn" disabled={pending}>{submittedAt ? "Update brief" : "Submit brief"}</button>
        {msg && <span className="text-sm text-muted">{msg}</span>}
      </div>
    </form>
  );
}
