(function(){
'use strict';
if(window.ATLAS_CLARITY_INSTALLED)return;window.ATLAS_CLARITY_INSTALLED=true;
const en=()=>document.documentElement.lang.startsWith('en');
const t=(pt,eng)=>en()?eng:pt;
const put=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text;};
let queued=false;
function schedule(){if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;apply();});}}
function code(){return String(window.ATLAS_MAP_SELECTED_CODE||window.ATLAS_RANKING_STATE?.selected||window.ATLAS_CHAIN_ACCESS_STATE?.code||(typeof selected!=='undefined'?selected:'')||new URLSearchParams(location.search).get('municipio')||'1507300');}
function link(page,hash=''){return page+'?lang='+(en()?'en':'pt')+'&municipio='+encodeURIComponent(code())+hash;}
function technical(){
 const caption=document.querySelector('.map-source-caption');
 if(caption)put(caption,t('Limites municipais IBGE · Fontes e método no menu','IBGE municipal boundaries · Sources and method in the menu'));
 const method=document.getElementById('metodo');
 if(method){let d=method.querySelector('#atlas-technical-details');if(!d){d=document.createElement('details');d.id='atlas-technical-details';d.className='clarity-disclosure';const s=document.createElement('summary');d.append(s,document.createElement('p'));method.append(d);}put(d.querySelector('summary'),t('Referências cartográficas','Cartographic references'));put(d.querySelector('p'),t('Limites municipais IBGE 2024. Exibição do mapa em EPSG:3857. Áreas analíticas em BR_BDC_2. A nota de pressão ambiental composta tem Alta como classe mais severa alcançável pela fórmula.','IBGE municipal boundaries 2024. Map display in EPSG:3857. Analytical areas in BR_BDC_2. High is the most severe composite environmental-pressure class the formula can produce.'));}
 const note=document.querySelector('.map-note');
 if(note){const span=[...note.querySelectorAll('[data-pt]')].find(s=>s.dataset.pt.includes('EPSG:3857'));let d=document.getElementById('chain-technical-details');if(!d){d=document.createElement('details');d.id='chain-technical-details';d.className='clarity-disclosure';d.append(document.createElement('summary'));note.after(d);}put(d.querySelector('summary'),t('Referências cartográficas','Cartographic references'));if(span)d.append(span);else if(!d.querySelector('span')){let p=d.querySelector('p');if(!p){p=document.createElement('p');d.append(p);}put(p,t('Mapa em EPSG:3857. Áreas analíticas em BR_BDC_2; distâncias geodésicas em GRS80.','Map in EPSG:3857. Analytical areas in BR_BDC_2; geodesic distances on GRS80.'));}}
}
function navigation(){
 const path=location.pathname.split('/').pop(),hash=location.hash;
 const names={map:t('Mapa','Map'),municipality:t('Diagnóstico','Diagnosis'),ranking:'Ranking',chain:t('Cadeia produtiva','Supply chain'),sources:t('Fontes','Sources'),method:t('Método','Method')};
 const targets={map:['Atlas.html','#map-workspace'],municipality:['municipio.html','#resumo'],ranking:['ranking.html',''],chain:['cadeia.html',''],sources:['Atlas.html','#evidencias'],method:['Atlas.html','#metodo']};
 const active=path==='municipio.html'?'municipality':path==='ranking.html'?'ranking':path==='cadeia.html'?'chain':hash==='#evidencias'?'sources':hash==='#metodo'?'method':'map';
 for(const nav of document.querySelectorAll('.stepnav'))for(const a of nav.querySelectorAll('a')){
  const key=a.querySelector('[data-i18n]')?.dataset.i18n;let role=a.dataset.clarityRole||({navSummary:'map',navIndicators:'municipality',navEvidence:'sources',navMethod:'method'})[key]||({map:'map',municipality:'municipality',ranking:'ranking',sources:'sources',method:'method'})[a.dataset.nav];
  if(!role&&a.hasAttribute('data-supply-chain-tab'))role='chain';
  if(!role&&a.hasAttribute('data-ranking-tab'))role='ranking';
  if(!role){const u=new URL(a.href,location.href),page=u.pathname.split('/').pop();role=u.hash==='#evidencias'?'sources':u.hash==='#metodo'?'method':page==='municipio.html'?'municipality':page==='ranking.html'?'ranking':page==='cadeia.html'?'chain':'map';}
  a.dataset.clarityRole=role;put(a.querySelector('[data-i18n]')||a,names[role]);const href=link(...targets[role]);if(a.getAttribute('href')!==href)a.setAttribute('href',href);
  if(role===active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 }
 document.querySelectorAll('header a.brand').forEach(a=>{const href=link('Atlas.html','#map-workspace');if(a.getAttribute('href')!==href)a.setAttribute('href',href);});
}
function ranking(){
 const input=document.getElementById('rank-search');if(!input)return;
 input.placeholder=t('Digite o nome do município…','Type a municipality name…');input.setAttribute('aria-label',t('Encontrar município na lista','Find a municipality in the list'));
 if(!input.closest('.clarity-search')){const box=document.createElement('div');box.className='clarity-search';input.before(box);box.append(input);const icon=document.createElement('span');icon.className='clarity-search-icon';icon.setAttribute('aria-hidden','true');box.prepend(icon);const clear=document.createElement('button');clear.type='button';clear.className='clarity-search-clear';clear.textContent='×';clear.addEventListener('click',()=>{input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();});box.append(clear);input.addEventListener('input',()=>{clear.hidden=!input.value;});}
 const clear=input.parentElement.querySelector('button');clear.hidden=!input.value;clear.setAttribute('aria-label',t('Limpar busca','Clear search'));
 document.querySelectorAll('#rank-list .rank-value>span').forEach(el=>{const text=[...el.childNodes].find(n=>n.nodeType===3&&['Contexto','Context'].includes(n.textContent.trim()));if(text)text.textContent=t('Dado descritivo (sem nota)','Descriptive value (no score)');});
}
function sheet(){
 const panel=document.getElementById('map-result-panel');if(!panel)return;
 let toggle=panel.querySelector('.clarity-sheet-toggle');
 if(!toggle){toggle=document.createElement('button');toggle.type='button';toggle.className='clarity-sheet-toggle';toggle.setAttribute('aria-controls','map-result-values');panel.querySelector('h3').after(toggle);toggle.addEventListener('click',()=>{panel.classList.toggle('clarity-expanded');sheet();});
 const h=panel.querySelector('h3');let start;h.addEventListener('touchstart',e=>{start=e.touches[0].clientY;},{passive:true});h.addEventListener('touchend',e=>{if(start===undefined)return;const delta=start-e.changedTouches[0].clientY;if(Math.abs(delta)>25){panel.classList.toggle('clarity-expanded',delta>0);sheet();}start=undefined;},{passive:true});}
 let brief=panel.querySelector('.clarity-sheet-summary');if(!brief){brief=document.createElement('p');brief.className='clarity-sheet-summary';toggle.before(brief);}const rows=[...panel.querySelectorAll('.map-mini-row')].slice(-2);put(brief,rows.map((r,i)=>(i?t('Pressão','Pressure'):t('Condições','Conditions'))+' '+(r.lastElementChild?.textContent||'').trim().toLocaleLowerCase(en()?'en':'pt')).join(' · '));
 const expanded=panel.classList.contains('clarity-expanded');toggle.setAttribute('aria-expanded',String(expanded));put(toggle,expanded?t('Recolher resumo','Collapse summary'):t('Ver resumo no mapa','Show map summary'));
 const opportunity=panel.querySelector('#map-result-values .map-mini-row:nth-last-of-type(3) .dot');if(opportunity&&typeof byCode!=='undefined'){const m=byCode.get(code()),v=m?.ind02_score;if(Number.isFinite(v))opportunity.style.background=['#176348','#3f7d55','#9b7415','#ad5a17','#a63d40'][Math.max(0,Math.min(4,Math.ceil(v/20)-1))];}
}
function modalHelp(){
 if(!window.ATLAS_ACTIVE_SHARE_UI_READY||typeof showLabInfo!=='function'||showLabInfo.atlasClarity)return;
 let state=window.ATLAS_HELP_STATE;
 if(!state){const backdrop=document.createElement('button');backdrop.type='button';backdrop.id='atlas-help-backdrop';backdrop.hidden=true;document.body.append(backdrop);state=window.ATLAS_HELP_STATE={backdrop,trigger:null};backdrop.addEventListener('click',()=>closeLabInfo());
 document.addEventListener('keydown',e=>{if(e.key==='Tab'&&!state.backdrop.hidden){const p=document.getElementById('lab-popover'),items=[...p.querySelectorAll('button,a[href],[tabindex="0"]')].filter(x=>x.getClientRects().length),first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});}
 state.backdrop.setAttribute('aria-label',t('Fechar explicação','Close explanation'));
 if(!closeLabInfo.atlasClarity){const originalClose=closeLabInfo;closeLabInfo=function(){originalClose();state.backdrop.hidden=true;document.getElementById('lab-popover')?.removeAttribute('aria-modal');if(state.trigger?.isConnected)state.trigger.focus({preventScroll:true});state.trigger=null;};closeLabInfo.atlasClarity=true;}
 const originalShow=showLabInfo;
 showLabInfo=function(button,hover=false){const mobile=innerWidth<768||matchMedia('(hover: none)').matches;if(hover&&mobile)return;originalShow(button,hover);const p=document.getElementById('lab-popover');if(mobile&&p&&!p.hidden){state.trigger=button;state.backdrop.hidden=false;p.setAttribute('aria-modal','true');p.querySelector('.lab-close')?.focus({preventScroll:true});}};
 showLabInfo.atlasClarity=true;
}
function categories(){
 const node=document.querySelector('#chain-access-distances [data-chain-results]');if(!node)return;
 for(const table of node.querySelectorAll(':scope>.chain-distance-table')){
  const groups=new Map();for(const row of table.querySelectorAll('tbody>tr')){const title=row.cells[0]?.firstChild?.textContent.trim()||t('Outros locais','Other locations');if(!groups.has(title))groups.set(title,[]);groups.get(title).push(row);}
  if(!groups.size)continue;
  const box=document.createElement('div');box.className='clarity-distance-groups';for(const[title,rows]of groups){const d=document.createElement('details');d.className='clarity-disclosure';const summary=document.createElement('summary');summary.textContent=title+' ('+rows.length+')';d.append(summary);const part=table.cloneNode(false);for(const child of table.children)if(child.tagName!=='TBODY')part.append(child.cloneNode(true));const body=document.createElement('tbody');rows.forEach(row=>body.append(row));part.append(body);d.append(part);box.append(d);}table.replaceWith(box);
 }
}
function selectedLabels(){
 for(const id of ['business-category','map-state','chain-access-origin','chain-access-destination']){
  const select=document.getElementById(id);if(!select||!select.options.length)continue;
  if(id==='map-state'&&!location.pathname.endsWith('cadeia.html'))continue;
  let hint=document.querySelector('[data-clarity-selection="'+id+'"]');if(!hint){hint=document.createElement('p');hint.className='clarity-selected-label';hint.dataset.claritySelection=id;select.after(hint);}const text=select.selectedOptions[0]?.textContent||'';put(hint,text);const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=getComputedStyle(select).font;hint.hidden=ctx.measureText(text).width<select.clientWidth-44;
 }
}
function informationDesign(){
 const palette=['#a63d40','#ad5a17','#9b7415','#3f7d55','#176348'];
 const old=['rgb(196, 0, 0)','rgb(255, 117, 16)','rgb(255, 255, 48)','rgb(154, 231, 19)','rgb(47, 205, 0)'];
 for(const dot of document.querySelectorAll('.summary-card .dot,.lab-result .dot,#rank-list .rank-value i,#status-legend .dot,#map-result-values .dot,.method-info-scale>span')){
  const i=old.indexOf(getComputedStyle(dot).backgroundColor);if(i>=0)dot.style.backgroundColor=palette[i];
 }
 if(window.ATLAS_RANKING_STATE?.metric==='2')document.querySelectorAll('#rank-list .rank-value i').forEach(dot=>{dot.style.backgroundColor='#557f9f';});
 const guide=document.getElementById('municipal-scale-guide');
 if(guide){const html='<strong>'+t('Quanto mais preenchido, maior a intensidade','More filled segments mean greater intensity')+'</strong><p>'+t('Pressão muito alta ocupa cinco segmentos. Pressão muito baixa ocupa um. A mesma lógica vale para exposição à seca, oportunidade e cobertura.','Very high pressure fills five segments. Very low pressure fills one. The same rule applies to drought exposure, opportunity and coverage.')+'</p><p>'+t('Os segmentos mostram classes, não percentuais. O valor observado fica acima, com sua unidade. A nota original está em “Como foi classificado”.','Segments show classes, not percentages. The observed value appears above, with its unit. The original score is under “How this was classified”.')+'</p>';if(guide.innerHTML!==html)guide.innerHTML=html;}

 const rank=document.getElementById('rank-count');
 if(rank){let note=document.getElementById('ranking-reading-key');if(!note){note=document.createElement('p');note.id='ranking-reading-key';note.className='clarity-ranking-key';rank.after(note);}put(note,t('A posição ordena o valor observado. A classificação interpreta esse indicador; não é uma avaliação geral do município.','Rank orders the observed value. Classification interprets that indicator; it is not an overall assessment of the municipality.'));}
 const explanation=document.querySelector('[data-i18n="methodColors"]');if(explanation&&typeof T!=='undefined')put(explanation,T[en()?'en':'pt'].methodColors);
}
function friendlyNumber(v,unit=''){
 if(!Number.isFinite(v))return t('Sem dado','No data');
 const f=(x,d)=>x.toLocaleString(en()?'en-US':'pt-BR',{maximumFractionDigits:d});
 if(v>0&&v<.01)return '<'+f(.01,2);
 if(v>=1e6)return f(v/1e6,1)+t(Math.round(v/1e5)===10?' milhão':' milhões',' million');
 if(v>=1e4)return f(v/1e3,1)+t(' mil',' thousand');
 return f(v,Math.abs(v)<1?2:unit.includes('%')?1:0);
}
function rankingIntensity(){
 const metric=Number(window.ATLAS_RANKING_STATE?.metric);if(!metric||metric===1)return;
 for(const el of document.querySelectorAll('#rank-list .rank-value>span')){
  const node=[...el.childNodes].find(n=>n.nodeType===3&&/Nota|Score/.test(n.textContent));if(!node)continue;
  const match=node.textContent.match(/(?:Nota|Score)\s+([\d.,]+)/);if(!match)continue;const score=Number(match[1].replace(',','.'));if(!Number.isFinite(score))continue;
  const index=Math.max(0,Math.min(4,Math.ceil(score/20)-1)),level=metric===4||metric>=7?5-index:index+1;
  const labels=en()?['very low','low','medium','high','very high']:['muito baixa','baixa','média','alta','muito alta'];
  const title=metric>=7?t('Pressão','Pressure'):metric===4?t('Exposição à seca','Drought exposure'):metric===2?t('Oportunidade','Opportunity'):t('Classe','Class');
  el.title=t('Nota original','Original score')+' '+score+' / 100';node.textContent=title+' '+labels[level-1];el.dataset.intensityLevel=level;
 }
}
function simplifyNumbers(){
 for(const el of document.querySelectorAll('.municipal-count-card>strong,#rank-list .rank-value>strong')){
  if(el.dataset.readingExact||el.children.length)continue;
  const raw=el.textContent.trim(),match=raw.match(/^([\d.,]+)\s*(ha|km|%|cabeças|head)?$/);if(!match)continue;
  const value=Number(en()?match[1].replaceAll(',',''):match[1].replaceAll('.','').replace(',','.'));if(!Number.isFinite(value))continue;
  const unit=match[2]||'',display=friendlyNumber(value,unit)+(unit?' '+unit:'');if(display!==raw){el.dataset.readingExact=raw;el.title=raw;el.setAttribute('aria-label',raw);el.textContent=display;}
 }
 for(const el of document.querySelectorAll('.share-absolute,.s7-whole-context')){
  if(el.closest('.reading-detail'))continue;const d=document.createElement('details');d.className='reading-detail';const label=document.createElement('summary');label.textContent=el.classList.contains('s7-whole-context')?t('Comparar com o município inteiro','Compare with the whole municipality'):t('Áreas e bases de cálculo','Areas and calculation bases');el.before(d);d.append(label,el);
 }
}
function supplyEvidence(){
 const section=document.querySelector('#chain-access-distances>.wrap');if(!section)return;
 if(section.querySelector('.distance-unified')){section.querySelector('.reading-evidence-key')?.remove();return;}
 let key=section.querySelector('.reading-evidence-key');if(!key){key=document.createElement('aside');key.className='reading-evidence-key';section.querySelector('[data-chain-intro]').after(key);}
 const html='<div><strong>'+t('Perto no mapa','Nearby on the map')+'</strong><div class="evidence-line" aria-hidden="true"></div><p>'+t('A distância liga locais para comparação. Não identifica quem vende para quem.','Distance connects locations for comparison. It does not identify who sells to whom.')+'</p></div><div><strong>'+t('Movimentação declarada','Declared movement')+'</strong><div class="evidence-line recorded" aria-hidden="true"></div><p>'+t('Registros de GTA informam origem, destino e cabeças declaradas. A emissão da guia não confirma viagem concluída ou compra.','GTA records identify origins, destinations and declared cattle heads. Issuing a guide does not confirm a completed journey or purchase.')+'</p></div>';
 if(key.innerHTML!==html)key.innerHTML=html;
}
function cattleFlows(){
 const selection=document.querySelector('[data-gta-filter=scale]');if(selection&&!window.ATLAS_FLOW_DEFAULT_SET){window.ATLAS_FLOW_DEFAULT_SET=true;selection.value='municipality';selection.dispatchEvent(new Event('change',{bubbles:true}));return;}
 for(const flows of document.querySelectorAll('.official-gta-context')){
  if(flows.querySelector('.gta-flow-overview'))continue;
  const routes=[...flows.querySelectorAll('[data-gta-heads][data-gta-origin]')],state=flows.dataset.gtaScale==='state';
  const chosen=typeof byCode!=='undefined'?byCode.get(code()):null,place=state?chosen?.uf:code();
  const sum=fn=>{const selectedRoutes=routes.filter(fn);return selectedRoutes.length?selectedRoutes.reduce((n,r)=>n+Number(r.dataset.gtaHeads),0):null;};
  const origin=r=>state?r.dataset.gtaOrigin:r.dataset.gtaOriginMunicipality,destination=r=>state?r.dataset.gtaDestination:r.dataset.gtaDestinationMunicipality;
  const quantities=[];
  if(state&&routes.length){
   quantities.push([t('Entrando no estado','Entering the state'),sum(r=>destination(r)===place&&origin(r)&&origin(r)!==place)]);
   quantities.push([t('Saindo do estado','Leaving the state'),sum(r=>origin(r)===place&&destination(r)&&destination(r)!==place)]);
   quantities.push([t('Dentro do estado','Within the state'),sum(r=>origin(r)===place&&destination(r)===place)]);
  }else for(const [attr,label]of [['gtaIncoming',t('Entrando no município','Entering the municipality')],['gtaOutgoing',t('Saindo do município','Leaving the municipality')],['gtaInternal',t('Dentro do município','Within the municipality')]]){
   const el=[...flows.querySelectorAll('.beef-distance')].find(x=>x.dataset[attr]!==undefined);if(el)quantities.push([label,Number(el.dataset[attr])]);
  }
  const panel=document.createElement('figure');panel.className='gta-flow-overview flow-visual';
  const name=state?place||'':chosen?.nome||place||'',maximumTotal=Math.max(0,...quantities.map(q=>q[1]||0));
  const shortLabels=[t('Entrada de gado','Cattle inflows'),t('Saída de gado','Cattle outflows'),t('Movimento interno','Internal movements')];
  const explanation=[t('De outros locais para ','From other places to ')+name,t('De ','From ')+name+t(' para outros locais',' to other places'),t('Origem e destino em ','Origin and destination in ')+name];
  panel.innerHTML='<figcaption><h4>'+t('O caminho do gado nos registros','Cattle movements in the records')+'</h4><p class="flow-scope-label">'+esc(name)+' · '+flows.dataset.gtaYear+' · '+(state?t('Estado inteiro','Whole state'):t('Município selecionado','Selected municipality'))+'</p></figcaption><p class="flow-unit">'+t('Quantidade de cabeças declaradas em guias de trânsito','Cattle heads declared in transit permits')+'</p>'+(quantities.length?'<div class="flow-map">'+quantities.map(([label,value],i)=>'<section class="flow-lane" data-flow-total="'+(value??'')+'"><span class="flow-direction" aria-hidden="true">'+['→','→','↻'][i]+'</span><div><h5>'+shortLabels[i]+'</h5><p>'+esc(explanation[i])+'</p></div><strong title="'+(value===null?'':value.toLocaleString(en()?'en-US':'pt-BR'))+'">'+(value===null?t('Sem registro','No record'):friendlyNumber(value))+'</strong><span class="flow-total-track" aria-hidden="true"><i style="width:'+(maximumTotal&&value!==null?100*value/maximumTotal:0)+'%"></i></span></section>').join('')+'</div>':'<p>'+t('Não há registros disponíveis para estes filtros. Isso não significa ausência de transporte.','No records are available for these filters. This does not mean no transport occurred.')+'</p>')+'<p class="reading-footnote">'+t('Um mesmo animal pode entrar em mais de uma guia. Estes números não são o tamanho do rebanho nem uma contagem de animais únicos.','The same animal may appear in more than one permit. These numbers are not herd size or a count of unique animals.')+'</p>';
  if(flows.dataset.gtaSource==='pa'&&['2023','2024'].includes(flows.dataset.gtaYear)){const warning=document.createElement('p');warning.className='flow-coverage-warning';warning.textContent=t('Atenção às entradas: faltam muitos registros de outros estados para o Pará. Um número pequeno aqui não significa pouca entrada de gado.','Inflows are incomplete: many records from other states into Pará are missing. A small number here does not mean few cattle arrived.');panel.querySelector('.flow-scope-label').after(warning);}
  flows.querySelector('.gta-controls').after(panel);
  const maximum=Math.max(0,...routes.map(r=>Number(r.dataset.gtaHeads)));
  const groupNames=[t('De onde vieram','Where they came from'),t('Para onde foram','Where they went'),t('Dentro do local selecionado','Within the selected place'),t('Local sem identificação completa','Place not fully identified')];
  const groups=[[],[],[],[]];for(const row of routes){const o=origin(row),d=destination(row);groups[o===place&&d===place?2:d===place&&o&&o!==place?0:o===place&&d&&d!==place?1:3].push(row);}
  const routing=document.createElement('div');routing.className='flow-routing';
  for(let i=0;i<groups.length;i++){const rows=groups[i];if(!rows.length)continue;const group=document.createElement('section');group.className='flow-route-group';const h=document.createElement('h5');h.textContent=groupNames[i];group.append(h);const header=document.createElement('div');header.className='flow-table-head';header.innerHTML='<span>'+t('Ligação declarada','Declared connection')+'</span><span>'+t('Cabeças','Heads')+'</span>';group.append(header);let extra;
   rows.forEach((row,j)=>{row.classList.add('flow-route');const amount=Number(row.dataset.gtaHeads),number=row.querySelector('strong');if(number){number.title=amount.toLocaleString(en()?'en-US':'pt-BR');number.textContent=friendlyNumber(amount);}const bar=document.createElement('span');bar.className='flow-route-track';bar.setAttribute('aria-hidden','true');bar.innerHTML='<i style="width:'+(maximum?100*amount/maximum:0)+'%"></i>';row.append(bar);if(j<3)group.append(row);else{if(!extra){extra=document.createElement('details');const summary=document.createElement('summary');summary.textContent=t('Ver mais ','View ')+(rows.length-3)+t(' ligações',' more connections');extra.append(summary);group.append(extra);}extra.append(row);}});routing.append(group);}
  if(routes.length){const note=document.createElement('p');note.className='reading-footnote';note.textContent=t('Barras maiores representam mais cabeças declaradas, não maior distância. Todas as ligações usam a mesma escala.','Longer bars mean more declared cattle heads, not longer distances. All connections use the same scale.');routing.prepend(note);panel.append(routing);}
  const evidence=document.createElement('details');evidence.className='flow-evidence';const summary=document.createElement('summary');summary.textContent=t('Entender a cobertura e consultar os números da fonte','Understand coverage and consult source figures');evidence.append(summary);for(const node of [...flows.children])if(node!==panel&&!node.matches(':scope>summary,.gta-controls')&&node.tagName!=='SUMMARY')evidence.append(node);flows.append(evidence);

 }
}
function propertyFigure(){
 const root=document.querySelector('.municipal-context'),source=root?.querySelector('.municipal-property-section');if(!root||!source)return;
 const rows=[...source.querySelectorAll('.property-class-row')],parse=text=>{const value=Number(en()?text.replaceAll(',',''):text.replaceAll('.','').replace(',','.'));return text.trim()!==''&&Number.isFinite(value)?value:null;};
 const values=rows.map(r=>({name:r.querySelector('h3')?.textContent||'',counts:[...r.querySelectorAll('strong')].slice(0,3).map(n=>parse(n.textContent)),uncertain:r.querySelector('.candidate-uncertain')?.textContent||''}));
 const outside=window.ATLAS_OUTSIDE_DATA?.[code()],m=typeof byCode!=='undefined'?byCode.get(code()):null;
 const signature=JSON.stringify([code(),en(),values,outside]);if(root.dataset.propertyFigure===signature&&root.querySelector('.property-unified'))return;root.dataset.propertyFigure=signature;
 let figure=root.querySelector('.property-unified');if(!figure){figure=document.createElement('figure');figure.className='property-unified';root.prepend(figure);}
 const counts=values.map(r=>r.counts[0]).filter(v=>v!==null),total=counts.length?counts.reduce((a,b)=>a+b,0):null,maximum=Math.max(0,...counts);
 const labels=[t('Com mais de 1 ha de pasto','With more than 1 ha of pasture'),t('Com vegetação nativa >6,25 ha','With native vegetation >6.25 ha'),t('Com excedente estimado de Reserva Legal','With estimated Legal Reserve surplus')];
 let area='';
 if(outside?.cohort==='active_pending'&&outside.pasture_total_ha>0){const lo=outside.outside_gt_1ha_min_pct,hi=outside.outside_gt_1ha_max_pct;if(Number.isFinite(lo)&&Number.isFinite(hi)&&lo>=0&&hi>=lo&&hi<=100){area='<section class="property-pasture-area"><h4>'+t('Quanto pasto está dentro desses cadastros?','How much pasture is within these registered properties?')+'</h4><div class="property-area-track" aria-hidden="true"><span class="inside" style="width:'+(100-hi)+'%"></span><span class="uncertain" style="width:'+(hi-lo)+'%"></span><span class="outside" style="width:'+lo+'%"></span></div><p>'+t('Fora dos cadastros selecionados: ','Outside selected registrations: ')+'<strong>'+friendlyNumber(lo,'%')+(hi-lo>=.05?'–'+friendlyNumber(hi,'%'):'')+'%</strong>. '+t('A área sobreposta é contada uma vez.','Overlapping areas are counted once.')+'</p><small>'+t('Base territorial: ','Territorial base: ')+friendlyNumber(outside.pasture_total_ha)+' ha · '+t('pasto de 2025. Verde: dentro; cinza: fora; hachura: qualificação incerta.','2025 pasture. Green: inside; grey: outside; hatching: uncertain classification.')+'</small></section>';}}
 const n=v=>v===null||v===undefined?t('Sem dado','No data'):friendlyNumber(v);
 const exact=v=>v===null||v===undefined?'':Number(v).toLocaleString(en()?'en-US':'pt-BR');
 figure.innerHTML='<figcaption><h3>'+t('Os imóveis em uma visão','Properties at a glance')+'</h3><p>'+esc(m?.nome||'')+' · '+(total===null?t('Sem contagem de imóveis processada neste recorte.','Property counts have not been processed in this scope.'):'<strong>'+n(total)+'</strong> '+t('cadastros ativos ou pendentes com mais de 1 ha de pasto.','active or pending registrations with more than 1 ha of pasture.'))+'</p></figcaption>'+(values.length?'<div class="property-chart-legend">'+labels.map((l,i)=>'<span><i class="property-tone-'+i+'"></i>'+l+'</span>').join('')+'</div><p class="property-nesting">'+t('Os grupos coloridos estão dentro do total de cada linha. Não devem ser somados.','The coloured groups are within each row total. Do not add them together.')+'</p><table class="property-figure-rows"><thead><tr><th scope="col">'+t('Tamanho do imóvel','Property size')+'</th>'+labels.map(l=>'<th scope="col">'+l+'</th>').join('')+'</tr></thead><tbody>'+values.map(r=>'<tr class="property-figure-row" data-property-total="'+(r.counts[0]??'')+'"><th scope="row"><h4>'+esc(r.name)+'</h4><div class="property-size-track" aria-hidden="true">'+r.counts.map((v,i)=>v===null?'':'<span class="property-tone-'+i+'" style="width:'+(maximum?100*v/maximum:0)+'%"></span>').join('')+'</div></th>'+r.counts.map((v,i)=>'<td><strong title="'+exact(v)+'">'+n(v)+'</strong>'+(i===2&&r.uncertain?'<small>'+esc(r.uncertain)+'</small>':'')+'</td>').join('')+'</tr>').join('')+'</tbody></table>':'<p class="property-no-data">'+t('A ausência de resultado não significa que não existam imóveis ou pastagens.','Unavailable results do not mean that properties or pasture do not exist.')+'</p>')+area+'<p class="property-figure-note">'+t('Tamanho é a área total do imóvel, não a área de pasto. CAR é autodeclarado e não comprova titularidade. Vegetação remanescente e excedente estimado não autorizam desmatamento.','Size is total registered property area, not pasture area. CAR is self-declared and does not establish ownership. Remaining vegetation and estimated surplus do not authorise clearing.')+'</p><small>'+t('CAR de 09/10/2026 · pastagem e vegetação de 2025.','CAR snapshot 9 October 2026 · pasture and vegetation from 2025.')+'</small>';
 let details=root.querySelector(':scope>.property-source-details');if(!details){details=document.createElement('details');details.className='property-source-details';const summary=document.createElement('summary');summary.textContent=t('Ver estabelecimentos, distâncias, movimentação e bases de cálculo','View establishments, distances, movements and calculation bases');details.append(summary);for(const node of [...root.children])if(node!==figure)details.append(node);root.append(details);}else details.querySelector(':scope>summary').textContent=t('Ver estabelecimentos, distâncias, movimentação e bases de cálculo','View establishments, distances, movements and calculation bases');
}

function indicatorGuide(){
 const root=document.getElementById('indicadores')||document.getElementById('metodo');if(!root)return;
 let guide=root.querySelector('.indicator-guide');if(guide&&guide.dataset.language===(en()?'en':'pt'))return;if(!guide){guide=document.createElement('details');guide.className='indicator-guide';root.prepend(guide);}guide.dataset.language=en()?'en':'pt';
 const data=[
 [t('Contexto','Context'),'S1',t('Tamanho do rebanho','Cattle herd size'),t('Ajuda a dimensionar a pecuária e o alcance de uma ação.','Helps assess the scale of cattle farming and the reach of an intervention.')],
 [t('Oportunidade','Opportunity'),'S2',t('Pasto com vigor baixo ou médio','Low- or medium-vigor pasture'),t('Uma proporção maior pode indicar mais espaço para melhorar o pasto.','A larger share may indicate more scope for pasture improvement.')],
 [t('Condições','Conditions'),'S3',t('Pasto próximo de frigoríficos','Pasture near slaughterhouses'),t('A proximidade pode facilitar o acesso ao mercado; não comprova fornecimento.','Proximity may improve market access; it does not establish a supply relationship.')],
 [t('Condições','Conditions'),'S4',t('Frequência histórica de seca','Historical drought frequency'),t('Secas frequentes podem dificultar a recuperação e reduzir seu retorno.','Frequent droughts may hinder pasture recovery and reduce returns.')],
 [t('Condições','Conditions'),'S5',t('Acesso à assistência técnica','Access to technical assistance'),t('Orientação técnica pode facilitar a adoção de práticas e o manejo.','Technical advice may help farmers adopt practices and improve management.')],
 [t('Condições','Conditions'),'S6',t('Escolaridade de quem dirige o estabelecimento','Education of farm managers'),t('A escolaridade pode facilitar a adoção de práticas, mas não garante o resultado.','Education may help with adoption of practices, but does not guarantee results.')],
 [t('Pressão ambiental','Environmental pressure'),'S7',t('Perda anual de vegetação nativa','Annual loss of native vegetation'),t('A perda recente sinaliza pressão e necessidade de salvaguardas.','Recent loss signals pressure and a need for safeguards.')],
 [t('Pressão ambiental','Environmental pressure'),'S8',t('Conversão de vegetação em pasto','Conversion of vegetation to pasture'),t('A conversão mostra a participação da expansão do pasto na perda de vegetação.','Conversion indicates the role of pasture expansion in vegetation loss.')],
 [t('Pressão ambiental','Environmental pressure'),'S9',t('Conversão em floresta pública','Conversion in public forests'),t('A conversão sinaliza pressão sobre terras públicas e exige verificação.','Conversion signals pressure on public land and calls for further checks.')],
 [t('Pressão ambiental','Environmental pressure'),'S10',t('Termos de embargo identificados','Identified embargo records'),t('Mais registros indicam maior necessidade de verificar restrições ambientais.','More records indicate a greater need to check environmental restrictions.')],
 [t('Pressão ambiental','Environmental pressure'),'S11',t('Área administrativa dos embargos','Administrative area of embargoes'),t('Uma razão maior em relação ao município indica restrições a investigar; pode haver sobreposição.','A higher ratio to municipal area indicates restrictions to investigate; areas may overlap.')]
 ];
 guide.innerHTML='<summary>'+t('Como os grupos e os 11 indicadores se relacionam','How the groups and 11 indicators relate')+'</summary><p>'+t('Estas são hipóteses de interpretação. Orientam a análise e precisam ser testadas; não demonstram causa e efeito.','These are interpretive hypotheses. They guide analysis and require testing; they do not establish cause and effect.')+'</p><table class="indicator-guide-table"><thead><tr><th>'+t('Grupo','Group')+'</th><th>'+t('Indicador','Indicator')+'</th><th>'+t('Hipótese: por que olhar esse dado?','Hypothesis: why examine this measure?')+'</th></tr></thead><tbody>'+data.map(r=>'<tr><th scope="row">'+r[0]+'</th><td><b>'+r[1]+'</b> · '+r[2]+'</td><td>'+r[3]+'</td></tr>').join('')+'</tbody></table><p>'+t('Oportunidade usa S2. Condições combinam S3–S6. Pressão combina S7–S11. S1 mostra o contexto e fica fora dessas combinações. São três leituras separadas, sem uma nota geral.','Opportunity uses S2. Conditions combine S3–S6. Pressure combines S7–S11. S1 provides context and is excluded from these combinations. These are three separate readings, with no overall score.')+'</p>';
}

function factorTable(){
 const root=document.getElementById('indicadores'),groups=document.getElementById('indicator-groups');if(!root||!groups)return;
 const entries=[...groups.querySelectorAll('.lab-result')].map(el=>{const score=el.querySelector('.score-separated-result'),h=el.querySelector('.indicator-name');if(!score||!h)return null;const title=h.cloneNode(true);title.querySelectorAll('.lab-date,.raw-unit').forEach(n=>n.remove());return {id:+score.dataset.rawScale.split('-')[0],title:title.textContent.trim(),year:h.querySelector('.lab-date')?.textContent||'',value:score.querySelector('.observed-result strong')?.textContent||'',label:[...score.querySelectorAll('.intensity-heading>*')].map(n=>n.textContent).join(' · ')||(score.dataset.scaleKind==='context'?t('Contexto, sem nota','Context, no score'):t('Sem classificação','Not classified')),level:+score.dataset.intensityLevel||0,color:score.dataset.color||'#52635c',target:el.id};}).filter(Boolean);
 if(entries.length!==11)return;
 let table=root.querySelector('.factor-table');const sig=JSON.stringify([code(),en(),entries]);if(table?.dataset.signature===sig)return;
 if(!table){table=document.createElement('table');table.className='factor-table';root.prepend(table);}table.dataset.signature=sig;
 const meaning={1:t('Dimensão da pecuária local.','Scale of local cattle farming.'),2:t('Parcela do pasto com vigor baixo ou médio.','Share of pasture with low or medium vigor.'),3:t('Pasto próximo de frigoríficos, em linha reta.','Pasture near slaughterhouses, in a straight line.'),4:t('Seca no histórico, não previsão.','Historical drought, not a forecast.'),5:t('Estabelecimentos atendidos por assistência.','Establishments receiving technical assistance.'),6:t('Dirigentes com ensino médio ou superior.','Managers with secondary or higher education.'),7:t('Perda fora de terras indígenas e proteção integral.','Loss outside Indigenous lands and strict protected areas.'),8:t('Conversão de vegetação em pastagem.','Conversion of vegetation to pasture.'),9:t('Conversão no recorte de floresta pública.','Conversion within public forest coverage.'),10:t('Termos identificados, não fazendas distintas.','Identified terms, not distinct farms.'),11:t('Área administrativa, com possíveis sobreposições.','Administrative area, with possible overlaps.')};
 const headings={1:t('Contexto · tamanho da pecuária','Context · cattle farming size'),2:t('Oportunidade · pasto a melhorar','Opportunity · pasture to improve'),3:t('Condições · o que pode facilitar ou dificultar','Conditions · what may help or hinder'),7:t('Pressão ambiental · onde verificar com cuidado','Environmental pressure · where to check carefully')};
 table.innerHTML='<caption>'+t('Leia o valor e depois sua interpretação. Os grupos respondem a perguntas diferentes; não há nota geral.','Read the value, then its interpretation. Groups answer different questions; there is no overall score.')+'</caption><thead><tr><th scope="col">'+t('Fator','Factor')+'</th><th scope="col">'+t('Valor observado','Observed value')+'</th><th scope="col">'+t('O que isso indica','What it indicates')+'</th></tr></thead><tbody>'+entries.map(r=>(headings[r.id]?'<tr class="factor-group"><th colspan="3" scope="rowgroup">'+headings[r.id]+'</th></tr>':'')+'<tr data-factor="'+r.id+'"><th scope="row">'+esc(r.title)+'<small>'+esc(r.year)+'</small><button type="button" data-factor-detail="'+r.target+'">'+t('Entender','Explain')+'</button></th><td class="factor-value">'+esc(r.value)+'</td><td><strong class="factor-class">'+esc(r.label)+'</strong>'+(r.id>1?'<span class="factor-meter" aria-hidden="true">'+[1,2,3,4,5].map(n=>'<i style="background:'+(n<=r.level?r.color:'#e2e7e4')+'"></i>').join('')+'</span>':'')+'<span class="factor-meaning">'+meaning[r.id]+'</span></td></tr>').join('')+'</tbody>';
 let details=root.querySelector(':scope>.factor-evidence');if(!details){details=document.createElement('details');details.className='factor-evidence';const summary=document.createElement('summary');details.append(summary);const legend=document.getElementById('municipal-scale-guide');if(legend)details.append(legend);details.append(groups);table.after(details);}put(details.querySelector(':scope>summary'),t('Ver cálculos, fontes e comparações dos 11 indicadores','View calculations, sources and comparisons for the 11 indicators'));
 table.querySelectorAll('[data-factor-detail]').forEach(button=>button.onclick=()=>{details.open=true;const target=document.getElementById(button.dataset.factorDetail);target?.scrollIntoView({block:'start'});});
}

function apply(){
 if(!(window.ATLAS_ACTIVE_SHARE_UI_READY||window.ATLAS_RANKING_READY||window.ATLAS_PAGE_READY==='supply_chain'))return;
 navigation();technical();ranking();sheet();modalHelp();categories();selectedLabels();informationDesign();rankingIntensity();simplifyNumbers();supplyEvidence();cattleFlows();propertyFigure();factorTable();indicatorGuide();
 document.querySelectorAll('.summary-card').forEach(card=>{const dot=card.querySelector('.dot');if(dot)card.style.setProperty('--diagnosis-color',getComputedStyle(dot).backgroundColor);});
 document.querySelectorAll('#chain-access-distances> .wrap>h2').forEach(h=>put(h,t('Distâncias entre locais mapeados','Distances between mapped locations')));
 window.ATLAS_CLARITY_READY=true;
}
new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
document.addEventListener('change',schedule);document.addEventListener('input',schedule);document.addEventListener('click',schedule);window.addEventListener('hashchange',schedule);
let attempts=0;const timer=setInterval(()=>{apply();if((window.ATLAS_ACTIVE_SHARE_UI_READY||window.ATLAS_RANKING_READY||(window.ATLAS_PAGE_READY==='supply_chain'&&document.querySelector('#chain-access-distances [data-chain-results]')))&&document.querySelector('.stepnav a[href*="cadeia.html"]')){clearInterval(timer);for(const node of document.querySelectorAll('.stepnav,#rank-list,#map-result-values,#chain-access-distances [data-chain-results],#summary-cards,#indicator-groups,.map-source-caption,#metodo,.municipal-context,.municipal-facts'))new MutationObserver(schedule).observe(node,{childList:true,subtree:true});}else if(++attempts>100)clearInterval(timer);},100);
apply();
})();
