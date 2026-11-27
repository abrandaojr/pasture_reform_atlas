let PROFILE_PEER_CODE='';
function setProfilePeer(label,currentCode){
  const peer=MUNICIPIOS.find(x=>`${x.nome} — ${x.uf}`===label);
  PROFILE_PEER_CODE=peer&&peer.codigo!==currentCode?peer.codigo:'';
  openFicha(currentCode);
}
function profileRealMetrics(en){
  return [
    {key:'oportunidade',label:en?'Low- and medium-vigour pasture':'Pastagem de baixo e médio vigor',unit:'ha',period:'2024',digits:0},
    {key:'participacaoOportunidade',label:en?'Share of pasture that could improve':'Parcela da pastagem que pode melhorar',unit:'%',period:'2024',digits:1},
    {key:'rebanho',label:en?'Cattle herd':'Rebanho bovino',unit:en?'head':'cabeças',period:'2024',digits:0},
    {key:'distanciaP80Qualquer',label:en?'Pasture P80 distance to slaughterhouses':'Distância P80 da pastagem a frigoríficos',unit:'km',period:'2025',digits:1},
    {key:'secaFreq',label:en?'Historical drought frequency':'Frequência histórica de seca',unit:en?'% of years':'% dos anos',period:'1984–2025',digits:1},
    {key:'ater',label:en?'Farms with extension services':'Estabelecimentos com assistência técnica',unit:'%',period:'2017',digits:1},
    {key:'escolaridade',label:en?'Producers with secondary education or higher':'Produtores com ensino médio ou mais',unit:'%',period:'2017',digits:1},
    {key:'credito',label:en?'Credit per low- and medium-vigour hectare':'Crédito por hectare de pasto de baixo e médio vigor',unit:'R$/ha',period:en?'2024 · 2025 prices':'2024 · preços de 2025',digits:1}
  ];
}
function profileActualMedian(rows,key){
  const values=rows.map(row=>row[key]).filter(Number.isFinite).sort((a,b)=>a-b);
  if(!values.length)return null;
  const middle=Math.floor(values.length/2);
  return values.length%2?values[middle]:(values[middle-1]+values[middle])/2;
}
function profileRiskClass(rows){
  const counts=new Map();
  rows.forEach(row=>{if(['Verde','Amarelo','Vermelho'].includes(row.risco))counts.set(row.risco,(counts.get(row.risco)||0)+1);});
  if(!counts.size)return null;
  const largest=Math.max(...counts.values());
  return [...counts].filter(([,n])=>n===largest).map(([label])=>classLabel(label)).join(' / ');
}
function profileAxisMaximum(values){
  const max=Math.max(0,...values.filter(Number.isFinite));
  if(max===0)return null;
  const power=10**Math.floor(Math.log10(max));
  return Math.ceil(max/power)*power;
}
function profileRealNumber(value,metric){
  if(!Number.isFinite(value))return ATLAS_LANGUAGE==='en'?'Not available':'Não disponível';
  return new Intl.NumberFormat(ATLAS_LANGUAGE,{maximumFractionDigits:value!==0&&Math.abs(value)<1?2:metric.digits}).format(value);
}
function spiderDiagram(m){
  const en=ATLAS_LANGUAGE==='en', peers=biomaPeers(m);
  const peer=MUNICIPIOS.find(x=>x.codigo===PROFILE_PEER_CODE);
  const groups=[{name:m.nome,kind:'municipal',record:m},
    {name:en?`${m.bioma} · median`:`${m.bioma} · mediana`,kind:'biome',members:peers},
    {name:en?'Brazil · median':'Brasil · mediana',kind:'brazil',members:MUNICIPIOS}];
  if(peer)groups.push({name:`${peer.nome} — ${peer.uf}`,kind:'peer',record:peer});
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cards=profileRealMetrics(en).map(metric=>{
    const values=groups.map(group=>group.record?group.record[metric.key]:profileActualMedian(group.members,metric.key));
    const maximum=profileAxisMaximum(values);
    const rows=groups.map((group,i)=>{
      const value=values[i],valid=Number.isFinite(value);
      const position=valid&&maximum?value/maximum*100:0;
      return `<div class="profile-real-row ${group.kind}" data-series="${group.kind}" data-value="${valid?value:''}"><span class="profile-real-name">${escape(group.name)}</span><div class="profile-real-track" aria-hidden="true">${valid?`<span class="profile-real-bar" style="width:${position}%"></span>`:''}</div><strong>${profileRealNumber(value,metric)}${valid?` <small>${metric.unit}</small>`:''}</strong></div>`;
    }).join('');
    const axis=maximum?`<div class="profile-real-axis">${en?'Bar scale':'Escala das barras'}: 0–${profileRealNumber(maximum,metric)} ${metric.unit}</div>`:'';
    return `<article class="profile-real-metric" data-metric="${metric.key}" data-axis-max="${maximum??''}"><h4>${metric.label} <small>${metric.period}</small></h4>${rows}${axis}</article>`;
  }).join('');
  const risk=groups.map(group=>{
    const label=group.record?classLabel(group.record.risco):profileRiskClass(group.members);
    const name=group.record?group.name:group.kind==='brazil'?(en?'Brazil · most frequent class':'Brasil · classe mais frequente'):`${m.bioma} · ${en?'most frequent class':'classe mais frequente'}`;
    return `<div class="profile-real-class ${group.kind}"><span>${escape(name)}</span><strong>${label|| (en?'Not available':'Não disponível')}</strong></div>`;
  }).join('');
  const options=MUNICIPIOS.filter(x=>x.codigo!==m.codigo).map(x=>`<option value="${escape(`${x.nome} — ${x.uf}`)}"></option>`).join('');
  return `<section class="spider-card profile-comparison profile-real-values"><div class="profile-comparison-head"><div><h3>${en?'Municipal profile in original units':'Perfil municipal nas unidades originais'}</h3><p class="desc">${en?'Observed values compared with municipal medians for the biome and Brazil. Each indicator has its own scale and unit; larger values are not necessarily better.':'Valores observados comparados às medianas municipais do bioma e do Brasil. Cada indicador tem sua escala e unidade; valores maiores não são necessariamente melhores.'}</p></div><label>${en?'Compare another municipality':'Comparar com outro município'}<input list="profile-peer-options" placeholder="${en?'Type a municipality':'Digite um município'}" value="${peer?escape(`${peer.nome} — ${peer.uf}`):''}" onchange="setProfilePeer(this.value,'${m.codigo}')"><datalist id="profile-peer-options">${options}</datalist></label></div><div class="profile-real-grid">${cards}<article class="profile-real-metric profile-real-risk"><h4>${en?'Environmental risk class':'Classe de risco ambiental'}</h4>${risk}</article></div><p class="profile-real-note">${en?'Sources: Atlas municipal indicators (MapBiomas, IBGE, FAO, slaughterhouse registers and rural credit). Reference periods are shown for each indicator. Medians use municipalities with available values, without area weighting. Risk comparisons show the most frequent class; ties are shown together.':'Fontes: indicadores municipais do Atlas (MapBiomas, IBGE, FAO, cadastros de frigoríficos e crédito rural). Períodos indicados em cada indicador. Medianas dos municípios com valores disponíveis, sem ponderação por área. O risco mostra a classe mais frequente; empates aparecem juntos.'}</p></section>`;
}
