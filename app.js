const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let openId=null;
const sc=c=>/^#[0-9a-fA-F]{3,8}$/.test(c||'')?c:'#BDBDBD';
let OTRO='#9AA0A6';const colorOf=id=>id==='otro'?OTRO:mcol(id);
const lget=id=>{try{return localStorage.getItem('nt:'+id)||''}catch(e){return ''}};
const nk=t=>'p:'+nz((t.nombre||'')+(t.apellido||'')).replace(/\s+/g,'');
const lnote=t=>{const o=lget(t.id),k=nk(t);if(o){const p=lget(k);lset(k,!p?o:p.includes(o)?p:p+'\n'+o);lset(t.id,'')}return lget(k)};
const lset=(id,v)=>{try{v?localStorage.setItem('nt:'+id,v):localStorage.removeItem('nt:'+id)}catch(e){}};
const hh0=on=>({on,desde:'09:00',hasta:'20:00'});
let cfg={horas:[hh0(false),hh0(true),hh0(true),hh0(true),hh0(true),hh0(true),hh0(true)],blocks:[]};
const bOn=(b,k)=>b.dias?b.dias.includes(fmt(k).getDay()):(k>=b.desde&&k<=b.hasta);
const DN=['domingos','lunes','martes','miércoles','jueves','viernes','sábados'];
const blocked=k=>cfg.blocks.some(b=>!b.hd&&bOn(b,k));
const lab=t=>fmt(t.fecha).toLocaleDateString('es-AR',{weekday:'short',day:'numeric',month:'numeric'})+' '+t.hora;
function confl(t,extra,skip){
  const s=mins(t.hora);ix();
  for(const o of [...(ixD[t.fecha]||[]),...extra]){if(o.id!==skip&&o.fecha===t.fecha&&Math.abs(mins(o.hora)-s)<90)return 'choca con '+esc(o.nombre+' '+o.apellido)+' ('+o.hora+', 60 min + 30 de margen)'}
  const b=cfg.blocks.find(b=>bOn(b,t.fecha)&&(!b.hd||(s<mins(b.hh)&&s+60>mins(b.hd))));
  if(b)return 'está bloqueado ('+esc(b.motivo||'bloqueo')+')';
  const h=cfg.horas[fmt(t.fecha).getDay()];
  if(!h.on)return 'ese día no atendés (lo cambiás en Ajustes)';
  if(s<mins(h.desde)||s+60>mins(h.hasta))return 'queda fuera de tu horario ('+h.desde+' a '+h.hasta+')';
  return null}
const key=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=new Date();
const MES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DIA=['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
const MI='<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-.125em"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></svg>';
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
let vy=today.getFullYear(), vm=today.getMonth(), sel=key(today), multi=false, pend=[], uid=1, py=vy;
const mk=(o,h,nom,ape)=>{const d=new Date(today);d.setDate(d.getDate()+o);return{id:String(uid++),fecha:key(d),hora:h,nombre:nom,apellido:ape}};
let turnos=window.SUPABASE_URL?[]:[mk(0,'10:00','Gustavo','Pérez'),mk(0,'12:00','Laura','Gómez'),mk(0,'17:00','Marta','Díaz'),
mk(1,'11:00','Pablo','Ruiz'),mk(2,'15:00','Ana','López'),mk(2,'17:00','Sofía','Rey'),mk(5,'09:00','Julián','Vega')];
let tv=0;const mins=h=>{const[a,b]=h.split(':');return +a*60+ +b};
const NZC=new WeakMap();const tnz=t=>{let v=NZC.get(t);if(v===undefined){v=nz((t.nombre||'')+' '+(t.apellido||'')).replace(/\s+/g,' ').trim();NZC.set(t,v)}return v};
let ixV=-1,ixW=-1,ixD={},ixN={},ixF={};
function ix(){if(ixV===tv)return;ixV=tv;ixD={};for(const t of turnos)(ixD[t.fecha]=ixD[t.fecha]||[]).push(t)}
function ixn(){if(ixW===tv)return;ixW=tv;ixN={};ixF={};for(const t of turnos){const f=tnz(t);(ixF[f]=ixF[f]||[]).push(t);const n=nz(t.nombre||'').trim();(ixN[n]=ixN[n]||[]).push(t)}}
const fmt=k=>{const[y,m,d]=k.split('-');return new Date(y,m-1,d)};

window.loadX=()=>window.XLSX?Promise.resolve():new Promise((ok,no)=>{const e=document.createElement('script');e.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';e.onload=()=>window.XLSX?ok():no(new Error('x'));e.onerror=()=>no(new Error('x'));document.head.appendChild(e)});
/* si la app queda abierta de un día para otro, se actualiza "hoy" */
document.addEventListener('visibilitychange',()=>{if(document.hidden)return;const n=new Date();if(key(n)!==key(today)){const w=sel===key(today);today.setTime(n.getTime());if(w){sel=key(today);vy=today.getFullYear();vm=today.getMonth()}render()}});
/* ---------- Calendario ---------- */
let VM=(()=>{try{return localStorage.getItem('vw')||'m'}catch(e){return 'm'}})();
function ficha(t){if(window.fichaHTML)return fichaHTML(t);const all=turnos.filter(x=>nk(x)===nk(t)).sort((a,b)=>(a.fecha+a.hora<b.fecha+b.hora?-1:1)),n=(lnote(t)||'').split('\n')[0].slice(0,70);
  return `<div class="fi" style="flex-basis:100%;font-size:13px;color:var(--mute)">Sesión ${all.indexOf(t)+1} de ${all.length}${t.primera?' · Primera sesión':''}${t.tel?' · '+esc(fmtTel(t.tel)):''}${n?'<br>'+esc(n):''}</div>`}
function render(){
  $('mes').classList.toggle('sm',vy!==today.getFullYear()&&MES[vm].length>=9);
  $('mes').innerHTML=cap(MES[vm])+(vy!==today.getFullYear()?' '+vy:'')+' <i>▾</i>';
  let start,N=42,ws='',we='';
  if(VM==='m'){const off=(new Date(vy,vm,1).getDay()+6)%7;start=new Date(vy,vm,1-off)}
  else{const s0=fmt(sel);start=new Date(s0);start.setDate(s0.getDate()-(s0.getDay()+6)%7);N=7;ws=key(start);const e=new Date(start);e.setDate(e.getDate()+6);we=key(e)}
  $('cal').style.display=VM==='d'?'none':'';$('vsw').textContent=VM==='m'?'Mes':VM==='w'?'Semana':'Día';
  let h='';const cm={};turnos.forEach(t=>{cm[t.fecha]=(cm[t.fecha]||0)+1});
  for(let i=0;i<N;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);const k=key(d);
    const c=cm[k]||0;
    h+=`<button class="cell${VM==='m'&&d.getMonth()!==vm?' out':''}${k===key(today)?' today':''}${k===sel?' sel':''}${blocked(k)?' blk':''}" data-k="${k}"><span class="n">${d.getDate()}</span><span class="cnt${c?'':' none'}">${c||''}</span></button>`;
  }
  $('grid').innerHTML=h;
  $('dia').textContent=VM==='w'?'Semana del '+fmt(ws).toLocaleDateString('es-AR',{day:'numeric',month:'short'})+' al '+fmt(we).toLocaleDateString('es-AR',{day:'numeric',month:'short'}):fmt(sel).toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'});
  const l=turnos.filter(t=>VM==='w'?(t.fecha>=ws&&t.fecha<=we):t.fecha===sel).sort((a,b)=>a.fecha===b.fecha?mins(a.hora)-mins(b.hora):(a.fecha<b.fecha?-1:1));let pv='';
  $('lista').innerHTML=l.length?l.map(t=>{const has=!!lnote(t)||(t.files||[]).length;const hd=VM==='w'&&t.fecha!==pv?`<div class="mut" style="padding:10px 4px 4px;text-transform:capitalize">${fmt(t.fecha).toLocaleDateString('es-AR',{weekday:'long',day:'numeric'})}</div>`:'';pv=t.fecha;return hd+`<div class="t${openId===t.id?' open':''}" data-id="${esc(t.id)}"><b style="border-left-color:${colorOf(t.by)}">${t.hora}</b><span>${esc(t.nombre+' '+t.apellido)}${t.estado==='pendiente'?' <small style="color:var(--y)">· pendiente</small>':''}</span><button class="nb${has?'':' empty0'}" data-a="n">${has?'Ver notas':'Agregar notas'}</button>${VM==='d'?ficha(t):''}${openId===t.id&&canW?'<div class="ac">'+(t.estado==='pendiente'?'<button data-a="ok">Aprobar</button>':'')+'<button data-a="e">Editar</button><button class="del" data-a="d">Borrar</button></div>':''}</div>`}).join(''):'<div class="empty">'+(VM==='w'?'Sin turnos esta semana':'Sin turnos este día')+'</div>';
}
function go(dir){if(VM!=='m'){const d=fmt(sel);d.setDate(d.getDate()+dir*(VM==='w'?7:1));sel=key(d);vy=d.getFullYear();vm=d.getMonth();render();$('lista').animate([{transform:`translateX(${dir*40}px)`,opacity:.3},{transform:'none',opacity:1}],{duration:180});return}
  vm+=dir;if(vm<0){vm=11;vy--}if(vm>11){vm=0;vy++}render();
  $('grid').animate([{transform:`translateX(${dir*40}px)`,opacity:.3},{transform:'none',opacity:1}],{duration:180})}
$('grid').onclick=e=>{const b=e.target.closest('.cell');if(!b)return;sel=b.dataset.k;const d=fmt(sel);vy=d.getFullYear();vm=d.getMonth();render()};
$('prev').onclick=()=>go(-1);$('next').onclick=()=>go(1);
$('vsw').onclick=()=>{VM=VM==='m'?'w':VM==='w'?'d':'m';try{localStorage.setItem('vw',VM)}catch(e){}const d=fmt(sel);vy=d.getFullYear();vm=d.getMonth();render()};
$('hoy').onclick=()=>{vy=today.getFullYear();vm=today.getMonth();sel=key(today);render()};
let sx=0,sy=0;
$('cal').addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
$('cal').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
  if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)go(dx<0?1:-1)});

