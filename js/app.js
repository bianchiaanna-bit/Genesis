/* Génesis — logica condivisa: header, footer, lingua, impostazioni, popup, cookie */
(function(){
const G=window.GEN, $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const page=document.body.dataset.page||"";
const ALT={"immagini/logo/logo-genesis.png":["immagini/logo/logo-generis.png","assets/images/logo-genesis.png"],"immagini/logo/logo_black.png":["immagini/logo/logo-black.png","assets/images/logo_black.png"]};
G.logoFail=function(i){const a=(i.dataset.alt||"").split("|").filter(Boolean);
  if(a.length){i.dataset.alt=a.slice(1).join("|");i.src=a[0];return}
  i.replaceWith(Object.assign(document.createElement("span"),{className:"wm",textContent:"GÉNESIS"}))};
const logo=(src,cls="")=>`<img class="${cls}" src="${src}" data-alt="${(ALT[src]||[]).join("|")}" alt="Génesis Restaurante" onerror="GEN.logoFail(this)">`;
const PH=`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>`;
const PIN=`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.800 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`;
const BK=`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z"/><path d="M8 4v13a3 3 0 0 0 0 3"/></svg>`;
const TEL="tel:+34625079130";

const NAV=[["genesis.html","nav.story","genesis"],["novedades.html","nav.news","news"],["como-llegar.html","nav.visit","visit"]];   // desktop
const NAVM=[["menu.html","nav.menu","menu"],...NAV];                                           // mobile
const IG=`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.7" r="1"/></svg>`;
const FB=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3.3 0-5 1.8-5 5v3H6v4h3v5h4v-5h3l1-4h-4V9c0-.7.3-1 1-1Z"/></svg>`;
const TA=`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="8.5" cy="12" r="2.1"/><circle cx="15.5" cy="12" r="2.1"/></svg>`;
const LOCK=`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`;
const langBtns=()=>`<div class="lang" role="group" aria-label="Idioma">${G.LANGS.map(l=>`<button type="button" data-lang="${l}" class="${l===G.lang?"on":""}">${l.toUpperCase()}</button>`).join("")}</div>`;

function build(){
  const links=NAV.map(([h,k,id])=>`<a href="${h}" data-i="${k}" ${page===id?'aria-current="page"':""}></a>`).join("");
  document.body.insertAdjacentHTML("afterbegin",
   `<a class="skip" href="#main" data-i="skip"></a>
    <header class="site-header" id="hdr">
      <a class="brand" href="index.html" aria-label="Génesis Restaurante">${logo(G.LOGO_LIGHT)}</a>
      <nav class="desk" aria-label="Principal">${links}</nav>
      <div class="hact">${langBtns()}<a class="btn sm call" href="${TEL}" data-tel>${PH}<span data-i="nav.call"></span></a><a class="btn sm fill" href="menu.html" data-i="nav.cta"></a>
        <button class="burger" id="burger" aria-expanded="false" aria-controls="mnav" aria-label="Menu"><svg viewBox="0 0 40 40"><path class="hz" d="M8 20.4C14 19.8 25 20.6 32 19.7"/><path class="v" d="M20.3 8C19.6 14 20.5 26 19.6 32"/></svg></button></div>
    </header>
    <nav class="mnav" id="mnav" aria-label="Móvil">${NAVM.map(([h,k])=>`<a class="l" href="${h}" data-i="${k}"></a>`).join("")}<div class="row"><a class="btn fill" href="${TEL}" data-tel>${PH} <span data-i="nav.call"></span></a></div>${langBtns()}</nav>
    <nav class="bar" aria-label="Acciones"><a href="menu.html">${BK}<span data-i="bar.menu"></span></a><a class="fill" href="${TEL}" data-tel>${PH}<span data-i="nav.call"></span></a><a href="como-llegar.html">${PIN}<span data-i="bar.map"></span></a></nav>`);
  const f=`<footer class="site-footer"><div class="plank"></div>
    <div class="fmain">
      <div class="fbrand">${logo(G.LOGO_LIGHT)}<span data-i="ft.tag"></span></div>
      <div><div class="flabel" data-i="ft.visit"></div>
        <address data-i="ft.addr" style="white-space:pre-line"></address>
        <a data-i="ft.phone" data-h="tel"></a><a data-i="ft.mail" data-h="mail"></a></div>
      <div class="fsocial"><div class="flabel" data-i="ft.social"></div>
        <a data-h="url" data-k="ft.ig" target="_blank" rel="noopener noreferrer">${IG}<span>Instagram</span></a>
        <a data-h="url" data-k="ft.fb" target="_blank" rel="noopener noreferrer">${FB}<span>Facebook</span></a>
        <a data-h="url" data-k="ft.ta" target="_blank" rel="noopener noreferrer">${TA}<span>Tripadvisor</span></a>
        <span class="rating" data-i="ft.rating"></span></div>
    </div>
    <div class="fbottom"><span>© ${new Date().getFullYear()} Génesis Restaurante · La Laguna · Tenerife</span>
      <a class="legalbtn" href="privacy.html" data-i="ft.legal"></a>
      <span class="fadmin"><a href="admin/" title="Admin" aria-label="Admin">${LOCK}<span>Admin</span></a></span></div></footer>`;
  document.body.insertAdjacentHTML("beforeend",f);
  document.body.insertAdjacentHTML("beforeend",`<div class="ck" id="ck" role="dialog" aria-labelledby="ckt"><h4 id="ckt" data-i="ck.t"></h4><p><span data-i="ck.p"></span> <a href="privacy.html#cookies" data-i="ck.more"></a></p><div class="row"><button class="btn sm" id="ckno" data-i="ck.no"></button><button class="btn sm" id="ckyes" data-i="ck.yes"></button></div></div>`);
}

/* i18n */
function apply(root=document){
  document.documentElement.lang=G.lang;
  $$("[data-i]",root).forEach(e=>{e.textContent=G.tx(e.dataset.i)});
  $$("[data-img]",root).forEach(e=>{e.src=G.img(e.dataset.img)});
  const ph=G.tx("ft.phone").replace(/[^\d+]/g,"");
  $$("[data-tel]",root).forEach(a=>{if(ph)a.href="tel:"+ph});
  $$("[data-h]",root).forEach(a=>{const h=a.dataset.h,v=a.dataset.k?G.tx(a.dataset.k):a.textContent;a.href=h==="tel"?"tel:"+v.replace(/[^\d+]/g,""):h==="mail"?"mailto:"+v.trim():v});
  $$(".lang button").forEach(b=>b.classList.toggle("on",b.dataset.lang===G.lang));
}
G.apply=apply;
function bind(){
  document.addEventListener("click",e=>{
    const b=e.target.closest("[data-lang]");
    if(b){G.lang=b.dataset.lang;try{localStorage.setItem("genesis-language",G.lang)}catch(_){}apply();document.dispatchEvent(new Event("gen:lang"))}
  });
  const bg=$("#burger"),mn=$("#mnav");
  const tog=o=>{bg.setAttribute("aria-expanded",o);mn.classList.toggle("open",o);document.body.style.overflow=o?"hidden":""};
  bg.onclick=()=>tog(bg.getAttribute("aria-expanded")!=="true");
  $$("a",mn).forEach(a=>a.onclick=()=>tog(false));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")tog(false)});
  const h=$("#hdr"),sc=()=>h.classList.toggle("solid",scrollY>40);sc();addEventListener("scroll",sc,{passive:true});
  // cookie
  const ck=$("#ck"),set=v=>{try{localStorage.setItem("genesis-cookies",v)}catch(_){}ck.classList.remove("open");document.dispatchEvent(new CustomEvent("gen:consent",{detail:v}))};
  let c=null;try{c=localStorage.getItem("genesis-cookies")}catch(_){}
  if(!c)setTimeout(()=>ck.classList.add("open"),1400);
  $("#ckyes").onclick=()=>set("all");$("#ckno").onclick=()=>set("necessary");
}
/* reveal + parallax (un unico osservatore) */
G.observe=function(root=document){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12});
  $$(".r,.mask",root).forEach(e=>io.observe(e));
};
function parallax(){
  if(matchMedia("(prefers-reduced-motion:reduce)").matches)return;
  if(innerWidth<900)return;const els=$$(".split .im img");if(!els.length)return;let t=false;
  const run=()=>{t=false;const vh=innerHeight;els.forEach(i=>{const r=i.parentElement.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;const p=(r.top+r.height/2-vh/2)/vh;i.style.transform=`translateY(${(-p*60).toFixed(1)}px)`})};
  addEventListener("scroll",()=>{if(!t){t=true;requestAnimationFrame(run)}},{passive:true});run();
}

