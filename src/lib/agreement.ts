// Default website agreement. Review with your own legal adviser before first use.
export function defaultAgreement(o: { clientName: string; company: string; price: string; startDate: string }) {
  return `This agreement is between MONOS Technology ("MONOS", "we") and ${o.company || o.clientName} ("the Client", "you").

1. The work
MONOS will design and build a website of up to 5 pages, mobile-friendly, with basic on-page SEO, a contact form and connection to your domain, as described in your consultation form.

2. Timeline
We aim to deliver within 7 days of the later of: (a) receipt of your deposit and (b) your completed consultation form and content. Delays in providing content, feedback or access may extend this timeline.

3. Price and payment
The total price is ${o.price}. A 50% deposit is due before work starts and the remaining 50% is due on approval, before the site goes live. Work starts on ${o.startDate} or when the deposit is received, whichever is later.

4. Revisions
Your package includes up to 2 rounds of revisions during the Review stage. Additional changes or new pages can be quoted separately.

5. Content and ownership
You confirm you have the right to use any text, images and logos you provide. On full payment, you own the website design and content created for you. MONOS may show the finished website in our portfolio unless you ask us not to.

6. Hosting and third parties
Domain names, hosting, email and third-party services are billed by their providers under their own terms unless agreed otherwise in writing.

7. Cancellation
You may cancel before the Design stage begins for a full refund of the deposit. After that, the deposit covers work completed and is non-refundable.

8. Liability
MONOS's total liability under this agreement is limited to the amount you have paid. Nothing in this agreement limits liability that cannot be limited under UK law.

9. Law
This agreement is governed by the laws of England and Wales.`;
}
