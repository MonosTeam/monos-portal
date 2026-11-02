// Renders the 5 pages (plus thank-you and 404) from the agent's content and the client's brief.
import type { Answers, SiteContent, SiteImage, SiteImages } from "../schema";
import { FONTS } from "./css";
import { icon, socialIcon } from "./icons";

export const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const nl2br = (s: string) => esc(s).replace(/\n+/g, "<br>");
const telHref = (n: string) => "tel:" + n.replace(/[^\d+]/g, "").replace(/^0/, "+44");
const waHref = (n: string) => "https://wa.me/" + n.replace(/[^\d]/g, "").replace(/^0/, "44");
const initials = (name: string) => name.split(/\s+/).filter((w) => /^[A-Za-z0-9]/.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
// Emphasise the last two words of a headline (styled per theme).
const emph = (h: string) => { const w = esc(h).split(" "); return w.length < 4 ? w.join(" ") : `${w.slice(0, -2).join(" ")} <em>${w.slice(-2).join(" ")}</em>`; };
const normUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : "https://" + u);

export const PAGES = [
  { key: "home", file: "index.html", href: "/", label: "Home" },
  { key: "about", file: "about/index.html", href: "/about/", label: "About" },
  { key: "services", file: "services/index.html", href: "/services/", label: "Services" },
  { key: "gallery", file: "gallery/index.html", href: "/gallery/", label: "Gallery" },
  { key: "contact", file: "contact/index.html", href: "/contact/", label: "Contact" },
] as const;
type PageKey = (typeof PAGES)[number]["key"];

export type Ctx = { c: SiteContent; a: Answers; img: SiteImages; siteUrl: string | null; year: number };

export function socials(a: Answers) {
  const out: { k: string; url: string }[] = [];
  for (const raw of (a.social_links ?? "").split(/[\s,]+/)) {
    const u = raw.trim(); if (!u || !/[.\/]/.test(u)) continue;
    const l = u.toLowerCase();
    const k = l.includes("instagram") ? "instagram" : l.includes("facebook") ? "facebook" : l.includes("tiktok") ? "tiktok" : l.includes("linkedin") ? "linkedin" : l.includes("youtube") ? "youtube" : l.includes("twitter") || l.includes("x.com") ? "x" : null;
    if (k && !out.some((o) => o.k === k)) out.push({ k, url: normUrl(u) });
  }
  return out;
}

// The main call to action, wired to the client's real phone, booking link or contact page.
function primaryAction(x: Ctx) {
  const cta = x.a.main_cta ?? "";
  const phone = x.a.contact_phone || x.a.mobile;
  if (/book|shop/i.test(cta) && x.a.booking_link) return { href: normUrl(x.a.booking_link), ext: true };
  if (/call/i.test(cta) && phone) return { href: telHref(phone), ext: false };
  return { href: "/contact/", ext: false };
}

function picture(i: SiteImage | undefined, x: Ctx, cls = "media", eager = false, fallbackIcon = "sparkle") {
  if (!i) return `<div class="${cls}"><div class="art"><span>${esc(initials(x.c.brand.name))}</span>${icon(fallbackIcon)}</div></div>`;
  return `<div class="${cls}"><img src="${esc(i.src)}" alt="${esc(i.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></div>`;
}

function head(x: Ctx, key: PageKey, seo: { title: string; description: string }) {
  const f = FONTS[x.c.design.fonts];
  const page = PAGES.find((p) => p.key === key)!;
  const canon = x.siteUrl ? `${x.siteUrl.replace(/\/$/, "")}${page.href}` : null;
  const ogImg = x.img.hero?.src ? (x.siteUrl && x.img.hero.src.startsWith("/") ? x.siteUrl.replace(/\/$/, "") + x.img.hero.src : x.img.hero.src) : null;
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(seo.title)}</title><meta name="description" content="${esc(seo.description)}">
${canon ? `<link rel="canonical" href="${esc(canon)}">` : ""}<meta property="og:type" content="website"><meta property="og:title" content="${esc(seo.title)}"><meta property="og:description" content="${esc(seo.description)}">${ogImg ? `<meta property="og:image" content="${esc(ogImg)}">` : ""}
<meta name="theme-color" content="${esc(x.c.design.primary)}"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?${f.url}&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">${key === "home" ? jsonLd(x) : ""}</head><body>`;
}

