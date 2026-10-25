// extra.js: reservas por link, historial, fichas, importar/exportar y cuenta
(()=>{
const z=n=>String(n).padStart(2,'0');
let bk={enabled:false,manual:false,max:2},hist=[],fich={},fsel=null,fq='';
const TT={H:'Horarios',P:'Permisos',R:'Reservas por link',Rm:'Recordatorios',F:'Fichas',Hi:'Historial',IO:'Importar y exportar',C:'Cuenta'};
const SHOW={H:()=>renderS(),P:()=>renderM(),R:()=>renderR(),Rm:()=>renderRm(),F:()=>renderF(),Hi:()=>renderHi()};
window.sub=n=>{$('sMenu').style.display=n==='m'?'':'none';Object.keys(TT).forEach(k=>$('s'+k).style.display=n===k?'':'none');
  $('sback').style.display=n==='m'?'none':'';$('sttl').textContent=TT[n]||'Ajustes';if(SHOW[n])SHOW[n]()};
[...$('sMenu').children].forEach(b=>{if(/Cerrar sesi/.test(b.textContent))b.remove()});
function addScreen(k,html){const b=document.createElement('button');b.className='menub';b.innerHTML=TT[k]+'<span>\u203a</span>';b.onclick=()=>sub(k);$('sMenu').appendChild(b);
  const d=document.createElement('div');d.id='s'+k;d.style.display='none';d.innerHTML=html;$('pgS').appendChild(d)}
const LW='style="width:auto"',LK='style="width:100%;background:var(--card);border:0;border-radius:12px;padding:13px;margin-bottom:10px;color:var(--fg)"';
const CH=on=>'border:1px solid '+(on?'var(--y)':'var(--line)')+';background:'+(on?'var(--y)':'var(--card)')+';color:'+(on?'var(--yfg)':'var(--fg)')+';border-radius:18px;padding:10px 16px;font:inherit;font-weight:600;margin:0 8px 8px 0;cursor:pointer';
addScreen('R',`<div class="rv"><div class="r"><label ${LW}>Aprobar cada reserva a mano</label><button class="sw" id="bkMan" aria-label="Aprobaci\u00f3n manual"></button></div></div><h2>Link general</h2><div class="rv"><div class="r"><label ${LW}>Activar</label><button class="sw" id="bkOn" aria-label="Activar"></button></div></div><div class="heard" style="white-space:normal;margin:8px 0 12px">Sin l\u00edmite de reservas. Pide nombre, apellido y tel\u00e9fono. Quien lo abre no inicia sesi\u00f3n ni ve datos de nadie.</div><input type="text" id="bkLink" readonly ${LK}><button class="newn" id="bkCopy" style="background:var(--y);color:var(--yfg);border:0">Copiar link</button><h2>Link de un solo uso</h2><div class="rv"><div class="r"><label ${LW}>Activar</label><button class="sw" id="bkOnceOn" aria-label="Activar link de un solo uso"></button></div></div><div class="heard" style="white-space:normal;margin:8px 0 12px">Pod\u00e9s mandarlo a mucha gente: cada persona puede reservar una sola sesi\u00f3n (se controla por tel\u00e9fono, nombre y dispositivo). Si lo cambi\u00e1s, el anterior deja de funcionar y todos pueden volver a usar el nuevo.</div><input type="text" id="bkOLink" readonly ${LK}><button class="newn" id="bkOCopy" style="background:var(--y);color:var(--yfg);border:0">Copiar link</button><button class="menub" id="bkRot" style="margin-top:10px">Cambiar link<span>\u203a</span></button><h2>Pendientes de aprobar</h2><div id="bkPend"></div>`);
addScreen('Rm','<div id="rmBody"></div>');
addScreen('F','<div id="fBody"></div>');
addScreen('Hi','<div id="hiBody"></div>');
addScreen('IO',`<h2>Exportar</h2><button class="menub" id="exX">Excel (.xlsx)<span>\u2193</span></button><button class="menub" id="exI">Calendario (.ics)<span>\u2193</span></button><button class="menub" id="exJ">Copia de la agenda (.json)<span>\u2193</span></button><h2>Importar</h2><button class="menub" id="imB">Elegir archivo<span>\u2191</span></button><input type="file" id="imF" accept=".xlsx,.xls,.csv,.ics,.json" hidden><div class="heard" id="imM" style="white-space:normal;margin-top:8px">Excel o CSV con columnas Nombre, Apellido, Fecha, Hora y Primera sesi\u00f3n (S\u00ed o vac\u00edo); archivo .ics de Google Calendar u otro calendario; o una copia .json de esta app.</div>`);
addScreen('C','<button class="menub" id="cOut">Cerrar sesi\u00f3n<span>\u203a</span></button><button class="menub" id="cDel" style="color:#ff6b6b">Eliminar mi cuenta<span>\u203a</span></button>');

/* historial */
const logH=t=>{try{if(db&&me)Promise.resolve(db.doc('hist/'+gid()).set({ts:Date.now(),by:me.id,text:t})).catch(console.error)}catch(err){console.error(err)}};
const _sT=saveT,_dT=delT;
window.saveT=t=>{const nw=!turnos.includes(t);_sT(t);logH((nw?'Agend\u00f3':'Modific\u00f3')+' turno de '+t.nombre+' '+t.apellido+' ('+lab(t)+')')};
window.delT=id=>{const t=turnos.find(x=>x.id===id);_dT(id);if(t)logH('Borr\u00f3 turno de '+t.nombre+' '+t.apellido+' ('+lab(t)+')')};
const _r=render,_l=legend;
window.legend=()=>{_l();if(db&&turnos.some(t=>t.by==='otro'))$('leg').insertAdjacentHTML('beforeend','<span><i class="dot" style="display:inline-block;vertical-align:-2px;background:#9AA0A6"></i> Otro</span>')};
window.render=()=>{_r();legend();if($('sF').style.display!=='none'&&!document.activeElement.matches('#fTel'))renderF();if($('sR').style.display!=='none')renderR()};
window.renderHi=()=>{$('hiBody').innerHTML=hist.length?hist.map(h=>{const d=new Date(h.ts);return `<div class="t" style="cursor:default"><div style="flex:1;min-width:0"><span style="white-space:normal">${esc(h.text)}</span><div class="mut">${d.toLocaleDateString('es-AR',{day:'numeric',month:'short'})} ${d.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})} \u00b7 ${h.by==='otro'?'Otro (link)':esc(mname[h.by]||'Miembro')}</div></div></div>`}).join(''):'<div class="empty">Sin cambios registrados</div>'};

/* reservas por link */
const saveBk=()=>{if(db)db.doc('booking/main').set(bk)};
window.renderR=()=>{$('bkOn').classList.toggle('on',!!bk.enabled);$('bkMan').classList.toggle('on',!!bk.manual);$('bkOnceOn').classList.toggle('on',!!bk.onceEnabled);
  $('bkLink').value=window.PUBLIC_LINK||'(disponible al iniciar sesi\u00f3n)';$('bkOLink').value=window.ONCE_LINK||'(disponible al iniciar sesi\u00f3n)';
  const p=turnos.filter(t=>t.estado==='pendiente').sort((a,b)=>(a.fecha+a.hora<b.fecha+b.hora)?-1:1);
  $('bkPend').innerHTML=p.length?p.map(t=>`<div class="t" style="cursor:default"><div style="flex:1;min-width:0"><span class="gt">${esc(t.nombre+' '+t.apellido)}</span><div class="mut">${lab(t)}</div></div><button class="nb" data-ok="${t.id}">Aprobar</button><button class="nb empty0" data-no="${t.id}">Rechazar</button></div>`).join(''):'<div class="empty">Sin reservas pendientes</div>'};
$('bkOn').onclick=()=>{bk.enabled=!bk.enabled;saveBk();renderR()};
$('bkMan').onclick=()=>{bk.manual=!bk.manual;saveBk();renderR()};
$('bkOnceOn').onclick=()=>{bk.onceEnabled=!bk.onceEnabled;saveBk();renderR()};
const cp=(b,i)=>$(b).onclick=async()=>{const x=$(i);try{await navigator.clipboard.writeText(x.value)}catch(err){x.select();document.execCommand('copy')}$(b).textContent='\u00a1Copiado!';setTimeout(()=>$(b).textContent='Copiar link',1500)};
cp('bkCopy','bkLink');cp('bkOCopy','bkOLink');
$('bkRot').onclick=()=>ask('Si cambi\u00e1s el link, el anterior deja de funcionar. \u00bfCambiarlo?',async()=>{await(window.rotateOnce&&window.rotateOnce());renderR()},'Cambiar');
$('bkPend').onclick=e=>{const o=e.target.closest('[data-ok]'),n=e.target.closest('[data-no]');
  if(o){const t=turnos.find(x=>x.id===o.dataset.ok);t.estado='confirmado';saveT(t);render()}
  if(n)delT(n.dataset.no)};

/* fichas */
const fk=t=>nz(t.nombre+'_'+t.apellido).replace(/[^a-z0-9_]/g,'');
function freq(ts){const d=ts.filter(t=>t.estado!=='pendiente').map(t=>t.fecha).sort();if(d.length<2)return 'Sin datos todav\u00eda';const g=[];for(let i=1;i<d.length;i++)g.push((fmt(d[i])-fmt(d[i-1]))/864e5);g.sort((a,b)=>a-b);const m=g[Math.floor(g.length/2)];return m<=8?'Semanal':m<=16?'Quincenal':m<=35?'Mensual':'Cada ~'+Math.round(m)+' d\u00edas'}
window.renderF=()=>{
  const m={};turnos.forEach(t=>{const k=fk(t);(m[k]=m[k]||{k,nombre:t.nombre,apellido:t.apellido,ts:[]}).ts.push(t)});
  const ps=Object.values(m).sort((a,b)=>(a.apellido+a.nombre).localeCompare(b.apellido+b.nombre));
  const p=fsel&&ps.find(x=>x.k===fsel);if(!p)fsel=null;
  if(!p){
    if(!$('fQ'))$('fBody').innerHTML='<input type="search" id="fQ" placeholder="Buscar por nombre" autocomplete="off" value="'+esc(fq)+'" style="width:100%;background:var(--card);border:1px solid transparent;border-radius:12px;padding:13px;margin-bottom:10px;color:var(--fg);font:inherit;outline:none"><div id="fList"></div>';
    const q=nz(fq).split(/\s+/).filter(Boolean),vis=ps.filter(p=>{const n=nz(p.nombre+' '+p.apellido);return q.every(x=>n.includes(x))});
    $('fList').innerHTML=vis.length?vis.map(p=>`<div class="t" data-f="${p.k}"><div style="flex:1;min-width:0"><span class="gt">${esc(p.nombre+' '+p.apellido)}</span><div class="mut">${p.ts.length} ${p.ts.length>1?'sesiones':'sesi\u00f3n'}</div></div><span style="color:var(--mute)">\u203a</span></div>`).join(''):'<div class="empty">'+(ps.length?'Sin resultados':'Todav\u00eda no hay consultantes')+'</div>';return}
  const f=fich[fsel]||{},ts=p.ts.slice().sort((a,b)=>(b.fecha+b.hora<a.fecha+a.hora)?-1:1),tel=f.tel||(ts.find(t=>t.tel)||{}).tel||'',first=p.ts.map(t=>t.fecha).sort()[0],d=new Date(),n=key(d)+' '+z(d.getHours())+':'+z(d.getMinutes());
  $('fBody').innerHTML=`<button class="hoy" id="fBack">\u2039 Todas las fichas</button><h2 style="color:var(--fg);font-size:22px;margin:14px 0 8px;text-transform:none">${esc(p.nombre+' '+p.apellido)}</h2><div class="rv"><div class="r"><label>Tel\u00e9fono</label><input type="text" id="fTel" inputmode="tel" value="${esc(tel)}" placeholder="Agregar"></div><div class="r"><label ${LW}>Primera sesi\u00f3n</label><span>${fS(first)}</span></div><div class="r"><label>Frecuencia</label><span>${freq(p.ts)}</span></div><div class="r"><label ${LW}>Permiso para recordarle por WhatsApp</label><button class="sw${f.wa?' on':''}" id="fWa" aria-label="Permiso WhatsApp"></button></div></div><h2>Historial de sesiones</h2>`+ts.map(t=>{const st=t.estado==='pendiente'?'Por aprobar':(t.fecha+' '+t.hora<n?'Realizada':'Pendiente');return `<div class="t" style="cursor:default"><b style="border-left-color:${colorOf(t.by)}">${t.hora}</b><span>${fS(t.fecha)}</span><small class="mut" style="margin-left:auto">${st}</small></div>`}).join('')};
$('fBody').onclick=e=>{const c=e.target.closest('[data-f]');if(c){fsel=c.dataset.f;renderF()}if(e.target.id==='fBack'){fsel=null;renderF()}if(e.target.id==='fWa'&&db&&fsel)db.doc('fichas/'+fsel).update({wa:!(fich[fsel]||{}).wa})};
$('fBody').oninput=e=>{if(e.target.id==='fQ'){fq=e.target.value;renderF()}};
$('fBody').onchange=e=>{if(e.target.id==='fTel'&&db&&fsel)db.doc('fichas/'+fsel).update({tel:e.target.value.trim()})};

/* exportar */
const dl=(n,b)=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click()};
const sorted=()=>turnos.slice().sort((a,b)=>(a.fecha+a.hora<b.fecha+b.hora)?-1:1);
const msg=t=>$('imM').textContent=t;
$('exX').onclick=()=>{if(!window.XLSX){msg('No se pudo cargar el m\u00f3dulo de Excel (revis\u00e1 tu conexi\u00f3n).');return}
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(sorted().map(t=>({Nombre:t.nombre,Apellido:t.apellido,Fecha:t.fecha,Hora:t.hora,'Primera sesi\u00f3n':t.primera?'S\u00ed':'',Estado:t.estado==='pendiente'?'Por aprobar':'Confirmado'}))),'Turnos');XLSX.writeFile(wb,'agenda.xlsx')};
$('exI').onclick=()=>{const st=new Date().toISOString().replace(/[-:]|\.\d{3}/g,''),L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Agenda//ES'];
  sorted().forEach(t=>{const e=mins(t.hora)+60;L.push('BEGIN:VEVENT','UID:'+t.id+'@agenda','DTSTAMP:'+st,'DTSTART:'+t.fecha.replace(/-/g,'')+'T'+t.hora.replace(':','')+'00','DTEND:'+t.fecha.replace(/-/g,'')+'T'+z(Math.floor(e/60)%24)+z(e%60)+'00','SUMMARY:Sesi\u00f3n: '+(t.nombre+' '+t.apellido).trim().replace(/,/g,'\\,'),'END:VEVENT')});
  L.push('END:VCALENDAR');dl('agenda.ics',new Blob([L.join('\r\n')],{type:'text/calendar'}))};
