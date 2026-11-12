import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createServiceClient } from "@/lib/supabase-server";
import { sendEmail, ADMIN_EMAIL } from "@/lib/email";
import { gbp } from "@/lib/format";
import { PRODUCTS, SITE, isProduct, totalPence, createSessionOrder, modeReady, esc } from "@/lib/one-to-one";

// The Book a 1-1 page on monostechnology.co.uk posts its agenda form here (a normal form POST).
// We email Aisha the agenda, create a PayPal order for the server-side price, and send the
// visitor to PayPal. After paying, PayPal returns them to /api/one-to-one/return.
export const dynamic = "force-dynamic";

const FIELDS = ["product", "name", "email", "phone", "business", "website", "stage", "agenda", "outcome", "later_sessions", "prep_links", "agree", "express", "test", "company_url"] as const;

export async function POST(req: Request) {
  const url = new URL(req.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  let b: Record<string, string> = {};
  try {
    const fd = await req.formData();
    b = Object.fromEntries(FIELDS.map((k) => [k, String(fd.get(k) ?? "").trim().slice(0, k === "agenda" || k === "later_sessions" ? 3000 : 600)]));
  } catch {
    return NextResponse.redirect(`${SITE}/book-aisha?error=form#book`, 303);
  }
  const page = isProduct(b.product) ? PRODUCTS[b.product].page : "book-aisha";
  const back = (err: string) => NextResponse.redirect(`${SITE}/${page}?error=${err}#book`, 303);

  if (b.company_url) return NextResponse.redirect(`${SITE}/${page}?sent=1`, 303); // honeypot
  if (!isProduct(b.product)) return back("product");
  const email = b.email.toLowerCase();
  if (!b.name || !/^\S+@\S+\.\S+$/.test(email) || b.agenda.length < 10 || b.agree !== "yes") return back("missing");

  const product = b.product;
  const p = PRODUCTS[product];
  const express = b.express === "yes";
  const test = !!process.env.PAYPAL_HEALTH_KEY && b.test === process.env.PAYPAL_HEALTH_KEY;
  const mode = test ? "sandbox" : "live";
  if (!modeReady(mode)) return back(test ? "sandbox" : "paypal");
  const ref = randomBytes(4).toString("hex").toUpperCase();
  const total = totalPence(product, express);

  // Existing clients: check the email against portal accounts so Aisha can see at a glance.
  let portalMatch: boolean | null = null;
  if (p.audience === "existing") {
    try {
      const { data } = await createServiceClient().from("profiles").select("id").ilike("email", email).limit(1);
      portalMatch = !!data?.length;
    } catch { portalMatch = null; }
  }

  const row = (k: string, v?: string | null) => (v ? `<tr><td style="padding:6px 12px 6px 0;color:#5f595b;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:6px 0">${esc(v).replace(/\n/g, "<br>")}</td></tr>` : "");
  const html = `${express ? `<p style="background:#d23b2c;color:#fff;font-weight:700;padding:10px 14px;border-radius:8px;margin:0 0 16px">PRIORITY EXPRESS: they need to speak to you urgently</p>` : ""}
<p style="margin:0 0 6px"><strong>${esc(b.name)}</strong> has filled in the 1-1 agenda form and is now paying ${gbp(total)} by PayPal.${test ? " <strong>(TEST booking, sandbox money)</strong>" : ""}</p>
<p style="margin:0 0 16px;color:#5f595b">You'll get a second email marked PAID with ref <strong>${ref}</strong> once PayPal confirms the money.</p>
<table style="border-collapse:collapse;font-size:14px;width:100%">
${row("Ref", ref)}${row("Session", p.label + (express ? " + Priority express (£25)" : ""))}${row("Total", gbp(total))}
${row("Client type", p.audience === "existing" ? `Existing client${portalMatch === true ? " (email matches a portal account)" : portalMatch === false ? " (email NOT found in the portal, please check)" : ""}` : "New client")}
${row("Name", b.name)}${row("Email", email)}${row("Phone", b.phone)}${row("Business", b.business)}${row("Website / social", b.website)}${row("Business stage", b.stage)}
${row("Their agenda", b.agenda)}${row("Great outcome", b.outcome)}${row(product === "client_block" ? "Sessions 2 and 3" : "", b.later_sessions)}${row("Look at before the call", b.prep_links)}
</table>`;
  await sendEmail({
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: `${express ? "[URGENT] " : ""}${test ? "[TEST] " : ""}1-1 agenda: ${b.name}, ${p.short} ${gbp(total)} (awaiting payment, ref ${ref})`,
    html,
  }).catch((e) => console.error("[1to1] intake email failed", e));

  try {
    const approve = await createSessionOrder(mode, {
      ref, product, express, email, name: b.name,
      returnUrl: `${origin}/api/one-to-one/return${test ? "?sb=1" : ""}`,
      cancelUrl: `${SITE}/${page}?cancelled=1#book`,
    });
    return NextResponse.redirect(approve, 303);
  } catch (e) {
    console.error("[1to1] order", e);
    return back("paypal");
  }
}
