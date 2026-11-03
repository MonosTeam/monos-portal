"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getClientProject } from "@/lib/data";
import { sendEmail, ADMIN_EMAIL } from "@/lib/email";
import { kickBuild, queueBuild, serviceDb } from "@/lib/site-agent/pipeline";

export async function saveBrief(answers: Record<string, string>, submit: boolean) {
  const { supabase, project } = await getClientProject();
  if (!project) throw new Error("No project");
  const { error } = await supabase.from("consultations").upsert({
    project_id: project.id,
    answers,
    updated_at: new Date().toISOString(),
    ...(submit ? { submitted_at: new Date().toISOString() } : {}),
  });
  if (error) throw new Error(error.message);
  // First submission: the website agent starts building the site straight away.
  if (submit && process.env.SITE_AGENT_AUTO !== "off") {
    const db = serviceDb();
    const { count } = await db.from("site_builds").select("id", { count: "exact", head: true }).eq("project_id", project.id);
    if (!count) {
      const build = await queueBuild(db, project.id);
      await kickBuild(build.id); // the worker replies 202 straight away and builds in the background
    }
  }
  revalidatePath("/", "layout");
}

export async function signAgreement(agreementId: string, name: string) {
  const { supabase } = await getClientProject();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
  const { error } = await supabase.rpc("sign_agreement", { aid: agreementId, name: name.trim(), ip });
  if (error) throw new Error(error.message);
  const { project } = await getClientProject();
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Agreement signed: ${project?.name ?? "client"}`,
    html: `<p>${name.trim().replace(/[<>&]/g, "")} signed the agreement for <strong>${(project?.name ?? "").replace(/[<>&]/g, "")}</strong>.</p>`,
  }).catch((e) => console.error("[email] signature notice failed", e));
  revalidatePath("/", "layout");
}

export async function recordUpload(path: string, name: string) {
  const { supabase, project, user } = await getClientProject();
  if (!project) throw new Error("No project");
  const { error } = await supabase.from("files").insert({ project_id: project.id, path, name, uploaded_by: user.id });
  if (error) throw new Error(error.message);
  revalidatePath("/files");
}

const STEP_NOTICE: Record<string, string> = {
  call_booked: "has booked their 1-1 with you.",
  handover_done: "has finished their 1-1 handover.",
};

/** Client confirms a step they did outside the portal (PayPal, Cal.com, the 1-1). */
export async function markStep(form: FormData) {
  const step = String(form.get("step") ?? "");
  const note = String(form.get("note") ?? "").trim();
  const { supabase, project, profile } = await getClientProject();
  if (!project || !(step in STEP_NOTICE)) throw new Error("Not allowed");
  const { error } = await supabase.rpc("mark_journey", { pid: project.id, step, note: note || null });
  if (error) throw new Error(error.message);
  const esc = (t: string) => t.replace(/[<>&]/g, "");
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `${project.name}: ${step.replace("_", " ")}`,
    html: `<p><strong>${esc(profile?.full_name || project.name)}</strong> (${esc(project.name)}) ${STEP_NOTICE[step]}</p>${note ? `<p>Their changes:</p><p style="white-space:pre-wrap">${esc(note)}</p>` : ""}`,
  }).catch((e) => console.error("[email] step notice failed", e));
  revalidatePath("/", "layout");
}