function jsonLd(x: Ctx) {
  const d: Record<string, unknown> = { "@context": "https://schema.org", "@type": "LocalBusiness", name: x.c.brand.name, description: x.c.home.seo.description };
  if (x.siteUrl) d.url = x.siteUrl;
  if (x.a.contact_phone || x.a.mobile) d.telephone = x.a.contact_phone || x.a.mobile;
  if (x.a.contact_email) d.email = x.a.contact_email;
  if (x.a.contact_address) d.address = x.a.contact_address.replace(/\n+/g, ", ");
  if (x.a.location) d.areaServed = x.a.location;
  const s = socials(x.a).map((o) => o.url); if (s.length) d.sameAs = s;
  return `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, "\\u003c")}</script>`;
}

function header(x: Ctx, key: PageKey) {
  const act = primaryAction(x);
  const logo = x.img.logo ? `<img src="${esc(x.img.logo.src)}" alt="${esc(x.c.brand.name)} logo">` : `<span class="mark">${esc(initials(x.c.brand.name))}</span><span>${esc(x.c.brand.name)}</span>`;
  return `<header class="hdr"><div class="wrap"><a href="/" class="logo" aria-label="${esc(x.c.brand.name)} home">${logo}</a>
<button class="menu" aria-label="Open menu" aria-expanded="false" aria-controls="nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
<nav class="nav" id="nav">${PAGES.map((p) => `<a href="${p.href}"${p.key === key ? ' aria-current="page"' : ""}>${p.label}</a>`).join("")}<a class="btn" href="${esc(act.href)}"${act.ext ? ' target="_blank" rel="noopener"' : ""}>${esc(x.c.home.primaryCta)}</a></nav></div></header><main>`;
}

