
import{api,loadECharts,esc}from"./common.js";

let all=[],chart;
const list=document.querySelector("#list");
const search=document.querySelector("#search");
const stats=document.querySelector("#stats");

function render(rows){
  list.innerHTML=rows.length
    ?rows.map(x=>`<div class="card">
      <b>${esc(x.public_name)}</b>
      <small>${esc(x.school||"未填写学校")} · ${esc(x.province)}${esc(x.city)}</small>
      <small>${esc(x.message||"欢迎来蹭饭！")}</small>
    </div>`).join("")
    :"<p>暂无公开资料</p>";
  stats.textContent=`${rows.length} 位同学 · ${new Set(rows.map(x=>x.city)).size} 个城市`;
}

function draw(rows){
  chart.setOption({
    tooltip:{
      trigger:"item",
      formatter:p=>p.data
        ?`<b>${esc(p.data.name)}</b><br>${esc(p.data.school||"")}<br>${esc(p.data.province||"")}${esc(p.data.city||"")}<br>${esc(p.data.message||"")}`
        :""
    },
    geo:{
      map:"china",
      roam:true,
      zoom:1.15,
      itemStyle:{areaColor:"#f6dfbd",borderColor:"#b78968"},
      emphasis:{itemStyle:{areaColor:"#f3c78b"}}
    },
    series:[{
      type:"scatter",
      coordinateSystem:"geo",
      symbolSize:17,
      data:rows
        .filter(x=>Number.isFinite(x.lng)&&Number.isFinite(x.lat))
        .map(x=>({
          name:x.public_name,
          value:[x.lng,x.lat],
          school:x.school,
          province:x.province,
          city:x.city,
          message:x.message
        }))
    }]
  },true);
}

function applyFilter(){
  const k=search.value.trim().toLowerCase();
  const rows=all.filter(x=>
    `${x.public_name} ${x.school} ${x.province} ${x.city}`.toLowerCase().includes(k)
  );
  render(rows);
  draw(rows);
}

(async()=>{
  const echarts=await loadECharts();
  const r=await fetch("https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json");
  if(!r.ok)throw new Error("中国地图数据加载失败");
  echarts.registerMap("china",await r.json());

  chart=echarts.init(document.querySelector("#map"));
  addEventListener("resize",()=>chart.resize());

  all=(await api("public-profiles",{action:"list"})).profiles||[];
  render(all);
  draw(all);
  search.oninput=applyFilter;
})().catch(e=>{
  document.querySelector("#map").innerHTML=`<p style="padding:20px">${esc(e.message)}</p>`;
});
