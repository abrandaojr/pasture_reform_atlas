// Municipal query engine: combine measured values without recomputing scores.
const ATLAS_QUERY_FIELDS=[
 ['pastureArea2025','Pastagem total','Total pasture','ha','2025'],
 ['oportunidade','Pasto de baixo e médio vigor','Low- and medium-vigour pasture','ha','2024'],
 ['participacaoOportunidade','Parcela de pasto que pode melhorar','Share of pasture that could improve','%','2024'],
 ['baixo','Pasto de baixo vigor','Low-vigour pasture','ha','2024'],
 ['medio','Pasto de médio vigor','Medium-vigour pasture','ha','2024'],
 ['alto','Pasto de alto vigor','High-vigour pasture','ha','2024'],
 ['rebanho','Rebanho bovino','Cattle herd','cabeças','2024'],
 ['distanciaP80Qualquer','Distância P80 a qualquer frigorífico','P80 distance to any slaughterhouse','km','2025'],
 ['distanciaP80Sif','Distância P80 a SIF','P80 distance to SIF','km','2025'],
 ['distanciaP80China','Distância P80 a SIF habilitado para China','P80 distance to China-approved SIF','km','2025'],
 ['distanciaP80Eu','Distância P80 a SIF habilitado para UE','P80 distance to EU-approved SIF','km','2025'],
 ['ater','Estabelecimentos com assistência técnica','Farms with extension services','%','2017'],
 ['escolaridade','Produtores com ensino médio ou mais','Producers with secondary education or higher','%','2017'],
 ['credito','Crédito por hectare de pasto de baixo e médio vigor','Credit per low- and medium-vigour hectare','R$/ha','2024; R$ de 2025'],
 ['secaFreq','Frequência histórica de seca','Historical drought frequency','% dos anos','1984–2025'],
 ['desmat','Variação anual da vegetação nativa (negativo = perda)','Annual native vegetation change (negative = loss)','%/ano','2022–2025'],
 ['conversaoHa','Vegetação convertida em pastagem','Vegetation converted to pasture','ha','2022–2025'],
 ['conversaoPct','Conversão em pastagem sobre supressão','Conversion to pasture as share of clearing','%','2022–2025'],
 ['embargo','Área embargada','Embargoed area','ha',''],
 ['embargoNumero','Número de embargos','Number of embargoes','n',''],
 ['embargoPct','Área embargada sobre pastagem','Embargoed area as share of pasture','%',''],
 ['vigorBaixoAltoHa','Melhoria persistente de baixo para alto vigor','Persistent improvement from low to high vigour','ha','2020–2024'],
 ['vigorMedioAltoHa','Melhoria persistente de médio para alto vigor','Persistent improvement from medium to high vigour','ha','2020–2024'],
 ['risco','Classe de risco ambiental','Environmental risk class','category',''],
 ['riscoVegetacao','Risco de perda de vegetação','Native vegetation loss risk','category',''],
 ['riscoConversao','Risco de conversão em pastagem','Pasture conversion risk','category',''],
 ['riscoFloresta','Risco em floresta pública','Public forest risk','category',''],
 ['riscoEmbargos','Risco por número de embargos','Embargo count risk','category',''],
 ['riscoAreaEmbargada','Risco por área embargada','Embargoed area risk','category',''],
 ['qualidade','Classe de oportunidade','Opportunity class','category',''],
 ['condicoes','Classe de condições','Enabling conditions class','category',''],
 ['condicoesCobertura','Cobertura dos indicadores de condições','Conditions indicator coverage','category',''],['secaStatus','Origem/qualidade da seca','Drought origin/quality','category',''],
 ['uf','UF','State','category',''],['bioma','Bioma','Biome','category','']
].map(([key,pt,en,unit,period])=>({key,pt,en,unit,period}));
const ATLAS_QUERY_FIELD_MAP=Object.fromEntries(ATLAS_QUERY_FIELDS.map(field=>[field.key,field]));
let atlasQueryState={mode:'all',rules:[],sort:'pastureArea2025',direction:'desc'};
let atlasQueryPage=0,atlasQueryInitialized=false;
function queryText(pt,en){return ATLAS_LANGUAGE==='en'?en:pt;}
function queryEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function queryUnit(field){return ATLAS_LANGUAGE==='en'?({'cabeças':'head','% dos anos':'% of years','%/ano':'%/year'})[field.unit]||field.unit:field.unit;}
function queryFieldLabel(field){return `${ATLAS_LANGUAGE==='en'?field.en:field.pt}${field.unit==='category'?'':` (${queryUnit(field)})`}${field.period?' · '+(ATLAS_LANGUAGE==='en'?field.period.replace('R$ de 2025','2025 BRL'):field.period):''}`;}
function queryMissing(value){return value===null||value===undefined||value===''||(typeof value==='number'&&!Number.isFinite(value))||value==='Dados insuficientes';}
function validateAtlasQuery(state){
 if(!state||!['all','any'].includes(state.mode)||!Array.isArray(state.rules)||state.rules.length>30||!Object.hasOwn(ATLAS_QUERY_FIELD_MAP,state.sort)||!['asc','desc'].includes(state.direction))throw new Error(queryText('Consulta inválida.','Invalid query.'));
 state.rules.forEach((rule,i)=>{
  const field=Object.hasOwn(ATLAS_QUERY_FIELD_MAP,rule.field)?ATLAS_QUERY_FIELD_MAP[rule.field]:null;
  const allowed=field?.unit==='category'?['eq','ne','missing','present']:['gte','lte','gt','lt','eq','ne','missing','present'];
  if(!field||!allowed.includes(rule.op))throw new Error(queryText(`Filtro ${i+1}: variável ou operação inválida.`,`Filter ${i+1}: invalid field or operator.`));
  if(!['missing','present'].includes(rule.op)){
   if(field.unit==='category'){if(typeof rule.value!=='string'||!rule.value.trim())throw new Error(queryText(`Escolha o valor do filtro ${i+1}.`,`Choose a value for filter ${i+1}.`));}
   else if(typeof rule.value!=='number'||!Number.isFinite(rule.value))throw new Error(queryText(`Informe um número válido no filtro ${i+1}.`,`Enter a valid number in filter ${i+1}.`));
  }
 });
 return state;
}
function queryValue(row,key){return key==='secaFreq'&&String(row.secaStatus||'').toLowerCase().includes('mediana')?null:row[key];}
function matchesAtlasRule(row,rule){
 const value=queryValue(row,rule.field),missing=queryMissing(value);
 if(rule.op==='missing')return missing;
 if(rule.op==='present')return !missing;
 if(missing)return false;
 if(ATLAS_QUERY_FIELD_MAP[rule.field].unit!=='category'&&!Number.isFinite(value))return false;
 switch(rule.op){case 'gte':return value>=rule.value;case 'lte':return value<=rule.value;case 'gt':return value>rule.value;case 'lt':return value<rule.value;case 'eq':return value===rule.value;case 'ne':return value!==rule.value;default:return false;}
}
function runAtlasQuery(rows,state){
 validateAtlasQuery(state);
 const matches=rows.filter(row=>!state.rules.length||(state.mode==='all'?state.rules.every(rule=>matchesAtlasRule(row,rule)):state.rules.some(rule=>matchesAtlasRule(row,rule))));
 return matches.sort((a,b)=>{
  const av=queryValue(a,state.sort),bv=queryValue(b,state.sort),am=queryMissing(av),bm=queryMissing(bv);
  if(am!==bm)return am?1:-1;
  const order=state.sort.startsWith('risco')?{Verde:0,Amarelo:1,Vermelho:2}:state.sort==='condicoes'?{Limitadas:0,'Intermediárias':1,Adequadas:2}:null;
  const cmp=am?0:order&&Object.hasOwn(order,av)&&Object.hasOwn(order,bv)?order[av]-order[bv]:typeof av==='number'&&typeof bv==='number'?av-bv:String(av).localeCompare(String(bv),'pt-BR');
  return (state.direction==='desc'?-cmp:cmp)||String(a.codigo).localeCompare(String(b.codigo));
 });
}
function atlasQueryPreset(rows){
 return {mode:'all',rules:[
  {field:'pastureArea2025',op:'gte',value:profileActualMedian(rows,'pastureArea2025')},
  {field:'condicoes',op:'eq',value:'Adequadas'},
  {field:'condicoesCobertura',op:'eq',value:'Completa'},
  {field:'risco',op:'eq',value:'Verde'}],sort:'pastureArea2025',direction:'desc'};
}
function atlasQueryCsv(rows,state){
 const columns=['codigo','nome',...ATLAS_QUERY_FIELDS.map(field=>field.key)];
 const cell=value=>{let text=String(value??'');if(typeof value==='string'&&/^[=+\-@\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};
 const header=columns.map(key=>{const f=ATLAS_QUERY_FIELD_MAP[key];return f?`${key} [${f.unit}${f.period?'; '+f.period:''}]`:key;});
 return '\ufeff'+[header,...rows.map(row=>columns.map(key=>queryValue(row,key)??''))].map(row=>row.map(cell).join(',')).join('\r\n');
}
function queryDownload(content,type,name){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function queryDisplay(value,key){if(queryMissing(value))return queryText('Não disponível','Not available');const field=ATLAS_QUERY_FIELD_MAP[key];if(field?.unit==='category')return classLabel(String(value));return new Intl.NumberFormat(ATLAS_LANGUAGE,{maximumFractionDigits:2}).format(value);}
function renderAtlasQuery(){
 if(!MUNICIPIOS.length)return;
 const host=document.getElementById('atlas-query-root');if(!host)return;
 const label=f=>queryEscape(queryFieldLabel(f));
 const operators={gte:'≥',lte:'≤',gt:'>',lt:'<',eq:'=',ne:'≠',missing:queryText('Sem dado','Missing'),present:queryText('Com dado','Available')};
 const fieldOptions=selected=>ATLAS_QUERY_FIELDS.map(f=>`<option value="${f.key}"${f.key===selected?' selected':''}>${label(f)}</option>`).join('');
 const rules=atlasQueryState.rules.map((rule,i)=>{
  const field=ATLAS_QUERY_FIELD_MAP[rule.field];const categorical=field.unit==='category';
  const ops=categorical?['eq','ne','missing','present']:Object.keys(operators);
  const options=[...new Set(MUNICIPIOS.map(row=>row[rule.field]).filter(v=>!queryMissing(v)))].sort();
  const valueInput=['missing','present'].includes(rule.op)?'<span></span>':categorical?`<select data-rule="${i}" data-part="value" aria-label="${queryText('Valor','Value')} ${i+1}">${options.map(v=>`<option value="${queryEscape(v)}"${v===rule.value?' selected':''}>${queryEscape(classLabel(v))}</option>`).join('')}</select>`:`<input type="number" step="any" value="${Number.isFinite(rule.value)?rule.value:''}" data-rule="${i}" data-part="value" aria-label="${queryText('Valor','Value')} ${i+1}">`;
  return `<div class="atlas-query-rule"><label><span>${queryText('Variável','Variable')} ${i+1}</span><select data-rule="${i}" data-part="field">${fieldOptions(rule.field)}</select></label><label><span>${queryText('Operação','Operator')}</span><select data-rule="${i}" data-part="op">${ops.map(op=>`<option value="${op}"${op===rule.op?' selected':''}>${queryEscape(operators[op])}</option>`).join('')}</select></label><label><span>${queryText('Valor','Value')}${categorical?'':' · '+queryUnit(field)}</span>${valueInput}</label><button class="btn small" data-query-action="remove" data-index="${i}" aria-label="${queryText('Remover filtro','Remove filter')} ${i+1}">×</button></div>`;
 }).join('');
 let results=[],error='';try{results=runAtlasQuery(MUNICIPIOS,atlasQueryState);}catch(e){error=e.message;}
 const pages=Math.max(1,Math.ceil(results.length/50));atlasQueryPage=Math.min(atlasQueryPage,pages-1);
 const shown=results.slice(atlasQueryPage*50,(atlasQueryPage+1)*50);
 const columns=[...new Set(['pastureArea2025','oportunidade','distanciaP80Qualquer','ater','secaFreq','risco',...atlasQueryState.rules.map(r=>r.field)])].filter(k=>!['uf','bioma'].includes(k));
 const sum=key=>results.reduce((s,row)=>s+(Number.isFinite(row[key])?row[key]:0),0);
 const missing=atlasQueryState.rules.length?MUNICIPIOS.filter(row=>atlasQueryState.rules.some(rule=>!['missing','present'].includes(rule.op)&&queryMissing(queryValue(row,rule.field)))).length:0;
 host.innerHTML=`<div class="section-head"><div><h2>${queryText('Cruzar variáveis','Query variables')}</h2><p class="desc">${queryText('Selecione municípios combinando pastagem, condições de produção e risco. Ajuste os limites nas unidades reais.','Select municipalities by combining pasture, production conditions and risk. Set thresholds in original units.')}</p></div></div>
 <div class="atlas-query-controls"><button class="btn ochre" data-query-action="preset">${queryText('Exemplo: pastagem + condições + risco','Example: pasture + conditions + risk')}</button><button class="btn" data-query-action="reset">${queryText('Limpar consulta','Clear query')}</button></div>
 <p class="atlas-query-note">${queryText('O exemplo seleciona pastagem ≥ mediana nacional, condições Adequadas com cobertura completa e risco Verde. Os limites e as classes podem ser ajustados.','The example selects pasture ≥ national median, Adequate conditions with complete coverage, and Green risk. Thresholds and classes can be adjusted.')}</p>
 <div class="atlas-query-builder"><label>${queryText('Combinar filtros','Combine filters')} <select id="query-mode"><option value="all"${atlasQueryState.mode==='all'?' selected':''}>${queryText('TODOS (E)','ALL (AND)')}</option><option value="any"${atlasQueryState.mode==='any'?' selected':''}>${queryText('QUALQUER (OU)','ANY (OR)')}</option></select></label>${rules||`<p>${queryText('Sem filtros: todos os municípios. Adicione uma variável ou use o exemplo.','No filters: all municipalities. Add a variable or use the example.')}</p>`}<button class="btn" data-query-action="add"${atlasQueryState.rules.length>=30?' disabled':''}>+ ${queryText('Adicionar filtro','Add filter')}</button></div>
 <p class="atlas-query-note">${queryText('Valores ausentes não satisfazem comparações numéricas ou de classe. Use “Sem dado” para procurá-los. Condições seguem a metodologia versionada do Atlas. Valores de seca imputados não atendem aos filtros numéricos; a origem consta no CSV.','Missing values do not satisfy numeric or class comparisons. Use “Missing” to find them. Conditions follow the versioned Atlas methodology. Imputed drought does not match numeric filters; its origin is included in the CSV.')}</p>
 ${error?`<p role="alert" class="atlas-query-error">${queryEscape(error)}</p>`:`<div class="atlas-query-kpis" role="status"><div><strong>${results.length.toLocaleString(ATLAS_LANGUAGE)}</strong><span>${queryText('municípios selecionados','municipalities selected')}</span></div><div><strong>${fmtHa(sum('pastureArea2025'))}</strong><span>${queryText('pastagem selecionada · 2025','selected pasture · 2025')}</span></div><div><strong>${fmtHa(sum('oportunidade'))}</strong><span>${queryText('baixo e médio vigor · 2024','low and medium vigour · 2024')}</span></div></div>`}
 <p class="atlas-query-note">${queryText(`${missing.toLocaleString('pt-BR')} municípios têm ausência em pelo menos uma variável comparada; em consultas OU, podem satisfazer outro filtro.`,`${missing.toLocaleString('en')} municipalities lack at least one compared variable; in OR queries they may still satisfy another filter.`)}</p>
 <div class="atlas-query-controls"><label>${queryText('Ordenar por','Sort by')}<select id="query-sort">${fieldOptions(atlasQueryState.sort)}</select></label><label>${queryText('Ordem','Order')}<select id="query-direction"><option value="desc"${atlasQueryState.direction==='desc'?' selected':''}>${queryText('Maior → menor','Largest → smallest')}</option><option value="asc"${atlasQueryState.direction==='asc'?' selected':''}>${queryText('Menor → maior','Smallest → largest')}</option></select></label><button class="btn" data-query-action="csv"${error||!results.length?' disabled':''}>${queryText('Exportar seleção CSV','Export selection CSV')}</button><button class="btn" data-query-action="share"${error?' disabled':''}>${queryText('Link da consulta','Query link')}</button></div>
 <div id="query-share"></div><p>${queryText('Clique no município para abrir sua ficha.','Select a municipality to open its profile.')}</p>
 <div class="atlas-query-table-wrap" tabindex="0" aria-label="${queryText('Resultados da consulta, tabela com rolagem horizontal','Query results, horizontally scrollable table')}"><table class="data-table"><thead><tr><th>${queryText('Município','Municipality')}</th><th>UF</th><th>${queryText('Bioma','Biome')}</th>${columns.map(k=>`<th>${label(ATLAS_QUERY_FIELD_MAP[k])}</th>`).join('')}</tr></thead><tbody>${shown.map(row=>`<tr><td><button class="atlas-query-municipality" data-query-action="profile" data-code="${row.codigo}">${queryEscape(row.nome)}</button></td><td>${queryEscape(row.uf)}</td><td>${queryEscape(row.bioma)}</td>${columns.map(k=>`<td>${queryEscape(queryDisplay(queryValue(row,k),k))}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${columns.length+3}">${error?queryText('Corrija os filtros para consultar.','Correct the filters to run the query.'):queryText('Nenhum município atende aos filtros. Revise os limites ou use OU.','No municipality matches the filters. Adjust thresholds or use OR.')}</td></tr>`}</tbody></table></div>
 <div class="atlas-query-controls"><button class="btn" data-query-action="prev"${atlasQueryPage===0?' disabled':''}>${queryText('Anterior','Previous')}</button><span>${queryText('Página','Page')} ${atlasQueryPage+1} / ${pages} · ${queryText('50 por página; CSV exporta todos os resultados','50 per page; CSV exports every result')}</span><button class="btn" data-query-action="next"${atlasQueryPage>=pages-1?' disabled':''}>${queryText('Próxima','Next')}</button></div><p class="atlas-query-note">${queryText('Fonte: mesma base municipal publicada no Atlas. Períodos e unidades constam nas fichas e nos cabeçalhos do CSV. O link guarda os critérios; os resultados acompanham a atualização da base.','Source: the same municipal dataset published in the Atlas. Periods and units are listed in profiles and CSV headers. The link saves criteria; results follow dataset updates.')}</p>`;
}
function queryHandleChange(event){
 const element=event.target;
 if(element.dataset.rule!==undefined){
  const rule=atlasQueryState.rules[Number(element.dataset.rule)],part=element.dataset.part;
  if(part==='field'){rule.field=element.value;rule.op=ATLAS_QUERY_FIELD_MAP[rule.field].unit==='category'?'eq':'gte';rule.value=rule.op==='eq'?[...new Set(MUNICIPIOS.map(r=>r[rule.field]).filter(v=>!queryMissing(v)))].sort()[0]:0;}
  else if(part==='op'){rule.op=element.value;}
  else rule.value=ATLAS_QUERY_FIELD_MAP[rule.field].unit==='category'?element.value:element.value.trim()===''?null:Number(element.value);
 }else if(element.id==='query-mode')atlasQueryState.mode=element.value;
 else if(element.id==='query-sort')atlasQueryState.sort=element.value;
 else if(element.id==='query-direction')atlasQueryState.direction=element.value;
 atlasQueryPage=0;renderAtlasQuery();
}
function queryHandleClick(event){
 const button=event.target.closest('[data-query-action]');if(!button)return;
 const action=button.dataset.queryAction;
 if(action==='profile'){openFicha(button.dataset.code);return;}
 if(action==='csv'){const rows=runAtlasQuery(MUNICIPIOS,atlasQueryState);queryDownload(atlasQueryCsv(rows,atlasQueryState),'text/csv;charset=utf-8','atlas_consulta_municipios.csv');return;}
 if(action==='share'){
  const url=new URL(location.href);url.searchParams.delete('atlasClickTest');url.searchParams.set('view','consulta');url.searchParams.set('query',JSON.stringify(atlasQueryState));
  document.getElementById('query-share').innerHTML=`<label>${queryText('Copie este link','Copy this link')}<input readonly value="${queryEscape(url.href)}" aria-label="${queryText('Link da consulta','Query link')}"></label>`;
  document.querySelector('#query-share input').select();return;
 }
 if(action==='preset')atlasQueryState=atlasQueryPreset(MUNICIPIOS);
 if(action==='reset')atlasQueryState={mode:'all',rules:[],sort:'pastureArea2025',direction:'desc'};
 if(action==='add'&&atlasQueryState.rules.length<30)atlasQueryState.rules.push({field:'pastureArea2025',op:'gte',value:0});
 if(action==='remove')atlasQueryState.rules.splice(Number(button.dataset.index),1);
 if(action==='prev')atlasQueryPage--;else if(action==='next')atlasQueryPage++;else atlasQueryPage=0;
 renderAtlasQuery();
}
document.getElementById('atlas-query-root').addEventListener('change',queryHandleChange);
document.getElementById('atlas-query-root').addEventListener('click',queryHandleClick);
document.addEventListener('atlaslanguagechange',()=>{
 const reference=document.getElementById('conditions-method-reference');if(reference)reference.innerHTML=conditionsReferenceHtml();
 document.getElementById('nav-query').textContent=queryText('Consulta','Query');
 if(!atlasQueryInitialized&&MUNICIPIOS.length){
  atlasQueryInitialized=true;const params=new URLSearchParams(location.search);
  if(params.has('query')){try{atlasQueryState=validateAtlasQuery(JSON.parse(params.get('query')));}catch(e){toast(e.message);}}
  if(params.get('view')==='consulta'){showView('consulta');return;}
 }
 if(!document.getElementById('view-consulta').hidden)renderAtlasQuery();
});
