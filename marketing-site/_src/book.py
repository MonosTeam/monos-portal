# "Book a 1-1 with Aisha" pages, imported by build.py.
# book-aisha.html (new clients), book-aisha-clients.html (existing clients), book-aisha-confirmed.html (after PayPal).
# The form posts to the client portal, which holds the prices, emails Aisha the agenda and runs PayPal.
PORTAL = 'https://monos-portal.netlify.app'
CAL = 'https://cal.com/aisha-monos-rv64et'

ARROW = '<svg><use href="#arrow"/></svg>'
BOLT = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12z"/></svg>'
CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 018 0v3"/></svg>'

CSS = r'''
/* ---- Book a 1-1 with Aisha ---- */
.btn-amber{border:1px solid rgba(243,179,62,.55);color:var(--amber);background:rgba(243,179,62,.06)}
.btn-amber:hover{background:rgba(243,179,62,.14);transform:translateY(-2px)}
.btn-amber i{width:7px;height:7px;border-radius:50%;background:var(--amber);box-shadow:0 0 12px var(--amber)}
@media(max-width:1240px){.nav .act .btn-ghost{display:none}}
@media(max-width:680px){.nav .act .btn-amber{padding:10px 14px;font-size:13px}.nav .act .btn-amber .lg-only{display:none}}
.bk-hero{padding:70px 0 40px;overflow:hidden}
.bk-hero .bk-top{display:grid;grid-template-columns:1.15fr .85fr;gap:70px;align-items:center}
.bk-tabs{display:inline-flex;padding:5px;border-radius:999px;background:var(--card);border:1px solid var(--line);margin-bottom:34px}
.bk-tabs a{padding:10px 20px;border-radius:999px;font-size:14px;font-weight:700;color:var(--soft);transition:background .25s,color .25s}
.bk-tabs a.on{background:#fff;color:#0B0B0C}
.bk-tabs a:not(.on):hover{color:#fff}
.bk-hero h1{font-size:clamp(52px,7.6vw,116px);white-space:nowrap}
.bk-hero h1 .r{color:var(--red)}
.bk-hero .lead{margin-top:26px}
.bk-chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px}
.bk-chips span{display:inline-flex;align-items:center;gap:8px;padding:9px 15px;border-radius:999px;border:1px solid var(--line2);font-size:13px;font-weight:700;color:var(--soft)}
.bk-chips span b{color:#fff}
.bk-chips i{width:7px;height:7px;border-radius:50%}
.bk-port{position:relative;border-radius:var(--r);overflow:hidden;aspect-ratio:4/5;background:var(--card);box-shadow:0 40px 90px -40px rgba(0,0,0,.9)}
.bk-port img{width:100%;height:100%;object-fit:cover;transform:scale(1.04);animation:bkzoom 14s var(--ease) infinite alternate}
@keyframes bkzoom{to{transform:scale(1.12)}}
.bk-port:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,11,12,0) 45%,rgba(11,11,12,.92))}
.bk-port .onair{position:absolute;top:20px;left:20px;z-index:2;display:inline-flex;align-items:center;gap:8px;padding:8px 13px;border-radius:8px;background:var(--red);font:700 12px var(--sans);letter-spacing:.18em}
.bk-port .onair i{width:7px;height:7px;border-radius:50%;background:#fff;animation:blink 1.4s infinite}
@keyframes blink{50%{opacity:.25}}
.bk-port .cap{position:absolute;left:24px;right:24px;bottom:22px;z-index:2}
.bk-port .cap b{display:block;font-family:var(--display);font-weight:400;font-size:34px;text-transform:uppercase;line-height:1}
.bk-port .cap span{font-size:14px;color:var(--soft)}
.bk-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:10px}
.bk-step{padding:24px;border-radius:22px;background:var(--card);border:1px solid var(--line)}
.bk-step em{font-style:normal;font-family:var(--display);font-size:30px;color:var(--red);display:block;line-height:1;margin-bottom:12px}
.bk-step b{display:block;font-size:17px;margin-bottom:4px}
.bk-step span{font-size:14px;color:var(--muted);line-height:1.45;display:block}
.bk-main{padding:90px 0 120px}
.bk-grid{display:grid;grid-template-columns:1fr 380px;gap:40px;align-items:start}
.bk-h{font-family:var(--display);font-weight:400;text-transform:uppercase;font-size:clamp(34px,4.4vw,54px);line-height:1;margin-bottom:10px}
.bk-h small{font-family:var(--sans);font-size:14px;color:var(--muted);letter-spacing:.14em;font-weight:700;display:block;margin-bottom:12px}
.bk-sub{color:var(--muted);margin-bottom:26px;max-width:620px}
.bk-opts{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:22px}
.bk-opt{position:relative;display:block;cursor:pointer;padding:28px 26px 26px;border-radius:24px;background:var(--card);border:1.5px solid var(--line2);transition:border-color .25s,transform .35s var(--ease),background .25s,box-shadow .35s}
.bk-opt:hover{transform:translateY(-3px);border-color:rgba(255,255,255,.3)}
.bk-opt input{position:absolute;opacity:0;pointer-events:none}
.bk-opt .tag{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-bottom:16px}
.bk-opt .tag.best{color:#0B0B0C;background:var(--green);padding:5px 10px;border-radius:999px}
.bk-opt .dur{font-family:var(--display);font-size:52px;line-height:.95;text-transform:uppercase}
.bk-opt .price{display:flex;align-items:baseline;gap:10px;margin:12px 0 14px}
.bk-opt .price b{font-size:34px;font-weight:800;letter-spacing:-.02em}
.bk-opt .price s{color:var(--muted);font-size:16px}
.bk-opt .price span{font-size:14px;color:var(--muted)}
.bk-opt ul{list-style:none;display:grid;gap:7px;font-size:14.5px;color:var(--soft)}
.bk-opt li{display:flex;gap:9px;align-items:flex-start}
.bk-opt li svg{width:16px;height:16px;flex:none;color:var(--green);margin-top:3px}
.bk-opt .radio{position:absolute;top:24px;right:24px;width:26px;height:26px;border-radius:50%;border:2px solid var(--line2);display:grid;place-items:center;transition:all .25s}
.bk-opt .radio svg{width:14px;height:14px;opacity:0;transition:opacity .2s;color:#fff}
.bk-opt:has(input:checked){border-color:var(--red);background:linear-gradient(160deg,rgba(210,59,44,.16),var(--card) 60%);box-shadow:0 24px 60px -30px rgba(210,59,44,.6)}
.bk-opt:has(input:checked) .radio{background:var(--red);border-color:var(--red)}
.bk-opt:has(input:checked) .radio svg{opacity:1}
.bk-opt:has(input:focus-visible){outline:2px solid #fff;outline-offset:3px}
.bk-exp{position:relative;display:flex;gap:18px;align-items:center;cursor:pointer;padding:22px 24px;border-radius:22px;border:1.5px dashed rgba(243,179,62,.5);background:rgba(243,179,62,.05);margin-bottom:56px;transition:all .25s}
.bk-exp input{position:absolute;opacity:0}
.bk-exp .bolt{flex:none;width:52px;height:52px;border-radius:16px;display:grid;place-items:center;background:rgba(243,179,62,.14);color:var(--amber)}
.bk-exp .bolt svg{width:24px;height:24px}
.bk-exp b{display:block;font-size:18px}
.bk-exp b em{font-style:normal;color:var(--amber)}
.bk-exp span{font-size:14.5px;color:var(--soft)}
.bk-exp .sw{margin-left:auto;flex:none;width:54px;height:32px;border-radius:999px;background:var(--card2);border:1px solid var(--line2);position:relative;transition:background .25s}
.bk-exp .sw:after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;transition:transform .3s var(--ease)}
.bk-exp:has(input:checked){border-style:solid;border-color:var(--amber);background:rgba(243,179,62,.1)}
.bk-exp:has(input:checked) .sw{background:var(--amber)}
.bk-exp:has(input:checked) .sw:after{transform:translateX(22px)}
.bk-exp:has(input:checked) .bolt{background:var(--amber);color:#0B0B0C;animation:zap 1.6s infinite}
@keyframes zap{50%{box-shadow:0 0 0 10px rgba(243,179,62,0),0 0 30px rgba(243,179,62,.5)}}
.bk-form{padding:34px;border-radius:28px;background:var(--card);border:1px solid var(--line)}
.bk-form .row{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}
.bk-form .field label small{color:var(--muted);font-weight:500}
.bk-form .field select{width:100%;background:var(--bg2);border:1px solid var(--line2);border-radius:14px;padding:15px 16px;color:#fff;font:500 16px var(--sans);outline:none;appearance:none;background-image:linear-gradient(45deg,transparent 50%,#999 50%),linear-gradient(135deg,#999 50%,transparent 50%);background-position:calc(100% - 20px) 52%,calc(100% - 15px) 52%;background-size:5px 5px;background-repeat:no-repeat}
.bk-form .field select:focus{border-color:var(--red);box-shadow:0 0 0 4px rgba(210,59,44,.18)}
.bk-form .field .hint{font-size:13px;color:var(--muted);margin-top:7px}
.bk-form .field textarea{min-height:150px}
.bk-ag{border-left:3px solid var(--red);padding:16px 18px;border-radius:0 14px 14px 0;background:rgba(210,59,44,.07);font-size:14.5px;color:var(--soft);margin:4px 0 22px}
.bk-ag b{color:#fff}
.bk-agree{display:flex;gap:12px;align-items:flex-start;font-size:14.5px;color:var(--soft);margin:8px 0 4px;cursor:pointer}
.bk-agree input{margin-top:4px;width:18px;height:18px;accent-color:var(--red);flex:none}
.bk-only-block{display:none}
.is-block .bk-only-block{display:block}
.bk-sum{position:sticky;top:110px;padding:30px;border-radius:28px;background:linear-gradient(180deg,#19191c,#121214);border:1px solid var(--line2);box-shadow:0 40px 80px -40px rgba(0,0,0,.9)}
.bk-sum .eyebrow{margin-bottom:22px}
.bk-sum dl{display:grid;gap:12px;font-size:15px;padding-bottom:20px;border-bottom:1px solid var(--line)}
.bk-sum dl div{display:flex;justify-content:space-between;gap:14px}
.bk-sum dt{color:var(--muted)}
.bk-sum dd{font-weight:700;text-align:right}
.bk-sum .exp-line{display:none}.bk-sum.x .exp-line{display:flex}
.bk-sum .exp-line dd{color:var(--amber)}
.bk-tot{display:flex;justify-content:space-between;align-items:baseline;padding:20px 0 22px}
.bk-tot span{font-size:13px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.bk-tot b{font-family:var(--display);font-weight:400;font-size:60px;line-height:1;transition:transform .35s var(--ease)}
.bk-tot b.pop{transform:scale(1.08)}
.bk-pay{width:100%;justify-content:center;font-size:17px;padding:19px}
.bk-pay[disabled]{opacity:.6;pointer-events:none}
.bk-secure{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:14px;font-size:13px;color:var(--muted)}
.bk-secure svg{width:15px;height:15px}
.bk-pp{display:block;margin:16px auto 0;font:italic 800 22px/1 Verdana,Arial,sans-serif;letter-spacing:-.04em;text-align:center}
.bk-pp b{color:#7fb6ff}.bk-pp span{color:#cfe2ff}
.bk-sum ul{list-style:none;margin-top:20px;padding-top:20px;border-top:1px solid var(--line);display:grid;gap:9px;font-size:14px;color:var(--soft)}
.bk-sum li{display:flex;gap:9px}.bk-sum li svg{width:16px;height:16px;flex:none;color:var(--green);margin-top:3px}
.bk-note{padding:16px 20px;border-radius:16px;margin-bottom:26px;font-weight:600;font-size:15px}
.bk-note.err{background:rgba(210,59,44,.12);border:1px solid rgba(210,59,44,.5)}
.bk-note.info{background:rgba(243,179,62,.1);border:1px solid rgba(243,179,62,.45)}
.bk-note.test{background:rgba(79,174,79,.12);border:1px solid rgba(79,174,79,.5)}
.bk-faq{padding:0 0 130px}
.bk-faq .wrap{max-width:900px}
.bk-faq details{border-bottom:1px solid var(--line);padding:22px 0}
.bk-faq summary{cursor:pointer;list-style:none;font-weight:700;font-size:19px;display:flex;justify-content:space-between;gap:20px}
.bk-faq summary::-webkit-details-marker{display:none}
.bk-faq summary:after{content:"+";color:var(--red);font-size:26px;line-height:1;transition:transform .3s}
.bk-faq details[open] summary:after{transform:rotate(45deg)}
.bk-faq details p{color:var(--soft);margin-top:12px;max-width:760px}
.bk-done{padding:80px 0 130px;text-align:center}
.bk-done .wrap{max-width:860px}
.bk-tick{width:110px;height:110px;margin:0 auto 34px;border-radius:50%;display:grid;place-items:center;background:var(--green);box-shadow:0 0 0 14px rgba(79,174,79,.14),0 0 80px rgba(79,174,79,.45);animation:tickin .9s var(--ease) both}
.bk-tick svg{width:54px;height:54px;color:#0B0B0C;stroke-dasharray:30;stroke-dashoffset:30;animation:draw .6s .45s var(--ease) forwards}
@keyframes tickin{from{transform:scale(.4);opacity:0}}
@keyframes draw{to{stroke-dashoffset:0}}
.bk-done h1{font-size:clamp(52px,8vw,110px)}
.bk-done .lead{margin:24px auto 0}
.bk-ref{display:inline-flex;gap:10px;margin-top:26px;padding:10px 18px;border-radius:999px;background:var(--card);border:1px solid var(--line2);font-size:14px;color:var(--soft)}
.bk-ref b{color:#fff;letter-spacing:.08em}
.bk-done .ctas{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:36px}
.bk-cal{margin-top:50px;border-radius:24px;overflow:hidden;border:1px solid var(--line2);background:#fff;height:760px}
.bk-cal iframe{width:100%;height:100%;border:0}
.bk-exp-note{margin:30px auto 0;max-width:620px}
@media(max-width:1000px){.bk-hero .bk-top{grid-template-columns:1fr;gap:44px}.bk-port{max-width:440px;aspect-ratio:1/1}.bk-grid{grid-template-columns:1fr}.bk-sum{position:static}.bk-steps{grid-template-columns:1fr 1fr}}
@media(max-width:680px){.bk-opts,.bk-form .row,.bk-steps{grid-template-columns:1fr}.bk-form{padding:22px}.bk-opt .dur{font-size:44px}.bk-exp{flex-wrap:wrap}.bk-exp .sw{margin-left:70px}.bk-hero{padding-top:40px}.bk-tabs a{padding:9px 14px;font-size:13px}.bk-cal{height:680px}}
'''

