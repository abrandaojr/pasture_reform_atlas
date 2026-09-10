const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context=vm.createContext({Intl,URL,URLSearchParams,document:{getElementById(){return{addEventListener(){}}},addEventListener(){}}});
vm.runInContext(`let ATLAS_LANGUAGE='pt-BR';let MUNICIPIOS=[];function classLabel(x){return x}`,context);
vm.runInContext(fs.readFileSync(__dirname+'/profile_real_values.js','utf8'),context);
vm.runInContext(fs.readFileSync(__dirname+'/atlas_query.js','utf8'),context);
context.rows=[{codigo:'1',nome:'=formula',pastureArea2025:100,distanciaP80Qualquer:0,risco:'Verde',condicoes:'Adequadas',condicoesCobertura:'Completa',secaFreq:10,secaStatus:'FAO HDF direto'},
 {codigo:'2',nome:'B',pastureArea2025:50,distanciaP80Qualquer:20,risco:'Amarelo',condicoes:'Limitadas',secaFreq:10,secaStatus:'Referência mediana do bioma'},
 {codigo:'3',nome:'C',pastureArea2025:null,distanciaP80Qualquer:null,risco:'Dados insuficientes'}];
const run=state=>{context.state=state;return vm.runInContext('runAtlasQuery(rows,state).map(r=>r.codigo)',context).join(',')};
let state={mode:'all',rules:[{field:'pastureArea2025',op:'gte',value:75},{field:'risco',op:'eq',value:'Verde'}],sort:'pastureArea2025',direction:'desc'};
assert.equal(run(state),'1');
assert.equal(run({...state,mode:'any',rules:[{field:'pastureArea2025',op:'lte',value:75},{field:'risco',op:'eq',value:'Verde'}]}),'1,2');
assert.equal(run({...state,rules:[{field:'distanciaP80Qualquer',op:'eq',value:0}]}),'1');
assert.equal(run({...state,rules:[{field:'distanciaP80Qualquer',op:'ne',value:0}]}),'2');
assert.equal(run({...state,rules:[{field:'distanciaP80Qualquer',op:'missing'}]}),'3');
assert.equal(run({...state,rules:[],direction:'asc'}),'2,1,3');
assert.equal(run({...state,rules:[{field:'secaFreq',op:'lte',value:20}]}),'1');
assert.throws(()=>run({...state,rules:[{field:'pastureArea2025',op:'gte',value:null}]}));
assert.throws(()=>run({...state,sort:'constructor'}));
const csv=vm.runInContext('atlasQueryCsv(rows,state)',context);
assert(csv.startsWith('\ufeff'));assert(csv.includes("'=formula"));assert.equal(csv.split('\r\n').length,4);
const p=JSON.parse(fs.readFileSync(__dirname+'/atlas_data.json','utf8'));
context.data=p.rows.map(v=>Object.fromEntries(p.columns.map((k,i)=>[k,v[i]])));
vm.runInContext(`MUNICIPIOS=data.map(r=>({codigo:r.codigo_ibge,pastureArea2025:Number(r.pasture_area_2025_ha),condicoes:r.classe_condicoes_doc,condicoesCobertura:r.condicoes_cobertura,risco:r.classe_risco_doc}));`,context);
const result=vm.runInContext('runAtlasQuery(MUNICIPIOS,atlasQueryPreset(MUNICIPIOS))',context);
assert(result.length>0);assert(result.every(r=>r.condicoes==='Adequadas'&&r.risco==='Verde'&&r.condicoesCobertura==='Completa'));
const html=fs.readFileSync(__dirname+'/index.html','utf8');
assert(html.includes('id="nav-query"'));assert(html.includes(fs.readFileSync(__dirname+'/atlas_query.js','utf8').trim()));
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){if(!/type=["']application\/json/.test(match[1]))new vm.Script(match[2]);}
console.log(`PASS: AND/OR, numeric and categorical filters, missing/zero, sort, validation, CSV, published JavaScript. Preset: ${result.length} municipalities.`);
