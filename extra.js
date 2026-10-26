// extra.js: reservas por link, historial, fichas, importar/exportar y cuenta
(()=>{
const z=n=>String(n).padStart(2,'0');
let bk={enabled:false,manual:false,max:2},hist=[],fich={},fsel=null,fq='';
const TT={H:'Horarios',P:'Permisos',R:'Reservas por link',Rm:'Recordatorios',F:'Fichas',Hi:'Historial',IO:'Importar y exportar',C:'Cuenta'};
const SHOW={H:()=>renderS(),P:()=>renderM(),R:()=>renderR(),Rm:()=>renderRm(),F:()=>renderF(),Hi:()=>renderHi(),C:()=>renderC()};
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
addScreen('C','<div class="rv"><div class="r"><label ${LW}>Email</label><span id="cMail" style="word-break:break-all;text-align:right"></span></div><div class="r"><label ${LW}>Tipo de cuenta</label><span id="cRol"></span></div></div><div class="heard" style="white-space:normal;margin:8px 0 12px">Por seguridad la contrase\u00f1a no se puede ver: se guarda cifrada y nadie la conoce, ni siquiera yo. Si no te acordás, pod\u00e9s crear una nueva.</div><button class="menub" id="cPw">Cambiar contrase\u00f1a<span>\u203a</span></button><button class="menub" id="cOut">Cerrar sesi\u00f3n<span>\u203a</span></button><button class="menub" id="cDel" style="color:#ff6b6b">Eliminar mi cuenta<span>\u203a</span></button>');
{const mb=[...$('sMenu').children].find(b=>/^Cuenta/.test(b.textContent));if(mb)mb.innerHTML='Cuenta<small id="accMail" style="color:var(--mute);margin:0 auto 0 10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:55%"></small><span>\u203a</span>'}
window.renderC=()=>{$('cMail').textContent=window.USER_EMAIL||'';$('cRol').textContent=window.AGENDA_OWNER?'Due\u00f1o de la agenda':'Miembro'};
$('cPw').onclick=()=>window.changePassword&&window.changePassword();

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
  if(o){const t=turnos.find(x=>x.id===o.dataset.ok);if(t)approveT(t)}
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
  $('fBody').innerHTML=`<button class="hoy" id="fBack">\u2039 Todas las fichas</button><h2 style="color:var(--fg);font-size:22px;margin:14px 0 8px;text-transform:none">${esc(p.nombre+' '+p.apellido)}</h2><div class="rv"><div class="r"><label>Tel\u00e9fono</label><input type="text" id="fTel" inputmode="tel" value="${esc(tel)}" placeholder="Agregar"></div><div class="r"><label ${LW}>Primera sesi\u00f3n</label><span>${fS(first)}</span></div><div class="r"><label>Frecuencia</label><span>${freq(p.ts)}</span></div></div><h2>Historial de sesiones</h2>`+ts.map(t=>{const st=t.estado==='pendiente'?'Por aprobar':(t.fecha+' '+t.hora<n?'Realizada':'Pendiente');return `<div class="t" style="cursor:default"><b style="border-left-color:${colorOf(t.by)}">${t.hora}</b><span>${fS(t.fecha)}</span><small class="mut" style="margin-left:auto">${st}</small></div>`}).join('')};
$('fBody').onclick=e=>{const c=e.target.closest('[data-f]');if(c){fsel=c.dataset.f;renderF()}if(e.target.id==='fBack'){fsel=null;renderF()}};
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
const TPL='Hola {nombre}, te recuerdo tu sesi\u00f3n del {fecha} a las {hora}. \u00a1Te espero!',TPLOK='Hola {nombre}, tu sesi\u00f3n del {fecha} a las {hora} qued\u00f3 confirmada. \u00a1Te espero!';
let rm={push:[60],wa:[1440],tpl:TPL,tplOk:TPLOK},rmNote='';
const waNum=p=>{let d=String(p||'').replace(/\D/g,'').replace(/^00/,'');if(d.startsWith('54')){if(!d.startsWith('549'))d='549'+d.slice(2)}else d='549'+d.replace(/^0/,'');return d.length>=12?d:''};
const waLink=(n,t)=>'https://wa.me/'+n+'?text='+encodeURIComponent(t);
const waApp=(n,t)=>'whatsapp://send?'+(n?'phone='+n+'&':'')+'text='+encodeURIComponent(t);
const waBiz=(n,t)=>'intent://send/?'+(n?'phone='+n+'&':'')+'text='+encodeURIComponent(t)+'#Intent;scheme=whatsapp;package=com.whatsapp.w4b;S.browser_fallback_url='+encodeURIComponent(n?waLink(n,t):'https://wa.me/?text='+encodeURIComponent(t))+';end';
const waOpen=u=>{const a=document.createElement('a');a.href=u;a.rel='noopener';document.body.appendChild(a);a.click();a.remove()};
const openWA=(n,t)=>{try{if(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent))waOpen(waApp(n,t));else{const u=n?waLink(n,t):'https://wa.me/?text='+encodeURIComponent(t);if(!window.open(u,'_blank'))location.href=u}}catch(err){alert('No se pudo abrir WhatsApp: '+err.message)}};
function showWA(o){
  const d=document.createElement('div'),B='width:100%;height:52px;border-radius:26px;border:0;font:inherit;font-weight:700;cursor:pointer;margin-bottom:10px',android=/Android/i.test(navigator.userAgent);
  d.style.cssText='position:fixed;inset:0;z-index:200;background:var(--bg);color:var(--fg);display:flex;align-items:center;justify-content:center;padding:24px;overflow:auto';
  d.innerHTML=`<div style="width:100%;max-width:380px"><h1 style="margin:0 0 6px;font-size:24px">${o.ok?'Avisale a '+esc(o.nm):o.nm?'Recordale a '+esc(o.nm):'Enviar mensaje'}</h1><p style="color:var(--mute);margin:0 0 14px">Toc\u00e1 el bot\u00f3n: se abre WhatsApp con el mensaje escrito y solo ten\u00e9s que enviar.</p><div style="background:var(--card);border-radius:12px;padding:14px;margin-bottom:16px;white-space:pre-wrap">${esc(o.t||'')}</div><button id="wA" style="${B};background:var(--y);color:var(--yfg)">Abrir WhatsApp</button>${android?`<button id="wB" style="${B};background:var(--card);color:var(--fg)">Abrir WhatsApp Business</button>`:''}<button id="wX" style="${B};background:none;color:var(--mute)">Cerrar</button></div>`;
  d.id='waS';if(o.auto)d.dataset.auto='1';
  document.body.appendChild(d);
  d.querySelector('#wA').onclick=()=>openWA(o.n,o.t);
  if(android)d.querySelector('#wB').onclick=()=>{location.href=waBiz(o.n,o.t)};
  d.querySelector('#wX').onclick=()=>d.remove()}
{const q=new URLSearchParams(location.search).get('wa');if(q){let o=null;try{o=JSON.parse(q)}catch(err){}if(o&&o.t){history.replaceState({},'',location.pathname);const go=()=>showWA(o);document.body?go():addEventListener('DOMContentLoaded',go)}}}
const fill=(s,t)=>(s||TPLOK).replace(/\{nombre\}/g,t.nombre).replace(/\{fecha\}/g,fmt(t.fecha).toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})).replace(/\{hora\}/g,t.hora);
window.approveT=t=>{
  t.estado='confirmado';saveT(t);render();if($('sR').style.display!=='none')renderR();
  let msg='',tl='';try{tl=waNum(t.tel||'');msg=fill(rm.tplOk,t)}catch(err){msg='Hola '+t.nombre+', tu sesi\u00f3n qued\u00f3 confirmada.'}
  if(tl)openWAfb(tl,t.nombre,msg);else showWA({n:'',nm:t.nombre,t:msg,ok:1})};
