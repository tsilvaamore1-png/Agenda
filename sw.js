// Red primero (las actualizaciones se ven al recargar) + avisos push
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open('agenda-v1').then(x=>x.put(e.request,c)).catch(()=>{});return r}).catch(()=>caches.match(e.request)))});
self.addEventListener('push',e=>{
  let d={};try{d=e.data.json()}catch(_){d={title:'Agenda',body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'Agenda',{body:d.body||'',tag:d.tag}))});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():self.clients.openWindow('./')))});