/* orari */
G.hoursState=function(h){
  if(!h||!h.days)return null;
  const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Atlantic/Canary",weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const g=k=>parts.find(p=>p.type===k).value;
  const di=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].indexOf(g("weekday"));
  const mins=+g("hour")*60+ +g("minute"),iso=`${g("year")}-${g("month")}-${g("day")}`;
  const d=h.days[di]||{},closedDay=(h.closed_dates||[]).some(x=>x.date===iso);
  const tm=s=>{const[a,b]=s.split(":");return +a*60+ +b};
  const open=!closedDay&&d.open&&(d.slots||[]).some(([a,b])=>mins>=tm(a)&&mins<tm(b));
  return {open,today:di,closedDay};
};
G.hoursHTML=function(h){
  if(!h||!h.days||!h.days.some(d=>d.open))return `<p class="hnote">${G.esc(G.tx("hrs.tbd"))}</p>`;
  const st=G.hoursState(h),sig=d=>d.open&&(d.slots||[]).length?d.slots.map(s=>s.join(" – ")).join(" · "):"",g=[];
  h.days.forEach((d,i)=>{const l=g[g.length-1];if(l&&l.sig===sig(d))l.to=i;else g.push({from:i,to:i,sig:sig(d)})});
  const rows=g.map(x=>{const today=st&&st.today>=x.from&&st.today<=x.to,one=x.from===x.to;
    const lab=one?`<span class="f">${G.esc(G.tx("day."+x.from))}</span><span class="s">${G.esc(G.tx("s"+x.from))}</span>`:`<span class="f">${G.esc(G.tx("day."+x.from))} – ${G.esc(G.tx("day."+x.to))}</span><span class="s">${G.esc(G.tx("s"+x.from))} – ${G.esc(G.tx("s"+x.to))}</span>`;
    return `<li class="${today?"today":""}"><span>${lab}</span><span>${x.sig?G.esc(x.sig):G.esc(G.tx("hrs.closedday"))}</span></li>`}).join("");
  const note=G.pick(h,"note");
  return `<div class="hours-badge"><span class="dot ${st&&st.open?"on":""}"></span>${G.esc(G.tx(st&&st.open?"hrs.open":"hrs.closed"))}</div><ul class="hrows">${rows}</ul>${note?`<p class="hnote">${G.esc(note)}</p>`:""}`;
};

