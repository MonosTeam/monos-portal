import re,os
D=os.path.dirname(os.path.abspath(__file__));OUT=os.path.dirname(D)
s=open(D+'/base.html').read()
js=open(D+'/site.js').read();css=open(D+'/extra.css').read()
def cut(a,b):
    i=s.index(a);j=s.index(b,i);return s[i:j]
head=s[:s.index('<body>')]
svgdefs=cut('<svg width="0" height="0"','<header class="nav"')
F={}
marks=['<!-- HERO -->','<!-- LOGOS -->','<!-- WORK -->','<!-- RESULTS -->','<!-- SERVICES -->','<!-- PROCESS -->','<!-- AWARDS -->','<!-- QUOTE BUILDER -->','<!-- FOUNDER -->','<!-- FAQ -->','<!-- CONTACT -->','<section class="final">','</main>']
names=['hero','logos','work','results','services','process','awardsband','quote','founder','faq','contact','final']
for n,a,b in zip(names,marks,marks[1:]):F[n]=cut(a,b)
footer=cut('<footer>','<script>\n(function')

# ---- services: 9 equal cards
F['services']=F['services'].replace('<div class="sv feature rv">','<div class="sv rv">')
F['services']=F['services'].replace('''        <div class="pr">Hosting £25 · Care £100 per month</div>
      </div>''','''        <div class="pr">Hosting £25 · Care £100 per month</div>
      </div>
      <div class="sv rv d1">
        <div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/></svg></div>
        <h3>Video &amp; design</h3>
        <p>Promo films, video editing, teaser trailers, posters and flyers for your launch.</p>
        <div class="pr">Editing from £180 · Design from £28</div>
      </div>''')

# ---- real awards
AW=[('islam-channel-2025','Winner','Start-Up Business of the Year','Islam Channel Business Awards 2025',1),
    ('festival-friend-2025','Winner','Festival Friend Appreciation Award','Winner',1),
    ('womens-awards-2026','Finalist','Outstanding Female Entrepreneur','Women\'s Awards National 2026',0),
    ('mbcc-2026','Finalist','Entrepreneur of the Year','MBCC Awards 2026',1),
    ('bpa-2026','Finalist','Empowering Women Awards','BPA Empowering Women Awards 2026',1)]
TROPHY='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h10v2h3v3a4 4 0 01-4 4h-.3A5 5 0 0113 14.9V17h3v2H8v-2h3v-2.1A5 5 0 018.3 12H8a4 4 0 01-4-4V5h3zm0 4H6v1a2 2 0 001 1.7zm10 0v2.7A2 2 0 0018 8V7z"/><rect x="7" y="20" width="10" height="2" rx="1"/></svg>'
GOLDT='''<svg class="tro" viewBox="0 0 24 24"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e27a"/><stop offset=".5" stop-color="#d4a548"/><stop offset="1" stop-color="#fff2b8"/></linearGradient></defs><path fill="url(#gg)" d="M7 3h10v2h3v3a4 4 0 01-4 4h-.3A5 5 0 0113 14.9V17h3v2H8v-2h3v-2.1A5 5 0 018.3 12H8a4 4 0 01-4-4V5h3zm0 4H6v1a2 2 0 001 1.7zm10 0v2.7A2 2 0 0018 8V7z"/><rect fill="url(#gg)" x="7" y="20" width="10" height="2" rx="1"/></svg>'''
def awcard(a):
    f,k,t,o,cov=a
    return ('<div class="aw"><div class="pic"><img src="img/awards/%s.jpg" alt="%s, %s" loading="lazy"%s><span class="rib%s">%s%s</span></div><div class="cap"><b>%s</b><span>%s</span></div></div>'
            %(f,t,o,' class="cov"' if cov and f in('islam-channel-2025','festival-friend-2025') else '',' fin' if k=='Finalist' else '',TROPHY,'WINNER' if k=='Winner' else 'TO BE ANNOUNCED',t,o))
montage='''<!-- AWARDS MONTAGE -->
<section class="amont" aria-label="Awards">
  <div class="wrap"><div class="ahead">%s<h2><span class="gold">Multi-award winning</span></h2>%s</div></div>
  <div class="amq"><div class="atrack" id="atrack">%s</div></div>
  <div class="wrap"><div class="trow"><span class="tpill">%s<span class="gold">2× Winner 2025</span></span><span class="tpill">%s<span class="gold">3× 2026 · To be announced</span></span></div></div>
</section>
'''%(GOLDT,GOLDT,''.join(awcard(a) for a in AW),GOLDT,GOLDT)
F['awardsband']='''<!-- AWARDS -->
<section class="sec" id="awards" style="padding-top:0">
  <div class="wrap">
    <div class="band rv">
      <span class="eyebrow"><span class="dot"></span>Recognised by the industry</span>
      <h2 class="h2" style="margin-top:26px">Multi-award<br><span class="r">winning.</span></h2>
      <p class="lead" style="margin:22px auto 0">Two wins in 2025, with three more 2026 awards to be announced. The same team behind work for the BBC, Sky TV and Samsung builds your website.</p>
      <div class="agrid">%s</div>
    </div>
  </div>
</section>
'''%''.join(awcard(a) for a in AW)