def opt(pid, tag, dur, price, per, items, checked=False, was=None, best=False):
    return ('<label class="bk-opt rv"><input type="radio" name="product" value="%s" data-price="%d"%s required>'
            '<span class="radio">%s</span><span class="tag%s">%s</span><div class="dur">%s</div>'
            '<div class="price"><b>£%d</b>%s<span>%s</span></div><ul>%s</ul></label>') % (
        pid, price, ' checked' if checked else '', CHECK, ' best' if best else '', tag, dur, price,
        '<s>£%d</s>' % was if was else '', per, ''.join('<li>%s%s</li>' % (CHECK, i) for i in items))

def hero(existing):
    tabs = ('<nav class="bk-tabs rv" aria-label="Choose your booking page"><a href="book-aisha.html"%s>New to MONOS</a><a href="book-aisha-clients.html"%s>Existing clients</a></nav>'
            % ('' if existing else ' class="on" aria-current="page"', ' class="on" aria-current="page"' if existing else ''))
    lead = ("Keep your momentum going. Lock in three weekly sessions with Aisha, same day, same time, or book a single hour whenever you need her."
            if existing else
            "Sit down one to one with the multi-award winning founder behind work for the BBC, Sky TV and Samsung. Bring your agenda, leave with a clear plan.")
    return '''<section class="bk-hero">
  <div class="wrap bk-top">
    <div>
      %s
      <span class="eyebrow rv"><span class="dot"></span>%s</span>
      <h2 class="h-display" style="margin-top:24px"><span class="mask"><span>Book a 1&#8209;1</span></span><span class="mask"><span class="r">with Aisha.</span></span></h2>
      <p class="lead rv d1">%s</p>
      <div class="bk-chips rv d2"><span><i style="background:var(--red)"></i><b>3,000+</b> clients worldwide</span><span><i style="background:var(--amber)"></i><b>Multi-award</b> winning</span><span><i style="background:var(--green)"></i>Secure <b>PayPal</b> checkout</span></div>
    </div>
    <div class="bk-port rv d2"><img src="img/aisha.jpg" alt="Aisha Ansari, Founder and CEO of MONOS Group" width="576" height="720"><span class="onair"><i></i>ON AIR</span><div class="cap"><b>Aisha Ansari</b><span>Founder &amp; CEO, MONOS Group</span></div></div>
  </div>
  <div class="wrap"><div class="bk-steps" style="margin-top:64px">
    <div class="bk-step rv"><em>01</em><b>Choose your session</b><span>%s</span></div>
    <div class="bk-step rv d1"><em>02</em><b>Send your agenda</b><span>Bring your own agenda. Tell Aisha what you want to cover so she can prepare.</span></div>
    <div class="bk-step rv d2"><em>03</em><b>Pay securely</b><span>PayPal or any debit or credit card. No account needed.</span></div>
    <div class="bk-step rv d3"><em>04</em><b>Pick your time</b><span>Choose a slot in Aisha's diary straight after paying.</span></div>
  </div></div>
</section>
''' % (tabs, 'Existing MONOS clients' if existing else 'Private 1-1 sessions', lead,
       'A block of 3 weekly sessions or a single hour.' if existing else '20 minutes for quick answers, or a full hour to go deep.')

