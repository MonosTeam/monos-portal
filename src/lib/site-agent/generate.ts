// Step 1 of the website agent: Claude reads the consultation brief (and looks at the client's
// photos) and writes the whole site's content, design choices and image plan as one JSON object.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { QUESTIONS } from "../brief";
import { SiteContentSchema, type Answers, type SiteContent } from "./schema";

export const MODEL = process.env.SITE_AGENT_MODEL || "claude-opus-5-5";

const SYSTEM = `You are the senior web designer and UK copywriter at MONOS Technology, a Manchester web agency.
You turn a small business's consultation brief into the content and design decisions for a premium 5-page website
(Home, About, Services, Gallery, Contact). The site must look and read like a £3,500 agency build.

Writing rules:
- British English, warm and confident, plain words, short sentences. No clichés ("look no further", "one-stop shop",
  "we pride ourselves", "unparalleled"), no exclamation marks, no emojis.
- Write for the client's real customers and local area. Mention the town/area naturally for local SEO.
- Use ONLY facts from the brief. Never invent reviews, awards, accreditations, years of experience, prices, guarantees,
  team members, client names or statistics. If something useful is missing, write around it and add a note for Aisha.
- If the client wrote their own copy, keep their meaning and wording where it is good; polish rather than replace.
- Contact details, links and the address are inserted by the system, so never write phone numbers, emails or URLs.

Design rules:
- Pick the theme, font pair and colours that best suit the industry, the client's stated style and brand colours.
- If the client gave brand colours, primary must be their main colour (convert names to hex). Otherwise choose a
  distinctive, tasteful palette for the industry. Avoid default blue unless it is their brand.
- Respect anything the client says they dislike.

Images: uploaded photos are shown to you numbered from 0. Put the best wide shot in "hero", a people/workplace shot in
"about", product or work shots in "gallery" or a matching "service", the logo in "logo", and blurry, duplicate or
unsuitable images in "skip". Stock queries are used only where uploads don't cover a slot: make them concrete and
specific to the business (Unsplash style, 2 to 4 words), never generic like "business".`;

function briefText(answers: Answers) {
  return Object.entries(answers)
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `${QUESTIONS[k]?.label ?? k}:\n${String(v).trim()}`)
    .join("\n\n");
}

export type UploadForVision = { name: string; jpeg: Buffer };

export async function generateContent(o: {
  answers: Answers;
  uploads: UploadForVision[];
  previous?: SiteContent | null;
  changeRequest?: string | null;
}): Promise<{ content: SiteContent; usage: { input: number; output: number } }> {
  const client = new Anthropic();

  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  o.uploads.forEach((u, i) => {
    content.push({ type: "text", text: `Uploaded image ${i} (file name: ${u.name}):` });
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: u.jpeg.toString("base64") } });
  });
  content.push({ type: "text", text: `<consultation_brief>\n${briefText(o.answers)}\n</consultation_brief>` });
  if (o.previous && o.changeRequest) {
    content.push({
      type: "text",
      text: `<current_site_content>\n${JSON.stringify(o.previous)}\n</current_site_content>\n\n<requested_changes>\n${o.changeRequest}\n</requested_changes>\n\nReturn the full updated content. Apply the requested changes and keep everything else the same unless the change requires it.`,
    });
  } else {
    content.push({ type: "text", text: `Write the complete website content for this business. ${o.uploads.length} image(s) were uploaded.` });
  }

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: { effort: "high", format: betaZodOutputFormat(SiteContentSchema) },
    system: SYSTEM,
    messages: [{ role: "user", content }],
  });
  const msg = await stream.finalMessage();
  if (msg.stop_reason === "refusal") throw new Error("The model declined to write this site. Check the brief for anything unusual.");
  if (msg.stop_reason === "max_tokens") throw new Error("The site content was cut off (max_tokens). Try again.");
  const parsed = msg.parsed_output;
  if (!parsed) throw new Error("The model's reply could not be read as site content.");
  return { content: tidy(parsed, o.answers), usage: { input: msg.usage.input_tokens, output: msg.usage.output_tokens } };
}

const HEX = /^#[0-9a-f]{6}$/i;

// Guard rails on the model's output, so the renderer always gets something sensible.
export function tidy(c: SiteContent, answers: Answers): SiteContent {
  if (!HEX.test(c.design.primary)) c.design.primary = "#1f3a5f";
  if (!HEX.test(c.design.accent)) c.design.accent = "#e0a526";
  if (answers.business_name?.trim()) c.brand.name = answers.business_name.trim();
  c.home.trustPoints = c.home.trustPoints.slice(0, 4);
  c.home.highlights = c.home.highlights.slice(0, 3);
  c.about.values = c.about.values.slice(0, 3);
  c.services.items = c.services.items.slice(0, 9);
  c.services.process = c.services.process.slice(0, 4);
  c.services.faq = c.services.faq.slice(0, 6);
  if (!answers.reviews?.trim()) c.reviews = []; // reviews can only come from the client
  if (!answers.team?.trim()) c.about.team = []; // team members only when the client named them
  if (!answers.accreditations?.trim()) c.about.accreditations = [];
  return c;
}