/* ---------- Selector mes/año ---------- */
function drawPk(){$('yv').textContent=py;
  $('ms').innerHTML=MES.map((m,i)=>`<button data-m="${i}" class="${py===vy&&i===vm?'on':''}">${cap(m.slice(0,3))}</button>`).join('')}
$('mes').onclick=e=>{e.stopPropagation();py=vy;drawPk();$('pk').classList.toggle('on')};
$('yp').onclick=()=>{py--;drawPk()};$('yn').onclick=()=>{py++;drawPk()};
$('ms').onclick=e=>{const b=e.target.closest('button');if(!b)return;vy=py;vm=+b.dataset.m;$('pk').classList.remove('on');render()};
document.addEventListener('click',e=>{if(!e.target.closest('#pk'))$('pk').classList.remove('on')});

/* ---------- Interpretar lo dictado ---------- */
const nz=s=>s.toLowerCase().replace(/[áä]/g,'a').replace(/[éë]/g,'e').replace(/[íï]/g,'i').replace(/[óö]/g,'o').replace(/[úü]/g,'u').replace(/ñ/g,'n').replace(/,/g,' ');
const GN=new Set(('maria jose juan ana luis carlos miguel pedro jorge laura luz paz belen eugenia lucia carolina cecilia victoria agustina sofia valentina martina florencia candela milagros rocio soledad veronica graciela alejandra andrea claudia silvia monica susana patricia beatriz teresa rosa elena emilia ines julia clara marta cristina gabriela daniela natalia romina paula noelia micaela camila celeste fernanda guadalupe lourdes mercedes ramona antonio manuel francisco angel alberto alejandro eduardo ricardo roberto daniel diego fernando gustavo hector horacio ignacio javier leonardo marcelo mario martin matias nicolas oscar pablo rafael ramon raul ruben santiago sebastian sergio tomas victor walter hugo omar cesar enrique emilio adrian esteban facundo federico gonzalo guillermo lucas mauricio rodolfo augusto ariel dario ezequiel franco gaston julian leandro maximiliano nahuel agustin bautista benjamin thiago lautaro joaquin ramiro emanuel').split(' '));
function splitName(w){
  w=w.filter(Boolean);if(w.length<2)return[w.join(' '),''];
  const full=nz(w.join(' ')).replace(/\s+/g,' ').trim();
  ixn();const hit=ixF[full];if(hit&&hit[0])return[hit[0].nombre,hit[0].apellido];
  let k=1;if(w.length===3)k=GN.has(nz(w[1]))?2:1;else if(w.length>=4)k=2;
  return[w.slice(0,k).join(' '),w.slice(k).join(' ')]}
const UW={cero:0,un:1,una:1,uno:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,once:11,doce:12,trece:13,catorce:14,quince:15,dieciseis:16,diecisiete:17,dieciocho:18,diecinueve:19,veinte:20,veintiun:21,veintiuno:21,veintiuna:21,veintidos:22,veintitres:23},TW={treinta:30,cuarenta:40,cincuenta:50};
const isW=(o,k)=>k!==undefined&&Object.prototype.hasOwnProperty.call(o,k);
function timeWords(s){
  return s.replace(/\b(a las|a la|las|la)\s+([a-z]+(?:\s+(?:y\s+|con\s+)?[a-z]+){0,5})/g,(all,pre,rest)=>{
    const t=rest.split(/\s+/);if(!isW(UW,t[0]))return all;
    const h=UW[t[0]];let i=1,m=null;
    const k=(t[i]==='y'||t[i]==='con')&&(isW(UW,t[i+1])||isW(TW,t[i+1]));
    if(k)i++;
    if(isW(TW,t[i])){m=TW[t[i]];i++;if(t[i]==='y'&&isW(UW,t[i+1])&&UW[t[i+1]]<10){m+=UW[t[i+1]];i+=2}}
    else if(isW(UW,t[i])&&(k||UW[t[i]]>=10)){m=UW[t[i]];i++}
    const out=pre+' '+h+(m!==null?':'+String(m).padStart(2,'0'):'')+(i<t.length?' '+t.slice(i).join(' '):'');
    return out.padEnd(all.length,' ')})}
const NW={cero:'0',un:'1',una:'1',uno:'1',dos:'2',tres:'3',cuatro:'4',cinco:'5',seis:'6',siete:'7',ocho:'8',nueve:'9',diez:'10',once:'11',doce:'12',trece:'13',catorce:'14',quince:'15',dieciseis:'16',diecisiete:'17',dieciocho:'18',diecinueve:'19',veinte:'20',veintiun:'21',veintiuno:'21',veintiuna:'21',veintidos:'22',veintitres:'23',veinticuatro:'24',veinticinco:'25',veintiseis:'26',veintisiete:'27',veintiocho:'28',veintinueve:'29',treinta:'30',cuarenta:'40',cincuenta:'50',sesenta:'60',setenta:'70',ochenta:'80',noventa:'90'},NT=new Set(['treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa']);
function fmtTel(d){d=String(d).replace(/\D/g,'').replace(/^0+/,'');
  if(d.startsWith('549')&&d.length>=12)d=d.slice(3);else if(d.startsWith('54')&&d.length>=11)d=d.slice(2);
  if(d.length===12&&d.startsWith('1115'))d='11'+d.slice(4);
  if(d.length===10)return d.startsWith('11')?d.slice(0,2)+' '+d.slice(2,6)+'-'+d.slice(6):d.slice(0,3)+' '+d.slice(3,6)+'-'+d.slice(6);
  return d}
function extractTel(raw){
  const tk=[];raw.replace(/\S+/g,(m,i)=>{tk.push({t:nz(m).trim().replace(/^[.,;:()¿¡"]+|[.,;:()?!"]+$/g,''),i:i,e:i+m.length});return m});
  let runs=[],cur=[];
  for(let i=0;i<tk.length;i++){const t=tk[i].t;let it=null;
    if(/^\+?[\d().\-:]+$/.test(t)&&/\d/.test(t))it={a:i,b:i,d:t.replace(/\D/g,'')};
    else if(NT.has(t)&&tk[i+1]&&tk[i+1].t==='y'&&tk[i+2]&&NW[tk[i+2].t]&&NW[tk[i+2].t].length===1&&NW[tk[i+2].t]!=='0'){it={a:i,b:i+2,d:String(+NW[t]+ +NW[tk[i+2].t])};i+=2}
    else if(Object.prototype.hasOwnProperty.call(NW,t))it={a:i,b:i,d:NW[t]};
    if(it)cur.push(it);else{if(cur.length)runs.push(cur);cur=[]}}
  if(cur.length)runs.push(cur);
  const sum=a=>a.reduce((n,x)=>n+x.d.length,0);
  for(const r of runs){
    if(sum(r)<8)continue;let it=r;
    if(sum(r)>10){let ok=null;
      for(let k=1;k<r.length&&!ok;k++)if(sum(r.slice(k))===10)ok=r.slice(k);
      for(let k=r.length-1;k>0&&!ok;k--)if(sum(r.slice(0,k))===10)ok=r.slice(0,k);
      if(ok)it=ok}
    let a=it[0].a;const b=it[it.length-1].b,KEY=['telefono','tel','celular','cel','whatsapp','wsp','numero'],FIL=KEY.concat(['es','el','de','mi','su','con']);
    let j=a-1,kk=-1;while(j>=0&&FIL.includes(tk[j].t)){if(KEY.includes(tk[j].t))kk=j;j--}
    if(kk>=0)a=kk;
    const st=tk[a].i,en=tk[b].e;
    return{raw:raw.slice(0,st)+' '.repeat(en-st)+raw.slice(en),tel:fmtTel(it.map(x=>x.d).join(''))}}
  return{raw:raw,tel:''}}