def form(existing):
    if existing:
        opts = (opt('client_block', 'Best value · save £50', '3 × 1 hour', 220, 'block of 3', [
                    'Three 1-hour sessions, once a week', 'Same day and time every week', 'Aisha tracks your progress between sessions', 'Ideal for launches and growth plans'], checked=True, was=270, best=True)
                + opt('client_60', 'Single session', '1 hour', 90, 'per session', [
                    'One focused 1-hour session', 'Book whenever you need Aisha', 'Strategy, launch, marketing or website', 'Book again any time']))
        sub = 'Your block is three sessions, one a week, on the same day and time. Prefer one at a time? Book single hours at £90.'
    else:
        opts = (opt('new_20', 'Quick-fire', '20 mins', 45, 'one session', [
                    'Fast answers to your top questions', 'Honest feedback on your idea or site', 'Clear next steps to take away'], checked=True)
                + opt('new_60', 'Deep dive', '1 hour', 90, 'one session', [
                    'Work through your whole agenda', 'Website, brand, launch or marketing plan', 'A step-by-step plan to take away', 'Most popular with new businesses']))
        sub = 'Not sure? 20 minutes suits two or three focused questions. Choose an hour to map out a launch, website or marketing plan.'
    portal_field = ('<div class="field"><label for="bkE">Email <small>(the one you use for your MONOS portal)</small></label><input id="bkE" name="email" type="email" required autocomplete="email"></div>'
                    if existing else
                    '<div class="field"><label for="bkE">Email</label><input id="bkE" name="email" type="email" required autocomplete="email"></div>')
    stage = ('' if existing else
             '<div class="field"><label for="bkS">Where is your business right now?</label><select id="bkS" name="stage" required><option value="">Choose one</option><option>Just an idea</option><option>Launching soon</option><option>Trading for under 2 years</option><option>Established and growing</option></select></div>')
    later = ('<div class="field bk-only-block"><label for="bkL">What would you like to cover in sessions 2 and 3? <small>(optional, you can change this later)</small></label><textarea id="bkL" name="later_sessions" style="min-height:110px" placeholder="For example: session 2, review my new homepage. Session 3, plan my launch posts."></textarea></div>'
             if existing else '')
    return '''<section class="bk-main" id="book">
  <div class="wrap">
    <div id="bkNote"></div>
    <form class="bk-grid" id="bkForm" method="POST" action="%s/api/one-to-one/checkout">
      <div>
        <h3 class="bk-h rv"><small>STEP 01</small>Choose your session</h3>
        <p class="bk-sub rv">%s</p>
        <div class="bk-opts">%s</div>
        <label class="bk-exp rv"><input type="checkbox" name="express" value="yes" id="bkX"><span class="bolt">%s</span>
          <span><b>Priority express <em>+£25</em></b><span>Need to speak to Aisha urgently? Jump the queue and we'll email you the same working day to fit you in at the earliest slot.</span></span><span class="sw" aria-hidden="true"></span></label>

        <h3 class="bk-h rv"><small>STEP 02</small>Your agenda</h3>
        <p class="bk-sub rv">Every session runs on <b style="color:#fff">your</b> agenda. Fill this in so Aisha can prepare and you get the most from every minute.</p>
        <div class="bk-form rv">
          <input type="hidden" name="test" id="bkT">
          <p style="position:absolute;left:-9999px" aria-hidden="true"><label>Leave empty <input name="company_url" tabindex="-1" autocomplete="off"></label></p>
          <div class="row"><div class="field"><label for="bkN">Full name</label><input id="bkN" name="name" required autocomplete="name"></div>%s</div>
          <div class="row"><div class="field"><label for="bkB">Business name</label><input id="bkB" name="business" required autocomplete="organization"></div>
          <div class="field"><label for="bkP">Phone <small>(optional)</small></label><input id="bkP" name="phone" type="tel" autocomplete="tel"></div></div>
          <div class="row"%s><div class="field"><label for="bkW">Website or Instagram <small>(optional)</small></label><input id="bkW" name="website" placeholder="yourbusiness.co.uk or @yourbusiness"></div>%s</div>
          <div class="bk-ag"><b>Bring your own agenda.</b> List the points you want to cover, most important first. Aisha reads it before your session.</div>
          <div class="field"><label for="bkA"><span class="ag-label">Your agenda for the session</span></label><textarea id="bkA" name="agenda" required minlength="10" placeholder="1. Is my website putting customers off?&#10;2. How should I price my new service?&#10;3. What should I post on Instagram each week?"></textarea></div>
          <div class="field"><label for="bkO">What would a great outcome look like?</label><textarea id="bkO" name="outcome" required style="min-height:100px" placeholder="For example: a clear launch plan and a list of what to fix on my website."></textarea></div>
          %s
          <div class="field"><label for="bkR">Anything Aisha should look at first? <small>(optional links)</small></label><input id="bkR" name="prep_links" placeholder="Links to your site, socials, menu, price list or competitors"></div>
          <label class="bk-agree"><input type="checkbox" name="agree" value="yes" required><span>I'll bring my agenda and be ready at my booked time. I understand sessions start and finish on time.</span></label>
        </div>
      </div>
      <aside class="bk-sum" id="bkSum">
        <span class="eyebrow"><span class="dot"></span>Your booking</span>
        <dl><div><dt>Session</dt><dd id="bkSess">-</dd></div><div><dt>Price</dt><dd id="bkBase">-</dd></div><div class="exp-line"><dt>Priority express</dt><dd>+£25</dd></div></dl>
        <div class="bk-tot"><span>Total</span><b id="bkTot">£0</b></div>
        <button class="btn btn-red bk-pay" type="submit" id="bkPay">Pay &amp; choose your time %s</button>
        <div class="bk-secure">%s Secure checkout by PayPal. Card or PayPal.</div>
        <div class="bk-pp"><b>Pay</b><span>Pal</span></div>
        <ul><li>%sYour agenda goes straight to Aisha</li><li>%sPick your slot right after paying</li><li>%sConfirmation by email</li></ul>
      </aside>
    </form>
  </div>
</section>
''' % (PORTAL, sub, opts, BOLT, portal_field, ' style="grid-template-columns:1fr"' if existing else '', stage, later, ARROW, LOCK, CHECK, CHECK, CHECK)

