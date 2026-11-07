/* Visítanos: orari */
(function(){const G=window.GEN,b=document.getElementById("hours-box");
const r=()=>{b.innerHTML=`<span class="k" style="color:var(--g-deep)">${G.esc(G.tx("hrs.k"))}</span>`+G.hoursHTML(G.O.hours)};
r();document.addEventListener("gen:ready",r);document.addEventListener("gen:lang",r)})();