/* popup */
function popup(){
  const p=G.O.popup;if(!p||!p.enabled||page!=="home")return;
  const now=Date.now();if(p.start&&now<Date.parse(p.start))return;if(p.end&&now>Date.parse(p.end))return;
  const key="genesis-popup-"+(p.id||"1"),fr=p.freq||"session";
  try{const s=fr==="session"?sessionStorage:localStorage,v=s.getItem(key);
    if(v&&fr!=="always"&&(fr==="session"||now-(+v)<(fr==="week"?6048e5:864e5)))return}catch(_){}
  const ttl=G.pick(p,"title"),body=G.pick(p,"body"),cta=G.pick(p,"cta"),im=p.image?G.img_url(p.image):"";
  const el=document.createElement("div");el.className="pop";el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");el.setAttribute("aria-label",ttl);
  el.innerHTML=`<div class="pop-box"><button class="pop-x" aria-label="${G.esc(G.tx("pop.close"))}">×</button>${im?`<img src="${G.esc(im)}" alt="">`:""}<div class="pop-b"><h3>${G.esc(ttl)}</h3><p>${G.esc(body)}</p>${p.cta_url&&cta?`<a class="btn" href="${G.esc(p.cta_url)}">${G.esc(cta)}</a>`:""}</div></div>`;
  document.body.appendChild(el);
  const close=()=>{el.classList.remove("open");try{(fr==="session"?sessionStorage:localStorage).setItem(key,String(Date.now()))}catch(_){}setTimeout(()=>el.remove(),600)};
  el.onclick=e=>{if(e.target===el||e.target.closest(".pop-x"))close()};
  document.addEventListener("keydown",e=>{if(e.key==="Escape")close()},{once:true});
  setTimeout(()=>{el.classList.add("open");$(".pop-x",el).focus()},2200);
}
G.img_url=k=>!k?"":(/^(https?:|data:|blob:|immagini\/|assets\/)/.test(k)||k.startsWith("/"))?k:"/img/"+k;
G.fmtDate=d=>{try{return new Intl.DateTimeFormat(G.lang,{day:"numeric",month:"long",year:"numeric"}).format(new Date(d))}catch(e){return d}};
G.postCard=n=>{const DEF={dish:"DSC00833.jpg",invite:"DSC00914.jpg",post:"DSC00727.jpg",event:"DSC00917.jpg"};const im=`<img loading="lazy" src="${G.esc(n.image_key?G.img_url(n.image_key):G.PH+(DEF[n.type]||DEF.post))}" alt="">`;
  return `<a class="cc ${n.pinned?"pinned":""}" href="novedades.html#n${n.id}">${im}<div class="nb"><small>${G.esc(G.tx("tag."+(n.type||"post")))}</small><b>${G.esc(G.pick(n,"title"))}</b><time datetime="${G.esc(n.published_at)}">${G.fmtDate(n.published_at)}</time><p>${G.esc(G.pick(n,"body"))}</p></div></a>`};
