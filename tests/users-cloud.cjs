const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const vm = require('node:vm');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const seed = JSON.parse(fs.readFileSync(path.join(root, 'shared/users.json')));
const server = http.createServer((req, res) => {
  const name = path.join(root, decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  try {
    res.setHeader('Content-Type', ({'.js':'text/javascript','.html':'text/html','.json':'application/json','.css':'text/css','.woff2':'font/woff2'})[path.extname(name)] || 'application/octet-stream');
    res.end(fs.readFileSync(name));
  } catch { res.writeHead(404).end(); }
});
let checks = 0;
function ok(value, message) { assert.ok(value, message); checks++; console.log('ok · ' + message); }
const u = (name, id = '') => ({name, hogsmeadeId:id});
const env = {App:{}, navigator:{}, TextEncoder, TextDecoder, structuredClone, Map, Set, Object, JSON};
vm.createContext(env); vm.runInContext(fs.readFileSync(path.join(root, 'shared/cloud.js'), 'utf8'), env);
env.App.Backup = {validateUsers: x => { if (!Array.isArray(x)) throw Error('bad users'); }};
const uc = env.App.UserCloud;
const n = x => uc.normalize(x), merge = (b,l,r) => uc.merge(b && n(b),n(l),n(r));
ok(merge([], [u('one')], [u('two')]).length === 2, 'simultaneous additions are merged');
ok(merge([u('one'),u('two')], [u('one','1'),u('two')], [u('one'),u('two','2')]).every(x=>x.hogsmeadeId), 'edits to different people are merged');
assert.throws(()=>merge([u('one')],[u('one','1')],[u('one','2')])); checks++;
assert.throws(()=>merge([u('one')],[],[u('one','2')])); checks++;
ok(merge([u('one')],[],[u('one')]).length===0,'deletion survives against unchanged remote');
ok(merge(null,[u('local')],[u('remote')]).length===2,'first migration keeps existing browser-only users');
assert.throws(()=>merge(null,[u('same','1')],[u('same','2')])); checks++;
assert.throws(()=>n([u('Same'),u('same')])); checks++;
ok(uc.equal(n([u('one')]),n([{name:'one',hogsmeadeId:'',addrHogwarts:''}])),'old omitted fields do not cause false conflicts');

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON||'["--no-sandbox"]')});
  let doc=structuredClone(seed), revision=1, writes=0, apiOffline=false, missingSeed=false, rejectWrite=0, raceWrite=false, delayedWrite=null;
  const errors=[], deviceServers=[];
  async function context(width=720){
    // --single-process shares the browser storage partition between contexts.
    // Separate origins are required to faithfully model independent devices here.
    const deviceServer=http.createServer(server.listeners('request')[0]);
    await new Promise(r=>deviceServer.listen(0,'127.0.0.1',r));deviceServers.push(deviceServer);
    const deviceBase='http://127.0.0.1:'+deviceServer.address().port;
    const c=await browser.newContext({viewport:{width,height:1000}});
    c.deviceBase=deviceBase;
    await c.route('**/*',async route=>{
      const req=route.request(),url=new URL(req.url());
      if(url.origin===deviceBase){if(missingSeed&&url.pathname==='/shared/users.json')return route.fulfill({status:404,body:'{}'});return route.continue();}
      if(url.hostname!=='api.github.com')return route.abort();
      if(apiOffline)return route.abort();
      if(url.pathname.endsWith('/shared/users.json')){
        if(missingSeed)return route.fulfill({status:404,body:'{}'});
        if(req.method()==='PUT'){
          writes++;const body=req.postDataJSON();
          if(rejectWrite)return route.fulfill({status:rejectWrite,body:'{}'});
          if(raceWrite){raceWrite=false;doc.users.push(u('remote race','99'));revision++;return route.fulfill({status:409,body:'{}'});}
          if(body.sha!=='users-'+revision)return route.fulfill({status:409,body:'{}'});
          if(delayedWrite){const fn=delayedWrite;delayedWrite=null;await fn();}
          doc=JSON.parse(Buffer.from(body.content,'base64').toString('utf8'));revision++;
          return route.fulfill({json:{content:{sha:'users-'+revision}}});
        }
        return route.fulfill({json:{encoding:'base64',sha:'users-'+revision,content:Buffer.from(JSON.stringify(doc)).toString('base64')}});
      }
      const shop=url.pathname.match(/contents\/(rich-peach|under-the-raven-wing|cafeteria)\/data.json$/)?.[1];
      if(shop){const content=fs.readFileSync(path.join(root,shop,'data.json'),'utf8');return route.fulfill({json:{sha:'catalog',encoding:'base64',content:Buffer.from(content).toString('base64')}});}
      return route.fulfill({status:404,body:'{}'});
    });
    return c;
  }
  async function open(c,shop='rich-peach'){
    const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
    await p.goto(c.deviceBase+'/'+shop+'/index.html');await p.waitForFunction(()=>App.UserCloud?.initialized);
    return p;
  }
  async function add(p,name,id){await p.evaluate(({name,id})=>{App.State.users.push({name,hogsmeadeId:id});App.Storage.saveUsers();},{name,id});}
  async function save(p){await p.evaluate(async()=>{clearTimeout(App.UserCloud.timer);await App.UserCloud.save();clearTimeout(App.UserCloud.timer);});}
  try{
    const c1=await context(),p=await open(c1);
    ok(await p.evaluate(()=>App.State.users.length)===53,'new browser automatically receives all 53 recovered people');
    ok(await p.evaluate(()=>!App.UserCloud.dirty()),'initial load is clean without a token');
    await p.evaluate(()=>App.Users.openModal());
    ok((await p.locator('#usersCloudStatus').textContent()).includes('сохранено на github'),'compact address-book modal shows confirmed cloud status');
    ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'720px layout stays within the window');
    await add(p,'pending local','81');
    await p.waitForTimeout(1150);
    ok(writes===0 && (await p.locator('#usersCloudStatus').textContent()).includes('подключите токен'),'without token edits stay local and clearly request connection');
    // Use the actual connection UI, so token acceptance must trigger the queued save.
    await p.evaluate(()=>App.Images.openSettings());await p.locator('#ghToken').fill('test-token');await p.locator('#ghSave').click();
    await p.waitForFunction(()=>!App.UserCloud.dirty()&&!App.UserCloud.busy);
    ok(doc.users.some(x=>x.name==='pending local'),'connecting the image-upload token sends pending users automatically');
    ok(!JSON.stringify(await p.evaluate(()=>({...localStorage}))).includes('test-token'),'token is never persisted in browser storage');
    const c2=await context(390),p2=await open(c2,'under-the-raven-wing');
    ok(await p2.evaluate(()=>App.State.users.some(x=>x.name==='pending local')),'another device and shop automatically see the saved person');
    await p2.evaluate(()=>App.Users.openModal());
    ok(await p2.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'390px layout stays compact');
    // Two devices made changes from the same old version.
    await add(p,'device one','82');await save(p);
    await add(p2,'device two','83');await p2.evaluate(()=>App.Images.token='other-test-token');await save(p2);
    ok(['device one','device two'].every(name=>doc.users.some(u=>u.name===name)),'stale second device preserves additions made on the first');
    await p.evaluate(()=>App.UserCloud.load());
    const editName=doc.users[0].name;
    await p.evaluate(name=>{App.State.users.find(u=>u.name===name).hogwartsId='900111';App.Storage.saveUsers();},editName);await save(p);
    await p2.evaluate(name=>{App.State.users.find(u=>u.name===name).hogwartsId='900222';App.Storage.saveUsers();},editName);
    await save(p2);
    ok(await p2.evaluate(()=>App.UserCloud.conflict),'same-person conflict is detected');
    ok(doc.users.find(u=>u.name===editName).hogwartsId==='900111' && await p2.evaluate(name=>App.State.users.find(u=>u.name===name).hogwartsId,editName)==='900222','conflict preserves both remote version and local draft');
    await p2.evaluate(()=>App.UserCloud.load());
    ok(await p2.evaluate(()=>!!localStorage.getItem(App.UserCloud.recoveryKey)),'confirmed conflict resolution keeps a local recovery copy');
    await add(p,'409 local','84');raceWrite=true;await save(p);
    ok(doc.users.some(u=>u.name==='409 local')&&doc.users.some(u=>u.name==='remote race'),'409 retry re-reads and merges instead of overwriting');
    let release,started;const startedPromise=new Promise(r=>started=r);const hold=new Promise(r=>release=r);
    delayedWrite=()=>{started();return hold;};await add(p,'in flight one','85');
    const saving=save(p);await startedPromise;await add(p,'in flight two','86');release();await saving;
    ok(await p.evaluate(()=>App.UserCloud.dirty()),'edits during upload remain dirty after its response');
    await save(p);ok(doc.users.some(u=>u.name==='in flight two'),'next upload includes edits made during the previous request');
    const peer=await open(c1,'cafeteria');await add(p,'other tab','87');await save(p);
    await peer.waitForFunction(()=>App.State.users.some(u=>u.name==='other tab'));
    ok(await peer.evaluate(()=>!App.UserCloud.dirty()),'other open shop tab sees saved people without inventing unsaved changes');
    await add(p,'permission pending','88');rejectWrite=403;await save(p);
    ok(await p.evaluate(()=>App.UserCloud.dirty())&&(await p.locator('#usersCloudStatus').textContent()).includes('нет права'),'failed write remains local and never claims success');rejectWrite=0;
    await save(p);
    apiOffline=true;await p.reload();await p.waitForFunction(()=>App.UserCloud?.initialized);
    ok(await p.evaluate(()=>App.State.users.some(u=>u.name==='permission pending')),'offline start preserves the newest browser copy over older bundled seed');
    const fresh=await context(),pf=await open(fresh);
    ok(await pf.evaluate(()=>App.State.users.length)===53,'fresh offline browser can load the built-in Pages seed');
    apiOffline=false;
    await p.evaluate(()=>{App.Images.token='ui-test-token';App.Users.openModal();});
    await p.locator('#newUserName').fill('UI person');await p.locator('#newUserHogsmeade').fill('123456');await p.locator('#saveUserBtn').click();
    await p.waitForFunction(()=>!App.UserCloud.dirty()&&!App.UserCloud.busy);
    ok(doc.users.some(u=>u.name==='UI person'&&u.hogsmeadeId==='123456'),'adding a user through the real form automatically saves it');
    missingSeed=true;const beforeMissing=writes;
    await add(p,'no public seed','89');await save(p);
    ok(writes===beforeMissing&&await p.evaluate(()=>App.UserCloud.dirty()),'without the initial shared file no automatic publication or file creation is possible');
    missingSeed=false;
    // Storage failure must roll back data and baseline together.
    ok(await p.evaluate(()=>{
      const original=Storage.prototype.setItem,old=localStorage.getItem(App.Config.STORAGE_KEYS.USERS);
      Storage.prototype.setItem=function(k,v){if(k===App.UserCloud.metaKey)throw Error('quota');return original.call(this,k,v);};
      let threw=false;try{App.UserCloud.install([],{sha:'bad',users:[]});}catch{threw=true;}finally{Storage.prototype.setItem=original;}
      return threw&&localStorage.getItem(App.Config.STORAGE_KEYS.USERS)===old;
    }),'failed baseline storage cannot erase the address book');
    ok(errors.length===0,'all shops initialize and synchronize without JavaScript errors');
    console.log('PASS '+checks+' checks');
  }finally{await browser.close();deviceServers.forEach(s=>s.close());server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
