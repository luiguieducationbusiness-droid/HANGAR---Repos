/* HANGAR · Sincronización con Google Sheets (vía Apps Script)
   La copia local sigue funcionando sin internet; los cambios pendientes se envían al reconectar. */
const Sync=(()=>{
const QK='hangar.q';let q=[],busy=false,tm=null;
try{q=JSON.parse(localStorage.getItem(QK))||[]}catch(e){}
const cfg=()=>S.cfg||{},on=()=>!!cfg().url;
const sq=()=>{try{localStorage.setItem(QK,JSON.stringify(q))}catch(e){}};
const LB={off:'○ Solo local',busy:'⟳ Sincronizando…',ok:'● Google Sheets',err:'⚠ Sin sincronizar'};
function st(s,m){const b=$('sync');b.textContent=LB[s];b.dataset.s=s;b.title=m||(s=='off'?'Haz clic para conectar con Google Sheets':'Haz clic para ver la conexión')}
const msg=t=>{$('s_m').textContent=t};
const call=async(c,body)=>{const r=await fetch(c.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({key:c.key,...body})});const j=await r.json();if(!j.ok)throw new Error(j.error||'Error');return j};
const pull=async c=>{const r=await fetch(c.url+(c.url.includes('?')?'&':'?')+'action=list&key='+encodeURIComponent(c.key||''));const j=await r.json();if(!j.ok)throw new Error(j.error||'Error');return j.items};
const pid=o=>o.item?o.item.id:o.id;
function merge(rem){const pend=new Set(q.map(pid)),loc=new Map(S.items.map(x=>[x.id,x])),ids=new Set(rem.map(r=>r.id));
 const out=rem.map(r=>pend.has(r.id)&&loc.get(r.id)?loc.get(r.id):r);
 S.items.forEach(l=>{if(!ids.has(l.id)&&pend.has(l.id))out.push(l)});
 S.items=out.sort((a,b)=>b.created-a.created);render()}
async function flush(){if(!on()||busy)return;busy=true;st('busy');const c=cfg();
 try{while(q.length){const o=q[0];
   if(o.t=='up'){const j=await call(c,{action:'upsert',item:o.item});const it=S.items.find(x=>x.id==o.item.id);if(it&&j.item&&String(it.img).startsWith('data:')){it.img=j.item.img;save()}}
   else await call(c,{action:'delete',id:o.id});
   q=q.filter(x=>x!==o);sq()}
  merge(await pull(c));st('ok','Última sincronización: '+new Date().toLocaleTimeString('es-PE'))}
 catch(e){st('err',String(e.message||e))}
 busy=false}
const sch=()=>{clearTimeout(tm);tm=setTimeout(flush,700)};
function up(p){if(!on())return;q=q.filter(o=>!(o.t=='up'&&o.item.id==p.id));q.push({t:'up',item:{...p}});sq();sch()}
function del(id){if(!on())return;q=q.filter(o=>pid(o)!=id);q.push({t:'del',id});sq();sch()}
const all=()=>{S.items.forEach(up)};
async function connect(url,key){const c={url:url.trim(),key:key.trim()};if(!/^https:\/\/script\.google\.com\//.test(c.url))throw new Error('La URL debe empezar con https://script.google.com/');
 const items=await pull(c);S.cfg=c;save();
 if(!items.length&&S.items.length){all();return'Hoja vacía: se subirán tus '+S.items.length+' fichas.'}
 merge(items);st('ok');return'Conectado: se cargaron '+items.length+' fichas desde la hoja.'}
function init(){
 st(on()?'ok':'off');if(on())flush();
 $('sync').onclick=()=>{$('s_u').value=cfg().url||'';$('s_k').value=cfg().key||'';msg('');$('sd').showModal()};
 $('s_t').onclick=async()=>{msg('Probando…');try{const n=(await pull({url:$('s_u').value.trim(),key:$('s_k').value.trim()})).length;msg('Conexión correcta · '+n+' fichas en la hoja.')}catch(e){msg('Error: '+(e.message||'no se pudo conectar'))}};
 $('s_s').onclick=async()=>{msg('Conectando…');try{msg(await connect($('s_u').value,$('s_k').value));setTimeout(()=>$('sd').close(),1200)}catch(e){msg('Error: '+(e.message||'no se pudo conectar'))}};
 $('s_up').onclick=()=>{if(!on())return msg('Primero guarda la conexión.');all();msg('Subiendo '+S.items.length+' fichas…')};
 $('s_x').onclick=()=>{S.cfg=null;q=[];sq();save();st('off');$('sd').close();toast('Desconectado: solo se guarda en este navegador')};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&on())flush()});
 setInterval(()=>{if(on()&&!document.hidden)flush()},90000)}
return{init,up,del,all,flush}})();
