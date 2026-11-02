// The website agent's pipeline: brief -> content (Claude) -> images -> static site -> Netlify draft
// -> email Aisha -> Aisha approves in the portal -> publish -> Aisha sends it to the client.
// Uses the Supabase service role, so it only ever runs on the server.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { generateContent } from "./generate";
import { assignImages, prepareUploads, type RawUpload } from "./images";
import { renderSite } from "./render";
import { createSite, deployDraft, publishDeploy, setCustomDomain } from "./netlify";
import { ADMIN_EMAIL, button, h, mail } from "./mail";
import type { Answers, SiteContent } from "./schema";

export type BuildStatus = "queued" | "generating" | "deploying" | "ready" | "published" | "superseded" | "failed";
export type SiteBuild = {
  id: string; project_id: string; version: number; status: BuildStatus; change_request: string | null;
  content: SiteContent | null; notes_for_admin: string[]; netlify_site_id: string | null; netlify_site_name: string | null;
  netlify_deploy_id: string | null; preview_url: string | null; live_url: string | null; custom_domain: string | null;
  error: string | null; log: { at: string; msg: string }[]; created_at: string; updated_at: string;
  ready_at: string | null; approved_at: string | null; sent_at: string | null;
};

export const serviceDb = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const portalUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://portal.monostechnology.co.uk").replace(/\/$/, "");

async function latest(db: SupabaseClient, projectId: string) {
  const { data } = await db.from("site_builds").select("*").eq("project_id", projectId).order("version", { ascending: false }).limit(1).maybeSingle();
  return data as SiteBuild | null;
}

// Adds a build to the queue. Called when a client submits their brief, or when Aisha asks for changes.
export async function queueBuild(db: SupabaseClient, projectId: string, changeRequest?: string | null) {
  const prev = await latest(db, projectId);
  if (prev && ["queued", "generating", "deploying"].includes(prev.status)) return prev; // already building
  if (prev?.status === "ready") await db.from("site_builds").update({ status: "superseded", updated_at: now() }).eq("id", prev.id);
  const { data, error } = await db.from("site_builds").insert({
    project_id: projectId, version: (prev?.version ?? 0) + 1, status: "queued", change_request: changeRequest || null,
    netlify_site_id: prev?.netlify_site_id ?? null, netlify_site_name: prev?.netlify_site_name ?? null,
  }).select().single();
  if (error) throw new Error(error.message);
  return data as SiteBuild;
}

// Starts the worker for a build without waiting for it (it takes 1 to 3 minutes).
export async function kickBuild(buildId: string) {
  const url = process.env.SITE_AGENT_WORKER_URL || `${portalUrl()}/api/site-agent/build`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.SITE_AGENT_SECRET ?? ""}` },
    body: JSON.stringify({ buildId }),
  }).catch((e) => console.error("[site-agent] could not start worker", e));
}

const now = () => new Date().toISOString();

export async function runBuild(buildId: string, db: SupabaseClient = serviceDb()) {
  // Claim the build so two workers never run the same one.
  const { data: claimed } = await db.from("site_builds").update({ status: "generating", updated_at: now(), error: null })
    .eq("id", buildId).in("status", ["queued", "failed"]).select().maybeSingle();
  if (!claimed) return { skipped: true };
  const build = claimed as SiteBuild;
  const log: SiteBuild["log"] = [...(build.log ?? [])];
  const step = async (msg: string, patch: Record<string, unknown> = {}) => {
    log.push({ at: now(), msg });
    await db.from("site_builds").update({ ...patch, log, updated_at: now() }).eq("id", buildId);
  };

  try {
    const { data: project } = await db.from("projects").select("id, name, client_id, profiles(full_name, company, email)").eq("id", build.project_id).single();
    if (!project) throw new Error("Project not found");
    const { data: consult } = await db.from("consultations").select("answers").eq("project_id", build.project_id).maybeSingle();
    const answers = (consult?.answers ?? {}) as Answers;
    if (!answers.business_name && !answers.what_you_do) throw new Error("The consultation form is empty");
    const client = project.profiles as unknown as { full_name: string; company: string; email: string };

    // Client uploads (logo, photos) from Supabase storage.
    const { data: files } = await db.from("files").select("path, name").eq("project_id", build.project_id).order("created_at");
    const raw: RawUpload[] = [];
    for (const f of (files ?? []).slice(0, 24)) {
      const { data } = await db.storage.from("client-files").download(f.path);
      if (data) raw.push({ name: f.name, body: Buffer.from(await data.arrayBuffer()) });
    }
    const uploads = await prepareUploads(raw);
    await step(`Read the brief and ${uploads.length} image(s). Writing the site…`);

    // For a change request, start from the version Aisha reviewed.
    let previous: SiteContent | null = null;
    if (build.change_request) {
      const { data: prev } = await db.from("site_builds").select("content").eq("project_id", build.project_id)
        .lt("version", build.version).not("content", "is", null).order("version", { ascending: false }).limit(1).maybeSingle();
      previous = (prev?.content as SiteContent) ?? null;
    }
    const { content, usage } = await generateContent({ answers, uploads: uploads.map((u) => ({ name: u.name, jpeg: u.vision })), previous, changeRequest: build.change_request });
    await step(`Content written (${content.design.theme} theme). Preparing images…`, { content, notes_for_admin: content.notesForAisha, usage });

    const { images, assets } = await assignImages(content, uploads);

    let siteId = build.netlify_site_id, siteName = build.netlify_site_name;
    if (!siteId) {
      const site = await createSite(content.brand.name, answers.contact_email || client?.email);
      siteId = site.id; siteName = site.name;
    }
    const domain = answers.domain_name?.trim() ? answers.domain_name.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "") : null;
    const siteUrl = domain ? `https://${domain}` : `https://${siteName}.netlify.app`;
    const files_ = renderSite({ content, answers, images, assets, siteUrl });
    await step(`Built ${Object.keys(files_).length} files. Uploading to Netlify…`, { status: "deploying", netlify_site_id: siteId, netlify_site_name: siteName });

    const deploy = await deployDraft(siteId!, files_, `v${build.version}${build.change_request ? " (changes)" : ""}`);
    await step("Preview ready for approval.", {
      status: "ready", netlify_deploy_id: deploy.id, preview_url: deploy.deploy_ssl_url, ready_at: now(), custom_domain: domain,
    });

    // Move the client's progress on: Design and Build done, Review next.
    await advanceStages(db, build.project_id, ["design", "build"], "review");

    const name = content.brand.name;
    await mail(ADMIN_EMAIL, `Website ready to approve: ${name}${build.version > 1 ? ` (v${build.version})` : ""}`, `
      <p>The website agent has built <strong>${h(name)}</strong>${build.change_request ? " with your changes" : ""}.</p>
      <p><a href="${deploy.deploy_ssl_url}">Open the preview</a> · ${h(content.design.theme)} theme · ${h(content.design.rationale)}</p>
      ${content.notesForAisha.length ? `<p><strong>To check before you approve:</strong></p><ul>${content.notesForAisha.map((n) => `<li>${h(n)}</li>`).join("")}</ul>` : ""}
      ${button(`${portalUrl()}/admin/builds/${buildId}`, "Review and approve")}`);
    return { ok: true, preview: deploy.deploy_ssl_url };
  } catch (e) {
    const msg = (e as Error).message;
    await step(`Failed: ${msg}`, { status: "failed", error: msg });
    await mail(ADMIN_EMAIL, "Website agent: a build failed", `<p>Build v${build.version} failed: ${h(msg)}</p>${button(`${portalUrl()}/admin/builds/${buildId}`, "Open the build")}`).catch(() => null);
    return { ok: false, error: msg };
  }
}