# ---- Akon photo in results
F['results']=F['results'].replace('<div class="results">','''<figure class="akonf rv"><img src="img/sofia-akon.jpg" alt="Sofia Patisserie founder with Akon, holding a Sofia Patisserie cup" loading="lazy"><figcaption><span>CATERED FOR</span><div>Global icon <b>Akon</b>, by Sofia Patisserie, Manchester</div></figcaption></figure>
    <div class="results">''',1)

# ---- new hero
W=['stackd.jpg','fold.jpg','zepha.jpg','brightwell.jpg']
V=['stackd','fold','aura','zepha','brightwell']
cols=[]
plan=[['w0','v0','w2','a0'],['v1','w1','v3','w3'],['w2','a1','v2','w0'],['v4','w3','w1','v0'],['w1','v2','a2','w2'],['v3','w0','v4','w3']]
def tile(t,i):
    k,n=t[0],int(t[1])
    if k=='w':return '<div class="t w"><img src="work2/%s" alt="" loading="%s"></div>'%(W[n],'eager' if i<2 else 'lazy')
    if k=='a':return '<div class="t v"><img src="work2/aura%d.png" alt="" loading="lazy"></div>'%(n+1)
    if i<2:return '<div class="t v"><video src="work2/%s-reel.mp4" poster="work2/%s-reel.jpg" muted loop playsinline autoplay preload="metadata"></video></div>'%(V[n],V[n])
    return '<div class="t v"><img src="work2/%s-reel.jpg" alt="" loading="lazy"></div>'%V[n]
for c in plan:
    ts=''.join(tile(t,i) for i,t in enumerate(c))
    cols.append('<div class="col">'+ts+ts+'</div>')
F['hero']='''<!-- HERO -->
<section class="ohero" id="ohero">
  <div class="wall" id="wall" aria-hidden="true">%s</div>
  <div class="veil"></div><div class="scan"></div>
  <span class="corner a"></span><span class="corner b"></span><span class="corner c"></span><span class="corner d"></span>
  <div class="hud tl"><span class="rec"><i></i>REC</span><span id="tc">00:00:00:00</span></div>
  <div class="hud tr">MCR <b>●</b> LIVE</div>
  <div class="hud bl">CAM 01 · 4K · 25FPS</div>
  <div class="hud br">MULTI-AWARD WINNING</div>
  <div class="wrap ocenter">
    <div class="onair" aria-label="On air"><i></i>ON AIR</div>
    <h1 class="h-display">
      <span class="mask"><span>Your brand.</span></span>
      <span class="mask"><span class="r">On air.</span></span>
    </h1>
    <p class="lead rv d2">Websites, apps, content and social media for businesses that want to look established from day one. Multi-award winning, Manchester made, trusted by household names.</p>
    <div class="ctas rv d3">
      <a href="pricing.html" class="btn btn-red">Build your quote <svg><use href="#arrow"/></svg></a>
      <a href="work.html" class="btn btn-ghost">See our work</a>
    </div>
  </div>
  <div class="lower"><div><span class="lr">MONOS TECHNOLOGY</span><span class="lw">Websites · Apps · Content · Social</span></div></div>
</section>
'''%''.join(cols)

# ---- home work: cards only
w=F['work']
i=w.index('<div class="apps rv">');j=w.index('<p class="disclaim">')
F['work_home']=w[:i]+'<div class="more"><a href="work.html" class="btn btn-ghost">See all work, apps and films <svg><use href="#arrow"/></svg></a></div>\n    '+w[j:]

# ---- wording
F['results']=F['results'].replace('<section class="sec" style="padding-top:0">','<section class="sec">',1)
for k in ('work','work_home'):F[k]=F[k].replace(' Business names and products are fictional.','')
for k in F:
    F[k]=F[k].replace('Multi-award winning agency, 2024 and 2025, finalist three times in 2026','Multi-award winning agency, with three more 2026 awards to be announced')
footer=footer.replace('Winner 2024 and 2025, finalist × 3 2026.','Award winner 2024 and 2025, with three 2026 awards to be announced.')

