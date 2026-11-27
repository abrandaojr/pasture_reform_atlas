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
 const opportunity=panel.querySelector('#map-result-values .map-mini-row:nth-last-of-type(3) .dot');if(opportunity)opportunity.style.background='#486b8a';
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
 if(v>=1e6)return f(v/1e6,1)+t(' milhões',' million');
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
  const panel=document.createElement('section');panel.className='gta-flow-overview';
  panel.innerHTML='<h4>'+t('De onde vem e para onde vai o gado declarado?','Where is the declared cattle coming from and going?')+'</h4><p class="flow-scope-label">'+(state?t('Recorte estadual','State scope'):t('Recorte municipal','Municipal scope'))+' · '+esc(state?place||'':chosen?.nome||place||'')+' · '+flows.dataset.gtaYear+'</p>'+(quantities.length?'<div class="flow-quantities">'+quantities.map(([label,value])=>'<div class="flow-quantity"><span>'+esc(label)+'</span><strong title="'+(value===null?t('Sem registro neste recorte','No record in this scope'):value.toLocaleString(en()?'en-US':'pt-BR'))+'">'+(value===null?t('Sem registro','No record'):friendlyNumber(value))+'</strong></div>').join('')+'</div>':'<p>'+t('Sem registros para este recorte. Não significa ausência de transporte.','No records for this scope. This does not mean no transport occurred.')+'</p>')+'<p class="reading-footnote">'+t('Cabeças declaradas em guias emitidas, dentro da cobertura da fonte e do período selecionado. Um mesmo animal pode aparecer mais de uma vez.','Cattle heads declared in issued guides, within the selected source and period coverage. The same animal may be counted more than once.')+'</p>';
  if(flows.dataset.gtaSource==='pa'&&['2023','2024'].includes(flows.dataset.gtaYear)){const warning=document.createElement('p');warning.className='flow-coverage-warning';warning.textContent=t('Entradas de outros estados têm cobertura muito incompleta nesta edição. Os números não representam toda a movimentação do Pará.','Inflows from other states have very incomplete coverage in this edition. These counts do not represent all cattle movements in Pará.');panel.querySelector('.flow-scope-label').after(warning);}
  flows.querySelector('.gta-controls').after(panel);
  const maximum=Math.max(0,...routes.map(r=>Number(r.dataset.gtaHeads)));
  for(const row of routes){row.classList.add('flow-route');const amount=Number(row.dataset.gtaHeads);const number=row.querySelector('strong');if(number){number.title=number.textContent;number.textContent=friendlyNumber(amount);}const bar=document.createElement('span');bar.className='flow-route-track';bar.setAttribute('aria-hidden','true');bar.innerHTML='<i style="width:'+(maximum?100*amount/maximum:0)+'%"></i>';row.append(bar);}
  if(routes.length){const explanation=document.createElement('p');explanation.className='reading-footnote';explanation.textContent=t('Mais barra = mais cabeças declaradas nessa ligação. As ligações compartilham a mesma escala; a barra não representa distância.','Longer bars = more declared cattle heads for that connection. Connections share the same scale; bar length does not represent distance.');panel.after(explanation);}
 }
}
function propertyFigure(){
 const root=document.querySelector('.municipal-context'),source=root?.querySelector('.municipal-property-section');if(!root||!source)return;
 const rows=[...source.querySelectorAll('.property-class-row')],parse=text=>{const value=Number(en()?text.replaceAll(',',''):text.replaceAll('.','').replace(',','.'));return text.trim()!==''&&Number.isFinite(value)?value:null;};
 const values=rows.map(r=>({name:r.querySelector('h3')?.textContent||'',counts:[...r.querySelectorAll('strong')].slice(0,3).map(n=>parse(n.textContent)),uncertain:r.querySelector('.candidate-uncertain')?.textContent||''}));
 const outside=window.ATLAS_OUTSIDE_DATA?.[code()],m=typeof byCode!=='undefined'?byCode.get(code()):null;
 const signature=JSON.stringify([code(),en(),values,outside]);if(root.dataset.propertyFigure===signature)return;root.dataset.propertyFigure=signature;
 let figure=root.querySelector('.property-unified');if(!figure){figure=document.createElement('figure');figure.className='property-unified';root.prepend(figure);}
 const counts=values.map(r=>r.counts[0]).filter(v=>v!==null),total=counts.length?counts.reduce((a,b)=>a+b,0):null,maximum=Math.max(0,...counts);
 const labels=[t('Com mais de 1 ha de pasto','With more than 1 ha of pasture'),t('Com vegetação nativa >6,25 ha','With native vegetation >6.25 ha'),t('Com excedente estimado de Reserva Legal','With estimated Legal Reserve surplus')];
 let area='';
 if(outside?.cohort==='active_pending'&&outside.pasture_total_ha>0){const lo=outside.outside_gt_1ha_min_pct,hi=outside.outside_gt_1ha_max_pct;if(Number.isFinite(lo)&&Number.isFinite(hi)&&lo>=0&&hi>=lo&&hi<=100){area='<section class="property-pasture-area"><h4>'+t('Quanto pasto está dentro desses cadastros?','How much pasture is inside these registrations?')+'</h4><div class="property-area-track" aria-hidden="true"><span class="inside" style="width:'+(100-hi)+'%"></span><span class="uncertain" style="width:'+(hi-lo)+'%"></span><span class="outside" style="width:'+lo+'%"></span></div><p>'+t('Fora dos cadastros selecionados: ','Outside selected registrations: ')+'<strong>'+friendlyNumber(lo,'%')+(hi-lo>=.05?'–'+friendlyNumber(hi,'%'):'')+'%</strong>. '+t('A área sobreposta é contada uma vez.','Overlapping areas are counted once.')+'</p><small>'+t('Base territorial: ','Territorial base: ')+friendlyNumber(outside.pasture_total_ha)+' ha · '+t('pasto de 2025. Verde: dentro; cinza: fora; hachura: qualificação incerta.','2025 pasture. Green: inside; grey: outside; hatching: uncertain qualification.')+'</small></section>';}}
 const n=v=>v===null||v===undefined?t('Sem dado','No data'):friendlyNumber(v);
 const exact=v=>v===null||v===undefined?'':Number(v).toLocaleString(en()?'en-US':'pt-BR');
 figure.innerHTML='<figcaption><h3>'+t('Os imóveis em uma visão','Properties at a glance')+'</h3><p>'+esc(m?.nome||'')+' · '+(total===null?t('Sem contagem de imóveis processada neste recorte.','Property counts have not been processed in this scope.'):'<strong>'+n(total)+'</strong> '+t('cadastros ativos ou pendentes com mais de 1 ha de pasto.','active or pending registrations with more than 1 ha of pasture.'))+'</p></figcaption>'+(values.length?'<div class="property-chart-legend">'+labels.map((l,i)=>'<span><i class="property-tone-'+i+'"></i>'+l+'</span>').join('')+'</div><p class="property-nesting">'+t('Os grupos coloridos estão dentro do total de cada linha. Não devem ser somados.','The coloured groups are within each row total. Do not add them together.')+'</p><div class="property-figure-rows">'+values.map(r=>'<section class="property-figure-row" data-property-total="'+(r.counts[0]??'')+'"><h4>'+esc(r.name)+'</h4><div class="property-size-track" aria-hidden="true">'+r.counts.map((v,i)=>v===null?'':'<span class="property-tone-'+i+'" style="width:'+(maximum?100*v/maximum:0)+'%"></span>').join('')+'</div><div class="property-figure-counts">'+r.counts.map((v,i)=>'<div><span>'+labels[i]+'</span><strong title="'+exact(v)+'">'+n(v)+'</strong></div>').join('')+'</div>'+(r.uncertain?'<small>'+esc(r.uncertain)+'</small>':'')+'</section>').join('')+'</div>':'<p class="property-no-data">'+t('A ausência de resultado não significa que não existam imóveis ou pastagens.','Unavailable results do not mean that properties or pasture do not exist.')+'</p>')+area+'<p class="property-figure-note">'+t('Tamanho é a área total do imóvel, não a área de pasto. CAR é autodeclarado e não comprova titularidade. Vegetação remanescente e excedente estimado não autorizam desmatamento.','Size is total registered property area, not pasture area. CAR is self-declared and does not establish ownership. Remaining vegetation and estimated surplus do not authorise clearing.')+'</p><small>'+t('CAR de 09/10/2026 · pastagem e vegetação de 2025.','CAR snapshot 9 October 2026 · pasture and vegetation from 2025.')+'</small>';
 let details=root.querySelector(':scope>.property-source-details');if(!details){details=document.createElement('details');details.className='property-source-details';const summary=document.createElement('summary');summary.textContent=t('Ver estabelecimentos, distâncias, movimentação e bases de cálculo','View establishments, distances, movements and calculation bases');details.append(summary);for(const node of [...root.children])if(node!==figure)details.append(node);root.append(details);}else details.querySelector(':scope>summary').textContent=t('Ver estabelecimentos, distâncias, movimentação e bases de cálculo','View establishments, distances, movements and calculation bases');
}