$('lista').addEventListener('click',e=>{const a=e.target.closest('[data-a="ok"]'),c=a&&a.closest('.t');if(!c)return;e.stopImmediatePropagation();e.stopPropagation();const t=turnos.find(x=>x.id===c.dataset.id);if(t)approveT(t)},true);
function openWAfb(n,nm,msg){let left=false;
  const f=()=>{if(document.hidden){left=true;const e=document.getElementById('waS');if(e&&e.dataset.auto)e.remove()}},b=()=>{left=true};
  document.addEventListener('visibilitychange',f);window.addEventListener('blur',b);window.addEventListener('pagehide',b);
  openWA(n,msg);
  setTimeout(()=>{window.removeEventListener('blur',b);window.removeEventListener('pagehide',b);if(!left&&!document.hidden)showWA({n:n,nm:nm,t:msg,ok:1,auto:1});setTimeout(()=>document.removeEventListener('visibilitychange',f),120000)},2500)}
const mlab=m=>m%1440===0?(m/1440)+(m===1440?' d\u00eda':' d\u00edas'):m%60===0?(m/60)+(m===60?' hora':' horas'):m+' min';
const saveRm=()=>{if(db)db.doc('config/remind').set(rm)};
const u8=b=>{const p='='.repeat((4-b.length%4)%4),r=atob((b+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(r,c=>c.charCodeAt(0))};
const regP=async()=>{try{const reg=await Promise.race([navigator.serviceWorker.ready,new Promise((_,no)=>setTimeout(no,5000))]);return{reg,sub:await reg.pushManager.getSubscription()}}catch(err){return{}}};
const IN='background:var(--card);border:1px solid transparent;border-radius:12px;padding:12px;color:var(--fg);font:inherit;outline:none';
const adder=k=>`<div style="display:flex;gap:8px;margin:4px 0 6px"><input type="number" id="rmN${k}" min="1" inputmode="numeric" placeholder="Cantidad" style="${IN};flex:1;min-width:0"><select id="rmU${k}" style="${IN}"><option value="1">minutos</option><option value="60" selected>horas</option><option value="1440">d\u00edas</option></select><button data-add="${k}" style="border:0;border-radius:12px;padding:0 16px;background:var(--y);color:var(--yfg);font:inherit;font-weight:700;cursor:pointer">Agregar</button></div>`;
window.renderRm=async()=>{
  const chips=(arr,k)=>(arr||[]).length?arr.map(m=>`<button data-del="${k}:${m}" style="${CH(true)}" aria-label="Quitar">${mlab(m)} antes \u00d7</button>`).join(''):'<span class="heard">Ninguno</span>';
  const st=await regP(),on=!!st.sub,ta=`style="${IN};width:100%;min-height:84px;resize:vertical"`;
  $('rmBody').innerHTML=`<h2>Avisos para m\u00ed</h2><div class="heard" style="white-space:normal;margin:0 0 10px">Te llega una notificaci\u00f3n en este celular antes de cada sesi\u00f3n, aunque la app est\u00e9 cerrada. Suena con el sonido de notificaciones de tu tel\u00e9fono. En iPhone hay que instalar la app en la pantalla de inicio.</div><button class="menub" id="rmPush">${on?'Desactivar en este dispositivo':'Activar en este dispositivo'}<span>\u203a</span></button><button class="menub" id="rmTest">Probar un aviso<span>\u203a</span></button><div class="heard" style="margin:12px 0 8px">Avisarme cuando falte:</div><div>${chips(rm.push,'p')}</div>${adder('p')}
  <h2>Recordarles a los consultantes</h2><div class="heard" style="white-space:normal;margin:0 0 10px">Te llega una notificaci\u00f3n que dice a qui\u00e9n recordarle. Al tocarla (o tocar "Enviar WhatsApp") se abre el chat con el mensaje ya escrito y solo ten\u00e9s que enviar.</div><div class="heard" style="margin:12px 0 8px">Avisarme de recordarle cuando falte:</div><div>${chips(rm.wa,'w')}</div>${adder('w')}<div class="heard" style="margin:12px 0 6px">Mensaje del recordatorio</div><textarea id="rmT" ${ta}>${esc(rm.tpl||TPL)}</textarea>
  <h2>Cuando confirm\u00e1s una reserva pendiente</h2><div class="heard" style="margin:0 0 6px">Mensaje de confirmaci\u00f3n</div><textarea id="rmO" ${ta}>${esc(rm.tplOk||TPLOK)}</textarea><div class="heard" style="white-space:normal;margin-top:6px">Pod\u00e9s usar {nombre}, {fecha} y {hora}. El tel\u00e9fono del consultante tiene que estar cargado (con caracter\u00edstica, sin 0 ni 15).</div><div class="heard" id="rmMsg" style="white-space:normal;margin-top:8px">${rmNote}</div>`};
const note=t=>{rmNote=t;if($('rmMsg'))$('rmMsg').textContent=t};
$('rmBody').onchange=e=>{if(e.target.id==='rmT'){rm.tpl=e.target.value.trim()||TPL;saveRm()}if(e.target.id==='rmO'){rm.tplOk=e.target.value.trim()||TPLOK;saveRm()}};
$('rmBody').onclick=async e=>{
  const d=e.target.closest('[data-del]'),a=e.target.closest('[data-add]');
  if(d){const[k,m]=d.dataset.del.split(':'),f=k==='p'?'push':'wa';rm[f]=(rm[f]||[]).filter(x=>x!==+m);saveRm();renderRm();return}
  if(a){const k=a.dataset.add,n=+$('rmN'+k).value*(+$('rmU'+k).value),f=k==='p'?'push':'wa';
    if(!(n>=1)||n>60*1440){note('Pon\u00e9 una cantidad v\u00e1lida (hasta 60 d\u00edas).');return}
    if(!(rm[f]||[]).includes(n))rm[f]=[...(rm[f]||[]),n].sort((x,y)=>x-y);note('');saveRm();renderRm();return}
  const b=e.target.closest('button');if(!b)return;
  if(b.id==='rmTest'){try{const{reg}=await regP();if(Notification.permission!=='granted'&&await Notification.requestPermission()!=='granted'){note('Permiso de notificaciones denegado.');return}await reg.showNotification('Recordale a Gustavo P\u00e9rez',{body:'Sesi\u00f3n del jueves a las 15:00. Toc\u00e1 para abrir WhatsApp.',data:{wa:{n:'',nm:'Gustavo P\u00e9rez',t:fill(rm.tpl||TPL,{nombre:'Gustavo',fecha:key(new Date()),hora:'15:00'})}},actions:[{action:'wa',title:'Abrir mensaje'}]})}catch(err){note('Este navegador no permite avisos.')}return}
  if(b.id==='rmPush'){
    if(!('PushManager' in window)||!(await regP()).reg){note('Este navegador no permite avisos. En iPhone, instal\u00e1 la app en la pantalla de inicio.');return}
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
  d.doc('config/remind').onSnapshot(s=>{if(s.exists){const c=s.data();rm={push:Array.isArray(c.push)?c.push:rm.push,wa:Array.isArray(c.wa)?c.wa:[],tpl:c.tpl||TPL,tplOk:c.tplOk||TPLOK}}else if(typeof canW==='undefined'||canW)saveRm();if($('sRm').style.display!=='none'&&!document.activeElement.matches('textarea,input,select'))renderRm()});
  $('accMail').textContent=window.USER_EMAIL||'';
  d.doc('booking/main').onSnapshot(s=>{if(s.exists)bk={...bk,...s.data()};renderR()});
  d.collection('hist').onSnapshot(s=>{hist=s.docs.map(x=>x.data()).sort((a,b)=>b.ts-a.ts).slice(0,150);renderHi()});
  d.collection('fichas').onSnapshot(s=>{fich={};s.docs.forEach(x=>fich[x.id]=x.data());if($('sF').style.display!=='none')renderF()})}catch(err){console.error(err)}})();
})();
