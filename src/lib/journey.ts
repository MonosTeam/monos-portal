import type { Payment } from "./data";
import { gbp } from "./format";

// The 6 steps every client goes through. Each step unlocks when the one before it is done.
export type StepState = "done" | "current" | "waiting" | "locked";
export type JourneyStep = {
  key: "consultation" | "agreement" | "deposit" | "book_call" | "handover" | "balance";
  title: string;
  blurb: string;
  state: StepState;
  status?: string; // short status line, e.g. "Awaiting confirmation"
};

export type Journey = {
  deposit_sent_at?: string; call_booked_at?: string; handover_done_at?: string; balance_sent_at?: string;
  handover_done_note?: string;
};

export const CALL_LINK = () => process.env.CALL_BOOKING_URL || "https://cal.com/aisha-monos-rv64et/30min";
export const QUESTIONS_LINK = () => process.env.QUESTIONS_CALL_URL || "https://cal.com/aisha-monos-rv64et/15min";
export const CALL_LEAD_DAYS = 5;

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Cal.com link that opens on the first day the 1-1 can happen (5 days after the deposit). */
export function callLinkFrom(depositAt: string | null | undefined) {
  const start = depositAt ? new Date(depositAt) : new Date();
  const earliest = new Date(Math.max(start.getTime(), Date.now()) + CALL_LEAD_DAYS * 86400000);
  const day = iso(earliest);
  return { url: `${CALL_LINK()}?month=${day.slice(0, 7)}&date=${day}`, earliest };
}

/** Deposit = the first payment by due date, balance = the last. */
export function splitPayments(payments: Payment[]) {
  const sorted = [...payments].sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? "") || b.amount_pence - a.amount_pence);
  return { deposit: sorted[0], balance: sorted.length > 1 ? sorted[sorted.length - 1] : undefined };
}

export function buildJourney(input: {
  briefSubmitted: boolean;
  agreementSigned: boolean;
  payments: Payment[];
  journey: Journey;
}): JourneyStep[] {
  const { deposit, balance } = splitPayments(input.payments);
  const j = input.journey;
  const depositPaid = deposit?.status === "paid";
  const balancePaid = balance?.status === "paid";

  type RawStep = Omit<JourneyStep, "state" | "status"> & { done: boolean; waiting?: boolean };
  const raw: RawStep[] = [
    { key: "consultation", title: "Consultation form", blurb: "Tell us about your business, your pages and your style. Your website is built from your answers.", done: input.briefSubmitted },
    { key: "agreement", title: "Sign your agreement", blurb: "A short, one-page agreement. Read it and sign with your name.", done: input.agreementSigned },
    {
      key: "deposit", title: `Pay your 75% deposit${deposit ? ` (${gbp(deposit.amount_pence)})` : ""}`,
      blurb: "Pay securely by PayPal. This step ticks off by itself as soon as your payment goes through.",
      done: depositPaid,
    },
    { key: "book_call", title: "Book your 1-1 with Aisha", blurb: `Pick a 30-minute slot at least ${CALL_LEAD_DAYS} days from your deposit, so your website is ready to show you.`, done: !!j.call_booked_at },
    { key: "handover", title: "Your 1-1: see your new website", blurb: "Aisha walks you through your new website on the call and notes any changes you'd like. You have one round of changes.", done: !!j.handover_done_at },
    {
      key: "balance", title: `Pay the final 25%${balance ? ` (${gbp(balance.amount_pence)})` : ""}`,
      blurb: "Once you're happy with your website, pay the balance and we connect it to your domain.",
      done: balancePaid,
    },
  ];

  let unlocked = true;
  return raw.map((s) => {
    const state: StepState = s.done ? "done" : unlocked ? "current" : "locked";
    if (!s.done) unlocked = false;
    return {
      key: s.key, title: s.title, blurb: s.blurb, state,
      ...(s.waiting ? { status: "Payment sent. We'll confirm it shortly." } : {}),
    };
  });
}
