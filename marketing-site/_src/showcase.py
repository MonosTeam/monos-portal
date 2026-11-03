# Generates the 16 industry showcase concept sites into marketing-site/concepts/
# Images live in concepts/img/ (built in the media sandbox, not in git).
import os, json, html
D = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(os.path.dirname(D), 'concepts')
os.makedirs(OUT, exist_ok=True)
E = html.escape

STAMP_CSS = ".mstamp{position:fixed;z-index:50;left:20px;bottom:20px;display:flex;align-items:center;gap:8px;background:#0B0B0C;color:#fff;font:700 11px/1 system-ui,sans-serif;letter-spacing:.1em;padding:9px 13px;border-radius:999px;text-transform:uppercase}.mstamp i{width:7px;height:7px;border-radius:50%;background:#D23B2C}"
STAMP = '<div class="mstamp"><i></i>Concept by MONOS</div>'
SMOOTH = "function smooth(to,ms){return new Promise(function(r){var f=scrollY,st=performance.now();(function s(n){var k=Math.min((n-st)/ms,1),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;scrollTo(0,f+(to-f)*e);k<1?requestAnimationFrame(s):r()})(st)})}"

def page(title, fonts, css, body, js=''):
    return ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            '<meta name="robots" content="noindex"><title>%s | Concept by MONOS</title>'
            '<link href="https://fonts.googleapis.com/css2?%s&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}img{display:block;max-width:100%%}button{font:inherit;cursor:pointer;border:0;background:none;color:inherit}%s%s</style></head><body>%s%s<script>%s\n%s</script></body></html>'
            % (E(title), fonts, css, STAMP_CSS, body, STAMP, SMOOTH, js))

# ---------------- A: build-your-order ----------------
def tpl_order(c):
    groups = ''
    for gi, (gname, mode, items) in enumerate(c['groups']):
        chips = ''.join('<button class="chip%s" data-g="%d" data-n="%s" data-p="%s">%s<b>%s</b></button>' % (' on' if (mode == 'one' and k == 0) else '', gi, E(n), p, E(n), ('+' if mode == 'many' and gi > 0 else '') + ('£%.2f' % p if p else 'Free')) for k, (n, p) in enumerate(items))
        groups += '<div class="grp" data-mode="%s"><h4><span>%02d</span>%s</h4><div class="chips">%s</div></div>' % (mode, gi + 1, E(gname), chips)
    css = """
:root{--bg:%(bg)s;--ink:%(ink)s;--acc:%(acc)s;--card:%(card)s;--mut:%(mut)s}
body{background:var(--bg);color:var(--ink);font-family:'%(body)s',system-ui,sans-serif;overflow-x:hidden}
nav{display:flex;align-items:center;gap:34px;padding:22px 56px;position:relative;z-index:3}
.logo{font:400 28px/1 '%(disp)s';letter-spacing:.01em}
nav ul{display:flex;gap:26px;list-style:none;font-weight:600;font-size:15px;margin-left:auto;opacity:.85}
.cart{display:flex;align-items:center;gap:10px;background:var(--acc);color:%(accink)s;font-weight:800;padding:12px 18px;border-radius:999px}
.cart i{font-style:normal;background:var(--ink);color:var(--bg);border-radius:50%%;width:24px;height:24px;display:grid;place-items:center;font-size:12px;transition:transform .3s}
.cart i.bump{transform:scale(1.35)}
.hero{display:grid;grid-template-columns:1fr 1.15fr;gap:40px;align-items:center;padding:20px 56px 60px}
.pill{display:inline-flex;gap:8px;align-items:center;background:var(--card);padding:9px 14px;border-radius:999px;font-weight:700;font-size:13px}
.pill i{width:8px;height:8px;border-radius:50%%;background:var(--acc)}
h1{font:400 clamp(64px,8.4vw,128px)/.88 '%(disp)s';text-transform:uppercase;letter-spacing:-.01em;margin:24px 0 22px}
h1 span{display:block;overflow:hidden}h1 span em{display:block;font-style:normal;transform:translateY(105%%);animation:up 1s cubic-bezier(.2,.7,.1,1) forwards}
h1 span:nth-child(2) em{animation-delay:.12s;color:var(--acc)}h1 span:nth-child(3) em{animation-delay:.24s}
@keyframes up{to{transform:none}}
.hero p{font-size:19px;line-height:1.5;color:var(--mut);max-width:460px}
.ctas{display:flex;gap:12px;margin-top:30px}
.b1{background:var(--acc);color:%(accink)s;font-weight:800;padding:18px 28px;border-radius:999px}
.b2{border:2px solid currentColor;font-weight:700;padding:16px 26px;border-radius:999px}
.pic{position:relative;border-radius:34px;overflow:hidden;aspect-ratio:1.25;animation:zin 1.6s cubic-bezier(.2,.7,.1,1) both}
@keyframes zin{from{transform:scale(.92);opacity:0}}
.pic img{width:100%%;height:100%%;object-fit:cover;animation:kb 14s ease-in-out infinite alternate}
@keyframes kb{to{transform:scale(1.08) translate(-1%%,1%%)}}
.tag{position:absolute;right:20px;top:20px;background:var(--acc);color:%(accink)s;font:400 22px/1 '%(disp)s';text-transform:uppercase;padding:16px 18px;border-radius:50%%;width:120px;height:120px;display:grid;place-items:center;text-align:center;animation:spin 16s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.build{padding:70px 56px 110px;display:grid;grid-template-columns:1.4fr .9fr;gap:40px;align-items:start}
.build h2{font:400 clamp(48px,5vw,76px)/.9 '%(disp)s';text-transform:uppercase;grid-column:1/-1;margin-bottom:6px}
.grp{background:var(--card);border-radius:26px;padding:24px 26px;margin-bottom:16px}
.grp h4{display:flex;align-items:center;gap:12px;font-size:14px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:16px}
.grp h4 span{background:var(--ink);color:var(--bg);border-radius:8px;padding:4px 8px;font-size:12px}
.chips{display:flex;flex-wrap:wrap;gap:10px}
.chip{display:flex;gap:10px;align-items:center;padding:13px 16px;border-radius:14px;border:2px solid transparent;background:var(--bg);font-weight:700;font-size:15px;transition:all .25s}
.chip b{font-weight:600;opacity:.6;font-size:13px}
.chip.on{background:var(--acc);color:%(accink)s;border-color:var(--ink);transform:translateY(-2px);box-shadow:0 4px 0 var(--ink)}
.chip.on b{opacity:.9}
.sum{position:sticky;top:30px;background:var(--ink);color:var(--bg);border-radius:30px;padding:30px}
.sum small{letter-spacing:.14em;text-transform:uppercase;font-weight:800;font-size:12px;opacity:.6}
.sum ul{list-style:none;margin:18px 0;display:grid;gap:10px;min-height:120px}
.sum li{display:flex;justify-content:space-between;font-weight:600;animation:pop .35s ease}
@keyframes pop{from{opacity:0;transform:translateX(-8px)}}
.tot{display:flex;justify-content:space-between;align-items:end;border-top:1px dashed currentColor;padding-top:18px}
.tot b{font:400 64px/1 '%(disp)s';font-variant-numeric:tabular-nums}
.go{display:block;text-align:center;margin-top:20px;background:var(--acc);color:%(accink)s;font-weight:800;padding:18px;border-radius:16px}
@media(max-width:900px){.hero,.build{grid-template-columns:1fr;padding-left:20px;padding-right:20px}nav ul{display:none}}
""" % c
    body = """<nav><div class="logo">%(name)s</div><ul>%(links)s</ul><span class="cart">Basket <i id="cn">0</i></span></nav>
<section class="hero"><div><span class="pill"><i></i>%(eyebrow)s</span><h1><span><em>%(h1a)s</em></span><span><em>%(h1b)s</em></span><span><em>%(h1c)s</em></span></h1><p>%(lead)s</p><div class="ctas"><span class="b1">%(cta)s →</span><span class="b2">%(cta2)s</span></div></div>
<div class="pic"><img src="img/%(img)s.jpg" alt=""><div class="tag">%(tag)s</div></div></section>
<section class="build" id="build"><h2>%(bh)s</h2><div>%(groups)s</div><aside class="sum"><small>Your order</small><ul id="lines"></ul><div class="tot"><span>Total</span><b id="tot">£0.00</b></div><span class="go">%(go)s</span></aside></section>""" % dict(c, links=''.join('<li>%s</li>' % E(l) for l in c['links']), groups=groups)
    js = """var shown=0;function fmt(n){return '£'+n.toFixed(2)}
function upd(){var t=0,h='',k=0;document.querySelectorAll('.chip.on').forEach(function(b){t+=+b.dataset.p;k++;h+='<li><span>'+b.dataset.n+'</span><span>'+(+b.dataset.p?fmt(+b.dataset.p):'Free')+'</span></li>'});document.getElementById('lines').innerHTML=h;var cn=document.getElementById('cn');cn.textContent=k;cn.classList.add('bump');setTimeout(function(){cn.classList.remove('bump')},250);var from=shown,st=performance.now();(function f(n){var p=Math.min((n-st)/500,1);shown=from+(t-from)*(1-Math.pow(1-p,3));document.getElementById('tot').textContent=fmt(shown);if(p<1)requestAnimationFrame(f)})(st)}
document.querySelectorAll('.grp').forEach(function(g){var one=g.dataset.mode==='one';g.querySelectorAll('.chip').forEach(function(b){b.onclick=function(){if(one){g.querySelectorAll('.chip').forEach(function(x){x.classList.remove('on')});b.classList.add('on')}else b.classList.toggle('on');upd()}})});upd();
window.demo=function(){var s=%s;return smooth(document.getElementById('build').offsetTop-20,1400).then(function(){s.forEach(function(q,k){setTimeout(function(){var e=document.querySelectorAll('.chip')[q];e&&e.click()},650*(k+1))})})};""" % json.dumps(c['demo'])
    return page(c['name'], c['fonts'], css, body, js)