/* carosello con frecce e puntini */
G.carousel=function(root){
  const tr=root.querySelector(".car-track"),cs=[...tr.children],dots=root.querySelector(".dots"),pv=root.querySelector(".pv"),nx=root.querySelector(".nx");
  if(!cs.length)return;dots.innerHTML=cs.map(()=>"<i></i>").join("");
  const ds=[...dots.children],cur=()=>{let b=0,d=1e9;cs.forEach((c,i)=>{const x=Math.abs(c.offsetLeft-tr.scrollLeft-parseFloat(getComputedStyle(tr).paddingLeft));if(x<d){d=x;b=i}});return b};
  const upd=()=>{const i=cur();ds.forEach((d,k)=>d.classList.toggle("on",k===i))};
  tr.addEventListener("scroll",()=>requestAnimationFrame(upd),{passive:true});upd();
  const go=d=>{const i=Math.max(0,Math.min(cs.length-1,cur()+d));tr.scrollTo({left:cs[i].offsetLeft-parseFloat(getComputedStyle(tr).paddingLeft),behavior:"smooth"})};
  pv&&(pv.onclick=()=>go(-1));nx&&(nx.onclick=()=>go(1));
};
G.carHTML=(cards,cls="")=>`<div class="car ${cls}"><div class="car-track">${cards}</div><div class="car-ui"><div class="dots"></div><div class="car-btns"><button class="pv" aria-label="←"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><button class="nx" aria-label="→"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div></div></div>`;
/* init */
build();bind();apply();
G.ready=fetch("/api/public",{headers:{accept:"application/json"}}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{
  G.O.texts=d.texts||{};G.O.imgs=d.imgs||{};G.O.hero=d.hero||G.O.hero;G.O.hours=d.hours||null;G.O.popup=d.popup||null;G.O.legal=d.legal||null;G.O.news=d.news||[];G.O.homeFeaturedEnabled=d.homeFeaturedEnabled!==false;G.O.homeFeaturedCards=d.homeFeaturedCards||[];
}).catch(()=>{G.O.offline=true}).then(()=>{if(!(G.O.news||[]).length&&G.O.offline)G.O.news=G.NEWS||[];if(!G.O.hours)G.O.hours=G.HOURS_DEFAULT||null;apply();document.dispatchEvent(new Event("gen:ready"));popup();});
G.observe();parallax();
})();
