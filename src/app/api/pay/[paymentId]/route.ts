import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createOrder, paypalReady } from "@/lib/paypal";

// Client clicks "Pay by PayPal": create a PayPal order for exactly this payment and send them to it.
export async function GET(req: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  const supabase = await createClient();
  // Row-level security: a client can only read their own payments.
  const { data: pay } = await supabase.from("payments").select("id, label, amount_pence, status, payment_url, projects(name)").eq("id", paymentId).maybeSingle();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  if (!pay) return NextResponse.redirect(`${origin}/dashboard`);
  if (pay.status === "paid") return NextResponse.redirect(`${origin}/dashboard?paid=1`);
  if (!paypalReady()) return NextResponse.redirect(pay.payment_url || `${origin}/payments`);
  const project = (Array.isArray(pay.projects) ? pay.projects[0] : pay.projects) as { name: string } | null;
  try {
    const url = await createOrder({
      paymentId: pay.id,
      amountPence: pay.amount_pence,
      description: `MONOS Technology: ${project?.name ?? "website"} (${pay.label})`,
      returnUrl: `${origin}/api/pay/return`,
      cancelUrl: `${origin}/dashboard?cancelled=1`,
    });
    return NextResponse.redirect(url);
  } catch (e) {
    console.error("[paypal] create order", e);
    return NextResponse.redirect(pay.payment_url || `${origin}/dashboard?payerror=1`);
  }
}
