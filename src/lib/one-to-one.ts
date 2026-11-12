import "server-only";

// Paid 1-1 sessions with Aisha, booked from monostechnology.co.uk/book-aisha (new clients)
// and /book-aisha-clients (existing clients). Prices live here, on the server, so a
// visitor can't change what they pay by editing the form.

// Where the booking pages live: monostechnology.co.uk/book-aisha (live since 12 Nov 2026).
// The portal keeps a copy at /book-aisha too (public/book-aisha*.html).
export const SITE = (process.env.BOOK_PAGES_URL || "https://monostechnology.co.uk").replace(/\/$/, "");
export const CAL = (process.env.CAL_BASE_URL || "https://cal.com/aisha-monos-rv64et").replace(/\/$/, "");
export const EXPRESS_PENCE = 2500;

export type ProductId = "new_20" | "new_60" | "client_block" | "client_60";
export const PRODUCTS: Record<ProductId, { audience: "new" | "existing"; label: string; short: string; pence: number; cal: string; page: string }> = {
  new_20: { audience: "new", label: "20-minute 1-1 with Aisha", short: "20 min 1-1", pence: 4500, cal: "1-1-with-aisha?duration=20", page: "book-aisha" },
  new_60: { audience: "new", label: "1-hour 1-1 with Aisha", short: "1 hour 1-1", pence: 9000, cal: "1-1-with-aisha?duration=60", page: "book-aisha" },
  client_block: { audience: "existing", label: "Block of 3 weekly 1-hour sessions with Aisha", short: "Block of 3", pence: 22000, cal: "1-1-block", page: "book-aisha-clients" },
  client_60: { audience: "existing", label: "Single 1-hour session with Aisha", short: "1 hour session", pence: 9000, cal: "1-1-with-aisha?duration=60", page: "book-aisha-clients" },
};
export const isProduct = (p: string): p is ProductId => p in PRODUCTS;
export const totalPence = (p: ProductId, express: boolean) => PRODUCTS[p].pence + (express ? EXPRESS_PENCE : 0);

/** Cal.com link for the session, with the client's name, email and booking ref filled in. */
export function calLink(p: ProductId, o: { name?: string; email?: string; ref: string; express?: boolean }) {
  const u = new URL(`${CAL}/${PRODUCTS[p].cal}`);
  if (o.name) u.searchParams.set("name", o.name);
  if (o.email) u.searchParams.set("email", o.email);
  u.searchParams.set("notes", `MONOS ref ${o.ref}${o.express ? " · PRIORITY EXPRESS" : ""}. Agenda already sent.`);
  return u.toString();
}

// ---- PayPal (Orders v2). Live by default; sandbox only for test bookings.
type Mode = "live" | "sandbox";
const base = (m: Mode) => (m === "sandbox" ? process.env.PAYPAL_SANDBOX_API_BASE || "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com");
const creds = (m: Mode) =>
  m === "sandbox"
    ? [process.env.PAYPAL_SANDBOX_CLIENT_ID, process.env.PAYPAL_SANDBOX_CLIENT_SECRET]
    : [process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET];
export const modeReady = (m: Mode) => creds(m).every(Boolean);

async function token(m: Mode) {
  const [id, secret] = creds(m);
  const r = await fetch(`${base(m)}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`PayPal auth failed (${r.status})`);
  return (await r.json()).access_token as string;
}

/** custom_id carries what the return step needs (PayPal allows 127 characters). */
const packMeta = (p: ProductId, express: boolean, email: string, name: string) => [p, express ? 1 : 0, email, name.replace(/\|/g, " ")].join("|").slice(0, 127);
function unpackMeta(s: string) {
  const [p, x, email, name] = (s || "").split("|");
  return isProduct(p) ? { product: p, express: x === "1", email: email || "", name: name || "" } : null;
}

export async function createSessionOrder(m: Mode, o: { ref: string; product: ProductId; express: boolean; email: string; name: string; returnUrl: string; cancelUrl: string }) {
  const value = (totalPence(o.product, o.express) / 100).toFixed(2);
  const r = await fetch(`${base(m)}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await token(m)}`, "Content-Type": "application/json", "PayPal-Request-Id": `1to1-${o.ref}` },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: o.ref,
        custom_id: packMeta(o.product, o.express, o.email, o.name),
        description: `${PRODUCTS[o.product].label}${o.express ? " + Priority express" : ""}`.slice(0, 127),
        amount: { currency_code: "GBP", value },
      }],
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

/** Captures the order. Returns details only when PayPal says the money was taken in full. */
export async function captureSessionOrder(m: Mode, orderId: string) {
  const id = encodeURIComponent(orderId);
  const t = await token(m);
  const r = await fetch(`${base(m)}/v2/checkout/orders/${id}/capture`, { method: "POST", headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" }, cache: "no-store" });
  const j = await r.json();
  const order = r.ok ? j : j?.details?.[0]?.issue === "ORDER_ALREADY_CAPTURED"
    ? await (await fetch(`${base(m)}/v2/checkout/orders/${id}`, { headers: { Authorization: `Bearer ${t}` }, cache: "no-store" })).json()
    : null;
  const unit = order?.purchase_units?.[0];
  const cap = unit?.payments?.captures?.[0];
  if (!cap || cap.status !== "COMPLETED" || cap.amount?.currency_code !== "GBP") return null;
  const meta = unpackMeta(cap.custom_id ?? unit?.custom_id);
  if (!meta) return null;
  const paid = Math.round(parseFloat(cap.amount.value) * 100);
  if (paid < totalPence(meta.product, meta.express)) return null;
  const payerName = [order?.payer?.name?.given_name, order?.payer?.name?.surname].filter(Boolean).join(" ");
  return { ...meta, ref: (unit?.reference_id as string) || orderId.slice(-8), paidPence: paid, captureId: cap.id as string, payerEmail: order?.payer?.email_address as string | undefined, payerName };
}

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