# ---------------- B: instant quote ----------------
def tpl_quote(c):
    segs = ''
    for gi, (gname, mode, items) in enumerate(c['groups']):
        segs += '<label>%s</label><div class="seg" data-mode="%s">%s</div>' % (E(gname), mode, ''.join('<button data-v="%s"%s>%s</button>' % (v, ' class="on"' if (mode == 'one' and k == c['defaults'][gi]) else '', E(n)) for k, (n, v) in enumerate(items)))
    css = """
:root{--bg:%(bg)s;--ink:%(ink)s;--mut:%(mut)s;--acc:%(acc)s;--dk:%(dk)s;--hl:%(hl)s}
body{font-family:'%(body)s',system-ui,sans-serif;background:var(--bg);color:var(--ink);overflow-x:hidden}
nav{display:flex;align-items:center;padding:24px 56px;gap:30px}
.logo{font:800 23px/1 '%(disp)s';letter-spacing:-.03em}.logo span{color:var(--acc)}
nav ul{display:flex;gap:28px;list-style:none;color:var(--mut);font-weight:500;font-size:15px;margin-left:auto}
.nb{background:var(--acc);color:%(accink)s;font-weight:700;padding:11px 18px;border-radius:10px;font-size:15px}
.hero{display:grid;grid-template-columns:1fr 1.05fr;gap:50px;padding:36px 56px 0;align-items:center}
.ey{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--mut);margin-bottom:22px}.ey i{width:8px;height:8px;border-radius:50%%;background:#2fbf71;box-shadow:0 0 0 0 rgba(47,191,113,.5);animation:pl 2s infinite}
@keyframes pl{70%%{box-shadow:0 0 0 9px rgba(47,191,113,0)}}
h1{font:700 clamp(52px,5.6vw,80px)/.98 '%(disp)s';letter-spacing:-.05em}
h1 mark{background:linear-gradient(transparent 58%%,var(--hl) 58%%);background-size:0 100%%;background-repeat:no-repeat;animation:hl 1.2s .6s ease forwards;padding:0 4px;color:inherit}
@keyframes hl{to{background-size:100%% 100%%}}
.hero p{font-size:19px;color:var(--mut);line-height:1.5;margin:24px 0 30px;max-width:470px}
.btns{display:flex;gap:12px}.b1{background:var(--ink);color:var(--bg);padding:16px 24px;border-radius:12px;font-weight:700}.b2{background:#fff;border:1px solid rgba(0,0,0,.1);padding:16px 24px;border-radius:12px;font-weight:600;color:#111}
.ph{position:relative;border-radius:28px;overflow:hidden;aspect-ratio:1.15;box-shadow:0 30px 70px rgba(0,0,0,.14);animation:zin 1.4s cubic-bezier(.2,.7,.1,1) both}
@keyframes zin{from{transform:translateY(30px) scale(.96);opacity:0}}
.ph img{width:100%%;height:100%%;object-fit:cover;animation:kb 16s ease-in-out infinite alternate}@keyframes kb{to{transform:scale(1.07)}}
.badge{position:absolute;left:24px;bottom:24px;background:#fff;color:#111;border-radius:18px;padding:14px 18px;display:flex;gap:12px;align-items:center;font-weight:700;box-shadow:0 20px 40px rgba(0,0,0,.15);animation:zin 1s 1s both}
.badge b{display:grid;place-items:center;width:46px;height:46px;border-radius:50%%;background:var(--acc);color:%(accink)s;font-size:15px}.badge small{display:block;color:#777;font-weight:500}
.stats{display:flex;gap:56px;padding:44px 56px 64px}.stats b{display:block;font:700 40px '%(disp)s';letter-spacing:-.04em}.stats span{color:var(--mut);font-size:14px}
.q{margin:0 56px 90px;background:#fff;color:#111;border-radius:32px;padding:44px;display:grid;grid-template-columns:1.3fr 1fr;gap:40px;box-shadow:0 30px 80px -40px rgba(0,0,0,.25)}
.q h2{font:700 44px/1 '%(disp)s';letter-spacing:-.045em;margin-bottom:20px}
.q label{display:block;font-size:13px;font-weight:700;color:#777;text-transform:uppercase;letter-spacing:.08em;margin:22px 0 10px}
.seg{display:flex;flex-wrap:wrap;gap:8px}
.seg button{font-weight:600;font-size:15px;background:var(--bg);color:var(--ink);border:1px solid transparent;border-radius:12px;padding:12px 16px;transition:.2s}
.seg button.on{background:var(--acc);color:%(accink)s;box-shadow:0 4px 0 var(--dk)}
.price{background:var(--dk);color:#fff;border-radius:24px;padding:30px;display:flex;flex-direction:column}
.price small{color:rgba(255,255,255,.6);font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.08em}
.price .v{font:800 84px/1 '%(disp)s';letter-spacing:-.06em;margin:8px 0 6px;font-variant-numeric:tabular-nums}
.price ul{list-style:none;margin:20px 0;color:rgba(255,255,255,.8);font-size:15px;display:grid;gap:10px}.price li:before{content:"✓ ";color:var(--hl)}
.price .bk{margin-top:auto;background:var(--acc);color:%(accink)s;border-radius:14px;padding:16px;text-align:center;font-weight:800}
@media(max-width:900px){.hero,.q{grid-template-columns:1fr}.hero,.stats{padding-left:20px;padding-right:20px}.q{margin:0 16px 60px;padding:24px}nav ul{display:none}}
""" % c
    body = """<nav><div class="logo">%(logo)s</div><ul>%(links)s</ul><span class="nb">%(cta)s</span></nav>
<section class="hero"><div><div class="ey"><i></i>%(eyebrow)s</div><h1>%(h1)s</h1><p>%(lead)s</p><div class="btns"><span class="b1">%(cta)s →</span><span class="b2">How it works</span></div></div>
<div class="ph"><img src="img/%(img)s.jpg" alt=""><div class="badge"><b>%(rating)s</b><div>%(badge)s<small>%(badge2)s</small></div></div></div></section>
<div class="stats">%(stats)s</div>
<section class="q" id="q"><div><h2>%(qh)s</h2>%(segs)s</div><div class="price"><small>%(plabel)s</small><div class="v" id="price">£0</div><span style="color:rgba(255,255,255,.6)">%(pnote)s</span><ul>%(perks)s</ul><span class="bk">%(book)s</span></div></section>""" % dict(c, links=''.join('<li>%s</li>' % E(l) for l in c['links']), stats=''.join('<div><b>%s</b><span>%s</span></div>' % s for s in c['stats']), perks=''.join('<li>%s</li>' % E(p) for p in c['perks']), segs=segs)
    js = """var shown=0;function total(){var t=0;document.querySelectorAll('.seg button.on').forEach(function(b){t+=+b.dataset.v});return t}
function anim(){var to=total(),from=shown,st=performance.now();(function f(n){var p=Math.min((n-st)/550,1);shown=Math.round(from+(to-from)*(1-Math.pow(1-p,3)));document.getElementById('price').textContent='£'+shown.toLocaleString('en-GB');if(p<1)requestAnimationFrame(f)})(st)}
document.querySelectorAll('.seg').forEach(function(g){var one=g.dataset.mode==='one';g.querySelectorAll('button').forEach(function(b){b.onclick=function(){if(one){g.querySelectorAll('button').forEach(function(x){x.classList.remove('on')});b.classList.add('on')}else b.classList.toggle('on');anim()}})});anim();
window.demo=function(){var s=%s;return smooth(document.getElementById('q').offsetTop-40,1400).then(function(){s.forEach(function(q,k){setTimeout(function(){var e=document.querySelectorAll('.seg button')[q];e&&e.click()},750*(k+1))})})};""" % json.dumps(c['demo'])
    return page(c['name'], c['fonts'], css, body, js)

