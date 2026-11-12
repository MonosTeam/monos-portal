import { NextResponse } from "next/server";
import { sendEmail, ADMIN_EMAIL } from "@/lib/email";
import { gbp } from "@/lib/format";
import { PRODUCTS, SITE, calLink, captureSessionOrder, esc } from "@/lib/one-to-one";

// PayPal sends the client back here after approving. We capture the money and, only when
// PayPal confirms the full amount, email Aisha and the client and send the client on to
// pick their time in Cal.com.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("token");
  const sandbox = url.searchParams.get("sb") === "1";
  if (!orderId) return NextResponse.redirect(`${SITE}/book-aisha`, 303);
  let cap: Awaited<ReturnType<typeof captureSessionOrder>> = null;
  try {
    cap = await captureSessionOrder(sandbox ? "sandbox" : "live", orderId);
  } catch (e) {
    console.error("[1to1] capture", e);
  }
  if (!cap) return NextResponse.redirect(`${SITE}/book-aisha?error=payment#book`, 303);

  const p = PRODUCTS[cap.product];
  const email = cap.email || cap.payerEmail || "";
  const name = cap.name || cap.payerName || "";
  const first = name.split(" ")[0] || "there";
  const cal = calLink(cap.product, { name, email, ref: cap.ref, express: cap.express });
  const tag = `${cap.express ? "[URGENT] " : ""}${sandbox ? "[TEST] " : ""}`;

  await sendEmail({
    to: ADMIN_EMAIL,
    replyTo: email || undefined,
    subject: `${tag}PAID ${gbp(cap.paidPence)}: 1-1 with ${name || "a client"} (ref ${cap.ref})`,
    html: `${cap.express ? `<p style="background:#d23b2c;color:#fff;font-weight:700;padding:10px 14px;border-radius:8px;margin:0 0 16px">PRIORITY EXPRESS: please contact them today to fit them in</p>` : ""}
<p><strong>${esc(name || "A client")}</strong> (${esc(email)}) paid <strong>${gbp(cap.paidPence)}</strong> for: ${esc(p.label)}${cap.express ? " + Priority express" : ""}.${sandbox ? " <strong>This was a TEST payment in the PayPal sandbox; no real money moved.</strong>" : ""}</p>
<p>Their agenda is in the earlier email with ref <strong>${cap.ref}</strong>. They're now picking a time in Cal.com, which will send you the booking.</p>
<p style="color:#5f595b;font-size:13px">PayPal capture: ${esc(cap.captureId)}</p>`,
  }).catch((e) => console.error("[1to1] admin paid email failed", e));

  if (email) {
    await sendEmail({
      to: email,
      subject: `You're in: your 1-1 with Aisha (ref ${cap.ref})`,
      html: `<p>Hi ${esc(first)},</p>
<p>Thank you, your payment of <strong>${gbp(cap.paidPence)}</strong> for your <strong>${esc(p.label)}</strong>${cap.express ? " with <strong>Priority express</strong>" : ""} is confirmed.</p>
${cap.express ? "<p>As a Priority express booking, our team will email you today to fit you in at the earliest possible slot.</p>" : ""}
<p>If you haven't already, choose your ${cap.product === "client_block" ? "first session (the next two follow weekly on the same day and time)" : "time"} here:</p>
<p style="margin:22px 0"><a href="${esc(cal)}" style="background:#d23b2c;color:#fff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:999px;display:inline-block">Choose your time</a></p>
<p>Please bring your agenda to the session. We've received the one you sent and Aisha will review it beforehand, so you get the most from every minute.</p>
<p style="margin-top:24px">Aisha Ansari<br>Founder &amp; CEO - MONOS Group<br>Multi-award winning Agency in 2024, 2025<br>Finalist x 3 - 2026<br><a href="https://www.monostechnology.co.uk" style="color:#d23b2c">www.monostechnology.co.uk</a></p>
<p style="color:#5f595b;font-size:12px">Booking ref ${cap.ref}. Reply to this email if you need anything.</p>`,
    }).catch((e) => console.error("[1to1] client email failed", e));
  }

  const q = new URLSearchParams({ ref: cap.ref, p: cap.product, n: name, e: email, ...(cap.express ? { x: "1" } : {}), ...(sandbox ? { test: "1" } : {}) });
  return NextResponse.redirect(`${SITE}/book-aisha-confirmed?${q}`, 303);
}
