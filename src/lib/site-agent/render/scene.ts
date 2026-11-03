// Animated hero scenes, drawn as inline SVG with CSS keyframes (no libraries, no video files).
// Each loops every 12s and respects prefers-reduced-motion (it then shows the "fixed" end state).
import type { Answers } from "../schema";
import { icon } from "./icons";

export type SceneKind = "plumbing" | "electrical" | "generic";

export function sceneFor(a: Answers): SceneKind {
  const t = `${a.industry ?? ""} ${a.what_you_do ?? ""} ${a.page_services ?? ""}`.toLowerCase();
  const plumb = /plumb|boiler|heating|leak|pipe|bathroom|drain|gas safe/.test(t);
  const elec = /electric|rewir|fuse|socket|ev charg|lighting/.test(t);
  if (plumb) return "plumbing";
  if (elec) return "electrical";
  return "generic";
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Water droplets fired from the burst, each on its own arc.
function drops() {
  const out: string[] = [];
  for (let i = 0; i < 18; i++) {
    const ang = -150 + (i * 120) / 17; // fan from up-left to up-right
    const dist = 90 + ((i * 37) % 70);
    const dx = Math.cos((ang * Math.PI) / 180) * dist;
    const dy = Math.sin((ang * Math.PI) / 180) * dist;
    const r = 3 + ((i * 7) % 4);
    out.push(`<circle class="d" r="${r}" cx="0" cy="0" style="--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;animation-delay:${((i * 0.13) % 0.9).toFixed(2)}s"/>`);
  }
  return out.join("");
}

function foam() {
  const out: string[] = [];
  for (let i = 0; i < 9; i++) {
    const x = -26 + ((i * 13) % 52), y = -10 + ((i * 7) % 18), r = 5 + ((i * 5) % 7);
    out.push(`<circle class="f" cx="${x}" cy="${y}" r="${r}" style="animation-delay:${(i * 0.11).toFixed(2)}s"/>`);
  }
  return out.join("");
}

function plumbing(initials: string) {
  return `<svg class="scene sc-plumb" viewBox="0 0 480 520" role="img" aria-label="Animation: a burst pipe sprays water, our plumber arrives and fixes it">
<defs>
<linearGradient id="sc-cu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3b27a"/><stop offset=".45" stop-color="#c9773b"/><stop offset="1" stop-color="#7d4318"/></linearGradient>
<linearGradient id="sc-steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6fa"/><stop offset=".5" stop-color="#aeb6c4"/><stop offset="1" stop-color="#6b7486"/></linearGradient>
<radialGradient id="sc-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#9fd8ff" stop-opacity=".55"/><stop offset="1" stop-color="#9fd8ff" stop-opacity="0"/></radialGradient>
<pattern id="sc-tile" width="60" height="40" patternUnits="userSpaceOnUse"><path d="M0 .5h60M.5 0v40" stroke="rgba(255,255,255,.06)"/></pattern>
</defs>
<rect width="480" height="520" rx="28" fill="url(#sc-tile)"/>
<g class="chips">
  <g class="chip c1"><rect x="24" y="24" width="150" height="40" rx="20"/><circle cx="46" cy="44" r="6" class="dot"/><text x="60" y="49">Burst pipe!</text></g>
  <g class="chip c2"><rect x="24" y="24" width="168" height="40" rx="20"/><circle cx="46" cy="44" r="6" class="dot"/><text x="60" y="49">Plumber on site</text></g>
  <g class="chip c3"><rect x="24" y="24" width="150" height="40" rx="20"/><circle cx="46" cy="44" r="6" class="dot"/><text x="60" y="49">Leak fixed</text></g>
</g>
<ellipse class="puddle" cx="240" cy="452" rx="150" ry="18" fill="#7cc4ff" opacity=".5"/>
<g class="pipe">
  <rect x="-10" y="196" width="500" height="40" rx="6" fill="url(#sc-cu)"/>
  <rect x="-10" y="202" width="500" height="5" fill="#fff" opacity=".28"/>
  <rect x="96" y="186" width="26" height="60" rx="5" fill="url(#sc-cu)" stroke="#6b3a14" stroke-opacity=".35"/>
  <rect x="358" y="186" width="26" height="60" rx="5" fill="url(#sc-cu)" stroke="#6b3a14" stroke-opacity=".35"/>
  <rect x="420" y="236" width="40" height="230" rx="6" fill="url(#sc-cu)"/>
  <path class="crack" d="M228 198l8 10-6 8 9 9-4 9" stroke="#3a1d08" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g class="burst" transform="translate(236 198)">
  <circle r="60" fill="url(#sc-glow)" class="glow"/>
  <path class="jet" d="M0 0C-30-60-80-90-130-96M0 0C-8-70-10-110 0-150M0 0C26-62 72-92 120-100" stroke="#9fd8ff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
  ${drops()}
  <g class="foam">${foam()}</g>
</g>
<g class="clamp"><rect x="214" y="188" width="46" height="56" rx="8" fill="url(#sc-steel)" stroke="#4b5363" stroke-opacity=".5"/><rect x="214" y="204" width="46" height="5" fill="#fff" opacity=".6"/><circle cx="237" cy="238" r="4" fill="#4b5363"/></g>
<g class="wrench"><g transform="translate(237 216)"><path d="M-14-26a26 26 0 1 0 28 0l-6 16h-16z" fill="url(#sc-steel)" stroke="#4b5363" stroke-width="2" stroke-opacity=".5"/><rect x="-11" y="20" width="22" height="190" rx="10" fill="url(#sc-steel)" stroke="#4b5363" stroke-width="2" stroke-opacity=".5"/><rect x="-13" y="120" width="26" height="96" rx="12" class="grip"/></g></g>
<g class="van"><g transform="translate(0 404)">
  <rect x="0" y="0" width="170" height="64" rx="12" class="body"/><path d="M118 0h28c10 0 16 6 20 14l10 18v20c0 7-5 12-12 12h-46z" class="body"/><path d="M126 10h18c5 0 8 3 10 7l7 13h-35z" fill="#cfe6ff" opacity=".9"/>
  <text x="58" y="40" class="vt">${esc(initials)}</text>
  <circle cx="40" cy="66" r="15" fill="#151821"/><circle cx="40" cy="66" r="6" fill="#aeb6c4"/><circle cx="140" cy="66" r="15" fill="#151821"/><circle cx="140" cy="66" r="6" fill="#aeb6c4"/>
</g></g>
<g transform="translate(237 160)"><g class="spark"><path d="M0-22v14M0 8v14M-22 0h14M8 0h14M-15-15l9 9M6 6l9 9M-15 15l9-9M6-6l9-9" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g></g>
<g transform="translate(240 330)"><g class="done"><circle r="40" class="ring"/><path d="M-16 1l11 11 21-23" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>
</svg>`;
}

function electrical(initials: string) {
  return `<svg class="scene sc-elec" viewBox="0 0 480 520" role="img" aria-label="Animation: a faulty light flickers, our electrician fixes it and it glows">
<defs><radialGradient id="sc-bulb" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#fff7c2"/><stop offset=".6" stop-color="#ffd84a" stop-opacity=".6"/><stop offset="1" stop-color="#ffd84a" stop-opacity="0"/></radialGradient>
<pattern id="sc-tile" width="60" height="40" patternUnits="userSpaceOnUse"><path d="M0 .5h60M.5 0v40" stroke="rgba(255,255,255,.06)"/></pattern></defs>
<rect width="480" height="520" rx="28" fill="url(#sc-tile)"/>
<g class="chips">
  <g class="chip c1"><rect x="24" y="24" width="150" height="40" rx="20"/><circle cx="46" cy="44" r="6" class="dot"/><text x="60" y="49">Power fault</text></g>
  <g class="chip c2"><rect x="24" y="24" width="190" height="40" rx="20"/><circle cx="46" cy="44" r="6" class="dot"/><text x="60" y="49">Electrician on site</text></g>
  <g class="chip c3"><rect x="24" y="24" width="160" height="40" rx="20"/><circle cx="46" cy="44" r="6" class="dot"/><text x="60" y="49">Safe and sorted</text></g>
</g>
<path d="M240 0v120" stroke="#2b2f3a" stroke-width="6"/>
<circle class="halo" cx="240" cy="220" r="170" fill="url(#sc-bulb)"/>
<g class="bulb"><path d="M240 140c-44 0-74 32-74 72 0 30 18 46 30 62 8 11 10 20 10 30h68c0-10 2-19 10-30 12-16 30-32 30-62 0-40-30-72-74-72z" fill="#fff6c9" stroke="#e8d27a" stroke-width="3"/><path d="M220 260l10-40 10 26 10-26 10 40" stroke="#c9a227" stroke-width="4" fill="none" stroke-linejoin="round"/><rect x="206" y="304" width="68" height="16" rx="5" fill="#9aa3b4"/><rect x="210" y="322" width="60" height="14" rx="5" fill="#7d8698"/><rect x="220" y="338" width="40" height="12" rx="5" fill="#5f6779"/></g>
<g class="zap"><path d="M330 180l-30 46h26l-20 44 48-62h-28l22-28z" fill="#ffd84a"/><path d="M150 200l-22 30h18l-14 30 34-42h-20l14-18z" fill="#ffd84a"/></g>
<g class="van"><g transform="translate(0 404)"><rect x="0" y="0" width="170" height="64" rx="12" class="body"/><path d="M118 0h28c10 0 16 6 20 14l10 18v20c0 7-5 12-12 12h-46z" class="body"/><path d="M126 10h18c5 0 8 3 10 7l7 13h-35z" fill="#cfe6ff" opacity=".9"/><text x="58" y="40" class="vt">${esc(initials)}</text><circle cx="40" cy="66" r="15" fill="#151821"/><circle cx="40" cy="66" r="6" fill="#aeb6c4"/><circle cx="140" cy="66" r="15" fill="#151821"/><circle cx="140" cy="66" r="6" fill="#aeb6c4"/></g></g>
<g transform="translate(370 330)"><g class="done"><circle r="40" class="ring"/><path d="M-16 1l11 11 21-23" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>
</svg>`;
}

// Any other industry: floating glass tiles with the client's own service icons around their initials.
function generic(initials: string, icons: string[]) {
  const pos = [[16, 18], [64, 10], [76, 52], [58, 80], [12, 68], [36, 44]];
  const tiles = icons.slice(0, 5).map((ic, i) => `<span class="tile t${i}" style="left:${pos[i][0]}%;top:${pos[i][1]}%">${icon(ic)}</span>`).join("");
  return `<div class="scene sc-gen" role="img" aria-label="Decorative animation"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span><span class="ring r1"></span><span class="ring r2"></span><strong>${esc(initials)}</strong>${tiles}</div>`;
}

export function scene(kind: SceneKind, initials: string, icons: string[]) {
  if (kind === "plumbing") return plumbing(initials);
  if (kind === "electrical") return electrical(initials);
  return generic(initials, icons);
}

// Keyframes for the scenes. 12s loop; percentages map to the story beats.
export const SCENE_CSS = `
.scene-card{position:relative;border-radius:calc(var(--r) + 10px);background:linear-gradient(160deg,color-mix(in srgb,var(--primary) 55%,#0b0e16),#0b0e16 70%);box-shadow:0 50px 100px -40px rgba(0,0,0,.6),inset 0 0 0 1px rgba(255,255,255,.08);overflow:hidden;aspect-ratio:480/520}
.scene-card:before{content:"";position:absolute;inset:-40%;background:conic-gradient(from 0deg,transparent,color-mix(in srgb,var(--accent) 35%,transparent),transparent 30%);animation:sc-spin 9s linear infinite;opacity:.5}
.scene-card>*{position:relative}
.scene{display:block;width:100%;height:100%}
@keyframes sc-spin{to{transform:rotate(1turn)}}
.scene *{transform-box:fill-box}
.scene .chip rect{fill:rgba(10,12,18,.72);stroke:rgba(255,255,255,.14)}
.scene .chip text{fill:#fff;font:600 15px/1 var(--bf)}
.scene .chip{opacity:0}
.scene .c1 .dot{fill:#ff5a4f}.scene .c2 .dot{fill:#ffc23d}.scene .c3 .dot{fill:#3ddc84}
.scene .c1{animation:sc-c1 12s infinite}.scene .c2{animation:sc-c2 12s infinite}.scene .c3{animation:sc-c3 12s infinite}
@keyframes sc-c1{0%,2%{opacity:0}5%,36%{opacity:1}39%,100%{opacity:0}}
@keyframes sc-c2{0%,38%{opacity:0}41%,66%{opacity:1}69%,100%{opacity:0}}
@keyframes sc-c3{0%,68%{opacity:0}71%,96%{opacity:1}100%{opacity:0}}
.scene .dot{animation:sc-pulse 1s infinite}
@keyframes sc-pulse{50%{opacity:.35}}
.scene .vt{fill:#fff;font:800 22px/1 var(--hf);letter-spacing:.04em}
.scene .van .body{fill:var(--btn)}
.scene .van{animation:sc-van 12s cubic-bezier(.3,.7,.2,1) infinite}
@keyframes sc-van{0%,30%{transform:translateX(-260px)}42%,82%{transform:translateX(20px)}94%,100%{transform:translateX(560px)}}
.scene .done{opacity:0;transform-origin:center;animation:sc-done 12s infinite}
.scene .done .ring{fill:#22b866}
@keyframes sc-done{0%,70%{opacity:0;transform:scale(.4)}74%{opacity:1;transform:scale(1.12)}77%,94%{opacity:1;transform:scale(1)}98%,100%{opacity:0;transform:scale(1)}}
/* plumbing */
.sc-plumb .burst{animation:sc-burst 12s infinite}
@keyframes sc-burst{0%,1%{opacity:0}4%,52%{opacity:1}60%,100%{opacity:0}}
.sc-plumb .d{fill:#9fd8ff;animation:sc-drop .9s cubic-bezier(.2,.6,.4,1) infinite}
@keyframes sc-drop{0%{transform:translate(0,0);opacity:1}70%{opacity:1}100%{transform:translate(var(--dx),calc(var(--dy) + 210px));opacity:0}}
.sc-plumb .f{fill:#fff;opacity:.85;transform-origin:center;animation:sc-foam .6s ease-in-out infinite alternate}
@keyframes sc-foam{to{transform:scale(1.35) translateY(-4px);opacity:.55}}
.sc-plumb .jet{stroke-dasharray:14 12;animation:sc-jet .5s linear infinite}
@keyframes sc-jet{to{stroke-dashoffset:-26}}
.sc-plumb .glow{animation:sc-pulse .7s infinite}
.sc-plumb .puddle{transform-origin:center;animation:sc-puddle 12s infinite}
@keyframes sc-puddle{0%{transform:scaleX(.05);opacity:0}8%{opacity:.5}50%{transform:scaleX(1);opacity:.55}80%{transform:scaleX(1);opacity:.4}92%,100%{transform:scaleX(.6);opacity:0}}
.sc-plumb .wrench{transform-origin:237px 216px;transform-box:view-box;animation:sc-wrench 12s cubic-bezier(.4,.1,.2,1) infinite}
.sc-plumb .wrench .grip{fill:var(--accent)}
@keyframes sc-wrench{0%,40%{transform:translate(260px,140px) rotate(40deg);opacity:0}46%{transform:translate(0,0) rotate(18deg);opacity:1}50%{transform:rotate(-22deg)}53%{transform:rotate(14deg)}56%{transform:rotate(-24deg)}59%{transform:rotate(12deg)}62%{transform:rotate(-20deg)}66%{transform:rotate(0);opacity:1}72%,100%{transform:translate(280px,160px) rotate(50deg);opacity:0}}
.sc-plumb .clamp{opacity:0;transform-origin:center;animation:sc-clamp 12s infinite}
@keyframes sc-clamp{0%,58%{opacity:0;transform:scaleY(.4)}62%,96%{opacity:1;transform:none}100%{opacity:0}}
.sc-plumb .crack{animation:sc-crack 12s infinite}
@keyframes sc-crack{0%,60%{opacity:1}63%,100%{opacity:0}}
.sc-plumb .spark{opacity:0;transform-origin:center;animation:sc-spark 12s infinite}
@keyframes sc-spark{0%,62%{opacity:0;transform:scale(.3) rotate(0)}66%{opacity:1;transform:scale(1.1) rotate(25deg)}72%,100%{opacity:0;transform:scale(1.5) rotate(45deg)}}
/* electrical */
.sc-elec .bulb{animation:sc-flick 12s steps(1) infinite}
.sc-elec .halo{opacity:0;animation:sc-halo 12s infinite}
@keyframes sc-flick{0%,4%{opacity:.35}6%{opacity:.9}8%{opacity:.3}12%{opacity:.8}14%,20%{opacity:.3}22%{opacity:.85}24%,60%{opacity:.3}62%,100%{opacity:1}}
@keyframes sc-halo{0%,60%{opacity:0}66%,94%{opacity:1}100%{opacity:0}}
.sc-elec .zap{opacity:0;animation:sc-zap 12s infinite}
@keyframes sc-zap{0%,5%{opacity:0}6%{opacity:1}8%{opacity:0}13%{opacity:1}15%,21%{opacity:0}22%{opacity:1}24%,100%{opacity:0}}
/* generic */
.sc-gen{position:relative;width:100%;height:100%;display:grid;place-items:center;overflow:hidden}
.sc-gen strong{position:relative;z-index:2;font:var(--hw) clamp(4.5rem,11vw,8rem)/1 var(--hf);letter-spacing:-.04em;color:#fff;text-shadow:0 20px 60px rgba(0,0,0,.4)}
.sc-gen .blob{position:absolute;border-radius:50%;filter:blur(40px);opacity:.75;animation:sc-float 14s ease-in-out infinite alternate}
.sc-gen .b1{width:60%;height:60%;left:-10%;top:-5%;background:var(--accent)}
.sc-gen .b2{width:55%;height:55%;right:-12%;bottom:-8%;background:var(--btn);animation-duration:17s}
.sc-gen .b3{width:40%;height:40%;left:30%;top:40%;background:color-mix(in srgb,var(--accent) 50%,#fff);opacity:.35;animation-duration:11s}
@keyframes sc-float{to{transform:translate(12%,10%) scale(1.15)}}
.sc-gen .ring{position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,.18);animation:sc-spin 40s linear infinite}
.sc-gen .r1{width:62%;aspect-ratio:1}.sc-gen .r2{width:88%;aspect-ratio:1;border-style:dashed;animation-direction:reverse}
.sc-gen .tile{position:absolute;z-index:3;width:64px;height:64px;border-radius:18px;display:grid;place-items:center;background:rgba(255,255,255,.12);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.22),0 20px 40px -20px rgba(0,0,0,.5);color:#fff;animation:sc-bob 6s ease-in-out infinite}
.sc-gen .tile svg{width:28px;height:28px}
.sc-gen .t1{animation-delay:-1.2s}.sc-gen .t2{animation-delay:-2.4s}.sc-gen .t3{animation-delay:-3.6s}.sc-gen .t4{animation-delay:-4.8s}
@keyframes sc-bob{50%{transform:translateY(-14px) rotate(-4deg)}}
@media(prefers-reduced-motion:reduce){.scene *,.scene-card:before{animation:none!important}.sc-plumb .burst,.sc-plumb .wrench,.sc-plumb .crack,.scene .c1,.scene .c2,.sc-elec .zap,.scene .van{opacity:0}.sc-plumb .clamp,.scene .done,.scene .c3,.sc-elec .halo{opacity:1}.sc-plumb .puddle{opacity:0}}
`;
