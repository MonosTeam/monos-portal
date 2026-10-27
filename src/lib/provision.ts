import "server-only";
import { createServiceClient } from "./supabase-server";
import { PACKAGES, depositPence, payLink, type PackageId } from "./packages";
import { defaultAgreement } from "./agreement";
import { gbp, ukDate } from "./format";

const addDays = (iso: string, n: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// Invites the client and sets up their project, stages, payments and agreement from the package.
export async function provisionClient(o: {
  email: string; fullName: string; company: string; phone?: string;
  packageId: PackageId; projectName?: string; pricePence?: number; startDate?: string;
  offerCode?: string; origin: string;
}) {
  const pkg = PACKAGES[o.packageId];
  const price = o.pricePence ?? pkg.pricePence;
  const start = o.startDate || new Date().toISOString().slice(0, 10);
  const db = createServiceClient();

  const { data: invited, error } = await db.auth.admin.inviteUserByEmail(o.email, {
    data: { full_name: o.fullName, company: o.company },
    redirectTo: `${o.origin}/auth/callback?next=/set-password`,
  });
  if (error) {
    throw new Error(/already been registered/i.test(error.message)
      ? "This email already has a MONOS portal account. Please sign in instead."
      : error.message);
  }

  const { data: project, error: pErr } = await db.from("projects").insert({
    client_id: invited.user.id,
    name: o.projectName || `${o.company || o.fullName} website`,
    package_id: pkg.id,
    package: pkg.name,
    price_pence: price,
    start_date: start,
    offer_code: o.offerCode ?? null,
    brief_sections: pkg.briefSections,
    notes: o.phone ? `Phone: ${o.phone}` : null,
  }).select().single();
  if (pErr) throw new Error(pErr.message);

  const deposit = Math.round((price * pkg.depositPct) / 100);
  const results = await Promise.all([
    db.from("stages").insert(pkg.stages.map((s, i) => ({
      project_id: project.id, position: i, name: s.name, client_note: s.note ?? null,
      due_date: addDays(start, s.day - 1), status: i === 0 ? "in_progress" : "todo",
    }))),
    db.from("payments").insert([
      { project_id: project.id, label: `${pkg.depositPct}% on booking`, amount_pence: deposit, due_date: start, payment_url: payLink(pkg, "DEPOSIT") },
      { project_id: project.id, label: `${100 - pkg.depositPct}% on delivery`, amount_pence: price - deposit, due_date: addDays(start, 6), payment_url: payLink(pkg, "BALANCE") },
    ]),
    db.from("agreements").insert({
      project_id: project.id, title: "Website Design Agreement",
      body: defaultAgreement({ clientName: o.fullName, company: o.company, price: gbp(price), startDate: ukDate(start), pkg }),
    }),
  ]);
  const failed = results.find((r) => r.error);
  if (failed) throw new Error(failed.error!.message);
  return { projectId: project.id, depositPence: depositPence({ ...pkg, pricePence: price }), depositLink: payLink(pkg, "DEPOSIT") };
}
