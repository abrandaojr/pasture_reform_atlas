(function () {
  'use strict';
  const sources = [
    ['MapBiomas · Coleção 11', 'MapBiomas · Collection 11',
      '2025; 2024 na calibração', '2025; 2024 for calibration',
      'Área de pastagem mapeada, classe 15. Formações campestres nativas ficam fora dessa classe.',
      'Mapped pasture area, class 15. Native grassland formations are outside this class.',
      'https://brasil.mapbiomas.org/iniciativas-e-produtos/cobertura-e-uso-da-terra/cobertura-30m/cobertura/'],
    ['SICAR · Cadastro Ambiental Rural', 'SICAR · Rural Environmental Registry',
      'Consulta de 9/10/2026', 'Retrieved 9 October 2026',
      'Limites e situação dos cadastros. A data é a consulta da base, não a atualização individual de cada imóvel.',
      'Registration boundaries and status. The date describes the dataset retrieval, not each registration’s individual update.',
      'https://www.car.gov.br/'],
    ['Radar Verde', 'Radar Verde',
      'Base 2026; zonas preservadas de 2024 identificadas', '2026 dataset; retained 2024 zones identified',
      'Zonas potenciais de compra por frigorífico. Reconstruções documentadas são identificadas por unidade.',
      'Potential purchasing zones by slaughterhouse. Documented reconstructions are identified per plant.',
      'https://radarverde.org.br/'],
    ['OpenStreetMap · Geofabrik', 'OpenStreetMap · Geofabrik',
      'Rede viária de 8/11/2026; pontos consultados em 2026', 'Road network dated 8 November 2026; points retrieved in 2026',
      'Vias, travessias e pontos cadastrados. Os dados mantêm a atribuição aos colaboradores do OpenStreetMap e a licença ODbL.',
      'Mapped roads, crossings and locations. Data retain attribution to OpenStreetMap contributors and the ODbL licence.',
      'https://download.geofabrik.de/south-america/brazil.html'],
    ['EPE', 'EPE',
      'Ano de referência não declarado; consulta em 2026', 'Reference year unstated; retrieved in 2026',
      'Localização, tipo e situação das unidades. Milho e flex seguem a classificação da fonte; disponibilidade comercial de DDG exige outra evidência.',
      'Plant location, type and status. Corn and flex follow the source classification; commercial DDG availability requires separate evidence.',
      'https://gisepeprd2.epe.gov.br/arcgis/rest/services/WMS_Webmap_EPE_Data/MapServer/29'],
    ['CONAB · SICARM', 'CONAB · SICARM',
      'Modelo consultado em 9/11/2026; ano de estoque não informado', 'Model retrieved 9 November 2026; stock year unspecified',
      'Cadastros de armazenagem. Produto e estoque não são informados. Coordenadas divergentes do município ou UF declarados ficam como contexto.',
      'Storage registrations. Commodity and stock are unspecified. Coordinates inconsistent with the declared municipality or state remain as context.',
      'https://www.gov.br/conab/pt-br/atuacao/armazenagem/saiba-mais-sobre-o-cadastro'],
    ['Google Maps', 'Google Maps',
      'Listagens sem ano declarado; consultas em 2026', 'Listing year unstated; retrieved in 2026',
      'Locais candidatos encontrados nas buscas. Função, funcionamento e relações comerciais dependem de confirmação adicional.',
      'Candidate locations found in searches. Function, operation and commercial relationships require further confirmation.',
      'https://www.google.com/maps'],
    ['LAPIG/UFG', 'LAPIG/UFG',
      'Referência 2022 nos metadados; identificador da camada 2021', 'Metadata reference 2022; layer identifier 2021',
      'Inventário espacial de unidades frigoríficas utilizado na combinação das fontes de localização.',
      'Spatial slaughterhouse inventory used in the combined location catalogue.',
      'https://atlasdaspastagens.ufg.br/map'],
    ['Trase', 'Trase',
      'Inventário de maio de 2026', 'May 2026 inventory',
      'Localização e tipificação de estabelecimentos no catálogo combinado.',
      'Establishment location and type in the combined catalogue.',
      'https://trase.earth/open-data/search?commodity=BEEF']
  ];
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const en = () => document.documentElement.lang.startsWith('en');
  let panel;
  function render() {
    if (!panel?.isConnected) return;
    const english = en();
    panel.innerHTML = '<h3>' + (english ? 'Supply-chain sources and dates' : 'Fontes e datas da cadeia produtiva') + '</h3><div class="atlas-table-scroll"><table class="atlas-data-table"><thead><tr><th>'+(english?'Source':'Fonte')+'</th><th>'+(english?'Date or period':'Data ou período')+'</th><th>'+(english?'What the source provides':'O que a fonte informa')+'</th></tr></thead><tbody>'+sources.map(row=>'<tr><th scope="row"><a href="'+escape(row[6])+'" target="_blank" rel="noopener">'+escape(row[english?1:0])+'</a></th><td>'+escape(row[english?3:2])+'</td><td>'+escape(row[english?5:4])+'</td></tr>').join('')+'</tbody></table></div>';
  }
  function init() {
    if (document.getElementById('chain-source-catalogue')) return true;
    const evidence = document.getElementById('evidencias');
    if (!evidence || !window.ATLAS_SECONDARY_READY) return false;
    panel = document.createElement('section');
    panel.id = 'chain-source-catalogue';
    (evidence.querySelector('.wrap') || evidence).prepend(panel);
    if (!document.getElementById('chain-source-styles')) {
      const style = document.createElement('style');
      style.id = 'chain-source-styles';
      style.textContent = '#chain-source-catalogue{margin:20px 0 30px}#chain-source-catalogue h3{font-size:22px;color:#005449}.chain-source-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 24px}.chain-source-list article{padding:14px 0;border-top:1px solid #dde5e0}.chain-source-list h4{font-size:16px;margin:0 0 6px}.chain-source-list p{font-size:13px;line-height:1.5;margin:5px 0}.chain-source-year{font-weight:700}@media(max-width:650px){.chain-source-list{grid-template-columns:minmax(0,1fr)}}';
      document.head.append(style);
    }
    render();
    new MutationObserver(() => {if (!panel?.isConnected) init();}).observe(evidence,{childList:true,subtree:true});
    window.ATLAS_CHAIN_SOURCES_READY = true;
    return true;
  }
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  if (!init()) {
    const timer = setInterval(() => {if (init()) clearInterval(timer);},100);
    setTimeout(() => clearInterval(timer),60000);
  }
})();