# ---------------- C: editorial scroll story ----------------
def tpl_story(c):
    n = len(c['frames'])
    frames = ''.join('<div class="fr%s"><img src="img/%s.jpg" alt=""><div class="txt"><small>%s</small><h1><span><i>%s</i></span><span><i>%s</i></span></h1><p>%s</p>%s</div></div>' % (' on' if k == 0 else '', f[0], E(f[1]), E(f[2]), E(f[3]), E(f[4]), '<span class="shop">%s</span>' % E(c['cta']) if k in (0, n - 1) else '') for k, f in enumerate(c['frames']))
    dark = c.get('dark')
    css = """
:root{--bg:%(bg)s;--ink:%(ink)s;--mut:%(mut)s;--acc:%(acc)s}
body{font-family:'%(body)s',system-ui,sans-serif;background:var(--bg);color:var(--ink)}
.bar{position:fixed;top:0;left:0;right:0;z-index:10;font-size:11px;letter-spacing:.08em;color:var(--mut);display:flex;justify-content:space-between;padding:9px 48px;background:var(--bg)}
nav{position:fixed;top:32px;left:0;right:0;z-index:10;display:flex;align-items:center;padding:16px 48px;gap:34px;font-size:13px;letter-spacing:.04em;color:%(navc)s}
.logo{font:500 24px '%(disp)s';letter-spacing:.06em;text-transform:uppercase}
nav ul{display:flex;gap:26px;list-style:none;margin-left:110px}nav .r{margin-left:auto;display:flex;gap:18px;align-items:center}
nav .r b{border:1px solid currentColor;padding:9px 14px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;font-size:11px}
.story{height:%(h)dvh;position:relative}
.stage{position:sticky;top:0;height:100vh;overflow:hidden}
.fr{position:absolute;inset:0;opacity:0;transition:opacity 1s ease}
.fr img{position:absolute;inset:0;width:100%%;height:100%%;object-fit:cover;transform:scale(1.08);transition:transform 7s ease}
.fr:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,%(scrim)s 0%%,%(scrim2)s 38%%,transparent 62%%)}
.fr.on{opacity:1}.fr.on img{transform:scale(1)}
.txt{position:absolute;left:56px;top:50%%;transform:translateY(-38%%);z-index:3;max-width:520px;color:%(txtc)s}
.txt small{font:italic 400 17px '%(disp)s';opacity:.8}
.txt h1{font:400 clamp(56px,6vw,88px)/.95 '%(disp)s';letter-spacing:-.01em;text-transform:%(tt)s;margin:12px 0 20px}
.txt h1 span{display:block;overflow:hidden}.txt h1 span i{display:block;font-style:normal;transform:translateY(110%%);transition:transform 1s cubic-bezier(.2,.7,.1,1)}
.fr.on .txt h1 span i{transform:none}.fr.on .txt h1 span:nth-child(2) i{transition-delay:.12s}
.txt p{font-size:16px;line-height:1.65;max-width:340px;opacity:0;transform:translateY(12px);transition:all .9s .3s}.fr.on .txt p{opacity:.85;transform:none}
.txt .shop{display:inline-block;margin-top:24px;background:var(--acc);color:%(accink)s;font-size:11px;letter-spacing:.16em;padding:14px 20px;text-transform:uppercase}
.dots{position:absolute;bottom:34px;left:56px;display:flex;gap:8px;z-index:5}
.dots i{width:7px;height:7px;border-radius:50%%;background:%(dotc)s;opacity:.35;transition:all .4s}.dots i.on{width:28px;border-radius:4px;opacity:1}
.count{position:absolute;right:48px;bottom:30px;z-index:5;font:400 64px/1 '%(disp)s';color:%(txtc)s;opacity:.9}
.after{padding:110px 56px;display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.after h2{grid-column:1/-1;font:400 56px/1 '%(disp)s';text-transform:%(tt)s;margin-bottom:10px}
.card{border-top:1px solid %(line)s;padding-top:18px}.card b{font:400 26px '%(disp)s'}.card p{color:var(--mut);margin-top:8px;line-height:1.5}
@media(max-width:900px){.txt{left:22px;right:22px}nav ul{display:none}.after{grid-template-columns:1fr;padding:60px 20px}.bar{padding:9px 20px}nav{padding:14px 20px}}
""" % dict(c, h=n * 120, navc=c.get('navc', 'var(--ink)'), txtc=c.get('txtc', 'var(--ink)'), dotc=c.get('dotc', 'var(--ink)'), line=c.get('line', 'rgba(0,0,0,.15)'))
    body = """<div class="bar"><span>%(bar1)s</span><span>%(bar2)s</span></div>
<nav><div class="logo">%(name)s</div><ul>%(links)s</ul><div class="r"><span>%(navr)s</span><b>%(cta)s</b></div></nav>
<section class="story" id="story"><div class="stage">%(frames)s<div class="dots" id="dots">%(dots)s</div><div class="count" id="cnt">01</div></div></section>
<section class="after"><h2>%(ah)s</h2>%(cards)s</section>""" % dict(c, links=''.join('<li>%s</li>' % E(l) for l in c['links']), frames=frames, dots=''.join('<i%s></i>' % (' class="on"' if k == 0 else '') for k in range(n)), cards=''.join('<div class="card"><b>%s</b><p>%s</p></div>' % (E(a), E(b)) for a, b in c['cards']))
    js = """var fr=document.querySelectorAll('.fr'),dots=document.querySelectorAll('#dots i'),cur=0,N=%d,story=document.getElementById('story');
function set(i){if(i===cur)return;fr[cur].classList.remove('on');dots[cur].classList.remove('on');cur=i;fr[i].classList.add('on');dots[i].classList.add('on');document.getElementById('cnt').textContent='0'+(i+1)}
addEventListener('scroll',function(){var r=story.getBoundingClientRect(),p=-r.top/(r.height-innerHeight);set(Math.max(0,Math.min(N-1,Math.floor(p*N))))},{passive:true});
window.demo=async function(){for(var i=1;i<N;i++){await smooth(story.offsetTop+(story.offsetHeight-innerHeight)*(i+.5)/N,900);await new Promise(function(r){setTimeout(r,1500)})}await smooth(story.offsetTop+story.offsetHeight-innerHeight*.4,1400)};""" % n
    return page(c['name'], c['fonts'], css, body, js)

