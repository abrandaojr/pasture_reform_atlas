(function(){
'use strict';
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
 if(note){const span=[...note.querySelectorAll('[data-pt]')].find(s=>s.dataset.pt.includes('EPSG:3857'));if(span){let d=document.getElementById('chain-technical-details');if(!d){d=document.createElement('details');d.id='chain-technical-details';d.className='clarity-disclosure';d.append(document.createElement('summary'));note.after(d);}put(d.querySelector('summary'),t('Referências cartográficas','Cartographic references'));d.append(span);}}
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
 if(!toggle){toggle=document.createElement('button');toggle.type='button';toggle.className='clarity-sheet-toggle';toggle.setAttribute('aria-controls','map-result-values');panel.querySelector('h3').after(toggle);toggle.addEventListener('click',()=>{panel.classList.toggle('clarity-expanded');schedule();});
 const h=panel.querySelector('h3');let start;h.addEventListener('touchstart',e=>{start=e.touches[0].clientY;},{passive:true});h.addEventListener('touchend',e=>{if(start===undefined)return;const delta=start-e.changedTouches[0].clientY;if(Math.abs(delta)>25){panel.classList.toggle('clarity-expanded',delta>0);schedule();}start=undefined;},{passive:true});}
 let brief=panel.querySelector('.clarity-sheet-summary');if(!brief){brief=document.createElement('p');brief.className='clarity-sheet-summary';toggle.before(brief);}const rows=[...panel.querySelectorAll('.map-mini-row')].slice(-2);put(brief,rows.map((r,i)=>(i?t('Pressão','Pressure'):t('Condições','Conditions'))+' '+(r.lastElementChild?.textContent||'').trim().toLocaleLowerCase(en()?'en':'pt')).join(' · '));
 const expanded=panel.classList.contains('clarity-expanded');toggle.setAttribute('aria-expanded',String(expanded));put(toggle,expanded?t('Recolher resumo','Collapse summary'):t('Ver resumo no mapa','Show map summary'));
 const opportunity=panel.querySelector('#map-result-values .map-mini-row:nth-last-of-type(3) .dot');if(opportunity)opportunity.style.background='#486b8a';
}
function modalHelp(){
 if(!window.ATLAS_ACTIVE_SHARE_UI_READY||typeof showLabInfo!=='function'||showLabInfo.atlasClarity)return;
 const originalShow=showLabInfo,originalClose=closeLabInfo;let trigger;
 const backdrop=document.createElement('button');backdrop.type='button';backdrop.id='atlas-help-backdrop';backdrop.hidden=true;backdrop.setAttribute('aria-label',t('Fechar explicação','Close explanation'));document.body.append(backdrop);
 const close=()=>{originalClose();backdrop.hidden=true;const p=document.getElementById('lab-popover');p?.removeAttribute('aria-modal');if(trigger?.isConnected)trigger.focus({preventScroll:true});trigger=null;};
 closeLabInfo=close;
 showLabInfo=function(button,hover=false){const mobile=innerWidth<768||matchMedia('(hover: none)').matches;if(hover&&mobile)return;originalShow(button,hover);const p=document.getElementById('lab-popover');if(mobile&&p&&!p.hidden){trigger=button;backdrop.hidden=false;p.setAttribute('aria-modal','true');p.querySelector('.lab-close')?.focus({preventScroll:true});}};
 showLabInfo.atlasClarity=true;backdrop.addEventListener('click',close);
 document.addEventListener('keydown',e=>{if(e.key==='Tab'&&!backdrop.hidden){const p=document.getElementById('lab-popover'),items=[...p.querySelectorAll('button,a[href],[tabindex="0"]')].filter(x=>x.getClientRects().length),first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
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
function apply(){
 if(!(window.ATLAS_ACTIVE_SHARE_UI_READY||window.ATLAS_RANKING_READY||window.ATLAS_PAGE_READY==='supply_chain'))return;
 navigation();technical();ranking();sheet();modalHelp();categories();selectedLabels();
 document.querySelectorAll('.summary-card').forEach(card=>{const dot=card.querySelector('.dot');if(dot)card.style.setProperty('--diagnosis-color',getComputedStyle(dot).backgroundColor);});
 document.querySelectorAll('#chain-access-distances> .wrap>h2').forEach(h=>put(h,t('Distâncias entre locais mapeados','Distances between mapped locations')));
 window.ATLAS_CLARITY_READY=true;
}
new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
document.addEventListener('change',schedule);document.addEventListener('input',schedule);document.addEventListener('click',schedule);window.addEventListener('hashchange',schedule);
let attempts=0;const timer=setInterval(()=>{apply();if((window.ATLAS_ACTIVE_SHARE_UI_READY||window.ATLAS_RANKING_READY||(window.ATLAS_PAGE_READY==='supply_chain'&&document.querySelector('#chain-access-distances [data-chain-results]')))&&document.querySelector('.stepnav a[href*="cadeia.html"]')){clearInterval(timer);for(const node of document.querySelectorAll('.stepnav,#rank-list,#map-result-values,#chain-access-distances [data-chain-results],#summary-cards,.map-source-caption,#metodo'))new MutationObserver(schedule).observe(node,{childList:true,subtree:true});}else if(++attempts>100)clearInterval(timer);},100);
apply();
})();
