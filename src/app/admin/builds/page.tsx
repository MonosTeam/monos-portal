import Link from "next/link";
import { requireAdmin, ukDate } from "@/lib/data";
import type { SiteBuild } from "@/lib/site-agent/pipeline";
import { AutoRefresh } from "./AutoRefresh";
import { StatusPill, working } from "./status";
import { startBuild } from "./actions";

type Row = { id: string; name: string; profiles: { company: string | null; full_name: string | null } | null; consultations: { submitted_at: string | null } | { submitted_at: string | null }[] | null; site_builds: SiteBuild[] };

export default async function Builds() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("projects")
    .select("id, name, profiles(company, full_name), consultations(submitted_at), site_builds(id, version, status, preview_url, live_url, created_at, ready_at, sent_at, error)")
    .order("created_at", { ascending: false });
  const rows = ((data ?? []) as unknown as Row[]).map((p) => {
    const builds = [...(p.site_builds ?? [])].sort((a, b) => b.version - a.version);
    const c = Array.isArray(p.consultations) ? p.consultations[0] : p.consultations;
    return { ...p, build: builds[0] ?? null, submitted: c?.submitted_at ?? null };
  });
  const waiting = rows.filter((r) => r.build?.status === "ready").length;
  const live = rows.filter((r) => r.build?.status === "published" || r.build?.live_url).length;
  const anyWorking = rows.some((r) => r.build && working(r.build.status));

  return (
    <div className="space-y-6">
      <AutoRefresh active={anyWorking} />
      <div>
        <h1 className="h1">Websites</h1>
        <p className="text-muted">When a client submits their consultation form, the website agent builds their site and emails you a preview. Approve it here to put it live on Netlify.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card"><div className="text-sm text-muted">Waiting for your approval</div><div className="text-3xl font-semibold">{waiting}</div></div>
        <div className="card"><div className="text-sm text-muted">Being built now</div><div className="text-3xl font-semibold">{rows.filter((r) => r.build && working(r.build.status)).length}</div></div>
        <div className="card"><div className="text-sm text-muted">Live</div><div className="text-3xl font-semibold">{live}</div></div>
      </div>
      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted border-b border-line"><tr><th className="px-5 py-3 font-medium">Client</th><th className="px-3 font-medium">Website</th><th className="px-3 font-medium">Links</th><th className="px-3" /></tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-page">
                <td className="px-5 py-3"><div className="font-medium">{r.profiles?.company || r.profiles?.full_name || r.name}</div><div className="text-muted">{r.submitted ? `Brief submitted ${ukDate(r.submitted)}` : "Brief not submitted yet"}</div></td>
                <td className="px-3">{r.build ? <div className="flex items-center gap-2"><StatusPill status={r.build.status} /><span className="text-muted">v{r.build.version}</span></div> : <span className="text-muted">Not started</span>}</td>
                <td className="px-3 whitespace-nowrap">
                  {r.build?.preview_url && <a className="hover:text-brand underline mr-3" href={r.build.preview_url} target="_blank">Preview</a>}
                  {r.build?.live_url && <a className="hover:text-brand underline" href={r.build.live_url} target="_blank">Live site</a>}
                </td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  {r.build ? <Link className={r.build.status === "ready" ? "btn" : "btn-ghost"} href={`/admin/builds/${r.build.id}`}>{r.build.status === "ready" ? "Review" : "Open"}</Link>
                    : r.submitted ? <form action={startBuild}><input type="hidden" name="project_id" value={r.id} /><button className="btn">Build website</button></form>
                    : <form action={startBuild}><input type="hidden" name="project_id" value={r.id} /><button className="btn-ghost" title="Builds from whatever the client has filled in so far">Build from draft</button></form>}
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={4} className="px-5 py-6 text-muted">No clients yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
