"""Post-build SEO pass for monostechnology.co.uk.

Run after build.py:  python3 _src/build.py && python3 _src/seo.py
- Rewrites titles, meta descriptions, Open Graph/Twitter tags and JSON-LD on every page
- Gives every inner page a real <h1> and renders the FAQ as crawlable HTML
- Builds the guide pages in seo_content.py from the contact.html shell
- Writes sitemap.xml, robots.txt and llms.txt
Idempotent: safe to run again on already-processed pages.
"""
import re, os, json, html, datetime, sys
D = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.dirname(D)
sys.path.insert(0, D)
from seo_content import GUIDES, PAGES, HOME_BLOCK

SITE = 'https://monostechnology.co.uk'
TODAY = datetime.date.today().isoformat()
OG_IMG = SITE + '/work2/stackd.jpg'

ORG = {
  "@type": ["Organization", "ProfessionalService"], "@id": SITE + "/#org",
  "name": "MONOS Technology", "alternateName": "MONOS", "legalName": "YVMC.AI LTD",
  "url": SITE + "/", "email": "info@monos.ai", "image": OG_IMG,
  "logo": SITE + "/img/monos-logo.png",
  "description": "Multi-award winning web design agency in Manchester for websites, apps, content and social media.",
  "slogan": "Your brand. On air.", "priceRange": "££",
  "areaServed": [{"@type": "City", "name": "Manchester"},
                 {"@type": "AdministrativeArea", "name": "Greater Manchester"},
                 {"@type": "Country", "name": "United Kingdom"}],
  "founder": {"@type": "Person", "@id": SITE + "/about#aisha", "name": "Aisha Ansari",
              "jobTitle": "Founder & CEO", "url": "https://www.aishaansari.co.uk",
              "sameAs": ["https://www.aishaansari.co.uk"]},
  "award": ["Start-Up Business of the Year, Islam Channel Business Awards 2025",
            "Festival Friend Appreciation Award 2025"],
  "knowsAbout": ["Web design", "Website development", "Small business websites", "E-commerce",
                 "Mobile apps", "Search engine optimisation", "Social media", "Video content", "Branding"],
  "identifier": {"@type": "PropertyValue", "propertyID": "Companies House", "value": "15066388"},
  "sameAs": ["https://www.aishaansari.co.uk",
             "https://find-and-update.company-information.service.gov.uk/company/15066388"],
  "hasOfferCatalog": {"@type": "OfferCatalog", "name": "MONOS services", "itemListElement": [
    {"@type": "Offer", "price": "3500", "priceCurrency": "GBP",
     "itemOffered": {"@type": "Service", "name": "Standard website (up to 5 pages)", "serviceType": "Web design"}},
    {"@type": "Offer", "price": "7000", "priceCurrency": "GBP",
     "priceSpecification": {"@type": "PriceSpecification", "minPrice": "7000", "priceCurrency": "GBP"},
     "itemOffered": {"@type": "Service", "name": "E-commerce website", "serviceType": "E-commerce web design"}},
    {"@type": "Offer", "price": "280", "priceCurrency": "GBP",
     "itemOffered": {"@type": "Service", "name": "Logo design"}},
    {"@type": "Offer", "price": "25", "priceCurrency": "GBP",
     "itemOffered": {"@type": "Service", "name": "Website hosting (monthly)"}},
    {"@type": "Offer", "price": "100", "priceCurrency": "GBP",
     "itemOffered": {"@type": "Service", "name": "Website maintenance (monthly)"}}]}
}
WEBSITE = {"@type": "WebSite", "@id": SITE + "/#site", "url": SITE + "/", "name": "MONOS Technology",
           "inLanguage": "en-GB", "publisher": {"@id": SITE + "/#org"}}

def pretty(fn): return SITE + '/' + ('' if fn == 'index.html' else fn[:-5])
def esc(t): return html.escape(html.unescape(t), quote=True)
def strip(t): return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', t))).strip()

def faq_from_js():
    js = open(D + '/site.js').read()
    blk = js[js.index('var F=['):js.index('];', js.index('var F=['))]
    return [(html.unescape(a.replace("\\'", "'")), html.unescape(b.replace("\\'", "'")))
            for a, b in re.findall(r"\['((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\]", blk)]

