import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { provisionClient } from "@/lib/provision";
import { PACKAGES, type PackageId } from "@/lib/packages";

// Public sign-up endpoint for the festive offer page (/festive-offer) (and any other form).
// POST JSON { name, business, email, phone, industry, domain, about, source, offer? }.
// The offer code can also be given in the URL: /api/signup?offer=LAUNCH490. Without a valid code the client books at retail price.
const allowed = (process.env.SIGNUP_ALLOWED_ORIGINS || "*").split(",").map((s) => s.trim());

function cors(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allow = allowed.includes("*") ? "*" : allowed.includes(origin) ? origin : allowed[0];
  return { "Access-Control-Allow-Origin": allow, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Accept", Vary: "Origin" };
}

export function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: cors(req) });
}

export async function POST(req: Request) {
  const headers = cors(req);
  const reply = (status: number, body: object) => NextResponse.json(body, { status, headers });
  let b: Record<string, string>;
  try {
    const raw = req.headers.get("content-type")?.includes("json") ? await req.json() : Object.fromEntries(await req.formData());
    b = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, String(v ?? "").trim().slice(0, 2000)]));
  } catch {
    return reply(400, { ok: false, error: "Invalid request." });
  }
  if (b.website) return reply(200, { ok: true }); // honeypot

  const email = (b.email || "").toLowerCase();
  const fullName = b.name || b.full_name || "";
  const company = b.business || b.company || "";
  if (!/^\S+@\S+\.\S+$/.test(email) || !fullName || !company) return reply(400, { ok: false, error: "Name, business and a valid email are required." });

  const code = (new URL(req.url).searchParams.get("offer") || b.offer || "").toUpperCase();
  const db = createServiceClient();
  let packageId: PackageId = "retail";
  if (code) {
    const { data: pkg } = await db.rpc("redeem_offer_code", { c: code, e: email });
    if (!pkg) return reply(410, { ok: false, error: "This offer has expired or is fully booked." });
    packageId = pkg as PackageId;
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  try {
    const res = await provisionClient({
      email, fullName, company, phone: b.phone || b.mobile, packageId, offerCode: code || undefined, origin: site, source: b.source,
      prefill: { business_name: company, what_you_do: b.about || "", domain_name: b.domain || "", industry: b.industry || "", mobile: b.phone || b.mobile || "" },
    });
    return reply(200, {
      ok: true,
      package: PACKAGES[packageId].name,
      depositPence: res.depositPence,
      depositLink: res.depositLink,
      portalUrl: `${site}/login`,
    });
  } catch (e) {
    if (code) {
      const { data } = await db.from("offer_codes").select("used_count").ilike("code", code).single();
      if (data) await db.from("offer_codes").update({ used_count: Math.max(0, data.used_count - 1) }).ilike("code", code);
    }
    const msg = (e as Error).message;
    return reply(/already has/.test(msg) ? 409 : 500, { ok: false, error: msg });
  }
}
