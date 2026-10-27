"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin, DEFAULT_STAGES, gbp, ukDate } from "@/lib/data";
import { createServiceClient } from "@/lib/supabase-server";
import { defaultAgreement } from "@/lib/agreement";

const addDays = (iso: string, n: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// Days into the 7-day build each stage is due.
const STAGE_DAY = [1, 2, 5, 6, 7];

export async function createClientProject(form: FormData) {
  const { supabase } = await requireAdmin();
  const email = String(form.get("email")).trim().toLowerCase();
  const fullName = String(form.get("full_name")).trim();
  const company = String(form.get("company") ?? "").trim();
  const projectName = String(form.get("project_name") || `${company || fullName} website`).trim();
  const pricePence = Math.round(Number(form.get("price") || 1000) * 100);
  const start = String(form.get("start_date") || new Date().toISOString().slice(0, 10));

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
  const admin = createServiceClient();
  const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, company },
    redirectTo: `${origin}/auth/callback?next=/set-password`,
  });
  if (error) throw new Error(error.message);

  const { data: project, error: pErr } = await supabase
    .from("projects")
    .insert({ client_id: invited.user.id, name: projectName, price_pence: pricePence, start_date: start })
    .select().single();
  if (pErr) throw new Error(pErr.message);

  const half = Math.round(pricePence / 2);
  await Promise.all([
    supabase.from("stages").insert(DEFAULT_STAGES.map((name, i) => ({
      project_id: project.id, position: i, name, due_date: addDays(start, STAGE_DAY[i] - 1),
      status: i === 0 ? "in_progress" : "todo",
    }))),
    supabase.from("payments").insert([
      { project_id: project.id, label: "50% deposit", amount_pence: half, due_date: start },
      { project_id: project.id, label: "Balance on approval", amount_pence: pricePence - half, due_date: addDays(start, 6) },
    ]),
    supabase.from("agreements").insert({
      project_id: project.id, title: "Website Design Agreement",
      body: defaultAgreement({ clientName: fullName, company, price: gbp(pricePence), startDate: ukDate(start) }),
    }),
  ]);
  redirect(`/admin/projects/${project.id}`);
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

