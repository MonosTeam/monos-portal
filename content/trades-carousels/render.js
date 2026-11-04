// node render.js  -> out/<id>.jpg (1080x1350 at DPR 2 = 2160x2700). Needs img/<key>.jpg from photos.json.
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{fs.mkdirSync('out',{recursive:true});const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:2});
await p.goto('file://'+process.cwd()+'/trades.html',{waitUntil:'networkidle'});await p.waitForTimeout(1500);
for(const s of await p.$$('section')){const id=await s.getAttribute('id');await s.screenshot({path:`out/${id}.jpg`,type:'jpeg',quality:92});}
await b.close();})();
