/* Génesis · Cloudflare Worker (API pública + panel admin). Bindings: DB (D1), IMAGES (R2), ASSETS. */
const J=(d,s=200,h={})=>new Response(JSON.stringify(d),{status:s,headers:{"content-type":"application/json;charset=utf-8",...h}});
const LANGS=["es","en","it"];
const ML=(base)=>LANGS.map(l=>`${base}_${l}`);

/* tablas editables: columnas permitidas */
const TABLES={
  categories:{cols:[...ML("name"),"slug","sort_order"],order:"sort_order,id"},
  dishes:{cols:["category_id",...ML("name"),...ML("description"),"price_cents","price_max_cents","allergens","vegetarian","vegan","image_key","available","sort_order"],order:"category_id,sort_order,id"},
  specials:{cols:[...ML("title"),...ML("description"),"price_cents","image_key","starts_at","ends_at","published"],order:"id DESC"},
  news:{cols:["type",...ML("title"),...ML("body"),"image_key","published_at","published","pinned"],order:"pinned DESC,published_at DESC,id DESC"},
  home_featured_cards:{cols:[...ML("title"),...ML("description"),"image_key","published","sort_order"],order:"sort_order,id"}
};
const KV_KEYS=["texts","imgs","hero","hours","popup","legal","homeFeaturedEnabled"];

