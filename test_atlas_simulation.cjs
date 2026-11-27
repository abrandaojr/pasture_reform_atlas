const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context=vm.createContext({Intl,URL,URLSearchParams,window:{ATLAS_BUILD_VERSION:'test'}});
vm.runInContext('const SIM_PROGRAMS='+fs.readFileSync(__dirname+'/simulation_programs.json','utf8')+';let ATLAS_LANGUAGE="en";',context);
vm.runInContext(fs.readFileSync(__dirname+'/atlas_simulation.js','utf8'),context);
const row=(code,extra={})=>({codigo:code,nome:'Municipality '+code,uf:'PA',bioma:'Amazônia',oportunidade:10000,risco:'Verde',condicoes:'Adequadas',condicoesCobertura:'Completa',distanciaP80Qualquer:20,secaFreq:5,...extra});
context.rows=[row('1'),row('2'),row('3'),row('4',{risco:'Vermelho'}),row('5',{condicoesCobertura:'Parcial'}),row('6',{oportunidade:null}),row('7',{condicoes:'Limitadas'})];
const call=(settings={},h=5,strategy='area',multiplier=1)=>{context.settings=settings;return vm.runInContext(`runSimulation(rows,settings,${h},'${strategy}',${multiplier})`,context)};
for(const h of [5,10])for(const strategy of ['area','support']){
 const result=call({},h,strategy);
 assert(Math.abs(result.allocated+result.reserve+result.unallocated-2000000)<.001);
 assert.equal(result.allocations.length,3);assert.equal(result.eligible,3);
 assert(result.allocations.every(a=>a.risk==='Verde'&&a.hectares<=a.opportunityHa*.1&&a.amount<=2000000*(1-result.reservePct/100)*.4));
 assert(Math.abs(result.implementation+result.maintenance-result.allocated)<1e-6);
 assert(result.maintained<=result.hectares);
}
assert(Math.abs(call().hectares-1700000/5800)<1e-9);
assert.equal(call({},10).hectares,250);
assert.equal(call({budget:0}).hectares,0);
assert.equal(call({budget:0}).reserve,0);
assert.equal(call({state:'SP'}).unallocated,2000000);
assert.equal(call({maxMunicipalities:1}).allocations.length,1);
assert(call({maxMunicipalities:1}).unallocated>0);
assert(call({},5,'area',1.25).hectares<call().hectares);
assert(call({},5,'area',.75).hectares>call().hectares);
assert.equal(call({program:'ifacc',biome:'Mata Atlântica'}).hectares,0);
const snapshot=JSON.stringify(context.rows);call();assert.equal(JSON.stringify(context.rows),snapshot,'Must not modify official classifications');
for(const invalid of [{budget:-1},{budget:null},{budget:NaN},{cost:0},{cost:Infinity},{maintenance:-1},{reserve:90},{cap:0},{maxMunicipalities:1.2},{share:101},{retention5:50,retention10:60},{program:'constructor'},{biome:'anything'}])assert.throws(()=>call(invalid));
context.rows.push(row('1'));assert.throws(()=>call(),/duplicate/);context.rows.pop();
// Exhaustion never overspends and produces a positive unallocated balance.
context.rows=[row('1',{oportunidade:10})];const exhausted=call();assert(exhausted.hectares<=1);assert(exhausted.unallocated>0);
const html=fs.readFileSync(__dirname+'/index.html','utf8');assert(html.includes('id="nav-simulation"'));assert(html.includes(fs.readFileSync(__dirname+'/atlas_simulation.js','utf8').trim()));assert(html.includes(fs.readFileSync(__dirname+'/atlas_language.js','utf8').trim()));
console.log('PASS: scenario budgets, area caps, exclusions, 5/10 years, zero and missing inputs, exhaustion, sensitivity, geographic scope, immutable Atlas classifications and embedded modules.');
