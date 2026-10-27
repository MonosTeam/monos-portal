import { redirect } from "next/navigation";
import { getClientProject, ukDate } from "@/lib/data";
import { Uploader } from "./Uploader";

export default async function FilesPage() {
  const { supabase, project } = await getClientProject();
  if (!project?.modules.uploads) redirect("/dashboard");
  const { data: files } = await supabase.from("files").select("*").eq("project_id", project.id).order("created_at", { ascending: false });
  return (
    <div className="space-y-6">
      <div><h1 className="h1">Files</h1><p className="text-muted mt-1">Upload your logo, photos, and any text or documents for your website.</p></div>
      <Uploader projectId={project.id} />
      <div className="card">
        <h2 className="h2 mb-3">Uploaded</h2>
        {files?.length ? (
          <ul className="divide-y divide-line">{files.map((f) => <li key={f.id} className="py-2 flex justify-between text-sm"><span>{f.name}</span><span className="text-muted">{ukDate(f.created_at)}</span></li>)}</ul>
        ) : <p className="text-sm text-muted">Nothing uploaded yet.</p>}
      </div>
    </div>
  );
}
