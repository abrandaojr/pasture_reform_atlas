function labSource(s){return lang==='pt'?s.source:({'IBGE PPM':'IBGE Municipal Livestock Survey','Censo Agropecuário IBGE':'IBGE Agricultural Census','Distâncias de pastagem e frigoríficos':'Pasture-to-slaughterhouse distances','MapBiomas e OPGT':'MapBiomas and OPGT'}[s.source]||s.source);}
function labYear(s){return lang==='en'&&s.year==='21/10/2026'?'21 October 2026':s.year;}
const LAB_REFERENCES = {"opportunity_green_min_ha": 95429.88, "assistance_green_min_pct": 28.962189428, "education_green_min_pct": 23.66412213740458, "native_loss_green_max_pct": 0.6003532029945828, "conversion_green_area_max": 101.25, "conversion_green_ratio_max": 28.86588971995129, "public_forest_green_area_max": 47.14200000000001, "public_forest_green_ratio_max": 0.6202850174142708, "embargo_count_green_max": 75, "embargo_area_green_max": 19.92406230233898, "herd_max": 2730818.0, "opportunity_orange_min_ha": 20177.19, "assistance_red_max_pct": 6.473189607600001, "education_red_max_pct": 11.041629444345183, "native_loss_red_min_pct": 1.7399594521564772, "conversion_red_area_min": 1652.6699999999998, "conversion_red_ratio_min": 68.03837459729812, "public_forest_red_area_min": 388.0980000000001, "public_forest_red_ratio_min": 2.094549939619841, "embargo_count_red_min": 996, "embargo_area_red_min": 525.2554145387606};
const LAB_BANDS = {"red": "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns=\"http://www.w3.org/2000/svg\" width=\"164.454803pt\" height=\"11.383937pt\" viewBox=\"0 0 164.454803 11.383937\" version=\"1.1\" preserveAspectRatio=\"none\" aria-hidden=\"true\">\n <defs>\n  <style type=\"text/css\">*{stroke-linejoin: round; stroke-linecap: butt}</style>\n </defs>\n <g id=\"figure_1\">\n  <g id=\"patch_1\">\n   <path d=\"M 0 11.383937  L 164.454803 11.383937  L 164.454803 0  L 0 0  z \" style=\"fill: #ffffff\"/>\n  </g>\n  <g id=\"axes_1\">\n   <g id=\"patch_2\">\n    <path d=\"M 1.44 9.943937  L 163.014803 9.943937  L 163.014803 1.44  L 1.44 1.44  z \" clip-path=\"url(#p87b9712b09)\" style=\"fill: #b91c1c\"/>\n   </g>\n  </g>\n </g>\n <defs>\n  <clipPath id=\"p87b9712b09\">\n   <rect x=\"1.44\" y=\"1.44\" width=\"161.574803\" height=\"8.503937\"/>\n  </clipPath>\n </defs>\n</svg>", "orange": "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns=\"http://www.w3.org/2000/svg\" width=\"164.454803pt\" height=\"11.383937pt\" viewBox=\"0 0 164.454803 11.383937\" version=\"1.1\" preserveAspectRatio=\"none\" aria-hidden=\"true\">\n <defs>\n  <style type=\"text/css\">*{stroke-linejoin: round; stroke-linecap: butt}</style>\n </defs>\n <g id=\"figure_1\">\n  <g id=\"patch_1\">\n   <path d=\"M 0 11.383937  L 164.454803 11.383937  L 164.454803 0  L 0 0  z \" style=\"fill: #ffffff\"/>\n  </g>\n  <g id=\"axes_1\">\n   <g id=\"patch_2\">\n    <path d=\"M 1.44 9.943937  L 163.014803 9.943937  L 163.014803 1.44  L 1.44 1.44  z \" clip-path=\"url(#p87b9712b09)\" style=\"fill: #b45309\"/>\n   </g>\n  </g>\n </g>\n <defs>\n  <clipPath id=\"p87b9712b09\">\n   <rect x=\"1.44\" y=\"1.44\" width=\"161.574803\" height=\"8.503937\"/>\n  </clipPath>\n </defs>\n</svg>", "green": "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns=\"http://www.w3.org/2000/svg\" width=\"164.454803pt\" height=\"11.383937pt\" viewBox=\"0 0 164.454803 11.383937\" version=\"1.1\" preserveAspectRatio=\"none\" aria-hidden=\"true\">\n <defs>\n  <style type=\"text/css\">*{stroke-linejoin: round; stroke-linecap: butt}</style>\n </defs>\n <g id=\"figure_1\">\n  <g id=\"patch_1\">\n   <path d=\"M 0 11.383937  L 164.454803 11.383937  L 164.454803 0  L 0 0  z \" style=\"fill: #ffffff\"/>\n  </g>\n  <g id=\"axes_1\">\n   <g id=\"patch_2\">\n    <path d=\"M 1.44 9.943937  L 163.014803 9.943937  L 163.014803 1.44  L 1.44 1.44  z \" clip-path=\"url(#p87b9712b09)\" style=\"fill: #15803d\"/>\n   </g>\n  </g>\n </g>\n <defs>\n  <clipPath id=\"p87b9712b09\">\n   <rect x=\"1.44\" y=\"1.44\" width=\"161.574803\" height=\"8.503937\"/>\n  </clipPath>\n </defs>\n</svg>", "neutral": "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns=\"http://www.w3.org/2000/svg\" width=\"164.454803pt\" height=\"11.383937pt\" viewBox=\"0 0 164.454803 11.383937\" version=\"1.1\" preserveAspectRatio=\"none\" aria-hidden=\"true\">\n <defs>\n  <style type=\"text/css\">*{stroke-linejoin: round; stroke-linecap: butt}</style>\n </defs>\n <g id=\"figure_1\">\n  <g id=\"patch_1\">\n   <path d=\"M 0 11.383937  L 164.454803 11.383937  L 164.454803 0  L 0 0  z \" style=\"fill: #ffffff\"/>\n  </g>\n  <g id=\"axes_1\">\n   <g id=\"patch_2\">\n    <path d=\"M 1.44 9.943937  L 163.014803 9.943937  L 163.014803 1.44  L 1.44 1.44  z \" clip-path=\"url(#p87b9712b09)\" style=\"fill: #dddddd\"/>\n   </g>\n  </g>\n </g>\n <defs>\n  <clipPath id=\"p87b9712b09\">\n   <rect x=\"1.44\" y=\"1.44\" width=\"161.574803\" height=\"8.503937\"/>\n  </clipPath>\n </defs>\n</svg>"};
T.pt.step1='1. Diagnóstico do município';
T.en.step1='1. Municipal diagnosis';
T.pt.indicatorsHeading='Diagnóstico por indicador';
T.en.indicatorsHeading='Diagnosis by indicator';
T.pt.methodColors='O número é o valor observado no município. As faixas usam os limites de comparação do Atlas, na mesma unidade do indicador. Verde, laranja e vermelho correspondem às classes comparativas; cinza indica contexto ou ausência de nota. A nota de 0 a 100 e os critérios aparecem no balão de informação. A escala linear se ajusta ao resultado e aos limites, sem mudar os valores.';
T.en.methodColors='Bands use Atlas limits in the unit beside the indicator name. The number above the pointer is the municipal result. Green, orange and red show comparative classes; gray indicates context or no score. The 0–100 score and criteria are available in the information popup. The linear scale adjusts to the result and limits without changing values.';
for(const key of ['step1','indicatorsHeading','methodColors']){const node=document.querySelector('[data-i18n="'+key+'"]');if(node)node.textContent=T[lang][key];}
function labNumber(v, decimals=2) { return numeric(v) ? fmt(v, decimals) : tr('Sem dado', 'No data'); }
function labMeasure(m,s) {
  if (s.i===7) return {value:numeric(m.supressao_media_ha_ano)&&numeric(m.native_stock_start_ha)&&m.native_stock_start_ha>0 ? 100*m.supressao_media_ha_ano/m.native_stock_start_ha : null, unit:tr('%/ano','%/year'), decimals:3};
  const withheld=(s.i===8||s.i===9)&&!numeric(score(m,s.i));
  return {value:withheld?null:m[s.field],unit:lang==='pt'?s.unit:(s.eunit||s.unit),decimals:s.i===1||s.i===10?0:2};
}
function labReference(m,s) {
  const r=LAB_REFERENCES;
  if(s.i===1) return tr('Contexto, sem faixa ambiental favorável. A escala compara o número de bovinos dos municípios.','Context only, with no environmentally favorable range. The scale compares municipal herd sizes.');
  if(s.i===2) return tr('Faixa verde na comparação entre municípios: a partir de ','Green range in the municipal comparison: from ')+labNumber(r.opportunity_green_min_ha,0)+tr(' ha de baixo e médio vigor. São as classes Alta e Muito alta.',' ha of low- and medium-vigor pasture. These are the High and Very high classes.');
  if(s.i===3) return tr('Faixa verde da escala: 80% a 100% da pastagem dentro da distância regional. Essa faixa é visual, sem alterar a nota.','Green range on the scale: 80% to 100% of pasture within the regional distance. This display range does not change the score.');
  if(s.i===4) return tr('Faixa verde da escala: frequência de seca de 0% a 20%, equivalente a notas de 80 a 100.','Green range on the scale: drought frequency from 0% to 20%, equivalent to scores from 80 to 100.');
  if(s.i===5||s.i===6) return tr('Faixa verde na comparação nacional: a partir de aproximadamente ','Green range in the national comparison: from approximately ')+labNumber(r[s.i===5?'assistance_green_min_pct':'education_green_min_pct'])+tr('%. Corresponde às classes Alta e Muito alta de 2017.','%. This corresponds to the High and Very high classes for 2017.');
  if(s.i===7) return tr('Faixa verde da taxa anual: abaixo de aproximadamente ','Green annual-rate range: below approximately ')+labNumber(r.native_loss_green_max_pct,3)+tr('%. São as classes de pressão baixa e muito baixa.','%. These are the low and very low pressure classes.');
  if(s.i===8||s.i===9) {
    const area=s.i===8?r.conversion_green_area_max:r.public_forest_green_area_max;
    const ratio=s.i===8?r.conversion_green_ratio_max:r.public_forest_green_ratio_max;
    return tr('Faixa verde exige as duas condições: área abaixo de aproximadamente ','The green range requires both conditions: area below approximately ')+labNumber(area)+tr(' ha e percentual abaixo de aproximadamente ',' ha and a percentage below approximately ')+labNumber(ratio)+'%.';
  }
  if(s.i===10) return tr('Faixa verde na comparação entre municípios: de 0 a ','Green range in the municipal comparison: from 0 to ')+labNumber(r.embargo_count_green_max,0)+tr(' termos identificados. A regra compara a concentração dos termos no país. A faixa verde não comprova ausência de infrações.',' identified terms. The rule uses the national cumulative distribution; it does not establish absence of violations.');
  return tr('Faixa verde de área administrativa: abaixo de aproximadamente ','Green administrative-area range: below approximately ')+labNumber(r.embargo_area_green_max)+tr(' ha. Essa faixa não certifica a regularidade de um imóvel.',' ha. This range does not certify a property’s legal status.');
}
function labInterpretation(m,s) {
  const v=score(m,s.i);
  if(s.i!==1&&!numeric(v)) {
    if(s.i===3&&m.distance_reference_self_only) return tr('A referência regional usa somente este município. O Atlas mantém a observação, mas não atribui uma nota comparável.','The regional reference uses only this municipality. The observation is retained without assigning a comparable score.');
    if(s.i===8&&m.ind08_score_withheld_reason==='no_mapped_pasture') return m.total_pastagem_ha===0 ? tr('MapBiomas registrou 0 ha de pastagem em 2025. O indicador de conversão fica sem nota.','MapBiomas recorded 0 ha of pasture in 2025. The conversion indicator has no score.') : tr('Não há pastagem na área usada para avaliar este indicador, que exclui o Pampa. A área municipal continua disponível nos dados.','There is no pasture in the scored scope, which excludes Pampa. Municipal area remains available in the data.');
    return indicatorExtra(m,s)||tr('A fonte não fornece o valor necessário para calcular a nota deste indicador.','The source does not provide the value needed to calculate this indicator’s score.');
  }
  if(s.i===1) return labNumber(m.rebanho_bovino_cab,0)+tr(' bovinos registrados em 2025. A classe informa a escala do rebanho e fica fora das notas de condições e de risco.',' cattle recorded in 2025. Herd size is context and is excluded from conditions and risk scores.');
  if(s.i===2) return labNumber(m.participacao_baixo_medio_pct,1)+tr('% da pastagem municipal tem baixo ou médio vigor. A classe considera a área em hectares na distribuição nacional.','% of municipal pasture has low or medium vigor. The class uses hectares in the national distribution.');
  if(s.i===3) return labNumber(m.market_within_reference_pct,1)+tr('% da pastagem está a até ','% of pasture is within ')+labNumber(m.distance_meso_p50_km,1)+tr(' km, em linha reta, do frigorífico mais próximo. Metade da área de pastagem da mesorregião está até essa distância de um frigorífico.',' km, in a straight line, of the nearest slaughterhouse. Half of the mesoregion’s pasture area is within that distance of a slaughterhouse.');
  if(s.i===4) return tr('A fonte FAO registra frequência histórica média de ','FAO records a mean historical frequency of ')+labNumber(m.seca_freq_pct,1)+tr('%. A nota é 100 menos essa frequência. Há pixels válidos em ','%. The score is 100 minus this frequency. Valid pixels cover ')+labNumber(m.seca_cobertura_valida_pct,1)+tr('% da área municipal.','% of municipal area.');
  if(s.i===5) return tr('Em 2017, ','In 2017, ')+labNumber(m.assistencia_tecnica_pct,1)+tr(' de cada 100 estabelecimentos rurais receberam assistência técnica. As faixas comparam municípios com dados do mesmo Censo.',' of every 100 establishments received technical assistance. The ranges compare municipalities in the same Census.');
  if(s.i===6) return tr('Em 2017, ','In 2017, ')+labNumber(m.escolaridade_medio_pct,1)+tr(' de cada 100 estabelecimentos dirigidos pelo produtor tinham dirigentes nas categorias de ensino médio completo ou superior usadas pelo indicador.',' of every 100 producer-managed establishments had managers in the completed secondary or higher education categories used by this indicator.');
  if(s.i===7) return tr('A perda média foi de ','Mean loss was ')+labNumber(m.supressao_media_ha_ano,0)+tr(' ha por ano, sobre ',' ha per year, relative to ')+labNumber(m.native_stock_start_ha,0)+tr(' ha de vegetação nativa em 2022. A classificação usa a taxa percentual, não os hectares isolados.',' ha of native vegetation in 2022. Classification uses the percentage rate, rather than hectares alone.');
  if(s.i===8||s.i===9) {
    const a=m['ind0'+s.i+'_area_score'],p=m['ind0'+s.i+'_ratio_score'];
    const percentage=s.i===8?m.ind08_scored_ratio_pct:m.pressao_floresta_publica_pct;
    return labNumber(percentage)+tr(s.i===8?'% da supressão na área avaliada virou pastagem. ':'% da área de floresta pública mapeada foi convertido. ',s.i===8?'% of suppression in the scored scope became pasture. ':'% of the public-forest footprint was converted. ')+tr('A área recebeu nota ','Area received a score of ')+labNumber(a,0)+tr(' e o percentual, ',' and the percentage ')+labNumber(p,0)+tr('. A menor das duas define a nota final: ','. The lower of the two determines the final score: ')+labNumber(v,0)+'/100.';
  }
  if(s.i===10) return labNumber(m.embargos_numero,0)+tr(' identificadores de termos foram contados uma vez por município. Os ',' term identifiers were counted once per municipality. The ')+labNumber(m.embargo_unidentified_terms,0)+tr(' registros sem identificador não entram nessa contagem.',' records without an identifier are excluded from that count.');
  const ratio=numeric(m.embargo_pct_pastagem)?tr('A razão entre esta área e a pastagem municipal é ','The ratio of this area to municipal pasture is ')+labNumber(m.embargo_pct_pastagem)+tr('%. Essa razão não mede a interseção dos embargos com pastagens. ','%. This ratio does not measure the intersection of embargoes with pasture. '):tr('A área de pastagem é zero ou está ausente; a razão entre áreas não pode ser calculada. ','Pasture area is zero or missing, so the area ratio cannot be calculated. ');
  return ratio+labNumber(m.ind11_terms_without_area,0)+tr(' termos continuam sem área utilizável. A área informada combina polígonos identificados e hectares declarados; parte das sobreposições permanece desconhecida.',' terms still lack usable area. The reported area combines identified polygons and declared hectares; some overlap remains unknown.');
}
function labComponents(m,s) {
  if(s.i!==8&&s.i!==9) return '';
  if(!numeric(score(m,s.i))) return '';
  const percent=s.i===8?m.ind08_scored_ratio_pct:m.pressao_floresta_publica_pct;
  return '<span class="lab-secondary-value">'+labNumber(percent)+'% '+tr(s.i===8?'da supressão':'do recorte público',s.i===8?'of suppression':'of the public footprint')+'</span>';
}
function labBounds(m,s,part='main') {
  const r=LAB_REFERENCES;
  if(s.i===1)return{low:0,high:r.herd_max,up:true,neutral:true};
  if(s.i===2)return{low:r.opportunity_orange_min_ha,high:r.opportunity_green_min_ha,up:true};
  if(s.i===3)return{low:40,high:80,up:true,percent:true};
  if(s.i===4)return{low:20,high:60,up:false,percent:true};
  if(s.i===5)return{low:r.assistance_red_max_pct,high:r.assistance_green_min_pct,up:true,percent:true};
  if(s.i===6)return{low:r.education_red_max_pct,high:r.education_green_min_pct,up:true,percent:true};
  if(s.i===7)return{low:r.native_loss_green_max_pct,high:r.native_loss_red_min_pct,up:false};
  if(s.i===8)return part==='ratio'?{low:r.conversion_green_ratio_max,high:r.conversion_red_ratio_min,up:false}:{low:r.conversion_green_area_max,high:r.conversion_red_area_min,up:false};
  if(s.i===9)return part==='ratio'?{low:r.public_forest_green_ratio_max,high:r.public_forest_red_ratio_min,up:false}:{low:r.public_forest_green_area_max,high:r.public_forest_red_area_min,up:false};
  if(s.i===10)return{low:r.embargo_count_green_max,high:r.embargo_count_red_min,up:false};
  return{low:r.embargo_area_green_max,high:r.embargo_area_red_min,up:false};
}
function labRows(m,s) {
  const main=labMeasure(m,s);
  if(s.i!==8&&s.i!==9)return[{...main,part:'main',label:''}];
  return[{...main,part:'main',label:tr('Área convertida','Converted area')},{value:numeric(score(m,s.i))?(s.i===8?m.ind08_scored_ratio_pct:m.pressao_floresta_publica_pct):null,unit:'%',decimals:2,part:'ratio',label:tr(s.i===8?'Percentual da vegetação perdida':'Percentual da floresta pública mapeada',s.i===8?'Share of native vegetation lost':'Share of mapped public forest')}];
}
function rawResultScale(m,s,row) {
  const b=labBounds(m,s,row.part),valid=numeric(row.value)&&numeric(s.i===1?m.context_score_informative:score(m,s.i));
  const max=Math.max(b.high*1.25,numeric(row.value)?row.value*1.1:0,1);
  const domain=b.percent?Math.max(Math.min(max,100),numeric(row.value)?row.value:0):max;
  const x=v=>Math.max(0,Math.min(100,100*v/domain));
  const left=x(b.low),right=x(b.high),position=valid?x(row.value):0;
  const colors=b.neutral||!valid?['neutral','neutral','neutral']:b.up?['red','orange','green']:['green','orange','red'];
  const zones=[left,right-left,100-right].map((w,i)=>'<span class="raw-zone" data-tone="'+colors[i]+'" style="width:'+w+'%">'+LAB_BANDS[colors[i]]+'</span>').join('');
  const unit=row.unit, title=row.label|| (lang==='pt'?s.pt:s.en);
  const label=labNumber(row.value,row.decimals);
  return '<div class="raw-result" data-raw-scale="'+s.i+'-'+row.part+'" data-value="'+(numeric(row.value)?row.value:'')+'" data-min="0" data-max="'+domain+'" data-low="'+b.low+'" data-high="'+b.high+'" aria-label="'+esc(title+': '+(valid?label+' '+unit:tr('Sem comparação','No comparison')))+'">'
    +(row.label?'<p class="raw-subtitle">'+esc(row.label)+' <span>'+esc(unit)+'</span></p>':'')
    +'<div class="raw-value-space">'+(valid?'<button type="button" class="raw-value" data-lab-info="'+s.i+'" style="left:'+position+'%" aria-label="'+esc(tr('Explicar resultado: ','Explain result: ')+label+' '+unit)+'">'+esc(label)+'</button>':'<span class="raw-missing">'+(numeric(row.value)?labNumber(row.value,row.decimals)+' '+esc(unit)+' · ':'')+tr('Sem classificação comparável','No comparable classification')+'</span>')+'</div>'
    +'<div class="raw-track">'+zones+(valid?'<span class="raw-pointer" style="left:'+position+'%" aria-hidden="true"></span>':'')+'</div>'
    +'<div class="raw-limits"><span data-at="'+left+'" style="left:'+left+'%">'+labNumber(b.low,s.i===7?3:2)+'</span><span data-at="'+right+'" style="left:'+right+'%">'+labNumber(b.high,s.i===7?3:2)+'</span></div></div>';
}
function indicatorCard(m,s) {
  const st=indicatorStatus(m,s),rows=labRows(m,s);
  const title=s.i===7?tr('Perda anual de vegetação nativa','Annual native-vegetation loss'):(lang==='pt'?s.pt:s.en);
  return '<article class="indicator lab-result" id="indicator-'+s.i+'" data-indicator="'+s.i+'" data-status="'+st.color+'">'
    +'<header class="lab-heading"><h3 class="indicator-name">'+esc(title)+' <span class="raw-unit">'+esc(rows.length===1?rows[0].unit:'')+'</span></h3><button type="button" class="lab-info" data-lab-info="'+s.i+'" aria-label="'+esc(tr('Explicar ','Explain ')+title)+'" aria-expanded="false">i</button></header>'
    +'<div class="lab-date">'+esc(labYear(s))+'</div>'
    +rows.map(row=>rawResultScale(m,s,row)).join('')+'</article>';
}
function fitLabLabels() {
  document.querySelectorAll('.raw-result').forEach(el=>{
    const width=el.clientWidth;
    const marker=el.querySelector('.raw-value');
    if(marker){const pointer=el.querySelector('.raw-pointer');const pos=parseFloat(pointer.style.left)*width/100;const half=marker.offsetWidth/2;marker.style.left=Math.max(half,Math.min(width-half,pos))+'px';}
    const limits=el.querySelector('.raw-limits'),labels=[...limits.querySelectorAll('span')];
    labels.forEach(l=>{const half=l.offsetWidth/2;l.style.left=Math.max(half,Math.min(width-half,parseFloat(l.dataset.at)*width/100))+'px';l.style.top='0px';});
    const a=labels[0].getBoundingClientRect(),b=labels[1].getBoundingClientRect();
    const collide=a.right+6>b.left;labels[1].style.top=collide?'16px':'0px';limits.style.height=collide?'34px':'19px';
  });
}
const previousLabRender=renderIndicators;
renderIndicators=function(m){previousLabRender(m);fitLabLabels();};
let labCloseTimer;
const labBubble=document.createElement('aside');labBubble.id='lab-popover';labBubble.className='lab-popover';labBubble.hidden=true;labBubble.setAttribute('role','dialog');labBubble.setAttribute('aria-label',tr('Explicação do indicador','Indicator explanation'));document.body.append(labBubble);
function closeLabInfo(){labBubble.hidden=true;document.querySelectorAll('[data-lab-info][aria-expanded=true]').forEach(b=>b.setAttribute('aria-expanded','false'));}
function showLabInfo(button,hover=false){
  clearTimeout(labCloseTimer);
  labBubble.setAttribute('aria-label',tr('Explicação do indicador','Indicator explanation'));
  const id=Number(button.dataset.labInfo),s=SPECS.find(x=>x.i===id),m=byCode.get(selected);if(!s||!m)return;
  const v=s.i===1?m.context_score_informative:score(m,s.i);
  labBubble.innerHTML='<button class="lab-close" type="button" aria-label="'+tr('Fechar','Close')+'">×</button><h3>'+esc(lang==='pt'?s.pt:s.en)+'</h3>'+status(indicatorStatus(m,s).label,indicatorStatus(m,s).color)+'<p>'+esc(labInterpretation(m,s))+'</p><p><strong>'+tr('Referência. ','Reference. ')+'</strong>'+esc(labReference(m,s))+'</p><p>'+esc(labSource(s))+' · '+esc(labYear(s))+'. '+esc(s.detail[lang==='pt'?0:1])+'</p><p>'+tr('Nota do Atlas: ','Atlas score: ')+(numeric(v)?fmt(v,1)+'/100':tr('Sem nota','No score'))+'. '+tr('Limites arredondados. A classificação usa os valores completos. A posição representa a classe da nota; o número conserva a unidade original.','Limits are rounded; classification uses full values. Position represents the score class; the number retains the original unit.')+'</p>';
  labBubble.hidden=false;labBubble.dataset.hover=String(hover);document.querySelectorAll('[data-lab-info][aria-expanded=true]').forEach(b=>b.setAttribute('aria-expanded','false'));button.setAttribute('aria-expanded','true');
  labBubble.style.width=Math.min(370,innerWidth-24)+'px';const r=button.getBoundingClientRect();const h=Math.min(labBubble.scrollHeight,innerHeight*.72);labBubble.style.left=Math.max(12,Math.min(innerWidth-labBubble.offsetWidth-12,r.right-labBubble.offsetWidth))+'px';labBubble.style.top=Math.max(12,Math.min(innerHeight-h-12,r.bottom+10))+'px';
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-lab-info]');if(b){if(!labBubble.hidden&&b.getAttribute('aria-expanded')==='true'&&labBubble.dataset.hover!=='true')closeLabInfo();else showLabInfo(b);return;}if(e.target.closest('.lab-close')||!e.target.closest('#lab-popover'))closeLabInfo();});
document.addEventListener('mouseover',e=>{const b=e.target.closest('.lab-info');if(b)showLabInfo(b,true);});
document.addEventListener('mouseout',e=>{if(labBubble.dataset.hover==='true'&&e.target.closest('.lab-info')&&!e.relatedTarget?.closest('#lab-popover'))labCloseTimer=setTimeout(closeLabInfo,250);});
labBubble.addEventListener('mouseenter',()=>clearTimeout(labCloseTimer));labBubble.addEventListener('mouseleave',()=>{if(labBubble.dataset.hover==='true')labCloseTimer=setTimeout(closeLabInfo,250);});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLabInfo();});
window.addEventListener('resize',()=>{fitLabLabels();closeLabInfo();});document.fonts?.ready.then(fitLabLabels);
const previousLabMunicipality=setMunicipality;
setMunicipality=function(...args){closeLabInfo();return previousLabMunicipality(...args);};
setMunicipality(selected,false);
