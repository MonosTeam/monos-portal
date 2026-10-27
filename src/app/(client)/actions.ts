"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getClientProject } from "@/lib/data";

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
  revalidatePath("/", "layout");
}

export async function signAgreement(agreementId: string, name: string) {
  const { supabase } = await getClientProject();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
  const { error } = await supabase.rpc("sign_agreement", { aid: agreementId, name: name.trim(), ip });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function recordUpload(path: string, name: string) {
  const { supabase, project, user } = await getClientProject();
  if (!project) throw new Error("No project");
  const { error } = await supabase.from("files").insert({ project_id: project.id, path, name, uploaded_by: user.id });
  if (error) throw new Error(error.message);
  revalidatePath("/files");
}