# ---------------- D: giant wordmark ----------------
def tpl_word(c):
    letters = ''.join('<span style="animation-delay:%.2fs">%s</span>' % (k * .08, E(ch)) for k, ch in enumerate(c['word']))
    css = """
:root{--bg:%(bg)s;--word:%(word_c)s;--ink:#0d0d0d;--txt:%(txt)s}
body{font-family:'%(body)s',system-ui,sans-serif;background:#0d0d0d;color:#fff;overflow-x:hidden}
.hero{position:relative;height:100vh;min-height:720px;background:var(--bg);overflow:hidden;color:var(--txt)}
nav{position:absolute;top:0;left:0;right:0;z-index:6;display:flex;align-items:center;padding:24px 40px;font-weight:700;font-size:13px;letter-spacing:.08em;text-transform:uppercase}
.logo{font:900 22px '%(disp)s';letter-spacing:.02em}
nav ul{display:flex;gap:30px;list-style:none;margin:0 auto}
.word{position:absolute;z-index:1;left:50%%;top:%(wtop)s;transform:translate(-50%%,-50%%);font:400 %(wsize)s/.8 '%(disp)s';letter-spacing:%(wls)s;color:var(--word);white-space:nowrap;text-transform:uppercase}
.word span{display:inline-block;transform:translateY(45%%);opacity:0;animation:up 1.1s cubic-bezier(.2,.7,.1,1) forwards}
@keyframes up{to{transform:none;opacity:1}}
.sub{position:absolute;z-index:2;left:50%%;bottom:0;height:%(sh)s;transform:translateX(-50%%) scale(1.06);animation:zoom 2.4s cubic-bezier(.2,.7,.1,1) forwards;max-width:none}
@keyframes zoom{to{transform:translateX(-50%%) scale(1)}}
.meta{position:absolute;z-index:3;left:40px;bottom:36px;font-weight:700;font-size:13px;letter-spacing:.1em;text-transform:uppercase;border-top:1px solid currentColor;padding-top:12px;width:280px;line-height:1.6}
.cta{position:absolute;z-index:3;right:40px;bottom:36px;text-align:right}
.cta b{font:900 38px/1 '%(disp)s';letter-spacing:.01em;display:block;text-transform:uppercase}
.cta span{display:inline-block;margin-top:12px;background:%(btn)s;color:%(btnink)s;font-weight:800;font-size:13px;letter-spacing:.1em;padding:15px 22px;border-radius:999px;text-transform:uppercase}
.drop{position:absolute;z-index:3;right:40px;top:110px;width:150px;height:150px;border-radius:50%%;background:%(btn)s;color:%(btnink)s;display:grid;place-items:center;text-align:center;font:900 15px/1.05 '%(body)s';text-transform:uppercase;animation:spin 14s linear infinite;letter-spacing:.04em}
@keyframes spin{to{transform:rotate(360deg)}}
.tick{background:%(btn)s;color:%(btnink)s;overflow:hidden;padding:14px 0;font:400 22px '%(disp)s';letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
.tick div{display:inline-block;animation:mq 22s linear infinite}@keyframes mq{to{transform:translateX(-50%%)}}
.grid{display:grid;grid-template-columns:1.1fr 1fr;min-height:92vh}
.grid .a{background:#111 url(img/%(detail)s.jpg) center/cover}
.grid .b{background:#f2f2ee;color:var(--ink);padding:70px 60px;display:flex;flex-direction:column;justify-content:center}
.grid h2{font:400 84px/.86 '%(disp)s';letter-spacing:-.01em;text-transform:uppercase}.grid h2 em{color:%(em)s;font-style:normal}
.grid p{font-size:17px;line-height:1.55;margin:22px 0;max-width:400px;color:#444}
.list{list-style:none;display:grid;gap:12px;margin-bottom:28px}.list li{display:flex;justify-content:space-between;border-bottom:1px solid #ddd;padding-bottom:10px;font-weight:700;max-width:420px}
.add{align-self:flex-start;background:var(--ink);color:#fff;font-weight:800;padding:18px 28px;border-radius:999px;letter-spacing:.06em;text-transform:uppercase;font-size:14px}
@media(max-width:900px){nav ul{display:none}.grid{grid-template-columns:1fr}.grid .a{min-height:50vh}.drop{width:110px;height:110px;top:90px;right:16px}.meta{display:none}}
""" % c
    tick = ('%s ● ' % c['tick']) * 12
    body = """<section class="hero"><nav><div class="logo">%(name)s</div><ul>%(links)s</ul><div>%(navr)s</div></nav>
<div class="word">%(letters)s</div><img class="sub" src="img/%(cut)s_cut.png" alt=""><div class="drop">%(drop)s</div>
<div class="meta">%(meta)s</div><div class="cta"><b>%(price)s</b><span>%(cta)s</span></div></section>
<div class="tick"><div>%(tick)s%(tick)s</div></div>
<section class="grid"><div class="a"></div><div class="b"><h2>%(h2)s</h2><p>%(p)s</p><ul class="list">%(list)s</ul><span class="add">%(cta)s</span></div></section>""" % dict(c, links=''.join('<li>%s</li>' % E(l) for l in c['links']), letters=letters, tick=tick, list=''.join('<li><span>%s</span><span>%s</span></li>' % (E(a), E(b)) for a, b in c['list']))
    js = "window.demo=async function(){await new Promise(function(r){setTimeout(r,2600)});await smooth(innerHeight*.98,1600);await new Promise(function(r){setTimeout(r,1800)})};"
    return page(c['name'], c['fonts'], css, body, js)

