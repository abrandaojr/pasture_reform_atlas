// Run sequentially against a separately started, CPU-limited Chromium CDP instance.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const base=process.argv[2]||'http://localhost:8779/',out=process.argv[3]||path.resolve(__dirname,'../outputs/04_audits/language_20260911');fs.mkdirSync(out,{recursive:true});
 const targets=await(await fetch('http://127.0.0.1:9224/json')).json(),ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let id=0;const pending=new Map(),errors=[];
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}});
 const send=(method,params={})=>new Promise(r=>{pending.set(++id,r);ws.send(JSON.stringify({id,method,params}))});
 const evaluate=async expression=>{const m=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(m.error)throw Error(JSON.stringify(m.error));if(m.result.exceptionDetails)throw Error(JSON.stringify(m.result.exceptionDetails));return m.result.result.value};
 const delay=ms=>new Promise(r=>setTimeout(r,ms));
 const navigate=async url=>{await send('Page.navigate',{url});for(let i=0;i<120;i++){await delay(250);if(await evaluate('typeof MUNICIPIOS!=="undefined"&&MUNICIPIOS.length>0&&!document.getElementById("loading-overlay")'))return;}throw Error('Load timeout')};
 await send('Runtime.enable');await send('Page.enable');await navigate(base);await evaluate("setAtlasLanguage('en');showView('simulation')");await delay(150);
 assert(await evaluate('document.querySelectorAll(".sim-scenario").length===4'));
 assert(await evaluate('document.getElementById("simulation-results").innerText.includes("293.1 ha")'));
 await evaluate('document.querySelector("[data-horizon=\\"10\\"][data-strategy=\\"area\\"]").click()');
 assert.equal(await evaluate('simulationHorizon'),10);
 assert(await evaluate('document.getElementById("simulation-results").innerText.includes("Years 6–10")'));
 // Real controls: invalid input, empty budget, then zero and normal budget.
 for(const value of ['-1','']){
  await evaluate(`document.getElementById('sim-budget').value=${JSON.stringify(value)};document.getElementById('simulation-form').requestSubmit()`);
  assert(await evaluate('!!document.getElementById("simulation-error").textContent&&document.getElementById("simulation-results").hidden'));
 }
 await evaluate("document.getElementById('sim-budget').value='0';document.getElementById('simulation-form').requestSubmit()");assert(await evaluate('document.querySelectorAll(".sim-table-wrap tbody tr").length===0'));
 await evaluate("document.getElementById('sim-budget').value='2000000';document.getElementById('simulation-form').requestSubmit()");assert(await evaluate('document.querySelectorAll(".sim-table-wrap tbody tr").length>0'));
 // Export content must reconcile and the link must restore all scenario settings.
 await evaluate("document.querySelector('[data-sim-export=link]').click()");const link=await evaluate('document.querySelector("#sim-share input").value');await navigate(link);assert.equal(await evaluate('simulationHorizon'),10);assert.equal(await evaluate('simulationState.budget'),2000000);
 assert(await evaluate('!document.getElementById("view-simulation").hidden'));
 const csv=await evaluate("simulationCsv(runSimulation(MUNICIPIOS,simulationState,simulationHorizon,simulationStrategy))");assert(csv.includes('Planned area (ha)'));fs.writeFileSync(path.join(out,'simulation_allocation.csv'),csv);
 for(const lang of ['pt-BR','en','pt-BR','en']){
  await evaluate(`document.getElementById('language-switch').click()`);await delay(120);
  assert.equal(await evaluate('ATLAS_LANGUAGE'),lang);
  assert(await evaluate('!document.getElementById("view-simulation").hidden'));
  assert.equal(await evaluate('simulationState.budget'),2000000);
  const text=await evaluate('document.getElementById("atlas-simulation-root").innerText');assert(text.includes(lang==='en'?'Run scenarios':'Rodar cenários'));
  assert.equal(await evaluate('document.querySelector(".brazil-flag").hasAttribute("hidden")'),lang!=='en');
 }
 await evaluate("showView('metodologia')");assert((await evaluate('document.getElementById("view-metodologia").innerText')).includes('4. Result'));
 assert(!(await evaluate('document.querySelector("footer").textContent')).includes('Navegação'));
 await evaluate("showView('municipios')");await delay(120);assert(!(await evaluate('document.querySelector("#mun-list-body td").innerText')).includes('º'));
 await evaluate("openFicha(MUNICIPIOS.find(m=>m.qualidade==='Baixa').codigo)");await delay(150);assert((await evaluate('interpretationText(MUNICIPIOS.find(m=>m.qualidade==="Baixa"))')).includes('opportunity: low'));
 await evaluate("setAtlasLanguage('pt-BR')");assert(await evaluate('!document.getElementById("view-ficha").hidden'));assert((await evaluate('document.getElementById("ficha-content").innerText')).includes('REBANHO BOVINO'));
 await evaluate("showView('international')");assert((await evaluate('document.getElementById("view-international").innerText')).includes('Use evidências municipais'));
 await evaluate("showView('funders')");assert((await evaluate('document.getElementById("view-funders").innerText')).toLowerCase().includes('guia de decisão'));
 // Character-data and attribute edits must not restore stale translated strings.
 await evaluate("setAtlasLanguage('en');window.translationProbe=document.createElement('span');translationProbe.textContent='Contato';document.body.appendChild(translationProbe)");await delay(70);assert.equal(await evaluate('translationProbe.textContent'),'Contact');
 await evaluate("translationProbe.firstChild.nodeValue='Navegação';translationProbe.title='Ajuda sobre filtros'");await delay(70);assert.equal(await evaluate('translationProbe.textContent'),'Navigation');assert.equal(await evaluate('translationProbe.title'),'Filter help');await evaluate('translationProbe.remove()');
 const screens=[];
 for(const [name,width,language] of [['desktop',1500,'en'],['mobile',390,'en'],['mobile_pt',390,'pt-BR']]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});await evaluate(`setAtlasLanguage('${language}');showView('simulation');window.scrollTo(0,0)`);await delay(200);
  const layout=await evaluate(`(()=>{const b=document.getElementById('language-switch').getBoundingClientRect(),n=document.getElementById('nav-simulation').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth+1,right:document.documentElement.clientWidth-b.right,top:b.top,navVisible:n.width>0&&n.left>=0&&n.right<=innerWidth&&n.top>=0&&n.bottom<=innerHeight}})()`);
  assert(!layout.overflow);assert(layout.right<25&&layout.right>=0);assert(layout.top<20&&layout.top>=0);assert(layout.navVisible);
  const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,`${name}.png`),Buffer.from(shot.result.data,'base64'));screens.push({name,width,...layout});
 }
 await evaluate("setAtlasLanguage('en');showView('simulation');document.getElementById('simulation-results').scrollIntoView()");await delay(100);
 const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,'simulation_results_mobile.png'),Buffer.from(shot.result.data,'base64'));
 assert.equal(errors.length,0,JSON.stringify(errors));const report={status:'passed',url:base,scenarios:4,budget_reconciled:true,input_validation:true,share_restored:true,language_roundtrips:4,profile_preserved:true,guide_translations:true,mutation_translation:true,screens,browser_errors:errors};fs.writeFileSync(path.join(out,'browser_validation.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));ws.close();
})().catch(e=>{console.error(e);process.exit(1)});
