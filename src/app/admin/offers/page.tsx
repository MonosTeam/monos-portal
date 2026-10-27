import { headers } from "next/headers";
import { requireAdmin, gbp, ukDate } from "@/lib/data";
import { PACKAGES, SALES_TARGET, type PackageId } from "@/lib/packages";
import { createOfferCode, toggleOfferCode } from "../actions";

export default async function OffersPage() {
  const { supabase } = await requireAdmin();
  const { data: codes } = await supabase.from("offer_codes").select("*").order("created_at", { ascending: false });
  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `https://${h.get("host")}`;
  const offers = Object.values(PACKAGES).filter((p) => p.inviteOnly);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Private offers</h1>
        <p className="text-muted mt-1">Offer links only work for people who have them, so the offer stays out of the public website. Anyone booking without a code pays the retail price ({gbp(PACKAGES.retail.pricePence)}).</p>
      </div>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted border-b border-line">
            <tr><th className="px-5 py-3 font-medium">Code</th><th className="px-3 font-medium">Offer</th><th className="px-3 font-medium">Used</th><th className="px-3 font-medium">Expires</th><th className="px-3 font-medium">Link for your emails</th><th className="px-3" /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(codes ?? []).map((c) => (
              <tr key={c.code} className={c.active ? "" : "opacity-50"}>
                <td className="px-5 py-3 font-mono font-medium">{c.code}{c.email && <div className="text-xs text-muted font-sans">{c.email} only</div>}</td>
                <td className="px-3">{PACKAGES[c.package_id as PackageId]?.name ?? c.package_id}{c.label && <div className="text-xs text-muted">{c.label}</div>}</td>
                <td className="px-3">{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                <td className="px-3 whitespace-nowrap">{c.expires_at ? ukDate(c.expires_at) : "Never"}</td>
                <td className="px-3"><code className="text-xs break-all select-all">{`${origin}/book?offer=${c.code}`}</code></td>
                <td className="px-3">
                  <form action={toggleOfferCode}><input type="hidden" name="code" value={c.code} /><input type="hidden" name="active" value={String(!c.active)} /><button className="btn-ghost">{c.active ? "Pause" : "Resume"}</button></form>
                </td>
              </tr>
            ))}
            {!codes?.length && <tr><td colSpan={6} className="px-5 py-6 text-muted">No offer codes yet. Create one below.</td></tr>}
          </tbody>
        </table>
      </div>

      <form action={createOfferCode} className="card grid gap-4 sm:grid-cols-2">
        <h2 className="h2 sm:col-span-2">Create an offer code</h2>
        <p className="text-sm text-muted sm:col-span-2 -mt-2">Use one campaign code for an email blast (for example capped at {SALES_TARGET.count} places, ending 15 Nov), or lock a code to one email address for a personal invite.</p>
        <div><label className="label">Code</label><input name="code" required defaultValue="LAUNCH490" className="input font-mono uppercase" /></div>
        <div><label className="label">Offer</label><select name="package_id" className="input">{offers.map((p) => <option key={p.id} value={p.id}>{p.name} ({gbp(p.pricePence)})</option>)}</select></div>
        <div><label className="label">Places (max uses)</label><input name="max_uses" type="number" defaultValue={SALES_TARGET.count} className="input" /></div>
        <div><label className="label">Expires</label><input name="expires_at" type="date" defaultValue={SALES_TARGET.deadline} className="input" /></div>
        <div><label className="label">Lock to one email (optional)</label><input name="email" type="email" className="input" /></div>
        <div><label className="label">Internal label (optional)</label><input name="label" placeholder="e.g. Nov email blast" className="input" /></div>
        <div className="sm:col-span-2"><button className="btn">Create code</button></div>
      </form>
    </div>
  );
}
