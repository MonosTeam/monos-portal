"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/data";
import { provisionClient } from "@/lib/provision";
import { PACKAGES, type PackageId } from "@/lib/packages";

export async function createClientProject(form: FormData) {
  await requireAdmin();
  const packageId = (String(form.get("package_id")) in PACKAGES ? form.get("package_id") : "retail") as PackageId;
  const price = form.get("price") ? Math.round(Number(form.get("price")) * 100) : undefined;
  const { projectId } = await provisionClient({
    email: String(form.get("email")).trim().toLowerCase(),
    fullName: String(form.get("full_name")).trim(),
    company: String(form.get("company") ?? "").trim(),
    projectName: String(form.get("project_name") ?? "").trim() || undefined,
    packageId,
    pricePence: price,
    startDate: String(form.get("start_date") || "") || undefined,
    origin: (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL!,
  });
  redirect(`/admin/projects/${projectId}`);
}

export async function createOfferCode(form: FormData) {
  const { supabase } = await requireAdmin();
  const code = String(form.get("code")).trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const { error } = await supabase.from("offer_codes").insert({
    code,
    package_id: String(form.get("package_id")),
    label: form.get("label") || null,
    max_uses: form.get("max_uses") ? Number(form.get("max_uses")) : null,
    email: String(form.get("email") ?? "").trim().toLowerCase() || null,
    expires_at: form.get("expires_at") ? `${form.get("expires_at")}T23:59:59Z` : null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/offers");
}

export async function toggleOfferCode(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("offer_codes").update({ active: form.get("active") === "true" }).eq("code", String(form.get("code")));
  revalidatePath("/admin/offers");
}

export async function updateStage(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(form.get("id"));
  await supabase.from("stages").update({
    status: form.get("status"),
    due_date: form.get("due_date") || null,
    client_note: form.get("client_note") || null,
  }).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function updateProject(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(form.get("id"));
  await supabase.from("projects").update({
    name: form.get("name"),
    package: form.get("package"),
    notes: form.get("notes") || null,
    modules: {
      consultation: form.get("m_consultation") === "on",
      agreement: form.get("m_agreement") === "on",
      payments: form.get("m_payments") === "on",
      uploads: form.get("m_uploads") === "on",
    },
    brief_sections: form.getAll("brief_sections").map(String),
  }).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function upsertPayment(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = form.get("id") ? String(form.get("id")) : undefined;
  const status = String(form.get("status") || "due");
  const row = {
    project_id: String(form.get("project_id")),
    label: String(form.get("label")),
    amount_pence: Math.round(Number(form.get("amount")) * 100),
    due_date: form.get("due_date") || null,
    status,
    payment_url: form.get("payment_url") || null,
    paid_at: status === "paid" ? new Date().toISOString() : null,
  };
  if (id) await supabase.from("payments").update(row).eq("id", id);
  else await supabase.from("payments").insert(row);
  revalidatePath("/admin", "layout");
}

export async function updateAgreement(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("agreements").update({ title: form.get("title"), body: form.get("body") })
    .eq("id", String(form.get("id"))).is("signed_at", null);
  revalidatePath("/admin", "layout");
}


/** Aisha ticks off a client step herself (e.g. after the 1-1 handover). */
export async function adminMarkStep(form: FormData) {
  const { supabase } = await requireAdmin();
  const pid = String(form.get("project_id"));
  const { error } = await supabase.rpc("mark_journey", { pid, step: String(form.get("step")), note: null });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/projects/${pid}`);
}
