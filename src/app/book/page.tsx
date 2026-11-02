import { Logo } from "@/components/Logo";
import { PACKAGES, depositPence } from "@/lib/packages";
import { gbp } from "@/lib/data";
import { lookupOffer } from "./offer";
import { BookForm } from "./BookForm";

export const metadata = { title: "Book your website | MONOS Technology", robots: { index: false } };

export default async function BookPage({ searchParams }: { searchParams: Promise<{ offer?: string }> }) {
  const { offer } = await searchParams;
  const offerPkg = await lookupOffer(offer);
  const pkg = offerPkg ?? PACKAGES.retail;
  const invalidOffer = Boolean(offer) && !offerPkg;

  const included = [
    pkg.pages ? `5 pages: ${pkg.pages.join(", ")}` : "Up to 5 pages of your choice",
    "Mobile-friendly design and basic SEO",
    "Live in 7 days",
    pkg.revisions === 1 ? "1 round of revisions" : `${pkg.revisions} rounds of revisions`,
    ...pkg.extras,
    "Your own client portal to track progress",
  ];

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8"><Logo className="text-lg" /></div>
        {invalidOffer && <div className="card mb-6 border-warn/40 bg-warn/5 text-sm">This offer link has expired or is fully booked. You can still book at our standard price below.</div>}
        <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
          <div className="card">
            {offerPkg && <span className="inline-block rounded-full bg-brand text-brand-ink text-xs font-medium px-3 py-1 mb-3">Festive special offer · invite only</span>}
            <h1 className="h1">{pkg.name}</h1>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-display text-5xl text-highlight">{gbp(pkg.pricePence)}</span>
              {offerPkg && <span className="text-muted line-through">{gbp(PACKAGES.retail.pricePence)}</span>}
            </div>
            <p className="text-sm text-muted mt-1">{gbp(depositPence(pkg))} ({pkg.depositPct}%) on booking, the rest on delivery.</p>
            <ul className="mt-6 space-y-2 text-sm">
              {included.map((i) => <li key={i} className="flex gap-2"><span className="text-ok">✓</span>{i}</li>)}
            </ul>
          </div>
          <BookForm offer={offerPkg ? offer!.toUpperCase() : ""} />
        </div>
      </div>
    </main>
  );
}
