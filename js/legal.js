/* Privacidad y cookies: una sola página, texto editable desde el admin, elección de cookies */
(function(){const G=window.GEN,$=s=>document.querySelector(s);
function inline(t){return G.esc(t).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/(https?:\/\/[^\s<]+[^\s<.,;:)])/g,'<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\[([^\]]+)\]/g,'<span class="pending">[$1]</span>')}
function md(src){
  const out=[];let list=false,para=[];
  const fp=()=>{if(para.length){out.push("<p>"+para.map(inline).join("<br>")+"</p>");para=[]}},fl=()=>{if(list){out.push("</ul>");list=false}};
  for(const raw of src.split(/\r?\n/)){
    const l=raw.trim();
    if(!l){fp();fl();continue}
    let m;
    if(m=l.match(/^(#{1,4})\s+(.*)$/)){fp();fl();out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`)}
    else if(m=l.match(/^[-•]\s+(.*)$/)){fp();if(!list){out.push("<ul>");list=true}out.push("<li>"+inline(m[1])+"</li>")}
    else{fl();para.push(l)}
  }fp();fl();return out.join("\n");
}
function state(){let c=null;try{c=localStorage.getItem("genesis-cookies")}catch(_){}$("#ck-state").textContent=G.tx("lg.state."+(c||"none"))}
function render(){
  const o=G.O.legal||{},l=G.lang;
  let t=(o[l]||"").trim()||(G.LEGAL[l]||"").trim(),fb=false;
  if(!t){t=(o.es||"").trim()||G.LEGAL.es;fb=l!=="es"}
  $("#legal-body").innerHTML=md(t)+(fb?`<p class="legal-date">${G.esc(G.tx("legal.note"))}</p>`:"");
  document.title=G.tx("legal.title")+" | Génesis Restaurante";state();
}
document.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{try{localStorage.setItem("genesis-cookies",b.dataset.c)}catch(_){}const ck=document.getElementById("ck");ck&&ck.classList.remove("open");document.dispatchEvent(new CustomEvent("gen:consent",{detail:b.dataset.c}));state()});
render();document.addEventListener("gen:ready",render);document.addEventListener("gen:lang",render);
if(location.hash==="#cookies")setTimeout(()=>$("#cookies").scrollIntoView(),300);
})();
