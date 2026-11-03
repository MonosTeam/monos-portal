// The content the website agent writes for a client. Claude returns this as structured output;
// the renderer turns it into the 5 static pages. Facts the client typed (phone, email, address,
// links) never pass through the model: the renderer reads them straight from the brief.
import { z } from "zod";

export const THEMES = ["bold", "clean", "warm"] as const;
export const FONT_PAIRS = ["grotesk", "jakarta", "manrope", "fraunces", "playfair", "cormorant"] as const;
export const ICONS = [
  "wrench", "hammer", "bolt", "drop", "flame", "home", "key", "brush", "scissors", "sparkle", "leaf", "heart",
  "shield", "scale", "briefcase", "chart", "calculator", "clock", "star", "check", "users", "camera", "cup",
  "utensils", "bag", "dumbbell", "calendar", "map", "phone", "chat", "truck", "award",
] as const;
export const IMAGE_SLOTS = ["logo", "hero", "about", "gallery", "service", "skip"] as const;

const Card = z.object({ title: z.string(), text: z.string() });
const Seo = z.object({ title: z.string().describe("Under 60 characters, includes business name and town"), description: z.string().describe("Under 155 characters") });

export const SiteContentSchema = z.object({
  design: z.object({
    theme: z.enum(THEMES).describe("bold = dark, high-impact, modern (trades, fitness, tech). clean = light, crisp, trustworthy (legal, finance, health, property). warm = cream, serif, elegant (beauty, food, weddings, boutique)."),
    fonts: z.enum(FONT_PAIRS).describe("grotesk = Space Grotesk/Inter (bold). jakarta = Plus Jakarta Sans (clean). manrope = Manrope (clean, technical). fraunces = Fraunces/Inter (warm, friendly). playfair = Playfair Display/Lato (classic). cormorant = Cormorant Garamond/Jost (luxury)."),
    primary: z.string().describe("Main brand colour as #RRGGBB. Use the client's colours when given."),
    accent: z.string().describe("Second colour as #RRGGBB that complements primary"),
    rationale: z.string().describe("One sentence for Aisha on why this look fits the client"),
  }),
  brand: z.object({
    name: z.string().describe("Business name exactly as given"),
    tagline: z.string().describe("Short tagline, max 8 words"),
  }),
  home: z.object({
    seo: Seo,
    eyebrow: z.string().describe("2 to 5 words above the headline, e.g. 'Gas Safe engineers in Salford'"),
    headline: z.string().describe("Benefit-led, max 9 words"),
    subheadline: z.string().describe("1 to 2 sentences"),
    primaryCta: z.string().describe("Button label for the client's main call to action, max 4 words"),
    secondaryCta: z.string().describe("Second button label, max 4 words, usually pointing to services"),
    trustPoints: z.array(z.string()).describe("3 or 4 very short proof points drawn only from the brief (e.g. 'Gas Safe registered', 'Since 2014', 'Covering Greater Manchester')"),
    highlights: z.array(Card).describe("3 reasons to choose the business, each title max 5 words, text max 25 words"),
    introHeading: z.string(),
    introText: z.string().describe("2 to 3 sentences"),
    servicesHeading: z.string(),
    servicesIntro: z.string(),
    ctaHeading: z.string().describe("Closing call-to-action band heading"),
    ctaText: z.string(),
  }),
  about: z.object({
    seo: Seo,
    heading: z.string(),
    intro: z.string().describe("1 to 2 sentences"),
    story: z.array(z.string()).describe("2 to 4 short paragraphs telling the client's story, only from the brief"),
    values: z.array(Card).describe("3 values or ways of working"),
    teamHeading: z.string(),
    team: z.array(z.object({ name: z.string(), role: z.string(), bio: z.string() })).describe("Only people named in the brief; empty if none"),
    accreditations: z.array(z.string()).describe("Only those named in the brief; empty if none"),
  }),
  services: z.object({
    seo: Seo,
    heading: z.string(),
    intro: z.string(),
    items: z.array(z.object({
      name: z.string(),
      summary: z.string().describe("One sentence"),
      details: z.array(z.string()).describe("2 to 4 short bullet points"),
      price: z.string().describe("Only if the client gave a price, otherwise empty string"),
      icon: z.enum(ICONS),
    })).describe("Every service from the brief, 3 to 8 items; group small ones"),
    processHeading: z.string(),
    process: z.array(Card).describe("3 or 4 steps of how working with them goes"),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).describe("6 to 10 FAQs real customers ask this kind of business (call-outs, what to expect, payment, parking, cancellations, how long jobs take), answered only with information from the brief or generic, safe statements; never invent prices, guarantees or timescales. They also power the site's FAQ chat."),
  }),
  gallery: z.object({
    seo: Seo,
    heading: z.string(),
    intro: z.string(),
  }),
  contact: z.object({
    seo: Seo,
    heading: z.string(),
    intro: z.string(),
    formHeading: z.string(),
    hours: z.array(z.object({ days: z.string(), time: z.string() })).describe("Opening hours reformatted from the brief; empty if not given"),
  }),
  reviews: z.array(z.object({ quote: z.string(), name: z.string() })).describe("ONLY real reviews pasted in the brief, lightly tidied. Empty array if none. Never invent."),
  quote: z.object({
    enabled: z.boolean().describe("true when an instant price guide suits the business (trades, cleaning, beauty, fitness, events, most services). false for work that cannot be priced at all without a consultation."),
    heading: z.string().describe("e.g. 'Get an instant price guide'"),
    intro: z.string().describe("One sentence"),
    jobs: z.array(z.object({
      label: z.string().describe("Short job name, max 4 words"),
      icon: z.enum(ICONS),
      from: z.number().describe("Low end of the guide price in GBP, whole pounds"),
      to: z.number().describe("High end of the guide price in GBP, whole pounds"),
      unit: z.string().describe("Empty, or what the price covers, e.g. 'per visit', 'per room'"),
    })).describe("3 to 6 common jobs from the brief. Use the client's own prices when given; otherwise realistic typical UK prices for the area"),
    urgency: z.array(z.object({ label: z.string().describe("e.g. 'Within a week'"), multiplier: z.number().describe("1 for standard, up to 2 for same-day or emergency") })).describe("2 or 3 options, the first is the standard timescale with multiplier 1"),
    disclaimer: z.string().describe("One short sentence saying these are guide prices and the exact price is confirmed before any work starts"),
    pricesFromClient: z.boolean().describe("true only if every price came from the brief"),
  }),
  images: z.object({
    uploads: z.array(z.object({
      index: z.number().describe("Index of the uploaded image, as numbered in the prompt"),
      slot: z.enum(IMAGE_SLOTS),
      serviceIndex: z.number().describe("For slot 'service', the index into services.items; otherwise -1"),
      alt: z.string().describe("Descriptive alt text"),
    })).describe("One entry per uploaded image"),
    stockQueries: z.object({
      hero: z.string().describe("Unsplash search for a hero photo if no upload suits, e.g. 'plumber fixing boiler'"),
      about: z.string(),
      gallery: z.array(z.string()).describe("6 search phrases for gallery photos"),
    }),
  }),
  notesForAisha: z.array(z.string()).describe("At most 5 short notes, most important first: real gaps or risky assumptions Aisha must check before publishing. Skip minor wording checks."),
});

export type SiteContent = z.infer<typeof SiteContentSchema>;

// The full schema is too big to enforce in a single structured-output request, so the agent
// works in two steps: a plan (design, images, short pages) and then the main page copy.
const S = SiteContentSchema.shape;
export const PlanSchema = z.object({
  design: S.design, brand: S.brand, gallery: S.gallery, contact: S.contact, reviews: S.reviews, quote: S.quote, images: S.images, notesForAisha: S.notesForAisha,
});
export const CopySchema = z.object({
  home: S.home, about: S.about, services: S.services,
  extraNotes: z.array(z.string()).describe("At most 2 further important gaps found while writing; usually empty"),
});
export type Answers = Record<string, string>;

export type SiteImage = { src: string; alt: string; credit?: { name: string; url: string; source?: string } };
export type SiteImages = {
  logo?: SiteImage;
  hero?: SiteImage;
  about?: SiteImage;
  services: Record<number, SiteImage>;
  gallery: SiteImage[];
};
// A file the site needs that isn't HTML/CSS (uploaded photos, favicon), keyed by its path on the site.
export type Asset = { path: string; body: Buffer; contentType: string };
