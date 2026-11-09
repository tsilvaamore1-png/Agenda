// Reemplaza el guardado de Claude por Supabase: cuentas, sincronización en tiempo real y archivos.
(()=>{
if(!window.SUPABASE_URL||!window.SUPABASE_KEY){console.warn('Falta completar config.js');return}
const mk=window.mark||(()=>{});
try{const l=document.createElement('link');l.rel='preconnect';l.href=SUPABASE_URL;l.crossOrigin='';document.head.appendChild(l)}catch(e){}
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let S=null,ready=null;
const cache=new Map(),byCol=new Map(),lists=new Map(),ls=[];
let nT=0;const notify=()=>{if(nT)return;nT=setTimeout(()=>{nT=0;ls.forEach(f=>f())},40)};
let sT=0;const notifySoft=()=>{if(sT)return;sT=setTimeout(()=>{sT=0;notify()},700)};
const sub=f=>{ls.push(f);f();return()=>{const i=ls.indexOf(f);if(i>=0)ls.splice(i,1)}};
/* cache local: por ruta y por colección (listar una colección no recorre todo) */
const split=p=>{const i=p.indexOf('/');return i<0?['',p]:[p.slice(0,i),p.slice(i+1)]};
function setLocal(p,d){cache.set(p,d);const[c,id]=split(p);let m=byCol.get(c);if(!m)byCol.set(c,m=new Map());const o=m.get(id);if(o)o.d=d;else m.set(id,{id,d,data(){return this.d}});lists.delete(c)}
function delLocal(p){if(!cache.delete(p))return;const[c,id]=split(p),m=byCol.get(c);if(m)m.delete(id);lists.delete(c)}
const docs=c=>{let l=lists.get(c);if(!l){const m=byCol.get(c);l=m?[...m.values()]:[];lists.set(c,l)}return l};
let lastSync='';const bump=u=>{if(u&&u>lastSync)lastSync=u};
const put=(p,d,u)=>{setLocal(p,d);bump(u)};
/* guardado con reintento: si falla (sin señal), se reintenta solo y se avisa */
const outbox=new Map();let toastEl=null,flushT=0;
const toast=t=>{if(!t){if(toastEl){toastEl.remove();toastEl=null}return}
  if(!toastEl){toastEl=document.createElement('div');toastEl.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:calc(150px + env(safe-area-inset-bottom,0px));z-index:300;background:#d33;color:#fff;border-radius:16px;padding:9px 14px;font-size:13px;font-weight:600;max-width:90%;text-align:center';document.body.appendChild(toastEl)}
  toastEl.textContent=t};
const fatal=e=>e&&(e.code==='42501'||e.code==='PGRST301'||/permission|policy|jwt/i.test(e.message||''));
const stamp=(base,k)=>new Date(base+Math.floor(k/1000)).toISOString().replace('Z',String(k%1000).padStart(3,'0')+'Z');
async function send(p,o){return o.del?sb.from('kv').delete().match({agenda_id:S.agenda,path:p}):sb.from('kv').upsert({agenda_id:S.agenda,path:p,data:o.data,updated_at:new Date().toISOString()})}
async function flush(){flushT=0;for(const[p,o]of[...outbox]){let r;try{r=await send(p,o)}catch(e){r={error:e}}
    if(!r.error)outbox.delete(p);else if(fatal(r.error)){outbox.delete(p);toast('No tenés permiso para guardar cambios.');setTimeout(()=>toast(''),5000)}}
  if(outbox.size){toast('Sin conexión: se reintenta solo…');flushT=setTimeout(flush,8000)}else if(toastEl&&/Sin conexi/.test(toastEl.textContent))toast('')}
async function write(p,o){let r;try{r=await send(p,o)}catch(e){r={error:e}}
  if(r.error){console.error(r.error);if(fatal(r.error)){toast('No tenés permiso para guardar cambios.');setTimeout(()=>toast(''),5000);return}
    outbox.set(p,o);toast('Sin conexión: se reintenta solo…');if(!flushT)flushT=setTimeout(flush,8000)}else outbox.delete(p)}
const up=(p,o)=>write(p,{data:o});
addEventListener('online',()=>{if(outbox.size){clearTimeout(flushT);flush()}});
addEventListener('beforeunload',e=>{if(outbox.size){e.preventDefault();e.returnValue=''}});
const snapDoc=p=>({exists:cache.has(p),id:p.split('/').pop(),data:()=>cache.get(p)});
async function roleSync(uid,o){
  const m={agenda_id:S.agenda,user_id:uid};
  if(o.removed===true)await sb.from('members').update({role:'removed'}).match(m);
  else if(o.role==='viewer'||o.role==='admin')await sb.from('members').update({role:o.role}).match(m)}
const db={
  doc:p=>({
    get:async()=>snapDoc(p),
    set:async o=>{setLocal(p,o);notify();await up(p,o)},
    update:async o=>{const n={...(cache.get(p)||{}),...o};setLocal(p,n);notify();await up(p,n);if(p.startsWith('members/'))await roleSync(p.slice(8),o)},
    delete:async()=>{delLocal(p);notify();await write(p,{del:1})},
    onSnapshot:cb=>sub(()=>cb(snapDoc(p)))}),
  collection:c=>({get:async()=>({docs:docs(c)}),onSnapshot:cb=>sub(()=>cb({docs:docs(c)}))}),
  setMany:async items=>{if(!S||!items.length)return;const base=Date.now();items.forEach(([p,d])=>setLocal(p,d));notify();
    for(let i=0;i<items.length;i+=400){const rows=items.slice(i,i+400).map(([p,d],j)=>({agenda_id:S.agenda,path:p,data:d,updated_at:stamp(base,i+j)}));
      const r=await sb.from('kv').upsert(rows);if(r.error){console.error(r.error);throw r.error}}}};
const user={
  me:async()=>({id:S.user.id,name:S.user.email}),
  isOwner:async()=>S.owner,
  canEdit:async()=>S.role!=='viewer',
  profiles:async()=>({})};

const EYE='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
EYE0='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.9 17.9A10.9 10.9 0 0 1 12 19C5 19 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22"/></svg>';
const INP='width:100%;background:var(--card);border:1px solid transparent;border-radius:12px;padding:14px;margin-bottom:10px;color:var(--fg);font:inherit;outline:none';
const pwBox=(id,ph,ac)=>`<div style="position:relative"><input id="${id}" type="password" placeholder="${ph}" autocomplete="${ac}" style="${INP};padding-right:52px"><button type="button" data-eye="${id}" aria-label="Ver contraseña" style="position:absolute;right:4px;top:4px;width:44px;height:44px;border:0;background:none;color:var(--mute);cursor:pointer">${EYE}</button></div>`;
const wireEye=root=>root.querySelectorAll('[data-eye]').forEach(b=>b.onclick=()=>{const i=root.querySelector('#'+b.dataset.eye),v=i.type==='password';i.type=v?'text':'password';b.innerHTML=v?EYE0:EYE;b.setAttribute('aria-label',v?'Ocultar contraseña':'Ver contraseña')});
const REC=/type=recovery/.test(location.hash);
function newPass(cancelable){return new Promise(res=>{
  const B='width:100%;height:50px;border-radius:25px;border:0;font:inherit;font-weight:700;cursor:pointer;margin-bottom:10px';
  const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:99;background:var(--bg);color:var(--fg);display:flex;align-items:center;justify-content:center;padding:24px';
  d.innerHTML=`<div style="width:100%;max-width:340px;text-align:center"><h1 style="margin:0 0 6px;font-size:26px">Nueva contraseña</h1><p style="color:var(--mute);margin:0 0 20px">Elegí una de al menos 8 caracteres</p>${pwBox('np','Contraseña nueva','new-password')}<div id="ne" style="color:#d33;min-height:22px;font-size:14px"></div><button id="ns" style="${B};background:var(--y);color:var(--yfg)">Guardar</button>${cancelable?`<button id="nc" style="${B};background:var(--card);color:var(--fg)">Cancelar</button>`:''}</div>`;
  document.body.appendChild(d);wireEye(d);const q=i=>d.querySelector('#'+i);
  const go=async()=>{const v=q('np').value;if(v.length<8){q('ne').textContent='Mínimo 8 caracteres.';return}
    const r=await sb.auth.updateUser({password:v});if(r.error){q('ne').textContent=r.error.message;return}d.remove();res(true)};
  q('ns').onclick=go;d.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go()}});
  if(cancelable)q('nc').onclick=()=>{d.remove();res(false)}})}
