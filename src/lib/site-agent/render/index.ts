// Step 3 of the website agent: turn content + images into a complete static site, ready for Netlify.
import type { Answers, Asset, SiteContent, SiteImages } from "../schema";
import { css } from "./css";
import { PAGES, about, contact, esc, gallery, home, notFound, services, thanks, type Ctx } from "./pages";

export type SiteFiles = Record<string, Buffer>; // path without leading slash -> body

export function renderSite(o: { content: SiteContent; answers: Answers; images: SiteImages; assets: Asset[]; siteUrl?: string | null }): SiteFiles {
  const x: Ctx = { c: o.content, a: o.answers, img: o.images, siteUrl: o.siteUrl ?? null, year: new Date().getFullYear() };
  const files: SiteFiles = {};
  const put = (p: string, s: string | Buffer) => { files[p] = typeof s === "string" ? Buffer.from(s, "utf8") : s; };

  put("index.html", home(x));
  put("about/index.html", about(x));
  put("services/index.html", services(x));
  put("gallery/index.html", gallery(x));
  put("contact/index.html", contact(x));
  put("thanks/index.html", thanks(x));
  put("404.html", notFound(x));
  put("styles.css", css(o.content.design).replace(/\n\s*/g, "\n"));
  const ini = o.content.brand.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  put("favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${esc(o.content.design.primary)}"/><text x="32" y="42" font-family="Arial,Helvetica,sans-serif" font-size="26" font-weight="700" fill="#fff" text-anchor="middle">${esc(ini)}</text></svg>`);
  const base = x.siteUrl?.replace(/\/$/, "");
  put("robots.txt", `User-agent: *\nAllow: /\n${base ? `Sitemap: ${base}/sitemap.xml\n` : ""}`);
  if (base) put("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${PAGES.map((p) => `<url><loc>${base}${p.href}</loc></url>`).join("")}</urlset>`);
  put("_headers", `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/images/*\n  Cache-Control: public, max-age=31536000, immutable\n`);
  for (const a of o.assets) files[a.path.replace(/^\//, "")] = a.body;
  return files;
}
