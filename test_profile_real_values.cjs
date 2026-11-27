const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/profile_real_values.js','utf8');
const context=vm.createContext({Intl});
vm.runInContext(`let ATLAS_LANGUAGE='en';let MUNICIPIOS=[];
function biomaPeers(m){return MUNICIPIOS.filter(x=>x.bioma===m.bioma)}
function classLabel(s){return s}
function openFicha(){};`,context);
vm.runInContext(source,context);
const fixture=[
 {codigo:'1',nome:'A',bioma:'X',uf:'AA',oportunidade:2400,participacaoOportunidade:60,rebanho:585500,distanciaP80Qualquer:89.8,secaFreq:5,ater:17.7,escolaridade:22,credito:1234.5,risco:'Verde'},
 {codigo:'2',nome:'B',bioma:'X',uf:'AA',oportunidade:400,participacaoOportunidade:20,rebanho:100000,distanciaP80Qualquer:0,secaFreq:20,ater:30,escolaridade:null,credito:0,risco:'Amarelo'},
 {codigo:'3',nome:'C',bioma:'Y',uf:'BB',oportunidade:100,participacaoOportunidade:10,rebanho:1000,distanciaP80Qualquer:100,secaFreq:50,ater:50,escolaridade:80,credito:200,risco:'Amarelo'}];
context.fixture=fixture;vm.runInContext('MUNICIPIOS=fixture',context);
assert.equal(vm.runInContext('profileActualMedian(MUNICIPIOS,"distanciaP80Qualquer")',context),89.8);
assert.equal(vm.runInContext('profileActualMedian(biomaPeers(MUNICIPIOS[0]),"distanciaP80Qualquer")',context),44.9);
assert.equal(vm.runInContext('profileActualMedian(MUNICIPIOS,"escolaridade")',context),51);
assert.equal(vm.runInContext('profileActualMedian([{v:null},{v:NaN}],"v")',context),null);
assert.equal(vm.runInContext('profileAxisMaximum([0,0,null])',context),null);
let html=vm.runInContext('spiderDiagram(MUNICIPIOS[0])',context);
assert(html.includes('data-value="585500"'));
assert(html.includes('data-value="89.8"'));
assert(html.includes('data-value="44.9"'));
assert(html.includes('data-axis-max="600000"'));
assert(html.includes('data-value="5"')); // Drought is the observation, not 100 minus frequency.
assert(!html.includes('relative positions')&&!html.includes('farther right is better'));
assert.equal((html.match(/data-metric=/g)||[]).length,8);
assert(html.includes('R$/ha')&&html.includes('km')&&html.includes('head'));
vm.runInContext("PROFILE_PEER_CODE='2'",context);
html=vm.runInContext('spiderDiagram(MUNICIPIOS[0])',context);
assert.equal((html.match(/data-series="peer"/g)||[]).length,8);
assert(html.includes('data-series="peer" data-value="0"'));
assert(html.includes('Not available'));
vm.runInContext("ATLAS_LANGUAGE='pt-BR'",context);
html=vm.runInContext('spiderDiagram(MUNICIPIOS[0])',context);
assert(html.includes('89,8')&&html.includes('585.500')&&html.includes('cabeças'));
assert(html.includes('Brasil · mediana'));
const published=fs.readFileSync(__dirname+'/index.html','utf8');
assert(published.includes(source.trim()),'Published HTML embeds the canonical profile implementation');
for(const match of published.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
 if(!/type=["']application\/json/.test(match[1]))new vm.Script(match[2]);
}
console.log('PASS: original values, medians, units, real axes, zero/missing, peer comparison, PT/EN and published JavaScript.');
