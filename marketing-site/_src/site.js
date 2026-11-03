(function(){
  var fmt=function(n){return '£'+n.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})};
  document.getElementById('yr').textContent=new Date().getFullYear();
  requestAnimationFrame(function(){document.body.classList.add('loaded')});

  // nav
  var nav=document.getElementById('nav');
  var onScroll=function(){nav.classList.toggle('solid',scrollY>20)};
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  document.getElementById('burger').onclick=function(){document.body.classList.toggle('menu-open')};
  document.querySelectorAll('#mob a').forEach(function(a){a.onclick=function(){document.body.classList.remove('menu-open')}});

  // reveal + counters
  var countUp=function(el){
    var t=+el.dataset.count,s=el.dataset.suffix||'',d=1400,st=null;
    var step=function(ts){if(!st)st=ts;var p=Math.min((ts-st)/d,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(t*e).toLocaleString('en-GB')+s;if(p<1)requestAnimationFrame(step)};
    requestAnimationFrame(step);
  };
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');e.target.querySelectorAll('[data-count]').forEach(countUp);if(e.target.dataset.count)countUp(e.target);io.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.rv,.step,.pay').forEach(function(el){io.observe(el)});

  // hero device tilt on scroll
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ON AIR hero: timecode, light, parallax
  var tc=document.getElementById('tc');
  if(tc){var t0=performance.now(),pad=function(n){return (n<10?'0':'')+n};
    var tick=function(){var ms=performance.now()-t0,f=Math.floor(ms/40)%25,sec=Math.floor(ms/1000);tc.textContent='00:'+pad(Math.floor(sec/60)%60)+':'+pad(sec%60)+':'+pad(f);requestAnimationFrame(tick)};tick()}
  var oh=document.getElementById('ohero');
  if(oh){setTimeout(function(){oh.classList.add('live')},reduce?0:900);
    var wall=document.getElementById('wall');
    if(!reduce&&wall&&matchMedia('(pointer:fine)').matches){oh.addEventListener('pointermove',function(e){var r=oh.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;wall.style.setProperty('--px',(x*-30)+'px');wall.style.setProperty('--py',(y*-20)+'px')})}
    addEventListener('scroll',function(){var p=Math.min(scrollY/innerHeight,1);oh.style.setProperty('--sp',p)},{passive:true});
  }

  // slideshow
  var cycle=function(id,ms,cb){var imgs=document.querySelectorAll('#'+id+' img'),i=0;if(!imgs.length)return;setInterval(function(){imgs[i].classList.remove('on');i=(i+1)%imgs.length;imgs[i].classList.add('on');cb&&cb(imgs[i])},ms)};
  if(!reduce){cycle('screen',3800,function(im){document.querySelector('#url .px').textContent=im.dataset.url});cycle('pscreen',3000)}

  // play videos only while on screen
  var vio=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){if(v.preload==='none')v.preload='auto';var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()})},{threshold:.25});
  if(!reduce)document.querySelectorAll('video').forEach(function(v){vio.observe(v)});

  // marquee duplicate
  ['track','atrack'].forEach(function(id){var tr=document.getElementById(id);if(tr)tr.innerHTML+=tr.innerHTML});

  // service spotlight
  document.querySelectorAll('.sv').forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')})});

  // QUOTE BUILDER
  var setv=function(id,v,h){var el=document.getElementById(id);if(el){if(h)el.innerHTML=v;else if('value' in el&&el.tagName!=='DIV')el.value=v;else el.textContent=v}};
  var groups=document.getElementById('groups');
  if(groups){
  var G=[
    {t:'Websites & apps',items:[
      {id:'web',n:'Standard website',d:'Up to 5 custom pages, mobile-first, contact forms, SEO set-up and domain connection',p:3500,feat:1,badge:'MOST CHOSEN'},
      {id:'shop',n:'E-commerce shop',d:'Online store with products, checkout and payments',p:7000,from:1},
      {id:'app',n:'Mobile app',d:'iPhone and Android app, scoped with you',p:0,quote:1},
      {id:'brand',n:'Full brand identity',d:'Logo, colours, typography and guidelines',p:2000},
      {id:'logo',n:'Logo only',d:'A professional logo in all formats',p:280}
    ]},
    {t:'Monthly',items:[
      {id:'host',n:'Website hosting',d:'Fast, secure hosting with SSL',p:25,mo:1},
      {id:'care',n:'Basic maintenance',d:'Updates, backups and small changes',p:100,mo:1},
      {id:'social',n:'Social growth',d:'Fully managed Instagram and TikTok (3-month minimum)',p:5000,mo:1},
      {id:'posts',n:'Social media posts',d:'Individual posts designed for you',p:0,quote:1}
    ]},
    {t:'Content & events',items:[
      {id:'day',n:'Content day',d:'Six hours of filming at your venue',p:1800},
      {id:'event',n:'Event management',d:'Launches, creator events and more',p:2800,from:1},
      {id:'live',n:'TikTok Live',d:'3 hours with a standard host',p:135},
      {id:'edit',n:'Video editing',d:'Edits for reels, ads and launches',p:180,from:1},
      {id:'trailer',n:'Teaser trailer',d:'Short animated teaser',p:60},
      {id:'gfx',n:'Graphic design',d:'Poster or flyer',p:28}
    ]},
    {t:'Time with Aisha',items:[
      {id:'a20',n:'Quick answers call',d:'20 minutes, one-to-one',p:45},
      {id:'a60',n:'Strategy session',d:'1 hour, one-to-one',p:90},
      {id:'other',n:'Something else',d:'Tell us what you need and we will quote',p:0,quote:1}
    ]}
  ];
  var sel={},all={};
  var price=function(it){return it.quote?'Quote':(it.from?'from ':'')+'£'+it.p.toLocaleString('en-GB')+(it.mo?'/mo':'')};
  var html='';
  G.forEach(function(g){html+='<div class="grp rv"><h4>'+g.t+'</h4><div class="opts">';g.items.forEach(function(it){all[it.id]=it;html+='<button type="button" class="opt'+(it.feat?' feat':'')+'" aria-pressed="false" data-id="'+it.id+'"><span class="tg"><svg><use href="#plus"/></svg></span><span class="tx"><b>'+it.n+(it.badge?'<span class="badge">'+it.badge+'</span>':'')+'</b><small>'+it.d+'</small></span><span class="p">'+price(it)+'</span></button>'});html+='</div></div>'});
  groups.innerHTML=html;
  groups.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
  var shown=0,anim=null;
  var animate=function(to){var from=shown,st=null;cancelAnimationFrame(anim);var f=function(ts){if(!st)st=ts;var p=Math.min((ts-st)/600,1),e=1-Math.pow(1-p,3);shown=from+(to-from)*e;document.getElementById('total').textContent=fmt(shown);if(p<1)anim=requestAnimationFrame(f)};anim=requestAnimationFrame(f)};
  var update=function(){
    var one=0,mo=0,lines=[],q=0;
    Object.keys(sel).forEach(function(id){var it=all[id];if(it.quote){q++;lines.push([it.n,'Quote'])}else if(it.mo){mo+=it.p;lines.push([it.n,'£'+it.p.toLocaleString('en-GB')+'/mo'])}else{one+=it.p;lines.push([it.n,(it.from?'from ':'')+'£'+it.p.toLocaleString('en-GB')])}});
    animate(one);
    var sub=[];if(mo)sub.push('+ '+fmt(mo)+' per month');if(q)sub.push(q+' item'+(q>1?'s':'')+' to quote');
    document.getElementById('totalSub').textContent=lines.length?(sub.length?sub.join(' · '):'One-off estimate'):'Add a package to get started';
    document.getElementById('lines').innerHTML=lines.length?lines.map(function(l){return '<li><span>'+l[0]+'</span><span>'+l[1]+'</span></li>'}).join(''):'<li class="empty">Nothing added yet</li>';
    document.getElementById('dep').textContent=fmt(one*.75);document.getElementById('bal').textContent=fmt(one*.25);
    var summary=lines.map(function(l){return l[0]+' ('+l[1]+')'}).join(', ');
    setv('fServices',summary);
    setv('fTotal',lines.length?fmt(one)+(mo?' + '+fmt(mo)+'/mo':''):'');
    setv('picked',lines.length?'<b>Your quote:</b> '+summary+'<br><b>Estimate:</b> '+fmt(one)+(mo?' + '+fmt(mo)+' per month':''):'No quote added yet. <a href="pricing.html#quote" style="text-decoration:underline">Build one</a> or just tell us what you need.',1);
  };
  groups.addEventListener('click',function(e){var b=e.target.closest('.opt');if(!b)return;var id=b.dataset.id;if(sel[id]){delete sel[id];b.setAttribute('aria-pressed','false')}else{sel[id]=1;b.setAttribute('aria-pressed','true')}update()});
  document.getElementById('clear').onclick=function(){sel={};groups.querySelectorAll('.opt').forEach(function(b){b.setAttribute('aria-pressed','false')});update()};
  }

  // FAQ
  var F=[
    ['How long does a website take?','Most standard websites go live in about five working days once we have your content. Larger builds, shops and apps get a timeline in your proposal.'],
    ['How do payments work?','75% on booking and 25% on delivery, for every package. You pay securely through your own client portal.'],
    ['Do I need to know anything about websites or social media?','No. We handle the design, the tech and the content. You tell us about your business and approve the work.'],
    ['Can I just choose one service?','Yes. Pick a single website, a content day, a logo or anything else. Use the quote builder to see the price.'],
    ['What happens after I send my quote?','We reply within one working day, book a short call to confirm what you need, and send a written proposal with your final price.'],
    ['Do you offer hosting and maintenance?','Yes. Hosting is £25 per month and basic maintenance is £100 per month, so your site stays secure, fast and up to date.'],
    ['Can I use my existing domain?','Yes. We connect your new site to your existing domain at no extra cost, or help you register a new one.'],
    ['Do you work outside Manchester?','Yes. We are based in Manchester and work with businesses across the UK and internationally.'],
    ['Will you sign an NDA?','Of course. Much of our client work is under NDA, which is why our portfolio shows concept designs.'],
    ['What else can you help with?','Social media posts, event management, filming, TikTok Live and more. If it is not listed, just ask.'],
    ['Are the prices final?','Quote builder prices are estimates. Your final price is confirmed in a written proposal before any work starts.']
  ];
  var fl=document.getElementById('faqList');if(fl)fl.innerHTML=F.map(function(f,i){return '<div class="fq rv'+(i===0?' open':'')+'"><button type="button" aria-expanded="'+(i===0)+'">'+f[0]+'<i></i></button><div class="a"><div><p>'+f[1]+'</p></div></div></div>'}).join('');
  document.querySelectorAll('.fq').forEach(function(q){io.observe(q);q.querySelector('button').onclick=function(){var o=q.classList.toggle('open');this.setAttribute('aria-expanded',o)}});

  // form submit (Netlify Forms)
  var form=document.getElementById('enq');
  if(form)form.addEventListener('submit',function(e){
    e.preventDefault();
    var btn=form.querySelector('button[type=submit]');btn.disabled=true;btn.firstChild.textContent='Sending… ';
    fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()})
      .then(function(r){if(!r.ok)throw 0;document.getElementById('formBox').classList.add('sent')})
      .catch(function(){btn.disabled=false;btn.firstChild.textContent='Send my enquiry ';alert('Sorry, that did not send. Please email info@monos.ai.')});
  });
})();
// ===== SPIN TO WIN =====
(function(){
  var box=document.getElementById('spin');if(!box)return;
  var P=[['£50 off','any website',18,'#D23B2C','#fff'],['3 months','free hosting',18,'#0B0B0C','#f3d68a'],['10% off','any website',12,'#f3d68a','#1a1204'],['Free call','20 mins with Aisha',18,'#D23B2C','#fff'],['Free teaser','trailer',16,'#0B0B0C','#fff'],['Free poster','design',18,'#f3d68a','#1a1204']];
  var svg=document.getElementById('wheel'),n=P.length,seg=360/n,ns='http://www.w3.org/2000/svg',h='';
  var pt=function(a,r){a=(a-90)*Math.PI/180;return [(r*Math.cos(a)).toFixed(2),(r*Math.sin(a)).toFixed(2)]};
  P.forEach(function(p,i){var a0=i*seg,a1=a0+seg,s=pt(a0,104),e=pt(a1,104),m=a0+seg/2;
    h+='<path d="M0 0L'+s[0]+' '+s[1]+'A104 104 0 0 1 '+e[0]+' '+e[1]+'Z" fill="'+p[3]+'" stroke="#2a2a2e" stroke-width="1"/>';
    h+='<g transform="rotate('+m+')"><text x="0" y="-66" text-anchor="middle" fill="'+p[4]+'" style="font:400 14px Anton,Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase">'+p[0]+'</text><text x="0" y="-52" text-anchor="middle" fill="'+p[4]+'" opacity=".85" style="font:700 7.5px \'Red Hat Display\',sans-serif">'+p[1]+'</text></g>'});
  for(var k=0;k<24;k++){var d=pt(k*15,99);h+='<circle cx="'+d[0]+'" cy="'+d[1]+'" r="2" fill="#f3d68a" opacity=".9"/>'}
  h='<circle r="108" fill="#f3d68a"/><circle r="105" fill="#1a1a1d"/>'+h;
  svg.innerHTML=h;
  var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  var fab=document.querySelector('.spin-fab');
  var open=function(){box.hidden=false;document.body.style.overflow='hidden';store.set('monosSpinSeen',Date.now());var prev=store.get('monosSpinWon');if(prev){showRes(JSON.parse(prev),true)}};
  var close=function(){box.hidden=true;document.body.style.overflow=''};
  document.querySelectorAll('[data-spin]').forEach(function(b){b.addEventListener('click',open)});
  box.querySelectorAll('[data-close]').forEach(function(b){b.addEventListener('click',close)});
  addEventListener('keydown',function(e){if(e.key==='Escape'&&!box.hidden)close()});
  setTimeout(function(){fab&&fab.classList.add('show')},2500);
  var seen=+(store.get('monosSpinSeen')||0),auto=Date.now()-seen>3*864e5&&!store.get('monosSpinWon');
  if(auto){var fired=false,fire=function(){if(fired)return;fired=true;open()};
    setTimeout(fire,18000);
    document.addEventListener('mouseout',function(e){if(!e.relatedTarget&&e.clientY<10)fire()});
    addEventListener('scroll',function(){if(scrollY>(document.body.scrollHeight-innerHeight)*.55)fire()},{passive:true})}
  function showRes(r,again){
    document.getElementById('spRes').innerHTML='<small>'+(again?'YOU ALREADY WON':'YOU WON')+'</small><div class="won">'+r.p+'</div><code>'+r.c+'</code><p>Screenshot your code. We\'ll email you to claim it, and you\'re in the draw for a free website.</p><a href="contact.html" class="btn btn-red">Work with us now <svg><use href="#arrow"/></svg></a>';
    box.classList.add('done')}
  var f=document.getElementById('spinForm'),rot=0;
  f.addEventListener('submit',function(e){e.preventDefault();
    var tot=P.reduce(function(a,p){return a+p[2]},0),x=Math.random()*tot,i=0;for(;i<n;i++){x-=P[i][2];if(x<0)break}if(i>=n)i=n-1;
    var label=P[i][0]+' '+P[i][1],code='MONOS-'+Math.random().toString(36).slice(2,6).toUpperCase();
    document.getElementById('spPrize').value=label;document.getElementById('spCode').value=code;document.getElementById('spPage').value=location.pathname;
    var btn=f.querySelector('button[type=submit]');btn.disabled=true;
    fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()}).catch(function(){});
    var target=360-(i*seg+seg/2)+(Math.random()-.5)*seg*.6;rot=rot+360*6+((target-rot%360)+360)%360;
    svg.style.transform='rotate('+rot+'deg)';
    var r={p:label,c:code};store.set('monosSpinWon',JSON.stringify(r));
    setTimeout(function(){showRes(r,false)},5200)});
})();

/* industry reels: lazy play in view, sound toggle */
(function(){var vs=document.querySelectorAll('.ind video');if(!vs.length)return;
var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){if(!v.src)v.src=v.dataset.src;var p=v.play();p&&p.catch(function(){})}else{v.pause()}})},{threshold:.35}):null;
vs.forEach(function(v){io?io.observe(v):(v.src=v.dataset.src)});
document.querySelectorAll('.ind .snd').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var v=b.parentNode.querySelector('video');var on=v.muted;
vs.forEach(function(o){o.muted=true});document.querySelectorAll('.ind .snd').forEach(function(x){x.classList.remove('on');x.innerHTML='&#128263;'});
if(on){v.muted=false;v.play();b.classList.add('on');b.innerHTML='&#128266;'}})});})();
