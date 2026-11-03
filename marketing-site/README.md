# monostechnology.co.uk (marketing site)

Static site for www.monostechnology.co.uk, hosted on Netlify (site `clever-mermaid-7d3cd8`, manual/drag-and-drop deploys).
Not part of the portal build. Deploy this folder's contents (index.html, terms.html, privacy.html, work/).

- `index.html`: homepage with quote builder (Netlify form `enquiry`: name, business, email, services, total, questionnaire, message).
- `work/`: concept portfolio screenshots, rendered from `concepts-source.html` with Playwright. All names are fictional and labelled "Concept design".
- Never put the £490 festive offer on this site; it shows retail pricing only.

## SEO (post-build step)
Run `python3 _src/build.py && python3 _src/seo.py`. `seo.py` sets titles, meta descriptions, canonicals, Open Graph and JSON-LD on every page, gives inner pages an `<h1>`, renders the FAQ as crawlable HTML, builds the guide pages from `_src/seo_content.py`, and writes `sitemap.xml`, `robots.txt` and `llms.txt`. Edit copy in `seo_content.py`, not in the generated HTML.
