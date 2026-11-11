// Tesla FSD Tracker — Canada
// Data: data/fsd-listings.json, written by tools/fsd_scraper.py via GitHub Actions.
// Fallback seed mirrors that file so the page also works from file://.
const FALLBACK = {generated_at:null,listings:[]};
const CITY_LL = { // rough centroids for distance estimates
  "Toronto":[43.65,-79.38],"Ottawa":[45.42,-75.70],"Montreal":[45.50,-73.57],
  "Vancouver":[49.28,-123.12],"Calgary":[51.04,-114.07],"Edmonton":[53.55,-113.49],
  "Winnipeg":[49.90,-97.14],"Halifax":[44.65,-63.57],"Mississauga":[43.59,-79.64],
  "Brampton":[43.73,-79.76],"Hamilton":[43.26,-79.87],"Kitchener":[43.45,-80.49],
  "London":[42.98,-81.25],"Markham":[43.86,-79.34],"Vaughan":[43.79,-79.45],
  "Surrey":[49.19,-122.85],"Burnaby":[49.25,-122.98],"Victoria":[48.43,-123.37],
  "Quebec City":[46.81,-71.21],"Regina":[50.45,-104.62],"Saskatoon":[52.16,-106.67]
};
// Minimal postal-code FSA -> city approximation for Ontario/BC/AB/QC population centres
const FSA = {"M5V":"Toronto","M4B":"Toronto","L5B":"Mississauga","L6P":"Brampton","V6B":"Vancouver","V5K":"Vancouver","T2P":"Calgary","T5J":"Edmonton","H3B":"Montreal","K1P":"Ottawa","R3C":"Winnipeg","B3H":"Halifax"};
let ALL=[], state={model:"all"};
const $=s=>document.querySelector(s);

function haversine(a,b,c,d){const R=6371,r=x=>x*Math.PI/180;const h=Math.sin(r(c-a)/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(d-b)/2)**2;return 2*R*Math.asin(Math.sqrt(h));}
function userLL(){
  const p=($("#postal").value||"").toUpperCase().replace(/\s/g,"");
  if(p.length<3) return null;
  const city=FSA[p.slice(0,3)]; if(!city||!CITY_LL[city]) return null;
  return CITY_LL[city];
}
function distFor(l){
  const u=userLL(); if(!u) return null;
  const ll=(l.lat&&l.lon)?[l.lat,l.lon]:CITY_LL[l.city]; if(!ll) return null;
  return Math.round(haversine(u[0],u[1],ll[0],ll[1]));
}
const fmt$=n=>n==null?"See listing":"$"+n.toLocaleString("en-CA");
const fmtKm=n=>n==null?"mileage n/a":n.toLocaleString("en-CA")+" km";

function liveLinks(){
  const model=state.model==="all"?"Tesla":state.model;
  const prov=$("#province").value;
  const q=encodeURIComponent(model+" Full Self-Driving");
  const links=[
    ["AutoTrader.ca — FSD search",`https://www.autotrader.ca/cars/tesla/?keyword=${encodeURIComponent("Full Self-Driving")}`],
    ["CarGurus.ca — Tesla",`https://www.cargurus.ca/Cars/l-Used-Tesla-d3049#cx=1&q=${q}`],
    ["Kijiji Autos — Tesla FSD",`https://www.kijijiautos.ca/cars/tesla/?q=${q}`],
    ["Facebook Marketplace — vehicles",`https://www.facebook.com/marketplace/category/vehicles/?query=${q}`],
    ["Tesla Canada — used inventory",`https://www.tesla.com/en_CA/inventory/used/`]
  ];
  $("#liveBtns").innerHTML=links.map(([t,u],i)=>`<a class="${i?'alt':''}" target="_blank" rel="noopener" href="${u}">${t}</a>`).join("");
}

function apply(){
  const q=($("#q").value||"").toLowerCase();
  const pkgs=[...document.querySelectorAll(".pkg:checked")].map(e=>e.value);
  const hws=[...document.querySelectorAll(".hw:checked")].map(e=>e.value);
  const pMax=+$("#priceMax").value, kMax=+$("#kmMax").value, yMin=+$("#yearMin").value;
  const prov=$("#province").value, seller=$("#seller").value, src=$("#source").value;
  const dMax=+$("#distMax").value;
  $("#priceVal").textContent=pMax>=200000?"Any":fmt$(pMax);
  $("#kmVal").textContent=kMax>=300000?"Any":fmtKm(kMax);
  $("#yearVal").textContent=yMin;
  $("#distVal").textContent=userLL()?(dMax>=1000?"Any":dMax+" km"):"enter postal code";
  let out=ALL.filter(l=>{
    if(state.model!=="all"&&l.model!==state.model) return false;
    if(pkgs.length&&!l.packages.some(p=>pkgs.includes(p))) return false;
    if(hws.length&&l.hardware&&!hws.includes(l.hardware)) return false;
    if((l.price_cad!=null&&l.price_cad>pMax)||(l.mileage_km!=null&&l.mileage_km>kMax)||(l.year!=null&&l.year<yMin)) return false;
    if(prov!=="all"&&l.province!==prov) return false;
    if(seller!=="all"&&l.seller_type!==seller) return false;
    if(src!=="all"&&l.source!==src) return false;
    const d=distFor(l); l._dist=d;
    if(userLL()&&dMax<1000&&(d===null||d>dMax)) return false;
    if(q&&!(l.title+" "+l.city+" "+l.trim+" "+l.source+" "+l.packages.join(" ")).toLowerCase().includes(q)) return false;
    return true;
  });
  const sort=$("#sort").value;
  const st=$("#sortTop"); if(st&&st.value!==sort) st.value=sort;
  out.sort((a,b)=> sort==="price-asc"?(a.price_cad??1e12)-(b.price_cad??1e12) : sort==="price-desc"?(b.price_cad??-1)-(a.price_cad??-1) :
    sort==="km-asc"?(a.mileage_km??1e12)-(b.mileage_km??1e12) : sort==="km-desc"?(b.mileage_km??-1)-(a.mileage_km??-1) :
    sort==="year-desc"?(b.year??0)-(a.year??0) : sort==="year-asc"?(a.year??9999)-(b.year??9999) :
    sort==="newest"?String(b.first_seen||"").localeCompare(String(a.first_seen||"")) :
    (a._dist??1e9)-(b._dist??1e9));
  render(out); liveLinks();
}