function parse(raw){
  let tel='';
  {const ex=extractTel(raw);raw=ex.raw;tel=ex.tel}
  const s=timeWords(nz(raw));let cut=s.length,date=null,hh=null,mm=0,first=/primera/.test(s);
  const hit=(m)=>{if(m&&m.index<cut)cut=m.index};let dsp=null;const hitD=m=>{dsp=[m.index,m.index+m[0].length];hit(m)};
  const addD=n=>{const d=new Date(today);d.setDate(d.getDate()+n);return d};
  let m;
  if(m=s.match(/pasado manana/)){date=addD(2);hitD(m)}
  else if(m=s.match(/manana/)){date=addD(1);hitD(m)}
  else if(m=s.match(/\bhoy\b/)){date=addD(0);hitD(m)}
  else if(m=s.match(/(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)/)){
    const mi=MES.indexOf(m[2]==='setiembre'?'septiembre':m[2]);date=new Date(today.getFullYear(),mi,+m[1]);
    if(date<new Date(today.getFullYear(),today.getMonth(),today.getDate()))date.setFullYear(date.getFullYear()+1);hitD(m)}
  else if(m=s.match(/(\d{1,2})\/(\d{1,2})/)){date=new Date(today.getFullYear(),+m[2]-1,+m[1]);hitD(m)}
  else if(m=s.match(new RegExp('\\b('+DIA.join('|')+')\\b'))){const i=DIA.indexOf(m[1]);date=addD((i-today.getDay()+7)%7||7);hitD(m)}
  else if(m=s.match(/\bel (\d{1,2})\b/)){date=new Date(today.getFullYear(),today.getMonth(),+m[1]);
    if(date<new Date(today.getFullYear(),today.getMonth(),today.getDate()))date.setMonth(date.getMonth()+1);hitD(m)}
  if(m=s.match(/(?:a las|a la|las)\s*(\d{1,2})(\d{2})\b(?!\s*(?:de\b|\/))/)){hh=+m[1];mm=+m[2];if(!/\d/.test(s.slice(m.index+m[0].length,m.index+m[0].length+1))&&hh>=1&&hh<8)hh+=12;hit(m)}
  else if(m=s.match(/(?:a las|a la|las)\s*(\d{1,2})(?:\s*[:.]\s*(\d{2})\b|\s*(?:h|hs|horas)\s*(\d{2})\b|\s+y\s+(media|cuarto|\d{1,2})\b|\s+(\d{2})\b(?!\s*(?:de\b|\/)))?(?:\s*(?:hs|horas|h)\b)?(?:\s*de la (manana|tarde|noche))?/)){
    hh=+m[1];const y=m[4];mm=m[2]?+m[2]:m[3]?+m[3]:y==='media'?30:y==='cuarto'?15:y?+y:m[5]?+m[5]:0;
    if((m[6]==='tarde'||m[6]==='noche')&&hh<12)hh+=12;else if(!m[6]&&hh>=1&&hh<8)hh+=12;hit(m)}
  else if(m=s.match(/(\d{1,2})(?::(\d{2}))?\s*(?:hs|horas|hora|h)\b(?:\s*y\s*(media|cuarto|\d{2}))?(?:\s*de la (manana|tarde|noche))?/)){hh=+m[1];mm=m[2]?+m[2]:(m[3]==='media'?30:m[3]==='cuarto'?15:m[3]?+m[3]:0);if((m[4]==='tarde'||m[4]==='noche')&&hh<12)hh+=12;else if(!m[4]&&hh>=1&&hh<8)hh+=12;hit(m)}
  else if(m=s.match(/(\d{1,2}):(\d{2})/)){hh=+m[1];mm=+m[2];hit(m)}
  if(hh!==null&&(hh>23||mm>59)){hh=null;mm=0}
  if(hh===null){let s2=s;if(dsp)s2=s.slice(0,dsp[0])+' '.repeat(dsp[1]-dsp[0])+s.slice(dsp[1]);
    const q=s2.match(/\b(\d{1,2})(?:\s+y\s+|\s+|:|\.)(\d{2})\b(?!\s*(?:de\b|\/))/);
    if(q&&+q[1]<=23&&+q[2]<=59){hh=+q[1];mm=+q[2];if(hh>=1&&hh<8)hh+=12;hit(q)}}
  let repeat=false,sem=12;
  if(m=s.match(/\b(?:todos los|todas las|cada)\b/)){repeat=true;hit(m)}
  if(m=s.match(/semanal/)){repeat=true;hit(m)}
  if(m=s.match(/(?:durante|por)\s+(\d+)\s+(semanas|meses)/)){sem=Math.min(104,+m[1]*(m[2]==='meses'?4:1));hit(m)}
  hit(s.match(/primera/));
  const stop=['para','el','la','de','con','turno','sesion','agendar','agendame','agenda','anota','anotame','nuevo','a','un','una','agregar','pone','poneme'];
  const w=raw.slice(0,cut).split(/\s+/).filter(x=>x&&!stop.includes(nz(x).trim()));
  const sp=splitName(w),cp=x=>x.split(/\s+/).filter(Boolean).map(y=>cap(y.toLowerCase())).join(' ');
  return{nombre:cp(sp[0]),apellido:cp(sp[1]),tel:tel,
    fecha:date?key(date):'',hora:hh!==null?String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'):'',primera:first,rec:repeat,sem:sem};
}

/* ---------- Pantalla de dictado / verificación ---------- */
var wM=false,wN=false,wQ=false,cM='',cN='',cQ='';
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let rec=null,live=false,got=false;
function fallback(){live=false;$('mic').classList.remove('on');$('cap').innerHTML='Acá el micrófono está bloqueado. Tocá el campo de abajo, después el <b>micrófono de tu teclado</b> y hablá.';$('txt').classList.add('hl');$('txt').focus()}
const view=v=>{$('vD').classList.toggle('on',v==='D');$('vR').classList.toggle('on',v==='R')};
function setMode(m){multi=m;$('mI').classList.toggle('on',!m);$('mM').classList.toggle('on',m);
  $('ok').textContent=m?'Sumar a la lista':'Agendar';drawPre()}
function drawPre(){
  $('pre').innerHTML=multi?pend.map(t=>`<span>${fmt(t.fecha).getDate()}/${fmt(t.fecha).getMonth()+1} ${t.hora} · ${t.nombre}</span>`).join(''):'';
  $('conf').style.display=multi&&pend.length?'':'none';$('dall').style.display=multi&&pend.length?'':'none';
  $('conf').textContent='Confirmar ('+pend.length+')'}
function resetSheet(){pend=[];setMode(false);$('txt').value='';$('txt').classList.remove('hl');$('cap').textContent='Tocá y decí nombre, apellido, fecha y hora. Si es primera sesión, decilo.';view('D')}
function openSheet(){$('ov').classList.add('on')}
function closeSheet(){if(rec&&live)try{rec.stop()}catch(e){}$('ov').classList.remove('on')}
function review(text){
  const p=parse(text);
  $('heard').textContent='Escuché: “'+text+'”';
  $('rn').value=p.nombre;$('ra').value=p.apellido;$('rt').value=p.tel||'';$('rf').value=p.fecha;$('rh').value=p.hora;
  $('rp').classList.toggle('on',p.primera);$('rr').classList.toggle('on',p.rec);$('rw').value=p.sem;$('rc').value=1;$('ru').value='w';$('rdu').value='w';$('rwr').style.display=p.rec?'':'none'
  autofill();$('err').textContent='';mark();view('R')}
function known(n,a){const nn=nz(n).trim(),aa=nz(a).trim();if(!nn)return null;
  ixn();const L=(ixN[nn]||[]).filter(t=>!aa||nz(t.apellido).trim()===aa);
  if(new Set(L.map(t=>tnz(t))).size!==1)return null;
  return L.slice().sort((x,y)=>x.fecha<y.fecha?1:-1).find(t=>t.tel)||L[0]}
function autofill(){const k=known($('rn').value,$('ra').value);if(!k)return;if(!$('ra').value.trim())$('ra').value=k.apellido;if(!$('rt').value.trim()&&k.tel)$('rt').value=fmtTel(k.tel);mark()}
$('rn').addEventListener('change',autofill);$('ra').addEventListener('change',autofill);
function mark(){['rn','ra','rf','rh'].forEach(i=>$(i).classList.toggle('miss',!$(i).value.trim()));$('rt').classList.toggle('miss',!telOk($('rt').value))}
const telOk=v=>String(v||'').replace(/\D/g,'').length>=10;
['rn','ra','rt','rf','rh'].forEach(i=>$(i).addEventListener('input',mark));
$('rt').addEventListener('change',()=>{$('rt').value=fmtTel($('rt').value);mark()});
$('rp').onclick=()=>$('rp').classList.toggle('on');
function dict(o){let want=true,acc='',sess='',any=false,fails=0,last=Date.now(),r;
  const done=()=>{want=false;o.onDone(acc.trim(),any)};
  r=new SR();r.lang='es-AR';r.interimResults=true;r.continuous=false;
  const jn=(a,b)=>!b||a.toLowerCase().endsWith(b.toLowerCase())?a:(a+' '+b);
  r.onresult=e=>{any=true;let out='';for(const x of e.results){const t=x[0].transcript.trim(),L=t.toLowerCase();if(!t)continue;if(!out||L.startsWith(out.toLowerCase()))out=t;else if(!out.toLowerCase().includes(L))out+=' '+t}
    sess=out;o.onText(jn(acc,sess).trim())};
  r.onerror=ev=>{const c=ev&&ev.error;if(c==='not-allowed'||c==='service-not-allowed'||c==='audio-capture'){want=false;any=true;r.onend=null;o.onFail()}};
  r.onend=()=>{acc=jn(acc,sess);sess='';if(!want){o.onDone(acc.trim(),any);return}
    const n=Date.now();fails=n-last<400?fails+1:0;last=n;if(fails>8){done();return}
    try{r.start()}catch(_){setTimeout(()=>{try{r.start()}catch(e){done()}},120)}};
  r.start();return{stop(){want=false;try{r.stop()}catch(_){}}}}
$('kbm').onclick=()=>{if(live&&rec)rec.stop();$('cap').innerHTML='Tocá el campo de abajo, después el <b>micrófono de tu teclado</b> y hablá todo lo que quieras. Al terminar tocá →.';$('txt').classList.add('hl');$('txt').focus()};
$('mic').onclick=()=>{
  if(!SR){fallback();return}
  if(live){rec.stop();return}
  try{live=true;$('mic').classList.add('on');$('cap').textContent='Escuchando…';
    rec=dict({onText:t=>{$('cap').textContent='Escuchando… '+t.slice(-70)},onDone:(t,a)=>{live=false;$('mic').classList.remove('on');if(t)review(t);else if(!a)fallback()},onFail:()=>fallback()})}
  catch(e){fallback()}
};
$('go').onclick=()=>{const v=$('txt').value.trim();if(v){review(v);$('txt').value=''}};
$('txt').onkeydown=e=>{if(e.key==='Enter')$('go').onclick()};
$('add').onclick=openSheet;$('cls').onclick=closeSheet;
$('ov').onclick=e=>{if(e.target===$('ov'))closeSheet()};
$('mI').onclick=()=>setMode(false);$('mM').onclick=()=>setMode(true);
$('desc').onclick=()=>ask('¿Estás seguro que querés descartar este turno?',()=>{if(multi)view('D');else{resetSheet();closeSheet()}});
$('dall').onclick=()=>ask('¿Estás seguro que querés descartar estos turnos?',()=>{resetSheet();closeSheet()});
function read(){
  const t={id:uid++,nombre:$('rn').value.trim(),apellido:$('ra').value.trim(),tel:fmtTel($('rt').value),fecha:$('rf').value,hora:$('rh').value,primera:$('rp').classList.contains('on')};
  if(!t.nombre||!t.apellido||!telOk(t.tel)||!t.fecha||!t.hora){mark();$('err').textContent='Faltan datos: completá lo resaltado.';return null}
  if([...turnos,...pend].some(o=>o.fecha===t.fecha&&Math.abs(mins(o.hora)-mins(t.hora))<90)){$('err').textContent='Choca con otro turno (60 min + 30 min de margen).';return null}
  return t}
function saveMany(list){list.forEach(saveT)}
function finish(list){list.forEach(t=>{t.by=me?me.id:''});saveMany(list);sel=list[0].fecha;const d=fmt(sel);vy=d.getFullYear();vm=d.getMonth();resetSheet();closeSheet();render()}
function addDays(k,n){const d=fmt(k);d.setDate(d.getDate()+n);return key(d)}
function build(){
  const b={nombre:$('rn').value.trim(),apellido:$('ra').value.trim(),tel:fmtTel($('rt').value),fecha:$('rf').value,hora:$('rh').value,primera:$('rp').classList.contains('on')};
  if(!b.nombre||!b.apellido||!telOk(b.tel)||!b.fecha||!b.hora){mark();$('err').textContent=$('rt').value.trim()&&!telOk(b.tel)?'El teléfono tiene que incluir la característica (ej. 11 2345 6789).':'Faltan datos: completá lo resaltado.';return null}
  if(!$('rr').classList.contains('on'))return[{...b,id:gid()}];
  const c=Math.max(1,+$('rc').value||1),u=$('ru').value,N=Math.max(1,+$('rw').value||1),du=$('rdu').value,st=fmt(b.fecha),end=new Date(st);
  if(du==='m')end.setMonth(end.getMonth()+N);else if(du==='y')end.setFullYear(end.getFullYear()+N);else end.setDate(end.getDate()+7*N);
  const L=[],sid=gid();
  for(let i=0;i<200;i++){const d=new Date(st);
    if(u==='m'){d.setDate(1);d.setMonth(st.getMonth()+c*i);d.setDate(Math.min(st.getDate(),new Date(d.getFullYear(),d.getMonth()+1,0).getDate()))}else d.setDate(st.getDate()+(u==='w'?7:1)*c*i);
    if(d>end&&i>0)break;L.push({...b,id:gid(),fecha:key(d),serie:sid})}
  if(L.length<2)delete L[0].serie;return L}
function serieAsk(t,title,cb){
  const k=x=>x.fecha+x.hora,sib=t.serie?turnos.filter(x=>x.serie===t.serie).sort((a,b)=>k(a)<k(b)?-1:1):[];
  if(sib.length<2){cb([t]);return}
  const aft=sib.filter(x=>k(x)>=k(t)),o=document.createElement('div');o.className='ov2 on';
  const B='width:100%;margin-bottom:8px;height:46px';
  o.innerHTML=`<div class="sheet"><div class="heard" style="font-size:16px;font-weight:600;color:var(--fg)">${title}: es parte de una serie</div><div id="sq"><button style="${B}" data-m="1">Solo este</button><button style="${B}" data-m="2">Este y los siguientes (${aft.length})</button><button style="${B}" data-m="3">Todos (${sib.length})</button><button style="${B}" data-m="4">Elegir cuáles…</button><button style="${B}" data-m="0">Cancelar</button></div></div>`;
  document.body.appendChild(o);const q=o.querySelector('#sq'),end=l=>{o.remove();if(l&&l.length)cb(l)};
  q.onclick=e=>{const m=e.target.dataset.m;if(m===undefined)return;
    if(m==='0')end();else if(m==='1')end([t]);else if(m==='2')end(aft);else if(m==='3')end(sib);
    else{q.innerHTML=sib.map(x=>`<label class="r" style="display:flex;align-items:center;justify-content:space-between"><span>${esc(lab(x))}</span><input type="checkbox" data-i="${x.id}"${x===t?' checked':''}></label>`).join('')+`<button style="${B}" class="pri" id="sgo">Aplicar</button><button style="${B}" id="scn">Cancelar</button>`;
      q.querySelector('#sgo').onclick=()=>end(sib.filter(x=>q.querySelector('[data-i="'+x.id+'"]').checked));q.querySelector('#scn').onclick=()=>end()}}}
function place(list){if(multi){pend.push(...list);drawPre();view('D')}else finish(list)}
$('rr').onclick=()=>{$('rr').classList.toggle('on');$('rwr').style.display=$('rr').classList.contains('on')?'':'none'};
$('ok').onclick=()=>{
  const list=build();if(!list)return;
  const bad=[],good=[];
  list.forEach(t=>{const c=confl(t,multi?pend:[]);if(c)bad.push([t,c]);else good.push(t)});
  if(!bad.length){$('err').textContent='';place(list);return}
  if(list.length===1){$('err').innerHTML=cap(bad[0][1])+'.';return}
  $('err').innerHTML=bad.length+' de '+list.length+' fechas no se pueden agendar:<br>'+bad.slice(0,4).map(([t,c])=>'• '+lab(t)+': '+c).join('<br>')+(bad.length>4?'<br>…y '+(bad.length-4)+' más':'');
  if(good.length){const k=document.createElement('button');k.className='skp';k.textContent='Agendar sin esas fechas ('+good.length+')';k.onclick=()=>{$('err').textContent='';place(good)};$('err').appendChild(document.createElement('br'));$('err').appendChild(k)}};
$('conf').onclick=()=>finish(pend);

/* ---------- Confirmación ---------- */
let yesFn=null;
function ask(msg,fn,label){$('cft').textContent=msg;$('cfy').textContent=label||'Descartar';yesFn=fn;$('cf').classList.add('on')}
$('cfn').onclick=()=>$('cf').classList.remove('on');
$('cfy').onclick=()=>{$('cf').classList.remove('on');const f=yesFn;yesFn=null;if(f)f()};

/* ---------- Lista: abrir, editar, borrar, notas ---------- */
$('lista').onclick=e=>{
  const c=e.target.closest('.t');if(!c)return;const id=c.dataset.id,a=e.target.closest('[data-a]');
  if(a){
    if(a.dataset.a==='ok'){const t=turnos.find(x=>x.id===id);if(window.approveT)approveT(t);else{t.estado='confirmado';saveT(t);render()}}else if(a.dataset.a==='n')openNotes(id);
    else if(a.dataset.a==='e')openEdit(id);
    else{const t=turnos.find(x=>x.id===id);serieAsk(t,'Borrar',l=>ask(l.length>1?'¿Borrar '+l.length+' turnos de '+t.nombre+' '+t.apellido+'?':'¿Borrar el turno de '+t.nombre+' '+t.apellido+'?',()=>{l.forEach(x=>delT(x.id));openId=null;render()},'Borrar'))}
    return}
  openId=openId===id?null:id;render()};

let eid=null;
function openEdit(id){const t=turnos.find(x=>x.id===id);eid=id;$('en').value=t.nombre;$('ea').value=t.apellido;$('et').value=t.tel?fmtTel(t.tel):'';$('et').classList.remove('miss');$('ef').value=t.fecha;$('eh').value=t.hora;$('ep').classList.toggle('on',!!t.primera);$('eerr').textContent='';$('ed').classList.add('on')}
$('ep').onclick=()=>$('ep').classList.toggle('on');
$('et').addEventListener('change',()=>{$('et').value=fmtTel($('et').value)});
$('ecan').onclick=()=>$('ed').classList.remove('on');
$('ed').onclick=e=>{if(e.target===$('ed'))$('ed').classList.remove('on')};
$('esave').onclick=()=>{
  const t=turnos.find(x=>x.id===eid),n=$('en').value.trim(),a=$('ea').value.trim(),f=$('ef').value,h=$('eh').value,tl=fmtTel($('et').value);
  $('et').classList.toggle('miss',!telOk(tl));
  if(!n||!a||!f||!h||!telOk(tl)){$('eerr').textContent=!telOk(tl)&&$('et').value.trim()?'El teléfono tiene que incluir la característica (ej. 11 2345-6789).':'Completá todos los datos (incluido el teléfono).';return}
  if(turnos.some(o=>o.id!==eid&&o.fecha===f&&Math.abs(mins(o.hora)-mins(h))<90)){$('eerr').textContent='Choca con otro turno (60 min + 30 min de margen).';return}
  const pr=$('ep').classList.contains('on');
  serieAsk(t,'Guardar cambios',list=>{
    const dd=Math.round((fmt(f)-fmt(t.fecha))/864e5),pl=list.map(x=>({x,nf:x===t?f:addDays(x.fecha,dd)})),bad=pl.find(({nf})=>turnos.some(o=>!list.includes(o)&&o.fecha===nf&&Math.abs(mins(o.hora)-mins(h))<90));
    if(bad){$('eerr').textContent='Choca con otro turno el '+lab({fecha:bad.nf,hora:h})+'.';return}
    pl.forEach(({x,nf})=>{Object.assign(x,{nombre:n,apellido:a,tel:tl,fecha:nf,hora:h,primera:x===t?pr:x.primera});x.editedBy=me?me.id:'';saveT(x)});
    sel=f;const d=fmt(f);vy=d.getFullYear();vm=d.getMonth();$('ed').classList.remove('on');render()})};

let nid=null;
let ntar=null;const cur=()=>ntar;
function drawFiles(){$('nf').innerHTML=(cur().files||[]).map((f,i)=>`<div class="fl"><a href="#" data-p="${esc(f.path||'')}">📎 ${esc(f.name)}</a><button data-i="${i}" aria-label="Quitar">×</button></div>`).join('')}
function openNotes(id){nid=id;ntar=turnos.find(x=>x.id===id);const t=cur();$('ntt').textContent='Notas · '+t.nombre+' '+t.apellido+' · '+t.hora;$('nta').value=lnote(t);$('nhint').textContent='Nota de '+t.nombre+': vale para todas sus sesiones. Solo en este dispositivo.';drawFiles();$('nt').classList.add('on')}
function closeNotes(){if(nrec&&nlive)try{nrec.stop()}catch(e){}const g=cur(),v=$('nta').value.trim();if(g.gen){g.notes=v;g.ts=Date.now();if(!g.notes&&!(g.files||[]).length)delG(g);else saveG(g)}else{lset(nk(g),v);lset(g.id,'')}$('nt').classList.remove('on');render();renderN()}
$('ndone').onclick=closeNotes;
$('nt').onclick=e=>{if(e.target===$('nt'))closeNotes()};
$('nat').onclick=()=>$('nfi').click();
let nrec=null,nlive=false,ngot=false;
function nkb(){nlive=false;$('ndic').classList.remove('on');$('ndic').innerHTML=MI+' Dictar';$('nhint').innerHTML='Acá el micrófono está bloqueado. Tocá la nota y usá el <b>micrófono de tu teclado</b>.';$('nta').focus()}
$('ndic').onclick=()=>{
  if(!SR){nkb();return}
  if(nlive){nrec.stop();return}
  const b=$('nta').value,sp=b&&!/\s$/.test(b)?' ':'';
  try{nlive=true;$('ndic').classList.add('on');$('ndic').textContent='⏹ Escuchando…';$('nhint').textContent='';
    nrec=dict({onText:t=>{$('nta').value=b+sp+t},onDone:(t,a)=>{nlive=false;$('ndic').classList.remove('on');$('ndic').innerHTML=MI+' Dictar';$('nta').value=b+(t?sp+t:'');if(!a)nkb()},onFail:()=>nkb()})}
  catch(e){nkb()}
};
$('nfi').onchange=async e=>{const t=cur();if(!t.gen){$('nhint').textContent='Los archivos van en las Notas generales: las notas de sesión no se sincronizan.';e.target.value='';return}t.files=t.files||[];if(!window.uploadFile){$('nhint').textContent='Los archivos necesitan la agenda en línea.';return}$('nhint').textContent='Subiendo…';for(const f of [...e.target.files]){const x=await window.uploadFile(f);if(x)t.files.push(x)}e.target.value='';$('nhint').textContent='';drawFiles();(t.gen?saveG:saveT)(t)};
$('nf').onclick=e=>{const a=e.target.closest('a[data-p]');if(a){e.preventDefault();if(window.openFile)window.openFile(a.dataset.p);return}const b=e.target.closest('button');if(!b)return;const t=cur();t.files.splice(+b.dataset.i,1);drawFiles();(t.gen?saveG:saveT)(t)};


/* ---------- Pestañas ---------- */
function tab(n){
  $('app').style.display=n==='a'?'':'none';$('pgN').classList.toggle('on',n==='n');$('pgS').classList.toggle('on',n==='s');
  $('bar').style.display=(n==='a'&&canW)?'':'none';
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===n));
  if(n==='a')render();if(n==='n')renderN();if(n==='s')sub('m');window.scrollTo(0,0)}
