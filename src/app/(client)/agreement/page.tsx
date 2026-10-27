import { redirect } from "next/navigation";
import { getClientProject, type Agreement } from "@/lib/data";
import { SignBox } from "./SignBox";

export default async function AgreementPage() {
  const { supabase, project } = await getClientProject();
  if (!project?.modules.agreement) redirect("/dashboard");
  const { data } = await supabase.from("agreements").select("*").eq("project_id", project.id);
  const agreements = (data ?? []) as Agreement[];
  if (!agreements.length) return <div className="card"><h1 className="h1">Agreement</h1><p className="text-muted mt-2">Your agreement will appear here shortly.</p></div>;
  return (
    <div className="space-y-6">
      {agreements.map((a) => (
        <article key={a.id} className="card print:border-0">
          <h1 className="h1 mb-4">{a.title}</h1>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{a.body}</div>
          <SignBox agreement={a} />
        </article>
      ))}
    </div>
  );
}
