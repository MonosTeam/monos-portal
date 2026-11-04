# Generates trades.html (4 IG carousels, 1080x1350). Photos expected at img/<key>.jpg (see photos.json).
import json,html
P=json.load(open('photos.json'))
CSS=open('style.css').read()
def esc(s): return html.escape(s).replace('\n','<br>')
def head(n,t): return f'<div class="logo">MONOS<i></i></div><div class="pg">{n:02d} / {t:02d}</div>'
def cover(id,n,t,img,label,h,sub):
    return f'<section class="s ph" id="{id}"><div class="bg" style="background-image:url(img/{img}.jpg)"></div><div class="shade"></div>{head(n,t)}<div class="bot"><div class="k">{esc(label)}</div><h1>{esc(h)}</h1><p class="l">{esc(sub)}</p><div class="swipe">Swipe →</div></div></section>'
def pain(id,n,t,img,num,h,sub):
    return f'<section class="s ph" id="{id}"><div class="bg" style="background-image:url(img/{img}.jpg)"></div><div class="shade"></div>{head(n,t)}<div class="bot"><div class="tag"><b>✕</b> Pain #{num}</div><h2>{esc(h)}</h2><p class="l">{esc(sub)}</p></div></section>'
def fix(id,n,t,img,h,items):
    li=''.join(f'<li><b>✓</b>{esc(x)}</li>' for x in items)
    return f'<section class="s" id="{id}"><div class="side" style="background-image:url(img/{img}.jpg)"></div>{head(n,t)}<div class="fixw"><div class="k g">With MONOS</div><h2>{esc(h)}</h2><ul class="ticks">{li}</ul></div></section>'
def cta(id,n,t,h):
    return f'<section class="s" id="{id}">{head(n,t)}<div class="ctaw"><div class="gtag2">🏆 Multi-award-winning agency</div><h1>{esc(h)}</h1><p class="l">Trusted by 3,000+ clients worldwide.<br>Websites built for trades, live in 5 days.</p><div class="cta">DM “SITE” NOW</div><div class="small">Only 4 places this year · monostechnology.co.uk</div></div><div class="foot"><span>Your brand. On air.</span><span>Manchester · UK</span></div></section>'
def time(id,n,t,img,tm,h,sub,good=False):
    c='g' if good else 'red'
    return f'<section class="s ph" id="{id}"><div class="bg{" warm" if good else ""}" style="background-image:url(img/{img}.jpg)"></div><div class="shade"></div>{head(n,t)}<div class="bot"><div class="time {c}">{tm}</div><h2>{esc(h)}</h2><p class="l">{esc(sub)}</p></div></section>'
def ba(id,n,t,bimg,aimg,b,a):
    return f'<section class="s" id="{id}" style="padding:0">{head(n,t)}<div class="half top"><div class="bg cold" style="background-image:url(img/{bimg}.jpg)"></div><div class="shade2"></div><div class="lab bad">BEFORE</div><div class="htxt">{esc(b)}</div></div><div class="half btm"><div class="bg warm" style="background-image:url(img/{aimg}.jpg)"></div><div class="shade2"></div><div class="lab good">AFTER</div><div class="htxt">{esc(a)}</div></div><div class="vs">VS</div></section>'
S=[]
# Carousel A: plumbers (8)
T=8
S+= [cover('a1',1,T,'plumb_sink','Plumbers & heating engineers','Sound\nfamiliar?','6 things quietly costing you jobs every week.'),
 pain('a2',2,T,'plumb_van_paper',1,'No quoting\nsystem','Quotes scribbled at 10pm after a 12-hour day. By the time it’s sent, they’ve booked someone else.'),
 pain('a3',3,T,'plumb_driving',2,'Time\nwasters','Driving across town for “just a price” that never turns into a job.'),
 pain('a4',4,T,'plumb_phone',3,'Same questions.\nEvery call.','“Are you Gas Safe?” “Do you do combis?” “How much, roughly?” Fifty times a week.'),
 pain('a5',5,T,'plumb_under',4,'Missed calls =\nmissed jobs','You’re under a sink. They ring the next plumber on Google.'),
 pain('a6',6,T,'cash_invoice',5,'Cash, chasing\n& spreadsheets','Cash in hand, transfers you forget to check, invoices typed up on a Sunday.'),
 fix('a7',7,T,'plumb_happy','The MONOS\ndifference',['Instant online quotes','Bookings + deposits taken for you','Chat that answers FAQs 24/7','Card payments + automatic invoices','One dashboard for every job']),
 cta('a8',8,T,'More jobs.\nLess admin.')]
