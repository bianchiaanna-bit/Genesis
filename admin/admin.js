/* Pannello Génesis: carta, speciali, novità, orari, pop-up, hero, testi e foto */
(function(){
const G=window.GEN;G.PH="../immagini/fotos/";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],e=G.esc;
const L=["es","en","it"],LU=["ES","EN","IT"];
let S={kv:{texts:{},imgs:{},hero:{mode:"mosaic"},hours:null,popup:null,legal:null,homeFeaturedEnabled:true},menu:{categories:[],dishes:[],specials:[]},news:[],homeFeaturedCards:[]};
let tab="hero";

/* ───── API ───── */
/* API */
async function api(path,o={}){
  const r=await fetch("/api/admin"+path,{credentials:"same-origin",...o,headers:{...(o.json?{"content-type":"application/json"}:{}),...(o.headers||{})},body:o.json?JSON.stringify(o.json):o.body});
  if(r.status===401){showLogin();throw new Error("Sessione scaduta")}
  const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Errore "+r.status);return d;
}
function toast(m,err){const t=$("#toast");t.textContent=m;t.className="toast show"+(err?" err":"");clearTimeout(toast.t);toast.t=setTimeout(()=>t.className="toast",3200)}
const guard=fn=>async(...a)=>{try{await fn(...a)}catch(x){toast(x.message,1)}};
const imgSrc=k=>!k?"":/^(https?:|data:|blob:)/.test(k)||k.startsWith("/")?k:/^(immagini|assets)\//.test(k)?"../"+k:"/img/"+k;
const slotSrc=s=>S.kv.imgs[s]?imgSrc(S.kv.imgs[s]):G.PH+G.SLOTS[s][0];

/* ───── upload con ridimensionamento ───── */
function pickFile(){return new Promise(res=>{const i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=()=>res(i.files[0]);i.click()})}
async function upload(file){
  const bm=await createImageBitmap(file),r=Math.min(1,1800/Math.max(bm.width,bm.height)),c=document.createElement("canvas");
  c.width=Math.round(bm.width*r);c.height=Math.round(bm.height*r);c.getContext("2d").drawImage(bm,0,0,c.width,c.height);
  const blob=await new Promise(o=>c.toBlob(o,"image/jpeg",.84));
  return (await api("/upload",{method:"POST",body:blob,headers:{"content-type":"image/jpeg"}})).key;
}

/* ───── login ───── */
function showLogin(){$("#app").hidden=true;$("#login").hidden=false;$("#pw").focus()}
$("#lf").onsubmit=async ev=>{
  ev.preventDefault();
  $("#lerr").textContent="";
  try{
    const r=await fetch("/api/admin/login",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({password:$("#pw").value})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error||"Password non corretta");
    $("#pw").value="";
    start();
  }catch(x){
    $("#lerr").textContent=x.message||"Errore di connessione";
  }
};
$("#out").onclick=async()=>{
  await fetch("/api/admin/logout",{method:"POST",credentials:"same-origin"});
  showLogin();
};

/* ───── caricamento ───── */
async function load(){
  const [kv,menu,news,featured]=await Promise.all([api("/settings"),api("/menu"),api("/news"),api("/home_featured_cards")]);
  S.kv={texts:kv.texts||{},imgs:kv.imgs||{},hero:kv.hero||{mode:"mosaic"},hours:kv.hours||null,popup:kv.popup||null,legal:kv.legal||null,homeFeaturedEnabled:kv.homeFeaturedEnabled!==false};
  S.menu=menu;S.news=news.items;S.homeFeaturedCards=featured.items||[];
}
async function start(){
  try{await api("/me");await load()}catch(x){showLogin();if(x.message&&!/Sessione|autorizzato/i.test(x.message))$("#lerr").textContent="";return}
  $("#login").hidden=true;$("#app").hidden=false;go(tab);
}
const TABS=[["hero","Hero e foto"],["menu","Carta"],["news","Novità"],["home","Dalla cucina"],["hours","Orari"],["popup","Pop-up"],["texts","Testi del sito"],["legal","Privacy e cookie"]];
function go(t){tab=t;
  $("#tabs").innerHTML=TABS.map(([k,l])=>`<button data-t="${k}" class="${k===t?"on":""}">${l}</button>`).join("");
  $$("#tabs button").forEach(b=>b.onclick=()=>go(b.dataset.t));
  $("#view").innerHTML="";VIEWS[t]();scrollTo(0,0);
}
const saveBar=(label="Salva e pubblica")=>`<div class="savebar"><button class="btn pri" id="save">${label}</button></div>`;
const saveKV=(keys)=>guard(async()=>{const b={};keys.forEach(k=>b[k]=S.kv[k]);await api("/settings",{method:"PUT",json:b});toast("Pubblicato ✔ Il sito è già aggiornato")});

/* ───── modulo generico (modale) ───── */
const ml=(b,label,area)=>L.map((l,i)=>({n:`${b}_${l}`,l:`${label} ${LU[i]}`,t:area?"area":"text",chip:LU[i]}));
function form(title,fields,data,onSave,onDelete){
  const m=$("#modal"),val={...data};
  const fh=fields.map(f=>{
    const v=val[f.n]??"";
    if(f.t==="img")return `<label class="f">${f.l}</label><div class="imgf"><img id="im_${f.n}" src="${e(imgSrc(v))}" alt="" ${v?"":"hidden"}><button type="button" class="btn sm" data-up="${f.n}">Carica foto</button><button type="button" class="btn sm" data-rm="${f.n}">Rimuovi</button></div>`;
    if(f.t==="check")return `<label class="check"><input type="checkbox" data-f="${f.n}" ${+v?"checked":""}> ${f.l}</label>`;
    if(f.t==="select")return `<label class="f">${f.l}</label><select data-f="${f.n}">${f.o.map(([k,t])=>`<option value="${k}" ${String(k)===String(v)?"selected":""}>${e(t)}</option>`).join("")}</select>`;
    if(f.t==="area")return `<label class="f">${f.l}</label><textarea data-f="${f.n}" rows="3">${e(v)}</textarea>`;
    const ty=f.t==="price"?"text":f.t||"text",vv=f.t==="price"&&v!==""?(v/100).toFixed(2).replace(".",","):v;
    return `<label class="f">${f.l}</label><input type="${ty}" data-f="${f.n}" value="${e(vv)}" ${f.t==="price"?'inputmode="decimal" placeholder="0,00"':""}>`;
  }).join("");
  m.innerHTML=`<form class="mbox"><h2>${title}</h2>${fh}<div class="row sp" style="margin-top:24px"><div>${onDelete?'<button type="button" class="btn danger" id="del">Elimina</button>':""}</div><div class="row"><button type="button" class="btn" id="cx">Annulla</button><button class="btn pri" type="submit">Salva</button></div></div></form>`;
  m.hidden=false;
  $$("[data-up]",m).forEach(b=>b.onclick=guard(async()=>{const f=await pickFile();if(!f)return;b.textContent="Carico…";val[b.dataset.up]=await upload(f);const i=$("#im_"+b.dataset.up);i.src=imgSrc(val[b.dataset.up]);i.hidden=false;b.textContent="Cambia foto"}));
  $$("[data-rm]",m).forEach(b=>b.onclick=()=>{val[b.dataset.rm]=null;$("#im_"+b.dataset.rm).hidden=true});
  $("#cx").onclick=()=>m.hidden=true;
  if(onDelete)$("#del").onclick=guard(async()=>{if(confirm("Eliminare definitivamente?")){await onDelete();m.hidden=true}});
  $(".mbox",m).onsubmit=guard(async ev=>{ev.preventDefault();
    fields.forEach(f=>{if(f.t==="img")return;const el=$(`[data-f="${f.n}"]`,m);
      val[f.n]=f.t==="check"?(el.checked?1:0):f.t==="price"?(el.value.trim()===""?null:Math.round(parseFloat(el.value.replace(",","."))*100)):f.t==="number"?+el.value:el.value});
    await onSave(val);m.hidden=true});
}

/* ═════ VISTE ═════ */
const VIEWS={};

/* — Hero e foto — */
VIEWS.hero=()=>{
  const h=S.kv.hero;
  $("#view").innerHTML=`<h2>Hero e foto</h2><p class="lead">Scegli come si apre la home: il mosaico di 12 foto che si illuminano a turno, oppure una sola grande foto.</p>
  <div class="card"><div class="choice">
    <label class="opt"><input type="radio" name="hm" value="mosaic" ${h.mode!=="single"?"checked":""}><b>Mosaico</b><p>12 foto: a caso una si ingrandisce e si illumina, poi un’altra.</p></label>
    <label class="opt"><input type="radio" name="hm" value="single" ${h.mode==="single"?"checked":""}><b>Foto unica</b><p>Una sola foto a tutto schermo, con una luce calda che segue il cursore.</p></label></div></div>
  <div class="card"><h3>Foto per il mosaico e per la foto unica</h3><p class="lead" style="margin-bottom:12px">Tocca una foto per sostituirla. “Nuova” indica che hai caricato una tua foto.</p><div class="slots" id="sl-hero"></div></div>
  <h2 style="margin-top:30px">Altre foto del sito</h2><div class="card"><div class="slots" id="sl-rest"></div></div>${saveBar()}`;
  const draw=()=>{
    const mk=ks=>ks.map(s=>`<div class="slot" data-s="${s}" title="Sostituisci"><img src="${e(slotSrc(s))}" alt=""><span>${e(G.SLOTS[s][1])}</span>${S.kv.imgs[s]?"<b>Nuova</b>":""}</div>`).join("");
    const all=Object.keys(G.SLOTS),hk=all.filter(k=>/^h(\d+|s)$/.test(k));
    $("#sl-hero").innerHTML=mk(hk);$("#sl-rest").innerHTML=mk(all.filter(k=>!hk.includes(k)));
    $$(".slot").forEach(d=>{d.onclick=guard(async()=>{const f=await pickFile();if(!f)return;toast("Carico la foto…");S.kv.imgs[d.dataset.s]=await upload(f);draw();toast("Foto pronta. Premi Salva e pubblica.")});
      d.oncontextmenu=ev=>{ev.preventDefault();if(S.kv.imgs[d.dataset.s]&&confirm("Tornare alla foto originale?")){delete S.kv.imgs[d.dataset.s];draw()}}});
  };draw();
  $$('input[name=hm]').forEach(r=>r.onchange=()=>{S.kv.hero={...S.kv.hero,mode:r.value}});
  $("#save").onclick=saveKV(["hero","imgs"]);
};

/* — Carta — */
VIEWS.menu=(openId=null)=>{
  const {categories:C,dishes:D}=S.menu;
  const X=S.menu.extras||[], A=S.menu.allergens||[]; const SP=S.menu.specials||[];
  const catF=[...ml("name","Nome")];
  const dishF=()=>[{n:"category_id",l:"Categoria",t:"select",o:C.map(c=>[c.id,c.name_es])},...ml("name","Nome"),...ml("description","Descrizione",1),{n:"price_cents",l:"Prezzo (€)",t:"price"},{n:"price_max_cents",l:"Prezzo massimo (€) — solo se è un “da … a …”",t:"price"},{n:"allergens",l:"Allergeni (numeri separati da virgola, es. 01,03,07)",t:"text"},{n:"vegetarian",l:"Vegetariano",t:"check"},{n:"vegan",l:"Vegano",t:"check"},{n:"image_key",l:"Foto",t:"img"},{n:"available",l:"Disponibile (togli la spunta se è finito)",t:"check"}];
  const eur=c=>c==null?"—":(c/100).toFixed(2).replace(".",",")+" €";
  const refresh=async(id=openId)=>{await load();VIEWS.menu(id)};
  const move=async(table,arr,i,d)=>{const j=i+d;if(j<0||j>=arr.length)return;const ids=arr.map(x=>x.id);[ids[i],ids[j]]=[ids[j],ids[i]];await api("/reorder",{method:"PUT",json:{table,ids}});await refresh()};
  const persistExtras=async(next)=>{await api("/extras",{method:"PUT",json:{extras:next}});await refresh();toast("Extras salvati ✔")};
  const persistAllergens=async(next)=>{await api("/allergens",{method:"PUT",json:{allergens:next}});await refresh();toast("Allergeni salvati ✔")};

  $("#view").innerHTML=`
    <div class="row sp"><div><h2>Carta</h2><p class="lead">Gestisci categorie, piatti, extras e allergeni. Le modifiche sono visibili anche tramite il QR.</p></div><button class="btn pri" id="nc">+ Nuova categoria</button></div>
    <h3 style="margin:24px 0 12px">Categorie e piatti</h3>
    ${C.length?C.map((c,ci)=>{
      const ds=D.filter(d=>d.category_id===c.id);
      return `<details class="card" data-cat="${c.id}" ${openId===c.id?"open":""} style="margin-bottom:12px">
        <summary style="cursor:pointer;font-size:1.1rem;font-weight:650;padding:5px 0">
          ${e(c.name_es)} <small style="font-weight:400;opacity:.7">(${ds.length} ${ds.length===1?"piatto":"piatti"})</small>
        </summary>
        <div style="padding-top:14px">
          <div class="row sp" style="margin-bottom:12px;flex-wrap:wrap">
            <div class="row"><button class="btn sm" data-cu="${ci}" title="Sposta su">↑</button><button class="btn sm" data-cd="${ci}" title="Sposta giù">↓</button></div>
            <div class="row"><button class="btn sm" data-ce="${c.id}">Modifica categoria</button><button class="btn sm pri" data-dn="${c.id}">+ Piatto</button></div>
          </div>
          <div class="list">${ds.length?ds.map(d=>`<div class="${d.available?"":"off"}">
            ${d.image_key?`<img src="${e(imgSrc(d.image_key))}" alt="">`:'<img alt="" style="visibility:hidden">'}
            <div class="nm"><b>${e(d.name_es)}</b><small>${e(d.description_es||"")}</small></div>
            <span>${eur(d.price_cents)}</span>${d.available?"":'<span class="pill">esaurito</span>'}
            <button class="btn sm" data-du="${d.id}" data-c="${c.id}">↑</button><button class="btn sm" data-dd="${d.id}" data-c="${c.id}">↓</button><button class="btn sm" data-de="${d.id}">Modifica</button>
          </div>`).join(""):'<div class="empty">Nessun piatto in questa categoria.</div>'}</div>
        </div>
      </details>`;
    }).join(""):'<div class="empty">Crea la prima categoria per cominciare.</div>'}

    <div style="margin-top:30px">
      <div class="row sp"><div><h3>Extras</h3><p class="lead">Nomi nelle tre lingue e prezzo in euro.</p></div><button class="btn pri" id="nx">+ Nuovo extra</button></div>
      <div class="card list">${X.length?X.map((x,i)=>`<div><div class="nm"><b>${e(x.name_es||x.name||"")}</b><small>EN: ${e(x.name_en||"")} · IT: ${e(x.name_it||"")}</small></div><span>${Number(x.price||0).toFixed(2).replace(".",",")} €</span><button class="btn sm" data-xe="${i}">Modifica</button></div>`).join(""):'<div class="empty">Nessun extra inserito.</div>'}</div>
    </div>

    <div style="margin-top:30px">
      <div class="row sp"><div><h3>Allergeni</h3><p class="lead">Codice e denominazione in spagnolo, inglese e italiano.</p></div><button class="btn pri" id="na">+ Nuovo allergene</button></div>
      <div class="card list">${A.length?A.map((x,i)=>`<div><div class="nm"><b>${e(x.code||"")} · ${e(x.name_es||x.name||"")}</b><small>EN: ${e(x.name_en||"")} · IT: ${e(x.name_it||"")}</small></div><button class="btn sm" data-ae="${i}">Modifica</button></div>`).join(""):'<div class="empty">Nessun allergene inserito.</div>'}</div>
    </div>`;

  
  $("#view").insertAdjacentHTML("beforeend",`
    <div style="margin-top:30px">
      <div class="row sp"><div><h3>Speciali</h3><p class="lead">Proposte temporanee in cima alla carta.</p></div><button class="btn pri" id="ns">+ Nuovo speciale</button></div>
      <div class="card list">${SP.length?SP.map(x=>`<div class="${x.published?"":"off"}">${x.image_key?`<img src="${e(imgSrc(x.image_key))}" alt="">`:""}<div class="nm"><b>${e(x.title_es)}</b><small>${e((x.starts_at||"sempre").slice(0,10))} → ${e((x.ends_at||"").slice(0,10))}</small></div><span class="pill ${x.published?"on":""}">${x.published?"pubblicato":"bozza"}</span><button class="btn sm" data-se="${x.id}">Modifica</button></div>`).join(""):'<div class="empty" style="width:100%">Nessuno speciale.</div>'}</div>
    </div>`);

  const SF=[...ml("title","Titolo"),...ml("description","Descrizione",1),{n:"price_cents",l:"Prezzo (€)",t:"price"},{n:"image_key",l:"Foto",t:"img"},{n:"starts_at",l:"Dal giorno",t:"date"},{n:"ends_at",l:"Fino al giorno",t:"date"},{n:"published",l:"Pubblicato (visibile nella carta)",t:"check"}];
  const refreshSpecials=async()=>{await load();VIEWS.menu(openId)};
  $("#ns").onclick=()=>form("Nuovo speciale",SF,{published:1},guard(async v=>{await api("/specials",{method:"POST",json:v});await refreshSpecials();toast("Creato ✔")}));
  $$("[data-se]").forEach(b=>b.onclick=()=>{const x=SP.find(z=>z.id==b.dataset.se);form("Modifica speciale",SF,x,guard(async v=>{await api("/specials/"+x.id,{method:"PUT",json:v});await refreshSpecials();toast("Salvato ✔")}),async()=>{await api("/specials/"+x.id,{method:"DELETE"});await refreshSpecials()})});
$("#nc").onclick=()=>form("Nuova categoria",catF,{sort_order:C.length},guard(async v=>{await api("/categories",{method:"POST",json:{...v,sort_order:C.length}});await refresh();toast("Categoria creata")}));
  $$("[data-ce]").forEach(b=>b.onclick=()=>{const c=C.find(x=>x.id==b.dataset.ce);form("Modifica categoria",catF,c,guard(async v=>{await api("/categories/"+c.id,{method:"PUT",json:v});await refresh(c.id);toast("Salvato ✔")}),async()=>{await api("/categories/"+c.id,{method:"DELETE"});await refresh()})});
  $$("[data-dn]").forEach(b=>b.onclick=()=>{const cid=+b.dataset.dn;form("Nuovo piatto",dishF(),{category_id:cid,available:1},guard(async v=>{await api("/dishes",{method:"POST",json:{...v,category_id:+v.category_id,sort_order:D.filter(d=>d.category_id===cid).length}});await refresh(cid);toast("Piatto aggiunto")}))});
  $$("[data-de]").forEach(b=>b.onclick=()=>{const d=D.find(x=>x.id==b.dataset.de);form("Modifica piatto",dishF(),d,guard(async v=>{await api("/dishes/"+d.id,{method:"PUT",json:{...v,category_id:+v.category_id}});await refresh(d.category_id);toast("Salvato ✔")}),async()=>{await api("/dishes/"+d.id,{method:"DELETE"});await refresh(d.category_id)})});
  $$("[data-cu]").forEach(b=>b.onclick=guard(()=>move("categories",C,+b.dataset.cu,-1)));$$("[data-cd]").forEach(b=>b.onclick=guard(()=>move("categories",C,+b.dataset.cd,1)));
  $$("[data-du],[data-dd]").forEach(b=>b.onclick=guard(()=>{const cid=+b.dataset.c,arr=D.filter(x=>x.category_id===cid),i=arr.findIndex(x=>x.id===(+(b.dataset.du||b.dataset.dd)));return move("dishes",arr,i,b.dataset.du?-1:1)}));

  const XF=[...ml("name","Nome"),{n:"price",l:"Prezzo (€)",t:"number"}];
  $("#nx").onclick=()=>form("Nuovo extra",XF,{price:0},guard(async v=>{await persistExtras([...X,{name:v.name_es,name_es:v.name_es,name_en:v.name_en,name_it:v.name_it,price:Number(v.price)}])}));
  $$("[data-xe]").forEach(b=>b.onclick=()=>{const i=+b.dataset.xe,x=X[i];form("Modifica extra",XF,x,guard(async v=>{const next=[...X];next[i]={...x,name:v.name_es,name_es:v.name_es,name_en:v.name_en,name_it:v.name_it,price:Number(v.price)};await persistExtras(next)}),async()=>{await persistExtras(X.filter((_,j)=>j!==i))})});

  const AF=[{n:"code",l:"Codice (es. 01)",t:"text"},...ml("name","Nome")];
  $("#na").onclick=()=>form("Nuovo allergene",AF,{code:"",name_es:"",name_en:"",name_it:""},guard(async v=>{await persistAllergens([...A,{code:v.code,name:v.name_es,name_es:v.name_es,name_en:v.name_en,name_it:v.name_it}])}));
  $$("[data-ae]").forEach(b=>b.onclick=()=>{const i=+b.dataset.ae,x=A[i];form("Modifica allergene",AF,x,guard(async v=>{const next=[...A];next[i]={...x,code:v.code,name:v.name_es,name_es:v.name_es,name_en:v.name_en,name_it:v.name_it};await persistAllergens(next)}),async()=>{await persistAllergens(A.filter((_,j)=>j!==i))})});
};


/* — Novità — */
VIEWS.news=()=>{
  const today=new Date().toISOString().slice(0,10);
  const F=[{n:"type",l:"Tipo",t:"select",o:[["post","Novità"],["invite","Invito"],["dish","Nuovo piatto"],["event","Evento"]]},...ml("title","Titolo"),...ml("body","Testo",1),{n:"image_key",l:"Foto",t:"img"},{n:"published_at",l:"Data di pubblicazione",t:"date"},{n:"published",l:"Pubblicato",t:"check"},{n:"pinned",l:"Fissa in alto",t:"check"}];
  const N=S.news,TY={post:"Novità",invite:"Invito",dish:"Nuovo piatto",event:"Evento"};
  $("#view").innerHTML=`<div class="row sp"><div><h2>Novità</h2><p class="lead">Post di passaggio, inviti, nuovi piatti. Appaiono nella home e nella pagina Novità. Puoi programmare la data: il post esce da solo quel giorno.</p></div><button class="btn pri" id="nn">+ Nuovo post</button></div><div class="card list">${N.length?N.map(n=>`<div class="${n.published?"":"off"}">${n.image_key?`<img src="${e(imgSrc(n.image_key))}" alt="">`:""}<div class="nm"><b>${e(n.title_es)}</b><small>${TY[n.type]||""} · ${e(n.published_at)}${n.pinned?" · ★ fissato":""}</small></div><span class="pill ${n.published&&n.published_at<=today?"on":""}">${!n.published?"bozza":n.published_at>today?"programmato":"online"}</span><button class="btn sm" data-ne="${n.id}">Modifica</button></div>`).join(""):'<div class="empty" style="width:100%">Ancora nessun post. Scrivi il primo!</div>'}</div>`;
  const re=async()=>{await load();VIEWS.news()};
  $("#nn").onclick=()=>form("Nuovo post",F,{type:"post",published:1,published_at:today},guard(async v=>{await api("/news",{method:"POST",json:v});await re();toast("Pubblicato ✔")}));
  $$("[data-ne]").forEach(b=>b.onclick=()=>{const n=N.find(x=>x.id==b.dataset.ne);form("Modifica post",F,n,guard(async v=>{await api("/news/"+n.id,{method:"PUT",json:v});await re();toast("Salvato ✔")}),async()=>{await api("/news/"+n.id,{method:"DELETE"});await re()})});
};

/* — Dalla cucina — */
VIEWS.home=()=>{
  const A=S.homeFeaturedCards||[];
  const F=[...ml("title","Titolo"),...ml("description","Descrizione",1),
    {n:"image_key",l:"Foto",t:"img"},
    {n:"published",l:"Pubblicata",t:"check"}];

  $("#view").innerHTML=`
    <div class="row sp">
      <div><h2>Dalla cucina</h2>
      <p class="lead">Gestisci le card in evidenza nella home, indipendentemente dalla Carta.</p></div>
      <button class="btn pri" id="hnew">+ Nuova card</button>
    </div>
    <div class="card" style="padding:18px;margin-bottom:20px">
      <label style="display:flex;align-items:center;gap:12px">
        <input type="checkbox" id="henabled" ${S.kv.homeFeaturedEnabled?"checked":""}>
        <span><b>Mostra la sezione nella homepage</b><small style="display:block;opacity:.7">Se disattivata, le card restano salvate e potrai riattivarla quando vuoi.</small></span>
      </label>
      
    </div>
    <h3 style="margin:24px 0 12px">Card della sezione</h3>
    <div class="card list">${A.length?A.map((x,i)=>`
      <div class="${x.published?"":"off"}">
        ${x.image_key?`<img src="${e(imgSrc(x.image_key))}" alt="">`:""}
        <div class="nm"><b>${e(x.title_es||"Senza titolo")}</b>
        <small>${e(x.title_en||"")} · ${e(x.title_it||"")}</small></div>
        <span class="pill ${x.published?"on":""}">${x.published?"pubblicata":"bozza"}</span>
        <button class="btn sm" data-hu="${i}" ${i===0?"disabled":""}>↑</button>
        <button class="btn sm" data-hd="${i}" ${i===A.length-1?"disabled":""}>↓</button>
        <button class="btn sm" data-he="${x.id}">Modifica</button>
      </div>`).join(""):'<div class="empty" style="width:100%">Ancora nessuna card. Aggiungi la prima proposta dalla cucina.</div>'}</div>
    <div style="margin-top:20px">${saveBar("Salva visibilità")}</div>
  `;

  const re=async()=>{await load();VIEWS.home()};
  $("#save").onclick=guard(async()=>{
    S.kv.homeFeaturedEnabled=$("#henabled").checked;
    await saveKV(["homeFeaturedEnabled"])();
  });

  $("#hnew").onclick=()=>form("Nuova card",F,{published:1,sort_order:A.length},
    guard(async v=>{
      await api("/home_featured_cards",{method:"POST",json:{...v,sort_order:A.length}});
      await re();toast("Card creata ✔");
    }));

  $$("[data-he]").forEach(b=>b.onclick=()=>{
    const x=A.find(y=>y.id==b.dataset.he);
    form("Modifica card",F,x,guard(async v=>{
      await api("/home_featured_cards/"+x.id,{method:"PUT",json:v});
      await re();toast("Card salvata ✔");
    }),async()=>{
      if(!confirm("Eliminare questa card?"))return;
      await api("/home_featured_cards/"+x.id,{method:"DELETE"});
      await re();toast("Card eliminata");
    });
  });

  $$("[data-hu],[data-hd]").forEach(b=>b.onclick=guard(async()=>{
    const i=+(b.dataset.hu??b.dataset.hd),j=i+(b.dataset.hu?-1:1);
    if(j<0||j>=A.length)return;
    const ids=A.map(x=>x.id);
    [ids[i],ids[j]]=[ids[j],ids[i]];
    await api("/reorder",{method:"PUT",json:{table:"home_featured_cards",ids}});
    await re();
  }));
};

/* — Orari — */
VIEWS.hours=()=>{
  const H=S.kv.hours=S.kv.hours||JSON.parse(JSON.stringify(G.HOURS_DEFAULT));
  H.closed_dates=H.closed_dates||[];
  const days=["Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato","Domenica"];
  const draw=()=>{
    $("#view").innerHTML=`<h2>Orari di apertura</h2><p class="lead">Compaiono nella home e in “Dove siamo”, con l’indicazione “Aperto ora” in tempo reale (ora delle Canarie).</p>
    <div class="card">${H.days.map((d,i)=>{const s=d.slots||[];return `<div class="hrow"><b>${days[i]}</b><label class="check" style="margin:0"><input type="checkbox" data-o="${i}" ${d.open?"checked":""}> Aperto</label>
      <div class="tm" ${d.open?"":"hidden"}>${[0,1].map(k=>`<input type="time" data-i="${i}" data-k="${k}" data-p="0" value="${s[k]?s[k][0]:""}" aria-label="Apre"> – <input type="time" data-i="${i}" data-k="${k}" data-p="1" value="${s[k]?s[k][1]:""}" aria-label="Chiude">${k?"":'<span class="pill">turno 1</span>'}`).join('<span class="pill">turno 2 (opzionale)</span>')}</div></div>`}).join("")}</div>
    <div class="card"><h3>Giorni di chiusura straordinaria (ferie, festività)</h3><div id="cd">${H.closed_dates.map((c,i)=>`<div class="row" style="margin-bottom:8px"><input type="date" data-cd="${i}" data-w="date" value="${e(c.date)}" style="width:170px"><input type="text" data-cd="${i}" data-w="label" value="${e(c.label||"")}" placeholder="Motivo (facoltativo)" style="flex:1"><button class="btn sm danger" data-cx="${i}">×</button></div>`).join("")}</div><button class="btn sm" id="addcd">+ Aggiungi giorno</button></div>
    <div class="card"><h3>Nota sotto gli orari (facoltativa)</h3>${L.map((l,i)=>`<label class="f">${LU[i]}</label><input type="text" data-n="${l}" value="${e(H["note_"+l]||"")}">`).join("")}</div>${saveBar()}`;
    $$("[data-o]").forEach(c=>c.onchange=()=>{H.days[c.dataset.o].open=c.checked;if(c.checked&&!(H.days[c.dataset.o].slots||[]).length)H.days[c.dataset.o].slots=[["09:00","17:00"]];draw()});
    $$("input[data-p]").forEach(t=>t.onchange=()=>{const d=H.days[t.dataset.i];d.slots=d.slots||[];const k=+t.dataset.k;d.slots[k]=d.slots[k]||["",""];d.slots[k][+t.dataset.p]=t.value;d.slots=d.slots.filter(x=>x&&x[0]&&x[1])});
    $$("[data-cd]").forEach(i=>i.onchange=()=>{H.closed_dates[i.dataset.cd][i.dataset.w]=i.value});
    $$("[data-cx]").forEach(b=>b.onclick=()=>{H.closed_dates.splice(b.dataset.cx,1);draw()});
    $("#addcd").onclick=()=>{H.closed_dates.push({date:"",label:""});draw()};
    $$("[data-n]").forEach(i=>i.onchange=()=>H["note_"+i.dataset.n]=i.value);
    $("#save").onclick=()=>{H.closed_dates=H.closed_dates.filter(c=>c.date);saveKV(["hours"])()};
  };draw();
};

/* — Pop-up — */
VIEWS.popup=()=>{
  const P=S.kv.popup=S.kv.popup||{enabled:false,id:String(Date.now()),freq:"session"};
  const F=[...ml("title","Titolo"),...ml("body","Testo",1),...ml("cta","Testo del pulsante"),{n:"cta_url",l:"Link del pulsante (es. menu.html o novedades.html)",t:"text"},{n:"image",l:"Foto (facoltativa)",t:"img"},{n:"start",l:"Inizia il (facoltativo)",t:"datetime-local"},{n:"end",l:"Finisce il (facoltativo)",t:"datetime-local"}];
  $("#view").innerHTML=`<h2>Pop-up</h2><p class="lead">Un avviso che si apre sulla home: una serata speciale, una chiusura, un invito. Puoi programmarlo e deciderne la frequenza.</p>
  <div class="card"><label class="check" style="margin:0"><input type="checkbox" id="pe" ${P.enabled?"checked":""}> <b>Pop-up attivo</b></label>
  <label class="f">Quante volte mostrarlo a ciascun visitatore</label><select id="pf"><option value="session">Una volta per visita</option><option value="day">Una volta al giorno</option><option value="week">Una volta a settimana</option><option value="always">Ogni volta che apre la home</option></select>
  <div id="pfields"></div><div class="row" style="margin-top:18px"><button class="btn sm" id="pr">Mostralo di nuovo a tutti</button><button class="btn sm" id="pp">Anteprima</button></div></div>${saveBar()}`;
  $("#pf").value=P.freq||"session";
  const holder=$("#pfields");
  holder.innerHTML=F.map(f=>f.t==="img"?`<label class="f">${f.l}</label><div class="imgf" style="display:flex;gap:12px;align-items:center"><img id="pim" src="${e(imgSrc(P.image))}" alt="" ${P.image?"":"hidden"} style="width:80px;height:80px;object-fit:cover"><button class="btn sm" id="pu">Carica foto</button><button class="btn sm" id="prm">Rimuovi</button></div>`:f.t==="area"?`<label class="f">${f.l}</label><textarea data-p="${f.n}">${e(P[f.n]||"")}</textarea>`:`<label class="f">${f.l}</label><input type="${f.t||"text"}" data-p="${f.n}" value="${e(P[f.n]||"")}">`).join("");
  $$("[data-p]",holder).forEach(i=>i.oninput=()=>P[i.dataset.p]=i.value);
  $("#pe").onchange=ev=>P.enabled=ev.target.checked;$("#pf").onchange=ev=>P.freq=ev.target.value;
  $("#pu").onclick=guard(async()=>{const f=await pickFile();if(!f)return;P.image=await upload(f);$("#pim").src=imgSrc(P.image);$("#pim").hidden=false});
  $("#prm").onclick=()=>{P.image=null;$("#pim").hidden=true};
  $("#pr").onclick=()=>{P.id=String(Date.now());toast("Ok: dopo il salvataggio verrà mostrato di nuovo a tutti")};
  $("#pp").onclick=()=>{const m=$("#modal");m.innerHTML=`<div class="mbox"><h2>${e(P.title_es||"(titolo)")}</h2>${P.image?`<img src="${e(imgSrc(P.image))}" alt="" style="width:100%;margin:14px 0">`:""}<p>${e(P.body_es||"")}</p><div class="row" style="margin-top:20px"><button class="btn pri" id="pc">Chiudi anteprima</button></div></div>`;m.hidden=false;$("#pc").onclick=()=>m.hidden=true};
  $("#save").onclick=saveKV(["popup"]);
};

/* — Testi — */
VIEWS.texts=()=>{
  const GR=[["Home · Portada","hero"],["Home · Introducción","intro"],["Home · Atmósfera","atm"],["Home · Cocina","cuc"],["Home · Brunch","bru"],["Home · De la cocina","gal.k,gal.t"],["Home · Novedades","news.k,news.t,news.all"],["Home · Detalles","det"],["Home · La Laguna","lag"],["Home · Experiencia","esp"],["Home · Instagram","ig"],["Home · Horario","hrs"],["Home · Invitación final","cta"],["Página Génesis","gen."],["Página Visítanos","vis."],["Carta · cabecera","menu.k,menu.t,menu.p"],["Pie de página (indirizzo, contatti, social)","ft.tag,ft.addr,ft.phone,ft.mail,ft.ig,ft.fb,ft.ta,ft.rating,ft.legal,ft.visit,ft.social"]];
  const lab={k:"Etichetta",t:"Titolo",t2:"Titolo (riga 2)",p:"Testo",p2:"Testo 2",p3:"Testo 3",b:"Pulsante",q:"Citazione",l:"Elenco (separa le voci con |)",end:"Frase finale",tag:"Slogan",sub:"Sottotitolo",how:"Pulsante 2"};
  const keysOf=q=>q.includes(",")?q.split(",").flatMap(x=>x.includes(".")?[x]:Object.keys(G.T).filter(k=>k.startsWith(x+"."))):Object.keys(G.T).filter(k=>q.endsWith(".")?k.startsWith(q):k.startsWith(q+"."));
  const LK={"ft.addr":"Indirizzo (una riga per linea)","ft.phone":"Telefono (anche per il tasto Chiama)","ft.mail":"Email","ft.ig":"Link Instagram","ft.fb":"Link Facebook","ft.ta":"Link Tripadvisor","ft.rating":"Valutazione","ft.legal":"Link Privacy e cookie","ft.visit":"Titolo colonna indirizzo","ft.social":"Titolo colonna social","ft.tag":"Slogan sotto il logo"};
  const kl=k=>LK[k]||lab[k.split(".").pop()]||k;
  $("#view").innerHTML=`<h2>Testi del sito</h2><p class="lead">Ogni testo in tre lingue. Quello che non modifichi resta com’è nel sito originale.</p>`+GR.map(([n,q])=>`<details class="card"><summary style="cursor:pointer;font-weight:500">${n}</summary>${keysOf(q).filter(k=>G.T[k]).map(k=>`<label class="f">${e(kl(k))} <span style="opacity:.5;text-transform:none">(${k})</span></label><div class="grid3">${L.map((l,i)=>`<textarea rows="${/\.(p\d?|sub|l)$/.test(k)?4:2}" data-k="${k}" data-j="${i}" placeholder="${LU[i]}">${e(((S.kv.texts[k]||G.T[k])||[])[i]||"")}</textarea>`).join("")}</div>`).join("")}</details>`).join("")+saveBar();
  $("#save").onclick=()=>{
    $$("[data-k]").forEach(t=>{const k=t.dataset.k,j=+t.dataset.j,base=G.T[k];if(t.value!==base[j]||S.kv.texts[k]){S.kv.texts[k]=S.kv.texts[k]||[...base];S.kv.texts[k][j]=t.value}});
    saveKV(["texts"])();
  };
};

/* — Privacy e cookie (pagina unica) — */
VIEWS.legal=()=>{
  const O=S.kv.legal=S.kv.legal||{};
  $("#view").innerHTML=`<h2>Privacy e cookie</h2><p class="lead">Un’unica pagina per privacy e cookie, con la scelta dei cookie integrata. Modifica il testo qui sotto: se lasci vuoto EN o IT, nel sito si vede la versione in spagnolo.</p>
  <div class="card"><b>Come si scrive</b><p class="lead" style="margin:6px 0 0">Titolo grande: <code># Titolo</code> · Titoli di sezione: <code>### 1. Titolo</code> · Elenco: <code>- voce</code> · Grassetto: <code>**testo**</code> · I link <code>https://…</code> diventano cliccabili · Riga vuota = nuovo paragrafo. I testi tra parentesi quadre <code>[COMPLETAR]</code> si evidenziano: ricordati di sostituirli (es. il cognome nel punto 1).</p></div>
  ${["es","en","it"].map((l,i)=>`<div class="card"><h3><span class="chip">${LU[i]}</span> ${["Spagnolo (testo principale)","Inglese","Italiano"][i]}</h3><textarea data-l="${l}" rows="${l==="es"?22:10}" style="min-height:${l==="es"?380:160}px;font-family:ui-monospace,Menlo,monospace;font-size:.85rem" placeholder="${l==="es"?"":"Vuoto = si mostra la versione spagnola"}">${e(O[l]!=null&&O[l]!==""?O[l]:(l==="es"?G.LEGAL.es:G.LEGAL[l]||""))}</textarea>${l==="es"?'<div style="margin-top:10px"><button class="btn sm" id="lr">Ripristina il testo originale</button></div>':""}</div>`).join("")}${saveBar()}`;
  $$("[data-l]").forEach(t=>t.oninput=()=>{O[t.dataset.l]=t.value});
  $("#lr").onclick=()=>{if(confirm("Tornare al testo originale in spagnolo?")){delete O.es;VIEWS.legal()}};
  $("#save").onclick=()=>{$$("[data-l]").forEach(t=>{O[t.dataset.l]=t.value});if(O.es.trim()===G.LEGAL.es.trim())delete O.es;saveKV(["legal"])()};
};

start();
})();
