import { NextResponse } from "next/server";
import { createOrder, paypalReady } from "@/lib/paypal";

// Health check for the PayPal connection. With ?key=PAYPAL_HEALTH_KEY it also creates a
// £1 test order (never captured, so nobody is charged; PayPal expires it). Returns no secrets.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!paypalReady()) return NextResponse.json({ configured: false });
  const key = new URL(req.url).searchParams.get("key");
  if (!process.env.PAYPAL_HEALTH_KEY || key !== process.env.PAYPAL_HEALTH_KEY) return NextResponse.json({ configured: true });
  try {
    const url = await createOrder({
      paymentId: "health-check", amountPence: 100, description: "MONOS portal PayPal check (not charged)",
      returnUrl: "https://monos-portal.netlify.app/dashboard", cancelUrl: "https://monos-portal.netlify.app/dashboard",
    });
    return NextResponse.json({ configured: true, order: "created", checkoutHost: new URL(url).host, env: process.env.PAYPAL_ENV || "live" });
  } catch (e) {
    return NextResponse.json({ configured: true, order: "failed", error: String((e as Error).message).slice(0, 200) });
  }
}
