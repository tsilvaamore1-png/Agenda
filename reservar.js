try{if(top!==self)top.location=self.location}catch(e){document.documentElement.style.display='none'}
const $=i=>document.getElementById(i),C=new URLSearchParams(location.search).get('c'),z=n=>String(n).padStart(2,'0');
const MES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const sb=window.SUPABASE_URL?supabase.createClient(SUPABASE_URL,SUPABASE_KEY):null;
const DEV=(()=>{try{let d=localStorage.getItem('dev');if(!d){d=(crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2)+Date.now());localStorage.setItem('dev',d)}return d}catch(e){return ''}})();
let days={},vy,vm,sel=null,hora=null,step=null,busy=false;
const ftel=v=>{let d=v.replace(/\D/g,'');if(d.startsWith('549'))d=d.slice(3);else if(d.startsWith('54'))d=d.slice(2);d=d.replace(/^0+/,'');if(d.length===12&&d.startsWith('11')&&d.slice(2,4)==='15')d=d.slice(0,2)+d.slice(4);if(d.length!==10)return v.trim();return d.startsWith('11')?d.slice(0,2)+' '+d.slice(2,6)+'-'+d.slice(6):d.slice(0,3)+' '+d.slice(3,6)+'-'+d.slice(6)};
const dt=k=>new Date(k+'T00:00').toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'});
async function load(){
  if(!sb||!C)return;const r=await sb.rpc('public_slots',{code:C});if(r.error||!r.data)return;
  $('mn').style.display=r.data.kind==='g'?'':'none';
  if(!r.data.enabled){days={};$('s').textContent='Las reservas no están disponibles por ahora.'}else{days=r.data.days||{};$('s').textContent='Elegí un día con horarios disponibles.'}
  if(vy===undefined){const k=Object.keys(days).sort()[0],d=k?new Date(k+'T00:00'):new Date();vy=d.getFullYear();vm=d.getMonth()}
  draw();
  if($('ov').classList.contains('on')){
    if(step==='t')sheet();
    else if(step==='f'&&!busy&&!(days[sel]||[]).includes(hora)){hora=null;sheet('Ese horario se acaba de ocupar. Elegí otro.')}}}
function draw(){
  $('mt').textContent=MES[vm]+(vy!==new Date().getFullYear()?' '+vy:'');
  $('wk').innerHTML='LMMJVSD'.split('').map(c=>`<div class="w">${c}</div>`).join('');
  const off=(new Date(vy,vm,1).getDay()+6)%7,n=new Date(vy,vm+1,0).getDate();let h='';
  for(let i=0;i<off;i++)h+='<div></div>';
  for(let d=1;d<=n;d++){const k=vy+'-'+z(vm+1)+'-'+z(d),on=(days[k]||[]).length>0;h+=`<button class="d${on?' on':''}" data-k="${k}"${on?'':' disabled'}>${d}${on?'<i></i>':''}</button>`}
  for(let i=off+n;i<42;i++)h+='<div class="d" style="visibility:hidden"></div>';
  $('gr').innerHTML=h}
function sheet(m){const sl=days[sel]||[];step='t';
  $('sh').innerHTML=`<h2>${dt(sel)}</h2><p class="s">Agendar sesión · elegí un horario</p>${m?`<div class="er">${m}</div>`:''}<div class="ch">${sl.length?sl.map(h=>`<button data-h="${h}">${h}</button>`).join(''):'<span class="s">Ya no quedan horarios este día.</span>'}</div>`;$('ov').classList.add('on')}
function form(){step='f';$('sh').innerHTML=`<h2>${dt(sel)}</h2><p class="s">Sesión a las ${hora}</p><input id="fn" maxlength="60" placeholder="Nombre" autocomplete="given-name"><input id="fa" maxlength="60" placeholder="Apellido" autocomplete="family-name"><input id="ft" maxlength="30" placeholder="Teléfono (con característica, sin 0 ni 15)" inputmode="tel" autocomplete="tel"><div class="er" id="er"></div><button class="pri" id="go">Agendar</button><button class="lk" id="bk">‹ Cambiar horario</button>`}
const closeS=()=>{$('ov').classList.remove('on');step=null};
$('ov').onclick=e=>{if(e.target===$('ov'))closeS()};
$('gr').onclick=e=>{const b=e.target.closest('.d.on');if(b){sel=b.dataset.k;sheet()}};
$('hoy').onclick=()=>{const n=new Date();vy=n.getFullYear();vm=n.getMonth();draw()};
$('pv').onclick=()=>{vm--;if(vm<0){vm=11;vy--}draw()};$('nx').onclick=()=>{vm++;if(vm>11){vm=0;vy++}draw()};
$('sh').onclick=async e=>{
  const h=e.target.closest('[data-h]');if(h){hora=h.dataset.h;form();return}
  if(e.target.id==='bk'){sheet();return}
  if(e.target.id==='cl'){closeS();return}
  if(e.target.id!=='go'||busy)return;
  const cp=s=>s.trim().replace(/(^|[\s\-'])(\p{L})/gu,(m,x,y)=>x+y.toUpperCase()),n=cp($('fn').value),a=cp($('fa').value);if(n.length<2||a.length<2){$('er').textContent='Completá nombre y apellido.';return}
  if($('ft').value.replace(/\D/g,'').length<10){$('er').textContent='Ingresá un teléfono válido.';return}
  busy=true;$('go').disabled=true;
  const r=await sb.rpc('public_book',{code:C,p_nombre:n,p_apellido:a,p_tel:ftel($('ft').value),p_fecha:sel,p_hora:hora,p_dev:DEV}),d=r.data||{};busy=false;
  if(d.ok){step='ok';$('sh').innerHTML=`<div class="ok"><div style="font-size:42px">✓</div><h2>${d.estado==='pendiente'?'Solicitud enviada':'¡Turno agendado!'}</h2><p class="s">${d.estado==='pendiente'?'Tu turno queda pendiente de aprobación.':dt(sel)+' a las '+hora}</p><button class="pri" id="cl">Listo</button></div>`;load();return}
  const M={ocupado:'Ese horario se acaba de ocupar. Elegí otro.',limite:'Ya reservaste un turno con este link.',cerrado:'Las reservas no están disponibles por ahora.',tel:'Ingresá un teléfono válido.',datos:'Revisá nombre y apellido.',espera:'Hay muchas reservas en este momento. Probá de nuevo en unos minutos.'};
  await load();if(d.error==='ocupado'){hora=null;sheet(M.ocupado)}else{$('go').disabled=false;$('er').textContent=M[d.error]||'No se pudo agendar. Probá de nuevo.'}};
if(!sb||!C){$('s').textContent='Este link no es válido.'}else{load();setInterval(()=>{if(!document.hidden)load()},15000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()})}
