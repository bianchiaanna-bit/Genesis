/* Home: hero (mosaico reattivo / foto singola), caroselli piatti e novità, lightbox, orari */
(function(){
const G=window.GEN,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
let timer=null,tiles=[],last=-1;

/* titolo accessibile (il logo è l'immagine) */
function title(){const h=$("#hero-title"),sr=$(".sr",h);if(sr)sr.textContent=G.tx("hero.t")+" "+G.tx("hero.t2")}

/* ───── Hero a mosaico: veloce, a caso, e reagisce al tocco ───── */
function lightTile(i,ms){
  const t=tiles[i];if(!t)return;t.classList.add("lit");clearTimeout(t._o);t._o=setTimeout(()=>t.classList.remove("lit"),ms);
}
function auto(){
  const free=tiles.map((_,i)=>i).filter(i=>i!==last&&!tiles[i].classList.contains("lit"));
  const i=free[Math.floor(Math.random()*free.length)];last=i;lightTile(i,1900);
}
function startMosaic(){
  clearInterval(timer);if(reduce)return;
  auto();timer=setInterval(auto,1050);
}
function heroMode(){
  const mode=(G.O.hero&&G.O.hero.mode)==="single"?"single":"mosaic";
  $("#hero").dataset.mode=mode;$("#hero-mosaic").hidden=mode!=="mosaic";$("#hero-single").hidden=mode!=="single";
  clearInterval(timer);if(mode==="mosaic")startMosaic();
}
function bindTiles(){
  tiles=$$("#hero-mosaic>div");
  const hero=$("#hero");
  const hit=e=>{
    if(e.target.closest&&e.target.closest("a,button"))return;
    const els=document.elementsFromPoint(e.clientX,e.clientY);
    const t=els.map(x=>x.closest&&x.closest("#hero-mosaic>div")).find(Boolean);
    if(t){const i=tiles.indexOf(t);lightTile(i,2600);last=i}
  };
  hero.addEventListener("pointerdown",hit);
  hero.addEventListener("pointermove",e=>{if(e.pointerType==="mouse")hit(e)});
  hero.addEventListener("touchmove",e=>{const t=e.touches[0];if(t)hit({clientX:t.clientX,clientY:t.clientY,target:e.target})},{passive:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)clearInterval(timer);else if($("#hero").dataset.mode==="mosaic")startMosaic()});
}

/* luce calda che segue il cursore o il dito */
function glow(host,el){
  if(!host||!el)return;
  const mv=e=>{const r=host.getBoundingClientRect();el.style.setProperty("--mx",(e.clientX-r.left)+"px");el.style.setProperty("--my",(e.clientY-r.top)+"px")};
  host.addEventListener("pointermove",mv);host.addEventListener("pointerdown",mv);
}

const lines=(id,k)=>{$(id).innerHTML=G.tx(k).split("|").map(x=>`<li>${G.esc(x)}</li>`).join("")};

/* ───── Dalla cucina: card amministrabili + lightbox ───── */
let featuredCards=[],li=0;
const lb=$("#lb");

function dishes(){
  const section=$("#galeria"),before=section.previousElementSibling,after=section.nextElementSibling;
  const all=G.O.homeFeaturedCards||[];
  const visible=G.O.homeFeaturedEnabled!==false&&all.length>0;
  section.hidden=!visible;
  if(before?.classList.contains("plank"))before.hidden=!visible;
  if(after?.classList.contains("plank"))after.hidden=!visible;
  if(!visible)return;

  featuredCards=all.slice(0,4);
  const lang=G.lang||"es";
  const value=(x,k)=>x[k+"_"+lang]||x[k+"_es"]||"";
  const card=(x,i,hero=false)=>`
    <button class="home-dish ${hero?"featured-main":"featured-small"}" data-featured="${i}" aria-label="${G.esc(value(x,"title"))}">
      <img loading="lazy" src="${G.esc(G.img_url(x.image_key))}" alt="${G.esc(value(x,"title"))}">
      <span class="featured-cap"><b>${G.esc(value(x,"title"))}</b>${hero&&value(x,"description")?`<span>${G.esc(value(x,"description"))}</span>`:""}</span>
    </button>`;

  const main=featuredCards[0];
  $("#gal-car").innerHTML=`
    <div class="featured-layout">
      ${card(main,0,true)}
      <div class="featured-others">${featuredCards.slice(1).map((x,i)=>card(x,i+1)).join("")}</div>
    </div>`;
  $$(".home-dish",section).forEach(b=>b.onclick=()=>openLb(+b.dataset.featured));
}

function showLb(){
  const x=featuredCards[li],lang=G.lang||"es";
  if(!x)return;
  const title=x["title_"+lang]||x.title_es||"";
  const desc=x["description_"+lang]||x.description_es||"";
  $("img",lb).src=G.img_url(x.image_key);
  $("img",lb).alt=title;
  $("figcaption",lb).innerHTML=`${G.esc(title)}${desc?`<small>${G.esc(desc)}</small>`:""}`;
}
function openLb(i){
  li=i;showLb();lb.classList.add("open");lb.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";$(".x",lb).focus();
}
function closeLb(){
  lb.classList.remove("open");lb.setAttribute("aria-hidden","true");
  document.body.style.overflow="";
}
const step=d=>{
  if(!featuredCards.length)return;
  li=(li+d+featuredCards.length)%featuredCards.length;showLb();
};
$(".x",lb).onclick=closeLb;
$(".p",lb).onclick=()=>step(-1);
$(".n",lb).onclick=()=>step(1);
lb.addEventListener("click",e=>{if(e.target===lb)closeLb()});
document.addEventListener("keydown",e=>{
  if(!lb.classList.contains("open"))return;
  if(e.key==="Escape")closeLb();
  if(e.key==="ArrowLeft")step(-1);
  if(e.key==="ArrowRight")step(1);
});
let sx=0;
lb.addEventListener("touchstart",e=>sx=e.touches[0].clientX,{passive:true});
lb.addEventListener("touchend",e=>{
  const d=e.changedTouches[0].clientX-sx;
  if(Math.abs(d)>50)step(d<0?1:-1);
},{passive:true});

/* ───── Novità: carosello ───── */
function news(){
  const n=(G.O.news||[]).slice(0,6),h=$("#news-car");
  if(!n.length){h.innerHTML=`<p class="empty">${G.esc(G.tx("news.empty"))}</p>`;return}
  h.innerHTML=G.carHTML(n.map(G.postCard).join(""),"news-car");G.carousel(h.firstElementChild);
}
function hours(){
  $("#hours-box").innerHTML=G.hoursHTML(G.O.hours);
  const st=G.hoursState(G.O.hours),ho=$("#hero-open"),H=G.O.hours;
  const day=st&&H.days[st.today];
  ho.innerHTML=st?`<span class="hours-badge" style="margin:0"><span class="dot ${st.open?"on":""}"></span>${G.esc(G.tx(st.open?"hrs.open":"hrs.closed"))}${day&&day.open&&(day.slots||[]).length?" · "+G.esc(day.slots.map(s=>s.join("–")).join(" · ")):""}</span>`:"";
}
function render(){title();lines("#cuc-list","cuc.l");lines("#esp-list","esp.l");dishes();news();hours()}

bindTiles();glow($("#hero"),$("#hero-glow"));glow($("#cta"),$("#cta-glow"));
heroMode();render();
document.addEventListener("gen:lang",render);
document.addEventListener("gen:ready",()=>{heroMode();render();G.apply();G.observe()});
setInterval(()=>{if(G.O.hours)hours()},60000);
})();
