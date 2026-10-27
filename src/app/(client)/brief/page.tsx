import { redirect } from "next/navigation";
import { getClientProject } from "@/lib/data";
import { BRIEF_SECTIONS } from "@/lib/brief";
import { BriefForm } from "./BriefForm";

export default async function BriefPage() {
  const { supabase, project } = await getClientProject();
  if (!project?.modules.consultation) redirect("/dashboard");
  const { data } = await supabase.from("consultations").select("*").eq("project_id", project.id).maybeSingle();
  const sections = BRIEF_SECTIONS.filter((s) => project.brief_sections.includes(s.id));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Consultation form</h1>
        <p className="text-muted mt-1">This is your website brief. Save as you go and submit when you&apos;re happy. The sooner it&apos;s in, the sooner your 7-day build starts.</p>
      </div>
      <BriefForm sections={sections} initial={(data?.answers as Record<string, string>) ?? {}} submittedAt={data?.submitted_at ?? null} />
    </div>
  );
}