# ================= CONFIGS =================
SITES = []
def add(slug, tpl, industry, caption, c):
    c['slug'] = slug; SITES.append((slug, tpl, industry, caption, c))

# ---- A
add('grind', 'order', 'Coffee shop', ('Order ahead.', 'Skip the queue.'), dict(
    name='GRIND & CO.', fonts='family=Anton&family=DM+Sans:wght@400;500;700;800', disp='Anton', body='DM Sans',
    bg='#1E1410', ink='#F4E9DA', acc='#E8A04A', accink='#1E1410', card='#2B1E18', mut='#CDBBA7',
    links=['Menu', 'Order ahead', 'Beans', 'Find us'], eyebrow='Order ahead, skip the queue', h1a='Build', h1b='your perfect', h1c='cup.',
    lead='Speciality coffee roasted in Ancoats. Choose your drink, your milk and your extras, then collect in five minutes.',
    cta='Order now', cta2='See the menu', img='coffee', tag='Fresh<br>roast<br>daily', bh='Make it yours', go='Pay and collect in 5 mins',
    groups=[('Drink', 'one', [('Flat white', 3.40), ('Iced oat latte', 3.90), ('Cortado', 3.10), ('Mocha', 3.80)]),
            ('Milk', 'one', [('Whole', 0), ('Oat', 0.40), ('Almond', 0.40), ('Coconut', 0.40)]),
            ('Extras', 'many', [('Extra shot', 0.60), ('Caramel', 0.50), ('Vanilla', 0.50), ('Cinnamon', 0.30)]),
            ('Bakery', 'many', [('Almond croissant', 3.20), ('Cinnamon bun', 3.50), ('Banana bread', 2.90)])],
    demo=[1, 5, 8, 9, 12]))
add('petal', 'order', 'Florist', ('Bouquets built', 'in a tap.'), dict(
    name='PETAL & STEM', fonts='family=Fraunces:opsz,wght@9..144,600&family=Outfit:wght@400;500;700;800', disp='Fraunces', body='Outfit',
    bg='#DDE5D6', ink='#1F2A22', acc='#E99A9A', accink='#1F2A22', card='#EEF2EA', mut='#4A5A4E',
    links=['Bouquets', 'Weddings', 'Subscriptions', 'Workshops'], eyebrow='Same-day delivery across Manchester', h1a='Build', h1b='a bouquet', h1c='they keep.',
    lead='Seasonal British stems, hand-tied in our Didsbury studio. Pick a size, your flowers and the wrap, and we deliver today.',
    cta='Build a bouquet', cta2='Weekly flowers', img='florist', tag='Same<br>day<br>delivery', bh='Your bouquet', go='Deliver today',
    groups=[('Size', 'one', [('Petite', 35), ('Classic', 55), ('Grand', 85)]),
            ('Flowers', 'one', [('Peonies', 0), ('Garden roses', 6), ('Ranunculus', 4), ('Wild mix', 0)]),
            ('Wrap', 'one', [('Kraft paper', 0), ('Silk ribbon', 5), ('Vase', 18)]),
            ('Extras', 'many', [('Handwritten card', 3), ('Chocolates', 9), ('Candle', 14)])],
    demo=[1, 4, 8, 9, 10]))
