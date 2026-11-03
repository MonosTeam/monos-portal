// Step 2 of the website agent: prepare the client's uploaded photos for the web, and fill any
// empty image slots with stock photos from Unsplash (when UNSPLASH_ACCESS_KEY is set).
import sharp from "sharp";
import type { Asset, SiteContent, SiteImage, SiteImages } from "./schema";

export type RawUpload = { name: string; body: Buffer };
export type PreparedUpload = { name: string; web: Asset; vision: Buffer; isLogo: boolean; width: number; height: number };

const slug = (s: string) => s.toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "image";

export async function prepareUploads(files: RawUpload[]): Promise<PreparedUpload[]> {
  const out: PreparedUpload[] = [];
  for (const [i, f] of files.entries()) {
    if (!/\.(jpe?g|png|webp|heic|heif|avif|gif|svg)$/i.test(f.name)) continue;
    const isLogo = /logo/i.test(f.name);
    try {
      if (/\.svg$/i.test(f.name)) {
        const vision = await sharp(f.body, { density: 150 }).flatten({ background: "#ffffff" }).resize(800, 800, { fit: "inside" }).jpeg({ quality: 80 }).toBuffer();
        out.push({ name: f.name, isLogo: true, width: 800, height: 800, vision, web: { path: `/images/${slug(f.name)}-${i}.svg`, body: f.body, contentType: "image/svg+xml" } });
        continue;
      }
      const img = sharp(f.body, { failOn: "none" }).rotate();
      const meta = await img.metadata();
      const vision = await img.clone().flatten({ background: "#ffffff" }).resize(1024, 1024, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 78 }).toBuffer();
      const web = isLogo
        ? await img.clone().resize(640, 640, { fit: "inside", withoutEnlargement: true }).png({ compressionLevel: 9 }).toBuffer()
        : await img.clone().resize(1800, 1800, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
      out.push({
        name: f.name, isLogo, vision, width: meta.width ?? 0, height: meta.height ?? 0,
        web: { path: `/images/${slug(f.name)}-${i}.${isLogo ? "png" : "webp"}`, body: web, contentType: isLogo ? "image/png" : "image/webp" },
      });
    } catch {
      // Unreadable image: leave it out and let Aisha know through the build log.
    }
  }
  return out;
}

type Stock = SiteImage & { orientation: "landscape" | "portrait" | "squarish" };
async function unsplash(query: string, orientation: Stock["orientation"], count = 1): Promise<SiteImage[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key || !query.trim()) return [];
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=${Math.max(count, 3)}&content_filter=high`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" } });
  if (!res.ok) return [];
  const data = (await res.json()) as { results: { alt_description: string | null; urls: { raw: string }; links: { download_location: string }; user: { name: string; links: { html: string } } }[] };
  const picks = data.results.slice(0, count);
  // Unsplash API guidelines: hotlink their URLs, credit the photographer, and ping the download endpoint.
  await Promise.all(picks.map((p) => fetch(p.links.download_location, { headers: { Authorization: `Client-ID ${key}` } }).catch(() => null)));
  return picks.map((p) => ({
    src: `${p.urls.raw}&w=1600&q=80&auto=format&fit=crop`,
    alt: p.alt_description || query,
    credit: { name: p.user.name, url: `${p.user.links.html}?utm_source=monos&utm_medium=referral`, source: "Unsplash" },
  }));
}

// No Unsplash key: fall back to Openverse (openly licensed photos, no key needed). The photos are
// downloaded and resized into the site itself, so nothing is hotlinked from Flickr and friends.
async function openverse(query: string, orientation: Stock["orientation"], count: number, assets: Asset[], used: Set<string>): Promise<SiteImage[]> {
  if (!query.trim()) return [];
  const ar = orientation === "landscape" ? "wide" : orientation === "portrait" ? "tall" : "square";
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license_type=commercial&aspect_ratio=${ar}&size=large&mature=false&page_size=${count * 4}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "MONOS-site-agent/1.0" }, signal: AbortSignal.timeout(12000) });
    if (!res.ok) return [];
    const data = (await res.json()) as { results: { id: string; url: string; title: string | null; creator: string | null; foreign_landing_url: string; width: number | null; height: number | null }[] };
    const out: SiteImage[] = [];
    for (const r of data.results) {
      if (out.length >= count) break;
      if (used.has(r.id) || (r.width ?? 0) < 1100) continue;
      try {
        const img = await fetch(r.url, { signal: AbortSignal.timeout(15000) });
        if (!img.ok) continue;
        const body = await sharp(Buffer.from(await img.arrayBuffer()), { failOn: "none" }).rotate().resize(1800, 1800, { fit: "inside", withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
        used.add(r.id);
        const path = `/images/stock-${slug(query)}-${out.length}-${r.id.slice(0, 6)}.webp`;
        assets.push({ path, body, contentType: "image/webp" });
        out.push({ src: path, alt: query, credit: { name: r.creator || "Openverse", url: r.foreign_landing_url, source: "Openverse" } });
      } catch { /* skip this photo */ }
    }
    return out;
  } catch { return []; }
}

export async function assignImages(content: SiteContent, uploads: PreparedUpload[]): Promise<{ images: SiteImages; assets: Asset[] }> {
  const images: SiteImages = { services: {}, gallery: [] };
  const assets: Asset[] = [];
  const used = new Set<number>();
  const asImage = (u: PreparedUpload, alt: string): SiteImage => ({ src: u.web.path, alt });

  for (const plan of content.images.uploads) {
    const u = uploads[plan.index];
    if (!u || used.has(plan.index) || plan.slot === "skip") continue;
    used.add(plan.index);
    assets.push(u.web);
    const im = asImage(u, plan.alt);
    if (plan.slot === "logo" && !images.logo) images.logo = im;
    else if (plan.slot === "hero" && !images.hero) images.hero = im;
    else if (plan.slot === "about" && !images.about) images.about = im;
    else if (plan.slot === "service" && plan.serviceIndex >= 0 && !images.services[plan.serviceIndex]) { images.services[plan.serviceIndex] = im; images.gallery.push(im); }
    else if (plan.slot !== "logo") images.gallery.push(im);
  }
  // Uploads the model didn't mention still go in the gallery (or as the logo, by file name).
  uploads.forEach((u, i) => {
    if (used.has(i)) return;
    assets.push(u.web);
    if (u.isLogo && !images.logo) images.logo = asImage(u, `${content.brand.name} logo`);
    else images.gallery.push(asImage(u, `${content.brand.name}: ${content.gallery.heading}`));
  });
  if (!images.hero && images.gallery[0]) images.hero = images.gallery[0];

  const q = content.images.stockQueries;
  const seen = new Set<string>();
  const stock = process.env.UNSPLASH_ACCESS_KEY
    ? (query: string, o: Stock["orientation"], n = 1) => unsplash(query, o, n)
    : (query: string, o: Stock["orientation"], n = 1) => openverse(query, o, n, assets, seen);
  if (!images.hero) images.hero = (await stock(q.hero, "landscape"))[0];
  if (!images.about) images.about = (await stock(q.about, "portrait"))[0];
  if (images.gallery.length < 4) {
    const per = Math.ceil((6 - images.gallery.length) / Math.max(1, q.gallery.length));
    for (const query of q.gallery) {
      if (images.gallery.length >= 6) break;
      images.gallery.push(...(await stock(query, "landscape", per)));
    }
    images.gallery = images.gallery.slice(0, Math.max(6, images.gallery.length));
  }
  return { images, assets };
}