# ---- brands
F['logos']=F['logos'].replace('<span class="lg uom">The University<br>of Manchester</span>','''<span class="lg uom">The University<br>of Manchester</span>
      <span class="lg po">P&amp;O <small>Cruises</small></span>
      <span class="lg vw">Vivienne Westwood</span>
      <span class="lg lloyds">Lloyds TSB</span>
      <span class="lg bobbi">bobbi brown</span>
      <span class="lg astra">ASTRA <small>International</small></span>
      <span class="lg aja">Asian Jewel <small>Awards</small></span>
      <span class="lg afm">ASIAN FASHION<small>MAGAZINE</small></span>''')

# ---- work with us CTA
WWU='''<!-- WORK WITH US -->
<section class="wwu">
  <div class="wwu-mq" aria-hidden="true"><div><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span><span>WORK WITH US NOW ●&nbsp;</span></div></div>
  <div class="wrap wwu-in">
    <div><h2 class="h-display rv">Work with<br>us <span>now.</span></h2>
    <p class="rv d1">Places each month are limited so every client gets Aisha's full attention. Tell us about your business today and we'll reply within one working day.</p></div>
    <div class="wwu-b rv d2"><a href="contact.html" class="btn btn-white">Start your project <svg><use href="#arrow"/></svg></a><button type="button" class="btn btn-outline-w" data-spin>Spin to win a prize</button></div>
  </div>
</section>
'''
F['wwu']=WWU
GIFT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 010-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 010 5"/></svg>'
POP='''<button type="button" class="spin-fab" data-spin aria-label="Spin to win">%s<span>Spin to win</span></button>
<div class="spin" id="spin" role="dialog" aria-modal="true" aria-labelledby="spinT" hidden>
  <div class="sp-bg" data-close></div>
  <div class="sp-card">
    <button type="button" class="sp-x" data-close aria-label="Close">&times;</button>
    <div class="sp-left"><div class="sp-wheel"><span class="ptr"></span><svg id="wheel" viewBox="-110 -110 220 220"></svg><span class="hub">M<i></i></span></div></div>
    <div class="sp-right">
      <span class="eyebrow"><span class="dot"></span>MONOS Spin &amp; Win</span>
      <h3 id="spinT">Spin to win.<br><span class="r">Every spin wins.</span></h3>
      <p class="sp-sub">Every entry also goes into our draw for a <b>free website worth £3,500</b>.</p>
      <form name="spin-to-win" method="POST" data-netlify="true" netlify-honeypot="bot-field" id="spinForm">
        <input type="hidden" name="form-name" value="spin-to-win">
        <p class="hp"><label>Leave this empty <input name="bot-field"></label></p>
        <input type="hidden" name="prize" id="spPrize"><input type="hidden" name="code" id="spCode"><input type="hidden" name="page" id="spPage">
        <div class="sp-row"><div class="field"><label for="spN">First name</label><input id="spN" name="name" required autocomplete="given-name"></div>
        <div class="field"><label for="spE">Email</label><input id="spE" name="email" type="email" required autocomplete="email"></div></div>
        <div class="sp-row"><div class="field"><label for="spB">Business name</label><input id="spB" name="business" required autocomplete="organization"></div>
        <div class="field"><label for="spI">Industry</label><select id="spI" name="industry" required><option value="">Choose one</option><option>Food and drink</option><option>Beauty and wellness</option><option>Fashion and retail</option><option>Trades and home services</option><option>Health and fitness</option><option>Professional services</option><option>Events and entertainment</option><option>Property</option><option>Other</option></select></div></div>
        <div class="sp-row"><div class="field"><label for="spW">Do you have a website?</label><select id="spW" name="has_website" required><option value="">Choose one</option><option>No, not yet</option><option>Yes, but it needs a refresh</option><option>Yes, and I'm happy with it</option></select></div>
        <div class="field"><label for="spP">Phone <small>(optional)</small></label><input id="spP" name="phone" type="tel" autocomplete="tel"></div></div>
        <label class="sp-ok"><input type="checkbox" name="marketing_consent" value="yes" required><span>Yes, email me MONOS offers, tips and news. Unsubscribe any time.</span></label>
        <button class="btn btn-red" type="submit">Spin the wheel <svg><use href="#arrow"/></svg></button>
        <p class="fine">One spin per person. Prizes for new clients. See our <a href="terms.html#spin">Spin &amp; Win terms</a> and <a href="privacy.html">Privacy policy</a>.</p>
      </form>
      <div class="sp-res" id="spRes" aria-live="polite"></div>
    </div>
  </div>
</div>
'''%GIFT

# ---- link mapping
MAP={'#work':'work.html','#services':'services.html','#process':'services.html#process','#quote':'pricing.html','#aisha':'about.html','#faq':'contact.html#faq','#contact':'contact.html','#top':'index.html'}
def links(h):
    for k,v in MAP.items():h=h.replace('href="%s"'%k,'href="%s"'%v)
    return h.replace('href="/terms"','href="terms.html"').replace('href="/privacy"','href="privacy.html"')


