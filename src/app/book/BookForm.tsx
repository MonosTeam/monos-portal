"use client";
import { useActionState } from "react";
import { book, type BookState } from "./actions";
import { gbp } from "@/lib/format";

export function BookForm({ offer }: { offer: string }) {
  const [state, action, pending] = useActionState<BookState, FormData>(book, { ok: false });

  if (state.ok) {
    return (
      <div className="card space-y-4">
        <h2 className="h2">You&apos;re booked in! 🎉</h2>
        <p className="text-sm">Check your inbox for an email from MONOS to set up your client portal. There you&apos;ll fill in your brief, upload your photos and sign your agreement.</p>
        {state.deposit ? (
          state.depositLink
            ? <a href={state.depositLink} target="_blank" rel="noopener noreferrer" className="btn w-full">Pay {gbp(state.deposit)} booking payment</a>
            : <p className="text-sm text-muted">We&apos;ll send your {gbp(state.deposit)} booking payment link shortly. Your 7 days start once it&apos;s paid and your brief is in.</p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-4">
      <h2 className="h2">Book your website</h2>
      <input type="hidden" name="offer" value={offer} />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div><label className="label" htmlFor="full_name">Your name</label><input id="full_name" name="full_name" required className="input" /></div>
      <div><label className="label" htmlFor="company">Business name</label><input id="company" name="company" required className="input" /></div>
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="input" /></div>
      <div><label className="label" htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" className="input" /></div>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" required className="mt-1" /> I agree that MONOS can contact me about my website. I&apos;ll review and sign the full agreement in my portal.</label>
      <button className="btn w-full" disabled={pending}>{pending ? "Booking…" : "Book my website"}</button>
      {state.error && <p className="text-sm text-bad">{state.error}</p>}
    </form>
  );
}