add('scoop', 'order', 'Dessert parlour', ('Websites people', 'can taste.'), dict(
    name='SCOOP LAB', fonts='family=Bowlby+One&family=Rubik:wght@400;500;700;800', disp='Bowlby One', body='Rubik',
    bg='#FF6FAE', ink='#2A0E1C', acc='#FFE14D', accink='#2A0E1C', card='#FF8DC0', mut='#4A1830',
    links=['Flavours', 'Cakes', 'Parties', 'Visit'], eyebrow='New: pistachio crunch', h1a='Stack', h1b='your', h1c='scoops.',
    lead='Small-batch gelato churned every morning on the Northern Quarter. Pick your cone, your flavours and your toppings.',
    cta='Order a tub', cta2='Book a party', img='gelato', tag='Made<br>fresh<br>today', bh='Build your cone', go='Collect in 10 mins',
    groups=[('Serve', 'one', [('Cone', 3.50), ('Cup', 3.50), ('Waffle cone', 4.50)]),
            ('Scoops', 'many', [('Pistachio', 1.80), ('Strawberry', 1.80), ('Dark chocolate', 1.80), ('Salted caramel', 1.80)]),
            ('Toppings', 'many', [('Sprinkles', 0.50), ('Hot fudge', 0.90), ('Crushed nuts', 0.70), ('Marshmallow', 0.60)])],
    demo=[2, 3, 4, 5, 8, 9]))
# ---- B
add('smile', 'quote', 'Dental clinic', ('Book more patients', 'online.'), dict(
    name='Smile Theory', logo='smile<span>theory</span>', fonts='family=Manrope:wght@400;500;600;700;800', disp='Manrope', body='Manrope',
    bg='#EEF7F4', ink='#0F2A2A', mut='#5A706D', acc='#12B5A0', accink='#fff', dk='#0F2A2A', hl='#BDEFE3',
    links=['Treatments', 'Invisalign', 'Whitening', 'Our team'], eyebrow='New patients welcome this week',
    h1='Your new smile, <mark>priced in 30 seconds.</mark>', lead='Private dentistry in Chorlton with clear prices, flexible finance and appointments that run on time.',
    cta='Get my price', img='dental', rating='4.9', badge='1,200+ smiles this year', badge2='Rated excellent by patients',
    stats=[('15 yrs', 'Trusted locally'), ('0%', 'Finance available'), ('7 days', 'Open every week'), ('4.9★', 'Patient rating')],
    qh='Your treatment,<br>your price.', plabel='Your estimate', pnote='Includes consultation and aftercare',
    perks=['Free initial consultation', 'Spread the cost over 12 months', 'Evening and weekend slots'], book='Book my consultation',
    groups=[('Treatment', 'one', [('Check-up', 45), ('Hygiene clean', 65), ('Whitening', 295), ('Invisalign', 2400)]),
            ('Add-ons', 'many', [('X-rays', 35), ('Fluoride', 20), ('Night guard', 180)]),
            ('When', 'one', [('This week', 0), ('Next week', 0), ('Evening', 0)])],
    defaults=[0, 0, 0], demo=[2, 4, 3, 9]))
add('flowright', 'quote', 'Plumbing and heating', ('Fixed prices.', 'Phones ringing.'), dict(
    name='FlowRight', logo='flow<span>right</span>', fonts='family=Inter+Tight:wght@400;500;600;700;800', disp='Inter Tight', body='Inter Tight',
    bg='#F2F6FC', ink='#0B1730', mut='#5B6782', acc='#1E6BFF', accink='#fff', dk='#0B1730', hl='#FFD84D',
    links=['Boilers', 'Leaks', 'Bathrooms', 'Reviews'], eyebrow='Engineers available today',
    h1='Boiler or leak? <mark>Fixed price in 30 seconds.</mark>', lead='Gas Safe engineers across Greater Manchester. No call-out surprises, just a fixed price before we arrive.',
    cta='Get my price', img='plumber', rating='4.9', badge='3,100 jobs completed', badge2='Gas Safe registered',
    stats=[('60 min', 'Average arrival'), ('12 mo', 'Guarantee on work'), ('24/7', 'Emergency cover'), ('4.9★', 'Customer rating')],
    qh='Your job,<br>your fixed price.', plabel='Your fixed price', pnote='Includes parts, labour and VAT',
    perks=['No call-out charge', '12-month guarantee', 'Pay after the job'], book='Book an engineer',
    groups=[('Job', 'one', [('Leaking tap', 89), ('Boiler service', 95), ('Boiler repair', 165), ('New boiler', 2195)]),
            ('Property', 'one', [('Flat', 0), ('House', 20), ('Commercial', 60)]),
            ('Extras', 'many', [('Power flush', 395), ('Smart thermostat', 189), ('Radiator', 240)])],
    defaults=[0, 0], demo=[2, 5, 8, 3]))
add('paws', 'quote', 'Dog grooming', ('Book a groom', 'in seconds.'), dict(
    name='Paws & Polish', logo='paws<span>&amp;</span>polish', fonts='family=Baloo+2:wght@500;600;700;800', disp='Baloo 2', body='Baloo 2',
    bg='#FFF4EA', ink='#2B1A14', mut='#7A6359', acc='#FF7E5F', accink='#fff', dk='#2B1A14', hl='#FFD3C2',
    links=['Grooms', 'Puppy club', 'Spa', 'Gallery'], eyebrow='Saturday slots just opened',
    h1='A fresh new look, <mark>priced in 30 seconds.</mark>', lead='Calm, cage-free grooming in Sale. One dog at a time, gentle handling and a bandana to go home in.',
    cta='Get my price', img='dog', rating='5.0', badge='860 happy pups', badge2='Fear-free certified',
    stats=[('1:1', 'One dog at a time'), ('0', 'Cages, ever'), ('8 yrs', 'Grooming experience'), ('5.0★', 'Owner rating')],
    qh='Your dog,<br>your groom.', plabel='Your groom', pnote='Includes bath, dry, nails and ears',
    perks=['Photo update during the groom', 'Free bandana or bow', 'Collect when ready'], book='Book this groom',
    groups=[('Size', 'one', [('Small', 38), ('Medium', 48), ('Large', 62), ('Giant', 78)]),
            ('Groom', 'one', [('Bath and tidy', 0), ('Full groom', 12), ('Hand strip', 25)]),
            ('Spa extras', 'many', [('Blueberry facial', 8), ('Teeth clean', 10), ('Paw balm', 6)])],
    defaults=[0, 0], demo=[1, 5, 7, 8]))
