"use client";
import { useState, useTransition } from "react";
import type { Agreement } from "@/lib/data";
import { signAgreement } from "../actions";

export function SignBox({ agreement }: { agreement: Agreement }) {
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (agreement.signed_at) {
    return (
      <div className="mt-8 border-t border-line pt-6 space-y-3">
        <p className="text-sm">Signed by <span className="font-serif italic text-lg">{agreement.signed_name}</span> on {new Date(agreement.signed_at).toLocaleString("en-GB")}</p>
        <div className="flex flex-wrap gap-3 print:hidden">
          <a href="/payments" className="btn">Make your booking payment</a>
          <button className="btn-ghost" onClick={() => window.print()}>Download PDF</button>
        </div>
      </div>
    );
  }
  return (
    <form
      className="mt-8 border-t border-line pt-6 space-y-4 print:hidden"
      onSubmit={(e) => { e.preventDefault(); start(async () => { try { await signAgreement(agreement.id, name); } catch (e) { setErr((e as Error).message); } }); }}
    >
      <div>
        <label className="label" htmlFor="sig">Type your full name to sign</label>
        <input id="sig" className="input font-serif italic text-lg" required minLength={3} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
        I have read and agree to this agreement, and I understand that typing my name is my electronic signature.
      </label>
      <button className="btn" disabled={pending || !agree}>Sign agreement</button>
      {err && <p className="text-sm text-bad">{err}</p>}
    </form>
  );
}