$('exJ').onclick=()=>dl('agenda.json',new Blob([JSON.stringify({turnos:sorted(),config:cfg},null,1)],{type:'application/json'}));

/* importar */
const toT=(name,d)=>{const w=name.replace(/^(sesi\u00f3n|sesion|turno|cita)\s*[:\-\u2013]?\s*(con|de)?\s*/i,'').trim().split(/\s+/).filter(Boolean);const sp=splitName(w);return{nombre:sp[0]||'Sin nombre',apellido:sp[1],fecha:key(d),hora:z(d.getHours())+':'+z(d.getMinutes())}};
function parseICS(txt){const L=txt.replace(/\r?\n[ \t]/g,'').split(/\r?\n/),out=[];let ev=null;
  L.forEach(l=>{if(l==='BEGIN:VEVENT')ev={};else if(l==='END:VEVENT'){if(ev&&ev.s)out.push(ev);ev=null}else if(ev){const i=l.indexOf(':'),k=l.slice(0,i).split(';')[0],v=l.slice(i+1);if(k==='DTSTART')ev.s=v;if(k==='SUMMARY')ev.n=v.replace(/\\,/g,',')}});
  return out.map(e=>{const m=e.s.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?(Z)?/);if(!m)return null;
    const d=m[6]?new Date(Date.UTC(+m[1],m[2]-1,+m[3],+m[4]||0,+m[5]||0)):new Date(+m[1],m[2]-1,+m[3],+m[4]||0,+m[5]||0);return toT(e.n||'',d)}).filter(Boolean)}