add('brickbeam', 'quote', 'Builder and renovations', ('Quotes that win', 'the job.'), dict(
    name='Brick & Beam', logo='brick<span>&amp;</span>beam', fonts='family=Archivo:wght@400;500;600;700;800', disp='Archivo', body='Archivo',
    bg='#EFEBE4', ink='#1B1B1B', mut='#6B655C', acc='#D9572B', accink='#fff', dk='#1B1B1B', hl='#F3C9B5',
    links=['Extensions', 'Lofts', 'Kitchens', 'Projects'], eyebrow='Now booking spring 2027 builds',
    h1='Your extension, <mark>estimated in 30 seconds.</mark>', lead='Design and build across Manchester and Cheshire. One team from drawings to the final coat of paint.',
    cta='Get my estimate', img='build', rating='4.9', badge='140 homes transformed', badge2='FMB and TrustMark',
    stats=[('20 yrs', 'Building homes'), ('10 yr', 'Insurance-backed'), ('1 team', 'Design to finish'), ('4.9★', 'Client rating')],
    qh='Your project,<br>your estimate.', plabel='Guide price', pnote='Design, build and project management',
    perks=['Free site visit', 'Fixed-price contract', 'Weekly progress photos'], book='Book a site visit',
    groups=[('Project', 'one', [('Single-storey', 48000), ('Double-storey', 82000), ('Loft conversion', 52000), ('Kitchen', 24000)]),
            ('Size', 'one', [('Small', 0), ('Medium', 9000), ('Large', 18000)]),
            ('Finish', 'many', [('Skylights', 3800), ('Bifold doors', 6500), ('Underfloor heating', 4200)])],
    defaults=[0, 0], demo=[0, 5, 7, 8]))
# ---- C
add('lumiere', 'story', 'Nail and beauty salon', ('Beauty brands', 'deserve this.'), dict(
    name='Lumière', fonts='family=Cormorant+Garamond:ital,wght@0,500;1,400&family=Jost:wght@400;500', disp='Cormorant Garamond', body='Jost',
    bg='#F5EFE9', ink='#2A211C', mut='#7D6F66', acc='#2A211C', accink='#F5EFE9', scrim='rgba(245,239,233,.92)', scrim2='rgba(245,239,233,.55)', tt='none',
    bar1='Nail and lash studio, Spinningfields', bar2='Book online · Gift cards available', links=['Nails', 'Lashes', 'Brows', 'Gift cards'], navr='Book', cta='Book now',
    frames=[('nail1', 'Nail studio', 'Quiet', 'luxury.', 'Gel, BIAB and hand-painted art in a calm, softly lit studio.'),
            ('nail2', 'The ritual', 'Made by', 'hand.', 'Every set is shaped, built and finished by our senior artists.'),
            ('nail3', 'The colour edit', 'Your shade,', 'perfected.', 'Forty curated tones, from milky nudes to deep burgundy.')],
    ah='The menu', cards=[('BIAB infill', '£38 · 60 minutes'), ('Gel manicure', '£32 · 45 minutes'), ('Nail art', 'From £5 per nail')]))
add('northside', 'story', 'Estate agent', ('Homes that sell', 'themselves.'), dict(
    name='Northside', fonts='family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500', disp='DM Serif Display', body='DM Sans',
    bg='#EEF0EC', ink='#1C2321', mut='#66706B', acc='#1C2321', accink='#fff', scrim='rgba(14,18,17,.82)', scrim2='rgba(14,18,17,.45)', tt='none', txtc='#fff', navc='#fff', dotc='#fff',
    bar1='Sales and lettings across South Manchester', bar2='Free valuation in 24 hours', links=['Buy', 'Rent', 'Sell', 'Area guides'], navr='Saved (2)', cta='Book a valuation',
    frames=[('home1', 'Didsbury · 4 bed', 'Find your', 'next chapter.', 'Period homes, new builds and city apartments, hand-picked across South Manchester.'),
            ('home2', 'Inside', 'Light-filled', 'living.', 'Every listing gets professional photography, floorplans and a film tour.'),
            ('home3', 'The details', 'Homes that', 'sell faster.', 'Our listings sell in 23 days on average, 9 days faster than the local market.')],
    ah='Featured homes', line='rgba(0,0,0,.15)', cards=[('Lapwing Lane, Didsbury', '4 bed Victorian · £865,000'), ('Beech Road, Chorlton', '3 bed terrace · £495,000'), ('Ancoats Wharf', '2 bed apartment · £1,450 pcm')]))
add('ashworth', 'story', 'Law firm', ('Websites that', 'build trust.'), dict(
    name='Ashworth & Vale', fonts='family=Playfair+Display:ital,wght@0,500;1,400&family=Inter:wght@400;500', disp='Playfair Display', body='Inter',
    bg='#0F1B2D', ink='#EDE7DA', mut='#A9B0BC', acc='#C9A86A', accink='#0F1B2D', scrim='rgba(15,27,45,.92)', scrim2='rgba(15,27,45,.6)', tt='none', txtc='#EDE7DA', dotc='#EDE7DA', line='rgba(237,231,218,.2)', dark=True,
    bar1='Solicitors · Manchester and London', bar2='Free 15-minute first call', links=['Business', 'Property', 'Family', 'Our people'], navr='Client login', cta='Speak to a solicitor',
    frames=[('law1', 'Solicitors since 1998', 'Clear advice.', 'Fixed fees.', 'Business, property and family law, explained in plain English.'),
            ('law2', 'Contracts and property', 'Every detail,', 'covered.', 'Conveyancing, leases and commercial contracts handled start to finish.'),
            ('law3', 'Your solicitor', 'One partner,', 'start to finish.', 'You speak to the same senior solicitor at every stage.')],
    ah='Fixed-fee services', cards=[('Residential conveyancing', 'From £895 + VAT'), ('Business contracts', 'From £450 + VAT'), ('Wills and probate', 'From £250 + VAT')]))
add('everafter', 'story', 'Wedding planner', ('Unforgettable days', 'start online.'), dict(
    name='Ever After', fonts='family=Italiana&family=Montserrat:wght@400;500', disp='Italiana', body='Montserrat',
    bg='#F7F3EE', ink='#2C2622', mut='#7E746B', acc='#2C2622', accink='#F7F3EE', scrim='rgba(20,16,12,.78)', scrim2='rgba(20,16,12,.35)', tt='uppercase', txtc='#fff', navc='#fff', dotc='#fff',
    bar1='Wedding planning and styling · North West', bar2='Now booking 2027 and 2028', links=['Weddings', 'Styling', 'Venues', 'Stories'], navr='Enquire', cta='Plan my wedding',
    frames=[('wed1', 'Full planning', 'Every detail,', 'handled.', 'From venue to final dance, we plan, style and run your day.'),
            ('wed2', 'Your day', 'Just', 'the two of you.', 'We take care of everything else so you can be present.'),
            ('wed3', 'Styling', 'Made to', 'be remembered.', 'Florals, tablescapes and cakes designed around your story.')],
    ah='Packages', cards=[('On the day', 'From £1,200'), ('Partial planning', 'From £2,800'), ('Full planning', 'From £5,500')]))
