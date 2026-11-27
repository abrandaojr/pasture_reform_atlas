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
 document.querySelectorAll('#atlas-technical-details,#chain-technical-details').forEach(n=>n.remove());
 document.querySelectorAll('.map-note [data-pt]').forEach(n=>{if(n.dataset.pt.includes('EPSG:3857'))n.remove();});
}
function navigation(){
 const path=location.pathname.split('/').pop(),hash=location.hash;
 const names={map:t('Mapa','Map'),municipality:t('Diagnóstico','Diagnosis'),ranking:'Ranking',chain:t('Cadeia produtiva','Supply chain'),sources:t('Fontes','Sources'),method:t('Método','Method')};
 const targets={map:['Atlas.html','#map-workspace'],municipality:['municipio.html','#resumo'],ranking:['ranking.html',''],chain:['cadeia.html',''],sources:['fontes.html',''],method:['metodo.html','']};
 const active=path==='municipio.html'?'municipality':path==='ranking.html'?'ranking':path==='cadeia.html'?'chain':path==='fontes.html'?'sources':path==='metodo.html'?'method':'map';
 document.querySelectorAll('a[href*="docs.google.com/presentation"]').forEach(a=>a.remove());
 for(const nav of document.querySelectorAll('.stepnav'))for(const a of nav.querySelectorAll('a')){
  if(a.hasAttribute('data-atlas-presentation'))continue;
  const key=a.querySelector('[data-i18n]')?.dataset.i18n;let role=a.dataset.clarityRole||({navSummary:'map',navIndicators:'municipality',navEvidence:'sources',navMethod:'method'})[key]||({map:'map',municipality:'municipality',ranking:'ranking',sources:'sources',method:'method'})[a.dataset.nav];
  if(!role&&a.hasAttribute('data-supply-chain-tab'))role='chain';
  if(!role&&a.hasAttribute('data-ranking-tab'))role='ranking';
  if(!role){const u=new URL(a.href,location.href),page=u.pathname.split('/').pop();role=u.hash==='#evidencias'?'sources':u.hash==='#metodo'?'method':page==='municipio.html'?'municipality':page==='ranking.html'?'ranking':page==='cadeia.html'?'chain':'map';}
  a.dataset.clarityRole=role;put(a.querySelector('[data-i18n]')||a,names[role]);const href=link(...targets[role]);if(a.getAttribute('href')!==href)a.setAttribute('href',href);
  if(role===active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 }
 for(const a of document.querySelectorAll('a[href]')){const u=new URL(a.href,location.href);if(u.origin===location.origin&&['#evidencias','#metodo'].includes(u.hash)){const href=link(u.hash==='#evidencias'?'fontes.html':'metodo.html');if(a.getAttribute('href')!==href)a.setAttribute('href',href);}}
 for(const nav of document.querySelectorAll('.stepnav'))if(!nav.dataset.pageRouting){nav.dataset.pageRouting='true';nav.addEventListener('click',e=>{const a=e.target.closest('a[data-clarity-role]');if(a&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey&&e.button===0){e.preventDefault();e.stopImmediatePropagation();location.assign(a.href);}},true);}
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
 figure.innerHTML='<figcaption><h3>'+t('Os imóveis em uma visão','Properties at a glance')+'</h3><p>'+esc(m?.nome||'')+' · '+(total===null?t('Sem contagem de imóveis processada neste recorte.','Property counts have not been processed in this scope.'):'<strong>'+n(total)+'</strong> '+t('cadastros ativos ou pendentes com mais de 1 ha de pasto.','active or pending registrations with more than 1 ha of pasture.'))+'</p></figcaption>'+(values.length?'<div class="property-chart-legend">'+labels.map((l,i)=>'<span><i class="property-tone-'+i+'"></i>'+l+'</span>').join('')+'</div><p class="property-nesting">'+t('Os grupos coloridos estão dentro do total de cada linha. Não devem ser somados.','The coloured groups are within each row total. Do not add them together.')+'</p><table class="property-figure-rows"><thead><tr><th scope="col">'+t('Tamanho do imóvel','Property size')+'</th>'+labels.map(l=>'<th scope="col">'+l+'</th>').join('')+'</tr></thead><tbody>'+values.map(r=>'<tr class="property-figure-row" data-property-total="'+(r.counts[0]??'')+'"><th scope="row"><h4>'+esc(r.name)+'</h4><div class="property-size-track" aria-hidden="true">'+r.counts.map((v,i)=>v===null?'':'<span class="property-tone-'+i+'" style="width:'+(maximum?100*v/maximum:0)+'%"></span>').join('')+'</div></th>'+r.counts.map((v,i)=>'<td><strong title="'+exact(v)+'">'+n(v)+'</strong>'+(i===2&&r.uncertain?'<small>'+esc(r.uncertain)+'</small>':'')+'</td>').join('')+'</tr>').join('')+'</tbody></table>':'<p class="property-no-data">'+t('A ausência de resultado não significa que não existam imóveis ou pastagens.','Unavailable results do not mean that properties or pasture do not exist.')+'</p>')+area+'<p class="property-figure-note">'+t('Tamanho é a área total do imóvel, não a área de pasto. CAR é autodeclarado e não comprova titularidade. Vegetação remanescente e excedente estimado não autorizam desmatamento.','Size is total registered property area, not pasture area. CAR is self-declared and does not establish ownership. Remaining vegetation and estimated surplus do not authorise clearing.')+'</p><small>'+t('CAR/SICAR de 09/10/2026 · pastagem e vegetação de 2025. Referência para o tratamento dos CARs rurais: Brandão Jr., A.; Barreto, P.; Pereira, R.; Lima, C. T. de. Most pasture on farms without mapped deforestation is close to Amazon slaughterhouses. Manuscrito para o Simpósio Brasileiro de Sensoriamento Remoto (SBSR).','CAR/SICAR snapshot 9 October 2026 · pasture and vegetation from 2025. Reference for rural CAR processing: Brandão Jr., A.; Barreto, P.; Pereira, R.; Lima, C. T. de. Most pasture on farms without mapped deforestation is close to Amazon slaughterhouses. Manuscript for the Brazilian Symposium on Remote Sensing (SBSR).')+'</small>';
 let details=root.querySelector(':scope>.property-source-details');if(!details){details=document.createElement('details');details.className='property-source-details';const summary=document.createElement('summary');summary.textContent=t('Ver estabelecimentos, distâncias, movimentação e bases de cálculo','View establishments, distances, movements and calculation bases');details.append(summary);for(const node of [...root.children])if(node!==figure)details.append(node);root.append(details);}else details.querySelector(':scope>summary').textContent=t('Ver estabelecimentos, distâncias, movimentação e bases de cálculo','View establishments, distances, movements and calculation bases');
}

function municipalNavigation(){
 const properties=document.querySelector('.municipal-question[data-question="properties"]'),indicators=document.querySelector('.municipal-question[data-question="indicators"]');
 if(properties&&indicators&&!(indicators.compareDocumentPosition(properties)&Node.DOCUMENT_POSITION_FOLLOWING))properties.before(indicators);
 if(properties){for(const node of document.querySelectorAll('#chain-access-distances,.official-gta-context')){if(!properties.contains(node))properties.append(node);}}
 const first=document.querySelector('.municipal-question');if(!first)return;let nav=document.querySelector('.municipal-reading-nav');if(!nav){nav=document.createElement('nav');nav.className='municipal-reading-nav';first.before(nav);}const signature=en()?'en':'pt';if(nav.dataset.language!==signature){nav.dataset.language=signature;nav.setAttribute('aria-label',t('Explorar a ficha municipal','Explore the municipal profile'));
 const rows=[['overview',t('1. Tamanho da pecuária','1. Size of cattle farming'),t('Pasto, rebanho e cadastros rurais.','Pasture, cattle herd and rural registrations.')],['diagnosis',t('2. Resumo do diagnóstico','2. Diagnosis summary'),t('Oportunidade, condições e pressão ambiental.','Opportunity, conditions and environmental pressure.')],['indicators',t('3. Detalhe do diagnóstico','3. Diagnosis details'),t('Valores, significado e fontes dos 11 indicadores.','Values, meanings and sources for the 11 indicators.')],['properties',t('4. Características das fazendas e cadeia da pecuária','4. Farm characteristics and cattle supply chain'),t('Fazendas, distâncias entre locais e fluxo de gado.','Farms, distances between locations and cattle movements.')]];
 nav.innerHTML='<table><thead><tr><th>'+t('O que você quer saber?','What would you like to know?')+'</th><th>'+t('O que vai encontrar','What you will find')+'</th><th><span class="sr-only">'+t('Abrir seção','Open section')+'</span></th></tr></thead><tbody>'+rows.map(r=>'<tr><th scope="row">'+r[1]+'</th><td>'+r[2]+'</td><td><button type="button" data-open-question="'+r[0]+'">'+t('Ver','View')+'</button></td></tr>').join('')+'</tbody></table>';
 nav.querySelectorAll('button').forEach(button=>button.onclick=()=>{const target=document.querySelector('.municipal-question[data-question="'+button.dataset.openQuestion+'"]');if(target){target.open=true;target.scrollIntoView({block:'start'});}});}
 document.documentElement.classList.add('has-reading-nav');
}

function diagnosisTable(){
 const root=document.getElementById('summary-cards');if(!root)return;const cards=[...root.querySelectorAll('.summary-card')];if(cards.length!==3)return;
 const questions=[t('Quanto pasto pode ser melhorado?','How much pasture could be improved?'),t('As condições ajudam a recuperar o pasto?','Do local conditions support pasture recovery?'),t('Qual é a pressão ambiental?','How high is environmental pressure?')];
 const rows=cards.map((c,i)=>[questions[i],c.querySelector('.summary-status')?.textContent.trim()||t('Sem dado','No data'),c.querySelector('.summary-description')?.innerHTML||'',c.querySelector('.summary-coverage:not([hidden])')?.textContent||'']);const sig=JSON.stringify([code(),en(),rows]);let table=root.querySelector('.diagnosis-table');if(table?.dataset.signature===sig)return;if(!table){table=document.createElement('table');table.className='diagnosis-table';root.prepend(table);}table.dataset.signature=sig;
 table.innerHTML='<thead><tr><th scope="col">'+t('Pergunta','Question')+'</th><th scope="col">'+t('Resultado','Result')+'</th><th scope="col">'+t('Como interpretar o resultado','How to interpret the result')+'</th></tr></thead><tbody>'+rows.map((r,i)=>'<tr><th scope="row">'+r[0]+'</th><td><strong>'+esc(r[1])+'</strong>'+(r[3]?'<small>'+esc(r[3])+'</small>':'')+'</td><td>'+r[2]+'</td></tr>').join('')+'</tbody>';
 for(const c of cards)c.hidden=true;
}

function overviewTable(){
 const root=document.querySelector('.municipal-facts'),grid=root?.querySelector('.municipal-facts-grid');if(!root||!grid)return;
 const cards=[...grid.querySelectorAll('.municipal-count-card')],m=typeof byCode!=='undefined'?byCode.get(code()):null;
 const rows=cards.map((c,i)=>{const v=c.querySelector('strong')?.cloneNode(true);v?.querySelectorAll('small').forEach(n=>n.remove());let value=v?.textContent||t('Sem dado','No data');if(i===0&&Number.isFinite(m?.total_pastagem_ha))value=friendlyNumber(m.total_pastagem_ha)+(m.total_pastagem_ha>=1e6?t(' de ha',' ha'):' ha');if(i===1&&Number.isFinite(m?.rebanho_bovino_cab))value=friendlyNumber(m.rebanho_bovino_cab)+(m.rebanho_bovino_cab>=1e6?t(' de cabeças',' head'):t(' cabeças',' head'));return [c.querySelector(':scope>span')?.textContent||'',value];});
 const meaning=[t('Área identificada como pastagem pelo MapBiomas.','Area mapped as pasture by MapBiomas.'),t('Número de bovinos registrado pelo IBGE.','Number of cattle recorded by IBGE.'),t('Registros no Cadastro Ambiental Rural. Um cadastro não é um título de propriedade.','Rural Environmental Registry records. A registration is not a property title.'),t('Registros ativos ou pendentes que contêm mais de 1 hectare de pasto.','Active or pending registrations containing more than 1 hectare of pasture.'),t('Percentual do pasto fora dos cadastros ativos ou pendentes com mais de 1 hectare de pasto.','Share of pasture outside active or pending registrations with more than 1 hectare of pasture.')];
 if(m&&typeof byCode!=='undefined'){
  const peers=[...byCode.values()].filter(x=>x.uf===m.uf);
  for(const [index,field,unitPt,unitEn]of [[0,'total_pastagem_ha','da área de pastagem','of the pasture area'],[1,'rebanho_bovino_cab','do rebanho','of the cattle herd']]){
   const observed=peers.filter(x=>Number.isFinite(x[field])&&x[field]>=0),value=m[field],total=observed.reduce((n,x)=>n+x[field],0);
   if(Number.isFinite(value)&&total>0){const rank=1+observed.filter(x=>x[field]>value).length,share=100*value/total;const pct=new Intl.NumberFormat(en()?'en-US':'pt-BR',{maximumFractionDigits:share<1?2:1}).format(share);
    meaning[index]=t('Representa ','Accounts for ')+pct+'% '+t(unitPt,unitEn)+t(' nos municípios com dados de ',' across municipalities with data in ')+esc(m.uf)+'. '+t('Posição ','Rank ')+rank+t(' de ',' of ')+observed.length+t(' no estado, do maior para o menor valor.',' in the state, from highest to lowest value.');
   }
  }
 }
 meaning[2]=t('Contagem de cadastros rurais, não de fazendas de gado. Inclui imóveis com diferentes usos da terra; o CAR é um registro ambiental autodeclarado.','Count of rural registrations, not cattle farms. Includes properties with different land uses; CAR is a self-declared environmental registration.');
 meaning[3]=t('Recorte dos CARs usado para estudar imóveis com pastagem: situação ativa ou pendente e mais de 1 ha de pasto mapeado.','The CAR subset used to study properties with pasture: active or pending status and more than 1 ha of mapped pasture.');
 meaning[4]=t('Parcela da pastagem municipal que fica fora desse recorte de CARs. Ajuda a avaliar quanto pasto a análise dos imóveis abrange.','Share of municipal pasture outside this CAR subset. Shows how much pasture the property analysis covers.');
 for(const i of [3,4])if(rows[i]&&/Sem resultado|Sem dado|No result|No data/i.test(rows[i][1])){
  rows[i][1]=t('Não disponível','Not available');meaning[i]+=' '+t('Ainda não há resultado disponível para este município. Pode haver imóveis e pasto mesmo sem esse dado.','This result is not yet available for this municipality. Properties and pasture may still be present.');
 }
 let table=root.querySelector('.overview-table');const signature=JSON.stringify([code(),en(),rows]);if(table?.dataset.signature===signature)return;if(!table){table=document.createElement('table');table.className='overview-table';root.prepend(table);}table.dataset.signature=signature;
 table.innerHTML='<thead><tr><th scope="col">'+t('Medida','Measure')+'</th><th scope="col">'+t('Valor','Value')+'</th><th scope="col">'+t('Como interpretar o resultado','How to interpret the result')+'</th></tr></thead><tbody>'+rows.map((r,i)=>'<tr><th scope="row">'+esc(r[0])+'</th><td><strong>'+esc(r[1])+'</strong></td><td>'+meaning[i]+'</td></tr>').join('')+'</tbody>';
 grid.hidden=true;root.querySelector('.municipal-density-caution')?.setAttribute('hidden','');
}
function municipalityLocator(){
 const head=document.querySelector('.municipality'),m=typeof byCode!=='undefined'?byCode.get(code()):null;if(!head||!m)return;if(!window.ATLAS_LOCATION_POINTS){if(!window.ATLAS_LOCATION_LOADING){window.ATLAS_LOCATION_LOADING=true;fetch('assets/chain_access/municipal_locations.json').then(r=>r.json()).then(data=>{window.ATLAS_LOCATION_POINTS=data;schedule();}).catch(()=>{window.ATLAS_LOCATION_LOADING=false;});}return;}const point=window.ATLAS_LOCATION_POINTS[code()];if(!point)return;const [latitude,longitude]=point;
 let locator=head.querySelector('.municipality-locator');if(!locator){locator=document.createElement('figure');locator.className='municipality-locator';head.append(locator);}const sig=code()+'|'+en();if(locator.dataset.signature===sig)return;locator.dataset.signature=sig;
 const merc=lat=>Math.log(Math.tan(Math.PI/4+lat*Math.PI/360)),x=100*(longitude+75)/42,y=100*(merc(6)-merc(latitude))/(merc(6)-merc(-35));
 locator.innerHTML='<div class="locator-map" role="img" aria-label="'+esc(t('Localização de ','Location of ')+m.nome+t(' no Brasil',' in Brazil'))+'"><span style="left:'+x+'%;top:'+y+'%"></span></div><figcaption>'+t('No Brasil','In Brazil')+'</figcaption>';
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

function conciseCalculations(details,groups){
 groups.hidden=true;
 const legend=document.getElementById('municipal-scale-guide');if(legend)legend.hidden=true;
 let box=details.querySelector('.calculation-guide');if(!box){box=document.createElement('div');box.className='calculation-guide';details.append(box);}
 const signature=en()?'en':'pt';if(box.dataset.language===signature)return;box.dataset.language=signature;
 const rows=[["Rebanho", "Cattle herd", "Usa o número de bovinos informado pelo IBGE.", "Uses the cattle count reported by IBGE.", "10 mil bovinos: rebanho de 10 mil cabeças.", "10 thousand cattle: a herd of 10 thousand head."], ["Vigor do pasto", "Pasture vigor", "Divide o pasto de vigor baixo ou médio pelo pasto total e multiplica por cem.", "Divides low- or medium-vigor pasture by total pasture, then multiplies by one hundred.", "60 ha em 100 ha de pasto: 60%.", "60 ha out of 100 ha of pasture: 60%."], ["Acesso a frigoríficos", "Slaughterhouse access", "Divide o pasto até a distância de referência pelo pasto com distância observada e multiplica por cem. A referência é a mediana da mesorregião.", "Divides pasture within the reference distance by pasture with observed distances, then multiplies by one hundred. The reference is the mesoregional median.", "30 ha próximos em 100 ha observados: 30%.", "30 ha nearby out of 100 ha observed: 30%."], ["Seca", "Drought", "Usa a frequência histórica da FAO. Em cada pixel, considera a maior frequência entre as duas estações; depois calcula a média municipal. A nota é cem menos essa frequência.", "Uses FAO historical frequency. At each pixel, selects the higher frequency of the two growing seasons, then calculates the municipal mean. The score is one hundred minus that frequency.", "Frequência de 10%: nota 90. Não é previsão.", "Frequency of 10%: score 90. This is not a forecast."], ["Assistência técnica", "Technical assistance", "Divide os estabelecimentos com assistência pelo total considerado no Censo e multiplica por cem.", "Divides establishments receiving assistance by the Census total considered, then multiplies by one hundred.", "20 atendidos em 100 estabelecimentos: 20%.", "20 served out of 100 establishments: 20%."], ["Escolaridade", "Education", "Divide os estabelecimentos cujo dirigente tem ensino médio ou superior pelo total considerado e multiplica por cem.", "Divides establishments whose manager has secondary or higher education by the total considered, then multiplies by one hundred.", "40 em 100 estabelecimentos: 40%.", "40 out of 100 establishments: 40%."], ["Perda anual de vegetação", "Annual vegetation loss", "Soma a primeira perda de vegetação de 2023 a 2025, divide por três e pela vegetação de 2022 observada nos três anos; multiplica por cem. Exclui terras indígenas e proteção integral.", "Adds first vegetation loss from 2023 to 2025, divides by three and by 2022 vegetation observed in all three years, then multiplies by one hundred. Excludes Indigenous lands and strict protected areas.", "6 ha perdidos em três anos, de 100 ha iniciais: 2% ao ano.", "6 ha lost in three years from 100 ha initially: 2% per year."], ["Conversão em pasto", "Conversion to pasture", "Divide a vegetação convertida em pasto pela vegetação suprimida no recorte de cálculo e multiplica por cem. O Pampa fica fora deste indicador.", "Divides vegetation converted to pasture by vegetation cleared in the calculation area, then multiplies by one hundred. Pampa is excluded from this indicator.", "50 ha convertidos em 100 ha suprimidos: 50%.", "50 ha converted out of 100 ha cleared: 50%."], ["Floresta pública não destinada", "Undesignated public forest", "Divide a conversão em pasto de 2022 a 2025 pela área de floresta pública não destinada mapeada e multiplica por cem.", "Divides conversion to pasture from 2022 to 2025 by mapped undesignated public forest area, then multiplies by one hundred.", "1 ha convertido em 100 ha do recorte público: 1%.", "1 ha converted out of 100 ha of public forest coverage: 1%."], ["Termos de embargo", "Embargo records", "Conta termos com identificador conhecido. Para a nota, ordena municípios pela contagem e considera sua participação acumulada nos termos do país.", "Counts records with known identifiers. Scoring orders municipalities by count and uses their cumulative share of national records.", "Dez termos podem envolver menos de dez imóveis.", "Ten records may involve fewer than ten properties."], ["Área administrativa de embargos", "Administrative embargo area", "Divide a soma dos hectares administrativos dos embargos pela área municipal e multiplica por cem. Pode haver sobreposições.", "Divides the sum of administrative embargo hectares by municipal area, then multiplies by one hundred. Areas may overlap.", "300 ha administrativos em 10 mil ha municipais: 3%.", "300 administrative ha in a 10 thousand ha municipality: 3%."]];
 box.innerHTML='<p>'+t('Como cada valor é calculado. Exemplos ilustrativos, não valores do município selecionado.','How each value is calculated. Examples are illustrative, not values for the selected municipality.')+'</p><table class="indicator-guide-table"><thead><tr><th>'+t('Indicador','Indicator')+'</th><th>'+t('Cálculo em palavras','Calculation in words')+'</th><th>'+t('Exemplo curto','Short example')+'</th></tr></thead><tbody>'+rows.map((r,i)=>'<tr id="calculation-s'+(i+1)+'"><th scope="row">S'+(i+1)+' · '+t(r[0],r[1])+'</th><td>'+t(r[2],r[3])+'</td><td>'+t(r[4],r[5])+'</td></tr>').join('')+'</tbody></table><p>'+t('Classificação: S2, S5, S6, S7, S8, S9 e S11 comparam os percentuais municipais em cinco faixas nacionais. S3 usa o percentual observado; S4 desconta a frequência de seca de cem. S10 usa participação acumulada. S1 é apenas contexto.','Classification: S2, S5, S6, S7, S8, S9 and S11 compare municipal percentages in five national bands. S3 uses the observed percentage; S4 subtracts drought frequency from one hundred. S10 uses cumulative shares. S1 is context only.')+'</p><p>'+t('Condições: divide as notas por cem, multiplica acesso, seca e a média de assistência e escolaridade; multiplica o resultado por duzentos. Pressão: calcula a média das notas disponíveis de S7 a S11 e multiplica por cinco; mais pontos significam menor pressão. Dados ausentes reduzem a cobertura e podem afetar a comparação.','Conditions: divides scores by one hundred, multiplies access, drought and the mean of assistance and education, then multiplies by two hundred. Pressure: takes the mean of available S7 to S11 scores and multiplies by five; more points mean lower pressure. Missing data reduce coverage and can affect comparisons.')+'</p><a href="Atlas.html#metodo">'+t('Método completo e fontes','Full method and sources')+'</a>';
}

function factorTable(){
 const root=document.getElementById('indicadores'),groups=document.getElementById('indicator-groups');if(!root||!groups)return;
 const entries=[...groups.querySelectorAll('.lab-result')].map(el=>{const score=el.querySelector('.score-separated-result'),h=el.querySelector('.indicator-name');if(!score||!h)return null;const title=h.cloneNode(true);title.querySelectorAll('.lab-date,.raw-unit').forEach(n=>n.remove());return {raw:score.dataset.value!==''?Number(score.dataset.value):null,id:+score.dataset.rawScale.split('-')[0],title:title.textContent.trim(),year:h.querySelector('.lab-date')?.textContent||'',value:score.querySelector('.observed-result strong')?.textContent||'',label:[...score.querySelectorAll('.intensity-heading>*')].map(n=>n.textContent).join(' · ')||(score.dataset.scaleKind==='context'?t('Contexto, sem nota','Context, no score'):t('Sem classificação','Not classified')),level:+score.dataset.intensityLevel||0,color:score.dataset.color||'#52635c',target:el.id};}).filter(Boolean);
 if(entries.length!==11)return;
 let table=root.querySelector('.factor-table');const sig=JSON.stringify([code(),en(),entries]);if(table?.dataset.signature===sig)return;
 if(!table){table=document.createElement('table');table.className='factor-table';root.prepend(table);}table.dataset.signature=sig;
 const meaning={1:t('Dimensão da pecuária local.','Scale of local cattle farming.'),2:t('Parcela do pasto com vigor baixo ou médio.','Share of pasture with low or medium vigor.'),3:t('Pasto próximo de frigoríficos, em linha reta.','Pasture near slaughterhouses, in a straight line.'),4:t('Seca no histórico, não previsão.','Historical drought, not a forecast.'),5:t('Estabelecimentos atendidos por assistência.','Establishments receiving technical assistance.'),6:t('Dirigentes com ensino médio ou superior.','Managers with secondary or higher education.'),7:t('Perda fora de terras indígenas e proteção integral.','Loss outside Indigenous lands and strict protected areas.'),8:t('Conversão de vegetação em pastagem.','Conversion of vegetation to pasture.'),9:t('Conversão no recorte de floresta pública.','Conversion within public forest coverage.'),10:t('Termos identificados, não fazendas distintas.','Identified terms, not distinct farms.'),11:t('Área administrativa, com possíveis sobreposições.','Administrative area, with possible overlaps.')};
 for(const r of entries){if(!Number.isFinite(r.raw))continue;const n=new Intl.NumberFormat(en()?'en-US':'pt-BR',{maximumFractionDigits:1}).format(r.raw);
 const examples={
 1:[n+' bovinos no município no ano informado.',n+' cattle in the municipality in the stated year.'],
 2:['De cada 100 ha de pasto, cerca de '+n+' ha têm vigor baixo ou médio.','Of every 100 ha of pasture, about '+n+' ha have low or medium vigor.'],
 3:['De cada 100 ha de pasto com distância calculada, cerca de '+n+' ha estão dentro do limite regional de distância até um frigorífico.','Of every 100 ha of pasture with calculated distances, about '+n+' ha fall within the regional distance threshold to a slaughterhouse.'],
 4:['A frequência histórica média de seca é '+n+'%. É uma medida do período observado, não a probabilidade de seca no próximo ano.','Average historical drought frequency is '+n+'%. It describes the observed period, not the probability of drought next year.'],
 5:['Cerca de '+n+' em cada 100 estabelecimentos recebiam assistência técnica no Censo de 2017.','About '+n+' in every 100 establishments received technical assistance in the 2017 Census.'],
 6:['Cerca de '+n+' em cada 100 estabelecimentos tinham dirigente com ensino médio completo ou superior no Censo de 2017.','About '+n+' in every 100 establishments had a manager with completed secondary or higher education in the 2017 Census.'],
 8:['De cada 100 ha de vegetação suprimida na área analisada, cerca de '+n+' ha foram convertidos em pasto no período indicado.','Of every 100 ha of vegetation cleared in the analyzed area, about '+n+' ha were converted to pasture in the stated period.'],
 9:['Para cada 100 ha de floresta pública não destinada mapeada, cerca de '+n+' ha foram convertidos no período indicado.','For every 100 ha of mapped undesignated public forest, about '+n+' ha were converted in the stated period.'],
 10:[n+' termos de embargo identificados. Uma mesma fazenda pode ter mais de um termo.','There are '+n+' identified embargo records. One farm can have more than one record.'],
 11:['Para cada 100 ha do município, a soma administrativa registra '+n+' ha de embargo. Como pode haver sobreposição, esse valor não indica a área única afetada.','For every 100 ha of municipal area, administrative records total '+n+' ha under embargo. Overlaps mean this is not the unique affected area.']};
 if(examples[r.id])meaning[r.id]=t(...examples[r.id]);}
 const loss=entries.find(r=>r.id===7);if(loss&&Number.isFinite(loss.raw))meaning[7]=t('De cada 100 ha de vegetação nativa existentes em 2022, cerca de ','Of every 100 ha of native vegetation present in 2022, about ')+friendlyNumber(loss.raw,'%')+t(' ha foram perdidos por ano, em média, entre 2023 e 2025. Fora de terras indígenas e unidades de conservação de proteção integral.',' ha were lost per year on average from 2023 to 2025. This covers areas outside Indigenous lands and strictly protected conservation areas.');
 const headings={1:t('Contexto · tamanho da pecuária','Context · cattle farming size'),2:t('Oportunidade · pasto a melhorar','Opportunity · pasture to improve'),3:t('Condições · o que pode facilitar ou dificultar','Conditions · what may help or hinder'),7:t('Pressão ambiental · onde verificar com cuidado','Environmental pressure · where to check carefully')};
 table.innerHTML='<caption>'+t('Leia o valor e depois sua interpretação. Os grupos respondem a perguntas diferentes; não há nota geral.','Read the value, then its interpretation. Groups answer different questions; there is no overall score.')+'</caption><thead><tr><th scope="col">'+t('Fator','Factor')+'</th><th scope="col">'+t('Valor observado','Observed value')+'</th><th scope="col">'+t('Como interpretar o resultado','How to interpret the result')+'</th></tr></thead><tbody>'+entries.map(r=>(headings[r.id]?'<tr class="factor-group"><th colspan="3" scope="rowgroup">'+headings[r.id]+'</th></tr>':'')+'<tr data-factor="'+r.id+'"><th scope="row">'+esc(r.title)+'<small>'+esc(r.year)+'</small><button type="button" data-factor-detail="'+r.target+'">'+t('Entender','Explain')+'</button></th><td class="factor-value">'+esc(r.value)+'</td><td><strong class="factor-class">'+esc(r.label)+'</strong>'+(r.id>1?'<span class="factor-meter" aria-hidden="true">'+[1,2,3,4,5].map(n=>'<i style="background:'+(n<=r.level?r.color:'#e2e7e4')+'"></i>').join('')+'</span>':'')+'<span class="factor-meaning">'+meaning[r.id]+'</span></td></tr>').join('')+'</tbody>';
 let details=root.querySelector(':scope>.factor-evidence');if(!details){details=document.createElement('details');details.className='factor-evidence';const summary=document.createElement('summary');details.append(summary);const legend=document.getElementById('municipal-scale-guide');if(legend)details.append(legend);details.append(groups);table.after(details);}put(details.querySelector(':scope>summary'),t('Como os indicadores são calculados','How the indicators are calculated'));conciseCalculations(details,groups);
 table.querySelectorAll('[data-factor-detail]').forEach(button=>button.onclick=()=>{details.open=true;const row=button.closest('[data-factor]');const target=document.getElementById('calculation-s'+row.dataset.factor);target?.scrollIntoView({block:'center'});});
}

function sourceTables(){
 for(const list of document.querySelectorAll('.evidence-list,#municipality-limits')){
  const rows=list.matches('.evidence-list')?[...list.querySelectorAll('.evidence-row')].map(r=>[r.querySelector('dt')?.textContent||'',r.querySelector('dd')?.textContent||'']):[...list.querySelectorAll('li')].map((r,i)=>[String(i+1),r.textContent]);
  if(!rows.length)continue;list.hidden=true;let table=list.nextElementSibling;if(!table?.classList.contains('source-summary-table')){table=document.createElement('table');table.className='atlas-data-table source-summary-table';list.after(table);}const sig=JSON.stringify([en(),rows]);if(table.dataset.signature===sig)continue;table.dataset.signature=sig;
  table.innerHTML='<thead><tr><th>'+t(list.matches('.evidence-list')?'Fonte':'Item',list.matches('.evidence-list')?'Source':'Item')+'</th><th>'+t('Dados e período','Data and period')+'</th></tr></thead><tbody>'+rows.map(r=>'<tr><th scope="row"></th><td></td></tr>').join('')+'</tbody>';[...table.tBodies[0].rows].forEach((r,i)=>{r.cells[0].textContent=rows[i][0];r.cells[1].textContent=rows[i][1];});
 }
}
function mapControls(){
 const host=document.getElementById('map-sidebar');if(!host)return;
 const business=host.querySelector('.business-controls'),corn=host.querySelector('#corn-chain-controls');
 if(business&&!business.dataset.organized){
  business.dataset.organized='true';
  const kinds=business.querySelector('#business-kind-choices');
  const groups=[['Produção','Production',['feedlot','boitel']],['Indústria e comércio','Processing and retail',['slaughterhouse','tannery','supermarket']],['Defesa agropecuária','Animal-health services',['sanitary_local_office','sanitary_regional_office','agricultural_inspection_post']]];
  for(const [pt,eng,keys]of groups){const box=document.createElement('fieldset'),title=document.createElement('legend');title.dataset.mapPt=pt;title.dataset.mapEn=eng;box.append(title);for(const key of keys){const input=kinds.querySelector('[data-business-kind="'+key+'"]');if(input)box.append(input.closest('label'));}kinds.append(box);}
  const note=business.querySelector('#sanitary-layer-note');if(note)business.querySelector('.business-options').append(note);
 }
 if(corn&&!corn.dataset.organized){corn.dataset.organized='true';const note=corn.querySelector('p[data-corn-pt]');if(note){const d=document.createElement('details'),title=document.createElement('summary');title.dataset.mapPt='Fontes e cobertura';title.dataset.mapEn='Sources and coverage';d.append(title,note);corn.append(d);}}
 for(const e of host.querySelectorAll('[data-map-pt]'))put(e,t(e.dataset.mapPt,e.dataset.mapEn));
 put(document.getElementById('business-controls-title'),t('Locais da cadeia pecuária','Cattle supply-chain locations'));
 put(document.getElementById('business-master-label'),t('Mostrar locais no mapa','Show locations on map'));
 put(document.getElementById('business-options-title'),t('Filtrar por fonte e situação','Filter by source and status'));
}
function mvpNotice(){
 document.getElementById('atlas-mvp-notice')?.remove();document.getElementById('atlas-mvp-definition')?.remove();
 const brand=document.querySelector('header .brand');if(!brand)return;
 let badge=document.getElementById('atlas-mvp-badge');
 if(badge&&badge.tagName!=='DETAILS'){badge.remove();badge=null;}
 if(!badge){badge=document.createElement('details');badge.id='atlas-mvp-badge';badge.innerHTML='<summary><span class="mvp-symbol" aria-hidden="true"><i></i><i></i><i></i></span><span class="mvp-label"></span></summary><div class="mvp-explanation"><strong></strong><p></p></div>';brand.after(badge);}
 put(badge.querySelector('.mvp-label'),t('MVP · Versão inicial','MVP · Early version'));
 put(badge.querySelector('.mvp-explanation strong'),t('Produto Mínimo Viável','Minimum Viable Product'));
 put(badge.querySelector('.mvp-explanation p'),t('O Atlas já pode ser usado. Estamos conferindo os dados e melhorando as ferramentas.','The Atlas is ready to explore. We are checking the data and improving the tools.'));
}
function mapPanelLayout(){
 if(window.ATLAS_PAGE_READY==='supply_chain')return;
 const host=document.getElementById('map-sidebar');if(!host)return;
 if(!host.querySelector('#map-location-group')){
  const location=document.createElement('section');location.id='map-location-group';location.className='map-control-group';const heading=document.createElement('h3');heading.dataset.mapPt='1. Localização';heading.dataset.mapEn='1. Location';location.append(heading);
  for(const selector of ['.map-search-slot','#map-state-label','#map-state']){const node=host.querySelector(selector);if(node)location.append(node);}
  host.querySelector('h2').after(location);
  const theme=document.createElement('section');theme.className='map-control-group';const title=document.createElement('h3');title.dataset.mapPt='2. Indicador do mapa';title.dataset.mapEn='2. Map indicator';theme.append(title);
  for(const selector of ['#map-theme-label','#map-theme','.fao-view-control']){const node=host.querySelector(selector);if(node)theme.append(node);}location.after(theme);
  const extra=document.createElement('section');extra.id='map-extra-layers';extra.className='map-control-group';const h=document.createElement('h3');h.dataset.mapPt='3. Camadas adicionais';h.dataset.mapEn='3. Additional layers';extra.append(h);theme.after(extra);
 }
 const extra=host.querySelector('#map-extra-layers');
 for(const [selector,id,pt,eng]of [['.business-controls','map-business-disclosure','Estabelecimentos e serviços','Facilities and services'],['#corn-chain-controls','map-corn-disclosure','Milho, ração e armazenagem','Corn, feed and storage']]){
  const node=host.querySelector(selector);if(node&&!document.getElementById(id)){const details=document.createElement('details');details.id=id;details.className='map-layer-disclosure';const summary=document.createElement('summary');summary.dataset.mapPt=pt;summary.dataset.mapEn=eng;details.append(summary);extra.append(details);details.append(node);}
 }
 for(const node of host.querySelectorAll('[data-map-pt]'))put(node,t(node.dataset.mapPt,node.dataset.mapEn));

}
function mapIndicatorPicker(){
 const original=document.getElementById('map-theme');if(!original)return;
 const groups=[['overview','Visão geral','Overview',['opportunity','conditions','risk']],['size','Tamanho da pecuária','Cattle farming size',['1']],['opportunity','Oportunidade','Opportunity',['2']],['conditions','Condições','Conditions',['3','4','5','6']],['pressure','Pressão ambiental','Environmental pressure',['7','8','9','10','11']]];
 const names={opportunity:['Oportunidade de melhoria','Improvement opportunity'],conditions:['Condições para melhorar o pasto','Conditions for pasture improvement'],risk:['Pressão ambiental','Environmental pressure'],1:['Rebanho bovino','Cattle herd'],2:['Pasto com vigor baixo ou médio','Low- and medium-vigor pasture'],3:['Pasto próximo de frigoríficos','Pasture near slaughterhouses'],4:['Frequência histórica de seca','Historical drought frequency'],5:['Assistência técnica','Technical assistance'],6:['Escolaridade dos dirigentes','Farm managers’ education'],7:['Perda anual de vegetação nativa','Annual native vegetation loss'],8:['Conversão de vegetação em pasto','Vegetation converted to pasture'],9:['Conversão em floresta pública','Conversion in public forest'],10:['Número de embargos','Number of embargoes'],11:['Área registrada nos embargos','Recorded embargo area']};
 let box=document.getElementById('map-indicator-picker');
 if(!box){box=document.createElement('div');box.id='map-indicator-picker';box.innerHTML='<label for="map-indicator-group"></label><select id="map-indicator-group"></select><label for="map-indicator-choice"></label><select id="map-indicator-choice"></select>';original.after(box);
  box.querySelector('#map-indicator-group').onchange=e=>{const group=groups.find(g=>g[0]===e.target.value);original.value=group[3][0];original.dispatchEvent(new Event('change',{bubbles:true}));mapIndicatorPicker();};
  box.querySelector('#map-indicator-choice').onchange=e=>{original.value=e.target.value;original.dispatchEvent(new Event('change',{bubbles:true}));};
 }
 original.hidden=true;original.setAttribute('aria-hidden','true');
 const group=groups.find(g=>g[3].includes(original.value))||groups[0];
 const a=box.querySelector('#map-indicator-group'),b=box.querySelector('#map-indicator-choice');
 const signature=[en(),group[0]].join(':');
 if(box.dataset.signature!==signature){box.dataset.signature=signature;a.replaceChildren(...groups.map(g=>new Option(t(g[1],g[2]),g[0])));b.replaceChildren(...group[3].map(id=>new Option(t(...names[id]),id)));}
 a.value=group[0];b.value=original.value;
 put(box.querySelector('label[for="map-indicator-group"]'),t('Grupo de informação','Information group'));
 put(box.querySelector('label[for="map-indicator-choice"]'),t('Mapa','Map'));
}
function unifiedSources(){
 const root=document.getElementById('evidencias'),catalog=document.getElementById('chain-source-catalogue');if(!root||!catalog?.querySelector('tbody'))return;
 const rows=[...catalog.querySelectorAll('tbody tr')].map(r=>({name:r.cells[0].textContent,url:r.cells[0].querySelector('a')?.href||'',period:r.cells[1].textContent,data:r.cells[2].textContent,notes:[]}));
 for(const r of root.querySelectorAll('.evidence-list .evidence-row')){const name=r.querySelector('dt')?.textContent||'',data=r.querySelector('dd')?.textContent||'';let row=rows.find(x=>x.name.toLowerCase().includes(name.toLowerCase()));if(row)row.data+=' '+data;else rows.push({name,url:'',period:t('Ver descrição','See description'),data,notes:[]});}
 const general=[];for(const li of root.querySelectorAll('#municipality-limits li')){const text=li.textContent,key=/FAO/.test(text)?'FAO':/OPGT/.test(text)?'OPGT':/embarg|termos|terms|polígono|polygon/i.test(text)?'IBAMA':/2017/.test(text)?'IBGE':null;const row=rows.find(r=>key&&r.name.includes(key));if(row)row.notes.push(text);else general.push(text);}
 if(general.length)rows.push({name:t('Cobertura do diagnóstico','Diagnosis coverage'),url:'',period:'',data:general.join(' '),notes:[]});
 const signature=JSON.stringify([en(),rows]);let table=document.getElementById('atlas-unified-sources');if(table?.dataset.signature===signature)return;
 if(!table){table=document.createElement('table');table.id='atlas-unified-sources';table.className='atlas-data-table';root.prepend(table);}table.dataset.signature=signature;
 table.innerHTML='<caption>'+t('Fontes, períodos e cobertura dos dados','Data sources, periods and coverage')+'</caption><thead><tr>'+[t('Fonte','Source'),t('Período','Period'),t('Dados utilizados','Data used'),t('Limites e cobertura no município','Limitations and municipal coverage')].map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr><th>'+(r.url?'<a href="'+esc(r.url)+'">'+esc(r.name)+'</a>':esc(r.name))+'</th><td>'+esc(r.period)+'</td><td>'+esc(r.data)+'</td><td>'+esc(r.notes.join(' ')||'—')+'</td></tr>').join('')+'</tbody>';
 root.classList.add('sources-consolidated');catalog.hidden=true;for(const el of root.querySelectorAll('.evidence-list,.source-summary-table,#municipality-limits,h3'))el.hidden=true;
 for(const a of root.querySelectorAll('.actions a'))a.hidden=!a.getAttribute('href')?.includes('.csv');
}
function supplyWorkspace(){
 if(window.ATLAS_PAGE_READY!=='supply_chain')return;
 document.body.classList.add('supply-workspace');
 const selector=document.getElementById('business-category'),toolbar=document.querySelector('.map-toolbar');if(!selector||!toolbar)return;
 const stages=[['inputs','Insumos','Inputs','Milho, ração e armazenagem','Corn, feed and storage',['corn_chain']],['production','Produção','Production','Confinamentos e boitéis','Feedlots and cattle boarding',['feedlot_boitel','feedlot','boitel']],['processing','Processamento','Processing','Frigoríficos e couro','Slaughterhouses and leather',['slaughterhouse','radar_zone','slaughterhouse_candidate','tannery']],['retail','Comércio','Retail','Supermercados','Supermarkets',['supermarket']],['services','Serviços de apoio','Support services','Defesa agropecuária','Animal-health services',['agencies']]];
 let flow=document.getElementById('supply-stage-picker');if(!flow){flow=document.createElement('nav');flow.id='supply-stage-picker';toolbar.before(flow);}
 const current=stages.find(x=>x[5].includes(selector.value))||stages[1],sig=en()+':'+current[0];
 if(flow.dataset.signature!==sig){flow.dataset.signature=sig;flow.setAttribute('aria-label',t('Etapas da cadeia produtiva','Supply-chain stages'));flow.innerHTML=stages.map((x,i)=>'<button type="button" data-stage="'+x[0]+'" aria-pressed="'+(x===current)+'"><small>'+ (i<4?String(i+1):'+')+'</small><strong>'+t(x[1],x[2])+'</strong><span>'+t(x[3],x[4])+'</span></button>').join('');flow.querySelectorAll('button').forEach(button=>button.onclick=()=>{const stage=stages.find(x=>x[0]===button.dataset.stage);selector.value=stage[5][0];selector.dispatchEvent(new Event('change',{bubbles:true}));supplyWorkspace();});}
 for(const option of selector.options)option.hidden=!current[5].includes(option.value);
 for(const group of selector.querySelectorAll('optgroup'))group.hidden=![...group.children].some(x=>!x.hidden);
 put(document.querySelector('[for="business-category"]'),t('Tipo de local nesta etapa','Location type in this stage'));
 put(document.querySelector('[for="map-state"]'),t('Estado','State'));put(document.querySelector('[for="municipality-search"]'),t('Aproximar de um município','Zoom to a municipality'));
 let tabs=document.getElementById('supply-view-switch');if(!tabs){tabs=document.createElement('div');tabs.id='supply-view-switch';flow.before(tabs);tabs.innerHTML='<button type="button" data-supply-view="map"></button><button type="button" data-supply-view="distances"></button>';tabs.querySelectorAll('button').forEach(button=>button.onclick=()=>{document.body.dataset.supplyView=button.dataset.supplyView;supplyWorkspace();if(button.dataset.supplyView==='map')window.ATLAS_ENTRY_MAP?.invalidateSize();});}
 const view=document.body.dataset.supplyView||'map';document.body.dataset.supplyView=view;
 tabs.querySelectorAll('button').forEach(button=>{put(button,button.dataset.supplyView==='map'?t('Explorar locais','Explore locations'):t('Comparar distâncias','Compare distances'));button.setAttribute('aria-pressed',String(button.dataset.supplyView===view));});
 const distances=document.getElementById('chain-access-distances');if(distances)distances.hidden=view!=='distances';
 let instruction=document.getElementById('supply-workspace-help');if(!instruction){instruction=document.createElement('p');instruction.id='supply-workspace-help';flow.before(instruction);}
 put(instruction,view==='map'?t('Escolha uma etapa. O mapa e a tabela mostram os locais disponíveis na área que você está vendo.','Choose a stage. The map and table show available locations in the area you are viewing.'):t('Escolha de onde sair e o que procurar por perto. Para cada origem, calculamos a distância em linha reta até o destino mapeado mais próximo.','Choose a starting point and what to look for nearby. For each origin, we measure the straight-line distance to the nearest mapped destination.'));
 const table=document.getElementById('supply-map-table');if(table&&!table.querySelector('tbody tr')){let empty=table.querySelector('.supply-empty');if(!empty){empty=document.createElement('p');empty.className='supply-empty';table.append(empty);}put(empty,t('Nenhum local listado neste enquadramento. Amplie a área do mapa ou escolha outra etapa.','No locations listed in this view. Zoom out or choose another stage.'));}
}
function exploreWorkspace(){
 if(document.documentElement.dataset.atlasTab!=='map')return;
 document.body.classList.add('explore-workspace');
 const picker=document.getElementById('map-indicator-picker'),original=document.getElementById('map-theme');if(!picker||!original)return;
 let quick=document.getElementById('map-overview-buttons');if(!quick){quick=document.createElement('div');quick.id='map-overview-buttons';picker.append(quick);for(const id of ['opportunity','conditions','risk']){const button=document.createElement('button');button.type='button';button.dataset.overview=id;button.onclick=()=>{original.value=id;original.dispatchEvent(new Event('change',{bubbles:true}));mapIndicatorPicker();exploreWorkspace();};quick.append(button);}}
 const overview=['opportunity','conditions','risk'].includes(original.value);quick.hidden=!overview;
 const choice=document.getElementById('map-indicator-choice');choice.hidden=overview;picker.querySelector('[for="map-indicator-choice"]').hidden=overview;
 const labels={opportunity:['Pasto a melhorar','Pasture to improve'],conditions:['Condições de melhoria','Improvement conditions'],risk:['Pressão ambiental','Environmental pressure']};
 quick.querySelectorAll('button').forEach(button=>{put(button,t(...labels[button.dataset.overview]));button.setAttribute('aria-pressed',String(original.value===button.dataset.overview));});
 const master=document.getElementById('business-master');if(master&&!master.dataset.initializedQuiet){master.dataset.initializedQuiet='true';if(master.checked){master.checked=false;master.dispatchEvent(new Event('change',{bubbles:true}));}}
}
function mapFocus(){
 if(document.documentElement.dataset.atlasTab!=='map')return;
 const sidebar=document.getElementById('map-sidebar');
 if(sidebar&&!document.getElementById('map-state-disclosure')){
  const label=document.getElementById('map-state-label'),select=document.getElementById('map-state');
  if(label&&select){const details=document.createElement('details');details.id='map-state-disclosure';const summary=document.createElement('summary');details.append(summary);label.before(details);details.append(label,select);}
 }
 const stateSummary=document.querySelector('#map-state-disclosure>summary');put(stateSummary,t('Filtrar por estado','Filter by state'));
 const extra=document.getElementById('map-extra-layers');if(extra&&!document.getElementById('map-extra-disclosure')){const d=document.createElement('details');d.id='map-extra-disclosure';const summary=document.createElement('summary');d.append(summary);extra.before(d);d.append(extra);}
 put(document.querySelector('#map-extra-disclosure>summary'),t('Adicionar locais da cadeia','Add supply-chain locations'));
 const legend=document.querySelector('.map-legend-card');if(legend){let details=legend.querySelector('#map-legend-disclosure');if(!details){details=document.createElement('details');details.id='map-legend-disclosure';const summary=document.createElement('summary');summary.innerHTML='<span class="compact-legend-title"></span><span class="compact-legend-colors" aria-hidden="true"></span><span class="compact-legend-action"></span>';details.append(summary);const body=document.createElement('div');body.className='legend-full';for(const child of [...legend.childNodes])body.append(child);details.append(body);legend.append(details);}
  put(details.querySelector('.compact-legend-title'),document.getElementById('map-legend-title')?.textContent||t('Legenda','Legend'));
  put(details.querySelector('.compact-legend-action'),t('Ver legenda','View legend'));
  const items=[...document.querySelectorAll('#map-legend-items .dot')];const colors=items.map(x=>getComputedStyle(x).backgroundColor);const strip=details.querySelector('.compact-legend-colors');const sig=colors.join('|');if(strip.dataset.colors!==sig){strip.dataset.colors=sig;strip.replaceChildren(...colors.map(color=>{const el=document.createElement('i');el.style.background=color;return el;}));}
 }
 put(document.getElementById('map-sidebar-title'),t('Personalize o mapa','Customize the map'));
 put(document.getElementById('map-panel-toggle'),t('Lugar e indicador','Place and indicator'));
 const heading=document.querySelector('#map-location-group>h3');if(heading){heading.dataset.mapPt='Onde você quer olhar?';heading.dataset.mapEn='Where do you want to look?';put(heading,t(heading.dataset.mapPt,heading.dataset.mapEn));}
}
function mapResultReading(){
 if(document.documentElement.dataset.atlasTab!=='map')return;
 const panel=document.getElementById('map-result-panel'),m=typeof byCode!=='undefined'?byCode.get(code()):null;if(!panel||!m)return;
 let reading=document.getElementById('map-result-reading');if(!reading){reading=document.createElement('div');reading.id='map-result-reading';panel.querySelector('#map-result-values').after(reading);}
 const theme=document.getElementById('map-theme')?.value;const id=theme==='opportunity'?2:Number(theme);const factor=document.querySelector('.factor-table [data-factor="'+id+'"] .factor-meaning');let message=factor?.textContent||'';
 if(theme==='conditions')message=t('Este resultado combina acesso a frigoríficos, seca, assistência técnica e escolaridade. Uma condição favorável em um desses fatores não garante um resultado favorável no conjunto.','This result combines slaughterhouse access, drought, technical assistance and education. A favorable result for one factor does not guarantee favorable conditions overall.');
 if(theme==='risk')message=t('A classe resume cinco indicadores de vegetação e embargos. “Alta” indica sinais de pressão no conjunto; não significa que toda a área do município esteja afetada.','The class summarizes five vegetation and embargo indicators. “High” indicates pressure signals overall; it does not mean the entire municipality is affected.');
 const signature=code()+'|'+theme+'|'+en()+'|'+message;if(reading.dataset.signature!==signature){reading.dataset.signature=signature;reading.replaceChildren();const h=document.createElement('strong');h.textContent=t('Como interpretar o resultado','How to interpret the result');const text=document.createElement('p');text.textContent=message;reading.append(h,text);}reading.hidden=!message;
 const sidebar=document.getElementById('map-sidebar');if(sidebar&&!document.getElementById('map-apply-controls')){const button=document.createElement('button');button.type='button';button.id='map-apply-controls';button.onclick=()=>{document.getElementById('map-workspace').classList.remove('filters-open');document.getElementById('map-panel-toggle').setAttribute('aria-expanded','false');window.ATLAS_ENTRY_MAP?.invalidateSize();};sidebar.append(button);}put(document.getElementById('map-apply-controls'),t('Ver mapa com esta seleção','View map with this selection'));
}
function apply(){
 if(!(window.ATLAS_ACTIVE_SHARE_UI_READY||window.ATLAS_RANKING_READY||window.ATLAS_PAGE_READY==='supply_chain'))return;
 navigation();supplyWorkspace();mvpNotice();mapControls();mapPanelLayout();mapIndicatorPicker();exploreWorkspace();mapFocus();technical();sourceTables();unifiedSources();ranking();sheet();modalHelp();categories();selectedLabels();informationDesign();rankingIntensity();simplifyNumbers();supplyEvidence();cattleFlows();propertyFigure();factorTable();indicatorGuide();overviewTable();municipalityLocator();diagnosisTable();municipalNavigation();mapResultReading();
 document.querySelectorAll('.summary-card').forEach(card=>{const dot=card.querySelector('.dot');if(dot)card.style.setProperty('--diagnosis-color',getComputedStyle(dot).backgroundColor);});
 document.querySelectorAll('#chain-access-distances> .wrap>h2').forEach(h=>put(h,t('Distâncias entre locais mapeados','Distances between mapped locations')));
 window.ATLAS_CLARITY_READY=true;
}
new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
document.addEventListener('change',schedule);document.addEventListener('input',schedule);document.addEventListener('click',schedule);window.addEventListener('hashchange',schedule);
let attempts=0;const timer=setInterval(()=>{apply();if((window.ATLAS_ACTIVE_SHARE_UI_READY||window.ATLAS_RANKING_READY||(window.ATLAS_PAGE_READY==='supply_chain'&&document.querySelector('#chain-access-distances [data-chain-results]')))&&document.querySelector('.stepnav a[href*="cadeia.html"]')){clearInterval(timer);for(const node of document.querySelectorAll('.stepnav,#rank-list,#map-result-values,#chain-access-distances [data-chain-results],#summary-cards,#indicator-groups,.map-source-caption,#metodo,.municipal-context,.municipal-facts'))new MutationObserver(schedule).observe(node,{childList:true,subtree:true});}else if(++attempts>100)clearInterval(timer);},100);
apply();
})();