$('nav').onclick=e=>{const b=e.target.closest('button');if(b)tab(b.dataset.t)};

/* ---------- Anotador general ---------- */
let gnotes=window.SUPABASE_URL?[]:[{id:'g1',gen:1,notes:'Ideas para la agenda\nRecordar renovar el alquiler del consultorio.',files:[],ts:Date.now()}];
function renderN(){
  $('nlist').innerHTML=gnotes.length?gnotes.slice().sort((a,b)=>b.ts-a.ts).map(g=>{const l=(g.notes||'').split('\n');
    return `<div class="t" data-g="${esc(g.id)}"><div style="flex:1;min-width:0"><span class="gt">${esc(l[0]||'Sin texto')}</span><div class="mut">${esc(l.slice(1).join(' ').slice(0,80))}${(g.files||[]).length?' 📎'+g.files.length:''}</div></div><button class="nb empty0" data-x="${esc(g.id)}" aria-label="Borrar">🗑</button></div>`}).join(''):'<div class="empty">Todavía no hay notas</div>'}
$('nlist').onclick=e=>{
  const x=e.target.closest('[data-x]');
  if(x){ask('¿Borrar esta nota?',()=>{delG(gnotes.find(g=>g.id===x.dataset.x));renderN()},'Borrar');return}
  const c=e.target.closest('[data-g]');if(c)openGen(gnotes.find(g=>g.id===c.dataset.g))};
