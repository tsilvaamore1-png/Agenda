// Reemplaza el guardado de Claude por Supabase: cuentas, sincronización en tiempo real y archivos.
(()=>{
if(!window.SUPABASE_URL||!window.SUPABASE_KEY){console.warn('Falta completar config.js');return}
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let S=null,ready=null;const cache=new Map(),ls=[];
const notify=()=>ls.forEach(f=>f());
const sub=f=>{ls.push(f);f();return()=>ls.splice(ls.indexOf(f),1)};
const up=(p,o)=>sb.from('kv').upsert({agenda_id:S.agenda,path:p,data:o,updated_at:new Date().toISOString()}).then(r=>{if(r.error)console.error(r.error)});
const snapDoc=p=>({exists:cache.has(p),id:p.split('/').pop(),data:()=>cache.get(p)});
const docs=c=>[...cache].filter(([k])=>k.startsWith(c+'/')).map(([k,v])=>({id:k.slice(c.length+1),data:()=>v}));
async function roleSync(uid,o){
  const m={agenda_id:S.agenda,user_id:uid};
  if(o.removed===true)await sb.from('members').delete().match(m);
  else if(o.role==='viewer'||o.role==='admin')await sb.from('members').update({role:o.role}).match(m)}
const db={
  doc:p=>({
    get:async()=>snapDoc(p),
    set:async o=>{cache.set(p,o);notify();await up(p,o)},
    update:async o=>{const n={...(cache.get(p)||{}),...o};cache.set(p,n);notify();await up(p,n);if(p.startsWith('members/'))await roleSync(p.slice(8),o)},
    delete:async()=>{cache.delete(p);notify();await sb.from('kv').delete().match({agenda_id:S.agenda,path:p})},
    onSnapshot:cb=>sub(()=>cb(snapDoc(p)))}),
  collection:c=>({get:async()=>({docs:docs(c)}),onSnapshot:cb=>sub(()=>cb({docs:docs(c)}))})};
const user={
  me:async()=>({id:S.user.id,name:S.user.email}),
  isOwner:async()=>S.owner,
  canEdit:async()=>S.role!=='viewer',
  profiles:async()=>({})};

async function login(){
  const g=await sb.auth.getSession();if(g.data.session)return g.data.session.user;
  return new Promise(res=>{
    const I='width:100%;background:var(--card);border:1px solid transparent;border-radius:12px;padding:14px;margin-bottom:10px;color:var(--fg);font:inherit;outline:none';
    const B='width:100%;height:50px;border-radius:25px;border:0;font:inherit;font-weight:700;cursor:pointer;margin-bottom:10px';
    const d=document.createElement('div');
    d.style.cssText='position:fixed;inset:0;z-index:99;background:var(--bg);color:var(--fg);display:flex;align-items:center;justify-content:center;padding:24px';
    d.innerHTML=`<div style="width:100%;max-width:340px;text-align:center"><h1 style="margin:0 0 6px;font-size:28px">Agenda</h1><p style="color:var(--mute);margin:0 0 20px">Entrá o creá tu cuenta</p><input id="lm" type="email" placeholder="Email" autocomplete="email" style="${I}"><input id="lp" type="password" placeholder="Contraseña (mínimo 6)" autocomplete="current-password" style="${I}"><div id="le" style="color:#d33;min-height:22px;font-size:14px"></div><button id="li" style="${B};background:var(--y);color:#111">Entrar</button><button id="lc" style="${B};background:var(--card);color:var(--fg)">Crear cuenta</button></div>`;
    document.body.appendChild(d);
    const q=i=>d.querySelector('#'+i),msg=t=>q('le').textContent=t;
    d.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();q('li').click()}});
    const done=u=>{d.remove();res(u)};
    q('li').onclick=async()=>{const r=await sb.auth.signInWithPassword({email:q('lm').value.trim(),password:q('lp').value});r.error?msg('Email o contraseña incorrectos.'):done(r.data.user)};
    q('lc').onclick=async()=>{const r=await sb.auth.signUp({email:q('lm').value.trim(),password:q('lp').value});
      if(r.error)msg(r.error.message);else if(r.data.session)done(r.data.user);else msg('Revisá tu email para confirmar la cuenta y después entrá.')};
  })}

