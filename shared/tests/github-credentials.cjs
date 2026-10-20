const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'hogsmeade-credentials-'));
const TOKEN='fixture-device-credential',TEMP='fixture-session-credential';
const server=http.createServer((req,res)=>{
  const file=path.join(root,new URL(req.url,'http://localhost').pathname);
  try{res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}
  catch{res.writeHead(404).end();}
});
let checks=0;
function ok(value,message){assert.ok(value,message);checks++;console.log('ok · '+message);}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port;
  const errors=[],auth=[];
  let users=JSON.parse(fs.readFileSync(path.join(root,'shared/users.json'))),userRev=1;
  async function launch(){
    const c=await chromium.launchPersistentContext(profile,{headless:true,acceptDownloads:true,viewport:{width:720,height:1000},executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON||'["--no-sandbox"]')});
    await c.route('**/*',async route=>{
      const req=route.request(),url=new URL(req.url());
      if(url.origin===base)return route.continue();
      if(url.hostname!=='api.github.com')return route.abort();
      auth.push(req.headers().authorization||'');
      const isUsers=url.pathname.endsWith('/shared/users.json');
      if(isUsers&&req.method()==='PUT'){
        const b=req.postDataJSON();assert.equal(b.sha,'users-'+userRev);
        users=JSON.parse(Buffer.from(b.content,'base64'));userRev++;
        return route.fulfill({json:{content:{sha:'users-'+userRev}}});
      }
      const shop=url.pathname.match(/contents\/(rich-peach|under-the-raven-wing|cafeteria)\/data.json$/)?.[1];
      if(isUsers||shop){const data=isUsers?JSON.stringify(users):fs.readFileSync(path.join(root,shop,'data.json'),'utf8');return route.fulfill({json:{sha:isUsers?'users-'+userRev:'catalog',encoding:'base64',content:Buffer.from(data).toString('base64')}});}
      return route.fulfill({status:404,body:'{}'});
    });return c;
  }
  async function open(c,shop='rich-peach'){
    const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
    await p.goto(base+'/'+shop+'/index.html');await p.waitForFunction(()=>App.UserCloud?.initialized);return p;
  }
  async function settings(p){await p.evaluate(()=>App.Images.openSettings());}
  async function connect(p,token,remember){await settings(p);await p.locator('#ghToken').fill(token);await p.locator('#ghRemember').setChecked(remember);await p.locator('#ghSave').click();}
  let context;
  try{
    context=await launch();let p=await open(context);
    await connect(p,TEMP,false);
    ok(await p.evaluate(()=>!!App.Images.token&&!localStorage.getItem(App.Images.credentialKey())),'unchecked option keeps credentials only in memory');
    await p.reload();await p.waitForFunction(()=>App.UserCloud?.initialized);
    ok(await p.evaluate(()=>!App.Images.token),'temporary credential disappears on reload');
    await connect(p,TOKEN,true);
    ok(await p.evaluate(()=>App.Images.remembered&&!!localStorage.getItem(App.Images.credentialKey())),'checked option remembers the credential on this device');
    await settings(p);
    ok(await p.locator('#ghToken').inputValue()===''&&await p.locator('#ghRemember').isChecked(),'saved credential is not copied into the password field');
    await p.locator('#ghSave').click();
    ok(await p.evaluate(()=>App.Images.remembered),'saving unrelated settings with an empty password preserves the remembered credential');
    await context.close();context=await launch();auth.length=0;p=await open(context);
    ok(await p.evaluate(()=>App.Images.remembered&&!!App.Images.token),'credential survives closing and reopening the browser profile');
    ok(auth.length>=2&&auth.every(h=>h==='Bearer '+TOKEN),'credential is restored before catalog and user bootstrap requests');
    const raven=await open(context,'under-the-raven-wing'),cafe=await open(context,'cafeteria');
    ok(await raven.evaluate(()=>App.Images.remembered)&&await cafe.evaluate(()=>App.Images.remembered),'all three shops reuse the same repository connection');
    await p.evaluate(()=>{App.State.users.push({name:'credential autosave test',hogsmeadeId:'999999'});App.Storage.saveUsers();});
    await p.waitForFunction(()=>!App.UserCloud.dirty()&&!App.UserCloud.busy);
    ok(users.users.some(u=>u.name==='credential autosave test'),'remembered credential works for automatic user saving');
    const dlPromise=p.waitForEvent('download');await p.evaluate(()=>App.Backup.download());const dl=await dlPromise;
    const backup=fs.readFileSync(await dl.path(),'utf8');
    ok(!backup.includes(TOKEN)&&!backup.includes('delivery.v2.auth.github'),'full backup never contains the remembered credential or credential storage');
    ok(!(await p.evaluate(()=>JSON.stringify(App.Cloud.snapshot()))).includes(TOKEN),'public catalog document never includes the credential');
    await settings(p);await p.locator('#ghRepo').fill('another-repository');await p.locator('#ghSave').click();
    ok(await p.evaluate(()=>!App.Images.token&&!localStorage.getItem(App.Images.credentialKey())),'changing repositories never reuses the old repository credential');
    await settings(p);await p.locator('#ghRepo').fill('hogsmeade');await p.locator('#ghRemember').check();await p.locator('#ghSave').click();
    ok(await p.evaluate(()=>App.Images.remembered&&!!App.Images.token),'returning to the original repository restores its saved connection');
    await settings(p);await p.locator('#ghForget').click();
    await raven.waitForFunction(()=>!App.Images.token);await cafe.waitForFunction(()=>!App.Images.token);
    ok(await p.evaluate(()=>!App.Images.token&&!localStorage.getItem(App.Images.credentialKey())),'disconnect removes both memory and device credentials');
    ok(await raven.evaluate(()=>!App.Images.token)&&await cafe.evaluate(()=>!App.Images.token),'disconnect also clears credentials in other open shop tabs');
    await p.locator('#ghClose').click();await p.reload();await p.waitForFunction(()=>App.UserCloud?.initialized);
    ok(await p.evaluate(()=>!App.Images.token),'disconnected credential does not return after reload');
    await connect(p,TOKEN,true);await settings(p);await p.locator('#ghRemember').uncheck();await p.locator('#ghSave').click();
    ok(await p.evaluate(()=>!!App.Images.token&&!App.Images.remembered&&!localStorage.getItem(App.Images.credentialKey())),'unchecking removes persistent storage but keeps the current tab connected');
    await settings(p);await p.locator('#ghToken').fill(TOKEN);await p.locator('#ghRemember').check();
    await p.evaluate(()=>{window.testOriginalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('delivery.v2.auth.github.'))throw new DOMException('full','QuotaExceededError');return window.testOriginalSetItem.call(this,k,v);};});
    await p.locator('#ghSave').click();
    ok((await p.locator('#ghStatus').textContent()).includes('не удалось')&&await p.evaluate(()=>!App.Images.remembered),'storage failure remains visible and never claims the token was remembered');
    await p.evaluate(()=>Storage.prototype.setItem=window.testOriginalSetItem);await p.locator('#ghClose').click();
    await p.setViewportSize({width:390,height:900});await settings(p);
    ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'connection dialog stays within a 390px window');
    ok(errors.length===0,'reloads, switching shops and disconnect work without JavaScript errors');
    console.log('PASS '+checks+' checks');
  }finally{if(context)await context.close();server.close();fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