add('millhouse', 'story', 'Boutique hotel', ('More direct', 'bookings.'), dict(
    name='The Mill House', fonts='family=Libre+Caslon+Display&family=Karla:wght@400;500', disp='Libre Caslon Display', body='Karla',
    bg='#F3EEE6', ink='#2A2520', mut='#7A7065', acc='#2A2520', accink='#F3EEE6', scrim='rgba(18,15,12,.8)', scrim2='rgba(18,15,12,.38)', tt='none', txtc='#fff', navc='#fff', dotc='#fff',
    bar1='A riverside hotel in the Peak District', bar2='Book direct for the best rate', links=['Rooms', 'Dining', 'Spa', 'Offers'], navr='Gift vouchers', cta='Book direct',
    frames=[('hotel2', 'Riverside since 1824', 'Slow down', 'by the water.', 'Twelve rooms in a restored cotton mill, forty minutes from Manchester.'),
            ('hotel1', 'The rooms', 'Linen, stone', 'and quiet.', 'Wake to the river, sleep in Egyptian cotton, stay a little longer.'),
            ('hotel3', 'Breakfast in bed', 'Mornings,', 'unhurried.', 'Local eggs, fresh pastries and coffee from the village roaster.')],
    ah='Stay with us', cards=[('River room', 'From £185 per night'), ('Mill suite', 'From £260 per night'), ('Weekend escape', '2 nights with dinner, £495')]))
# ---- D
add('faderoom', 'word', 'Barbershop', ('Sharp cuts.', 'Sharper websites.'), dict(
    name='FADE ROOM', fonts='family=Anton&family=Archivo:wght@500;700;900', disp='Anton', body='Archivo',
    bg='#FD7A00', word_c='#111', txt='#111', word='FADE', wsize='40vw', wls='.01em', wtop='46%', sh='92%', cut='barber', detail='barber2',
    btn='#111', btnink='#FD7A00', em='#FD7A00', links=['Cuts', 'Beards', 'Barbers', 'Shop'], navr='Book 00',
    drop='Walk-ins<br>till<br>8pm', meta='Northern Quarter<br>Open 7 days', price='Cuts from £24', cta='Book a chair', tick='Skin fades · Beard sculpts · Hot towel shaves',
    h2='Fresh<br>every <em>week.</em>', p='Precision fades, beard sculpting and hot towel shaves from barbers who actually listen.',
    list=[('Skin fade', '£26'), ('Cut and beard', '£34'), ('Hot towel shave', '£22')]))
add('ironclad', 'word', 'Gym and fitness', ('Built to convert.', 'Like your PT.'), dict(
    name='IRONCLAD', fonts='family=Anton&family=Barlow:wght@500;700;900', disp='Anton', body='Barlow',
    bg='#A4F911', word_c='#0d0d0d', txt='#0d0d0d', word='IRON', wsize='38vw', wls='.01em', wtop='44%', sh='94%', cut='gym', detail='gym2',
    btn='#0d0d0d', btnink='#A4F911', em='#5c8f00', links=['Classes', 'Personal training', 'Memberships', 'Timetable'], navr='Join',
    drop='First<br>week<br>free', meta='Open 24/7<br>Salford Quays', price='From £29/mo', cta='Start free week', tick='Strength · HIIT · Boxing · Recovery',
    h2='Stronger<br>every <em>rep.</em>', p='A 24/7 strength gym with coached classes, real coaches and zero judgement.',
    list=[('Off-peak', '£29/mo'), ('Unlimited', '£39/mo'), ('Personal training', 'From £35')]))
add('gloss', 'word', 'Car detailing', ('Showroom shine.', 'Showroom website.'), dict(
    name='GLOSS', fonts='family=Bebas+Neue&family=Sora:wght@500;700;800', disp='Bebas Neue', body='Sora',
    bg='#380F78', word_c='#E4D7FF', txt='#fff', word='GLOSS', wsize='34vw', wls='.02em', wtop='38%', sh='62%', cut='car', detail='car2',
    btn='#fff', btnink='#380F78', em='#7B3FF2', links=['Detailing', 'Ceramic coating', 'PPF', 'Gallery'], navr='Book',
    drop='Ceramic<br>from<br>£449', meta='Mobile and studio<br>Greater Manchester', price='Valets from £60', cta='Book a detail', tick='Ceramic coating · Paint correction · PPF · Valets',
    h2='Paint like<br>a <em>mirror.</em>', p='Studio-grade detailing, ceramic coatings and paint protection for cars that deserve better.',
    list=[('Maintenance valet', '£60'), ('Enhancement detail', '£249'), ('Ceramic coating', '£449')]))
add('inkwell', 'word', 'Tattoo studio', ('Art people', 'wear forever.'), dict(
    name='INKWELL', fonts='family=Archivo+Black&family=Space+Grotesk:wght@500;700', disp='Archivo Black', body='Space Grotesk',
    bg='#0F46C3', word_c='#E2342B', txt='#fff', word='INK', wsize='42vw', wls='-.04em', wtop='44%', sh='94%', cut='tattoo', detail='tattoo2',
    btn='#fff', btnink='#0F46C3', em='#E2342B', links=['Artists', 'Flash', 'Aftercare', 'FAQ'], navr='Book',
    drop='Flash<br>day<br>Sat', meta='Fine-line and blackwork<br>Northern Quarter', price='Deposits from £50', cta='Request a booking', tick='Fine-line · Blackwork · Botanical · Flash',
    h2='Fine lines,<br><em>forever.</em>', p='Custom fine-line and botanical tattoos by award-winning artists in a clean, calm studio.',
    list=[('Small flash', 'From £80'), ('Half day', '£350'), ('Full day', '£650')]))

TPL = {'order': tpl_order, 'quote': tpl_quote, 'story': tpl_story, 'word': tpl_word}
if __name__ == '__main__':
    meta = []
    for slug, tpl, industry, caption, c in SITES:
        open(os.path.join(OUT, slug + '.html'), 'w').write(TPL[tpl](c))
        meta.append(dict(slug=slug, tpl=tpl, name=c['name'], industry=industry, caption=caption))
    json.dump(meta, open(os.path.join(OUT, 'showcase.json'), 'w'), indent=1)
    print(len(meta), 'sites')
