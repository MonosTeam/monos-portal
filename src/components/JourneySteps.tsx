import Link from "next/link";
import type { JourneyStep } from "@/lib/journey";
import { markStep } from "@/app/(client)/actions";

type Links = { depositPay?: string | null; balancePay?: string | null; callUrl: string; earliestCall: string; questionsUrl: string };

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

function Confirm({ step, label, note }: { step: string; label: string; note?: string }) {
  return (
    <form action={markStep} className="space-y-2">
      <input type="hidden" name="step" value={step} />
      {note && <textarea name="note" rows={3} className="input" placeholder={note} />}
      <button className="btn-ghost text-sm">{label}</button>
    </form>
  );
}

function Actions({ s, links }: { s: JourneyStep; links: Links }) {
  switch (s.key) {
    case "consultation":
      return <Link href="/brief" className="btn">Start the form</Link>;
    case "agreement":
      return <Link href="/agreement" className="btn">Read and sign</Link>;
    case "deposit":
      return (
        <div className="flex flex-wrap items-start gap-3">
          {links.depositPay && <a href={links.depositPay} {...ext} className="btn">Pay by PayPal</a>}
          <Confirm step="deposit_sent" label="I've paid" />
        </div>
      );
    case "book_call":
      return (
        <div className="space-y-2">
          <p className="text-sm text-muted">The earliest day you can book is <span className="text-ink">{links.earliestCall}</span>.</p>
          <div className="flex flex-wrap items-start gap-3">
            <a href={links.callUrl} {...ext} className="btn">Choose a time</a>
            <Confirm step="call_booked" label="I've booked my call" />
          </div>
        </div>
      );
    case "handover":
      return <Confirm step="handover_done" label="I've had my 1-1 and shared my changes" note="Any changes you'd like to your website (optional). Aisha will also note them on the call." />;
    case "balance":
      return (
        <div className="flex flex-wrap items-start gap-3">
          {links.balancePay && <a href={links.balancePay} {...ext} className="btn">Pay by PayPal</a>}
          <Confirm step="balance_sent" label="I've paid" />
        </div>
      );
  }
}

const dot = { done: "bg-ok text-page", current: "bg-brand text-ink", waiting: "bg-warn text-page", locked: "bg-field text-muted border border-line" } as const;

export function JourneySteps({ steps, links }: { steps: JourneyStep[]; links: Links }) {
  const done = steps.filter((s) => s.state === "done").length;
  const pct = Math.round((done / steps.length) * 100);
  const allDone = done === steps.length;
  const committed = steps.find((s) => s.key === "deposit")?.state === "done";

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="h2">Your steps</h2>
          <span className="text-sm text-muted">{done} of {steps.length} done</span>
        </div>
        <div className="h-2 rounded-full bg-line overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
        {allDone && <p className="text-sm text-ok mt-3">All done. Thank you! We&apos;re connecting your website to your domain.</p>}
      </div>

      {!committed && (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-highlight/40">
          <div>
            <p className="font-medium">Questions before you commit?</p>
            <p className="text-sm text-muted">Book a free 15-minute chat with Aisha about the agreement, your design or how we work.</p>
          </div>
          <a href={links.questionsUrl} {...ext} className="btn-ghost">Book a 15-min chat</a>
        </div>
      )}

      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={s.key} className={`card flex gap-4 ${s.state === "current" ? "border-brand/60" : ""} ${s.state === "locked" ? "opacity-50" : ""}`}>
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-semibold ${dot[s.state]}`} aria-hidden="true">
              {s.state === "done" ? "✓" : s.state === "locked" ? "🔒" : i + 1}
            </span>
            <div className="flex-1 space-y-3 min-w-0">
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted">{s.blurb}</p>
                {s.status && <p className="text-sm text-highlight mt-1">{s.status}</p>}
                {s.state === "locked" && <p className="text-xs text-muted mt-1">Unlocks when step {i} is done.</p>}
              </div>
              {s.state === "current" && <Actions s={s} links={links} />}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