function apply(){
 if(!(window.ATLAS_ACTIVE_SHARE_UI_READY||window.ATLAS_RANKING_READY||window.ATLAS_PAGE_READY==='supply_chain'))return;
 navigation();technical();ranking();sheet();modalHelp();categories();selectedLabels();informationDesign();rankingIntensity();simplifyNumbers();supplyEvidence();cattleFlows();propertyFigure();
 document.querySelectorAll('.summary-card').forEach(card=>{const dot=card.querySelector('.dot');if(dot)card.style.setProperty('--diagnosis-color',getComputedStyle(dot).backgroundColor);});
 document.querySelectorAll('#chain-access-distances> .wrap>h2').forEach(h=>put(h,t('Distâncias entre locais mapeados','Distances between mapped locations')));
 window.ATLAS_CLARITY_READY=true;
}
new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
document.addEventListener('change',schedule);document.addEventListener('input',schedule);document.addEventListener('click',schedule);window.addEventListener('hashchange',schedule);
let attempts=0;const timer=setInterval(()=>{apply();if((window.ATLAS_ACTIVE_SHARE_UI_READY||window.ATLAS_RANKING_READY||(window.ATLAS_PAGE_READY==='supply_chain'&&document.querySelector('#chain-access-distances [data-chain-results]')))&&document.querySelector('.stepnav a[href*="cadeia.html"]')){clearInterval(timer);for(const node of document.querySelectorAll('.stepnav,#rank-list,#map-result-values,#chain-access-distances [data-chain-results],#summary-cards,#indicator-groups,.map-source-caption,#metodo,.municipal-context,.municipal-facts'))new MutationObserver(schedule).observe(node,{childList:true,subtree:true});}else if(++attempts>100)clearInterval(timer);},100);
apply();
})();