async function login(){
  const g=await sb.auth.getSession();if(g.data.session)return g.data.session.user;
  return new Promise(res=>{
    const I='width:100%;background:var(--card);border:1px solid transparent;border-radius:12px;padding:14px;margin-bottom:10px;color:var(--fg);font:inherit;outline:none';
    const B='width:100%;height:50px;border-radius:25px;border:0;font:inherit;font-weight:700;cursor:pointer;margin-bottom:10px';
    const d=document.createElement('div');
    d.style.cssText='position:fixed;inset:0;z-index:99;background:var(--bg);color:var(--fg);display:flex;align-items:center;justify-content:center;padding:24px';
    d.innerHTML=`<div style="width:100%;max-width:340px;text-align:center"><h1 style="margin:0 0 6px;font-size:28px">Agenda</h1><p style="color:var(--mute);margin:0 0 20px">Entrá o creá tu cuenta</p><input id="lm" type="email" placeholder="Email" autocomplete="email" style="${I}">${pwBox('lp','Contraseña (mínimo 8)','current-password')}<div id="le" style="color:#d33;min-height:22px;font-size:14px"></div><button id="li" style="${B};background:var(--y);color:var(--yfg)">Entrar</button><button id="lc" style="${B};background:var(--card);color:var(--fg)">Crear cuenta</button><button id="lf" style="background:none;border:0;color:var(--mute);font:inherit;cursor:pointer;padding:6px">Olvidé mi contraseña</button></div>`;
    document.body.appendChild(d);wireEye(d);
    const q=i=>d.querySelector('#'+i),msg=t=>q('le').textContent=t;
    d.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();q('li').click()}});
    const done=u=>{d.remove();res(u)};
    q('li').onclick=async()=>{const r=await sb.auth.signInWithPassword({email:q('lm').value.trim(),password:q('lp').value});r.error?msg('Email o contraseña incorrectos.'):done(r.data.user)};
    q('lf').onclick=async()=>{const m=q('lm').value.trim();if(!m){msg('Escribí tu email arriba y volvé a tocar.');return}
      const r=await sb.auth.resetPasswordForEmail(m,{redirectTo:location.origin+location.pathname});msg(r.error?r.error.message:'Te mandamos un email para crear una contraseña nueva.')};
    q('lc').onclick=async()=>{if(q('lp').value.length<8){msg('La contraseña tiene que tener al menos 8 caracteres.');return}const r=await sb.auth.signUp({email:q('lm').value.trim(),password:q('lp').value});
      if(r.error)msg(r.error.message);else if(r.data.session)done(r.data.user);else msg('Revisá tu email para confirmar la cuenta y después entrá.')};
  })}