$('nnew').onclick=()=>{const g={id:'g'+Date.now(),gen:1,notes:'',files:[],ts:Date.now()};openGen(g)};
function openGen(g){ntar=g;$('ntt').textContent='Nota';$('nta').value=g.notes||'';$('nhint').textContent='';drawFiles();$('nt').classList.add('on')}

/* ---------- Asistente (Consultar) ---------- */
let lastQ='',arec=null,alive=false,agot=false;
const EJ=['Mostrame las sesiones que tengo ...','Mostrame los horarios libres que tengo ...','Agendá a ... todos los ... a las ...','Pasá la sesión de ... del ... al ...','Buscame un horario libre ...'];
const chips=()=>'<div style="font-size:12px;line-height:1.8;color:var(--mute)">'+EJ.map(q=>'· '+esc(q)).join('<br>')+'</div>';
const say=h=>{$('ares').innerHTML=(lastQ?`<div class="mut" style="white-space:normal;margin-bottom:8px">“${esc(lastQ)}”</div>`:'')+h};
function aHome(){lastQ='';$('ahint').textContent='';say('<div class="mut" style="white-space:normal;margin-bottom:8px">Pedime algo con tu voz o escribiendo. Por ejemplo:</div>'+chips())}
function closeA(){if(arec&&alive)try{arec.stop()}catch(e){}$('as').classList.remove('on')}
function sendA(){const v=$('aq').value.trim();if(!v)return;$('aq').value='';lastQ=v;$('ahint').textContent='';askA(v)}
function pdate(s){
  const b=new Date(today.getFullYear(),today.getMonth(),today.getDate()),a=n=>{const d=new Date(b);d.setDate(b.getDate()+n);return d};
  let m;
  if(/pasado manana/.test(s))return a(2);
  if(/manana/.test(s))return a(1);
  if(/\bhoy\b/.test(s))return a(0);
  if(m=s.match(/(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)/)){const d=new Date(b.getFullYear(),MES.indexOf(m[2]==='setiembre'?'septiembre':m[2]),+m[1]);if(d<b)d.setFullYear(d.getFullYear()+1);return d}
  if(m=s.match(/(\d{1,2})\/(\d{1,2})/))return new Date(b.getFullYear(),+m[2]-1,+m[1]);
  if(m=s.match(new RegExp('\\b('+DIA.join('|')+')\\b')))return a((DIA.indexOf(m[1])-b.getDay()+7)%7);
  return null}
