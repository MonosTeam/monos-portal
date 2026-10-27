import "server-only";
import { createServiceClient } from "@/lib/supabase-server";
import { PACKAGES, type PackageId, type Package } from "@/lib/packages";

// Checks a code without using it up. Returns the offer package, or null if the code can't be used.
export async function lookupOffer(code: string | undefined | null): Promise<Package | null> {
  if (!code) return null;
  const { data } = await createServiceClient()
    .from("offer_codes").select("*").ilike("code", code.trim()).maybeSingle();
  if (!data || !data.active) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  if (data.max_uses != null && data.used_count >= data.max_uses) return null;
  return PACKAGES[data.package_id as PackageId] ?? null;
}
