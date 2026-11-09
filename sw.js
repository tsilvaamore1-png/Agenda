// Abre al instante desde la copia guardada y se actualiza en segundo plano (avisa si hay versión nueva).
// También maneja los avisos push con acceso directo a WhatsApp.
const V='agenda-v2',CORE=['index.html','app.js','extra.js','shim.js','boot.js','config.js'],PRE=CORE.concat(['reservar.html','reservar.js','manifest.webmanifest','icon-192.png','icon-512.png','logo.jpg']);
const keyOf=u=>{u=new URL(u);u.search='';u.hash='';return u.href};
const isCore=u=>{const p=new URL(u).pathname;return p.endsWith('/')||CORE.some(f=>p.endsWith('/'+f))};
self.addEventListener('install',e=>{self.skipWaiting();
  e.waitUntil(caches.open(V).then(c=>Promise.all(PRE.map(f=>fetch(new Request(f,{cache:'no-store'})).then(r=>r.ok?c.put(keyOf(new URL(f,self.registration.scope).href),r):0).catch(()=>0)))))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const rq=e.request;
  if(rq.method!=='GET'||new URL(rq.url).origin!==location.origin)return;
  const k=keyOf(rq.url);
  e.respondWith((async()=>{
    const c=await caches.open(V),hit=await c.match(k);
    const net=fetch(rq,{cache:'no-store'}).then(async r=>{
      if(r.ok&&r.status===200){
        const old=hit&&(hit.headers.get('etag')||hit.headers.get('last-modified')),nw=r.headers.get('etag')||r.headers.get('last-modified');
        await c.put(k,r.clone());
        if(hit&&isCore(rq.url)&&old&&nw&&old!==nw)self.clients.matchAll().then(l=>l.forEach(x=>x.postMessage({t:'nueva'})))}
      return r}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return (await net)||Response.error()})())});
self.addEventListener('push',e=>{
  let d={};try{d=e.data.json()}catch(_){d={title:'Agenda',body:e.data?e.data.text():''}}
  const o={body:String(d.body||'').slice(0,300),tag:d.tag,data:{url:d.url||'',wa:d.wa||null}};
  if(Array.isArray(d.actions)&&d.actions.length)o.actions=d.actions.slice(0,2);
  e.waitUntil(self.registration.showNotification(String(d.title||'Agenda').slice(0,120),o))});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const d=e.notification.data||{};let url='';
  try{
    if(d.wa)url=new URL('./?wa='+encodeURIComponent(JSON.stringify(d.wa)),self.registration.scope).href;
    else if(d.url){const u=new URL(d.url,self.registration.scope);if(u.origin===location.origin)url=u.href}
  }catch(_){}
  e.waitUntil(url?self.clients.openWindow(url):self.clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():self.clients.openWindow('./')))});