// Aisha approves: publish the exact deploy she reviewed, and attach the client's domain if they have one.
export async function approveBuild(db: SupabaseClient, buildId: string) {
  const { data } = await db.from("site_builds").select("*").eq("id", buildId).single();
  const b = data as SiteBuild;
  if (b.status !== "ready" || !b.netlify_site_id || !b.netlify_deploy_id) throw new Error("This version isn't ready to publish");
  const site = await publishDeploy(b.netlify_site_id, b.netlify_deploy_id);
  let domainNote = "";
  if (b.custom_domain && site.custom_domain !== b.custom_domain) {
    await setCustomDomain(b.netlify_site_id, b.custom_domain).catch((e) => { domainNote = ` (domain not attached: ${(e as Error).message.slice(0, 120)})`; });
  }
  const live = site.ssl_url || site.url;
  // Older published versions of this project are now superseded.
  await db.from("site_builds").update({ status: "superseded" }).eq("project_id", b.project_id).eq("status", "published");
  await db.from("site_builds").update({
    status: "published", live_url: live, approved_at: now(), updated_at: now(),
    log: [...b.log, { at: now(), msg: `Approved and published at ${live}${domainNote}` }],
  }).eq("id", buildId);
  return { live, domainNote };
}

// One click to send the approved site to the client from info@monos.ai.
export async function sendToClient(db: SupabaseClient, buildId: string, message?: string) {
  const { data } = await db.from("site_builds").select("*, projects(name, profiles(full_name, email))").eq("id", buildId).single();
  const b = data as SiteBuild & { projects: { name: string; profiles: { full_name: string; email: string } } };
  if (b.status !== "published" || !b.live_url) throw new Error("Publish the site before sending it");
  const p = b.projects.profiles;
  const first = (p.full_name || "").split(" ")[0] || "there";
  const domainLine = b.custom_domain
    ? `<p>Once you're happy, we'll connect it to <strong>${h(b.custom_domain)}</strong>. We'll send you the two DNS settings to add at your domain provider, or we can do it with you on our call.</p>`
    : "";
  await mail(p.email, "Your new website is ready to view", `
    <p>Hi ${h(first)},</p>
    <p>${message ? h(message) : "Your new website is ready. Have a look on your phone and your computer and let us know what you think."}</p>
    ${button(b.live_url, "View your website")}
    ${domainLine}
    <p>Your package includes one round of changes, so send all your notes together in your portal or by replying to this email.</p>
    ${button(`${portalUrl()}/dashboard`, "Open your portal")}
    <p>Aisha<br>MONOS Technology</p>`, ADMIN_EMAIL);
  await db.from("site_builds").update({ sent_at: now(), log: [...b.log, { at: now(), msg: `Sent to ${p.email}` }] }).eq("id", buildId);
  await advanceStages(db, b.project_id, ["review"], null, "in_progress");
}

// Marks named stages done (matched by name) and sets the next one in progress.
async function advanceStages(db: SupabaseClient, projectId: string, doneNames: string[], next: string | null, doneStatus: "done" | "in_progress" = "done") {
  const { data: stages } = await db.from("stages").select("id, name, status").eq("project_id", projectId);
  for (const s of stages ?? []) {
    const n = s.name.toLowerCase();
    if (doneNames.some((d) => n.includes(d)) && s.status !== "done") await db.from("stages").update({ status: doneStatus }).eq("id", s.id);
    else if (next && n.includes(next) && s.status === "todo") await db.from("stages").update({ status: "in_progress" }).eq("id", s.id);
  }
}