/* ───── sesión ───── */
const enc=new TextEncoder();
const b64u=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
async function hmac(secret,data){const k=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return b64u(await crypto.subtle.sign("HMAC",k,enc.encode(data)))}
async function sha(s){return new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(s)))}
async function safeEq(a,b){const x=await sha(a),y=await sha(b);let r=0;for(let i=0;i<x.length;i++)r|=x[i]^y[i];return r===0}
async function makeToken(env){const p=b64u(enc.encode(JSON.stringify({exp:Date.now()+12*3600e3})));return p+"."+await hmac(env.SESSION_SECRET,p)}
async function authed(req,env){
  const m=(req.headers.get("cookie")||"").match(/(?:^|;\s*)gen_s=([^;]+)/);if(!m||!env.SESSION_SECRET)return false;
  const [p,s]=m[1].split(".");if(!p||!s||!(await safeEq(s,await hmac(env.SESSION_SECRET,p))))return false;
  try{return JSON.parse(atob(p.replace(/-/g,"+").replace(/_/g,"/"))).exp>Date.now()}catch{return false}
}
const cookie=(v,age)=>`gen_s=${v}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;

/* ───── utilidades ───── */
async function kvAll(env){
  const {results}=await env.DB.prepare("SELECT key,value FROM site_kv").all();const o={};
  for(const r of results){try{o[r.key]=JSON.parse(r.value)}catch{}}return o;
}
const pickCols=(t,b)=>{const o={};for(const c of TABLES[t].cols)if(c in b)o[c]=b[c]===""?null:b[c];return o};
const slugify=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"cat";
async function fixRow(env,t,o,isNew){
  if(t==="categories"&&isNew){
    const base=slugify(o.name_es);let s=base,n=2;const ex=new Set((await env.DB.prepare("SELECT slug FROM categories").all()).results.map(r=>r.slug));
    while(ex.has(s))s=base+"-"+n++;o.slug=s;
    for(const l of["en","it"])if(!o["name_"+l])o["name_"+l]=o.name_es;
  }
  if(t==="specials")for(const l of["en","it"]){if("title_"+l in o||isNew){if(!o["title_"+l])o["title_"+l]=o.title_es||""}}
  return o;
}
const today=()=>new Date().toISOString().slice(0,10);
const visibleNews=(env,n=50)=>env.DB.prepare("SELECT * FROM news WHERE published=1 AND published_at<=? ORDER BY pinned DESC,published_at DESC,id DESC LIMIT ?").bind(today(),n).all().then(r=>r.results);
const visibleHomeFeaturedCards=env=>env.DB.prepare("SELECT * FROM home_featured_cards WHERE published=1 ORDER BY sort_order,id").all().then(r=>r.results);

async function publicMenu(env){
  /* se alguna tabla no tiene una columna (active, published…), se ignora el filtro en lugar de fallar */
  const all=async(t,o)=>(await env.DB.prepare(`SELECT * FROM ${t} ORDER BY ${o}`).all()).results;
  const cats=(await all("categories","sort_order,id")).filter(c=>c.active===undefined||c.active===null||+c.active===1);
  const ids=new Set(cats.map(c=>c.id));
  const dishes=(await all("dishes","sort_order,id")).filter(d=>ids.has(d.category_id));
  const t=today();
  const specials=(await all("specials","id DESC")).filter(s=>(s.published===undefined||+s.published===1)&&(!s.starts_at||String(s.starts_at).slice(0,10)<=t)&&(!s.ends_at||String(s.ends_at).slice(0,10)>=t));
  const info=await env.DB.prepare("SELECT value_es FROM settings WHERE key='menu_info'").first();
  let extras=[];
  try{extras=JSON.parse(info?.value_es||"{}").extras||[]}catch{}
  return {categories:cats,dishes,specials,extras};
}

/* ───── router ───── */
export default {
  async fetch(req,env){
    const url=new URL(req.url),p=url.pathname,m=req.method;
    try{
      if(p.startsWith("/img/")){
        const o=await env.IMAGES.get(decodeURIComponent(p.slice(5)));if(!o)return new Response("Not found",{status:404});
        return new Response(o.body,{headers:{"content-type":o.httpMetadata?.contentType||"image/jpeg","cache-control":"public,max-age=31536000,immutable"}});
      }
      if(!p.startsWith("/api/"))return env.ASSETS.fetch(req);

      /* públicas */
      if(p==="/api/public"&&m==="GET"){
        const kv=await kvAll(env);
        return J({texts:kv.texts||{},imgs:kv.imgs||{},hero:kv.hero||{mode:"mosaic"},hours:kv.hours||null,popup:kv.popup||null,legal:kv.legal||null,news:(await visibleNews(env,6)),homeFeaturedEnabled:kv.homeFeaturedEnabled!==false,homeFeaturedCards:await visibleHomeFeaturedCards(env)},200,{"cache-control":"public,max-age=30"});
      }
      if(p==="/api/menu"&&m==="GET")return J(await publicMenu(env),200,{"cache-control":"public,max-age=30"});
      if(p==="/api/news"&&m==="GET")return J({news:await visibleNews(env)},200,{"cache-control":"public,max-age=30"});

      /* login */
      if(p==="/api/admin/login"&&m==="POST"){
        const b=await req.json().catch(()=>({}));
        if(!env.ADMIN_PASSWORD||!env.SESSION_SECRET)return J({error:"Faltan los secretos ADMIN_PASSWORD / SESSION_SECRET"},500);
        if(!(await safeEq(String(b.password||""),env.ADMIN_PASSWORD))){await new Promise(r=>setTimeout(r,700));return J({error:"Contraseña incorrecta"},401)}
        return J({ok:true},200,{"set-cookie":cookie(await makeToken(env),43200)});
      }
      if(p==="/api/admin/logout"&&m==="POST")return J({ok:true},200,{"set-cookie":cookie("",0)});

      /* todo lo demás de /api/admin requiere sesión */
      if(!p.startsWith("/api/admin/"))return J({error:"Not found"},404);
      if(!(await authed(req,env)))return J({error:"No autorizado"},401);
      if(m!=="GET"){const o=req.headers.get("origin");if(o&&new URL(o).host!==url.host)return J({error:"Origen no permitido"},403)}
      const seg=p.slice(11).split("/").filter(Boolean);   // admin/xxx
      if(seg[0]==="me")return J({ok:true});

      if(seg[0]==="settings"){
        if(m==="GET")return J(await kvAll(env));
        if(m==="PUT"){
          const b=await req.json();const st=[];
          for(const k of KV_KEYS)if(k in b)st.push(env.DB.prepare("INSERT INTO site_kv(key,value,updated_at) VALUES(?,?,datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(k,JSON.stringify(b[k])));
          if(st.length)await env.DB.batch(st);return J({ok:true});
        }
      }
      if(seg[0]==="upload"&&m==="POST"){
        const ct=(req.headers.get("content-type")||"").split(";")[0];
        const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"}[ct];
        if(!ext)return J({error:"Solo JPG, PNG o WebP"},415);
        const buf=await req.arrayBuffer();if(buf.byteLength>8*1024*1024)return J({error:"Imagen demasiado grande (máx. 8 MB)"},413);
        const key=crypto.randomUUID()+"."+ext;await env.IMAGES.put(key,buf,{httpMetadata:{contentType:ct}});
        return J({key,url:"/img/"+key});
      }
      if(seg[0]==="menu"&&m==="GET"){   // vista completa para el panel
        const q=async t=>(await env.DB.prepare(`SELECT * FROM ${t} ORDER BY ${TABLES[t].order}`).all()).results;
        const row=await env.DB.prepare("SELECT value_es FROM settings WHERE key='menu_info'").first();
        let info={};try{info=JSON.parse(row?.value_es||"{}")}catch{}
        return J({categories:await q("categories"),dishes:await q("dishes"),specials:await q("specials"),extras:info.extras||[],allergens:info.allergens||[]});
      }
      if(seg[0]==="extras"&&m==="PUT"){
        const b=await req.json();
        if(!Array.isArray(b.extras))return J({error:"Datos no válidos"},400);
        const row=await env.DB.prepare("SELECT value_es FROM settings WHERE key='menu_info'").first();
        let info={};try{info=JSON.parse(row?.value_es||"{}")}catch{}
        info.extras=b.extras;
        await env.DB.prepare("UPDATE settings SET value_es=? WHERE key='menu_info'").bind(JSON.stringify(info)).run();
        return J({ok:true});
      }
      if(seg[0]==="allergens"&&m==="PUT"){
        const b=await req.json();
        if(!Array.isArray(b.allergens))return J({error:"Datos no válidos"},400);
        const row=await env.DB.prepare("SELECT value_es FROM settings WHERE key='menu_info'").first();
        let info={};try{info=JSON.parse(row?.value_es||"{}")}catch{}
        info.allergens=b.allergens;
        await env.DB.prepare("UPDATE settings SET value_es=? WHERE key='menu_info'").bind(JSON.stringify(info)).run();
        return J({ok:true});
      }
      if(seg[0]==="reorder"&&m==="PUT"){
        const {table,ids}=await req.json();if(!["categories","dishes","home_featured_cards"].includes(table)||!Array.isArray(ids))return J({error:"Datos no válidos"},400);
        await env.DB.batch(ids.map((id,i)=>env.DB.prepare(`UPDATE ${table} SET sort_order=? WHERE id=?`).bind(i,+id)));return J({ok:true});
      }
      const t=seg[0],id=seg[1];
      if(TABLES[t]){
        if(m==="GET"&&!id)return J({items:(await env.DB.prepare(`SELECT * FROM ${t} ORDER BY ${TABLES[t].order}`).all()).results});
        if(m==="POST"&&!id){
          const o=await fixRow(env,t,pickCols(t,await req.json()),true),k=Object.keys(o);if(!k.length)return J({error:"Sin datos"},400);
          const r=await env.DB.prepare(`INSERT INTO ${t}(${k.join(",")}) VALUES(${k.map(()=>"?").join(",")})`).bind(...k.map(c=>o[c])).run();
          return J({id:r.meta.last_row_id},201);
        }
        if(m==="PUT"&&id){
          const o=await fixRow(env,t,pickCols(t,await req.json()),false),k=Object.keys(o);if(!k.length)return J({error:"Sin datos"},400);
          await env.DB.prepare(`UPDATE ${t} SET ${k.map(c=>c+"=?").join(",")}${(t==="dishes"||t==="specials"||t==="home_featured_cards")?",updated_at=datetime('now')":""} WHERE id=?`).bind(...k.map(c=>o[c]),+id).run();return J({ok:true});
        }
        if(m==="DELETE"&&id){
          if(t==="categories")await env.DB.prepare("DELETE FROM dishes WHERE category_id=?").bind(+id).run();
          await env.DB.prepare(`DELETE FROM ${t} WHERE id=?`).bind(+id).run();return J({ok:true});
        }
      }
      return J({error:"Not found"},404);
    }catch(e){return J({error:String(e.message||e)},500)}
  }
};