function ptime(s){
  let m,h=null,mi=0;
  if(m=s.match(/(?:a las|a la|las)\s*(\d{1,2})(?::(\d{2}))?(?:\s*y\s*(media|cuarto|\d{2}))?(?:\s*(?:hs|horas|h)\b)?(?:\s*de la (manana|tarde|noche))?/)){h=+m[1];mi=m[2]?+m[2]:(m[3]==='media'?30:m[3]==='cuarto'?15:m[3]?+m[3]:0);if((m[4]==='tarde'||m[4]==='noche')&&h<12)h+=12;else if(!m[4]&&h>=1&&h<8)h+=12}
  else if(m=s.match(/(\d{1,2}):(\d{2})/)){h=+m[1];mi=+m[2]}
  return h===null?'':String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0')}
function askA(raw){
  const s=nz(raw).trim();
  if(/\b(pasa|pasame|pasar|mueve|mueveme|mover|cambia|cambiame|cambiar|reprograma|reprogramar)\b/.test(s)&&/\b(sesion|turno)\b/.test(s))return aMove(raw,s);
  if(/^\W*(?:por favor\s+)?(agenda|agendame|agendar|anota|anotame|anotar|suma|sumame|programa|programame)\b/.test(s)||/\b(agendame|agendar|anotame)\b/.test(s)){closeA();openSheet();review(raw);return}
  if(/\b(libre|libres|hueco|huecos|disponible|disponibles|horario|horarios)\b/.test(s))return aFree(s);
  if(/\b(mostra|mostrame|muestra|muestrame|mostrar|ver|decime|dime|que|cuantas|cuantos|tengo|sesiones|turnos|agenda)\b/.test(s))return aShow(s);
  say('No te entendí. Probá con alguno de estos:'+chips())}
function aShow(s){
  const base=new Date(today.getFullYear(),today.getMonth(),today.getDate());let days=[];
  if(/semana/.test(s)){const off=/(que viene|proxima|siguiente)/.test(s)?7:0,mon=new Date(base);mon.setDate(base.getDate()-((base.getDay()+6)%7)+off);for(let i=0;i<7;i++){const d=new Date(mon);d.setDate(mon.getDate()+i);days.push(d)}}
  else days=[pdate(s)||base];
  let h='',tot=0;
  days.forEach(d=>{const k=key(d),l=turnos.filter(t=>t.fecha===k).sort((a,b)=>mins(a.hora)-mins(b.hora));tot+=l.length;
    if(days.length>1&&!l.length)return;
    h+=`<div class="mut" style="margin:10px 0 4px;text-transform:capitalize">${d.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}</div>`+(l.length?l.map(t=>`<div class="t" style="cursor:default"><b style="border-left-color:${colorOf(t.by)}">${t.hora}</b><span>${esc(t.nombre+' '+t.apellido)}</span></div>`).join(''):'<div class="empty">Sin sesiones</div>')});
  say((tot?'Tenés '+tot+(tot>1?' sesiones:':' sesión:'):'No tenés sesiones en ese período.')+h+(days.length===1?`<button class="slot" data-v="${key(days[0])}">Ver en el calendario</button>`:''))}
function aMove(raw,s){
  const help='Decime de quién es y a qué día, por ejemplo: Pasá la sesión de Gustavo del jueves al viernes.';
  const stop=['del','de','el','al','para','a','la','hoy','manana','pasado','este','esta','proximo','que','hasta'].concat(DIA);
  const m=s.match(/\b(?:sesion|turno)\s+(?:de|del)\s+([a-z]+)(?:\s+([a-z]+))?/);
  const w=m?[m[1],m[2]].filter(x=>x&&!stop.includes(x)):[];
  if(!w.length){say(help);return}
  const rest=s.slice(m.index+m[0].length),parts=rest.split(/\s(?:al|para el|para|hasta el)\s/);
  const fromS=parts.length>1?parts[0]:'',toS=parts.length>1?parts[1]:parts[0];
  const dowOf=x=>{const q=x.match(new RegExp('\\b('+DIA.join('|')+')\\b'));return q?DIA.indexOf(q[1]):-1};
  const fdow=dowOf(fromS),fdate=fdow<0?pdate(fromS):null;
  let cand=turnos.filter(t=>t.fecha>=key(today)&&w.every(x=>nz(t.nombre+' '+t.apellido).split(' ').some(p=>p.startsWith(x))));
  if(fdow>=0)cand=cand.filter(t=>fmt(t.fecha).getDay()===fdow);else if(fdate)cand=cand.filter(t=>t.fecha===key(fdate));
  cand.sort((a,b)=>(a.fecha+a.hora<b.fecha+b.hora)?-1:1);
  if(!cand.length){say('No encontré una sesión de '+esc(cap(w[0]))+(fromS.trim()?' ese día':' próxima')+'.');return}
  const ppl=[...new Set(cand.map(t=>t.nombre+' '+t.apellido))];
  if(ppl.length>1){say('Hay más de una persona: '+ppl.map(p=>esc(p)).join(', ')+'. Decime también el apellido.');return}
  const t=cand[0],tdow=dowOf(toS),tdate=tdow<0?pdate(toS):null;
  let nd;
  if(tdow>=0){const d=fmt(t.fecha);d.setDate(d.getDate()+((tdow-d.getDay()+7)%7||7));nd=key(d)}
  else if(tdate)nd=key(tdate);
  else{say(help);return}
  const nh=ptime(toS)||t.hora;
  const c=confl({fecha:nd,hora:nh},[],t.id);
  if(c){say('No se puede pasar al '+lab({fecha:nd,hora:nh})+': '+c+'.');return}
  ask('¿Pasar la sesión de '+t.nombre+' '+t.apellido+' del '+lab(t)+' al '+lab({fecha:nd,hora:nh})+'?',()=>{t.fecha=nd;t.hora=nh;t.editedBy=me?me.id:'';saveT(t);render();say('Listo: la sesión de '+esc(t.nombre+' '+t.apellido)+' quedó el '+lab(t)+'.')},'Pasar')}
function prefill(f,h){openSheet();$('heard').textContent='Horario elegido: '+lab({fecha:f,hora:h});$('rn').value='';$('ra').value='';$('rt').value='';$('rf').value=f;$('rh').value=h;$('rp').classList.remove('on');$('rr').classList.remove('on');$('rwr').style.display='none';$('err').textContent='';mark();view('R')}
$('ares').onclick=e=>{
  const b=e.target.closest('.slot');if(!b)return;
  if(b.dataset.q){const v=b.dataset.q;$('aq').value=v;$('aq').focus();const i=v.indexOf('...');if(i>=0)$('aq').setSelectionRange(i,i+3);return}
  if(b.dataset.v){closeA();sel=b.dataset.v;const d=fmt(sel);vy=d.getFullYear();vm=d.getMonth();render();return}
  closeA();prefill(b.dataset.d,b.dataset.h)};
$('ask').onclick=()=>{aHome();$('as').classList.add('on')};
$('as').onclick=e=>{if(e.target===$('as'))closeA()};
$('ago').onclick=sendA;
$('aq').onkeydown=e=>{if(e.key==='Enter')sendA()};
function akb(){alive=false;$('amic').classList.remove('on');$('ahint').innerHTML='Acá el micrófono está bloqueado. Tocá el campo y usá el <b>micrófono de tu teclado</b>.';$('aq').focus()}
$('amic').onclick=()=>{
  if(!SR){akb();return}
  if(alive){arec.stop();return}
  try{alive=true;$('amic').classList.add('on');$('ahint').textContent='Escuchando…';
    arec=dict({onText:t=>{$('aq').value=t},onDone:(t,a)=>{alive=false;$('amic').classList.remove('on');if(t){$('aq').value=t;sendA()}else if(!a)akb()},onFail:()=>akb()})}
  catch(e){akb()}};

/* ---------- Cuenta, sincronización y miembros ---------- */
const LINK=()=>window.AGENDA_LINK||location.href;
const PAL=['#BDBDBD','#4DA3FF','#FF6B6B','#4CD9A0','#B084FF','#FF9F43','#2EC4B6','#F368E0'];
let db=null,me=null,members=[],mname={},canW=true,isAdm=false,isOwn=false,LOAD=!!window.SUPABASE_URL,LERR='';
const mcol=id=>{const m=members.find(x=>x.id===id);return m?sc(m.color):'var(--y)'};
let gT=0,gN=0;const rnd=n=>{const a=new Uint8Array(n);crypto.getRandomValues(a);return[...a].map(x=>(x%36).toString(36)).join('')};
const gid=()=>{const t=Date.now();gN=t===gT?gN+1:0;gT=t;return t.toString(36)+gN.toString(36).padStart(2,'0').slice(-2)+rnd(2)};
const strip=t=>({...t});
const capName=s=>String(s||'').trim().replace(/(^|[\s\-'])(\p{L})/gu,(m,a,b)=>a+b.toUpperCase());
const ftel=v=>{try{return v?(fmtTel(v)||v):v}catch(e){return v}};
function saveT(t){tv++;t.nombre=capName(t.nombre);t.apellido=capName(t.apellido);if(t.tel)t.tel=ftel(t.tel);if(!turnos.includes(t))turnos.push(t);if(db)db.doc('turnos/'+t.id).set(strip(t)).catch(()=>{})}
function delT(id){tv++;turnos=turnos.filter(x=>x.id!==id);if(db)db.doc('turnos/'+id).delete().catch(()=>{})}
function saveG(g){if(!gnotes.includes(g))gnotes.push(g);if(db)db.doc('gnotes/'+g.id).set(strip(g)).catch(()=>{})}
function delG(g){if(!g)return;gnotes=gnotes.filter(x=>x!==g);if(db)db.doc('gnotes/'+g.id).delete().catch(()=>{})}
function saveCfg(){if(db)db.doc('config/main').set({horas:cfg.horas,blocks:cfg.blocks}).catch(()=>{})}
function legend(){if(LERR){$('leg').innerHTML='No se pudo cargar la agenda. Revisá tu conexión y <u>tocá acá para reintentar</u>.';return}if(LOAD){$('leg').textContent='Cargando agenda…';return}$('leg').innerHTML=db?(members.length>1?members.filter(m=>!m.removed).map(m=>`<span><i class="dot" style="display:inline-block;vertical-align:-2px;background:${sc(m.color)}"></i> ${esc(mname[m.id]||'Miembro')}</span>`).join(''):''):'Sin conexión: no se guarda ni se sincroniza. Iniciá sesión para guardar.'}
function renderM(){
  if(me&&document.activeElement!==$('myname'))$('myname').value=mname[me.id]||'';
  $('mlist').innerHTML=members.length?members.map(m=>{const mine=me&&m.id===me.id,own=m.role==='owner';
    const st=own?'Dueño':m.removed?'Sin acceso':m.role==='viewer'?'Solo ver':'Mismos permisos que el dueño';
    return `<div class="t" style="cursor:default"><span class="dot" style="background:${sc(m.color)}"></span><div style="flex:1;min-width:0"><span class="gt">${esc(mname[m.id]||'Miembro')}${mine?' (vos)':''}</span><div class="mut">${st}</div></div>${isOwn&&!own?`<button class="nb" data-m="${esc(m.id)}" data-a="rol">${m.removed?'Restaurar':m.role==='viewer'?'Dar permisos':'Solo ver'}</button>${m.removed?'':`<button class="nb empty0" data-m="${esc(m.id)}" data-a="del">Quitar</button>`}`:''}${(isAdm||mine)?`<div class="pal">${PAL.map(c=>`<i data-m="${esc(m.id)}" data-c="${c}" style="background:${c}"></i>`).join('')}</div>`:''}</div>`}).join('')+(db&&(isAdm)?`<div class="t" style="cursor:default"><span class="dot" style="background:${OTRO}"></span><div style="flex:1;min-width:0"><span class="gt">Reservas por link</span><div class="mut">Color de los turnos que reservan solos</div></div><div class="pal">${PAL.map(c=>`<i data-m="otro" data-c="${c}" style="background:${c}"></i>`).join('')}</div></div>`:''):'<div class="empty">Iniciá sesión en Claude para ver y administrar a los miembros.</div>'}
$('leg').onclick=()=>{if(LERR)location.reload()};
$('mlist').onclick=e=>{
  if(!db)return;
  const c=e.target.closest('[data-c]');if(c){if(c.dataset.m==='otro'){OTRO=c.dataset.c;db.doc('config/otro').set({color:OTRO});render();renderM()}else db.doc('members/'+c.dataset.m).update({color:c.dataset.c});return}
  const b=e.target.closest('[data-a]');if(!b||!isOwn)return;const id=b.dataset.m,m=members.find(x=>x.id===id);
  if(b.dataset.a==='rol')db.doc('members/'+id).update(m.removed?{removed:false,role:'admin'}:{role:m.role==='viewer'?'admin':'viewer'});
  else ask('¿Quitar a '+(mname[id]||'este miembro')+' de la agenda?',()=>db.doc('members/'+id).update({removed:true,role:'viewer'}),'Quitar')};
$('goP').addEventListener('click',()=>{$('slink').value=LINK();$('srot').style.display=isOwn?'':'none'});
$('srot').onclick=()=>ask('El link de invitación anterior deja de funcionar. ¿Crear uno nuevo?',async()=>{const l=await(window.rotateInvite&&window.rotateInvite());if(l){$('slink').value=l;$('shint').textContent='Link nuevo listo para compartir.'}else $('shint').textContent='No se pudo cambiar el link.'},'Cambiar');
$('goOut').onclick=()=>window.logout&&window.logout();
$('scopy').onclick=async()=>{try{await navigator.clipboard.writeText(LINK());$('shint').textContent='Link copiado.'}catch(e){$('slink').select();try{document.execCommand('copy');$('shint').textContent='Link copiado.'}catch(_){$('shint').textContent='Mantené apretado el link para copiarlo.'}}};
$('wlo').onclick=()=>$('wl').classList.remove('on');
function sub(n){$('sMenu').style.display=n==='m'?'':'none';$('sH').style.display=n==='H'?'':'none';$('sP').style.display=n==='P'?'':'none';$('sback').style.display=n==='m'?'none':'';$('sttl').textContent=n==='H'?'Horarios':n==='P'?'Permisos':'Ajustes';if(n==='H')renderS();if(n==='P')renderM()}
$('goH').onclick=()=>sub('H');$('goP').onclick=()=>sub('P');$('sback').onclick=()=>sub('m');
(async()=>{
  try{
    if(typeof claude==='undefined')throw 0;
    const user=await claude.use('user'),d=await claude.use('db');
    if(!user||!d)throw 0;
    me=await user.me();if(!me.id)throw 0;
    db=d;turnos=[];gnotes=[];cfg.blocks=[];
    const owner=await user.isOwner(),canEd=await user.canEdit();isAdm=owner||canEd;isOwn=owner;
    const mm=await db.doc('members/'+me.id).get(),old=mm.exists?mm.data():null;let nmv=(old&&old.name)||'';if(!nmv)nmv=await askName();if(owner)db.doc('meta/main').set({ownerId:me.id,ownerName:nmv}).catch(()=>{});
    
    if(!mm.exists){
      await db.doc('members/'+me.id).set({color:PAL[[...me.id].reduce((a,c)=>a+c.charCodeAt(0),0)%PAL.length],name:nmv,role:owner?'owner':'admin',joined:Date.now()});
      if(!owner){const mt=await db.doc('meta/main').get(),on=mt.exists&&mt.data().ownerName;
        $('wlt').textContent='Te has unido a la agenda de '+(on||'su dueño');$('wl').classList.add('on')}}else if(!old.name)await db.doc('members/'+me.id).update({name:nmv});
    const TM=new WeakMap(),okT=d=>d&&typeof d==='object'&&d.id!=null&&/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)&&/^\d{1,2}:\d{2}$/.test(d.hora);
    db.collection('turnos').onSnapshot(s=>{const L=[];for(const x of s.docs){const d=x.data();let r=TM.get(d);if(r===undefined){r=okT(d)?{...d,id:String(d.id),nombre:capName(d.nombre),apellido:capName(d.apellido),tel:ftel(d.tel),files:Array.isArray(d.files)?d.files:[]}:null;TM.set(d,r)}if(r)L.push(r)}turnos=L;tv++;render()});
    db.collection('gnotes').onSnapshot(s=>{gnotes=s.docs.map(x=>({...x.data(),files:Array.isArray(x.data().files)?x.data().files:[]}));renderN()});
    db.doc('config/main').onSnapshot(s=>{if(s.exists){const c=JSON.parse(JSON.stringify(s.data()));cfg.horas=Array.isArray(c.horas)&&c.horas.length===7?c.horas:cfg.horas;cfg.blocks=Array.isArray(c.blocks)?c.blocks:[];renderS();render()}else if(canW)saveCfg()});
    db.collection('members').onSnapshot(async s=>{
      members=s.docs.map(x=>({...x.data(),id:x.id}));
      const mine=members.find(x=>x.id===me.id);canW=!(mine&&(mine.role==='viewer'||mine.removed));isAdm=owner||canEd||!!(mine&&mine.role!=='viewer'&&!mine.removed);
      $('bar').style.display=(canW&&$('app').style.display!=='none')?'':'none';
      const p=await user.profiles(members.map(x=>x.id));members.forEach(x=>{mname[x.id]=x.name||(p[x.id]&&p[x.id].name)||''});
      legend();renderM();render()});
  }catch(e){console.error('Conexión:',e);db=null;if(e instanceof Error)LERR=e.message||'x'}
  LOAD=false;if(window.mark)mark('listo');legend();render();
})();

function askName(){return new Promise(r=>{$('nm').classList.add('on');$('nmok').onclick=()=>{const v=$('nmi').value.trim();if(v){$('nm').classList.remove('on');r(v)}}})}
$('mynsave').onclick=()=>{const v=$('myname').value.trim();if(!v||!db)return;db.doc('members/'+me.id).update({name:v});const m=members.find(x=>x.id===me.id);if(m&&m.role==='owner')db.doc('meta/main').update({ownerName:v}).catch(()=>{})};
function aFree(s){
  let min=0,max=1440,m;
  if(m=s.match(/despues de (?:las |la )?(\d{1,2})(?::(\d{2}))?/)){let h=+m[1];if(h>=1&&h<8)h+=12;min=h*60+(m[2]?+m[2]:0)}
  if(m=s.match(/antes de (?:las |la )?(\d{1,2})(?::(\d{2}))?/)){let h=+m[1];if(h>=1&&h<8)h+=12;max=h*60+(m[2]?+m[2]:0)}
  const base=new Date(today.getFullYear(),today.getMonth(),today.getDate()),ymd=key(base),nw=new Date(),now=nw.getHours()*60+nw.getMinutes();
  const hm=st=>String(Math.floor(st/60)).padStart(2,'0')+':'+String(st%60).padStart(2,'0');
  const slots=d=>{const k=key(d),o=[];for(let st=0;st<1440;st+=30){if(st<min||st+60>max||(k===ymd&&st<=now))continue;const t={fecha:k,hora:hm(st)};if(!confl(t,[]))o.push(t)}return o};
  let days=null;
  if(/semana/.test(s)){const off=/(que viene|proxima|siguiente)/.test(s)?7:0,mon=new Date(base);mon.setDate(base.getDate()-((base.getDay()+6)%7)+off);days=[0,1,2,3,4,5,6].map(i=>{const d=new Date(mon);d.setDate(mon.getDate()+i);return d}).filter(d=>key(d)>=ymd)}
  else{const one=pdate(s);if(one){if(key(one)<ymd){say('Esa fecha ya pasó.');return}days=[one]}}
  if(days){
    let h='',tot=0;
    days.forEach(d=>{const l=slots(d);tot+=l.length;h+=`<div class="mut" style="margin:10px 0 4px;text-transform:capitalize">${d.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}</div>`+(l.length?l.map(t=>`<button class="slot" data-d="${t.fecha}" data-h="${t.hora}">${t.hora}</button>`).join(''):'<div class="mut">Sin horarios libres</div>')});
    say((tot?'Estos son todos los horarios libres (tocá uno para agendar):':'No hay horarios libres en ese período.')+h);return}
  const out=[];
  for(let i=0;i<60&&out.length<8;i++){const d=new Date(base);d.setDate(base.getDate()+i);const l=slots(d).slice(0,3);if(l.length)out.push(...l)}
  say(out.length?'Los próximos horarios libres (tocá uno para agendar):<br>'+out.map(t=>`<button class="slot" data-d="${t.fecha}" data-h="${t.hora}">${lab(t)}</button>`).join(''):'No encontré horarios libres con esas condiciones.')}

/* ---------- Ajustes ---------- */
function fS(k){const d=fmt(k);return d.toLocaleDateString('es-AR',d.getFullYear()!==today.getFullYear()?{day:'numeric',month:'short',year:'numeric'}:{day:'numeric',month:'short'})}
function renderS(){
  const nm=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  $('hrs').innerHTML=[1,2,3,4,5,6,0].map(d=>{const h=cfg.horas[d];
    return `<div class="r hr" data-d="${d}"><label>${nm[d]}</label><button class="sw${h.on?' on':''}" aria-label="${nm[d]}"></button><input type="time" data-k="desde" value="${h.desde}"${h.on?'':' disabled'}><span>–</span><input type="time" data-k="hasta" value="${h.hasta}"${h.on?'':' disabled'}></div>`}).join('');
  $('blist').innerHTML=cfg.blocks.length?cfg.blocks.map(b=>`<div class="t" data-id="${b.id}"><div style="flex:1;min-width:0"><span class="gt">${esc(b.motivo||'Bloqueo')}</span><div class="mut">${b.dias?'Todos los '+b.dias.slice().sort((x,y)=>((x+6)%7)-((y+6)%7)).map(d=>DN[d]).join(', '):fS(b.desde)+(b.hasta!==b.desde?' – '+fS(b.hasta):'')}${b.hd?' · '+b.hd+' a '+b.hh:' · todo el día'}</div></div><button class="nb empty0" data-b="${b.id}" aria-label="Quitar">🗑</button></div>`).join(''):'<div class="empty">Sin bloqueos</div>'}
$('hrs').onclick=e=>{const s=e.target.closest('.sw');if(!s)return;const h=cfg.horas[+s.closest('.hr').dataset.d];h.on=!h.on;saveCfg();renderS();render()};
$('hrs').onchange=e=>{const i=e.target;if(i.type!=='time'||!i.value)return;cfg.horas[+i.closest('.hr').dataset.d][i.dataset.k]=i.value;saveCfg()};
$('blist').onclick=e=>{const x=e.target.closest('[data-b]');
  if(x){ask('¿Quitar este bloqueo?',()=>{cfg.blocks=cfg.blocks.filter(b=>String(b.id)!==x.dataset.b);saveCfg();renderS();render()},'Quitar');return}
  const c=e.target.closest('[data-id]');if(c)openBk(c.dataset.id)};
let bw=false;
let bid=null;
$('bnew').onclick=()=>openBk(null);
function openBk(id){
  const b=id?cfg.blocks.find(x=>String(x.id)===String(id)):null;bid=b?b.id:null;
  $('bm').value=b?b.motivo:'';$('bd').value=b&&!b.dias?b.desde:'';$('bu').value=b&&!b.dias&&b.hasta!==b.desde?b.hasta:'';bsetRep(!!(b&&b.dias),b&&b.dias||[]);
  const all=!b||!b.hd;$('bt').classList.toggle('on',all);$('bhr').style.display=all?'none':'';$('bh1').value=(b&&b.hd)||'';$('bh2').value=(b&&b.hh)||'';
  $('bttl').textContent=b?'Editar bloqueo':'Nuevo bloqueo';$('berr').textContent='';bw=false;$('bk').classList.add('on')}
function bsetRep(on,d){$('brep').classList.toggle('on',on);$('bdr').style.display=on?'':'none';$('brd1').style.display=$('brd2').style.display=on?'none':'';
  $('bdw').innerHTML=[1,2,3,4,5,6,0].map(i=>`<button type="button" data-d="${i}" class="${d.includes(i)?'on':''}" style="width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:${d.includes(i)?'var(--y)':'var(--card)'};color:${d.includes(i)?'var(--yfg)':'var(--fg)'};font:inherit;font-weight:600;cursor:pointer">${'DLMXJVS'[i]}</button>`).join('')}
$('brep').onclick=()=>bsetRep(!$('brep').classList.contains('on'),bdias());
const bdias=()=>[...$('bdw').querySelectorAll('.on')].map(x=>+x.dataset.d);
$('bdw').onclick=e=>{const b=e.target.closest('[data-d]');if(!b)return;const d=bdias(),i=+b.dataset.d;bsetRep(true,d.includes(i)?d.filter(x=>x!==i):[...d,i])};
$('bt').onclick=()=>{$('bt').classList.toggle('on');$('bhr').style.display=$('bt').classList.contains('on')?'none':''};
$('bcan').onclick=()=>$('bk').classList.remove('on');
$('bk').onclick=e=>{if(e.target===$('bk'))$('bk').classList.remove('on')};
$('bsave').onclick=()=>{
  const rep=$('brep').classList.contains('on'),b={id:Date.now(),motivo:$('bm').value.trim()};
  if(rep){b.dias=bdias();b.desde='';b.hasta='';if(!b.dias.length){$('berr').textContent='Elegí al menos un día de la semana.';return}}
  else{b.desde=$('bd').value;b.hasta=$('bu').value||$('bd').value;
    if(!b.desde){$('berr').textContent='Elegí desde qué día.';return}
    if(b.hasta<b.desde){$('berr').textContent='La fecha final no puede ser anterior al inicio.';return}}
  if(!$('bt').classList.contains('on')){b.hd=$('bh1').value;b.hh=$('bh2').value;if(!b.hd||!b.hh||b.hh<=b.hd){$('berr').textContent='Completá un rango de horas válido.';return}}
  const n=turnos.filter(t=>(b.dias?t.fecha>=key(today)&&b.dias.includes(fmt(t.fecha).getDay()):t.fecha>=b.desde&&t.fecha<=b.hasta)&&(!b.hd||(mins(t.hora)<mins(b.hh)&&mins(t.hora)+60>mins(b.hd)))).length;
  if(n&&!bw){bw=true;$('berr').textContent='Ya tenés '+n+(n>1?' turnos':' turno')+' en ese período. Tocá Guardar de nuevo para bloquear igual.';return}
  if(bid){cfg.blocks=cfg.blocks.filter(x=>x.id!==bid);b.id=bid}cfg.blocks.push(b);cfg.blocks.sort((x,y)=>(x.desde||'')<(y.desde||'')?-1:1);saveCfg();$('bk').classList.remove('on');renderS();render()};
$('go').textContent='Listo';$('txt').placeholder='Ej: Gustavo Pérez mañana a las 17 horas';
let tm;$('txt').addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(()=>{const v=$('txt').value.trim();const p=parse(v);if(p.nombre&&p.apellido&&p.fecha&&p.hora){review(v);$('txt').value=''}},1800)});
render();
legend();
