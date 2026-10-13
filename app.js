const $=s=>document.getElementById(s),KEY='hangar.v1';
const ST={vuelo:['En vuelo','#c8ff3a'],taller:['En taller','#ffb020'],tierra:['En tierra','#7a7a88'],archivo:['Archivo','#ff6a3d']};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const seedRaw=[
['BeatVault Pro','app','Explorador de archivos para DJs: analizador de BPM, editor de metadatos ID3 y arrastre a software DJ.','DJ,música'],
['CRATE','app','Organizador de música para DJs con análisis automático de BPM y editor de metadatos.','DJ,música'],
['SoundShelf','pwa','Catálogo musical local: buscador de canciones, editor de metadatos y detector de duplicados.','música,PWA'],
['CrowdMix','app','Solicitud de canciones en tiempo real para DJs con propinas por Yape/Plin.','DJ,eventos'],
['Claro Porta-Assist','app','Dashboard comercial para televentas de portabilidad: tarifario, speech, objeciones y cierre.','ventas,Claro'],
['Claro Porta-Check','app','Registro de evaluaciones y verificación manual de deuda para portabilidad.','ventas,Claro'],
['Calculadora de KPIs','app','Más de 130 métricas de Marketing y Administración con fórmulas y ejemplos.','marketing,KPI'],
['Sello QR','app','Generador de códigos QR personalizables: color, forma, tamaño y logo.','utilidad,QR'],
['QillqaPOS','pwa','Punto de venta para bodegas conectado a Google Sheets, con Yape/Plin e inventario.','negocios,PWA'],
['Kiosko IA','app','Bot de WhatsApp con IA para tomar pedidos de pequeños negocios.','IA,negocios'],
['LAZO Marketing Hub','web','Plataforma de proyectos, estrategia, KPI e informes de Marketing y Administración.','marketing'],
['Portafolio','web','Sitio personal con proyectos y trabajos destacados.','portafolio'],
['MediaHub','pwa','Búsqueda y previsualización de YouTube y conversión de medios.','media,PWA'],
['Podcast Studio','app','Estudio web para grabar, editar y recortar podcasts.','audio']];
const seed=()=>seedRaw.map((r,i)=>({id:'p'+i,name:r[0],url:'',desc:r[2],type:r[1],status:'taller',tags:r[3].split(','),tech:'',notes:'',img:'',fav:i<3,opens:0,last:0,created:Date.now()-i*1000}));
let S;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
S=S&&S.items?S:{items:seed(),view:'grid',theme:'dark'};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const touch=p=>{p.updated=Date.now();Sync.up(p)};
const F={q:'',type:'',status:'',tag:'',fav:false};let editId=null,tmpImg='';
const toast=m=>{const t=$('toast');t.textContent=m;t.className='toast s';setTimeout(()=>t.className='toast',1800)};
const hash=s=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h};
function cover(p){if(p.img)return`<img src="${p.img}" alt="" referrerpolicy="no-referrer">`;const h=hash(p.name),a=h%360,b=(a+70+h%90)%360,k=h%4;let d='';
 if(k==0)for(let i=0;i<7;i++)d+=`<circle cx="${(h>>i)%300}" cy="${(h>>(i+3))%150}" r="${15+(h>>i)%50}" fill="hsl(${a+i*12} 80% 60%/.35)"/>`;
 else if(k==1)for(let i=0;i<14;i++)d+=`<rect x="${i*24-20}" y="-10" width="10" height="200" fill="#fff" opacity=".16" transform="rotate(25 150 75)"/>`;
 else if(k==2)for(let i=0;i<6;i++)d+=`<path d="M0 ${30+i*22} Q75 ${i*22+(h%40)} 150 ${40+i*22} T300 ${30+i*22}" stroke="#fff" stroke-opacity=".3" fill="none" stroke-width="3"/>`;
 else for(let i=0;i<10;i++)for(let j=0;j<5;j++)if((h>>(i+j))&1)d+=`<rect x="${i*30}" y="${j*30}" width="26" height="26" fill="#fff" opacity=".18"/>`;
 return`<svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g${p.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${a} 75% 42%)"/><stop offset="1" stop-color="hsl(${b} 80% 30%)"/></linearGradient></defs><rect width="300" height="150" fill="url(#g${p.id})"/>${d}<text x="14" y="138" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="86" fill="#fff" fill-opacity=".9" letter-spacing="-4">${esc(p.name.trim()[0]||'?').toUpperCase()}</text></svg>`}
