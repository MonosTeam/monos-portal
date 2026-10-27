import type { Package } from "./packages";

// Default website agreement, built from the package. Review with your own legal adviser before first use.
export function defaultAgreement(o: { clientName: string; company: string; price: string; startDate: string; pkg: Package }) {
  const { pkg } = o;
  const pages = pkg.pages
    ? `the following 5 pages: ${pkg.pages.join(", ")}`
    : "up to 5 pages of your choice";
  const extras = pkg.extras.length ? `\nYour package also includes: ${pkg.extras.join("; ")}.` : "";
  const rounds = pkg.revisions === 1 ? "1 round of revisions" : `up to ${pkg.revisions} rounds of revisions`;
  return `This agreement is between MONOS Technology ("MONOS", "we") and ${o.company || o.clientName} ("the Client", "you").

Package: ${pkg.name}

1. The work
MONOS will design and build a mobile-friendly website with ${pages}, with basic on-page SEO and a contact form, as described in your consultation form.${extras}

2. Timeline
We aim to deliver within 7 days of the later of: (a) receipt of your booking payment and (b) your completed consultation form and content. Delays in providing content, feedback or access may extend this timeline.

3. Price and payment
The total price is ${o.price}. ${pkg.depositPct}% is due on signing/booking, before work starts, and the remaining ${100 - pkg.depositPct}% is due on delivery, before the site goes live. Work starts on ${o.startDate} or when the booking payment is received, whichever is later.

4. Revisions
Your package includes ${rounds} during the Review stage. Additional changes or new pages can be quoted separately.

5. Content and ownership
You confirm you have the right to use any text, images and logos you provide. On full payment, you own the website design and content created for you. MONOS may show the finished website in our portfolio unless you ask us not to.

6. Domain, hosting and third parties
${pkg.extras.some((e) => /domain/i.test(e)) ? "We will connect the website to a domain you already own; you must give us access to your domain provider or make the DNS changes we send you. " : ""}Domain names, hosting, email and third-party services are billed by their providers under their own terms unless agreed otherwise in writing.

7. Cancellation
You may cancel before the Design stage begins for a full refund of your booking payment. After that, the booking payment covers work completed and is non-refundable.

8. Liability
MONOS's total liability under this agreement is limited to the amount you have paid. Nothing in this agreement limits liability that cannot be limited under UK law.

9. Law
This agreement is governed by the laws of England and Wales.`;
}
