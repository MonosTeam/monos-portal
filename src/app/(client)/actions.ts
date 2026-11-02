"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
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
      after(() => kickBuild(build.id));
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
