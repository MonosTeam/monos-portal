// Consultation questions, grouped into sections. Each project chooses which sections its client sees.
// The website agent (src/lib/site-agent) builds the client's site from these answers, so keep ids stable:
// answers are stored as a flat object in consultations.answers keyed by question id.
// Ids pre-filled by the public sign-up: business_name, what_you_do, domain_name, industry, mobile.
export type Question = { id: string; label: string; type: "text" | "textarea" | "select"; options?: string[]; required?: boolean };
export type Section = { id: string; title: string; intro: string; questions: Question[] };

export const INDUSTRIES = [
  "Builder / construction", "Plumbing / heating / electrical", "Other trade", "Cleaning",
  "Hair / beauty / salon", "Health / wellness / clinic", "Fitness / personal training",
  "Solicitor / legal", "Accountant / finance", "Estate agent / property",
  "Restaurant / café / takeaway", "Retail / fashion / shop", "Events / weddings",
  "Creative / photography", "Consultant / professional services", "Charity / community", "Other",
];

export const BRIEF_SECTIONS: Section[] = [
  {
    id: "business", title: "Your business", intro: "Help us understand who you are and who you serve. Short answers are fine.",
    questions: [
      { id: "business_name", label: "Business name (exactly as it should appear on the site)", type: "text", required: true },
      { id: "industry", label: "Industry", type: "select", options: INDUSTRIES, required: true },
      { id: "what_you_do", label: "What do you do, in a sentence or two?", type: "textarea", required: true },
      { id: "location", label: "Where are you based, and which areas do you cover?", type: "text", required: true },
      { id: "customers", label: "Who are your ideal customers?", type: "textarea" },
      { id: "usp", label: "Why do customers choose you over competitors?", type: "textarea", required: true },
      { id: "years_trading", label: "When did you start trading? (e.g. 2014)", type: "text" },
      { id: "goal", label: "Main goal for the website", type: "select", options: ["Get enquiries / leads", "Take bookings", "Sell products", "Build credibility", "Other"], required: true },
      { id: "main_cta", label: "What should visitors do first?", type: "select", options: ["Call us", "Request a quote", "Book online", "Send an enquiry", "Visit us", "Shop online"], required: true },
      { id: "booking_link", label: "Booking or shop link, if you have one (e.g. Fresha, Calendly, Etsy)", type: "text" },
      { id: "competitors", label: "Competitors or websites you like (links)", type: "textarea" },
    ],
  },
  {
    id: "pages", title: "Pages", intro: "Your package includes up to 5 pages. Tell us which ones you need.",
    questions: [
      { id: "page_list", label: "Pages you need (e.g. Home, About, Services, Gallery, Contact)", type: "textarea", required: true },
      { id: "features", label: "Special features (booking, contact form, reviews, map, newsletter)", type: "textarea" },
    ],
  },
  {
    id: "fixed_pages", title: "Your 5 pages", intro: "Your website has Home, About, Services, Gallery and Contact pages. Bullet points are perfect: we turn them into polished copy.",
    questions: [
      { id: "page_home", label: "Home: the one message you want every visitor to get", type: "textarea", required: true },
      { id: "page_about", label: "About: your story, why you started, your experience", type: "textarea", required: true },
      { id: "team", label: "Team: names and roles of anyone to feature (optional)", type: "textarea" },
      { id: "page_services", label: "Services: list each service with a line or two (add prices only if you want them shown)", type: "textarea", required: true },
      { id: "accreditations", label: "Qualifications, accreditations, memberships or awards (e.g. Gas Safe, SRA, NVQ)", type: "textarea" },
      { id: "reviews", label: "2 or 3 real customer reviews with the customer's first name (we never invent reviews)", type: "textarea" },
      { id: "page_gallery", label: "Gallery: what should we show? Upload your photos on the Files tab", type: "textarea" },
      { id: "contact_phone", label: "Business phone number for the website", type: "text" },
      { id: "mobile", label: "Mobile / WhatsApp number", type: "text" },
      { id: "contact_email", label: "Email address for enquiries", type: "text", required: true },
      { id: "contact_address", label: "Address to show (leave blank if you don't want it shown)", type: "textarea" },
      { id: "opening_hours", label: "Opening hours", type: "textarea" },
      { id: "social_links", label: "Social media links (Instagram, Facebook, TikTok, LinkedIn)", type: "textarea" },
      { id: "page_contact", label: "Anything else for the Contact page? (parking, how to find you, response times)", type: "textarea" },
    ],
  },
  {
    id: "style", title: "Look and feel", intro: "Your brand on your new website.",
    questions: [
      { id: "has_logo", label: "Do you have a logo?", type: "select", options: ["Yes, I'll upload it", "No, I need one", "Not sure"] },
      { id: "colours", label: "Brand colours (names or hex codes, if any)", type: "text" },
      { id: "style_pref", label: "Which style suits you best?", type: "select", options: ["Bold and modern", "Clean and professional", "Warm and elegant", "Let MONOS choose"], required: true },
      { id: "vibe", label: "Three words that describe the feel you want", type: "text" },
      { id: "dislikes", label: "Anything you don't want (colours, styles, words)?", type: "text" },
    ],
  },
  {
    id: "content", title: "Content", intro: "Words and images make the site. We can write and source them for you.",
    questions: [
      { id: "copy", label: "Who will provide the text?", type: "select", options: ["Please write it for me", "I'll write it", "A mix"], required: true },
      { id: "photos", label: "Do you have photos?", type: "select", options: ["Yes, I'll upload them", "Please use stock images", "A mix"], required: true },
      { id: "content_notes", label: "Anything else we should say on the site?", type: "textarea" },
    ],
  },
  {
    id: "domain", title: "Domain and email", intro: "Getting you live on your own address.",
    questions: [
      { id: "domain_name", label: "Domain name (if you already own one)", type: "text" },
      { id: "domain_provider", label: "Where is it registered? (e.g. GoDaddy, 123 Reg)", type: "text" },
      { id: "email_needed", label: "Do you need business email set up?", type: "select", options: ["Yes", "No", "Already have it"] },
    ],
  },
  {
    id: "ecommerce", title: "Online shop", intro: "Only if you're selling online.",
    questions: [
      { id: "product_count", label: "Roughly how many products?", type: "text" },
      { id: "delivery", label: "Delivery or collection options", type: "textarea" },
    ],
  },
];

// Every question by id, for the website agent and the admin views.
export const QUESTIONS: Record<string, Question & { section: string }> = Object.fromEntries(
  BRIEF_SECTIONS.flatMap((s) => s.questions.map((q) => [q.id, { ...q, section: s.title }])),
);
