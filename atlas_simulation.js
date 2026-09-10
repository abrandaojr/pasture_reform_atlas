// Deterministic budget scenarios, separate from the Atlas classifications.
const SIM_DEFAULTS={budget:2000000,program:'renovagro',biome:'',state:'',cost:5000,maintenance:200,reserve:15,maxMunicipalities:5,cap:40,share:10,retention5:85,retention10:70,startYear:2026};
function validateSimulation(raw){
 const s={...SIM_DEFAULTS,...raw};
 for(const [k,min,max,integer] of [['budget',0,1e12],['cost',1,1e7],['maintenance',0,1e7],['reserve',0,80],['maxMunicipalities',1,20,true],['cap',1,100],['share',0.01,100],['retention5',0,100],['retention10',0,100],['startYear',2026,2100,true]]){
  if(typeof s[k]!=='number'||!Number.isFinite(s[k])||s[k]<min||s[k]>max||(integer&&!Number.isInteger(s[k])))throw Error(k);
 }
 if(s.retention10>s.retention5)throw Error('retention10');
 if(!SIM_PROGRAMS.programs.some(p=>p.id===s.program))throw Error('program');
 if(typeof s.state!=='string'||typeof s.biome!=='string')throw Error('geography');
 if(s.state&&!/^[A-Z]{2}$/.test(s.state))throw Error('state');
 if(s.biome&&!['Amazônia','Cerrado','Caatinga','Mata Atlântica','Pampa','Pantanal'].includes(s.biome))throw Error('biome');
 return Object.fromEntries(Object.keys(SIM_DEFAULTS).map(k=>[k,s[k]]));
}
function simulationCandidates(rows,s){
 const program=SIM_PROGRAMS.programs.find(p=>p.id===s.program),excluded={geography:0,area:0,risk:0,conditions:0};
 const eligible=[];const seen=new Set();
 for(const m of rows){
  if(seen.has(m.codigo))throw Error('duplicate municipality');seen.add(m.codigo);
  if((s.biome&&m.bioma!==s.biome)||(s.state&&m.uf!==s.state)||(program.scope.length&&!program.scope.includes(m.bioma))){excluded.geography++;continue;}
  if(!Number.isFinite(m.oportunidade)||m.oportunidade<=0){excluded.area++;continue;}
  if(m.risco!=='Verde'){excluded.risk++;continue;}
  if(m.condicoesCobertura!=='Completa'||!['Adequadas','Intermediárias'].includes(m.condicoes)||!Number.isFinite(m.distanciaP80Qualquer)||!Number.isFinite(m.secaFreq)||m.distanciaP80Qualquer<0||m.secaFreq<0||m.secaFreq>100){excluded.conditions++;continue;}
  eligible.push(m);
 }
 return {eligible,excluded};
}
function runSimulation(rows,raw,horizon=5,strategy='area',costMultiplier=1){
 const s=validateSimulation(raw);if(![5,10].includes(horizon)||!['area','support'].includes(strategy)||!Number.isFinite(costMultiplier)||costMultiplier<=0)throw Error('scenario');
 const {eligible,excluded}=simulationCandidates(rows,s);
 const reservePct=Math.min(80,s.reserve+(strategy==='support'?10:0));
 const totalCents=Math.round(s.budget*100),availableCents=Math.floor(totalCents*(1-reservePct/100));
 const capCents=Math.floor(availableCents*s.cap/100);
 const lifecycleCost=(s.cost*costMultiplier+s.maintenance*(horizon-1));
 const rank=m=>m.condicoes==='Adequadas'?0:1;
 eligible.sort((a,b)=>strategy==='support'?(rank(a)-rank(b)||a.distanciaP80Qualquer-b.distanciaP80Qualquer||a.secaFreq-b.secaFreq||b.oportunidade-a.oportunidade||a.codigo.localeCompare(b.codigo)):(b.oportunidade-a.oportunidade||rank(a)-rank(b)||a.distanciaP80Qualquer-b.distanciaP80Qualquer||a.codigo.localeCompare(b.codigo)));
 let remaining=availableCents;const allocations=[];
 for(const m of eligible){
  if(remaining<1||allocations.length>=s.maxMunicipalities)break;
  const capacityHa=m.oportunidade*s.share/100;
  const cents=Math.min(remaining,capCents,Math.floor(capacityHa*lifecycleCost*100));
  if(cents<1)continue;
  const hectares=cents/100/lifecycleCost;
  allocations.push({code:m.codigo,name:m.nome,state:m.uf,biome:m.bioma,opportunityHa:m.oportunidade,conditions:m.condicoes,risk:m.risco,distanceKm:m.distanciaP80Qualquer,droughtPct:m.secaFreq,hectares,amount:cents/100,implementation:hectares*s.cost*costMultiplier,maintenance:hectares*s.maintenance*(horizon-1)});
  remaining-=cents;
 }
 const allocated=allocations.reduce((a,r)=>a+Math.round(r.amount*100),0)/100;
 const reserve=allocated?Math.min((totalCents-availableCents)/100,s.budget-allocated):0;
 const hectares=allocations.reduce((a,r)=>a+r.hectares,0);
 const maintained=hectares*(horizon===5?s.retention5:s.retention10)/100;
 return {settings:s,horizon,strategy,reservePct,costMultiplier,eligible:eligible.length,excluded,allocations,allocated,reserve,unallocated:(totalCents-Math.round(allocated*100)-Math.round(reserve*100))/100,hectares,maintained,lifecycleCost,implementation:allocations.reduce((a,r)=>a+r.implementation,0),maintenance:allocations.reduce((a,r)=>a+r.maintenance,0)};
}
let simulationState={...SIM_DEFAULTS},simulationStrategy='area',simulationHorizon=5,simulationInitialized=false;
function simText(pt,en){return ATLAS_LANGUAGE==='en'?en:pt;}
function simNumber(n,digits=1){return new Intl.NumberFormat(ATLAS_LANGUAGE,{maximumFractionDigits:digits}).format(n)}
function simMoney(n){return new Intl.NumberFormat(ATLAS_LANGUAGE,{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(n)}
function simEscape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function simField(key,pt,en,step='1'){return `<label for="sim-${key}">${simText(pt,en)}<input id="sim-${key}" name="${key}" type="number" step="${step}" value="${simulationState[key]}" required></label>`}
function renderSimulation(){
 if(!simulationInitialized){
  simulationInitialized=true;
  const query=new URLSearchParams(location.search).get('simulation');
  if(query){try{simulationState=validateSimulation(JSON.parse(query))}catch(_){simulationState={...SIM_DEFAULTS};}}
 }
 const en=ATLAS_LANGUAGE==='en',lang=en?'en':'pt',s=simulationState;
 const root=document.getElementById('atlas-simulation-root');if(!root)return;
 root.innerHTML=`<div class="sim-intro"><span class="eyebrow-label">${simText('Planejamento de recursos','Resource planning')}</span><h1>${simText('Onde alocar recursos para melhorar pastagens?','Where could a pasture budget make a difference?')}</h1><p>${simText('Compare alocações municipais, custos e próximos passos em 5 e 10 anos. Comece com R$ 2 milhões ou ajuste seu orçamento.','Compare municipal allocations, costs and next steps over 5 and 10 years. Start with BRL 2 million or enter your budget.')}</p></div>
 <form id="simulation-form" novalidate><div class="sim-primary">
 ${simField('budget','Orçamento total, uma única vez (BRL)','Total budget, available once (BRL)','1000')}
 <label for="sim-program">${simText('Programa ou via de financiamento','Programme or financing route')}<select id="sim-program" name="program">${SIM_PROGRAMS.programs.map(p=>`<option value="${p.id}" ${p.id===s.program?'selected':''}>${p.name[lang]}</option>`).join('')}</select></label>
 <label for="sim-biome">${simText('Bioma','Biome')}<select id="sim-biome" name="biome"><option value="">${simText('Todos os biomas da via escolhida','All biomes in the selected route')}</option>${['Amazônia','Cerrado','Caatinga','Mata Atlântica','Pampa','Pantanal'].map(b=>`<option value="${b}" ${b===s.biome?'selected':''}>${en?atlasTranslateString(b):b}</option>`).join('')}</select></label>
 <label for="sim-state">${simText('Estado','State')}<select id="sim-state" name="state"><option value="">${simText('Todos os estados','All states')}</option>${[...new Set(MUNICIPIOS.map(m=>m.uf))].sort().map(uf=>`<option ${uf===s.state?'selected':''}>${uf}</option>`).join('')}</select></label></div>
 <details class="sim-assumptions"><summary>${simText('Hipóteses editáveis de custo e execução','Editable cost and implementation assumptions')}</summary><p>${simText('Os valores iniciais são exemplos de planejamento, não custos oficiais ou cotações locais. Substitua-os por orçamentos de campo. Todos os valores permanecem em reais de 2026, sem inflação.','Starting values are planning examples, not official costs or local quotes. Replace them with field budgets. All amounts remain in constant 2026 BRL, without inflation.')}</p><div class="sim-fields">
 ${simField('cost','Implantação (BRL/ha)','Implementation (BRL/ha)','100')}${simField('maintenance','Manutenção anual (BRL/ha/ano)','Annual maintenance (BRL/ha/year)','10')}${simField('reserve','Assistência, monitoramento e contingência (%)','Extension, monitoring and contingency (%)')}${simField('maxMunicipalities','Máximo de municípios','Maximum municipalities')}${simField('cap','Limite por município (% do orçamento de campo)','Municipal cap (% of field budget)')}${simField('share','Fração mobilizável da oportunidade municipal (%)','Mobilisable share of municipal opportunity (%)')}${simField('retention5','Área mantida no ano 5, hipótese (%)','Area retained in year 5, assumption (%)')}${simField('retention10','Área mantida no ano 10, hipótese (%)','Area retained in year 10, assumption (%)')}${simField('startYear','Ano de início','Start year')}
 </div><p>${simText('A manutenção é provisionada para toda a área durante horizonte − 1 anos. As taxas de permanência são hipóteses do usuário; não foram estimadas pelo Atlas. Juros, amortização, receitas e créditos de carbono não entram neste orçamento de projeto.','Maintenance is reserved for all hectares over horizon − 1 years. Retention rates are user assumptions, not estimates from the Atlas. Loan interest, repayments, revenue and carbon credits are outside this project budget.')}</p></details>
 <div class="sim-actions"><button class="btn ochre" type="submit">${simText('Rodar cenários','Run scenarios')}</button><button class="btn" type="button" data-sim-action="reset">${simText('Restaurar exemplo de R$ 2 milhões','Reset BRL 2 million example')}</button><span id="simulation-pending" role="status"></span></div><div id="simulation-error" role="alert"></div></form>
 <div id="simulation-results" aria-live="polite"></div>`;
 root.querySelector('form').addEventListener('submit',simulationSubmit);
 root.querySelector('form').addEventListener('input',()=>{document.getElementById('simulation-pending').textContent=simText('Alterações pendentes: rode os cenários.','Inputs changed: run scenarios to update results.');document.getElementById('simulation-results').hidden=true;});
 root.querySelector('[data-sim-action="reset"]').onclick=()=>{simulationState={...SIM_DEFAULTS};renderSimulation()};
 renderSimulationResults();
}
function simulationSubmit(e){
 e.preventDefault();const raw=Object.fromEntries(new FormData(e.target));
 for(const k of Object.keys(SIM_DEFAULTS))if(typeof SIM_DEFAULTS[k]==='number')raw[k]=String(raw[k]).trim()===''?NaN:Number(raw[k]);
 try{simulationState=validateSimulation(raw);document.getElementById('simulation-error').textContent='';document.getElementById('simulation-pending').textContent='';renderSimulationResults();}
 catch(err){document.getElementById('simulation-error').textContent=simText('Revise os valores. Use orçamento ≥ 0, custo > 0, percentuais de 0 a 100 (reserva até 80), 1–20 municípios e permanência no ano 10 não maior que no ano 5.','Check inputs. Use budget ≥ 0, cost > 0, percentages from 0 to 100 (reserve up to 80), 1–20 municipalities and year-10 retention no higher than year 5.');document.getElementById('simulation-results').hidden=true;}
}
function renderSimulationResults(){
 const en=ATLAS_LANGUAGE==='en',lang=en?'en':'pt',s=simulationState,root=document.getElementById('simulation-results');root.hidden=false;
 const scenarios=[5,10].flatMap(h=>['area','support'].map(strategy=>runSimulation(MUNICIPIOS,s,h,strategy)));
 const r=scenarios.find(x=>x.horizon===simulationHorizon&&x.strategy===simulationStrategy),program=SIM_PROGRAMS.programs.find(p=>p.id===s.program);
 const scenarioName=x=>x.strategy==='area'?simText('Maior área','More hectares'):simText('Mais apoio','More support');
 const units=simText('ha','ha');
 root.innerHTML=`<div class="sim-program"><h2>${program.name[lang]}</h2><p>${program.summary[lang]}</p><details><summary>${simText('Como acessar e fontes oficiais','Funding access and official sources')}</summary><p>${program.access[lang]}</p><p>${program.sources.map(x=>`<a href="${x.url}" target="_blank" rel="noopener">${simEscape(en?x.label:x.label.replace('pasture target','meta de pastagens').replace('programme safeguards','salvaguardas do programa'))}</a>`).join(' · ')} · ${simText('Fontes consultadas em 11/09/2026','Sources reviewed 11 September 2026')}</p></details></div>
 <h2>${simText('Quatro cenários para o mesmo orçamento','Four scenarios for the same budget')}</h2><p class="sim-note">${simText('“Mais apoio” reserva dez pontos percentuais adicionais e prioriza condições adequadas e menor distância ao mercado. Nenhum ganho adicional de produtividade ou permanência é presumido.','“More support” reserves ten additional percentage points and prioritises adequate conditions and shorter market distance. No extra productivity or retention benefit is assumed.')}</p>
 <div class="sim-scenarios">${scenarios.map(x=>`<button type="button" class="sim-scenario ${x===r?'selected':''}" data-horizon="${x.horizon}" data-strategy="${x.strategy}" aria-pressed="${x===r}"><span>${scenarioName(x)} · ${x.horizon} ${simText('anos','years')}</span><strong>${simNumber(x.hectares)} ha</strong><span>${simText('Área com orçamento previsto','Area with a planned budget')}</span><small>${simNumber(x.reservePct,0)}% ${simText('para apoio','for support')}</small></button>`).join('')}</div>
 <p class="sim-note">${simText('Cenários alternativos, não cumulativos. A área representa capacidade de financiar intervenções; não é recuperação observada, lucro previsto ou aprovação de crédito.','Alternative scenarios, not cumulative commitments. Area represents capacity to fund interventions; it is not observed recovery, forecast profit or credit approval.')}</p>
 <div class="sim-summary"><div><strong>${simMoney(r.allocated)}</strong><span>${simText('Implantação + manutenção','Implementation + maintenance')}</span></div><div><strong>${simMoney(r.reserve)}</strong><span>${simText('Reserva para apoio','Support reserve')}</span></div><div><strong>${simMoney(r.unallocated)}</strong><span>${simText('Sem alocação','Unallocated')}</span></div><div><strong>${simNumber(r.maintained)} ha</strong><span>${simText('Mantidos ao final, se a hipótese se cumprir','Retained at the end if the assumption holds')}</span></div></div>
 <h2>${simText('Onde começar a prospecção','Where to start project screening')}</h2><p>${simText('Somente risco verde, condições adequadas ou intermediárias e cobertura completa dos indicadores. Isso é uma triagem municipal do cenário, não elegibilidade oficial do imóvel.','Only green risk, adequate or intermediate conditions, and complete indicator coverage. This is the scenario’s municipal screen, not official farm eligibility.')}</p>
 <p class="sim-note">${simNumber(r.eligible,0)} ${simText('municípios passaram pela triagem','municipalities passed the screen')}. ${simText('Exclusões sequenciais','Sequential exclusions')}: ${simText('geografia','geography')} ${simNumber(r.excluded.geography,0)}; ${simText('área ausente ou zero','missing or zero area')} ${simNumber(r.excluded.area,0)}; ${simText('risco','risk')} ${simNumber(r.excluded.risk,0)}; ${simText('condições ou dados','conditions or data')} ${simNumber(r.excluded.conditions,0)}.</p>
 ${r.allocations.length?`<div class="sim-table-wrap" tabindex="0" role="region" aria-label="${simText('Alocação municipal, tabela com rolagem horizontal','Municipal allocation, horizontally scrollable table')}"><table class="data-table"><thead><tr>${[simText('Município','Municipality'),simText('Alocação (BRL)','Allocation (BRL)'),simText('Área prevista (ha)','Planned area (ha)'),simText('Condições','Conditions'),simText('Risco','Risk'),simText('Mercado P80 (km)','Market P80 (km)'),simText('Oportunidade observada (ha)','Observed opportunity (ha)')].map(v=>`<th>${v}</th>`).join('')}</tr></thead><tbody>${r.allocations.map(a=>`<tr><td><button class="sim-link" data-profile="${a.code}"><span translate="no">${simEscape(a.name)}</span> · ${a.state}</button><small>${en?atlasTranslateString(a.biome):a.biome}</small></td><td>${simMoney(a.amount)}</td><td>${simNumber(a.hectares,2)}</td><td>${classLabel(a.conditions)}</td><td>${classLabel(a.risk)}</td><td>${simNumber(a.distanceKm)}</td><td>${simNumber(a.opportunityHa)}</td></tr>`).join('')}</tbody></table></div>`:`<p class="sim-empty" role="status">${simText('Nenhuma alocação viável com estes filtros e limites. O orçamento permanece sem alocação. Ajuste a geografia, os custos ou os limites; não interprete ausência de candidatos como aprovação de áreas de maior risco.','No feasible allocation under these filters and limits. The budget remains unallocated. Review geography, costs or caps; lack of candidates does not approve higher-risk areas.')}</p>`}
 <p class="sim-note">${simText('“Maior área” ordena pela oportunidade em hectares, depois pelas condições e distância. Com custo uniforme, muitos municípios empatam em hectares por real; não há ótimo econômico local comprovado. “Mais apoio” ordena por condições, distância e seca. O limite por município e a fração mobilizável são hipóteses, não regras dos programas.','“More hectares” sorts by opportunity hectares, then conditions and distance. With uniform costs, many municipalities tie on hectares per real; no local economic optimum has been established. “More support” sorts by conditions, distance and drought. Municipal caps and mobilisable shares are assumptions, not programme rules.')}</p>
 <h2>${simText('Plano de execução','Implementation plan')} · ${s.startYear}–${s.startYear+r.horizon}</h2>
 <div class="sim-roadmap">${simulationRoadmap(r,program,lang)}</div>
 <details class="sim-method"><summary>${simText('Custos, sensibilidade e relação com metas','Costs, sensitivity and relationship to targets')}</summary>
 <p>${simText('Custo por hectare no horizonte','Cost per hectare over the horizon')}: ${simMoney(s.cost)} + ${r.horizon-1} × ${simMoney(s.maintenance)} = <strong>${simMoney(r.lifecycleCost)}/ha</strong>. ${simText('Implantação','Implementation')}: ${simMoney(r.implementation)}; ${simText('manutenção provisionada','reserved maintenance')}: ${simMoney(r.maintenance)}.</p>
 <p>${simText('Variação do custo de implantação, mantendo as demais hipóteses','Implementation cost sensitivity, with other assumptions unchanged')}: −25% → ${simNumber(runSimulation(MUNICIPIOS,s,r.horizon,r.strategy,.75).hectares)} ha; +25% → ${simNumber(runSimulation(MUNICIPIOS,s,r.horizon,r.strategy,1.25).hectares)} ha. ${simText('Faixa de sensibilidade, não intervalo estatístico.','Sensitivity range, not a statistical interval.')}</p>
 <p>${program.target_ha?simText(`A área prevista equivale a ${simNumber(r.hectares/program.target_ha*100,5)}% da meta de ${simNumber(program.target_ha,0)} ha do ${program.target_name}. A referência temporal é ${program.target_year}; o horizonte desta simulação termina em ${s.startYear+r.horizon}. Isto não contabiliza contribuição oficial nem cumprimento da meta.`,`Planned area is equivalent to ${simNumber(r.hectares/program.target_ha*100,5)}% of the ${simNumber(program.target_ha,0)} ha ${program.target_name} ambition. Its time reference is ${program.target_year}; this scenario ends in ${s.startYear+r.horizon}. This does not count as official delivery or target achievement.`):simText('A meta do IFACC é financeira e abrange mais países e cadeias. Não se converte esse compromisso em hectares nem em recursos disponíveis para o usuário.','The IFACC ambition is financial and spans multiple countries and supply chains. It is not converted into hectares or funds available to the user.')}</p>
 <p>${simText('Base: oportunidade de baixo e médio vigor em 2024; mercado em 2025; assistência e escolaridade em 2017; seca 1984–2025; risco do Atlas. Baixo vigor não identifica sozinho propriedades elegíveis ou hectares efetivamente degradados. Nenhum parâmetro do cenário altera a classificação oficial do Atlas.','Data: low- and medium-vigour opportunity in 2024; markets in 2025; extension and education in 2017; drought in 1984–2025; Atlas risk. Low vigour alone does not identify eligible farms or confirmed degraded hectares. Scenario parameters do not change Atlas classifications.')}</p></details>
 <div class="sim-actions"><button class="btn" data-sim-export="csv">${simText('Exportar alocação CSV','Export allocation CSV')}</button><button class="btn" data-sim-export="json">${simText('Salvar cenário completo JSON','Save complete scenario JSON')}</button><button class="btn" data-sim-export="link">${simText('Link do cenário','Scenario link')}</button></div><div id="sim-share"></div>`;
 root.querySelectorAll('[data-horizon]').forEach(b=>b.onclick=()=>{simulationHorizon=Number(b.dataset.horizon);simulationStrategy=b.dataset.strategy;renderSimulationResults()});
 root.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>openFicha(b.dataset.profile));
 root.querySelectorAll('[data-sim-export]').forEach(b=>b.onclick=()=>simulationExport(b.dataset.simExport,r));
}
function simulationRoadmap(r,p,lang){
 const rows=lang==='en'?[
  ['0–6 months','Select farms and validate the project','Local extension team + producers + lender','Check land tenure, CAR and environmental restrictions; inspect soils, water and pasture; obtain quotes and establish a georeferenced baseline. Confirm programme access before spending.'],
  ['6–12 months','Pilot on 20% of the planned area','Producers + agronomist',`Pilot ceiling: ${simNumber(r.hectares*.2)} ha. Agree implementation and maintenance responsibilities; release funds against the technical plan and field verification.`],
  ['Years 2–3','Expand only after the pilot review','Producers + technical assistance',`Review establishment, costs and safeguards before treating the remaining ${simNumber(r.hectares*.8)} ha. Establish rotational management and annual monitoring.${p.id==='caminho'?' Prepare annual carbon accounting from year three.':''}`],
  ['Years 4–5','Maintain and verify persistence','Extension team + independent review',`Monitor forage cover, soil, stocking and environmental compliance. The ${simNumber(r.settings.retention5)}% retention assumption must be tested in the field; it is not a measured result.`],
  ...(r.horizon===10?[['Years 6–10','Renew management and audit long-term results','Producers + programme partners',`Use the maintenance provision, revise management after droughts and compare year-10 field outcomes with the ${simNumber(r.settings.retention10)}% assumption. Any expansion beyond the funded area needs a new budget.`]]:[])
 ]:[
  ['0–6 meses','Selecionar imóveis e validar o projeto','Assistência local + produtores + banco','Verificar posse, CAR e restrições ambientais; avaliar solo, água e pastagem; obter cotações e estabelecer uma linha de base georreferenciada. Confirmar acesso ao programa antes dos gastos.'],
  ['6–12 meses','Executar piloto em 20% da área prevista','Produtores + agrônomo',`Limite do piloto: ${simNumber(r.hectares*.2)} ha. Pactuar implantação e manutenção; liberar recursos conforme o projeto técnico e a verificação em campo.`],
  ['Anos 2–3','Expandir após avaliar o piloto','Produtores + assistência técnica',`Revisar estabelecimento, custos e salvaguardas antes de tratar os ${simNumber(r.hectares*.8)} ha restantes. Implantar manejo rotacionado e monitoramento anual.${p.id==='caminho'?' Preparar balanço anual de carbono a partir do terceiro ano.':''}`],
  ['Anos 4–5','Manter e verificar a permanência','Assistência + revisão independente',`Monitorar cobertura, solo, lotação e conformidade ambiental. A hipótese de permanência de ${simNumber(r.settings.retention5)}% deve ser testada em campo; não é um resultado medido.`],
  ...(r.horizon===10?[['Anos 6–10','Renovar manejo e auditar resultados','Produtores + parceiros do programa',`Usar a provisão de manutenção, rever o manejo após secas e comparar o ano 10 com a hipótese de ${simNumber(r.settings.retention10)}%. Expandir além da área financiada exige novo orçamento.`]]:[])
 ];
 return rows.map(([when,title,who,body])=>`<article><span>${when}</span><h3>${title}</h3><small>${who}</small><p>${body}</p></article>`).join('');
}
function simulationExport(kind,r){
 const program=SIM_PROGRAMS.programs.find(p=>p.id===r.settings.program);
 if(kind==='link'){
  const u=new URL(location.href);u.search='';u.searchParams.set('view','simulation');u.searchParams.set('simulation',JSON.stringify(r.settings));u.searchParams.set('horizon',r.horizon);u.searchParams.set('strategy',r.strategy);
  document.getElementById('sim-share').innerHTML=`<label>${simText('Copie o link; ele salva hipóteses, não congela a base','Copy the link; it saves assumptions, not the dataset')}<input readonly value="${simEscape(u.href)}"></label>`;return;
 }
 const content=kind==='json'?JSON.stringify({created_at:new Date().toISOString(),atlas_build:window.ATLAS_BUILD_VERSION,method:'allocation_scenarios_v1',implementation_plan_html:simulationRoadmap(r,program,ATLAS_LANGUAGE==='en'?'en':'pt'),program_sources:program,source_reviewed_at:SIM_PROGRAMS.reviewed_at,result:r,notes:{en:'Planning scenario, not credit approval or forecast recovery. Constant 2026 BRL. No loan repayments, revenue, carbon credit or automatic matching funds.',pt:'Cenário de planejamento, não aprovação de crédito nem previsão de recuperação. BRL constantes de 2026. Sem amortização, receitas, créditos de carbono ou contrapartida automática.'}},null,2):simulationCsv(r);
 const blob=new Blob([kind==='csv'?'\ufeff'+content:content],{type:kind==='json'?'application/json':'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`atlas_simulation_${r.horizon}y_${r.strategy}.${kind}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function simulationCsv(r){
 const header=ATLAS_LANGUAGE==='en'?['IBGE code','Municipality','State','Biome','Allocation (BRL)','Planned area (ha)','Implementation (BRL)','Maintenance provision (BRL)','Horizon (years)','Strategy','Total budget (BRL)','Support reserve, scenario total (BRL)','Unallocated, scenario total (BRL)','Cost assumption (BRL/ha)','Annual maintenance assumption (BRL/ha/year)','Atlas build']:['Código IBGE','Município','Estado','Bioma','Alocação (BRL)','Área prevista (ha)','Implantação (BRL)','Provisão de manutenção (BRL)','Horizonte (anos)','Estratégia','Orçamento total (BRL)','Reserva de apoio, total do cenário (BRL)','Sem alocação, total do cenário (BRL)','Hipótese de custo (BRL/ha)','Hipótese de manutenção anual (BRL/ha/ano)','Versão do Atlas'];
 const table=[header,...r.allocations.map(a=>[a.code,a.name,a.state,(ATLAS_LANGUAGE==='en'?({'Amazônia':'Amazon','Mata Atlântica':'Atlantic Forest'}[a.biome]||a.biome):a.biome),a.amount,a.hectares,a.implementation,a.maintenance,r.horizon,r.strategy,r.settings.budget,r.reserve,r.unallocated,r.settings.cost,r.settings.maintenance,window.ATLAS_BUILD_VERSION])];
 return table.map(row=>row.map(v=>'"'+(typeof v==='string'&&/^[=+@\-\t\r]/.test(v)?"'"+v:String(v??'')).replace(/"/g,'""')+'"').join(',')).join('\r\n');
}
if(typeof document!=='undefined')document.addEventListener('atlaslanguagechange',()=>{
 const nav=document.getElementById('nav-simulation');if(nav)nav.textContent=simText('Simulação','Simulation');
 if(!document.getElementById('view-simulation')?.hidden)renderSimulation();
 const params=new URLSearchParams(location.search);
 if(!simulationInitialized&&params.get('view')==='simulation'){
  simulationHorizon=params.get('horizon')==='10'?10:5;simulationStrategy=params.get('strategy')==='support'?'support':'area';showView('simulation');
 }
});
