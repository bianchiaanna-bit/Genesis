/* Carta digital: lee /api/menu (D1), la pinta en ES/EN/IT. Si la API no responde muestra una carta de ejemplo. */
(function(){const G=window.GEN,$=s=>document.querySelector(s),e=G.esc;
let M=null,demo=false;
const eur=c=>c==null?"":new Intl.NumberFormat(G.lang==="es"?"es-ES":G.lang==="it"?"it-IT":"en-GB",{style:"currency",currency:"EUR"}).format(c/100);
const src=k=>e(G.img_url(k));
const price=d=>d.price_cents==null?"":(d.price_max_cents&&d.price_max_cents>d.price_cents?eur(d.price_cents)+" – "+eur(d.price_max_cents):eur(d.price_cents));
const extraPrice=x=>eur(Math.round(Number(x.price)*100));
const tags=d=>(+d.vegan?`<span class="tg">${e(G.tx("menu.vegan"))}</span>`:+d.vegetarian?`<span class="tg">${e(G.tx("menu.veg"))}</span>`:"");
const als=d=>String(d.allergens||"").split(/[,\s;]+/).filter(x=>/^\d+$/.test(x)&&G.T["al."+x]);
function special(s){
  const im=s.image_key?`<img src="${src(s.image_key)}" alt="">`:"";
  return `<div class="special">${im}<div><span class="k">${e(G.tx("menu.special"))}</span><h3>${e(G.pick(s,"title"))}</h3><p style="opacity:.85">${e(G.pick(s,"description"))}</p></div>${s.price_cents!=null?`<span class="price">${eur(s.price_cents)}</span>`:""}</div>`;
}
function dish(d){
  const im=d.image_key?`<img loading="lazy" src="${src(d.image_key)}" alt="">`:"";
  const desc=G.pick(d,"description"),soldout=d.available?"":` <small style="font:300 .7rem var(--sans);opacity:.8">· ${e(G.tx("menu.soldout"))}</small>`;
  return `<button type="button" class="dish ${im?"has-img":""} ${d.available?"":"off"}" data-d="${d.id}">${im}<div class="dn"><span class="dt">${e(G.pick(d,"name"))}</span><span class="price">${price(d)}${soldout}</span></div>${desc?`<p>${e(desc)}</p>`:""}${tags(d)?`<div class="tgs">${tags(d)}</div>`:""}</button>`;
}
function render(){
  if(!M)return;
  const cats=M.categories.filter(c=>(M.dishes||[]).some(d=>d.category_id===c.id));
  const extras=M.extras||[];
  $("#mcats").innerHTML=cats.map(c=>`<a href="#c${c.id}">${e(G.pick(c,"name"))}</a>`).join("")+(extras.length?`<a href="#extras">${e(G.tx("menu.extras"))}</a>`:"");
  const sp=(M.specials||[]).map(special).join("");
  const extraSection=extras.length?`<section class="mcat" id="extras"><h2>${e(G.tx("menu.extras"))}</h2><div class="extras-grid">${extras.map(x=>`<div class="extra-item"><span>${e(G.pick(x,"name"))}</span><span class="price">${extraPrice(x)}</span></div>`).join("")}</div></section>`:"";
  $("#mcont").innerHTML=(demo?`<span class="demo-note">${e(G.tx("menu.demo"))}</span>`:"")+sp+cats.map(c=>`<section class="mcat" id="c${c.id}"><h2>${e(G.pick(c,"name"))}</h2>${G.pick(c,"description")?`<p>${e(G.pick(c,"description"))}</p>`:""}<div class="mgrid">${M.dishes.filter(d=>d.category_id===c.id).map(dish).join("")}</div></section>`).join("")+extraSection;
  $("#mcont").hidden=false;$("#merr").hidden=true;
  document.querySelectorAll(".dish").forEach(b=>b.onclick=()=>openSheet(M.dishes.find(d=>String(d.id)===b.dataset.d)));
  const links=[...document.querySelectorAll("#mcats a")];
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){links.forEach(l=>l.classList.toggle("on",l.hash==="#"+x.target.id));const a=links.find(l=>l.classList.contains("on"));a&&a.scrollIntoView({inline:"center",block:"nearest"})}}),{rootMargin:"-30% 0px -60% 0px"});
  document.querySelectorAll(".mcat").forEach(s=>io.observe(s));
}
/* scheda piatto (foto grande + descrizione completa) */
const sh=document.createElement("div");sh.className="sheet";sh.setAttribute("role","dialog");sh.setAttribute("aria-modal","true");document.body.appendChild(sh);
function openSheet(d){
  if(!d)return;
  sh.innerHTML=`<div class="sheet-box"><button class="sheet-x" aria-label="${e(G.tx("menu.close"))}">×</button>${d.image_key?`<img src="${src(d.image_key)}" alt="${e(G.pick(d,"name"))}">`:""}<div class="sheet-b"><h3>${e(G.pick(d,"name"))}</h3><span class="price">${price(d)}${d.available?"":" · "+e(G.tx("menu.soldout"))}</span><p>${e(G.pick(d,"description"))}</p>${tags(d)?`<div class="tgs">${tags(d)}</div>`:""}${als(d).length?`<p class="al"><b>${e(G.tx("menu.allergens"))}:</b> ${als(d).map(x=>e(G.tx("al."+x))).join(" · ")}</p>`:""}${(M.extras||[]).length?`<div class="sheet-extras"><h4>${e(G.tx("menu.extras"))}</h4><ul>${M.extras.map(x=>`<li><span>${e(G.pick(x,"name"))}</span><span>${extraPrice(x)}</span></li>`).join("")}</ul></div>`:""}</div></div>`;
  sh.classList.add("open");document.body.style.overflow="hidden";sh.querySelector(".sheet-x").focus();
}
const closeSheet=()=>{sh.classList.remove("open");document.body.style.overflow=""};
sh.addEventListener("click",ev=>{if(ev.target===sh||ev.target.closest(".sheet-x"))closeSheet()});
document.addEventListener("keydown",ev=>{if(ev.key==="Escape")closeSheet()});

fetch("/api/menu").then(r=>r.ok?r.json():Promise.reject()).then(d=>{
  if(!d.categories||!d.categories.length)throw 0;M=d;render()
}).catch(()=>{M=G.MENU;demo=true;render()});
document.addEventListener("gen:lang",render);
})();
