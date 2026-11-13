(function(root){
'use strict';
const glossary={
 vigor:{pt:'intensidade de crescimento do capim, medida por imagens de satélite',en:'how vigorously grass is growing, measured with satellite images'},
 car:{pt:'Cadastro Ambiental Rural, registro em que o proprietário declara os limites do imóvel e suas áreas de vegetação',en:'Brazil’s Rural Environmental Registry, where landowners declare their property boundaries and areas of native vegetation'},
 embargo:{pt:'proibição, aplicada pelo órgão ambiental, de usar uma área desmatada ilegalmente',en:'a ban, issued by the environmental agency, on using land that was cleared illegally'},
 slaughterhouse:{pt:'indústria que abate o gado e processa a carne',en:'a plant that slaughters cattle and processes the meat'},
 permit:{pt:'Guia de Trânsito Animal (GTA), documento obrigatório para transportar gado',en:'the animal transit permit (GTA), a document required by law to move cattle'},
 advice:{pt:'orientação de técnicos ou agrônomos sobre o manejo da propriedade',en:'guidance from agronomists or extension agents on how to manage a farm'},
 publicForest:{pt:'floresta pública que ainda não recebeu um uso definido, como unidade de conservação ou terra indígena',en:'public forest that has not yet been designated for a specific use, such as a protected area or Indigenous land'},
 module:{pt:'unidade de área definida para cada município e usada para classificar o tamanho dos imóveis rurais',en:'a unit of area set for each municipality and used to classify rural properties by size'}
};
Object.assign(glossary,{
 sicar:{pt:'sistema do governo federal que reúne os registros do CAR',en:'the federal system that holds the Rural Environmental Registry records'},
 establishment:{pt:'unidade de produção rural contada no censo agropecuário',en:'a farm or ranch counted in the agricultural census'},
 threshold:{pt:'limite usado para separar faixas de valores',en:'a limit used to separate ranges of values'},
 median:{pt:'valor do meio quando todos os valores são postos em ordem; metade fica acima e metade abaixo',en:'the middle value when all values are put in order; half are above it and half below'},
 calibration:{pt:'ajuste de um modelo com dados de referência',en:'adjusting a model using reference data'},
 class15:{pt:'código que identifica a classe pastagem no MapBiomas',en:'the MapBiomas code for the pasture land-cover class'},
 hdf:{pt:'frequência histórica de seca na série de imagens consultada',en:'historical drought frequency in the image series used'},
 epsg:{pt:'código de um sistema de coordenadas usado para mostrar o mapa',en:'the code for a coordinate system used to display the map'},
 score:{pt:'nota de um indicador ou tema, conforme as regras publicadas do Atlas',en:'a measure or topic score under the published Atlas rules'},
 ibge:{pt:'Instituto Brasileiro de Geografia e Estatística',en:'Brazilian Institute of Geography and Statistics'},
 fao:{pt:'Organização das Nações Unidas para a Alimentação e a Agricultura',en:'Food and Agriculture Organization of the United Nations'},
 ibama:{pt:'Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis',en:'Brazilian Institute of the Environment and Renewable Natural Resources'},
 opgt:{pt:'Observatório de Políticas de Governança de Terras',en:'Land Governance Policy Observatory'}
});
const fractionRules=[
 {min:0,max:0,pt:'0 em cada 100',en:'0 in 100'},
 {min:9.5,max:11,openMax:true,pt:'cerca de 1 em cada 10',en:'about 1 in 10'},
 {min:11,max:13.5,openMax:true,pt:'cerca de 1 em cada 8',en:'about 1 in 8'},
 {min:13.5,max:15,openMax:true,pt:'cerca de 1 em cada 7',en:'about 1 in 7'},
 {min:15,max:18,pt:'cerca de 1 em cada 6',en:'about 1 in 6'},
 {min:18,max:22,openMin:true,openMax:true,pt:'cerca de 1 em cada 5',en:'about 1 in 5'},
 {min:22,max:28,openMax:true,pt:'cerca de 1 em cada 4',en:'about 1 in 4'},
 {min:28,max:100/3,openMax:true,pt:'menos de 1 em cada 3',en:'fewer than 1 in 3'},
 {min:100/3,max:38,openMax:true,pt:'cerca de 1 em cada 3',en:'about 1 in 3'},
 {min:38,max:45,openMax:true,pt:'cerca de 2 em cada 5',en:'about 2 in 5'},
 {min:45,max:50,openMax:true,pt:'quase metade',en:'almost half'},
 {min:50,max:50,pt:'metade',en:'half'},
 {min:50,max:55,openMin:true,pt:'mais da metade',en:'more than half'},
 {min:55,max:63,openMin:true,openMax:true,pt:'cerca de 3 em cada 5',en:'about 3 in 5'},
 {min:63,max:70,openMax:true,pt:'cerca de 2 em cada 3',en:'about 2 in 3'},
 {min:70,max:78,openMax:true,pt:'cerca de 3 em cada 4',en:'about 3 in 4'},
 {min:78,max:85,openMax:true,pt:'cerca de 4 em cada 5',en:'about 4 in 5'},
 {min:85,max:95,openMax:true,pt:'cerca de 9 em cada 10',en:'about 9 in 10'},
 {min:95,max:100,openMax:true,pt:'mais de 9 em cada 10',en:'more than 9 in 10'},
 {min:100,max:100,pt:'10 em cada 10',en:'10 in 10'}
];
function fraction(value,lang='pt',unit='area'){
 const pt=lang==='pt';
 if(!Number.isFinite(value))return pt?'sem dado':'no data';
 if(unit==='years'&&value>0&&value<10)return pt?'menos de 1 ano em cada 10':'fewer than 1 year in 10';
 let t=null;
 for(const r of fractionRules)if((r.openMin?value>r.min:value>=r.min)&&(r.openMax?value<r.max:value<=r.max)){t=r[lang];break;}
 if(!t)t=(value>0&&value<1?(pt?'menos de 1':'fewer than 1'):Math.round(value).toLocaleString(pt?'pt-BR':'en-US'))+(pt?' em cada 100':' in 100');
 if(unit!=='years')return t;
 if(!/\d/.test(t))return t+(pt?' dos anos':' of the years');
 return t.replace(/^(.*?\d+)( em cada| in)/,(m,n,rest)=>n+(/(^|\D)1$/.test(n)?(pt?' ano':' year'):(pt?' anos':' years'))+rest);
}
function share(value,lang,noun){const t=fraction(value,lang);return /\d/.test(t)?t+' '+noun:t+(lang==='pt'?' dos ':' of the ')+noun;}
function large(value,lang='pt'){
 if(!Number.isFinite(value))return lang==='pt'?'sem dado':'no data';
 const locale=lang==='pt'?'pt-BR':'en-US',about=lang==='pt'?'cerca de ':'about ',thousand=lang==='pt'?' mil':',000';
 if(value>=1e6||Math.round(value/1e5)>=10){const rounded=Number((value/1e6).toFixed(1));return rounded.toLocaleString(locale,{maximumFractionDigits:1})+(lang==='pt'?(rounded===1?' milhão':' milhões'):' million');}
 if(value>=1e5)return about+(Math.round(value/1e5)*100).toLocaleString(locale)+thousand;
 if(value>=1e4)return about+Math.round(value/1e3).toLocaleString(locale)+thousand;
 return Math.round(value).toLocaleString(locale);
}
function cattle(value,lang='pt'){return large(value,lang)+(lang==='pt'?(value>=1e6?' de cabeças':value===1?' cabeça':' cabeças'):' head');}
function exact(value,lang='pt'){return Number.isFinite(value)?value.toLocaleString(lang==='pt'?'pt-BR':'en-US',{maximumFractionDigits:20}):(lang==='pt'?'sem dado':'no data');}
root.AtlasPlainLanguage={glossary,fractionRules,fraction,share,large,cattle,exact};
})(typeof window==='undefined'?globalThis:window);