# ---- INDUSTRY SHOWCASES (16 concepts from showcase.py)
import json as _json
_SC=_json.load(open(os.path.join(OUT,'concepts','showcase.json'))) if os.path.exists(os.path.join(OUT,'concepts','showcase.json')) else []
_cards=''.join('<a class="ind rv" href="concepts/%(slug)s.html"><div class="iv"><video data-src="work2/%(slug)s-reel.mp4" poster="work2/%(slug)s-reel.jpg" muted loop playsinline preload="none" aria-label="%(name)s concept website reel"></video><button class="snd" type="button" aria-label="Sound on">&#128263;</button></div><div class="im"><span>%(industry)s</span><b>%(name)s</b><i>View concept &rarr;</i></div></a>'%m for m in _SC)
F['industries']=('<section class="sec inds" id="industries"><div class="wrap"><div class="sec-head"><h2 class="h2 rv">A website for<br><span class="r">every industry.</span></h2>'
 '<p class="lead rv d1">Sixteen concept designs, one for each kind of business we build for. Tap any reel to see the full site in motion, sound on.</p></div>'
 '<div class="ind-grid">'+_cards+'</div><p class="ind-note">Concept designs by MONOS. Want one for your business? <a href="pricing.html">Build your quote</a>.</p></div></section>')
PAGES=[('index.html','MONOS Technology | Multi-award winning web design agency, Manchester',None,['hero','AWM','logos','work_home','wwu','results','final']),
 ('work.html','Our work | MONOS Technology','Work',['work','industries','wwu']),
 ('services.html','Services | MONOS Technology','Services',['services','process','wwu','awardsband']),
 ('pricing.html','Pricing and quote builder | MONOS Technology','Pricing',['quote','contact','faq']),
 ('about.html','About Aisha Ansari | MONOS Technology','About',['founder','awardsband','results','wwu']),
 ('contact.html','Contact | MONOS Technology','Contact',['contact','faq'])]
NAV=[('work.html','Work'),('services.html','Services'),('pricing.html','Pricing'),('about.html','About'),('contact.html','Contact')]
def nav(cur):
    lis=''.join('<li><a href="%s"%s>%s</a></li>'%(h,' class="cur" aria-current="page"' if t==cur else '',t) for h,t in NAV)
    mob=''.join('<a href="%s">%s</a>'%(h,t) for h,t in NAV)
    return '''<header class="nav" id="nav">
  <div class="wrap">
    <a href="index.html" class="logo" aria-label="MONOS home">MONOS<i></i></a>
    <ul>%s</ul>
    <div class="act">
      <a href="contact.html" class="btn btn-ghost">Work with us now</a>
      <a href="pricing.html" class="btn btn-red">Build your quote</a>
      <button class="burger" id="burger" aria-label="Open menu"><span></span><span></span></button>
    </div>
  </div>
</header>
<nav class="mob" id="mob"><a href="index.html">Home</a>%s<a href="pricing.html" class="btn btn-red">Build your quote</a></nav>
'''%(lis,mob)
foot=links(footer).replace('<li><a href="work.html">Work</a></li><li><a href="services.html">Services</a></li><li><a href="pricing.html">Pricing</a></li><li><a href="contact.html#faq">FAQ</a></li>',
 '<li><a href="work.html">Work</a></li><li><a href="services.html">Services</a></li><li><a href="pricing.html">Pricing</a></li><li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li>')
headx=head.replace('</style>',css+'\n</style>')
for fn,title,cur,secs in PAGES:
    h=re.sub(r'<title>.*?</title>','<title>%s</title>'%title,headx)
    slug='' if fn=='index.html' else fn[:-5]
    h=h.replace('<link rel="canonical" href="https://monostechnology.co.uk/">','<link rel="canonical" href="https://monostechnology.co.uk/%s">'%slug)
    h=h.replace('<meta property="og:url" content="https://monostechnology.co.uk/">','<meta property="og:url" content="https://monostechnology.co.uk/%s">'%slug)
    body=''
    for n in secs:
        body+= montage if n=='AWM' else links(F[n])
    if fn=='pricing.html':
        body=body.replace('href="contact.html" class="btn btn-red" id="sendQuote"','href="#contact" class="btn btn-red" id="sendQuote"')
    if fn=='contact.html':body=body.replace('id="faq">','id="faq" style="padding-top:20px">')
    main='<main id="top"%s>\n%s</main>\n'%('' if fn=='index.html' else ' class="inner"',body)
    page=h+'<body>\n'+svgdefs+nav(cur)+'\n'+main+'\n'+foot+POP+'<script>\n'+js+'</script>\n</body>\n</html>\n'
    if fn!='index.html':page=page.replace('<script type="application/ld+json">','<script type="application/ld+json" data-x>',1)
    open(os.path.join(OUT,fn),'w').write(page)
    print(fn,len(page))
