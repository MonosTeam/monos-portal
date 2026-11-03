import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { captureOrder } from "@/lib/paypal";
import { sendEmail, ADMIN_EMAIL } from "@/lib/email";
import { gbp } from "@/lib/format";

// PayPal sends the client back here after they approve. We capture the money and,
// only if PayPal says it's completed for the right amount, mark the payment paid.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  const orderId = url.searchParams.get("token");
  if (!orderId) return NextResponse.redirect(`${origin}/dashboard`);
  try {
    const cap = await captureOrder(orderId);
    if (!cap) return NextResponse.redirect(`${origin}/dashboard?payerror=1`);
    const db = createServiceClient();
    const { data: pay } = await db.from("payments").select("id, label, amount_pence, status, projects(name)").eq("id", cap.paymentId).maybeSingle();
    if (!pay) return NextResponse.redirect(`${origin}/dashboard?payerror=1`);
    if (pay.status !== "paid") {
      if (cap.amountPence < pay.amount_pence) {
        console.error("[paypal] amount too low", cap, pay.amount_pence);
        return NextResponse.redirect(`${origin}/dashboard?payerror=1`);
      }
      await db.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", pay.id);
      const project = (Array.isArray(pay.projects) ? pay.projects[0] : pay.projects) as { name: string } | null;
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `Paid: ${gbp(pay.amount_pence)} from ${project?.name ?? "a client"}`,
        html: `<p><strong>${(project?.name ?? "A client").replace(/[<>&]/g, "")}</strong> paid ${gbp(pay.amount_pence)} (${pay.label}) by PayPal. It's marked paid in the portal and their next step is unlocked.</p><p>PayPal capture: ${cap.captureId}</p>`,
      }).catch((e) => console.error("[email] paid notice failed", e));
    }
    return NextResponse.redirect(`${origin}/dashboard?paid=1`);
  } catch (e) {
    console.error("[paypal] capture", e);
    return NextResponse.redirect(`${origin}/dashboard?payerror=1`);
  }
}
