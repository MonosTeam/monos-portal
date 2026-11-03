// Online bookings and the FAQ chat bubble, included on every site. Both are free to run:
// bookings go to Netlify Forms (emailed to the client, so they ping the client's phone) and can be
// sent on to the client's WhatsApp in one tap; the chat answers from the site's own content in the
// browser, with no AI calls, and falls back to a callback request.
import type { Ctx } from "./pages";
import { icon, socialIcon } from "./icons";

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const telHref = (n: string) => "tel:" + n.replace(/[^\d+]/g, "").replace(/^0/, "+44");
const waNum = (n: string) => n.replace(/[^\d]/g, "").replace(/^0/, "44");
const normUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : "https://" + u);
const isMobile = (n?: string) => !!n && /^(\+?44|0)7/.test(n.replace(/[\s()-]/g, ""));

// The number that receives WhatsApp pings: the mobile field, or the main number if it's a mobile.
export const waTarget = (x: Ctx) => (x.a.mobile && x.a.mobile.trim() ? x.a.mobile : isMobile(x.a.contact_phone) ? x.a.contact_phone : "");

export function bookingSection(x: Ctx, alt = false) {
  const services = x.c.services.items.map((s) => s.name);
  const ext = x.a.booking_link?.trim();
  const wa = waTarget(x);
  return `<section class="section bsec${alt ? " alt" : ""}" id="book"><div class="wrap bgrid"><div class="rv"><span class="eyebrow">Book online</span><h2>Book in under a minute</h2>
<p class="lead" style="margin-top:16px">Choose a service and a day that suits you. Your request goes straight to ${esc(x.c.brand.name)}${wa ? " on their phone" : ""}, and we'll confirm your time.</p>
<ul class="ticks"><li>${icon("calendar")}Pick your day and time</li><li>${icon("phone")}Instant alert to our team</li><li>${icon("check")}We confirm before we arrive</li></ul>
${ext ? `<a class="btn ghost" style="margin-top:26px" href="${esc(normUrl(ext))}" target="_blank" rel="noopener">Or book on our online calendar</a>` : ""}</div>
<div class="bw rv" id="bw"><form name="booking" method="POST" action="/thanks/" data-netlify="true" netlify-honeypot="company_website" data-wa="${esc(wa ? waNum(wa) : "")}" data-biz="${esc(x.c.brand.name)}"><input type="hidden" name="form-name" value="booking"><p class="hp"><label>Leave this empty <input name="company_website"></label></p>
<div class="fld"><label for="b-svc">Service</label><select id="b-svc" name="service" required><option value="">Choose a service</option>${services.map((s) => `<option>${esc(s)}</option>`).join("")}<option>Something else</option></select></div>
<div class="two"><div class="fld"><label for="b-date">Preferred day</label><input id="b-date" name="date" type="date" required></div><div class="fld"><label for="b-time">Preferred time</label><select id="b-time" name="time" required><option value="">Choose a time</option><option>Morning (8am to 12pm)</option><option>Afternoon (12pm to 5pm)</option><option>Evening (after 5pm)</option><option>Any time</option></select></div></div>
<div class="two"><div class="fld"><label for="b-name">Name</label><input id="b-name" name="name" autocomplete="name" required></div><div class="fld"><label for="b-phone">Phone</label><input id="b-phone" name="phone" type="tel" autocomplete="tel" required></div></div>
<div class="two"><div class="fld"><label for="b-email">Email</label><input id="b-email" name="email" type="email" autocomplete="email"></div><div class="fld"><label for="b-pc">Postcode</label><input id="b-pc" name="postcode" autocomplete="postal-code"></div></div>
<div class="fld"><label for="b-notes">Anything we should know? (optional)</label><textarea id="b-notes" name="notes" rows="2"></textarea></div>
<button class="btn" type="submit">${icon("calendar")}Request my booking</button><p class="small">We only use your details to arrange your booking.</p></form>
<div class="bdone" hidden><span class="tick">${icon("check")}</span><h3>Booking request sent</h3><p>Thanks <b class="bn"></b>. ${esc(x.c.brand.name)} has your request and will confirm your time shortly.</p>${wa ? `<a class="btn wa" target="_blank" rel="noopener" href="#">${socialIcon("whatsapp")}Send it on WhatsApp for a faster reply</a>` : ""}</div></div></div></section>`;
}

