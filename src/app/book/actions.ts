"use server";
import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase-server";
import { provisionClient } from "@/lib/provision";
import { PACKAGES, type PackageId } from "@/lib/packages";

export type BookState = { ok: boolean; error?: string; packageName?: string; deposit?: number; depositLink?: string | null };

export async function book(_: BookState, form: FormData): Promise<BookState> {
  if (form.get("website")) return { ok: true }; // honeypot: bots fill hidden fields
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const fullName = String(form.get("full_name") ?? "").trim();
  const company = String(form.get("company") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const code = String(form.get("offer") ?? "").trim().toUpperCase();
  if (!email || !fullName || !company) return { ok: false, error: "Please fill in your name, business and email." };

  const db = createServiceClient();
  let packageId: PackageId = "retail";
  if (code) {
    const { data: pkg } = await db.rpc("redeem_offer_code", { c: code, e: email });
    if (!pkg) return { ok: false, error: "Sorry, this offer link has expired, is fully booked, or wasn't sent to this email address." };
    packageId = pkg as PackageId;
  }

  try {
    const h = await headers();
    const res = await provisionClient({
      email, fullName, company, phone, packageId, offerCode: code || undefined,
      origin: h.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL!,
    });
    return { ok: true, packageName: PACKAGES[packageId].name, deposit: res.depositPence, depositLink: res.depositLink };
  } catch (e) {
    // Give the place back if the booking didn't go through.
    if (code) {
      const { data } = await db.from("offer_codes").select("used_count").ilike("code", code).single();
      if (data) await db.from("offer_codes").update({ used_count: Math.max(0, data.used_count - 1) }).ilike("code", code);
    }
    return { ok: false, error: (e as Error).message };
  }
}