def faq(existing):
    qs = [('What should I bring?', 'Your own agenda. List the questions and topics you want to cover, most important first, in the form above. Have any links, numbers or designs you want Aisha to see ready on the call.'),
          ('How do I pick my time?', 'Straight after paying you go to Aisha\'s diary to choose your slot. You also get an email with the booking link, so you can come back to it.'),
          ('What is Priority express?', 'For when you need to speak to Aisha urgently. Add £25 and you jump the queue: our team emails you the same working day to fit you in at the earliest possible slot.'),
          ('How do I pay?', 'Securely through PayPal. You can pay with your PayPal account or any debit or credit card, no PayPal account needed.')]
    if existing:
        qs.insert(1, ('How does the block of 3 work?', 'You choose your first session and the next two follow at the same day and time for the next two weeks. It costs £220 instead of £270 for three single hours.'))
    else:
        qs.insert(1, ('20 minutes or 1 hour?', '20 minutes (£45) suits two or three focused questions or quick feedback. An hour (£90) gives time to work through a full website, launch or marketing plan together.'))
        qs.append(('Already a MONOS client?', 'Use the <a href="book-aisha-clients.html" style="text-decoration:underline">existing client booking page</a> to book a block of three weekly sessions for £220.'))
    return ('<section class="bk-faq"><div class="wrap"><h3 class="bk-h rv" style="margin-bottom:20px">Good to know</h3>'
            + ''.join('<details class="rv"><summary>%s</summary><p>%s</p></details>' % q for q in qs) + '</div></section>\n')