const toKey=v=>{if(typeof v==='number'){const o=XLSX.SSF.parse_date_code(v);return o?o.y+'-'+z(o.m)+'-'+z(o.d):''}v=String(v).trim();let m=v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return m[1]+'-'+z(m[2])+'-'+z(m[3]);m=v.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);return m?(m[3].length==2?'20'+m[3]:m[3])+'-'+z(m[2])+'-'+z(m[1]):''};
const toHM=v=>{if(typeof v==='number'){const q=Math.round((v%1)*1440);return z(Math.floor(q/60))+':'+z(q%60)}const m=String(v).match(/(\d{1,2})[:.h](\d{2})?/);return m?z(m[1])+':'+(m[2]||'00'):''};
const parseRows=rs=>rs.map(r=>{const o={};Object.keys(r).forEach(k=>o[nz(k).replace(/[^a-z]/g,'')]=r[k]);
  let n=o.nombre||o.nombres||'',a=o.apellido||o.apellidos||'';const full=o.consultante||o.paciente||o.cliente||o.nombreyapellido||o.titulo||o.resumen||o.evento||o.asunto||o.summary||'';
  if(!n&&full){const t=toT(String(full),new Date());n=t.nombre;a=t.apellido}
  const fv=o.fecha||o.dia||o.inicio||o.start||o.date||'';let h=toHM(o.hora||o.horario||o.time||'');if(!h&&typeof fv==='number'&&fv%1)h=toHM(fv%1);
  const ps=String(o.primerasesion||o.primera||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');return{nombre:String(n).trim(),apellido:String(a).trim(),fecha:toKey(fv),hora:h,primera:/^(s|si|x|1|true|yes|y)$/.test(ps)}});
$('imB').onclick=()=>$('imF').click();
$('imF').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;let list=[];const ext=f.name.split('.').pop().toLowerCase();
  try{
    if(ext==='ics')list=parseICS(await f.text());
    else if(ext==='json'){const j=JSON.parse(await f.text());list=(Array.isArray(j)?j:j.turnos||[]).map(t=>({nombre:t.nombre,apellido:t.apellido||'',fecha:t.fecha,hora:t.hora,primera:t.primera}))}
    else{if(!window.XLSX){msg('No se pudo cargar el m\u00f3dulo de Excel.');return}
      const wb=ext==='csv'?XLSX.read(await f.text(),{type:'string'}):XLSX.read(await f.arrayBuffer(),{type:'array'});
      list=parseRows(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''}))}
  }catch(err){msg('No pude leer ese archivo.');return}
  list=list.filter(t=>t.fecha&&t.hora&&t.nombre);
  const dup=new Set(turnos.map(t=>t.fecha+t.hora+nz(t.nombre+t.apellido))),nuevos=list.filter(t=>!dup.has(t.fecha+t.hora+nz(t.nombre+t.apellido)));
  if(!nuevos.length){msg('No encontr\u00e9 sesiones nuevas para importar.');return}
  ask('Se encontraron '+nuevos.length+' sesiones nuevas ('+(list.length-nuevos.length)+' repetidas se omiten). \u00bfImportarlas?',()=>{
    nuevos.forEach(t=>_sT({...t,id:gid(),by:me?me.id:''}));logH('Import\u00f3 '+nuevos.length+' sesiones desde '+f.name);render();msg('Listo: '+nuevos.length+' sesiones importadas.')},'Importar')};

