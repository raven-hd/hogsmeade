const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{try{const p=path.join(root,new URL(req.url,'http://localhost').pathname);res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.json':'application/json','.css':'text/css','.woff2':'font/woff2'})[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p));}catch{res.writeHead(404).end();}});
let checks=0;function ok(v,m){assert.ok(v,m);checks++;console.log('ok · '+m);}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||path.resolve('test-runtime/chromium'),args:JSON.parse(process.env.CHROMIUM_ARGS_JSON||'["--no-sandbox","--disable-gpu","--no-zygote","--single-process","--use-gl=angle","--use-angle=swiftshader","--disable-dev-shm-usage"]')});
 const context=await browser.newContext({viewport:{width:720,height:1000}}),errors=[];
 await context.route('**/*',route=>{
  const req=route.request(),u=new URL(req.url());if(u.origin===base)return route.continue();
  if(u.hostname!=='api.github.com')return route.abort();
  if(req.method()!=='GET')return route.fulfill({status:403,body:'{}'});
  const p=u.pathname.split('/contents/')[1];
  try{return route.fulfill({json:{sha:'fixture-'+p,encoding:'base64',content:fs.readFileSync(path.join(root,p)).toString('base64')}});}catch{return route.fulfill({status:404,body:'{}'});}
 });
 async function open(shop){const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());await p.goto(base+'/'+shop+'/index.html');await p.waitForFunction(()=>App.UserCloud?.initialized);return p;}
 try {
  const p=await open('under-the-raven-wing');await p.waitForFunction(()=>!!document.querySelector('#deliveryDesignBar'));
  const old=process.env.BASELINE_MESSAGE_FILE?fs.readFileSync(process.env.BASELINE_MESSAGE_FILE,'utf8'):null;
  const legacy=await p.evaluate(code=>{
   App.State.templates=[{id:'fixture',name:'fixture',fields:[{id:'name',name:'название',enabled:true}],contexts:{delivery_hogsmeade:{cardTemplate:'CARD {{name}}'},delivery_hogwarts:{cardTemplate:'CARD {{name}}'}}}];
   App.State.products=[1,2].map(id=>({id,shop:App.State.currentShop,name:'товар '+id,sku:'SV-99999'+id,templateId:'fixture',fieldData:{name:'товар '+id}}));App.State.selectedProducts=[1,2];App.State.users=[{name:'Тест',hogsmeadeId:'123',hogwartsId:'456'}];
   const next=App.Message,results=[];
   if(code)for(const profile of ['hogsmeade','hogwarts'])for(const names of [true,false])for(const note of ['записка','']){
    App.State.currentDeliveryProfileId=profile;document.getElementById('recipient').value=names?'Тест':'';document.getElementById('sender').value='';document.getElementById('note').value=note;
    next.update();const actual=document.getElementById('output').textContent;(0,eval)(code);App.Message.update();results.push(actual===document.getElementById('output').textContent);App.Message=next;
   }
   return {same:results.every(Boolean),stored:App.Workspace.getSettings().deliveryDesigns};
  },old);
  if(old)ok(legacy.same,'legacy deliveries remain byte-identical across forums, missing names and empty notes');
  ok(legacy.stored==null,'opening the app does not migrate design storage');
  await p.evaluate(()=>{App.State.currentDeliveryProfileId='hogsmeade';document.getElementById('recipient').value='Тест';document.getElementById('note').value='записка';App.DeliveryDesigns.renderBar();App.Message.update();});
  const original=await p.locator('#output').textContent();
  await p.locator('#deliveryDesignBar button').click();await p.locator('#design_header').fill('UNSAVED {{RECIPIENT}}');
  ok(await p.locator('#output').textContent()===original,'draft edits do not change active deliveries');
  ok(await p.evaluate(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented;}),'unsaved design draft protects page close');
  await p.getByRole('button',{name:'отмена',exact:true}).last().click();
  ok(await p.locator('#output').textContent()===original,'cancel preserves the active design');
  await p.locator('#deliveryDesignBar button').click();await p.locator('#designName').fill('новая лавка');await p.locator('#deliveryDesignEditor summary').click();
  for(const [id,value] of Object.entries({header:'HEADER {{RECIPIENT}} / {{SENDER}}\n',note:'NOTE {{NOTE}}\n',productBlock:'{{PRODUCT}}',separator:'|SEP|',footer:'FOOTER'}))await p.locator('#design_'+id).fill(value);
  await p.locator('#design_notePosition').selectOption('after');
  const preview=await p.locator('#designPreview').inputValue();
  ok(preview.indexOf('NOTE ')>preview.lastIndexOf('CARD '),'preview puts the note after two cards');
  await p.getByRole('button',{name:'сохранить как новое',exact:true}).click();
  const output=await p.locator('#output').textContent();
  ok(output.includes('CARD товар 1|SEP|CARD товар 2NOTE записка\nFOOTER')&&(output.match(/HEADER/g)||[]).length===1&&(output.match(/NOTE /g)||[]).length===1,'real delivery uses one header, one note after all cards and a custom separator');
  ok(output.includes('[mention=123]Тест[/mention]'),'changing a design keeps the correct forum user ID');
  ok(await p.evaluate(()=>App.DeliveryDesigns.library().items.length===2),'save as new preserves the original');
  await p.evaluate(()=>App.UI.setVersion('hogwarts'));
  ok((await p.locator('#output').textContent()).includes('[mention=456]Тест[/mention]')&&!(await p.locator('#output').textContent()).includes('HEADER '),'forum variants are independent and use their own user IDs');
  await p.evaluate(()=>App.UI.setVersion('hogsmeade'));const active=await p.evaluate(()=>App.DeliveryDesigns.library().activeId);
  await p.locator('#deliveryDesignBar select').selectOption('original');ok(!(await p.locator('#output').textContent()).includes('HEADER '),'selecting original restores the old delivery');
  await p.locator('#deliveryDesignBar select').selectOption(active);
  const saved=await p.evaluate(()=>{App.Storage.saveTemplates();App.Storage.saveProducts();return {settings:App.Cloud.normalize(App.Cloud.snapshot()).settings,package:App.DeliveryDesigns.exportPackage()};});
  ok(saved.settings.deliveryDesigns.activeId===active,'GitHub snapshot includes the current design and variants');
  ok(!('products' in saved.package)&&!('users' in saved.package)&&!('settings' in saved.package),'portable package excludes products, users and connection settings');
  await p.reload();await p.waitForFunction(()=>!!document.querySelector('#deliveryDesignBar'));
  ok(await p.locator('#deliveryDesignBar select').inputValue()===active,'selection persists after reload');
  await p.evaluate(()=>{App.Templates.openModal();App.Templates.edit('fixture');App.Templates.goToStep(3);App.Templates.switchStep3Tab('delivery_hogsmeade');});
  const pencil=p.locator('#step3_content_delivery_hogsmeade button[aria-label="редактировать оформление доставки"]');
  ok(await pencil.isVisible(),'step 3 exposes the design pencil');await pencil.click();await p.locator('#designName').fill('переименовано');await p.getByRole('button',{name:'сохранить изменения',exact:true}).click();
  ok(await p.locator('#step3_content_delivery_hogsmeade select option:checked').innerText()==='переименовано','saving refreshes step 3');
  ok(await p.evaluate(()=>App.State.tempTemplate.id==='fixture'),'shared editor preserves the card template draft');
  await p.evaluate(()=>App.Templates.closeModal());await p.setViewportSize({width:390,height:900});await p.locator('#deliveryDesignBar button').click();
  ok(await p.locator('#deliveryDesignEditor .modal').evaluate(el=>el.getBoundingClientRect().right<=innerWidth),'editor fits a narrow window');await p.getByRole('button',{name:'отмена',exact:true}).last().click();await p.setViewportSize({width:960,height:900});
  const before=await p.evaluate(()=>({products:JSON.stringify(App.State.products),users:JSON.stringify(App.State.users),templates:App.State.templates.length}));
  await p.evaluate(data=>App.DeliveryDesigns.importPackage(data),saved.package);
  const imported=await p.evaluate(()=>({products:JSON.stringify(App.State.products),users:JSON.stringify(App.State.users),templates:App.State.templates.length}));
  ok(before.products===imported.products&&before.users===imported.users&&imported.templates===before.templates+1,'import adds cards without changing products or people');
  ok(await p.evaluate(()=>App.State.templates.filter(t=>t.id==='fixture').length===1),'ID collisions preserve existing card bindings');
  const rollback=await p.evaluate(data=>{
   const before=JSON.stringify(App.Workspace.getSettings()),templates=JSON.stringify(App.State.templates),write=App.Storage.write;let n=0;
   App.Storage.write=function(){if(++n===2)throw Error('quota');return write.apply(this,arguments);};
   try{App.DeliveryDesigns.importPackage(data);}catch(_){}finally{App.Storage.write=write;}
   return before===JSON.stringify(App.Workspace.getSettings())&&templates===JSON.stringify(App.State.templates)&&localStorage.getItem(App.Config.STORAGE_KEYS.TEMPLATES)===templates;
  },saved.package);ok(rollback,'failed import rolls back storage and memory');
  const peach=await open('rich-peach');await peach.waitForFunction(()=>!!document.querySelector('#deliveryDesignBar'));
  ok(await peach.evaluate(()=>App.Workspace.getSettings().deliveryDesigns==null),'another shop does not inherit raven designs');
  await peach.evaluate(data=>App.DeliveryDesigns.importPackage(data),saved.package);
  ok(await peach.evaluate(()=>!!App.DeliveryDesigns.resolve(App.getCurrentDeliveryProfile(),'peach')),'package works in another shop');
  ok(await peach.evaluate(()=>{try{App.DeliveryDesigns.validate({activeId:'x',items:[{id:'x',name:'x',variants:{hogsmeade:{header:3}}}]});return false;}catch(_){return true;}}),'invalid imported blocks are rejected');
  ok(errors.length===0,'all flows run without JavaScript errors');console.log('PASS '+checks+' checks');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
