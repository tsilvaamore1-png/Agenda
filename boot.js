// Arranque mínimo: anti-clickjacking, service worker y aviso de versión nueva
(()=>{
try{if(top!==self)top.location=self.location}catch(e){document.documentElement.style.display='none'}
window.__t0=performance.now();window.__T={};
window.mark=k=>{window.__T[k]=Math.round(performance.now()-window.__t0)};
if('serviceWorker' in navigator){
  addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
  navigator.serviceWorker.addEventListener('message',e=>{
    if(!e.data||e.data.t!=='nueva'||document.getElementById('nvv'))return;
    const b=document.createElement('button');b.id='nvv';b.textContent='Hay una versión nueva · Tocá para actualizar';
    b.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:calc(10px + env(safe-area-inset-top,0px));z-index:300;border:0;border-radius:20px;padding:10px 16px;background:#fff;color:#000;font:inherit;font-size:14px;font-weight:700;box-shadow:0 6px 20px rgba(0,0,0,.35);cursor:pointer';
    b.onclick=()=>location.reload();document.body.appendChild(b)})}
})();
