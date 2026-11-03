import "server-only";

// PayPal Orders API. Each portal payment gets its own PayPal order tagged with the
// payment's id, so the portal knows exactly who paid and can unlock the next step itself.
const BASE = process.env.PAYPAL_ENV === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";

export const paypalReady = () => !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);

async function token() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const r = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`PayPal auth failed (${r.status})`);
  return (await r.json()).access_token as string;
}

const pounds = (pence: number) => (pence / 100).toFixed(2);

export async function createOrder(o: { paymentId: string; amountPence: number; description: string; returnUrl: string; cancelUrl: string }) {
  const r = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json", "PayPal-Request-Id": `${o.paymentId}-${Date.now()}` },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ custom_id: o.paymentId, description: o.description.slice(0, 127), amount: { currency_code: "GBP", value: pounds(o.amountPence) } }],
      payment_source: { paypal: { experience_context: { brand_name: "MONOS Technology", landing_page: "GUEST_CHECKOUT", user_action: "PAY_NOW", shipping_preference: "NO_SHIPPING", return_url: o.returnUrl, cancel_url: o.cancelUrl } } },
    }),
    cache: "no-store",
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`PayPal order failed (${r.status}): ${j?.message ?? ""}`);
  const approve = (j.links as { rel: string; href: string }[]).find((l) => l.rel === "payer-action" || l.rel === "approve")?.href;
  if (!approve) throw new Error("PayPal gave no approval link");
  return approve;
}

/** Captures an approved order. Returns the payment id and amount only when the money was actually taken. */
export async function captureOrder(orderId: string) {
  const r = await fetch(`${BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  const j = await r.json();
  // Already captured (e.g. the client refreshed the return page): read the order instead.
  const order = r.ok ? j : j?.details?.[0]?.issue === "ORDER_ALREADY_CAPTURED"
    ? await (await fetch(`${BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`, { headers: { Authorization: `Bearer ${await token()}` }, cache: "no-store" })).json()
    : null;
  const cap = order?.purchase_units?.[0]?.payments?.captures?.[0];
  if (!cap || cap.status !== "COMPLETED") return null;
  return { paymentId: cap.custom_id as string, amountPence: Math.round(parseFloat(cap.amount.value) * 100), captureId: cap.id as string };
}