JS = r'''<script>
(function(){
  var f=document.getElementById('bkForm');if(!f)return;
  var q=new URLSearchParams(location.search),note=document.getElementById('bkNote');
  var ERR={missing:'Please fill in your name, email, agenda and tick the box, then try again.',paypal:'PayPal is not available right now. Please try again in a few minutes or email info@monos.ai.',payment:'Your payment did not go through, so you have not been charged. Please try again.',product:'Please choose a session.',sandbox:'Test mode is not switched on yet.',form:'Something went wrong. Please try again.'};
  function show(c,t){note.innerHTML='<div class="bk-note '+c+'">'+t+'</div>'}
  if(q.get('error'))show('err',ERR[q.get('error')]||ERR.form);
  else if(q.get('cancelled'))show('info','Payment cancelled, nothing was taken. Your session is still available below.');
  if(q.get('test')){document.getElementById('bkT').value=q.get('test');show('test','TEST MODE: payments go to the PayPal sandbox. No real money moves.');}
  var sess=document.getElementById('bkSess'),base=document.getElementById('bkBase'),tot=document.getElementById('bkTot'),sum=document.getElementById('bkSum'),x=document.getElementById('bkX'),lbl=document.querySelector('.ag-label');
  function upd(){
    var r=f.querySelector('input[name=product]:checked');if(!r)return;
    var o=r.closest('.bk-opt'),p=+r.dataset.price,t=p+(x.checked?25:0);
    sess.textContent=o.querySelector('.dur').textContent;base.textContent='£'+p;
    if(tot.textContent!=='£'+t){tot.textContent='£'+t;tot.classList.add('pop');setTimeout(function(){tot.classList.remove('pop')},300)}
    sum.classList.toggle('x',x.checked);
    var blk=r.value==='client_block';f.classList.toggle('is-block',blk);
    if(lbl)lbl.textContent=blk?'Your agenda for session 1':'Your agenda for the session';
  }
  f.addEventListener('change',upd);upd();
  f.addEventListener('submit',function(){var b=document.getElementById('bkPay');b.disabled=true;b.firstChild.textContent='Taking you to PayPal… '});
  window.addEventListener('pageshow',function(){var b=document.getElementById('bkPay');b.disabled=false;b.firstChild.textContent='Pay & choose your time '});
})();
</script>
'''