def faq_html(F):
    return ''.join('<div class="fq rv%s"><button type="button" aria-expanded="%s">%s<i></i></button>'
                   '<div class="a"><div><p>%s</p></div></div></div>'
                   % (' open' if i == 0 else '', 'true' if i == 0 else 'false', esc(q), esc(a))
                   for i, (q, a) in enumerate(F))

def faq_ld(F, url):
    return {"@type": "FAQPage", "@id": url + "#faq", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in F]}

def crumbs(url, label, mid=None):
    items = [("Home", SITE + "/")] + ([mid] if mid else []) + [(label, url)]
    return {"@type": "BreadcrumbList", "@id": url + "#crumbs", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]}

def set_head(page, fn, title, desc, graph, robots='index,follow,max-image-preview:large'):
    url = pretty(fn)
    if title: page = re.sub(r'<title>.*?</title>', '<title>%s</title>' % title, page, count=1, flags=re.S)
    title = title or re.search(r'<title>(.*?)</title>', page, re.S).group(1)
    desc = desc or (re.search(r'<meta name="description" content="(.*?)">', page) or [None, ''])[1]
    # drop tags we own, then re-add them in one block
    page = re.sub(r'<meta (?:name|property)="(?:description|robots|og:[a-z_:]+|twitter:[a-z]+)" content="[^"]*">\n?', '', page)
    page = re.sub(r'<link rel="canonical" href="[^"]*">\n?', '', page)
    page = re.sub(r'<script type="application/ld\+json"[^>]*>.*?</script>\n?', '', page, flags=re.S)
    page = re.sub(r'<!-- seo -->.*?<!-- /seo -->\n?', '', page, flags=re.S)
    tags = ['<meta name="description" content="%s">' % esc(desc),
            '<meta name="robots" content="%s">' % robots,
            '<link rel="canonical" href="%s">' % url,
            '<meta property="og:site_name" content="MONOS Technology">',
            '<meta property="og:locale" content="en_GB">',
            '<meta property="og:type" content="%s">' % ('website' if fn == 'index.html' else 'article' if fn in GSLUGS else 'website'),
            '<meta property="og:title" content="%s">' % esc(title.split(' | ')[0] if fn != 'index.html' else 'MONOS Technology | Your brand. On air.'),
            '<meta property="og:description" content="%s">' % esc(desc),
            '<meta property="og:url" content="%s">' % url,
            '<meta property="og:image" content="%s">' % OG_IMG,
            '<meta property="og:image:alt" content="A website designed by MONOS Technology">',
            '<meta name="twitter:card" content="summary_large_image">',
            '<script type="application/ld+json">%s</script>' % json.dumps(
                {"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, separators=(',', ':'))]
    return page.replace('</title>', '</title>\n<!-- seo -->\n' + '\n'.join(tags) + '\n<!-- /seo -->', 1)

def webpage(fn, title, desc, extra=None):
    url = pretty(fn)
    d = {"@type": "WebPage", "@id": url + "#page", "url": url, "name": strip(title), "description": strip(desc or ''),
         "isPartOf": {"@id": SITE + "/#site"}, "about": {"@id": SITE + "/#org"}, "inLanguage": "en-GB"}
    if extra: d.update(extra)
    return d

def promote_h1(page):
    """Inner pages: turn the first <h2> in <main> into the page's <h1> (same classes, same look)."""
    if re.search(r'<main[^>]*>.*?<h1', page, re.S): return page
    i = page.index('<main'); m = re.compile(r'<h2(\b[^>]*)>(.*?)</h2>', re.S).search(page, i)
    return page[:m.start()] + '<h1%s>%s</h1>' % (m.group(1), m.group(2)) + page[m.end():]

GUIDE_CSS = '''<style id="seo-css">
.sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.crumbs{font-size:13px;color:var(--muted);margin-bottom:26px}.crumbs a:hover{color:#fff}.crumbs span{margin:0 8px;opacity:.5}
.guide-hero{padding:80px 0 30px}.guide-hero .wrap{max-width:828px}.guide-hero .lead{margin-top:24px;max-width:760px}
.guide{max-width:780px;margin:0 auto;padding:40px 24px 40px;font-size:18px;line-height:1.7;color:var(--soft)}
.guide h2{font-family:var(--display);font-weight:400;text-transform:uppercase;font-size:clamp(30px,4vw,46px);line-height:1;color:#fff;margin:64px 0 20px}
.guide h2:first-child{margin-top:0}.guide p{margin:0 0 18px}.guide b{color:#fff}
.guide a{color:#fff;text-decoration:underline;text-decoration-color:var(--red);text-underline-offset:3px}
.guide ul,.guide ol{margin:0 0 22px;padding-left:22px}.guide li{margin:0 0 10px}.guide li::marker{color:var(--red)}
.gt{overflow-x:auto;border:1px solid var(--line2);border-radius:18px;margin:8px 0 10px}
.gt table{width:100%;border-collapse:collapse;font-size:16px;min-width:540px}
.gt th,.gt td{text-align:left;padding:14px 18px;border-bottom:1px solid var(--line);vertical-align:top}
.gt th{color:#fff;background:var(--card);font-weight:700}.gt tr:last-child td{border-bottom:0}
.note{font-size:14px;color:var(--muted)}
.gcta{margin:56px 0 0;padding:34px;border-radius:24px;background:var(--card);border:1px solid var(--line2)}
.gcta h3{font-family:var(--display);font-weight:400;text-transform:uppercase;font-size:34px;color:#fff;margin-bottom:10px}
.gcta .row{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}.gcta a.btn{text-decoration:none}
.grel{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:18px}
.grel a{display:block;padding:20px;border-radius:18px;background:var(--card);border:1px solid var(--line);text-decoration:none;color:#fff;font-weight:700}
.grel a:hover{border-color:var(--red)}
.updated{font-size:13px;color:var(--muted);margin-top:18px;letter-spacing:.04em}
.seo-intro{border-top:1px solid var(--line)}
.si-grid{display:grid;grid-template-columns:1fr 1.1fr;gap:60px;align-items:start}
.si-grid p{color:var(--soft);font-size:18px;margin-bottom:16px}
.si-links{list-style:none;display:grid;gap:10px;margin-top:22px}
.si-links a{display:flex;justify-content:space-between;padding:16px 20px;border-radius:16px;background:var(--card);border:1px solid var(--line);font-weight:700}
.si-links a:after{content:"\\2192";color:var(--red)}.si-links a:hover{border-color:var(--red)}
@media(max-width:860px){.si-grid{grid-template-columns:1fr;gap:28px}.guide{font-size:17px}}
</style>'''

GSLUGS = {g['slug'] + '.html' for g in GUIDES}
GUIDE_FOOT = '<div><h5>Guides</h5><ul>' + ''.join(
    '<li><a href="%s.html">%s</a></li>' % (g['slug'], g['crumb']) for g in GUIDES) + '</ul></div>'

def common(page):
    page = re.sub(r'<style id="seo-css">.*?</style>\n?', '', page, flags=re.S)
    page = page.replace('</head>', GUIDE_CSS + '\n</head>', 1)
    page = re.sub(r'<div><h5>Guides</h5>.*?</ul></div>', '', page, flags=re.S)
    page = page.replace('<div><h5>Legal</h5>', GUIDE_FOOT + '\n        <div><h5>Legal</h5>', 1)
    # descriptive alt text on the hero wall images (decorative alt="" is fine, but named work helps image search)
    return page

NOINDEX = {'book-aisha-clients.html', 'book-aisha-confirmed.html'}
F = faq_from_js()
done = []
for fn, (title, desc, label) in PAGES.items():
    p = os.path.join(OUT, fn)
    if not os.path.exists(p): continue
    page = common(open(p).read())
    url = pretty(fn)
    t = title or re.search(r'<title>(.*?)</title>', page, re.S).group(1)
    graph = [ORG, WEBSITE]
    if fn == 'index.html':
        graph.append(webpage(fn, t, desc))
        if 'class="sr">' not in page:
            page = page.replace('<h1 class="h-display">', '<h1 class="h-display"><span class="sr">MONOS Technology, multi-award winning web design agency in Manchester. </span>', 1)
        page = re.sub(r'<!-- SEO INTRO -->.*?</section>\n', '', page, flags=re.S)
        page = page.replace('<section class="final">', HOME_BLOCK + '\n<section class="final">', 1)
    else:
        page = promote_h1(page)
        extra = {"@type": "AboutPage"} if fn == 'about.html' else {"@type": "ContactPage"} if fn == 'contact.html' else None
        graph += [webpage(fn, t, desc, extra), crumbs(url, label)]
        if fn in ('terms.html', 'privacy.html'): graph = [ORG, WEBSITE, crumbs(url, label)]
    if 'id="faqList"' in page:
        page = re.sub(r'<div class="faq" id="faqList">.*?</div>\n', '<div class="faq" id="faqList">%s</div>\n' % faq_html(F), page, count=1, flags=re.S) \
            if re.search(r'<div class="faq" id="faqList"></div>', page) is None else \
            page.replace('<div class="faq" id="faqList"></div>', '<div class="faq" id="faqList">%s</div>' % faq_html(F), 1)
        if fn == 'contact.html': graph.append(faq_ld(F, url))
    if fn in NOINDEX:
        page = set_head(page, fn, title, desc, graph, robots='noindex,follow')
        open(p, 'w').write(page); continue
    page = set_head(page, fn, title, desc, graph)
    open(p, 'w').write(page); done.append(fn)

# ---- guide pages, built from the contact.html shell
shell = open(os.path.join(OUT, 'contact.html')).read()
head_end = shell.index('<main'); main_end = shell.index('</main>') + len('</main>')
for g in GUIDES:
    fn = g['slug'] + '.html'; url = pretty(fn)
    rel = ''.join('<a href="%s.html">%s</a>' % (r, next(x['crumb'] for x in GUIDES if x['slug'] == r)) for r in g['related'])
    faq = faq_html(g['faq'])
    main = '''<main id="top" class="inner">
<section class="guide-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span>%s</nav>
    <span class="eyebrow rv"><span class="dot"></span>%s</span>
    <h1 class="h2 rv d1" style="margin-top:22px">%s</h1>
    <p class="lead rv d2">%s</p>
    <p class="updated">Updated %s · By Aisha Ansari, founder of MONOS Technology</p>
  </div>
</section>
<article class="guide">
%s
<div class="gcta">
  <h3>Ready to get <span style="color:var(--red)">on air?</span></h3>
  <p>Tell us about your business and we reply within one working day with next steps and a clear proposal.</p>
  <div class="row"><a href="pricing.html" class="btn btn-red">Build your quote <svg><use href="#arrow"/></svg></a><a href="contact.html" class="btn btn-ghost">Talk to us</a></div>
</div>
</article>
<section class="sec" id="faq" style="padding-top:60px">
  <div class="wrap">
    <div class="sec-head" style="justify-content:center;text-align:center"><h2 class="h2 rv">Good to<br><span class="r">know.</span></h2></div>
    <div class="faq" id="gfaq">%s</div>
    <div style="max-width:780px;margin:70px auto 0"><h2 class="h2" style="font-size:34px">Keep reading</h2><div class="grel">%s</div></div>
  </div>
</section>
</main>''' % (esc(g['crumb']), g['eyebrow'], g['h1'], g['lead'], datetime.date.today().strftime('%B %Y'),
              g['body'].strip(), faq, rel)
    page = shell[:head_end] + main + shell[main_end:]
    page = re.sub(r'<a href="([a-z]+)\.html" class="cur" aria-current="page">', r'<a href="\1.html">', page)
    art = {"@type": "Article", "@id": url + "#article", "headline": strip(g['h1']) if len(strip(g['h1'])) > 25 else g['title'].split(' | ')[0],
           "description": g['desc'], "inLanguage": "en-GB", "datePublished": "2026-11-03", "dateModified": TODAY,
           "author": {"@id": SITE + "/about#aisha"}, "publisher": {"@id": SITE + "/#org"},
           "mainEntityOfPage": {"@id": url + "#page"}, "image": OG_IMG}
    svc = {"@type": "Service", "@id": url + "#service", "name": "Web design in Manchester", "serviceType": "Web design",
           "provider": {"@id": SITE + "/#org"}, "areaServed": ORG["areaServed"],
           "offers": {"@type": "Offer", "price": "3500", "priceCurrency": "GBP", "description": "Standard website, up to 5 custom pages"}}
    graph = [ORG, WEBSITE, webpage(fn, g['title'], g['desc']), crumbs(url, g['crumb']), faq_ld(g['faq'], url),
             svc if g['slug'] == 'web-design-manchester' else art]
    page = set_head(page, fn, g['title'], g['desc'], graph)
    open(os.path.join(OUT, fn), 'w').write(page); done.append(fn)

# guide FAQ toggles: site.js only binds .fq inside #faqList on some pages, so bind here too
TOG = '<script>document.querySelectorAll("#gfaq .fq").forEach(function(q){q.classList.add("in");q.querySelector("button").onclick=function(){var o=q.classList.toggle("open");this.setAttribute("aria-expanded",o)}})</script>'
for g in GUIDES:
    p = os.path.join(OUT, g['slug'] + '.html'); s = open(p).read()
    if TOG not in s: open(p, 'w').write(s.replace('</body>', TOG + '\n</body>', 1))

# ---- sitemap, robots, llms
PRI = {'index.html': '1.0', 'pricing.html': '0.9', 'services.html': '0.9', 'web-design-manchester.html': '0.9'}
urls = [f for f in done if f not in ('terms.html', 'privacy.html')] + [f for f in done if f in ('terms.html', 'privacy.html')]
extra_dirs = [os.path.join('concepts', f) for f in sorted(os.listdir(os.path.join(OUT, 'concepts')))
              if f.endswith('.html')] if os.path.isdir(os.path.join(OUT, 'concepts')) else []
sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for f in urls + extra_dirs:
    sm.append('  <url><loc>%s</loc><lastmod>%s</lastmod><priority>%s</priority></url>'
              % (pretty(f), TODAY, PRI.get(f, '0.3' if f in ('terms.html', 'privacy.html') else '0.5' if f.startswith('concepts/') else '0.8')))
sm.append('</urlset>')
open(os.path.join(OUT, 'sitemap.xml'), 'w').write('\n'.join(sm) + '\n')
open(os.path.join(OUT, 'robots.txt'), 'w').write('User-agent: *\nAllow: /\nDisallow: /concepts-source.html\n\nSitemap: %s/sitemap.xml\n' % SITE)

llms = ['# MONOS Technology', '',
 '> Multi-award winning web design agency in Manchester, UK. Custom websites, apps, content days, social media, branding and events for small businesses. Founded by Aisha Ansari.', '',
 'Key facts:', '- Based in Manchester; works across Greater Manchester, the UK and internationally.',
 '- Standard website (up to 5 custom pages, mobile-first, contact forms, SEO set-up, domain connection): £3,500. E-commerce from £7,000. Logo from £280. Hosting £25/month. Basic maintenance £100/month.',
 '- Payment terms on every package: 75% on booking, 25% on delivery. Standard websites usually go live in about five working days once content is supplied.',
 '- Awards: Winner, Start-Up Business of the Year, Islam Channel Business Awards 2025. Winner, Festival Friend Appreciation Award 2025. Three further 2026 awards to be announced.',
 '- Team has worked with the BBC, Sky TV, Samsung, Deliveroo, P&O Cruises, The University of Manchester, Lloyds TSB and Vivienne Westwood.',
 '- Contact: info@monos.ai. Website: https://monostechnology.co.uk. Founder: https://www.aishaansari.co.uk',
 '- MONOS Technology is a trading name of YVMC.AI LTD, registered in England and Wales, company no. 15066388.', '',
 '## Pages']
names = {'index.html': 'Home', 'work.html': 'Portfolio', 'services.html': 'Services', 'pricing.html': 'Prices and quote builder',
         'about.html': 'About founder Aisha Ansari', 'contact.html': 'Contact and FAQ'}
for f in ['index.html', 'services.html', 'pricing.html', 'work.html', 'about.html', 'contact.html']:
    if f in done: llms.append('- [%s](%s): %s' % (names[f], pretty(f), html.unescape(PAGES[f][1])))
llms += ['', '## Guides'] + ['- [%s](%s): %s' % (html.unescape(g['title'].split(' | ')[0]), pretty(g['slug'] + '.html'), g['desc']) for g in GUIDES]
open(os.path.join(OUT, 'llms.txt'), 'w').write('\n'.join(llms) + '\n')
print('seo.py:', len(done), 'pages,', len(urls) + len(extra_dirs), 'sitemap URLs')