type Faq = { q: string; a: string; k?: string; act?: string[] };

// Questions the chat can answer: the agent's FAQs plus facts taken straight from the brief.
export function chatFaqs(x: Ctx): Faq[] {
  const c = x.c, a = x.a;
  const phone = a.contact_phone || a.mobile;
  const out: Faq[] = [];
  out.push({ q: "How do I book?", a: `Use our online booking form: pick a service, a day and a time, and we'll confirm with you.${phone ? ` You can also call us on ${phone}.` : ""}`, k: "book booking appointment arrange visit slot available availability when come", act: ["book"] });
  if (c.quote?.enabled && c.quote.jobs.length) {
    out.push({ q: "How much does it cost?", a: `Guide prices: ${c.quote.jobs.map((j) => `${j.label} £${j.from} to £${j.to}${j.unit ? ` ${j.unit}` : ""}`).join("; ")}. ${c.quote.disclaimer}`, k: "price prices cost costs much charge charges quote fee fees expensive cheap rate rates estimate " + c.quote.jobs.map((j) => j.label).join(" "), act: ["quote"] });
  }
  if (c.contact.hours.length) out.push({ q: "What are your opening hours?", a: `We're open ${c.contact.hours.map((h) => `${h.days}, ${h.time}`).join("; ")}.`, k: "open opening hours close closing time times today weekend saturday sunday monday evening" });
  if (a.location && a.location.trim().length > 2) out.push({ q: "Which areas do you cover?", a: `${a.location.trim().replace(/\.$/, "")}. Not sure if we cover you? Send us your postcode and we'll let you know.`, k: "area areas cover covered location where based near local postcode travel come to" });
  out.push({ q: "What services do you offer?", a: `We offer ${c.services.items.map((s) => s.name).join(", ")}.`, k: "service services offer do provide work jobs " + c.services.items.map((s) => `${s.name} ${s.summary}`).join(" ") });
  for (const s of c.services.items) out.push({ q: `Tell me about ${s.name.toLowerCase()}`, a: `${s.summary}${s.details.length ? ` That includes ${s.details.slice(0, 3).map((d) => d.replace(/\.$/, "").toLowerCase()).join(", ")}.` : ""}${s.price ? ` ${s.price}.` : ""}`, k: `${s.name} ${s.details.join(" ")}`, act: ["book"] });
  for (const f of c.services.faq) out.push({ q: f.q, a: f.a });
  if (c.about.accreditations.length) out.push({ q: "Are you qualified or accredited?", a: `Yes: ${c.about.accreditations.join(", ")}.`, k: "qualified qualification accredited accreditation registered certified insured insurance licence gas safe niceic" });
  if (c.reviews.length) out.push({ q: "What do customers say?", a: c.reviews.slice(0, 2).map((r) => `“${r.quote}” ${r.name}`).join(" "), k: "review reviews rating rated customers testimonials feedback good recommend" });
  out.push({ q: "How can I contact you?", a: [phone && `Call ${phone}`, a.mobile && `WhatsApp ${a.mobile}`, a.contact_email && `email ${a.contact_email}`].filter(Boolean).join(", ") + ", or use the form on our contact page.", k: "contact phone number call email whatsapp text message speak talk reach", act: ["call", "wa"] });
  return out;
}