const AG='id,owner,invite_code,public_code,once_code';
const base=()=>location.origin+location.pathname.replace(/[^/]*$/,'');
function links(ag){window.AGENDA_LINK=location.origin+location.pathname+'?join='+ag.invite_code;window.PUBLIC_LINK=base()+'reservar.html?c='+ag.public_code;window.ONCE_LINK=ag.once_code?base()+'reservar.html?c='+ag.once_code:''}
async function pick(u){
  const code=new URLSearchParams(location.search).get('join');
  if(code){const j=await sb.rpc('join_agenda',{code});if(j.data){localStorage.setItem('ag',j.data);history.replaceState({},'',location.pathname)}else if(j.error)throw new Error('No se pudo usar el link de invitación.')}
  let id=localStorage.getItem('ag');
  const[mr,ar0]=await Promise.all([sb.from('members').select('agenda_id,role').eq('user_id',u.id),id?sb.from('agendas').select(AG).eq('id',id).maybeSingle():Promise.resolve({data:null})]);
  if(mr.error)throw new Error('No se pudo leer tu cuenta: '+mr.error.message);
  const ms=mr.data||[];let m=ms.find(x=>x.agenda_id===id),ag=m&&ar0.data&&ar0.data.id===id?ar0.data:null;
  if(!m&&ms[0]){m=ms[0];id=m.agenda_id;ag=null}
  if(!m){const c=await sb.rpc('create_agenda');if(c.error||!c.data)throw new Error('No se pudo crear la agenda.');id=c.data;m={role:'admin'};ag=null}
  localStorage.setItem('ag',id);
  if(!ag){let r=await sb.from('agendas').select(AG).eq('id',id).maybeSingle();if(r.error)r=await sb.from('agendas').select('id,owner,invite_code,public_code').eq('id',id).maybeSingle();ag=r.data;if(!ag)throw new Error('No se pudo leer la agenda: '+(r.error&&r.error.message))}
  S={agenda:id,user:u,owner:ag.owner===u.id,role:m.role};
  links(ag);window.AGENDA_OWNER=S.owner;window.USER_EMAIL=u.email||''}