DONE = '''<section class="bk-done">
  <div class="wrap">
    <div class="bk-tick">%s</div>
    <span class="eyebrow"><span class="dot" style="background:var(--green)"></span>Payment received</span>
    <h2 class="h-display" style="margin-top:24px"><span class="mask"><span>You're in.</span></span><span class="mask"><span style="color:var(--red)">Pick your time.</span></span></h2>
    <p class="lead" id="dnLead">Thank you. Your payment is confirmed and Aisha has your agenda. Choose your slot below. We've also emailed you the link.</p>
    <div class="bk-ref" id="dnRef" hidden>Booking ref <b></b></div>
    <div id="dnTest"></div>
    <div class="ctas"><a class="btn btn-red" id="dnCal" href="%s" target="_blank" rel="noopener">Choose your time %s</a><a class="btn btn-ghost" href="index.html">Back to MONOS</a></div>
    <div class="bk-note info bk-exp-note" id="dnX" hidden>Priority express: our team will email you today to fit you in at the earliest possible slot. You can also pick any open slot below.</div>
    <div class="bk-cal" id="dnFrame" hidden></div>
  </div>
</section>
<script>
(function(){
  var q=new URLSearchParams(location.search),CAL=%r;
  var P={new_20:['1-1-with-aisha','20'],new_60:['1-1-with-aisha','60'],client_60:['1-1-with-aisha','60'],client_block:['1-1-block','']};
  var p=P[q.get('p')];if(!p)return;
  var ref=(q.get('ref')||'').replace(/[^A-Z0-9]/gi,'').slice(0,12),u=new URL(CAL+'/'+p[0]);
  if(p[1])u.searchParams.set('duration',p[1]);
  if(q.get('n'))u.searchParams.set('name',q.get('n').slice(0,80));
  if(q.get('e'))u.searchParams.set('email',q.get('e').slice(0,120));
  u.searchParams.set('notes','MONOS ref '+ref+(q.get('x')?' · PRIORITY EXPRESS':'')+'. Agenda already sent.');
  document.getElementById('dnCal').href=u.toString();
  if(ref){var r=document.getElementById('dnRef');r.hidden=false;r.querySelector('b').textContent=ref}
  if(q.get('x'))document.getElementById('dnX').hidden=false;
  if(q.get('test'))document.getElementById('dnTest').innerHTML='<div class="bk-note test bk-exp-note">TEST booking: paid with PayPal sandbox money.</div>';
  if(q.get('p')==='client_block')document.getElementById('dnLead').textContent='Thank you. Your block of 3 is paid and Aisha has your agenda. Choose your first session below and the next two follow weekly at the same day and time.';
  var e=new URL(u.toString());e.searchParams.set('embed','true');e.searchParams.set('theme','light');
  var fr=document.getElementById('dnFrame');fr.hidden=false;fr.innerHTML='<iframe title="Choose your time with Aisha" loading="lazy"></iframe>';fr.firstChild.src=e.toString();
})();
</script>
''' % (CHECK, CAL + '/1-1-with-aisha', ARROW, CAL)

SECTIONS = {
    'book_new': hero(False) + form(False) + faq(False) + JS,
    'book_clients': hero(True) + form(True) + faq(True) + JS,
    'book_done': DONE,
}
PAGES = [
    ('book-aisha.html', 'Book a 1-1 with Aisha | MONOS Technology', 'Book 1-1', ['book_new']),
    ('book-aisha-clients.html', 'Book a 1-1 with Aisha (clients) | MONOS Technology', 'Book 1-1', ['book_clients']),
    ('book-aisha-confirmed.html', 'You are booked in | MONOS Technology', 'Book 1-1', ['book_done']),
]
