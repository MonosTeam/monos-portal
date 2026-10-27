// Consultation questions, grouped into sections. Each project chooses which sections its client sees.
export type Question = { id: string; label: string; type: "text" | "textarea" | "select"; options?: string[]; required?: boolean };
export type Section = { id: string; title: string; intro: string; questions: Question[] };

export const BRIEF_SECTIONS: Section[] = [
  {
    id: "business", title: "Your business", intro: "Help us understand who you are and who you serve.",
    questions: [
      { id: "business_name", label: "Business name", type: "text", required: true },
      { id: "what_you_do", label: "What do you do, in a sentence or two?", type: "textarea", required: true },
      { id: "customers", label: "Who are your ideal customers?", type: "textarea" },
      { id: "goal", label: "Main goal for the website", type: "select", options: ["Get enquiries / leads", "Take bookings", "Sell products", "Build credibility", "Other"], required: true },
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
    id: "fixed_pages", title: "Your 5 pages", intro: "Your offer includes Home, About, Services, Gallery and Contact. Tell us what goes on each.",
    questions: [
      { id: "page_home", label: "Home: your main message and what visitors should do (call, book, enquire)", type: "textarea", required: true },
      { id: "page_about", label: "About: your story, team and experience", type: "textarea" },
      { id: "page_services", label: "Services: list each service with a line or two (and prices if you show them)", type: "textarea", required: true },
      { id: "page_gallery", label: "Gallery: what should we show? (upload photos on the Files tab)", type: "textarea" },
      { id: "page_contact", label: "Contact: phone, email, address, opening hours, areas covered", type: "textarea", required: true },
    ],
  },
  {
    id: "style", title: "Look and feel", intro: "Your brand on your new website.",
    questions: [
      { id: "has_logo", label: "Do you have a logo?", type: "select", options: ["Yes, I'll upload it", "No, I need one", "Not sure"] },
      { id: "colours", label: "Brand colours (if any)", type: "text" },
      { id: "vibe", label: "Three words that describe the feel you want", type: "text" },
    ],
  },
  {
    id: "content", title: "Content", intro: "Words and images make the site. We can help write them.",
    questions: [
      { id: "copy", label: "Who will provide the text?", type: "select", options: ["I'll write it", "Please write it for me", "A mix"], required: true },
      { id: "photos", label: "Do you have photos?", type: "select", options: ["Yes, I'll upload them", "Please use stock images", "A mix"] },
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
