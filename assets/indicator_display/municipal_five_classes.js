(function(){
'use strict';
if(window.ATLAS_INDICATOR_DISPLAY_INSTALLED)return;
window.ATLAS_INDICATOR_DISPLAY_INSTALLED=true;
const css=document.createElement('style');css.id='atlas-municipal-five-class-style';css.textContent='.map-workspace.has-result .map-legend-card.municipal-five-active{display:block}.municipal-five-active .municipal-five-class{align-items:flex-start}.municipal-five-active .dot{flex-shrink:0;margin-top:3px}.municipal-five-active small{white-space:nowrap}.municipal-five-active .municipal-five-class>span:last-child{min-width:0;overflow-wrap:anywhere;line-height:1.2}@media(max-width:760px){body.imazon-atlas .map-legend-card.municipal-five-active,body.imazon-atlas .map-workspace.has-result .map-legend-card.municipal-five-active{top:60px;bottom:auto;left:54px;right:14px;max-width:none;font-size:11px;padding:6px 8px}.map-legend-card.municipal-five-active .map-legend-items{grid-template-columns:minmax(0,1fr);gap:2px}.municipal-five-active .map-partial-key,.municipal-five-active .herd-map-note{grid-column:1/-1;max-width:none}.municipal-five-active .herd-map-note,.municipal-five-active .map-partial-key{font-size:9px;line-height:1.2;margin-top:0}.municipal-five-active .map-partial-key:before{height:9px;width:12px;top:1px}body.imazon-atlas .map-workspace.municipal-five-map-active .map-result-panel .map-mini-row{padding:3px 0}body.imazon-atlas .map-workspace.municipal-five-map-active .map-drought-value>span:first-child{font-size:11px;line-height:1.2}body.imazon-atlas .map-workspace.municipal-five-map-active .map-drought-coverage{font-size:10px;line-height:1.25;margin:3px 0}body.imazon-atlas .municipal-five-map-active #map-open-diagnosis{position:sticky;bottom:0;z-index:1}}';document.head.appendChild(css);
const colors=['#a63d40','#ad5a17','#9b7415','#3f7d55','#176348'];
const blues=[...colors].reverse();
const palette=id=>id==='1'?herd:(['2','3','5','6','opportunity'].includes(id)?blues:colors);
const herd=['#e0e3e1','#bac1bd','#909b95','#66776e','#394e43'];
const missing='#b7bdb8',patterns=new Map();let overrides={},queued=false,ready=false;
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const en=()=>/^en\b/i.test(document.documentElement.lang);
const tr=(a,b)=>en()?b:a;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=(v,d=0)=>new Intl.NumberFormat(en()?'en-US':'pt-BR',{maximumFractionDigits:d}).format(v);
function theme(){return window.ATLAS_MAP_CONFIG?.theme?.()||document.getElementById('map-theme')?.value;}
function datum(code){return typeof byCode!=='undefined'?byCode.get(String(code)):null;}
function specs(id){return typeof SPECS!=='undefined'?SPECS.find(s=>String(s.i)===String(id)):null;}
function classify(m,id){
 if(!m)return{index:null,color:missing,partial:false,score:null};
 let score,index,partial=false;
 if(id==='conditions'||id==='risk'){
  score=m['score_'+id];const n=m[id+'_observed_components'];
  index=finite(score)&&n>0?Math.max(0,Math.min(4,Math.floor(score/(id==='conditions'?40:100)))):null;
  partial=index!==null&&n<(id==='conditions'?4:5);
 }else{
  const i=id==='opportunity'?2:Number(id);score=i===1?m.context_score_informative:m['ind'+String(i).padStart(2,'0')+'_score'];
  index=finite(score)?Math.max(0,Math.min(4,Math.ceil(score/20)-1)):null;
 }
 return{index,color:index===null?missing:palette(id)[index],partial,score:finite(score)?score:null};
}
function hatch(color){
 if(!patterns.has(color)){const c=document.createElement('canvas');c.width=c.height=9;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,9,9);x.strokeStyle='#26332e88';x.lineWidth=1.3;x.beginPath();x.moveTo(-2,2);x.lineTo(2,-2);x.moveTo(0,9);x.lineTo(9,0);x.moveTo(7,11);x.lineTo(11,7);x.stroke();patterns.set(color,x.createPattern(c,'repeat'));}
 return patterns.get(color);
}
function classLabels(id){
 if(overrides[id]?.labels)return overrides[id].labels.map(v=>typeof v==='object'?(en()?v.en:v.pt):v);
 if(id==='1')return[tr('Muito pequeno','Very small'),tr('Pequeno','Small'),tr('Médio','Medium'),tr('Grande','Large'),tr('Muito grande','Very large')];
 if(id==='4')return[tr('Exposição muito alta','Very high exposure'),tr('Exposição alta','High exposure'),tr('Exposição média','Medium exposure'),tr('Exposição baixa','Low exposure'),tr('Exposição muito baixa','Very low exposure')];
 if(id==='conditions')return[tr('Muito desfavorável','Very unfavorable'),tr('Desfavorável','Unfavorable'),tr('Intermediária','Intermediate'),tr('Favorável','Favorable'),tr('Muito favorável','Very favorable')];
 if(id==='risk'||Number(id)>=7)return[tr('Muito alta','Very high'),tr('Alta','High'),tr('Média','Medium'),tr('Baixa','Low'),tr('Muito baixa','Very low')];
 return[tr('Muito baixa','Very low'),tr('Baixa','Low'),tr('Média','Medium'),tr('Alta','High'),tr('Muito alta','Very high')];
}
function rangeLabel(id,index){
 const custom=overrides[id]?.ranges?.[index];if(custom!==undefined)return typeof custom==='object'?(en()?custom.en:custom.pt):custom;
 const cfg=overrides[id]||{},unit=typeof cfg.unit==='object'?(en()?cfg.unit.en:cfg.unit.pt):(cfg.unit||'');
 if(Array.isArray(cfg.cuts)&&cfg.cuts.length===4){
  const reverse=cfg.higherIsBetter===false||(cfg.higherIsBetter===undefined&&(id==='4'||id==='risk'||Number(id)>=7));const k=reverse?4-index:index,cut=cfg.cuts,d=cfg.decimals??2;
  const low=k===0?cfg.min:cut[k-1],high=k===4?cfg.max:cut[k];
  return(low===undefined?'< '+number(high,d):high===undefined?'≥ '+number(low,d):number(low,d)+'–'+(k<4?'< ':'')+number(high,d))+(unit?' '+unit:'');
 }
 if(id==='conditions'||id==='risk'){const step=id==='conditions'?40:100;return number(index*step)+'–'+(index<4?'< ':'')+number((index+1)*step);}
 if(id==='1')return tr('Classe de tamanho ','Size class ')+(index+1);
 if(id==='3'||id==='4')return(index?'>'+number(index*20):'0')+'–'+number((index+1)*20)+tr(' pontos',' points');
 return tr('Nota ','Score ')+number((index+1)*20);
}
function title(id){const cfg=overrides[id];if(cfg?.title)return typeof cfg.title==='object'?(en()?cfg.title.en:cfg.title.pt):cfg.title;
 return id==='opportunity'?tr('Oportunidade de melhoria','Improvement opportunity'):id==='conditions'?tr('Condições (pontos)','Conditions (points)'):id==='risk'?tr('Pressão ambiental (pontos)','Environmental pressure (points)'):id==='1'?tr('Rebanho bovino · cinco classes de tamanho','Cattle herd · five size classes'):id==='4'?tr('Seca municipal (nota)','Municipal drought (score)'):(en()?specs(id)?.en:specs(id)?.pt)||'';
}
function unavailable(id){return id==='previsia2026'||(id==='4'&&window.ATLAS_FAO_RASTER_ACTIVE);}
function tooltipHover(e){if(unavailable(theme()))return;const m=datum(e.target.feature?.properties?.code);if(m)tooltip(e.target,m,theme());}
function tooltip(layer,m,id){const cfg=overrides[id]||{},fields=cfg.fields||(cfg.valueField?[{field:cfg.valueField,unit:cfg.unit,decimals:cfg.decimals}]:null);
 if(!fields){if(layer._atlasIndicatorTooltipModified&&layer.getTooltip?.()){layer.setTooltipContent(layer._atlasIndicatorOriginalTooltip);layer._atlasIndicatorTooltipModified=false;}return;}
 if(!layer._atlasIndicatorTooltipHooked){layer.on('mouseover',tooltipHover);layer._atlasIndicatorTooltipHooked=true;}
 if(!layer.getTooltip?.())return;
 if(!layer._atlasIndicatorTooltipModified)layer._atlasIndicatorOriginalTooltip=layer.getTooltip()._content;
 layer._atlasIndicatorTooltipModified=true;
 layer.setTooltipContent(function(){
 const labels={2:['da pastagem municipal com vigor baixo ou médio','of municipal pasture with low or medium vigor','de pasto com vigor baixo ou médio','of low- or medium-vigor pasture','2025'],opportunity:['da pastagem municipal com vigor baixo ou médio','of municipal pasture with low or medium vigor','de pasto com vigor baixo ou médio','of low- or medium-vigor pasture','2025'],3:['do pasto com distância calculada dentro do limite regional até frigoríficos','of pasture with calculated distances within the regional slaughterhouse threshold','de pasto dentro desse limite','of pasture within that threshold','2025'],7:['da vegetação nativa de 2022 perdida por ano, fora de TI e UCs de proteção integral','of 2022 native vegetation lost per year, outside Indigenous lands and strictly protected areas','de vegetação nativa perdida por ano','of native vegetation lost per year','2023–2025'],8:['da vegetação suprimida convertida em pasto no recorte analisado','of cleared vegetation converted to pasture in the analyzed area','de vegetação convertida em pasto','of vegetation converted to pasture','2022–2025'],9:['da floresta pública não destinada mapeada convertida','of mapped undesignated public forest converted','convertidos em floresta pública não destinada','converted within undesignated public forest','2022–2025'],11:['da área municipal, pela soma administrativa dos embargos','of municipal area, using administrative embargo totals','registrados nos embargos; pode haver sobreposição','recorded under embargo; overlaps may occur','21/10/2026']};
 const context=labels[id];return '<strong>'+esc(m.nome+' · '+m.uf)+'</strong><br>'+fields.map(f=>{const unit=typeof f.unit==='object'?(en()?f.unit.en:f.unit.pt):(f.unit||'');const label=typeof f.label==='object'?(en()?f.label.en:f.label.pt):(f.label||'');if(!finite(m[f.field]))return esc(label||title(id))+': '+tr('Sem dado','No data');const description=context?(unit.includes('%')?tr(context[0],context[1]):unit==='ha'?tr(context[2],context[3]):label):label;return esc(number(m[f.field],unit==='ha'?0:Math.min(f.decimals??1,1))+' '+unit+(description?' '+description:''));}).join('<br>')+(context?'<br><small>'+esc(context[4])+'</small>':'');
 });
}

function restorePanel(){const p=document.getElementById('map-result-panel');if(p?._atlasFiveFit){p.style.maxHeight=p._atlasFiveFit.maxHeight;p.style.overflowY=p._atlasFiveFit.overflowY;p._atlasFiveFit=null;}}
function fitPanels(){restorePanel();if(innerWidth>760)return;const l=document.querySelector('.map-legend-card'),p=document.getElementById('map-result-panel');if(!l||!p||p.hidden||!l.getClientRects().length)return;const a=l.getBoundingClientRect(),b=p.getBoundingClientRect();if(a.bottom+12>b.top){const available=b.bottom-a.bottom-12;if(available>0){p._atlasFiveFit={maxHeight:p.style.maxHeight,overflowY:p.style.overflowY};p.style.maxHeight=available+'px';p.style.overflowY='auto';}}}
function syncResult(){const box=document.getElementById('map-result-values');if(!box)return;const rows=[...box.querySelectorAll('.map-mini-row')].slice(-3);['opportunity','conditions','risk'].forEach((id,i)=>{const dot=rows[i]?.querySelector('.dot'),m=datum(window.ATLAS_SELECTED_CODE||window.ATLAS_MAP_SELECTED_CODE);if(dot&&m)dot.style.background=classify(m,id).color;});}
function apply(){
 queued=false;if(!ready)return;const id=theme();if(unavailable(id)){restorePanel();window.ATLAS_ENTRY_MAP.eachLayer(l=>{if(l._atlasIndicatorTooltipModified&&l.getTooltip?.()){l.setTooltipContent(l._atlasIndicatorOriginalTooltip);l._atlasIndicatorTooltipModified=false;}});document.querySelector('.map-legend-card')?.classList.remove('municipal-five-active');document.getElementById('map-workspace')?.classList.remove('municipal-five-map-active');window.ATLAS_INDICATOR_DISPLAY_ACTIVE=false;return;}
 document.getElementById('map-workspace')?.classList.add('municipal-five-map-active');
 const state=document.getElementById('map-state')?.value||'',counts=[0,0,0,0,0];let absent=0,partialCount=0,paths=0;
 window.ATLAS_ENTRY_MAP.eachLayer(layer=>{
  const code=layer.feature?.properties?.code,m=datum(code),type=layer.feature?.geometry?.type;if(!m||!layer.setStyle||!['Polygon','MultiPolygon'].includes(type))return;
  const c=classify(m,id),included=!state||m.uf===state;
  layer.setStyle({fillColor:c.partial?hatch(c.color):c.color,fillOpacity:included?.65:0});
  tooltip(layer,m,id);layer._atlasIndicatorClass=c.index;layer._atlasIndicatorBaseColor=c.color;layer._atlasIndicatorPartial=c.partial;paths++;
  if(included){if(c.index===null)absent++;else counts[c.index]++;if(c.partial)partialCount++;}
 });
 const target=document.getElementById('map-legend-items'),heading=document.getElementById('map-legend-title');
 if(target&&heading){target.closest('.map-legend-card')?.classList.add('municipal-five-active');heading.textContent=title(id);const labels=classLabels(id),legendPalette=palette(id);
  target.innerHTML=labels.map((label,i)=>'<span class="herd-map-range municipal-five-class" data-class="'+i+'" data-color="'+legendPalette[i]+'" data-count="'+counts[i]+'"><span class="dot" style="background:'+legendPalette[i]+'"></span><span>'+esc(label)+' <small>('+number(counts[i])+')</small></span></span>').join('')+'<span class="herd-map-range municipal-missing-key" data-count="'+absent+'"><span class="dot" style="background:'+missing+'"></span>'+tr('Sem nota calculável','No calculable score')+' ('+number(absent)+')</span>'+(id==='conditions'||id==='risk'?'<span class="map-partial-key">'+tr('Hachura = dados parciais; (n) = municípios.','Hatching = partial data; (n) = municipalities.')+'</span>':'<span class="herd-map-note">'+tr('(n) = municípios no recorte.','(n) = municipalities in scope.')+'</span>');
  const meaning=document.createElement('span');meaning.className='herd-map-note';meaning.textContent=id==='1'?tr('Cinza mais escuro = rebanho maior.','Darker grey = larger herd.'):id==='conditions'||id==='risk'?tr('Verde = mais favorável; vermelho = mais desfavorável.','Green = more favorable; red = less favorable.'):tr('Verde = menor valor; vermelho = maior valor. Cor indica quantidade, não qualidade.','Green = lower value; red = higher value. Color indicates amount, not quality.');target.append(meaning);
  const detail=document.createElement('details');detail.className='map-class-limits';detail.innerHTML='<summary>'+tr('Limites das classes','Class boundaries')+'</summary>'+labels.map((name,i)=>'<p>'+esc(name)+' · '+esc(rangeLabel(id,i))+'</p>').join('');target.append(detail);
 }
 syncResult();fitPanels();window.ATLAS_INDICATOR_DISPLAY_ACTIVE=true;window.ATLAS_INDICATOR_DISPLAY_STATE={theme:id,state,counts,missing:absent,partial:partialCount,municipal_paths:paths,colors:palette(id).slice()};
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(apply);}}
window.ATLAS_INDICATOR_DISPLAY_SET_CONFIG=function(config){const metrics=config?.metrics||config||{};for(const[id,v]of Object.entries(metrics)){if(v.cuts&&(!Array.isArray(v.cuts)||v.cuts.length!==4||!v.cuts.every(finite)||v.cuts.some((x,i)=>i&&x<v.cuts[i-1])))throw new Error('Four ordered finite display cuts are required');if(v.labels&&v.labels.length!==5)throw new Error('Five display labels are required');overrides[id]={...overrides[id],...v};}schedule();};
window.ATLAS_INDICATOR_DISPLAY_CLASSIFY=(code,id=theme())=>classify(datum(code),String(id));
window.ATLAS_INDICATOR_DISPLAY_SET_FAO_VIEW=function(mode){if(!['municipal','gs1','gs2'].includes(mode))throw new Error('Unknown FAO view');const control=document.getElementById('fao-season-view');if(!control)return false;control.value=mode;control.dispatchEvent(new Event('change',{bubbles:true}));return true;};
function init(){
 if(!window.ATLAS_ENTRY_MAP_READY||!window.ATLAS_MAP_CONFIG||typeof byCode==='undefined'){setTimeout(init,100);return;}ready=true;
 for(const key of ['restyle','raster','colors']){const original=window.ATLAS_MAP_CONFIG[key];if(typeof original==='function')window.ATLAS_MAP_CONFIG[key]=function(...args){const result=original.apply(this,args);schedule();return result;};}
 document.getElementById('map-theme')?.addEventListener('change',schedule);document.getElementById('map-state')?.addEventListener('change',schedule);document.getElementById('map-reset')?.addEventListener('click',schedule);document.addEventListener('atlas-theme-changed',schedule);window.addEventListener('resize',schedule);
 new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 const legend=document.getElementById('map-legend-items');if(legend)new MutationObserver(()=>{if(!unavailable(theme())&&!legend.querySelector('.municipal-five-class'))schedule();}).observe(legend,{childList:true});
 window.ATLAS_ENTRY_MAP.on('layeradd',e=>{if(e.layer.feature?.properties?.code)schedule();});
 const result=document.getElementById('map-result-values');if(result)new MutationObserver(schedule).observe(result,{childList:true});
 window.ATLAS_INDICATOR_DISPLAY_READY=true;apply();
}
init();
})();