/* Carga en etapas: primero lo mínimo para mostrar la agenda; el resto de turnos llega en segundo plano */
const z2=n=>String(n).padStart(2,'0'),iso=d=>d.getFullYear()+'-'+z2(d.getMonth()+1)+'-'+z2(d.getDate());
const RT=async f=>{let e;for(let i=0;i<3;i++){try{const r=await f();if(!r.error)return r;e=r.error}catch(x){e=x}await new Promise(s=>setTimeout(s,400*(i+1)))}throw new Error('Sin conexión con la agenda'+(e&&e.message?' ('+e.message+')':''))};
async function pages(build,soft){let last='';
  for(;;){const r=await RT(()=>{let q=build(sb.from('kv').select('path,data,updated_at').eq('agenda_id',S.agenda));if(last)q=q.gt('path',last);return q.order('path').limit(1000)});
    const rows=r.data||[];rows.forEach(x=>put(x.path,x.data,x.updated_at));soft?notifySoft():notify();
    if(rows.length<1000)return;last=rows[rows.length-1].path}}
let lo,hi;
async function loadRest(){try{await pages(q=>q.like('path','turnos/%').or('data->>fecha.lt.'+lo+',data->>fecha.gt.'+hi),true)}catch(e){console.error(e)}window.MORE_LOADED=true;notify();mk('completo')}
async function syncNew(){if(!S||!lastSync)return;
  try{for(let n=0;n<20;n++){const r=await sb.from('kv').select('path,data,updated_at').eq('agenda_id',S.agenda).gt('updated_at',lastSync).order('updated_at').limit(1000);if(r.error||!r.data)return;
      r.data.forEach(x=>put(x.path,x.data,x.updated_at));if(r.data.length)notify();if(r.data.length<1000)return}}catch(e){}}
async function reconcile(){if(!S)return;
  try{const seen=new Set();let last='';
    for(let n=0;n<50;n++){let q=sb.from('kv').select('path').eq('agenda_id',S.agenda).like('path','turnos/%').gte('data->>fecha',lo).lte('data->>fecha',hi);if(last)q=q.gt('path',last);
      const r=await q.order('path').limit(1000);if(r.error||!r.data)return;r.data.forEach(x=>seen.add(x.path));if(r.data.length<1000)break;last=r.data[r.data.length-1].path;if(n===49)return}
    let ch=false;const m=byCol.get('turnos');if(m)for(const[id,o]of[...m]){const p='turnos/'+id,f=o.d&&o.d.fecha;if(f>=lo&&f<=hi&&!seen.has(p)&&!outbox.has(p)){delLocal(p);ch=true}}
    if(ch)notify()}catch(e){}}

