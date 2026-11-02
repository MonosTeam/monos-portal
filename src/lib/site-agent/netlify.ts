// Step 4 of the website agent: host the site on Netlify. Each client gets their own Netlify site.
// Builds go up as draft deploys (a private preview URL); approving publishes that exact deploy.
import { createHash } from "node:crypto";
import type { SiteFiles } from "./render";

const API = "https://api.netlify.com/api/v1";

async function nf<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (!token) throw new Error("NETLIFY_AUTH_TOKEN is not set");
  const { json, ...rest } = init;
  const res = await fetch(`${API}${path}`, {
    ...rest,
    headers: { Authorization: `Bearer ${token}`, ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...(rest.headers ?? {}) },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (!res.ok) {
    const err = new Error(`Netlify ${init.method ?? "GET"} ${path} failed: ${res.status} ${await res.text().catch(() => "")}`.slice(0, 500));
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return (res.status === 204 ? null : await res.json()) as T;
}

export type NetlifySite = { id: string; name: string; url: string; ssl_url: string; admin_url: string; custom_domain: string | null };
export type NetlifyDeploy = { id: string; state: string; required?: string[]; deploy_ssl_url: string; ssl_url: string; error_message?: string | null };

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "site";

// Creates the client's Netlify site, trying a few readable names before falling back to a random one.
export async function createSite(businessName: string, notifyEmail?: string): Promise<NetlifySite> {
  const base = slugify(businessName);
  const names = [base, `${base}-uk`, `${base}-mcr`, `${base}-${Math.random().toString(36).slice(2, 6)}`];
  const account = process.env.NETLIFY_ACCOUNT_SLUG;
  let site: NetlifySite | null = null;
  for (const name of names) {
    try {
      site = await nf<NetlifySite>(account ? `/${account}/sites` : "/sites", { method: "POST", json: { name } });
      break;
    } catch (e) {
      if ((e as { status?: number }).status !== 422) throw e; // 422 = name taken
    }
  }
  if (!site) throw new Error("Could not find a free Netlify site name");
  // Make sure Netlify Forms picks up the contact form, and email enquiries to the client.
  await nf(`/sites/${site.id}`, { method: "PATCH", json: { processing_settings: { ignore_html_forms: false } } }).catch(() => null);
  if (notifyEmail) {
    await nf(`/hooks?site_id=${site.id}`, {
      method: "POST",
      json: { site_id: site.id, type: "email", event: "submission_created", data: { email: notifyEmail } },
    }).catch(() => null);
  }
  return site;
}

export const getSite = (id: string) => nf<NetlifySite>(`/sites/${id}`);

// Uploads only the files Netlify doesn't already have (by SHA1), as a draft deploy.
export async function deployDraft(siteId: string, files: SiteFiles, title: string): Promise<NetlifyDeploy> {
  const digests: Record<string, string> = {};
  const bySha: Record<string, string[]> = {};
  for (const [p, body] of Object.entries(files)) {
    const sha = createHash("sha1").update(body).digest("hex");
    digests[`/${p}`] = sha;
    (bySha[sha] ??= []).push(p);
  }
  const deploy = await nf<NetlifyDeploy>(`/sites/${siteId}/deploys?title=${encodeURIComponent(title)}`, { method: "POST", json: { files: digests, draft: true } });
  for (const sha of deploy.required ?? []) {
    const p = bySha[sha][0];
    await nf(`/deploys/${deploy.id}/files/${p.split("/").map(encodeURIComponent).join("/")}`, {
      method: "PUT", headers: { "Content-Type": "application/octet-stream" }, body: new Uint8Array(files[p]),
    });
  }
  // Wait for Netlify to finish processing (usually a few seconds).
  for (let i = 0; i < 60; i++) {
    const d = await nf<NetlifyDeploy>(`/deploys/${deploy.id}`);
    if (d.state === "ready") return d;
    if (d.state === "error") throw new Error(`Netlify deploy failed: ${d.error_message ?? "unknown error"}`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Netlify deploy did not finish within 2 minutes");
}

// Makes an approved draft deploy the live version of the site.
export async function publishDeploy(siteId: string, deployId: string) {
  await nf(`/sites/${siteId}/deploys/${deployId}/restore`, { method: "POST" });
  return getSite(siteId);
}

// Attaches the client's own domain. They (or Aisha) then point DNS at Netlify.
export async function setCustomDomain(siteId: string, domain: string) {
  const d = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return nf<NetlifySite>(`/sites/${siteId}`, { method: "PATCH", json: { custom_domain: d } });
}