function render(list){
  $("#resultCount").textContent=list.length+" listing"+(list.length===1?"":"s");
  $("#emptyState").hidden=list.length>0;
  $("#results").innerHTML=list.map(l=>`
  <article class="card">
    <div class="badges">
      ${l.packages.map(p=>`<span class="badge ${p==="FSD Included"?"fsd":""}">${p==="FSD Included"?"✓ FSD Included":p}</span>`).join("")}
      <span class="badge ${l.evidence_type==="Photo-verified"?"photo":"desc"}">${l.evidence_type}</span>
      ${l.hardware?`<span class="badge">${l.hardware}${l.hardware==="HW4"?" / AI4":""}</span>`:""}
      ${l.demo?`<span class="badge demo">Demo example</span>`:""}
    </div>
    <h3>${l.title}</h3>
    <div class="price">${fmt$(l.price_cad)} <span style="font-size:12px;color:var(--sub)">CAD</span></div>
    <div class="meta">${l.trim} · ${fmtKm(l.mileage_km)}<br>${l.city}, ${l.province}${l._dist!=null?" · ~"+l._dist+" km away":""}<br>${l.seller_type} · ${l.source}${l.first_seen?" · First seen "+l.first_seen:""}</div>
    <div class="evidence">🔎 ${l.evidence}</div>
    <a class="view" target="_blank" rel="noopener" href="${l.url}">View original listing →</a>
  </article>`).join("");
  const fsd=ALL.filter(l=>l.packages.includes("FSD Included")).length;
  $("#statsRow").innerHTML=
    `<div class="stat"><strong>${ALL.length}</strong>tracked listings</div>
     <div class="stat"><strong>${fsd}</strong>with FSD included</div>
     <div class="stat"><strong>${ALL.filter(l=>l.evidence_type==="Photo-verified").length}</strong>photo-verified</div>
     <div class="stat"><strong>${ALL.filter(l=>l.hardware==="HW4").length}</strong>HW4 / AI4</div>`;
}

async function load(){
  let data=FALLBACK;
  try{ const r=await fetch("data/fsd-listings.json",{cache:"no-store"}); if(r.ok) data=await r.json(); }catch(e){}
  if(!data.listings||!data.listings.length){
    try{ const r=await fetch("https://raw.githubusercontent.com/simarssidhu/simarssidhu.github.io/master/FSDTracker/data/fsd-listings.json"); if(r.ok) data=await r.json(); }catch(e){}
  }
  ALL=data.listings||[];
  $("#demoBanner").hidden=!ALL.some(l=>l.demo);
  $("#lastScan").textContent=data.generated_at?("Last scan: "+new Date(data.generated_at).toLocaleString("en-CA")):"Scanner has not run yet — showing preview data";
  const srcs=[...new Set(ALL.map(l=>l.source))].sort();
  $("#source").innerHTML='<option value="all">All sources</option>'+srcs.map(s=>`<option>${s}</option>`).join("");
  apply();
}
document.querySelectorAll("#filtersPanel input,#filtersPanel select").forEach(el=>el.addEventListener("input",apply));
document.querySelectorAll("#modelChips .chip").forEach(c=>c.addEventListener("click",()=>{
  document.querySelectorAll("#modelChips .chip").forEach(x=>x.classList.remove("active"));
  c.classList.add("active"); state.model=c.dataset.model; apply();
}));
const stEl=$("#sortTop"); if(stEl) stEl.addEventListener("change",()=>{ $("#sort").value=stEl.value; apply(); });
$("#resetBtn").addEventListener("click",()=>location.reload());
$("#themeBtn").addEventListener("click",()=>{
  const h=document.documentElement, next=h.dataset.theme==="dark"?"light":"dark";
  h.dataset.theme=next; $("#themeBtn").textContent=next==="dark"?"☀️":"🌙";
});
load();
