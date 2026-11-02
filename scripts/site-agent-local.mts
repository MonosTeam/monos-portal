// Run the website agent on your own computer, without the portal or Netlify.
//   npx tsx scripts/site-agent-local.mts brief.json --images ./photos --out ./out
// brief.json holds consultation answers keyed by question id (see src/lib/brief.ts).
// Needs ANTHROPIC_API_KEY (and optionally UNSPLASH_ACCESS_KEY). Pass --content content.json to skip
// the AI step and re-render saved content. Open out/index.html with any static server, e.g. npx serve out.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { generateContent, tidy } from "../src/lib/site-agent/generate";
import { assignImages, prepareUploads } from "../src/lib/site-agent/images";
import { renderSite } from "../src/lib/site-agent/render";
import type { Answers, SiteContent } from "../src/lib/site-agent/schema";

const args = process.argv.slice(2);
const opt = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const briefPath = args.find((a) => a.endsWith(".json") && a !== opt("--content"));
if (!briefPath) throw new Error("Usage: site-agent-local.mts brief.json [--images dir] [--content content.json] [--out dir] [--url https://example.co.uk]");
const out = opt("--out") ?? "out";
const answers = JSON.parse(readFileSync(briefPath, "utf8")) as Answers;

const imgDir = opt("--images");
const raw = imgDir ? readdirSync(imgDir).sort().map((name) => ({ name, body: readFileSync(join(imgDir, name)) })) : [];
const uploads = await prepareUploads(raw);

let content: SiteContent;
const contentPath = opt("--content");
if (contentPath) content = tidy(JSON.parse(readFileSync(contentPath, "utf8")), answers);
else {
  console.log(`Writing the site with ${uploads.length} image(s)…`);
  const r = await generateContent({ answers, uploads: uploads.map((u) => ({ name: u.name, jpeg: u.vision })) });
  content = r.content;
  console.log(`Tokens: ${r.usage.input} in, ${r.usage.output} out`);
}
const { images, assets } = await assignImages(content, uploads);
const files = renderSite({ content, answers, images, assets, siteUrl: opt("--url") ?? null });
for (const [p, body] of Object.entries(files)) { mkdirSync(dirname(join(out, p)), { recursive: true }); writeFileSync(join(out, p), body); }
writeFileSync(join(out, "content.json"), JSON.stringify(content, null, 2));
console.log(`Wrote ${Object.keys(files).length} files to ${out}`);
if (content.notesForAisha.length) console.log("Notes for Aisha:\n- " + content.notesForAisha.join("\n- "));
