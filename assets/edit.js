
import{api,loadECharts,fillProvinces,fillCities}from"./common.js";

const q=new URLSearchParams(location.search);
const token=q.get("token");
const pin=document.querySelector("#pin");
const form=document.querySelector("#form");
const status=document.querySelector("#status");
const prov=document.querySelector("#province");
const city=document.querySelector("#city");
let activePin="",profile;

prov.onchange=()=>fillCities(prov,city).catch(e=>status.textContent=e.message);

document.querySelector("#verify").onclick=async()=>{
  try{
    if(!token)throw new Error("链接缺少 token");
    activePin=pin.value.trim();
    profile=(await api("student-profile",{action:"read",token,pin:activePin})).profile;
    await loadECharts();
    await fillProvinces(prov,profile.province_adcode);
    await fillCities(prov,city,profile.city_adcode);
    document.querySelector("#name").value=profile.public_name||"";
    document.querySelector("#school").value=profile.school||"";
    document.querySelector("#message").value=profile.message||"";
    document.querySelector("#visible").checked=!!profile.is_visible;
    form.hidden=false;
    document.querySelector("#unlock").hidden=true;
    status.textContent="";
  }catch(e){status.textContent=e.message}
};

form.onsubmit=async e=>{
  e.preventDefault();
  try{
    const po=prov.selectedOptions[0],co=city.selectedOptions[0];
    const p={
      public_name:document.querySelector("#name").value.trim(),
      school:document.querySelector("#school").value.trim(),
      province:po.dataset.name,
      province_adcode:po.value,
      city:co.dataset.name,
      city_adcode:co.value,
      lng:+co.dataset.lng,
      lat:+co.dataset.lat,
      message:document.querySelector("#message").value.trim(),
      is_visible:document.querySelector("#visible").checked
    };
    await api("student-profile",{action:"update",token,pin:activePin,profile:p});
    status.textContent="保存成功";
  }catch(e){status.textContent=e.message}
};