function footer(x: Ctx) {
  const phone = x.a.contact_phone || x.a.mobile;
  const soc = socials(x.a);
  return `</main><footer class="ftr"><div class="wrap"><div class="cols">
<div><a href="/" class="logo">${x.img.logo ? `<img src="${esc(x.img.logo.src)}" alt="${esc(x.c.brand.name)} logo">` : `<span class="mark">${esc(initials(x.c.brand.name))}</span><span>${esc(x.c.brand.name)}</span>`}</a><p style="margin-top:18px;max-width:36ch">${esc(x.c.brand.tagline)}</p>${soc.length ? `<div class="social" style="margin-top:22px">${soc.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${s.k}">${socialIcon(s.k)}</a>`).join("")}</div>` : ""}</div>
<div><h4>Explore</h4><ul>${PAGES.map((p) => `<li><a href="${p.href}">${p.label}</a></li>`).join("")}</ul></div>
<div><h4>Get in touch</h4><ul>${phone ? `<li><a href="${telHref(phone)}">${esc(phone)}</a></li>` : ""}${x.a.contact_email ? `<li><a href="mailto:${esc(x.a.contact_email)}">${esc(x.a.contact_email)}</a></li>` : ""}${x.a.contact_address ? `<li>${nl2br(x.a.contact_address)}</li>` : x.a.location ? `<li>${esc(x.a.location)}</li>` : ""}</ul></div>
</div><div class="base"><span>© ${x.year} ${esc(x.c.brand.name)}. All rights reserved.</span><a href="https://www.monostechnology.co.uk" target="_blank" rel="noopener">Website by MONOS Technology</a></div></div></footer>
${phone ? `<a class="float-call" href="${telHref(phone)}" aria-label="Call ${esc(x.c.brand.name)}">${icon("phone")}</a>` : ""}
<div class="lb" id="lb"><img alt=""></div>
<script>
(function(){var b=document.querySelector('.menu'),n=document.getElementById('nav');b&&b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
var io='IntersectionObserver'in window?new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px'}):null;
document.querySelectorAll('.rv').forEach(function(el){io?io.observe(el):el.classList.add('in')});
var lb=document.getElementById('lb');document.querySelectorAll('.masonry figure').forEach(function(f){f.addEventListener('click',function(){lb.querySelector('img').src=f.querySelector('img').src;lb.classList.add('on')})});lb.addEventListener('click',function(){lb.classList.remove('on')});
})();
</script></body></html>`;
}

function band(x: Ctx) {
  const act = primaryAction(x);
  return `<section class="section" style="padding-top:0"><div class="wrap"><div class="band rv"><div><h2>${esc(x.c.home.ctaHeading)}</h2><p>${esc(x.c.home.ctaText)}</p></div><a class="btn" href="${esc(act.href)}"${act.ext ? ' target="_blank" rel="noopener"' : ""}>${esc(x.c.home.primaryCta)} ${arrow}</a></div></div></section>`;
}
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const star = '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';

function reviews(x: Ctx) {
  if (!x.c.reviews.length) return "";
  return `<section class="section alt"><div class="wrap"><div class="head c rv"><span class="eyebrow">Reviews</span><h2>What customers say</h2></div>
<div class="grid ${x.c.reviews.length >= 3 ? "g3" : "g2"}">${x.c.reviews.slice(0, 3).map((r) => `<figure class="card quote rv"><div><div class="stars">${star.repeat(5)}</div><blockquote style="margin-top:16px">“${esc(r.quote)}”</blockquote></div><cite>${esc(r.name)}</cite></figure>`).join("")}</div></div></section>`;
}

export function home(x: Ctx) {
  const c = x.c, h = c.home, act = primaryAction(x);
  const gal = x.img.gallery.slice(0, 4);
  return head(x, "home", h.seo) + header(x, "home") + `
<section class="hero"><div class="wrap"><div class="rv"><span class="eyebrow">${esc(h.eyebrow)}</span><h1>${emph(h.headline)}</h1><p class="lead">${esc(h.subheadline)}</p>
<div class="ctas"><a class="btn" href="${esc(act.href)}"${act.ext ? ' target="_blank" rel="noopener"' : ""}>${esc(h.primaryCta)} ${arrow}</a><a class="btn ghost" href="/services/">${esc(h.secondaryCta)}</a></div>
${h.trustPoints.length ? `<div class="trust">${h.trustPoints.map((t) => `<span>${icon("check")}${esc(t)}</span>`).join("")}</div>` : ""}</div>
<div class="rv" style="position:relative">${picture(x.img.hero, x, "media", true, c.services.items[0]?.icon)}${c.about.accreditations[0] ? `<div class="badge">${icon("award")}<span>${esc(c.about.accreditations[0])}</span></div>` : ""}</div></div></section>
<section class="section alt"><div class="wrap"><div class="head rv"><span class="eyebrow">Why ${esc(c.brand.name)}</span><h2>${esc(h.introHeading)}</h2><p class="lead">${esc(h.introText)}</p></div>
<div class="grid g3">${h.highlights.map((k, i) => `<div class="card rv"><span class="num">0${i + 1}</span><h3>${esc(k.title)}</h3><p>${esc(k.text)}</p></div>`).join("")}</div></div></section>
<section class="section"><div class="wrap"><div class="head rv"><span class="eyebrow">Services</span><h2>${esc(h.servicesHeading)}</h2><p class="lead">${esc(h.servicesIntro)}</p></div>
<div class="grid ${c.services.items.length % 3 === 0 || c.services.items.length > 4 ? "g3" : "g2"}">${c.services.items.slice(0, 6).map((s) => `<a class="card rv" href="/services/"><span class="ic-wrap">${icon(s.icon)}</span><h3>${esc(s.name)}</h3><p>${esc(s.summary)}</p><span class="more">Learn more ${arrow.replace("<svg", '<svg width="18" height="18"')}</span></a>`).join("")}</div></div></section>
${gal.length >= 4 ? `<section class="section alt"><div class="wrap"><div class="head rv" style="display:flex;justify-content:space-between;align-items:end;gap:24px;max-width:none;flex-wrap:wrap"><div><span class="eyebrow">Gallery</span><h2>${esc(c.gallery.heading)}</h2></div><a class="btn ghost" href="/gallery/">View the gallery</a></div><div class="strip">${gal.map((g) => `<div class="rv">${picture(g, x)}</div>`).join("")}</div></div></section>` : ""}
${reviews(x)}${band(x)}` + footer(x);
}

export function about(x: Ctx) {
  const c = x.c, ab = c.about;
  return head(x, "about", ab.seo) + header(x, "about") + `
<section class="page-hero"><div class="wrap rv"><span class="eyebrow">About us</span><h1>${esc(ab.heading)}</h1><p class="lead">${esc(ab.intro)}</p></div></section>
<section class="section" style="padding-top:0"><div class="wrap split"><div class="rv">${picture(x.img.about, x, "media", false, "users")}</div><div class="prose rv"><span class="eyebrow">Our story</span>${ab.story.map((p) => `<p>${esc(p)}</p>`).join("")}
${ab.accreditations.length ? `<ul class="ticks">${ab.accreditations.map((a) => `<li>${icon("award")}${esc(a)}</li>`).join("")}</ul>` : ""}</div></div></section>
<section class="section alt"><div class="wrap"><div class="head c rv"><span class="eyebrow">How we work</span><h2>What you can count on</h2></div><div class="grid g3">${ab.values.map((v, i) => `<div class="card rv"><span class="ic-wrap">${icon(["shield", "clock", "heart"][i] ?? "check")}</span><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></div>`).join("")}</div></div></section>
${ab.team.length ? `<section class="section"><div class="wrap"><div class="head rv"><span class="eyebrow">Team</span><h2>${esc(ab.teamHeading)}</h2></div><div class="grid ${ab.team.length >= 3 ? "g3" : "g2"}">${ab.team.map((m) => `<div class="card rv"><span class="ic-wrap" style="font:700 1.1rem/1 var(--hf)">${esc(initials(m.name))}</span><h3>${esc(m.name)}</h3><p style="color:var(--link);font-weight:600;margin-bottom:8px">${esc(m.role)}</p><p>${esc(m.bio)}</p></div>`).join("")}</div></div></section>` : ""}
${reviews(x)}${band(x)}` + footer(x);
}

export function services(x: Ctx) {
  const c = x.c, s = c.services;
  return head(x, "services", s.seo) + header(x, "services") + `
<section class="page-hero"><div class="wrap rv"><span class="eyebrow">Services</span><h1>${esc(s.heading)}</h1><p class="lead">${esc(s.intro)}</p></div></section>
<section class="section" style="padding-top:0"><div class="wrap">${s.items.map((it, i) => `<div class="svc"><div class="rv">${picture(x.img.services[i], x, "media", false, it.icon)}</div><div class="rv"><span class="ic-wrap" style="width:54px;height:54px;border-radius:16px;display:grid;place-items:center;background:color-mix(in srgb,var(--primary) 14%,transparent);color:var(--link);margin-bottom:20px">${icon(it.icon)}</span><h2 style="font-size:clamp(1.6rem,3vw,2.2rem)">${esc(it.name)}</h2><p class="lead" style="margin-top:14px">${esc(it.summary)}</p><ul class="ticks">${it.details.map((d) => `<li>${icon("check")}${esc(d)}</li>`).join("")}</ul>${it.price ? `<span class="price">${esc(it.price)}</span>` : ""}</div></div>`).join("")}</div></section>
<section class="section alt"><div class="wrap"><div class="head c rv"><span class="eyebrow">Process</span><h2>${esc(s.processHeading)}</h2></div><div class="grid ${s.process.length === 4 ? "g4" : "g3"}">${s.process.map((p, i) => `<div class="card rv"><span class="num">Step ${i + 1}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join("")}</div></div></section>
${s.faq.length ? `<section class="section"><div class="wrap"><div class="head c rv"><span class="eyebrow">FAQ</span><h2>Questions, answered</h2></div><div class="faq rv">${s.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div></div></section>` : ""}
${band(x)}` + footer(x);
}

export function gallery(x: Ctx) {
  const c = x.c, g = c.gallery;
  const imgs = x.img.gallery;
  return head(x, "gallery", g.seo) + header(x, "gallery") + `
<section class="page-hero"><div class="wrap rv"><span class="eyebrow">Gallery</span><h1>${esc(g.heading)}</h1><p class="lead">${esc(g.intro)}</p></div></section>
<section class="section" style="padding-top:0"><div class="wrap">${imgs.length ? `<div class="masonry">${imgs.map((i) => `<figure class="rv"><img src="${esc(i.src)}" alt="${esc(i.alt)}" loading="lazy" decoding="async">${i.credit ? `<figcaption>Photo: ${esc(i.credit.name)} / Unsplash</figcaption>` : ""}</figure>`).join("")}</div>` : `<div class="grid g3">${c.services.items.slice(0, 6).map((s) => `<div class="rv">${picture(undefined, x, "media", false, s.icon)}</div>`).join("")}</div>`}</div></section>
${band(x)}` + footer(x);
}

export function contact(x: Ctx) {
  const c = x.c, ct = c.contact, a = x.a;
  const rows: string[] = [];
  if (a.contact_phone) rows.push(`<a href="${telHref(a.contact_phone)}">${icon("phone")}<span><small>Call</small><strong>${esc(a.contact_phone)}</strong></span></a>`);
  if (a.mobile) rows.push(`<a href="${waHref(a.mobile)}" target="_blank" rel="noopener">${socialIcon("whatsapp")}<span><small>${a.contact_phone ? "Mobile / WhatsApp" : "Call or WhatsApp"}</small><strong>${esc(a.mobile)}</strong></span></a>`);
  if (a.contact_email) rows.push(`<a href="mailto:${esc(a.contact_email)}">${icon("chat")}<span><small>Email</small><strong>${esc(a.contact_email)}</strong></span></a>`);
  if (a.contact_address) rows.push(`<div class="row">${icon("map")}<span><small>Address</small><strong>${nl2br(a.contact_address)}</strong></span></div>`);
  else if (a.location) rows.push(`<div class="row">${icon("map")}<span><small>Areas covered</small><strong>${esc(a.location)}</strong></span></div>`);
  if (ct.hours.length) rows.push(`<div class="row">${icon("clock")}<span style="flex:1"><small>Opening hours</small><span class="hours">${ct.hours.map((h) => `<span>${esc(h.days)}</span><span>${esc(h.time)}</span>`).join("")}</span></span></div>`);
  const soc = socials(a);
  return head(x, "contact", ct.seo) + header(x, "contact") + `
<section class="page-hero"><div class="wrap rv"><span class="eyebrow">Contact</span><h1>${esc(ct.heading)}</h1><p class="lead">${esc(ct.intro)}</p></div></section>
<section class="section" style="padding-top:0"><div class="wrap contact-grid"><div class="rv"><div class="info">${rows.join("")}</div>${soc.length ? `<div class="social" style="margin-top:20px">${soc.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${s.k}">${socialIcon(s.k)}</a>`).join("")}</div>` : ""}
${a.contact_address ? `<div class="map"><iframe title="Map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(a.contact_address.replace(/\n+/g, ", "))}&output=embed"></iframe></div>` : ""}</div>
<form class="enq rv" name="enquiry" method="POST" action="/thanks/" data-netlify="true" netlify-honeypot="company_website"><input type="hidden" name="form-name" value="enquiry"><p class="hp"><label>Leave this empty <input name="company_website"></label></p>
<h2>${esc(ct.formHeading)}</h2><div class="two"><div class="fld"><label for="f-name">Name</label><input id="f-name" name="name" autocomplete="name" required></div><div class="fld"><label for="f-phone">Phone</label><input id="f-phone" name="phone" type="tel" autocomplete="tel"></div></div>
<div class="fld"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
<div class="fld"><label for="f-msg">How can we help?</label><textarea id="f-msg" name="message" rows="5" required></textarea></div>
<button class="btn" type="submit">Send enquiry ${arrow}</button><p style="font-size:.85rem">We only use your details to reply to your enquiry.</p></form></div></section>` + footer(x);
}

export function thanks(x: Ctx) {
  return head(x, "contact", { title: `Thank you | ${x.c.brand.name}`, description: "Your enquiry has been sent." }).replace("<head>", '<head><meta name="robots" content="noindex">') + header(x, "contact") + `
<section class="page-hero" style="min-height:52vh"><div class="wrap rv"><span class="eyebrow">Message sent</span><h1>Thank you</h1><p class="lead">Your enquiry is with ${esc(x.c.brand.name)}. We'll be in touch soon.</p><div class="ctas" style="margin-top:32px"><a class="btn" href="/">Back to home</a></div></div></section>` + footer(x);
}

export function notFound(x: Ctx) {
  return head(x, "home", { title: `Page not found | ${x.c.brand.name}`, description: "This page could not be found." }).replace(jsonLd(x), "") + header(x, "home") + `
<section class="page-hero" style="min-height:52vh"><div class="wrap rv"><span class="eyebrow">404</span><h1>Page not found</h1><p class="lead">The page you're looking for has moved or doesn't exist.</p><div class="ctas" style="margin-top:32px"><a class="btn" href="/">Go to home</a></div></div></section>` + footer(x);
}
