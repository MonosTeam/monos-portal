// Step 1 of the website agent: Claude reads the consultation brief (and looks at the client's
// photos) and writes the whole site's content, design choices and image plan as one JSON object.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { QUESTIONS } from "../brief";
import { CopySchema, PlanSchema, type Answers, type SiteContent } from "./schema";

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

Instant price guide ("quote"): the home page has an interactive price guide that leads into a lead form. Use the
client's own prices when they gave them. Otherwise give honest, typical UK price ranges for the area and set
pricesFromClient to false; the system then adds a note asking Aisha to confirm them with the client. Ranges must be
realistic and not too narrow. Emergency or same-day options only if the brief suggests they offer them.

Features the system already builds for every site (so requests for them need no special content): an animated hero
illustration for the industry, scroll animations, the instant price guide with a lead form, online bookings that alert the
client by email and WhatsApp, an FAQ chat bubble, a sticky mobile call/book/quote bar, reviews, a gallery with lightbox and an enquiry form. If Aisha asks for something else that the system
cannot build, apply what you can through the copy and design, and add a short note explaining what was not possible.

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

  // Mark the brief (and photos) for caching: both steps send the same opening message.
  const last = content[content.length - 1] as Anthropic.Beta.BetaTextBlockParam;
  last.cache_control = { type: "ephemeral" };

  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: [...content, { type: "text", text: "Step 1 of 2: decide the design, brand tagline, image plan, the Gallery and Contact page text, the reviews and your notes for Aisha." }] },
  ];
  const usage = { input: 0, output: 0 };
  async function step<T>(format: ReturnType<typeof betaZodOutputFormat<typeof PlanSchema>> | ReturnType<typeof betaZodOutputFormat<typeof CopySchema>>) {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 32000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: "high", format },
      system: SYSTEM,
      messages,
    });
    const msg = await stream.finalMessage();
    usage.input += msg.usage.input_tokens + (msg.usage.cache_read_input_tokens ?? 0) + (msg.usage.cache_creation_input_tokens ?? 0);
    usage.output += msg.usage.output_tokens;
    if (msg.stop_reason === "refusal") throw new Error("The model declined to write this site. Check the brief for anything unusual.");
    if (msg.stop_reason === "max_tokens") throw new Error("The site content was cut off (max_tokens). Try again.");
    if (!msg.parsed_output) throw new Error("The model's reply could not be read as site content.");
    messages.push({ role: "assistant", content: msg.content as Anthropic.Beta.BetaContentBlockParam[] });
    return msg.parsed_output as T;
  }

  const plan = await step<import("zod").infer<typeof PlanSchema>>(betaZodOutputFormat(PlanSchema));
  messages.push({ role: "user", content: "Step 2 of 2: now write the Home, About and Services pages, consistent with your plan." });
  const copy = await step<import("zod").infer<typeof CopySchema>>(betaZodOutputFormat(CopySchema));

  const { extraNotes, ...pages } = copy;
  const site: SiteContent = { ...plan, ...pages, notesForAisha: [...plan.notesForAisha, ...extraNotes] };
  return { content: tidy(site, o.answers), usage };
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
  c.services.faq = c.services.faq.slice(0, 10);
  c.notesForAisha = c.notesForAisha.slice(0, 7);
  if (!answers.reviews?.trim()) c.reviews = []; // reviews can only come from the client
  if (!answers.team?.trim()) c.about.team = []; // team members only when the client named them
  if (!answers.accreditations?.trim()) c.about.accreditations = [];
  const q = (c.quote ??= { enabled: false, heading: "", intro: "", jobs: [], urgency: [], disclaimer: "", pricesFromClient: false });
  q.jobs = q.jobs.filter((j) => Number.isFinite(j.from) && Number.isFinite(j.to) && j.to > 0).slice(0, 6)
    .map((j) => ({ ...j, from: Math.round(Math.max(0, Math.min(j.from, j.to))), to: Math.round(Math.max(j.from, j.to)) }));
  q.urgency = q.urgency.filter((u) => Number.isFinite(u.multiplier)).slice(0, 3).map((u) => ({ ...u, multiplier: Math.min(2.5, Math.max(1, u.multiplier)) }));
  if (!q.urgency.length) q.urgency = [{ label: "Standard", multiplier: 1 }];
  if (q.jobs.length < 2) q.enabled = false;
  if (q.enabled && !q.pricesFromClient && !c.notesForAisha.some((n) => /price guide/i.test(n)))
    c.notesForAisha.push("The instant price guide uses typical local prices, not the client's own. Confirm the ranges with the client before publishing.");
  return c;
}
