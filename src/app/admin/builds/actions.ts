"use server";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/data";
import { approveBuild, kickBuild, queueBuild, sendToClient, serviceDb } from "@/lib/site-agent/pipeline";

async function start(projectId: string, changeRequest?: string | null) {
  await requireAdmin();
  const build = await queueBuild(serviceDb(), projectId, changeRequest);
  after(() => kickBuild(build.id));
  revalidatePath("/admin/builds");
  return build.id;
}

export async function startBuild(form: FormData) {
  await start(String(form.get("project_id")));
}

export async function requestChanges(form: FormData) {
  const notes = String(form.get("changes") ?? "").trim();
  if (!notes) return;
  await start(String(form.get("project_id")), notes);
}

export async function approve(form: FormData) {
  await requireAdmin();
  await approveBuild(serviceDb(), String(form.get("id")));
  revalidatePath("/admin/builds");
}

export async function sendClient(form: FormData) {
  await requireAdmin();
  await sendToClient(serviceDb(), String(form.get("id")), String(form.get("message") ?? "").trim() || undefined);
  revalidatePath("/admin/builds");
}
