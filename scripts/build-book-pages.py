"""Copy the "Book a 1-1 with Aisha" pages from the marketing site build into the portal.

The pages are designed in marketing-site/_src/book.py (branch claude/project-thread-s8motx).
Until the main site is redeployed with them, the portal hosts them at /book-aisha,
/book-aisha-clients and /book-aisha-confirmed. Links back to the rest of the site point
at monostechnology.co.uk.

Usage: python3 scripts/build-book-pages.py <path to built marketing-site>
"""
import os, re, sys
SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public')
MAIN = 'https://monostechnology.co.uk/'
PAGES = ['book-aisha', 'book-aisha-clients', 'book-aisha-confirmed']

def fix(html):
    # our own pages stay on the portal, pretty URLs
    for p in sorted(PAGES, key=len, reverse=True):
        html = html.replace('href="%s.html' % p, 'href="/%s' % p)
    # everything else relative goes to the main site
    html = re.sub(r'(href|src|poster|data-src)="(?!https?:|/|#|data:|mailto:|tel:)([^"]+)"', lambda m: '%s="%s%s"' % (m.group(1), MAIN, m.group(2)), html)
    html = html.replace('<meta name="robots" content="index,follow,max-image-preview:large">', '<meta name="robots" content="noindex,follow">')
    # the Spin & Win form is a Netlify form on the main site only
    html = html.replace('</head>', '<style>.spin-fab{display:none!important}</style>\n</head>', 1)
    return html

for p in PAGES:
    s = open(os.path.join(SRC, p + '.html')).read()
    open(os.path.join(OUT, p + '.html'), 'w').write(fix(s))
    print(p, 'ok')
