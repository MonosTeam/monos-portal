// One stylesheet per site: shared layout plus a theme skin (bold, clean, warm) and the client's colours.
import type { SiteContent } from "../schema";
import { SCENE_CSS } from "./scene";
import { EXTRAS_CSS } from "./extras";

type RGB = [number, number, number];
const rgb = (h: string): RGB => { const x = h.length === 4 ? "#" + [...h.slice(1)].map((c) => c + c).join("") : h; return [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16)) as RGB; };
const hex = (c: RGB) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (a: string, b: string, t: number) => { const x = rgb(a), y = rgb(b); return hex([0, 1, 2].map((i) => x[i] + (y[i] - x[i]) * t) as RGB); };
const lum = (h: string) => { const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const onColour = (bg: string) => (contrast(bg, "#ffffff") >= 3.2 ? "#ffffff" : "#111111");
// Darken or lighten a colour until it reaches the contrast it needs against a background.
function readable(fg: string, bg: string, min = 4.5) {
  let c = fg; const target = lum(bg) > 0.4 ? "#000000" : "#ffffff";
  for (let i = 0; i < 20 && contrast(c, bg) < min; i++) c = mix(c, target, 0.12);
  return c;
}

export const FONTS: Record<SiteContent["design"]["fonts"], { url: string; head: string; body: string; headWeight: number; headCase?: string; tracking: string }> = {
  grotesk: { url: "family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600", head: "'Space Grotesk'", body: "'Inter'", headWeight: 700, tracking: "-0.03em" },
  jakarta: { url: "family=Plus+Jakarta+Sans:wght@400;500;600;700;800", head: "'Plus Jakarta Sans'", body: "'Plus Jakarta Sans'", headWeight: 800, tracking: "-0.035em" },
  manrope: { url: "family=Manrope:wght@400;500;600;700;800", head: "'Manrope'", body: "'Manrope'", headWeight: 800, tracking: "-0.03em" },
  fraunces: { url: "family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600", head: "'Fraunces'", body: "'Inter'", headWeight: 600, tracking: "-0.02em" },
  playfair: { url: "family=Playfair+Display:wght@500;600;700&family=Lato:wght@400;700", head: "'Playfair Display'", body: "'Lato'", headWeight: 600, tracking: "-0.01em" },
  cormorant: { url: "family=Cormorant+Garamond:wght@500;600&family=Jost:wght@400;500", head: "'Cormorant Garamond'", body: "'Jost'", headWeight: 600, tracking: "0" },
};

export function css(d: SiteContent["design"]) {
  const f = FONTS[d.fonts];
  const t = d.theme;
  const bg = t === "bold" ? mix(d.primary, "#05060a", 0.9) : t === "warm" ? "#faf6f0" : "#ffffff";
  const surface = t === "bold" ? mix(bg, "#ffffff", 0.05) : t === "warm" ? "#f3ece2" : "#f5f7fa";
  const ink = t === "bold" ? "#f3f5f9" : t === "warm" ? "#2a221c" : "#0f172a";
  const muted = t === "bold" ? "#a8b0c0" : t === "warm" ? "#6d6157" : "#5b6474";
  const line = t === "bold" ? "rgba(255,255,255,.1)" : t === "warm" ? "#e6dccf" : "#e5e8ee";
  const primary = d.primary;
  // On the dark theme a dark brand colour disappears, so buttons and highlights switch to the accent colour.
  const darkPrimary = t === "bold" && contrast(primary, bg) < 3;
  const btn = darkPrimary ? (contrast(d.accent, bg) >= 3 ? d.accent : mix(primary, "#ffffff", 0.45)) : primary;
  const link = readable(darkPrimary ? btn : primary, bg);
  const accentText = readable(d.accent, bg, 3);
  const bandBase = darkPrimary ? btn : primary;
  const band = t === "bold" ? `linear-gradient(120deg, ${mix(bandBase, "#000000", 0.35)}, ${mix(bandBase, "#000000", 0.1)} 55%, ${mix(bandBase, "#ffffff", 0.1)})` : t === "warm" ? mix(primary, "#1a1410", 0.55) : mix(primary, "#0b1020", 0.35);
  // The home hero is dark and cinematic on bold and clean sites, light and soft on warm ones.
  const heroDark = t !== "warm";
  const heroBg = heroDark ? `radial-gradient(1200px 700px at 10% 110%,${mix(primary, "#000000", 0.35)}55,transparent 60%),linear-gradient(160deg,${mix(primary, "#05070c", 0.72)},${mix(primary, "#05070c", 0.9)})` : `linear-gradient(180deg,${mix(primary, "#faf6f0", 0.9)},#faf6f0)`;
  const heroVars = heroDark
    ? `--hero-bg:${heroBg};--hero-ink:#ffffff;--hero-muted:rgba(255,255,255,.78);--hero-line:rgba(255,255,255,.35);--hero-chip:rgba(255,255,255,.1);--hero-eyebrow:${readable(d.accent, mix(primary, "#05070c", 0.8), 4.5)};--hero-overlay:linear-gradient(90deg,rgba(5,7,12,.92) 0%,rgba(5,7,12,.75) 45%,rgba(5,7,12,.35) 100%)`
    : `--hero-bg:${heroBg};--hero-ink:${ink};--hero-muted:${muted};--hero-line:${line};--hero-chip:rgba(0,0,0,.05);--hero-eyebrow:${accentText};--hero-overlay:linear-gradient(90deg,rgba(250,246,240,.95) 0%,rgba(250,246,240,.82) 50%,rgba(250,246,240,.4) 100%)`;
  const radius = t === "clean" ? "14px" : t === "warm" ? "22px" : "18px";

  return `
:root{--bg:${bg};--surface:${surface};--ink:${ink};--muted:${muted};--line:${line};--primary:${primary};--btn:${btn};--on-btn:${onColour(btn)};--link:${link};--accent:${d.accent};--accent-t:${accentText};--band:${band};--on-band:#fff;--r:${radius};--hf:${f.head},system-ui,sans-serif;--bf:${f.body},system-ui,sans-serif;--hw:${f.headWeight};--tr:${f.tracking};--wrap:1180px;${heroVars}}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{background:var(--bg);color:var(--ink);font:400 17px/1.65 var(--bf);-webkit-font-smoothing:antialiased;overflow-x:hidden}
img{display:block;max-width:100%;height:auto}
a{color:inherit;text-decoration:none}
h1,h2,h3,h4{font-family:var(--hf);font-weight:var(--hw);letter-spacing:var(--tr);line-height:1.08}
h1{font-size:clamp(2.5rem,6vw,4.6rem)}
h2{font-size:clamp(1.9rem,3.6vw,2.9rem)}
h3{font-size:1.3rem;line-height:1.25}
p{color:var(--muted)}
.wrap{max-width:var(--wrap);margin:0 auto;padding:0 24px}
.section{padding:clamp(72px,10vw,128px) 0}
.section.alt{background:var(--surface)}
.eyebrow{display:inline-flex;align-items:center;gap:10px;font:600 .78rem/1 var(--bf);letter-spacing:.14em;text-transform:uppercase;color:var(--accent-t);margin-bottom:18px}
.eyebrow:before{content:"";width:28px;height:2px;background:currentColor;border-radius:2px}
.lead{font-size:1.18rem;max-width:62ch}
.head{max-width:720px;margin-bottom:56px}
.head.c{text-align:center;margin-left:auto;margin-right:auto}
.head.c .eyebrow{justify-content:center}
.head p{margin-top:16px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 28px;border-radius:999px;background:var(--btn);color:var(--on-btn);font:600 .98rem/1 var(--bf);transition:transform .2s,box-shadow .2s,background .2s;border:0;cursor:pointer}
.btn:hover{transform:translateY(-2px);box-shadow:0 12px 30px -10px var(--btn)}
.btn.ghost{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--line)}
.btn.ghost:hover{box-shadow:inset 0 0 0 1.5px var(--ink)}
.btn svg{width:18px;height:18px}
.ic{width:26px;height:26px}
/* header */
.hdr{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--bg) 82%,transparent);backdrop-filter:saturate(1.4) blur(14px);-webkit-backdrop-filter:saturate(1.4) blur(14px);border-bottom:1px solid var(--line)}
.hdr .wrap{display:flex;align-items:center;justify-content:space-between;height:78px;gap:24px}
.logo{display:flex;align-items:center;gap:12px;font:var(--hw) 1.25rem/1 var(--hf);letter-spacing:var(--tr)}
.logo img{height:46px;width:auto;max-width:180px;object-fit:contain}
.logo .mark{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--btn);color:var(--on-btn);font-size:1.05rem}
.nav{display:flex;align-items:center;gap:6px}
.nav a{padding:10px 14px;border-radius:999px;font-weight:500;font-size:.95rem;color:var(--muted);transition:color .2s,background .2s}
.nav a:hover,.nav a[aria-current]{color:var(--ink);background:var(--surface)}
.nav .btn{margin-left:10px;padding:12px 20px;color:var(--on-btn);background:var(--btn)}
.menu{display:none;background:none;border:0;color:var(--ink);width:44px;height:44px;cursor:pointer}
.menu svg{width:26px;height:26px}
@media(max-width:900px){.menu{display:grid;place-items:center}.nav{position:fixed;inset:78px 0 auto;flex-direction:column;align-items:stretch;padding:16px 24px 28px;background:var(--bg);border-bottom:1px solid var(--line);transform:translateY(-130%);transition:transform .35s ease;z-index:-1}.nav.open{transform:none}.nav a{padding:14px 12px;font-size:1.05rem}.nav .btn{margin:10px 0 0}}
/* hero */
.hero{position:relative;padding:clamp(56px,8vw,104px) 0 clamp(64px,9vw,120px);overflow:hidden}
.hero .wrap{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(32px,5vw,72px);align-items:center}
.hero h1{margin-bottom:22px}
.hero .lead{margin-bottom:34px}
.ctas{display:flex;flex-wrap:wrap;gap:12px}
.trust{display:flex;flex-wrap:wrap;gap:10px 22px;margin-top:40px;padding-top:28px;border-top:1px solid var(--line)}
.trust span{display:inline-flex;align-items:center;gap:8px;font-weight:500;font-size:.93rem;color:var(--ink)}
.trust svg{width:18px;height:18px;color:var(--accent-t)}
.media{position:relative;border-radius:var(--r);overflow:hidden;aspect-ratio:4/5;background:var(--surface)}
.media img{width:100%;height:100%;object-fit:cover}
.hero .media{aspect-ratio:4/4.6;box-shadow:0 40px 80px -40px rgba(0,0,0,.45)}
.art{position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(circle at 25% 20%,color-mix(in srgb,var(--accent) 70%,transparent),transparent 55%),radial-gradient(circle at 80% 85%,color-mix(in srgb,var(--primary) 90%,transparent),transparent 60%),linear-gradient(135deg,var(--primary),color-mix(in srgb,var(--primary) 40%,#000))}
.art span{font:var(--hw) clamp(4rem,10vw,8rem)/1 var(--hf);color:rgba(255,255,255,.9);letter-spacing:-.04em}
.art svg{position:absolute;right:8%;bottom:8%;width:56px;height:56px;color:rgba(255,255,255,.75)}
.badge{position:absolute;left:20px;bottom:20px;right:20px;display:flex;gap:14px;align-items:center;padding:16px 18px;border-radius:calc(var(--r) - 4px);background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(10px);color:var(--ink);font-weight:600;font-size:.95rem}
.badge svg{width:28px;height:28px;color:var(--accent-t);flex:none}
.page-hero{padding:clamp(64px,9vw,112px) 0 clamp(40px,6vw,64px)}
.page-hero h1{font-size:clamp(2.3rem,5vw,3.8rem);max-width:16ch}
.page-hero .lead{margin-top:20px}
/* grids & cards */
.grid{display:grid;gap:22px}
.g2{grid-template-columns:repeat(2,1fr)}.g3{grid-template-columns:repeat(3,1fr)}.g4{grid-template-columns:repeat(4,1fr)}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:32px;transition:transform .25s,border-color .25s,box-shadow .25s}
.section.alt .card{background:var(--bg)}
a.card:hover,.card.lift:hover{transform:translateY(-4px);border-color:color-mix(in srgb,var(--primary) 40%,var(--line));box-shadow:0 24px 50px -30px rgba(0,0,0,.35)}
.card h3{margin:20px 0 10px}
.card .ic-wrap{width:54px;height:54px;border-radius:16px;display:grid;place-items:center;background:color-mix(in srgb,var(--primary) 14%,transparent);color:var(--link)}
.card .more{display:inline-flex;gap:6px;margin-top:18px;font-weight:600;color:var(--link)}
.num{font:var(--hw) .95rem/1 var(--hf);color:var(--accent-t)}
.split{display:grid;grid-template-columns:1fr 1fr;gap:clamp(36px,6vw,88px);align-items:center}
.split.rev .media{order:2}
.prose p+p{margin-top:16px}
.ticks{list-style:none;display:grid;gap:10px;margin-top:20px}
.ticks li{display:flex;gap:10px;color:var(--ink)}
.ticks svg{width:20px;height:20px;flex:none;margin-top:3px;color:var(--accent-t)}
.price{display:inline-block;margin-top:16px;padding:6px 14px;border-radius:999px;background:color-mix(in srgb,var(--accent) 18%,transparent);color:var(--ink);font-weight:600;font-size:.92rem}
.svc{display:grid;grid-template-columns:1fr 1fr;gap:clamp(32px,5vw,72px);align-items:center;padding:clamp(40px,6vw,72px) 0;border-top:1px solid var(--line)}
.svc:first-child{border-top:0;padding-top:0}
.svc:nth-child(even) .media{order:2}
.svc .media{aspect-ratio:4/3}
.svc .art span{font-size:4rem}
/* reviews */
.quote{display:flex;flex-direction:column;justify-content:space-between;gap:24px}
.quote blockquote{font:500 1.12rem/1.6 var(--bf);color:var(--ink)}
.quote .stars{display:flex;gap:3px;color:var(--accent-t)}
.quote .stars svg{width:18px;height:18px;fill:currentColor}
.quote cite{font-style:normal;font-weight:600;color:var(--muted)}
/* gallery */
.strip{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.strip .media{aspect-ratio:1}
.masonry{columns:3 280px;column-gap:16px}
.masonry figure{break-inside:avoid;margin-bottom:16px;border-radius:var(--r);overflow:hidden;position:relative;cursor:zoom-in;background:var(--surface)}
.masonry img{width:100%;transition:transform .6s}
.masonry figure:hover img{transform:scale(1.04)}
.masonry figcaption{position:absolute;left:12px;bottom:10px;font-size:.72rem;color:#fff;opacity:.8;text-shadow:0 1px 4px rgba(0,0,0,.6)}
.lb{position:fixed;inset:0;z-index:100;background:rgba(5,6,10,.92);display:none;place-items:center;padding:24px;cursor:zoom-out}
.lb.on{display:grid}.lb img{max-height:88vh;border-radius:12px}
/* faq */
.faq{max-width:820px;margin:0 auto}
.faq details{border-bottom:1px solid var(--line);padding:22px 0}
.faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:20px;font:600 1.12rem/1.4 var(--bf);color:var(--ink)}
.faq summary::-webkit-details-marker{display:none}
.faq summary:after{content:"+";font-size:1.5rem;line-height:1;color:var(--accent-t);transition:transform .25s}
.faq details[open] summary:after{transform:rotate(45deg)}
.faq details p{margin-top:12px}
/* cta band */
.band{background:var(--band);color:var(--on-band);border-radius:calc(var(--r) + 10px);padding:clamp(48px,7vw,88px);display:grid;grid-template-columns:1.4fr auto;gap:32px;align-items:center;position:relative;overflow:hidden}
.band:after{content:"";position:absolute;width:420px;height:420px;right:-120px;top:-180px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.18),transparent 65%)}
.band p{color:rgba(255,255,255,.82);margin-top:14px;max-width:56ch}
.band .btn{background:#fff;color:#111;position:relative;z-index:1}
/* contact */
.contact-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(28px,5vw,64px);align-items:start}
.info{display:grid;gap:14px}
.info a,.info div.row{display:flex;gap:16px;align-items:flex-start;padding:20px 22px;border-radius:var(--r);background:var(--surface);border:1px solid var(--line);transition:border-color .2s}
.info a:hover{border-color:var(--primary)}
.info svg{width:24px;height:24px;flex:none;color:var(--link);margin-top:2px}
.info small{display:block;color:var(--muted);font-size:.82rem;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px}
.info strong{font-weight:600;color:var(--ink);word-break:break-word}
.hours{display:grid;grid-template-columns:auto 1fr;gap:4px 18px;font-size:.95rem;color:var(--ink)}
form.enq{background:var(--surface);border:1px solid var(--line);border-radius:calc(var(--r) + 6px);padding:clamp(24px,4vw,40px);display:grid;gap:16px}
.section.alt form.enq{background:var(--bg)}
form.enq h2{font-size:1.7rem;margin-bottom:4px}
.fld{display:grid;gap:7px}
.fld label{font-weight:600;font-size:.9rem;color:var(--ink)}
.fld input,.fld textarea{font:inherit;font-size:1rem;color:var(--ink);background:var(--bg);border:1.5px solid var(--line);border-radius:12px;padding:14px 16px;outline:none;transition:border-color .2s,box-shadow .2s}
.fld input:focus,.fld textarea:focus{border-color:var(--primary);box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 18%,transparent)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.hp{position:absolute;left:-9999px}
.map{margin-top:14px;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);aspect-ratio:16/10}
.map iframe{width:100%;height:100%;border:0}
.social{display:flex;gap:10px;flex-wrap:wrap}
.social a{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line);color:var(--ink);transition:background .2s,color .2s}
.social a:hover{background:var(--btn);color:var(--on-btn)}
.social svg{width:20px;height:20px}
/* footer */
.ftr{border-top:1px solid var(--line);padding:72px 0 36px}
.badge~.art svg,.media:has(+.badge) .art svg{display:none}
.ftr .cols{display:grid;grid-template-columns:1.5fr 1fr 1.2fr;gap:40px}
.ftr h4{font:600 .8rem/1 var(--bf);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:18px}
.ftr ul{list-style:none;display:grid;gap:10px}
.ftr a:hover{color:var(--link)}
.ftr .base{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-top:56px;padding-top:24px;border-top:1px solid var(--line);font-size:.85rem;color:var(--muted)}
.ftr .base a{color:var(--muted)}.ftr .base a:hover{color:var(--ink)}

@media(max-width:900px){.hero .wrap,.split,.svc,.contact-grid,.band{grid-template-columns:1fr}.split.rev .media,.svc:nth-child(even) .media{order:0}.g3,.g4{grid-template-columns:1fr 1fr}.ftr .cols{grid-template-columns:1fr 1fr}.hero .media{aspect-ratio:4/3.4}
.float-call{display:flex;position:fixed;right:16px;bottom:16px;z-index:60;width:58px;height:58px;border-radius:50%;background:var(--btn);color:var(--on-btn);place-items:center;justify-content:center;align-items:center;box-shadow:0 14px 30px -10px rgba(0,0,0,.5)}.float-call svg{width:24px;height:24px}}
@media(max-width:600px){body{font-size:16px}.g2,.g3,.g4,.two{grid-template-columns:1fr}.strip{grid-template-columns:1fr 1fr}.ftr .cols{grid-template-columns:1fr}.card{padding:26px}.btn{width:100%}.ctas{flex-direction:column}}

/* premium layer */
.prog{position:fixed;left:0;top:0;height:3px;width:100%;background:linear-gradient(90deg,var(--accent),var(--btn));transform:scaleX(0);transform-origin:0 50%;z-index:70}
.hdr{transition:background .3s,box-shadow .3s}
.hdr.sc{box-shadow:0 10px 30px -20px rgba(0,0,0,.4)}
.hero2{position:relative;overflow:hidden;padding:clamp(48px,7vw,96px) 0 clamp(64px,8vw,110px);background:var(--hero-bg);color:var(--hero-ink);isolation:isolate}
.hero2 .wrap{display:grid;grid-template-columns:1.08fr .92fr;gap:clamp(32px,5vw,72px);align-items:center;position:relative;z-index:2}
.hero2 h1{color:var(--hero-ink);margin-bottom:22px;font-size:clamp(2.7rem,6.2vw,5rem);line-height:1}
.hero2 .lead{color:var(--hero-muted);margin-bottom:34px}
.hero2 .eyebrow{color:var(--hero-eyebrow)}
.hero2 .btn.ghost{color:var(--hero-ink);box-shadow:inset 0 0 0 1.5px var(--hero-line)}
.hero2 .btn.ghost:hover{box-shadow:inset 0 0 0 1.5px var(--hero-ink)}
.hbg{position:absolute;inset:0;z-index:-2}
.hbg img{width:100%;height:100%;object-fit:cover;transform:scale(1.08);animation:kb 22s ease-in-out infinite alternate}
.hbg:after{content:"";position:absolute;inset:0;background:var(--hero-overlay)}
@keyframes kb{to{transform:scale(1.18) translate(-2%,-2%)}}
.hglow{position:absolute;z-index:-1;width:900px;height:900px;right:-300px;top:-380px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 38%,transparent),transparent 62%);animation:glow 10s ease-in-out infinite alternate;pointer-events:none}
@keyframes glow{to{transform:translate(-80px,60px) scale(1.1)}}
.hvis{position:relative}
.hvis .badge{left:auto;right:-14px;bottom:28px;max-width:280px;box-shadow:0 20px 40px -20px rgba(0,0,0,.5);animation:bob 5s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-10px)}}
.hero2 .media{aspect-ratio:4/4.4;box-shadow:0 50px 100px -40px rgba(0,0,0,.6)}
.proof{display:flex;align-items:center;gap:14px;margin-top:38px;padding:14px 18px;border-radius:16px;background:var(--hero-chip);width:fit-content;max-width:100%;color:var(--hero-ink);font-size:.95rem}
.proof .stars{display:flex;gap:2px;color:#ffc23d;flex:none}.proof .stars svg{width:16px;height:16px;fill:currentColor}
.proof svg{width:20px;height:20px;flex:none}
.split-in em{display:inline-block}
.mq{overflow:hidden;background:var(--btn);color:var(--on-btn);padding:16px 0;white-space:nowrap;position:relative;z-index:3}
.mq-t{display:inline-flex;gap:48px;animation:mq 38s linear infinite;padding-left:48px}
.mq span{display:inline-flex;align-items:center;gap:10px;font:600 1rem/1 var(--bf);letter-spacing:.02em}
.mq svg{width:18px;height:18px}
@keyframes mq{to{transform:translateX(-33.333%)}}
.spot{position:relative;overflow:hidden}
.spot:after{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .3s;background:radial-gradient(420px circle at var(--mx,50%) var(--my,50%),color-mix(in srgb,var(--accent) 20%,transparent),transparent 45%)}
.spot:hover:after{opacity:1}
.svc-card.ph{padding-top:0}
.sv-img{margin:0 -32px 8px;aspect-ratio:16/10;overflow:hidden}
.sv-img img{width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.2,.7,.2,1)}
.svc-card:hover .sv-img img{transform:scale(1.07)}
.svc-card.ph .ic-wrap{margin-top:-30px;position:relative;box-shadow:0 10px 24px -10px rgba(0,0,0,.4);background:var(--btn);color:var(--on-btn)}
.steps{list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:22px;counter-reset:s;position:relative}
.steps li{position:relative;padding:30px 28px;border-radius:var(--r);background:var(--bg);border:1px solid var(--line)}
.steps li>span{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:var(--btn);color:var(--on-btn);font:var(--hw) 1.1rem/1 var(--hf);box-shadow:0 0 0 8px color-mix(in srgb,var(--btn) 18%,transparent)}
.steps h3{margin:20px 0 8px}
.qsec{background:radial-gradient(800px 400px at 90% 10%,color-mix(in srgb,var(--accent) 16%,transparent),transparent 60%),var(--surface)}
.qgrid{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(32px,5vw,72px);align-items:center}
.lnk{color:var(--link);font-weight:600;text-decoration:underline;text-underline-offset:3px}
.qw{background:var(--bg);border:1px solid var(--line);border-radius:calc(var(--r) + 8px);padding:clamp(22px,3.5vw,36px);box-shadow:0 40px 80px -50px rgba(0,0,0,.5)}
.qsteps{display:flex;justify-content:space-between;font-size:.82rem;font-weight:600;color:var(--muted);letter-spacing:.04em;text-transform:uppercase}
.qsteps span.on{color:var(--link)}
.qbar{height:6px;border-radius:6px;background:var(--line);margin:12px 0 26px;overflow:hidden}
.qbar i{display:block;height:100%;width:33%;background:linear-gradient(90deg,var(--accent),var(--btn));border-radius:6px;transition:width .5s cubic-bezier(.2,.7,.2,1)}
.qs h3{font-size:1.45rem;margin-bottom:18px}
.qs{animation:qin .45s cubic-bezier(.2,.7,.2,1)}
@keyframes qin{from{opacity:0;transform:translateX(18px)}}
.qopts{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.qopts.one{grid-template-columns:1fr}
.qopts button{font:600 1rem/1.3 var(--bf);color:var(--ink);background:var(--surface);border:1.5px solid var(--line);border-radius:16px;padding:16px;display:flex;align-items:center;gap:12px;cursor:pointer;text-align:left;transition:border-color .2s,transform .2s,box-shadow .2s}
.qopts.one button{justify-content:space-between;padding:18px 20px}
.qopts button:hover{border-color:var(--btn);transform:translateY(-2px);box-shadow:0 14px 30px -18px var(--btn)}
.qopts button svg{width:20px;height:20px}
.qi{width:42px;height:42px;flex:none;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--btn) 14%,transparent);color:var(--link)}
.qi svg{width:22px!important;height:22px!important}
.qback{margin-top:16px;background:none;border:0;color:var(--muted);font:600 .92rem/1 var(--bf);cursor:pointer}
.est{display:grid;gap:6px;padding:22px;border-radius:18px;background:var(--band);color:#fff;margin-bottom:12px}
.est span{font-size:.82rem;letter-spacing:.1em;text-transform:uppercase;opacity:.8}
.est b{font:var(--hw) clamp(2rem,5vw,2.8rem)/1.05 var(--hf);letter-spacing:var(--tr)}
.est small{opacity:.8}
.qdis{font-size:.86rem;margin-bottom:18px}
.qw form{display:grid;gap:14px}
.mbar{display:none}
@media(max-width:900px){.hero2 .wrap,.qgrid{grid-template-columns:1fr}.hvis{max-width:520px}.hvis .badge{right:12px}
.mbar{display:flex;position:fixed;left:12px;right:12px;bottom:12px;z-index:60;gap:8px;padding:8px;border-radius:999px;background:color-mix(in srgb,var(--bg) 86%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 20px 40px -16px rgba(0,0,0,.5),inset 0 0 0 1px var(--line)}
.mbar a{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:13px;border-radius:999px;font-weight:600;color:var(--ink)}
.mbar a.go{background:var(--btn);color:var(--on-btn)}.mbar svg{width:18px;height:18px}
body{padding-bottom:84px}}
@media(max-width:600px){.qopts{grid-template-columns:1fr}.hero2 h1{font-size:clamp(2.3rem,10vw,3rem)}}
@media(prefers-reduced-motion:reduce){.hbg img,.hglow,.mq-t,.hvis .badge{animation:none}}

/* motion */
.rv{opacity:0;transform:translateY(24px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}
.rv.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.rv{opacity:1;transform:none;transition:none}html{scroll-behavior:auto}}
${theme(t)}
${SCENE_CSS}
${EXTRAS_CSS}`;
}

function theme(t: SiteContent["design"]["theme"]) {
  if (t === "bold") return `
body{background-image:radial-gradient(900px 600px at 85% -10%,color-mix(in srgb,var(--primary) 35%,transparent),transparent 60%),radial-gradient(700px 500px at -10% 30%,color-mix(in srgb,var(--accent) 14%,transparent),transparent 60%);background-repeat:no-repeat}
h1{text-transform:uppercase;font-size:clamp(2.6rem,6.4vw,5.2rem);line-height:.98}
h1 em{font-style:normal;background:linear-gradient(90deg,var(--accent),color-mix(in srgb,var(--primary) 50%,#fff));-webkit-background-clip:text;background-clip:text;color:transparent}
.card{background:linear-gradient(160deg,rgba(255,255,255,.06),rgba(255,255,255,.02));backdrop-filter:blur(6px)}
.section.alt{background:rgba(255,255,255,.025)}
.btn.ghost{color:#fff}`;
  if (t === "warm") return `
h1,h2{font-weight:var(--hw)}
h1 em,h2 em{font-style:italic;color:var(--accent-t)}
.hero .media{border-radius:999px 999px var(--r) var(--r)}
.split .media{border-radius:999px 999px var(--r) var(--r)}
.eyebrow{letter-spacing:.2em}
.eyebrow:before{width:18px;height:1px}
.btn{border-radius:999px;letter-spacing:.02em}
.card{border:0;box-shadow:0 1px 0 var(--line)}`;
  return `
h1 em,h2 em{font-style:normal;color:var(--link)}
.hero2 h1 em{color:var(--hero-eyebrow)}
.hero{background:linear-gradient(180deg,var(--surface),var(--bg))}
.card{box-shadow:0 1px 2px rgba(15,23,42,.04)}
.btn{border-radius:12px}
.nav .btn{border-radius:10px}`;
}