async function pick(u){
  const code=new URLSearchParams(location.search).get('join');
  if(code){const j=await sb.rpc('join_agenda',{code});if(j.data){localStorage.setItem('ag',j.data);history.replaceState({},'',location.pathname)}}
  const ms=(await sb.from('members').select('agenda_id,role').eq('user_id',u.id)).data||[];
  let id=localStorage.getItem('ag'),m=ms.find(x=>x.agenda_id===id);
  if(!m&&ms[0]){m=ms[0];id=m.agenda_id}
  if(!m){id=(await sb.rpc('create_agenda')).data;m={role:'admin'}}
  localStorage.setItem('ag',id);
  const ag=(await sb.from('agendas').select('owner,invite_code,public_code,once_code').eq('id',id).single()).data;
  S={agenda:id,user:u,owner:ag.owner===u.id,role:m.role};
  window.AGENDA_LINK=location.origin+location.pathname+'?join='+ag.invite_code;window.AGENDA_OWNER=S.owner;window.PUBLIC_LINK=location.origin+location.pathname.replace(/[^/]*$/,'')+'reservar.html?c='+ag.public_code;window.ONCE_LINK=location.origin+location.pathname.replace(/[^/]*$/,'')+'reservar.html?c='+ag.once_code}

async function init(){
  const u=await login();await pick(u);
  ((await sb.from('kv').select('path,data').eq('agenda_id',S.agenda).limit(10000)).data||[]).forEach(r=>cache.set(r.path,r.data));
  sb.channel('kv-'+S.agenda).on('postgres_changes',{event:'*',schema:'public',table:'kv',filter:'agenda_id=eq.'+S.agenda},p=>{
    if(p.eventType==='DELETE'){if(!p.old.agenda_id||p.old.agenda_id===S.agenda)cache.delete(p.old.path)}else cache.set(p.new.path,p.new.data);
    notify()}).subscribe()}

window.claude={use:async n=>{ready=ready||init();await ready;return n==='user'?user:n==='db'?db:null}};
window.logout=()=>sb.auth.signOut().then(()=>{localStorage.removeItem('ag');location.reload()});
window.deleteAccount=async()=>{try{if(S.owner){const l=(await sb.storage.from('notas').list(S.agenda,{limit:1000})).data||[];if(l.length)await sb.storage.from('notas').remove(l.map(x=>S.agenda+'/'+x.name))}const r=await sb.rpc('delete_my_account');if(r.error){alert('No se pudo eliminar: '+r.error.message);return}await sb.auth.signOut()}catch(e){console.error(e)}localStorage.clear();location.reload()};
window.uploadFile=async f=>{const path=S.agenda+'/'+Date.now()+'-'+f.name.replace(/[^\w.\-]/g,'_');const r=await sb.storage.from('notas').upload(path,f);return r.error?null:{name:f.name,path}};
window.openFile=async p=>{const r=await sb.storage.from('notas').createSignedUrl(p,3600);if(r.data){const w=window.open(r.data.signedUrl,'_blank');if(!w)location.href=r.data.signedUrl}};
window.rotateOnce=async()=>{const r=await sb.rpc('rotate_once_code',{a:S.agenda});if(r.error||!r.data)return null;window.ONCE_LINK=location.origin+location.pathname.replace(/[^/]*$/,'')+'reservar.html?c='+r.data;return window.ONCE_LINK};
window.savePush=async s=>{const j=s.toJSON(),r=await sb.from('push_subs').upsert({endpoint:j.endpoint,agenda_id:S.agenda,user_id:S.user.id,sub:j});if(r.error)console.error(r.error);return !r.error};
window.dropPush=async ep=>{await sb.from('push_subs').delete().eq('endpoint',ep)};
})();
