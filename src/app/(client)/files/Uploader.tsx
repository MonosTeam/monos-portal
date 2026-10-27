"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { recordUpload } from "../actions";

export function Uploader({ projectId }: { projectId: string }) {
  const [status, setStatus] = useState<string | null>(null);

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    const supabase = createClient();
    for (const file of Array.from(list)) {
      setStatus(`Uploading ${file.name}…`);
      const path = `${projectId}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
      const { error } = await supabase.storage.from("client-files").upload(path, file);
      if (error) { setStatus(`${file.name}: ${error.message}`); return; }
      await recordUpload(path, file.name);
    }
    setStatus("All files uploaded.");
  }

  return (
    <label className="card flex flex-col items-center justify-center gap-2 border-dashed cursor-pointer hover:border-brand text-center py-10">
      <span className="font-medium">Click to choose files</span>
      <span className="text-sm text-muted">Images, PDFs and documents up to 50MB</span>
      <input type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      {status && <span className="text-sm text-brand mt-2">{status}</span>}
    </label>
  );
}