function list(){let r=S.items.filter(p=>{const t=(p.name+' '+p.desc+' '+p.tags.join(' ')+' '+p.tech+' '+p.url).toLowerCase();
 return(!F.q||t.includes(F.q.toLowerCase()))&&(!F.type||p.type==F.type)&&(!F.status||p.status==F.status)&&(!F.tag||p.tags.includes(F.tag))&&(!F.fav||p.fav)});
 const s=$('sort').value;r.sort((a,b)=>s=='az'?a.name.localeCompare(b.name):s=='use'?b.opens-a.opens:s=='fav'?(b.fav-a.fav)||a.name.localeCompare(b.name):b.created-a.created);return r}
function render(){
 const it=S.items;$('stats').innerHTML=[['Total',it.length],['En vuelo',it.filter(p=>p.status=='vuelo').length],['En taller',it.filter(p=>p.status=='taller').length],['Sin enlace',it.filter(p=>!p.url).length]].map(x=>`<div class="stat"><b>${x[1]}</b><i>${x[0]}</i></div>`).join('');
 const tags=[...new Set(it.flatMap(p=>p.tags))].sort();
 const chip=(k,v,l)=>`<button class="chip ${F[k]===v?'on':''}" data-k="${k}" data-v="${esc(v)}">${esc(l)}</button>`;
 $('chips').innerHTML=chip('type','','Todo')+[['app','Microapps'],['pwa','PWA'],['web','Webs']].map(x=>chip('type',x[0],x[1])).join('')+' | '+Object.entries(ST).map(([k,v])=>chip('status',k,v[0])).join('')+`<button class="chip ${F.fav?'on':''}" data-k="fav">★ Favoritas</button> | `+tags.map(t=>chip('tag',t,'#'+t)).join('');
 const r=list();$('grid').className='grid'+(S.view=='list'?' list':'');
 $('grid').innerHTML=r.length?r.map((p,i)=>`<article class="card" style="animation-delay:${Math.min(i,12)*30}ms" data-id="${p.id}">
 <div class="cov">${cover(p)}<span class="code">HGR-${String(S.items.indexOf(p)+1).padStart(3,'0')}</span><button class="fav ${p.fav?'on':''}" data-a="fav" title="Favorita">★</button></div>
 <div class="body"><div class="row"><span class="st" style="--c:${ST[p.status][1]}">${ST[p.status][0]}</span><span class="ty">${{app:'Microapp',pwa:'PWA',web:'Web'}[p.type]}</span></div>
 <h3>${esc(p.name)}</h3><p>${esc(p.desc)||'Sin descripción'}</p>
 <div class="tags">${p.tags.map(t=>`<span>#${esc(t)}</span>`).join('')}${p.tech?`<span>⚙ ${esc(p.tech)}</span>`:''}</div>
 <div class="url">${p.url?esc(p.url.replace(/^https?:\/\//,'')):'— añade un enlace —'}</div>
 <div class="meta">${p.opens} aperturas${p.last?' · última '+new Date(p.last).toLocaleDateString('es-PE'):''}</div>
 <div class="act"><a class="go ${p.url?'':'off'}" data-a="open" href="${p.url?esc(p.url):'#'}" target="_blank" rel="noopener">Abrir ↗</a><button class="btn" data-a="copy" title="Copiar enlace">⧉</button><button class="btn" data-a="edit">Editar</button><button class="btn d" data-a="del">✕</button></div></div></article>`).join(''):'<div class="empty">Sin resultados. Ajusta los filtros o crea una nueva ficha.</div>';
 save()}
$('chips').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;const k=b.dataset.k;if(k=='fav')F.fav=!F.fav;else F[k]=F[k]===b.dataset.v&&k!='type'?'':b.dataset.v;render()};
$('q').oninput=e=>{F.q=e.target.value;render()};$('sort').onchange=render;
$('vw').onclick=()=>{S.view=S.view=='grid'?'list':'grid';render()};
$('grid').onclick=e=>{const c=e.target.closest('.card'),b=e.target.closest('[data-a]');if(!c||!b)return;const p=S.items.find(x=>x.id==c.dataset.id),a=b.dataset.a;
 if(a=='fav'){p.fav=!p.fav;touch(p);render()}
 else if(a=='open'){if(!p.url)return;p.opens++;p.last=Date.now();touch(p);save();setTimeout(render,50)}
 else if(a=='copy'){if(!p.url)return toast('Esta ficha no tiene enlace');try{navigator.clipboard.writeText(p.url).then(()=>toast('Enlace copiado'),()=>toast('No se pudo copiar'))}catch(x){toast('No se pudo copiar')}}
 else if(a=='edit')openForm(p);
 else if(a=='del'){if(b.dataset.s){S.items=S.items.filter(x=>x!==p);Sync.del(p.id);render();toast('Ficha eliminada')}else{b.dataset.s=1;b.textContent='¿Seguro?';setTimeout(()=>{b.dataset.s='';b.textContent='✕'},2200)}}};
function pv(){const p={id:'pv',name:$('f_n').value||'?',img:tmpImg};$('pv').innerHTML=cover(p)}
function openForm(p){editId=p?p.id:null;$('dt').textContent=p?'Editar ficha':'Nueva ficha';
 $('f_n').value=p?.name||'';$('f_u').value=p?.url||'';$('f_d').value=p?.desc||'';$('f_t').value=p?.type||'app';$('f_s').value=p?.status||'taller';$('f_g').value=p?p.tags.join(', '):'';$('f_k').value=p?.tech||'';$('f_o').value=p?.notes||'';$('f_i').value='';tmpImg=p?.img||'';pv();$('dlg').showModal()}
$('add').onclick=()=>openForm();$('f_n').oninput=pv;
$('noimg').onclick=()=>{tmpImg='';pv()};
$('f_i').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),s=Math.min(1,640/im.width);c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);tmpImg=c.toDataURL('image/jpeg',.78);pv()};im.src=r.result};r.readAsDataURL(f)};
$('save').onclick=()=>{const n=$('f_n').value.trim();if(!n)return $('f_n').focus();let u=$('f_u').value.trim();if(u&&!/^https?:\/\//i.test(u))u='https://'+u;
 const d={name:n,url:u,desc:$('f_d').value.trim(),type:$('f_t').value,status:$('f_s').value,tags:$('f_g').value.split(',').map(x=>x.trim()).filter(Boolean),tech:$('f_k').value.trim(),notes:$('f_o').value,img:tmpImg};
 let it;if(editId){it=S.items.find(x=>x.id==editId);Object.assign(it,d)}else{it={id:'p'+Date.now(),fav:false,opens:0,last:0,created:Date.now(),...d};S.items.unshift(it)}
 touch(it);$('dlg').close();render();toast('Guardado')};
// paleta
let pi=0,pr=[];function plist(){const q=$('pq').value.toLowerCase();pr=S.items.filter(p=>(p.name+p.tags.join(' ')).toLowerCase().includes(q)).sort((a,b)=>b.fav-a.fav||b.opens-a.opens).slice(0,8);pi=Math.min(pi,Math.max(pr.length-1,0));
 $('pl').innerHTML=pr.map((p,i)=>`<li class="${i==pi?'sel':''}" data-i="${i}"><b>${esc(p.name)}</b><span>${p.url?'↗ abrir':'editar'}</span></li>`).join('')}
function pgo(i){const p=pr[i];if(!p)return;$('pd').close();if(p.url){p.opens++;p.last=Date.now();touch(p);render();window.open(p.url,'_blank','noopener')}else openForm(p)}
function pop(){$('pq').value='';pi=0;plist();$('pd').showModal();$('pq').focus()}
$('pal').onclick=pop;$('pq').oninput=()=>{pi=0;plist()};$('pl').onclick=e=>{const l=e.target.closest('li');if(l)pgo(+l.dataset.i)};
$('pq').onkeydown=e=>{if(e.key=='ArrowDown'){pi=Math.min(pi+1,pr.length-1);plist();e.preventDefault()}else if(e.key=='ArrowUp'){pi=Math.max(pi-1,0);plist();e.preventDefault()}else if(e.key=='Enter')pgo(pi)};
document.onkeydown=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()=='k'){e.preventDefault();pop()}else if(e.key=='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();$('q').focus()}};
// respaldo y tema
$('exp').onclick=()=>{$('xt').textContent='Exportar respaldo (copia este JSON)';$('xa').value=JSON.stringify({...S,cfg:undefined});$('xo').style.display='none';$('xd').showModal()};
$('imp').onclick=()=>{$('xt').textContent='Importar respaldo (pega el JSON)';$('xa').value='';$('xo').style.display='';$('xd').showModal()};
$('xc').onclick=()=>{$('xa').select();try{navigator.clipboard.writeText($('xa').value).then(()=>toast('Copiado'))}catch(e){document.execCommand('copy');toast('Copiado')}};
$('xo').onclick=()=>{try{const j=JSON.parse($('xa').value);if(!Array.isArray(j.items))throw 0;j.cfg=S.cfg;S=j;$('xd').close();apply();render();Sync.all();toast('Respaldo importado')}catch(e){toast('JSON no válido')}};
function apply(){document.documentElement.dataset.theme=S.theme||'dark'}
$('th').onclick=()=>{S.theme=S.theme=='dark'?'light':'dark';apply();save()};
apply();render();Sync.init();