# Carousel B: builders (8)
S+= [cover('b1',1,T,'build_site','Builders & trades','You build\nfor a living.\nNot admin.','The 6 headaches every builder knows.'),
 pain('b2',2,T,'build_night',1,'Quotes take\nhours','Measuring, pricing, typing it up at night. Half never reply.'),
 pain('b3',3,T,'build_measure',2,'Free site visits\nfor time wasters','Two hours there and back for someone with no budget.'),
 pain('b4',4,T,'build_phone',3,'Leads on scraps\nof paper','No CRM. Enquiries lost across WhatsApp, Facebook, texts and voicemail.'),
 pain('b5',5,T,'build_paperwork',4,'Invoicing\nby hand','Stage payments chased by text. Spreadsheets on a Sunday.'),
 pain('b6',6,T,'build_scaffold',5,'“Any update on\nmy extension?”','Customers ringing all day for progress while you’re on the tools.'),
 fix('b7',7,T,'build_happy','The MONOS\ndifference',['Quote form with photos + budget filter','Only serious jobs reach you','CRM dashboard: every lead in one place','Staged invoices + card payments','Client portal with progress updates','Your best builds, winning on Google']),
 cta('b8',8,T,'Win bigger jobs.\nSkip the paperwork.')]
# Carousel C: day in the life (7)
T=7
S+= [cover('c1',1,T,'van_morning','A day in the life','A tradie’s day.\nWithout a\nproper website.','Swipe through. Then see the difference.'),
 time('c2',2,T,'van_morning2','7:00AM','4 voicemails.\nAll “how much?”','In the van before the first job, already behind.'),
 time('c3',3,T,'roof_ladder','11:30AM','6 calls.\n6 jobs gone.','Up a ladder. Can’t answer. They’ve rung someone else.'),
 time('c4',4,T,'phone_stress','6:00PM','Still chasing\nlast month’s invoice','“I’ll transfer it tomorrow.”'),
 time('c5',5,T,'kitchen_night','10:00PM','Writing quotes.\nNot seeing the kids.','The admin never stops.'),
 time('c6',6,T,'family_evening','SAME DAY. WITH MONOS.','Evening:\nfree.','Website took 5 enquiries · 2 bookings with deposits paid · FAQs answered automatically · invoices paid by card.',True),
 cta('c7',7,T,'Get your\nevenings back.')]
# Carousel D: before & after (6)
T=6
S+= [cover('d1',1,T,'tradie_laptop','Before & after MONOS','What changes\nfor a tradie\nin 5 days.','Swipe to see the difference.'),
 ba('d2',2,T,'receipt_quote','laptop_site','Quotes on the back\nof a receipt','Instant quotes from\nyour website'),
 ba('d3',3,T,'plumb_under','phone_booking','Missed calls,\nlost jobs','Online booking 24/7\n+ deposits taken'),
 ba('d4',4,T,'cash_invoice','card_payment','Cash, chasing,\nspreadsheets','Card payments +\nautomatic invoices'),
 ba('d5',5,T,'build_phone','tradie_laptop','Leads lost\nin WhatsApp','Every job in\none dashboard'),
 cta('d6',6,T,'Your business.\nOn air.')]
open('trades.html','w').write(f'<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Anton&family=Red+Hat+Display:wght@400;500;700;900&display=swap" rel="stylesheet"><style>{CSS}</style></head><body>'+'\n'.join(S)+'</body></html>')
print(len(S),'slides')
