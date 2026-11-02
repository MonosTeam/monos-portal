import type { Package } from "./packages";

// One-page website agreement, built from the package. Have it checked by a legal adviser before first use.
export function defaultAgreement(o: { clientName: string; company: string; price: string; startDate: string; pkg: Package }) {
  const { pkg } = o;
  const pages = pkg.pages ? pkg.pages.join(", ") : "up to 5 pages of your choice";
  const rounds = pkg.revisions === 1 ? "1 round of revisions" : `${pkg.revisions} rounds of revisions`;
  const domain = pkg.extras.some((e) => /domain/i.test(e));
  return `Between MONOS Technology ("MONOS") and ${o.company || o.clientName} ("you"). Package: ${pkg.name}, ${o.price}.

1. What you get: a mobile-friendly website with ${pages}, basic on-page SEO, a contact form and ${rounds}${pkg.extras.length ? `, plus ${pkg.extras.join(" and ").toLowerCase()}` : ""}.

2. Payment: ${pkg.depositPct}% on signing/booking, and ${100 - pkg.depositPct}% on delivery once you've approved your site, before it goes live${domain ? " on your domain" : ""}.

3. Timeline: we deliver within 7 days of receiving both your booking payment and your completed consultation form. Late content or feedback moves the date.

4. Your content: you confirm you have the right to use the text, images and logos you give us. Once you've paid in full, the website is yours. We may show it in our portfolio unless you tell us not to.

5. Extras: domain, hosting and email services are billed by their providers. Changes beyond the included revisions or extra pages are quoted separately.

6. Cancellation: cancel before design starts for a full refund. After that, the booking payment covers work done and isn't refundable.

7. Liability: our total liability is limited to what you've paid us, except where UK law doesn't allow a limit.

8. This agreement is governed by the laws of England and Wales. Start date: ${o.startDate}.`;
}