/* cuenta */
$('cOut').onclick=()=>window.logout&&window.logout();
$('cDel').onclick=()=>ask(window.AGENDA_OWNER?'Sos el due\u00f1o: se borra tu cuenta Y la agenda completa para todos los miembros. No se puede deshacer.':'Se borra tu cuenta. La agenda sigue para los dem\u00e1s. No se puede deshacer.',()=>ask('\u00daltima confirmaci\u00f3n: \u00bfeliminar definitivamente?',()=>window.deleteAccount&&window.deleteAccount(),'S\u00ed, eliminar'),'Continuar');

/* recordatorios */
let rm={push:[60],wa:{on:false,mins:[1440]}},rmNote='';
const PO=[[15,'15 min'],[30,'30 min'],[60,'1 hora'],[120,'2 horas'],[1440,'1 d\u00eda']],WO=[[120,'2 horas'],[1440,'1 d\u00eda'],[2880,'2 d\u00edas']];
const saveRm=()=>{if(db)db.doc('config/remind').set(rm)};
const u8=b=>{const p='='.repeat((4-b.length%4)%4),r=atob((b+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(r,c=>c.charCodeAt(0))};
const regP=async()=>{try{const reg=await navigator.serviceWorker.ready;return{reg,sub:await reg.pushManager.getSubscription()}}catch(err){return{}}};
window.renderRm=async()=>{
  const chips=(arr,list,k)=>list.map(([m,l])=>`<button data-k="${k}" data-m="${m}" style="${CH(arr.includes(m))}">${l}</button>`).join('');
  const st=await regP(),on=!!st.sub;
  $('rmBody').innerHTML=`<h2>Avisos para m\u00ed</h2><div class="heard" style="white-space:normal;margin:0 0 10px">Te llega una notificaci\u00f3n en este celular aunque la app est\u00e9 cerrada. Suena con el sonido de notificaciones de tu tel\u00e9fono. En iPhone hay que instalar la app en la pantalla de inicio.</div><button class="menub" id="rmPush">${on?'Desactivar en este dispositivo':'Activar en este dispositivo'}<span>\u203a</span></button><button class="menub" id="rmTest">Probar un aviso<span>\u203a</span></button><div class="heard" style="margin:12px 0 8px">Avisarme con anticipaci\u00f3n de:</div><div>${chips(rm.push||[],PO,'p')}</div><h2>WhatsApp a consultantes</h2><div class="rv"><div class="r"><label ${LW}>Enviar recordatorios autom\u00e1ticos</label><button class="sw${rm.wa&&rm.wa.on?' on':''}" id="rmWa" aria-label="WhatsApp"></button></div></div><div class="heard" style="white-space:normal;margin:8px 0">Se env\u00eda con tu WhatsApp Business (mensaje de plantilla aprobado por Meta), solo entre las 8 y las 22 h y solo a quienes dieron permiso (en su ficha o al reservar por link).</div><div class="heard" style="margin:12px 0 8px">Recordarles con anticipaci\u00f3n de:</div><div>${chips((rm.wa&&rm.wa.mins)||[],WO,'w')}</div><div class="heard" id="rmMsg" style="white-space:normal;margin-top:8px">${rmNote}</div>`};
const note=t=>{rmNote=t;if($('rmMsg'))$('rmMsg').textContent=t};
$('rmBody').onclick=async e=>{
  const c=e.target.closest('[data-k]');
  if(c){const m=+c.dataset.m;if(c.dataset.k==='p'){const a=rm.push||[];rm.push=a.includes(m)?a.filter(x=>x!==m):[...a,m]}else{rm.wa=rm.wa||{on:false,mins:[]};const a=rm.wa.mins||[];rm.wa.mins=a.includes(m)?a.filter(x=>x!==m):[...a,m]}saveRm();renderRm();return}
  const b=e.target.closest('button');if(!b)return;
  if(b.id==='rmWa'){rm.wa=rm.wa||{mins:[1440]};rm.wa.on=!rm.wa.on;saveRm();renderRm();return}
  if(b.id==='rmTest'){try{const{reg}=await regP();if(Notification.permission!=='granted'&&await Notification.requestPermission()!=='granted'){note('Permiso de notificaciones denegado.');return}await reg.showNotification('Sesi\u00f3n con Gustavo P\u00e9rez',{body:'Hoy a las 15:00 (en 1 hora)'})}catch(err){note('Este navegador no permite avisos.')}return}
  if(b.id==='rmPush'){
    if(!('PushManager' in window)){note('Este navegador no permite avisos. En iPhone, instal\u00e1 la app en la pantalla de inicio.');return}
    if(!window.VAPID_KEY){note('Falta VAPID_KEY en config.js.');return}
    try{const{reg,sub}=await regP();
      if(sub){await window.dropPush(sub.endpoint);await sub.unsubscribe();note('')}
      else{if(await Notification.requestPermission()!=='granted'){note('Permiso de notificaciones denegado.');return}
        const s=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(window.VAPID_KEY)});
        if(!(await window.savePush(s))){note('No se pudo guardar este dispositivo.');return}note('')}
    }catch(err){console.error(err);note('No se pudo activar los avisos.')}
    renderRm()}};

/* suscripciones cuando hay conexi\u00f3n */
(async()=>{try{const d=await claude.use('db');if(!d)return;
  d.doc('config/remind').onSnapshot(s=>{if(s.exists)rm={...rm,...s.data()};if($('sRm').style.display!=='none')renderRm()});
  d.doc('booking/main').onSnapshot(s=>{if(s.exists)bk={...bk,...s.data()};renderR()});
  d.collection('hist').onSnapshot(s=>{hist=s.docs.map(x=>x.data()).sort((a,b)=>b.ts-a.ts).slice(0,150);renderHi()});
  d.collection('fichas').onSnapshot(s=>{fich={};s.docs.forEach(x=>fich[x.id]=x.data());if($('sF').style.display!=='none')renderF()})}catch(err){console.error(err)}})();
})();