export function chatWidget(x: Ctx) {
  const phone = x.a.contact_phone || x.a.mobile;
  const wa = waTarget(x);
  const data = {
    faq: chatFaqs(x),
    phone: phone ? telHref(phone) : "",
    wa: wa ? `https://wa.me/${waNum(wa)}` : "",
    quote: !!x.c.quote?.enabled,
    hello: `Hi, I'm the ${x.c.brand.name} assistant. Ask me about prices, bookings, opening hours or our services.`,
  };
  const ini = x.c.brand.name.split(/\s+/).filter((w) => /^[A-Za-z0-9]/.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  return `<button class="chat-fab" aria-label="Open chat" aria-expanded="false" aria-controls="chat">${icon("chat")}<span class="ping"></span></button>
<div class="chat" id="chat" role="dialog" aria-label="Chat with ${esc(x.c.brand.name)}" hidden><div class="ch-h"><span class="mark">${esc(ini)}</span><div><b>${esc(x.c.brand.name)}</b><small><i></i>Instant answers</small></div><button class="ch-x" aria-label="Close chat">×</button></div>
<div class="ch-b" aria-live="polite"></div><div class="ch-chips"></div>
<form class="ch-in"><input aria-label="Type your question" placeholder="Type your question…" autocomplete="off"><button aria-label="Send">${icon("chat")}</button></form>
<form class="ch-cb" name="callback" method="POST" action="/thanks/" data-netlify="true" netlify-honeypot="company_website" hidden><input type="hidden" name="form-name" value="callback"><input type="hidden" name="question"><p class="hp"><label>Leave this empty <input name="company_website"></label></p><input name="name" placeholder="Your name" required autocomplete="name"><input name="phone" type="tel" placeholder="Your phone number" required autocomplete="tel"><button class="btn" type="submit">Call me back</button></form></div>
<script type="application/json" id="chat-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

// Shared client script for bookings and chat.
export const EXTRAS_JS = `
(function(){var bw=document.getElementById('bw');if(bw){var f=bw.querySelector('form'),d=f.date,t=new Date();d.min=t.toISOString().slice(0,10);
f.addEventListener('submit',function(e){if(!window.fetch)return;e.preventDefault();var b=f.querySelector('button[type=submit]');b.disabled=true;
fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()}).then(function(r){if(!r.ok)throw 0;
var done=bw.querySelector('.bdone');done.querySelector('.bn').textContent=f.name.value.split(' ')[0];var w=done.querySelector('.wa');
if(w&&f.dataset.wa){var dt=new Date(f.date.value+'T12:00');w.href='https://wa.me/'+f.dataset.wa+'?text='+encodeURIComponent('Hi '+f.dataset.biz+', I have just requested a booking on your website.\\nService: '+f.service.value+'\\nDay: '+dt.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})+'\\nTime: '+f.time.value+'\\nName: '+f.name.value+'\\nPhone: '+f.phone.value+(f.postcode.value?'\\nPostcode: '+f.postcode.value:'')+(f.notes.value?'\\nNotes: '+f.notes.value:''))}
f.hidden=true;done.hidden=false}).catch(function(){f.submit()})})}
var fab=document.querySelector('.chat-fab'),ch=document.getElementById('chat');if(!fab||!ch)return;var D=JSON.parse(document.getElementById('chat-data').textContent),body=ch.querySelector('.ch-b'),chips=ch.querySelector('.ch-chips'),inp=ch.querySelector('.ch-in input'),cb=ch.querySelector('.ch-cb'),started=false;
var SW='a an the i we you your our me my is are do does can could would will how what when where which who to for of in on at it and or with about any have has be get there'.split(' '),stem=function(w){return w.replace(/(ings|ing|ies|es|s|ed)$/,'')},tok=function(s){return (s.toLowerCase().match(/[a-z0-9£]+/g)||[]).filter(function(w){return SW.indexOf(w)<0}).map(stem)};
D.faq.forEach(function(f){f.t=tok(f.q+' '+(f.k||''))});
var btn=function(a){if(a==='book')return '<a class="cb" href="/#book">Book online</a>';if(a==='quote'&&D.quote)return '<a class="cb" href="/#quote">Instant quote</a>';if(a==='call'&&D.phone)return '<a class="cb" href="'+D.phone+'">Call us</a>';if(a==='wa'&&D.wa)return '<a class="cb" target="_blank" rel="noopener" href="'+D.wa+'">WhatsApp</a>';return ''};
var say=function(txt,who,acts){var m=document.createElement('div');m.className='msg '+who;m.textContent=txt;if(acts&&acts.length){var r=document.createElement('div');r.className='acts';r.innerHTML=acts.map(btn).join('');m.appendChild(r)}body.appendChild(m);body.scrollTop=body.scrollHeight};
var typing=function(cb2){var m=document.createElement('div');m.className='msg bot dots';m.innerHTML='<i></i><i></i><i></i>';body.appendChild(m);body.scrollTop=body.scrollHeight;setTimeout(function(){m.remove();cb2()},650)};
var answer=function(q){say(q,'me');var qt=tok(q),best=null,bs=0;D.faq.forEach(function(f){var s=0;qt.forEach(function(w){if(f.t.indexOf(w)>=0)s+=w.length>3?2:1});if(s>bs){bs=s;best=f}});
typing(function(){if(best&&bs>=2){say(best.a,'bot',best.act)}else{say("I'm not sure about that one. Leave your number and we'll call you back, or contact us directly.",'bot',['call','wa']);cb.question.value=q;cb.hidden=false}})};
var chipsFor=function(){chips.innerHTML='';D.faq.slice(0,5).forEach(function(f){var b=document.createElement('button');b.type='button';b.textContent=f.q;b.onclick=function(){answer(f.q)};chips.appendChild(b)})};
var open=function(o){ch.hidden=!o;fab.setAttribute('aria-expanded',o);fab.classList.toggle('on',o);if(o&&!started){started=true;say(D.hello,'bot');chipsFor()}if(o)setTimeout(function(){inp.focus()},50)};
fab.onclick=function(){open(ch.hidden)};ch.querySelector('.ch-x').onclick=function(){open(false)};
ch.querySelector('.ch-in').addEventListener('submit',function(e){e.preventDefault();var v=inp.value.trim();if(!v)return;inp.value='';answer(v)});
cb.addEventListener('submit',function(e){if(!window.fetch)return;e.preventDefault();fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(cb)).toString()}).then(function(){cb.hidden=true;say("Thanks, we've got your number and will call you back soon.",'bot')}).catch(function(){cb.submit()})});
document.querySelectorAll('a[href="/#book"],a[href="#book"]').forEach(function(a){a.addEventListener('click',function(){open(false)})})})();`;

export const EXTRAS_CSS = `
.bsec{background:radial-gradient(700px 380px at 5% 0%,color-mix(in srgb,var(--btn) 14%,transparent),transparent 60%)}
.bgrid{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(32px,5vw,72px);align-items:center}
.bw{background:var(--surface);border:1px solid var(--line);border-radius:calc(var(--r) + 8px);padding:clamp(22px,3.5vw,36px);box-shadow:0 40px 80px -50px rgba(0,0,0,.5)}
.section.alt .bw{background:var(--bg)}
.bw form{display:grid;gap:14px}
.fld select{font:inherit;font-size:1rem;color:var(--ink);background:var(--bg);border:1.5px solid var(--line);border-radius:12px;padding:14px 16px;outline:none;appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--muted) 50%),linear-gradient(135deg,var(--muted) 50%,transparent 50%);background-position:calc(100% - 20px) 50%,calc(100% - 14px) 50%;background-size:6px 6px;background-repeat:no-repeat}
.fld input[type=date]{color-scheme:light dark}
.fld select:focus{border-color:var(--primary);box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 18%,transparent)}
.small{font-size:.85rem}
.bw [hidden]{display:none!important}
.bdone{text-align:center;display:grid;gap:12px;justify-items:center;padding:24px 0;animation:qin .45s}
.bdone .tick{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;background:#22b866;color:#fff;box-shadow:0 0 0 10px rgba(34,184,102,.18)}
.bdone .tick svg{width:34px;height:34px}
.bdone h3{font-size:1.6rem}
.btn.wa{background:#25d366;color:#fff;margin-top:8px}
.chat-fab{position:fixed;right:22px;bottom:22px;z-index:65;width:62px;height:62px;border-radius:50%;border:0;cursor:pointer;background:var(--btn);color:var(--on-btn);display:grid;place-items:center;box-shadow:0 18px 40px -12px rgba(0,0,0,.55);transition:transform .25s}
.chat-fab:hover{transform:scale(1.07)}.chat-fab svg{width:28px;height:28px}
.chat-fab .ping{position:absolute;top:4px;right:4px;width:14px;height:14px;border-radius:50%;background:#22b866;box-shadow:0 0 0 3px var(--bg);animation:sc-pulse 1.6s infinite}
.chat-fab.on .ping{display:none}
.chat{position:fixed;right:22px;bottom:96px;z-index:66;width:min(380px,calc(100vw - 24px));height:min(560px,calc(100vh - 140px));display:flex;flex-direction:column;border-radius:22px;overflow:hidden;background:var(--bg);color:var(--ink);box-shadow:0 40px 90px -30px rgba(0,0,0,.6),0 0 0 1px var(--line);animation:qin .3s}
.chat[hidden]{display:none}
.ch-h{display:flex;align-items:center;gap:12px;padding:16px 18px;background:var(--band);color:#fff}
.ch-h .mark{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:rgba(255,255,255,.18);font:var(--hw) 1rem/1 var(--hf)}
.ch-h div{flex:1;display:grid}.ch-h small{opacity:.85;display:flex;align-items:center;gap:6px}.ch-h small i{width:8px;height:8px;border-radius:50%;background:#3ddc84}
.ch-x{background:none;border:0;color:#fff;font-size:1.8rem;line-height:1;cursor:pointer;width:36px;height:36px}
.ch-b{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:10px;background:var(--surface)}
.msg{max-width:85%;padding:11px 14px;border-radius:16px;font-size:.95rem;line-height:1.5;white-space:pre-line}
.msg.bot{background:var(--bg);border:1px solid var(--line);border-bottom-left-radius:4px;align-self:flex-start}
.msg.me{background:var(--btn);color:var(--on-btn);border-bottom-right-radius:4px;align-self:flex-end}
.msg .acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.msg .cb{padding:7px 12px;border-radius:999px;background:color-mix(in srgb,var(--btn) 16%,transparent);color:var(--link);font-weight:600;font-size:.85rem}
.msg.dots{display:flex;gap:4px}.msg.dots i{width:7px;height:7px;border-radius:50%;background:var(--muted);animation:sc-pulse .9s infinite}.msg.dots i:nth-child(2){animation-delay:.15s}.msg.dots i:nth-child(3){animation-delay:.3s}
.ch-chips{display:flex;gap:6px;overflow-x:auto;padding:10px 14px 0;background:var(--surface)}
.ch-chips button{flex:none;font:500 .85rem/1 var(--bf);padding:9px 12px;border-radius:999px;border:1px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer}
.ch-in{display:flex;gap:8px;padding:12px 14px;background:var(--surface);border-top:1px solid var(--line)}
.ch-in input,.ch-cb input{flex:1;font:inherit;font-size:.95rem;color:var(--ink);background:var(--bg);border:1.5px solid var(--line);border-radius:999px;padding:11px 16px;outline:none;min-width:0}
.ch-in button{width:44px;height:44px;border-radius:50%;border:0;background:var(--btn);color:var(--on-btn);display:grid;place-items:center;cursor:pointer}.ch-in button svg{width:20px;height:20px}
.ch-cb{display:grid;gap:8px;padding:0 14px 14px;background:var(--surface)}
.ch-cb[hidden]{display:none}
@media(max-width:900px){.bgrid{grid-template-columns:1fr}.chat-fab{bottom:92px;right:16px;width:56px;height:56px}.chat{right:12px;bottom:160px;height:min(520px,calc(100vh - 190px))}}
`;