async function init(){
  const u=await login();mk('sesion');
  if(REC){await newPass(false);history.replaceState({},'',location.pathname)}
  await pick(u);mk('agenda');
  const t=new Date(),a=new Date(t);a.setDate(a.getDate()-31);const b=new Date(t);b.setDate(b.getDate()+92);lo=iso(a);hi=iso(b);
  await Promise.all([pages(q=>q.not('path','like','turnos/%').not('path','like','hist/%')),pages(q=>q.like('path','turnos/%').gte('data->>fecha',lo).lte('data->>fecha',hi))]);
  mk('turnos');
  sb.from('kv').select('path,data,updated_at').eq('agenda_id',S.agenda).like('path','hist/%').order('updated_at',{ascending:false}).limit(150).then(r=>{(r.data||[]).forEach(x=>put(x.path,x.data,x.updated_at));notify()});
  setTimeout(loadRest,300);
  let tick=0;const step=()=>{if(document.hidden||!S)return;syncNew();if(++tick%5===0)reconcile()};
  setInterval(step,30000);
  let hid=0;document.addEventListener('visibilitychange',()=>{if(document.hidden){hid=Date.now();return}syncNew();if(Date.now()-hid>20000)reconcile()});
  sb.channel('kv-'+S.agenda).on('postgres_changes',{event:'*',schema:'public',table:'kv',filter:'agenda_id=eq.'+S.agenda},p=>{
    if(p.eventType==='DELETE'){if(p.old&&p.old.path)delLocal(p.old.path)}else{put(p.new.path,p.new.data,p.new.updated_at)}
    notify()}).subscribe(st=>{if(st==='SUBSCRIBED')syncNew()})}

window.claude={use:async n=>{ready=ready||init();await ready;return n==='user'?user:n==='db'?db:null}};
window.logout=()=>sb.auth.signOut().then(()=>{localStorage.removeItem('ag');location.reload()});
window.deleteAccount=async()=>{try{if(S.owner){const l=(await sb.storage.from('notas').list(S.agenda,{limit:1000})).data||[];if(l.length)await sb.storage.from('notas').remove(l.map(x=>S.agenda+'/'+x.name))}const r=await sb.rpc('delete_my_account');if(r.error){alert('No se pudo eliminar: '+r.error.message);return}await sb.auth.signOut()}catch(e){console.error(e)}localStorage.clear();location.reload()};
const MAXF=10*1024*1024;
window.uploadFile=async f=>{if(f.size>MAXF){alert('El archivo pesa más de 10 MB.');return null}const path=S.agenda+'/'+Date.now()+'-'+f.name.replace(/[^\w.\-]/g,'_').slice(-80);const r=await sb.storage.from('notas').upload(path,f);return r.error?null:{name:f.name,path}};
window.openFile=async p=>{if(typeof p!=='string'||!p.startsWith(S.agenda+'/'))return;const r=await sb.storage.from('notas').createSignedUrl(p,300);if(r.data){const w=window.open(r.data.signedUrl,'_blank','noopener');if(!w)location.href=r.data.signedUrl}};
window.changePassword=()=>newPass(true);
const rot=async(fn,kind)=>{const r=await sb.rpc(fn,{a:S.agenda});if(r.error||!r.data)return null;if(kind==='i')window.AGENDA_LINK=location.origin+location.pathname+'?join='+r.data;else if(kind==='p')window.PUBLIC_LINK=base()+'reservar.html?c='+r.data;else window.ONCE_LINK=base()+'reservar.html?c='+r.data;return r.data};
window.rotateOnce=async()=>{const c=await rot('rotate_once_code','o');return c?window.ONCE_LINK:null};
window.rotateInvite=async()=>{const c=await rot('rotate_invite_code','i');return c?window.AGENDA_LINK:null};
window.rotatePublic=async()=>{const c=await rot('rotate_public_code','p');return c?window.PUBLIC_LINK:null};
window.savePush=async s=>{const j=s.toJSON(),r=await sb.from('push_subs').upsert({endpoint:j.endpoint,agenda_id:S.agenda,user_id:S.user.id,sub:j});if(r.error)console.error(r.error);return !r.error};
window.dropPush=async ep=>{await sb.from('push_subs').delete().eq('endpoint',ep)};
})();
