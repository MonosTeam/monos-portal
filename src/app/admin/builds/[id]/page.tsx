import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin, ukDate } from "@/lib/data";
import type { SiteBuild } from "@/lib/site-agent/pipeline";
import { AutoRefresh } from "../AutoRefresh";
import { StatusPill, working } from "../status";
import { approve, requestChanges, sendClient, startBuild } from "../actions";

export default async function BuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_builds").select("*, projects(id, name, profiles(full_name, company, email))").eq("id", id).maybeSingle();
  if (!data) notFound();
  const b = data as SiteBuild & { projects: { id: string; name: string; profiles: { full_name: string; company: string; email: string } } };
  const { data: history } = await supabase.from("site_builds").select("id, version, status, change_request, created_at").eq("project_id", b.project_id).order("version", { ascending: false });
  const c = b.content;
  const client = b.projects.profiles;
  const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <AutoRefresh active={working(b.status)} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/builds" className="text-sm text-muted hover:text-brand">← All websites</Link>
          <h1 className="h1 mt-1">{c?.brand.name || client.company || b.projects.name}</h1>
          <p className="text-muted">{client.full_name} · {client.email} · version {b.version}{b.change_request ? " (with your changes)" : ""}</p>
        </div>
        <StatusPill status={b.status} />
      </div>

      {working(b.status) && <div className="card"><p className="font-medium">The website agent is building this site. It usually takes 2 to 4 minutes, and this page updates by itself.</p><ul className="text-sm text-muted mt-3 space-y-1">{b.log.map((l, i) => <li key={i}>{time(l.at)} · {l.msg}</li>)}</ul></div>}
      {b.status === "failed" && <div className="card border-bad"><p className="font-medium text-bad">The build failed</p><p className="text-sm text-muted mt-1">{b.error}</p><form action={startBuild} className="mt-4"><input type="hidden" name="project_id" value={b.project_id} /><button className="btn">Try again</button></form></div>}

      {(b.status === "ready" || b.status === "published" || b.status === "superseded") && b.preview_url && (
        <>
          <div className="card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="h2">Preview</h2>
              <div className="flex flex-wrap gap-2 text-sm">
                <a className="btn-ghost" href={b.preview_url} target="_blank">Open full screen</a>
                {b.live_url && <a className="btn-ghost" href={b.live_url} target="_blank">Live site</a>}
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
              <iframe src={b.preview_url} className="w-full h-[640px] rounded-lg border border-line bg-white" title="Desktop preview" />
              <iframe src={b.preview_url} className="mx-auto w-[300px] h-[640px] rounded-[28px] border-8 border-ink bg-white" title="Mobile preview" />
            </div>
          </div>

          {c && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card">
                <h2 className="h2 mb-2">Check before approving</h2>
                {b.notes_for_admin.length ? <ul className="list-disc pl-5 space-y-1 text-sm">{b.notes_for_admin.map((n, i) => <li key={i}>{n}</li>)}</ul> : <p className="text-sm text-muted">Nothing flagged.</p>}
              </div>
              <div className="card text-sm space-y-2">
                <h2 className="h2 mb-2">Design</h2>
                <div className="flex items-center gap-3"><span className="h-8 w-8 rounded-full border border-line" style={{ background: c.design.primary }} /><span className="h-8 w-8 rounded-full border border-line" style={{ background: c.design.accent }} /><span className="capitalize">{c.design.theme} theme · {c.design.fonts} fonts</span></div>
                <p className="text-muted">{c.design.rationale}</p>
                <p className="text-muted">Tagline: “{c.brand.tagline}”</p>
              </div>
            </div>
          )}

          {b.status === "ready" && (
            <div className="grid gap-6 md:grid-cols-2">
              <form action={approve} className="card space-y-3">
                <input type="hidden" name="id" value={b.id} />
                <h2 className="h2">Approve and publish</h2>
                <p className="text-sm text-muted">Puts exactly this preview live on Netlify{b.custom_domain ? ` and attaches ${b.custom_domain} (the client's DNS then needs pointing at Netlify)` : ""}. You choose when to send it to the client.</p>
                <button className="btn">Approve and publish</button>
              </form>
              <form action={requestChanges} className="card space-y-3">
                <input type="hidden" name="project_id" value={b.project_id} />
                <h2 className="h2">Ask the agent for changes</h2>
                <textarea name="changes" rows={4} className="input" placeholder="e.g. Make the colours darker, mention free quotes in the hero, swap the gallery and about photos" required />
                <button className="btn-ghost">Rebuild with these changes</button>
              </form>
            </div>
          )}

          {b.status === "published" && (
            <form action={sendClient} className="card space-y-3">
              <input type="hidden" name="id" value={b.id} />
              <h2 className="h2">{b.sent_at ? `Sent to the client on ${ukDate(b.sent_at)}` : "Send to the client"}</h2>
              <p className="text-sm text-muted">Emails {client.email} from info@monos.ai with the live link, their portal link and a reminder that they have one round of changes.</p>
              <textarea name="message" rows={3} className="input" placeholder="Optional personal note (replaces the default first line)" />
              <button className="btn">{b.sent_at ? "Send again" : "Send to client"}</button>
            </form>
          )}
        </>
      )}

      <div className="card">
        <h2 className="h2 mb-3">Versions</h2>
        <ul className="divide-y divide-line text-sm">
          {(history ?? []).map((h) => (
            <li key={h.id} className="py-2 flex flex-wrap items-center gap-3">
              <Link href={`/admin/builds/${h.id}`} className={`font-medium hover:text-brand ${h.id === b.id ? "text-brand" : ""}`}>v{h.version}</Link>
              <StatusPill status={h.status} />
              <span className="text-muted">{ukDate(h.created_at)}</span>
              {h.change_request && <span className="text-muted truncate max-w-md">“{h.change_request}”</span>}
            </li>
          ))}
        </ul>
        <form action={startBuild} className="mt-4"><input type="hidden" name="project_id" value={b.project_id} /><button className="btn-ghost text-sm" disabled={working(b.status)}>Rebuild from scratch (uses the latest brief)</button></form>
      </div>
    </div>
  );
}
