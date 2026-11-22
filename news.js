/* Novedades: filtri, articolo in evidenza, griglia, singolo post (#n12) */
(function(){const G=window.GEN,$=s=>document.querySelector(s),e=G.esc;
const DEF={dish:"DSC00833.jpg",invite:"DSC00914.jpg",post:"DSC00727.jpg",event:"DSC00917.jpg"};
let all=[],flt="all";
const im=n=>n.image_key?G.img_url(n.image_key):G.PH+(DEF[n.type]||DEF.post);
const tag=n=>e(G.tx("tag."+(n.type||"post")));
const card=n=>`<a class="np r" href="#n${n.id}"><div class="np-i"><img loading="lazy" src="${e(im(n))}" alt=""><span class="np-t">${tag(n)}</span></div><div class="np-b"><time datetime="${e(n.published_at)}">${G.fmtDate(n.published_at)}</time><h3>${e(G.pick(n,"title"))}</h3><p>${e(G.pick(n,"body"))}</p></div></a>`;
function addReadIfClipped(root,selector){
  root.querySelectorAll(selector).forEach(p=>{
    if(p.scrollHeight>p.clientHeight+2){
      const a=document.createElement("span");
      a.className="np-m";
      a.textContent=G.tx("news.read")+" →";
      p.parentElement.append(a);
    }
  });
}
function list(){
  const F=$("#nfilters"),types=["all",...new Set(all.map(n=>n.type||"post"))];
  F.innerHTML=types.length>2?types.map(t=>`<button role="tab" class="${t===flt?"on":""}" data-f="${t}">${e(G.tx(t==="all"?"news.all.f":"tag."+t))}</button>`).join(""):"";
  F.querySelectorAll("button").forEach(b=>b.onclick=()=>{flt=b.dataset.f;route()});
  const items=all.filter(n=>flt==="all"||(n.type||"post")===flt),[f,...rest]=items;
  $("#news-feat").innerHTML=f?`<a class="nf r" href="#n${f.id}"><div class="nf-i"><img src="${e(im(f))}" alt=""></div><div class="nf-b"><span class="k">${e(G.tx("news.feat"))} · ${tag(f)}</span><time>${G.fmtDate(f.published_at)}</time><h2>${e(G.pick(f,"title"))}</h2><p>${e(G.pick(f,"body"))}</p></div></a>`:`<p class="empty">${e(G.tx("news.empty"))}</p>`;
  $("#news-full").innerHTML=rest.map(card).join("");
  requestAnimationFrame(()=>{
    addReadIfClipped($("#news-full"),".np-b p");
    addReadIfClipped($("#news-feat"),".nf-b p");
  });
  G.observe(document.querySelector(".nlist"));
}
function one(n){
  const el=$("#news-one");
  el.innerHTML=`<div class="na-back"><a href="novedades.html" class="btn sm" id="nb">← ${e(G.tx("news.back"))}</a></div>
    <img class="na-i" src="${e(im(n))}" alt="">
    <div class="na-m"><span class="k">${tag(n)}</span><time>${G.fmtDate(n.published_at)}</time></div>
    <h2>${e(G.pick(n,"title"))}</h2>
    ${e(G.pick(n,"body")).split(/\n+/).map(p=>`<p>${p}</p>`).join("")}
    <p style="margin-top:34px"><a class="btn sm" href="menu.html">${e(G.tx("nav.cta"))}</a></p>`;
  el.hidden=false;["#nfilters","#news-feat","#news-full"].forEach(s=>$(s).hidden=true);scrollTo(0,0);
  $("#nb").onclick=ev=>{ev.preventDefault();history.pushState(null,"","novedades.html");route()};
}
function route(){
  const m=location.hash.match(/^#n(\d+)$/),n=m&&all.find(x=>String(x.id)===m[1]);
  if(n){one(n);return}
  $("#news-one").hidden=true;["#nfilters","#news-feat","#news-full"].forEach(s=>$(s).hidden=false);list();
}
async function load(){
  try{const r=await fetch(G.API_BASE+"/api/news");if(!r.ok)throw 0;all=(await r.json()).news||[]}catch(x){all=G.NEWS||[]}
  route();
}
load();document.addEventListener("gen:lang",route);addEventListener("hashchange",route);
})();
