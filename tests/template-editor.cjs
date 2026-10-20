const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{try{const p=path.join(root,new URL(req.url,'http://localhost').pathname);res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.json':'application/json','.css':'text/css','.woff2':'font/woff2'})[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p));}catch{res.writeHead(404).end();}});
let checks=0;function ok(v,m){assert.ok(v,m);checks++;console.log('ok · '+m);}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON||'["--no-sandbox"]')});
 const context=await browser.newContext({viewport:{width:720,height:1000}}),errors=[];
 await context.route('**/*',route=>{
  const req=route.request(),u=new URL(req.url());if(u.origin===base)return route.continue();
  if(u.hostname!=='api.github.com')return route.abort();
  if(req.method()!=='GET')return route.fulfill({status:403,body:'{}'});
  const p=u.pathname.split('/contents/')[1];
  try{return route.fulfill({json:{sha:'fixture-'+p,encoding:'base64',content:fs.readFileSync(path.join(root,p)).toString('base64')}});}catch{return route.fulfill({status:404,body:'{}'});}
 });
 async function open(shop){const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());await p.goto(base+'/'+shop+'/index.html');await p.waitForFunction(()=>App.UserCloud?.initialized);return p;}
 try{
  const p=await open('under-the-raven-wing');
  ok(await p.evaluate(()=>[App.Config.DEFAULT_PRODUCT_CARD_TEMPLATE,App.Config.DEFAULT_CATALOG_CARD_TEMPLATE].every(s=>(s.match(/\[center\]/g)||[]).length===(s.match(/\[\/center\]/g)||[]).length)),'new default cards have balanced center tags');
  if(process.env.BASELINE_MESSAGE_FILE){
   const old=fs.readFileSync(process.env.BASELINE_MESSAGE_FILE,'utf8');
   for(const [page,label] of [[p,'raven'],[await open('rich-peach'),'peach']]){
    const comparison=await page.evaluate(code=>{App.State.selectedProducts=App.State.products.map(p=>p.id);const next=App.Message,actual=next.generateCatalog();(0,eval)(code);const expected=App.Message.generateCatalog();App.Message=next;const withoutEmptyRows=text=>text.replace(/\[tr\]\n(?:\[tdt=transparent\]\[\/tdt\]\n)+\[\/tr\]\n/g,'');return {same:withoutEmptyRows(actual)===withoutEmptyRows(expected),products:App.State.products.length};},old);
    ok(comparison.same,'existing '+label+' cards and payments stay unchanged; empty price rows removed ('+comparison.products+' products)');
   }
  }
  await p.evaluate(()=>{App.Templates.openModal();App.Templates.showTemplateForm();});
  await p.locator('#wizardTemplateName').fill('проверка "карточки"');
  const indexes=await p.evaluate(()=>Object.fromEntries(App.State.tempTemplate.fields.map((f,i)=>[f.id,i])));
  for(const id of ['image','productType','composition','note1','note2'])await p.locator('#field_enabled_'+indexes[id]).uncheck();
  await p.locator('#wizardNextBtn').click();
  await p.locator('#ctx_card_catalog').fill('CAT {{name}} {{payment}}');
  await p.evaluate(()=>App.Templates.switchCtxTab('delivery_hogsmeade'));
  await p.locator('#ctx_card_delivery_hogsmeade').fill('HG {{name}} {{description}} {{composition}}');
  await p.locator('#opt_delivery_hogsmeade_label_template').fill('[more=Этикетка]{{label}}[/more]');
  await p.evaluate(()=>App.Templates.switchCtxTab('delivery_hogwarts'));
  await p.locator('#ctx_card_delivery_hogwarts').fill('HW {{name}} {{description}} {{composition}}');
  await p.locator('#opt_delivery_hogwarts_label_template').fill('[quote]{{label}}[/quote]');
  await p.locator('#wizardPrevBtn').click();await p.locator('#wizardNextBtn').click();
  ok(await p.locator('#ctx_card_delivery_hogwarts').inputValue()==='HW {{name}} {{description}} {{composition}}','back and next preserve edits in all forum tabs');
  ok(await p.locator('#ctx_card_catalog').inputValue()==='CAT {{name}} {{payment}}','delivery edits do not overwrite the catalog card');
  await p.locator('#wizardNextBtn').click();
  const hgPreview=await p.locator('#step3_preview_delivery_hogsmeade').inputValue(),hwPreview=await p.locator('#step3_preview_delivery_hogwarts').inputValue();
  ok(hgPreview.includes('HG ')&&hgPreview.includes('[more=Этикетка]')&&hwPreview.includes('HW ')&&hwPreview.includes('[quote]'),'delivery variants keep distinct cards and quote formatting');
  ok(!hgPreview.includes('{{composition}}')&&!hgPreview.includes('[СОСТАВ]'),'disabled fields disappear from the preview exactly as in actual delivery');
  ok((await p.locator('#step3_preview_catalog').inputValue()).includes('[pay to=217 comment=SV-001]10[/pay]'),'catalog preview renders payment with a sample SKU');
  await p.locator('#wizardSaveBtn').click();
  const id=await p.evaluate(()=>App.State.templates.at(-1).id);
  ok(await p.evaluate(id=>!App.Templates.getById(id).contexts.catalog.fullPreview,id),'example preview text is not saved as template data');
  await p.evaluate(id=>{
   const item={id:999999,sku:'SV-999',shop:'raven',name:'ПРИМЕР ТОВАРА',category:'свечи',group:'свечи',templateId:id,fieldData:{name:'ПРИМЕР ТОВАРА',description:'[ОПИСАНИЕ]',price:'10',label:'[ЭТИКЕТКА]',composition:'сохраненный состав'}};
   App.State.products=[item];App.State.selectedProducts=[item.id];App.State.catalogMode='delivery';App.State.currentDeliveryProfileId='hogsmeade';App.State.currentMode='hogsmeade';
   document.getElementById('recipient').value='Получатель';document.getElementById('recipientId').value='000';document.getElementById('sender').value='Отправитель';document.getElementById('senderId').value='000';document.getElementById('note').value='Текст записки';App.Message.update();
  },id);
  ok(await p.locator('#output').textContent()===hgPreview,'Hogsmeade delivery preview equals the actual generated message');
  await p.evaluate(()=>{App.State.currentDeliveryProfileId='hogwarts';App.State.currentMode='hogwarts';App.Message.update();});
  ok(await p.locator('#output').textContent()===hwPreview,'Hogwarts delivery preview equals the actual generated message');
  const prices=await p.evaluate(id=>{
   const t=App.Templates.getById(id),c=t.contexts.catalog;
   c.pricePlacement='auto';let inline=App.Message.generateCatalog();
   c.cardTemplate='CAT {{name}} {{price}}';let number=App.Message.generateCatalog();
   c.pricePlacement='row';let row=App.Message.generateCatalog();
   c.pricePlacement='card';c.cardTemplate='CAT {{name}}';let hidden=App.Message.generateCatalog();
   c.pricePlacement='auto';let legacy=App.Message.generateCatalog();
   return {inline,number,row,hidden,legacy};
  },id);
  ok((prices.inline.match(/\[pay /g)||[]).length===1&&!prices.inline.includes('[tdt=transparent]'),'inline payment is not duplicated in a separate table row');
  ok(!prices.number.includes('[pay ')&&prices.number.includes('10'),'inline plain price does not force an extra payment row');
  ok(prices.row.includes('[tdt=transparent]')&&(prices.row.match(/\[pay /g)||[]).length===1,'explicit price row remains available');
  ok(!prices.hidden.includes('[pay ')&&prices.legacy.includes('[pay '),'card-only mode can omit payment while legacy cards retain their payment row');
  ok(await p.evaluate(id=>{
   const t=App.Templates.getById(id);App.State.deliveryProfiles.push({id:'extra-forum',name:'другой форум',icon:'fa-solid fa-book',userField:'hogwartsId'});
   return App.Message.getTemplateContext(t,'delivery_extra-forum').cardTemplate.startsWith('HW ');
  },id),'a new forum inherits delivery formatting, never catalog formatting');
  await p.evaluate(()=>{
   App.State.users=[{name:'Получатель',hogsmeadeId:'123',hogwartsId:'456'}];App.State.currentDeliveryProfileId='hogsmeade';document.getElementById('recipientId').value='';App.Users.onRecipientInput();App.Message.update();
  });
  ok((await p.locator('#output').textContent()).includes('[mention=123]Получатель[/mention]'),'Hogsmeade automatically uses the Hogsmeade user ID');
  await p.evaluate(()=>{App.State.currentDeliveryProfileId='hogwarts';App.Users.refreshFieldHints();App.Message.update();});
  ok((await p.locator('#output').textContent()).includes('[mention=456]Получатель[/mention]'),'switching forums automatically uses that forum user ID');
  ok(await p.evaluate(id=>{const t=App.Templates.getById(id);t.fields.find(f=>f.id==='label').enabled=false;return App.Message.generateFieldBBCode(t,{label:'old label'},'label','delivery_hogsmeade')==='';},id),'disabled optional field is hidden even when old product data exists');
  await p.evaluate(()=>{App.Templates.closeModal();App.Products.edit(999999);});
  ok(await p.locator('#field_composition').count()===0,'disabled composition is not requested in the product form');
  await p.evaluate(()=>App.Products.saveProduct());
  ok(await p.evaluate(()=>App.State.products[0].fieldData.composition==='сохраненный состав'),'editing a product preserves temporarily disabled field values');
  await p.evaluate(id=>{App.Templates.openModal();App.Templates.edit(id);},id);
  ok(await p.locator('#wizardTemplateName').inputValue()==='проверка "карточки"','quoted template names survive reopening the editor');
  ok(await p.evaluate(id=>App.Cloud.normalize(App.Cloud.snapshot()).templates.find(t=>t.id===id).contexts.catalog.pricePlacement==='auto',id),'GitHub catalog normalization preserves the new price placement setting');
  await p.setViewportSize({width:390,height:900});await p.evaluate(()=>{App.Templates.goToStep(2);App.Templates.switchCtxTab('catalog');});
  ok(await p.locator('#ctx_price_catalog').evaluate(el=>el.getBoundingClientRect().width>0&&el.getBoundingClientRect().width<=el.closest('.ctx-tab-content').getBoundingClientRect().width),'price control fits a narrow window');
  ok(errors.length===0,'template editing and generation produce no JavaScript errors');
  console.log('PASS '+checks+' checks');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
