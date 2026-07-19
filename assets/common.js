
import{CONFIG}from"./config.js";

export async function api(name,body){
  const r=await fetch(`${CONFIG.SUPABASE_URL}/functions/v1/${name}`,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify(body)
  });
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||"请求失败");
  return d;
}

export async function loadECharts(){
  if(window.echarts)return window.echarts;
  await new Promise((resolve,reject)=>{
    const s=document.createElement("script");
    s.src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js";
    s.onload=resolve;
    s.onerror=()=>reject(new Error("ECharts 加载失败"));
    document.head.appendChild(s);
  });
  return window.echarts;
}

async function loadRegion(adcode){
  const r=await fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`);
  if(!r.ok)throw new Error("行政区数据加载失败");
  return r.json();
}

export async function fillProvinces(sel,target=""){
  const data=await loadRegion("100000");
  sel.innerHTML='<option value="">请选择省份</option>';
  for(const f of data.features||[]){
    const p=f.properties||{};
    const center=p.center||p.centroid||[];
    const o=new Option(p.name,p.adcode);
    o.dataset.name=p.name||"";
    o.dataset.lng=center[0]??"";
    o.dataset.lat=center[1]??"";
    sel.add(o);
  }
  if(target)sel.value=target;
}

export async function fillCities(prov,city,target=""){
  city.innerHTML='<option value="">请选择城市</option>';
  const selected=prov.selectedOptions[0];
  if(!selected?.value)return;
  const data=await loadRegion(selected.value);
  for(const f of data.features||[]){
    const p=f.properties||{};
    const center=p.center||p.centroid||[];
    const o=new Option(p.name,p.adcode);
    o.dataset.name=p.name||"";
    o.dataset.lng=center[0]??"";
    o.dataset.lat=center[1]??"";
    city.add(o);
  }
  if(target)city.value=target;
}

export const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));
