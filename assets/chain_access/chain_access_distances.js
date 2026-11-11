(function () {
  'use strict';
  const manifest = window.ATLAS_CHAIN_ACCESS_MANIFEST;
  if (!manifest) return;
  const cache = window.ATLAS_CHAIN_ACCESS_DATA = window.ATLAS_CHAIN_ACCESS_DATA || {};
  const pending = new Map();
  const escape = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const english = () => typeof lang !== 'undefined' ? lang === 'en' : document.documentElement.lang.startsWith('en');
  const tr = (pt, en) => english() ? en : pt;
  const format = (v, n = 1) => {if(v===null||v===undefined||!Number.isFinite(Number(v)))return tr('Sem dado','No data');const value=Number(v);if(n!==0&&value>0&&value<.1)return '<'+(.1).toLocaleString(english()?'en-US':'pt-BR');return value.toLocaleString(english()?'en-US':'pt-BR',{maximumFractionDigits:n===0?0:Math.abs(value)<10?1:0});};
  const displayLabel = value => value.replaceAll('locais deduplicados','cadastros consolidados').replaceAll('deduplicated locations','consolidated listings');
  const label = (kind, key) => {const x = manifest.labels[kind][key]; return x ? displayLabel(x[english() ? 'en' : 'pt']) : tr('Categoria sem rótulo disponível', 'Category label unavailable');};
  const sourceLabel = key => {const value=manifest.source_labels[key]?.[english() ? 'en' : 'pt'];return value?displayLabel(value):tr('Fonte sem rótulo disponível','Source label unavailable');};
  const tableView = true;
  let container, scope = document.documentElement.dataset.atlasPage === 'supply_chain' ? 'covered_brazil' : 'municipality', origin = '', destination = '', serial = 0;
  const stratum = row => row.origin_stratum || row.origin_category;
  function selectedCode() {
    if (typeof selected !== 'undefined' && /^\d{7}$/.test(String(selected))) return String(selected);
    return new URLSearchParams(location.search).get('municipio') || '1507300';
  }
  function load(key) {
    if (cache[key]) return Promise.resolve(cache[key]);
    if (!manifest.assets[key]) return Promise.resolve([]);
    if (pending.has(key)) return pending.get(key);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = manifest.assets[key];
      script.onload = () => resolve(cache[key] || []);
      script.onerror = () => reject(new Error('distance_asset_unavailable'));
      document.head.append(script);
    });
    pending.set(key, promise);
    return promise;
  }
  function options(node, choices, value, all) {
    node.innerHTML = (all ? '<option value="'+all[0]+'">'+escape(all[1])+'</option>' : '') + choices.map(k => '<option value="' + escape(k) + '">' + escape(label(node.id === 'chain-access-origin' ? 'origins' : 'references', k)) + '</option>').join('');
    if (choices.includes(value) || all && value === all[0]) node.value = value;
  }
  const distanceAvailable = r => r.n_distance>0 && r.mean_distance_km!==null && Number.isFinite(Number(r.mean_distance_km)) && r.sd_population_km!==null && r.status!=='origin_state_without_complete_processed_CAR_cohort';
  function distanceOverview(rows) {
    if(!rows.length)return '<p>'+tr('Sem comparações disponíveis nesta seleção.','No comparisons are available for this selection.')+'</p>';
    const available=rows.filter(distanceAvailable),maximum=Math.max(0,...available.map(r=>Number(r.mean_distance_km))),axisMaximum=maximum||1;
    const grouped=new Map();for(const row of rows){const key=stratum(row);if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(row);}
    const locale=english()?'en-US':'pt-BR',exact=v=>Number(v).toLocaleString(locale,{maximumFractionDigits:3});
    const reason=r=>r.status==='origin_state_without_complete_processed_CAR_cohort'?tr('Cadastro CAR incompleto neste estado; média não publicada.','Property registration data are incomplete for this state; no mean is published.'):r.reference_source==='none'?tr('Não há vínculo de fornecimento documentado. Estar perto não comprova fornecimento.','No supply relationship is documented. Being nearby does not establish supply.'):tr('Faltam locais ou dados que atendam aos critérios desta seleção.','Locations or observations meeting the selection criteria are missing.');
    const groups=[...grouped.entries()].sort((a,b)=>label('origins',a[0]).localeCompare(label('origins',b[0]))).map(([key,group])=>{
      group.sort((a,b)=>Number(distanceAvailable(b))-Number(distanceAvailable(a))||(distanceAvailable(a)?a.mean_distance_km-b.mean_distance_km:0)||label('references',a.reference_group).localeCompare(label('references',b.reference_group)));
      return '<tr class="distance-origin-heading"><th colspan="5" scope="rowgroup">'+tr('Origem: ','Origin: ')+escape(label('origins',key))+'</th></tr>'+group.map(r=>{
        const valid=distanceAvailable(r),width=valid?100*r.mean_distance_km/axisMaximum:0,rowKey=[key,r.reference_group,r.reference_source,r.reference_stratum||'',r.reference_evidence_class].join('|'),source=r.reference_source==='none'?tr('Sem fonte de vínculo','No relationship source'):sourceLabel(r.reference_source);
        return '<tr class="distance-comparison unified-distance-row'+(valid?'':' distance-no-value')+'" data-distance-key="'+escape(rowKey)+'" data-available="'+valid+'"'+(valid?' data-mean-km="'+r.mean_distance_km+'"':'')+' data-distance-count="'+r.n_distance+'"><td><details><summary><span class="distance-row-label"><span>'+escape(label('references',r.reference_group))+'</span><small>'+escape(source)+' · '+escape(label('evidence',r.reference_evidence_class))+'</small></span></summary><div class="distance-row-detail">'+(valid?'<p>'+tr('Média em linha reta','Mean straight-line distance')+': '+exact(r.mean_distance_km)+' km. '+tr('Desvio padrão','Standard deviation')+': '+exact(r.sd_population_km)+' km.</p>':'<p>'+reason(r)+'</p>')+'<p>'+format(r.n_distance,0)+tr(' locais com cálculo',' locations calculated')+' · '+format(r.n_missing,0)+tr(' sem cálculo',' not calculated')+' · '+format(r.n_origins,0)+tr(' locais de origem na base.',' origin locations in the dataset.')+'</p></div></details></td><td class="distance-number-cell">'+(valid?'<strong class="distance-row-value">'+escape(format(r.mean_distance_km))+' ± '+escape(format(r.sd_population_km))+' <small>km</small></strong><span class="distance-comparison-track unified-distance-track" aria-hidden="true"><span style="width:'+width+'%"></span></span>':'<span class="distance-missing-label">'+tr('Sem cálculo','Not calculated')+'</span>')+'</td><td>'+escape(valid?format(r.min_distance_km):tr('Sem dado','No data'))+'</td><td>'+escape(valid?format(r.max_distance_km):tr('Sem dado','No data'))+'</td><td>'+format(r.n_distance,0)+'</td></tr>';
      }).join('');
    }).join('');
    return '<figure class="distance-overview distance-unified" aria-labelledby="distance-figure-title" data-chart-rows="'+rows.length+'" data-axis-maximum="'+maximum+'"><figcaption><h3 id="distance-figure-title">'+tr('O que fica perto e o que fica longe','What is nearby and what is farther away')+'</h3><p>'+tr('Para cada local de origem, buscamos o destino mais próximo de cada tipo. A tabela resume essas distâncias.','For each origin location, we find the nearest destination of each type. The table summarizes those distances.')+'</p><p class="distance-measure-note">'+tr('Média = distância típica do conjunto. O número após ± é o desvio padrão: quanto as distâncias variam entre os locais. Não é distância mínima ou máxima.','Mean = the average distance across locations. The number after ± is the standard deviation: how much distances vary across locations. It is not a minimum or maximum distance.')+'</p><p>'+tr('Em linha reta, sem seguir estradas. Proximidade não comprova fornecimento.','Straight-line distances, without following roads. Proximity does not establish supply.')+'</p></figcaption><button type="button" class="distance-replay">'+tr('Revelar a comparação','Reveal the comparison')+'</button><table class="distance-results-table"><thead><tr><th scope="col">'+tr('Destino mais próximo · fonte','Nearest destination · source')+'</th><th scope="col">'+tr('Média ± desvio padrão (km)','Mean ± standard deviation (km)')+'<span class="distance-table-axis"><span>0</span><span>'+escape(format(maximum))+' km</span></span></th><th>'+tr('Mínimo (km)','Minimum (km)')+'</th><th>'+tr('Máximo (km)','Maximum (km)')+'</th><th>'+tr('Locais','Locations')+'</th></tr></thead><tbody>'+groups+'</tbody></table><p class="reading-footnote">'+tr('Todos os resultados da seleção estão na tabela. Barras maiores = distâncias maiores, na mesma escala. Toque no destino para ver detalhes. Sem cálculo não significa zero. Mínimo e máximo aparecem como sem dado quando não estão disponíveis na base.','All results for the selection are in the table. Longer bars mean longer distances, on the same scale. Select a destination for details. Not calculated does not mean zero. Minimum and maximum are marked as unavailable when absent from the dataset.')+'</p></figure>';
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('.distance-replay');if(!button)return;
    const panel=button.closest('.distance-overview');panel.classList.remove('distance-reveal');void panel.offsetWidth;panel.classList.add('distance-reveal');
  });
  function distanceTable(rows) { return distanceOverview(rows); }
  function rowCard(row, heading) {
    if (!row || !row.n_distance || row.status === 'origin_state_without_complete_processed_CAR_cohort' || row.mean_distance_km === null || row.sd_population_km === null) return '<article class="chain-access-card"><h3>' + escape(heading) + '</h3><p>' + (row?.status === 'origin_state_without_complete_processed_CAR_cohort' ? tr('Coorte CAR incompleta neste estado; média e desvio padrão não publicados.', 'Incomplete CAR cohort in this state; mean and standard deviation are withheld.') : tr('Sem distância calculável neste recorte.', 'No calculable distance in this scope.')) + '</p>' + (row ? '<p>' + tr('Origens consideradas: ', 'Origins considered: ') + format(row.n_origins,0) + tr(' · sem distância: ', ' · missing distance: ') + format(row.n_missing,0) + '</p>' : '') + '</article>';
    return '<article class="chain-access-card"><h3>' + escape(heading) + '</h3><p class="chain-access-value">' + format(row.mean_distance_km) + ' ± ' + format(row.sd_population_km) + ' <span>km</span></p><p>' + tr('Distância média em linha reta ao ponto disponível mais próximo','Mean straight-line distance to the nearest available point') + '</p><p>' + format(row.n_distance,0)+tr(' origens com cálculo',' origins calculated')+(row.n_missing?' · '+format(row.n_missing,0)+tr(' sem cálculo',' not calculated'):'')+'</p><details class="reading-detail"><summary>'+tr('Variação entre os locais e valor exato','Variation across locations and exact value')+'</summary><p>'+tr('Média','Mean')+': '+Number(row.mean_distance_km).toLocaleString(english()?'en-US':'pt-BR',{maximumFractionDigits:6})+' km. '+tr('Desvio padrão','Standard deviation')+': '+format(row.sd_population_km)+' km. '+tr('Descreve quanto as distâncias variam entre locais, não um limite mínimo ou máximo.','Describes variation among locations, not a minimum or maximum.')+'</p></details></article>';
  }
  async function render() {
    if (!container) return;
    const request = ++serial, code = selectedCode(), uf = manifest.municipality_uf[code];
    const municipality = typeof byCode !== 'undefined' && byCode.get ? byCode.get(code) : null;
    const placeName = municipality?.nome || municipality?.name || code;
    container.querySelector('h2').textContent = tr('Distâncias na cadeia produtiva', 'Supply-chain distances');
    container.querySelector('[data-chain-intro]').textContent = tr('Distâncias em linha reta entre pontos mapeados. Cada origem é comparada ao ponto mapeado mais próximo do tipo selecionado.', 'Straight-line distances between mapped points. Each origin is compared with the nearest mapped point of the selected type.');
    container.querySelector('[for=chain-access-scope]').textContent = tr('Recorte', 'Scope');
    container.querySelector('[for=chain-access-origin]').textContent = tr('Partindo de que tipo de local?', 'Starting from which type of location?');
    container.querySelector('[for=chain-access-destination]').textContent = tr('Procurando o que por perto?', 'Looking for what nearby?');
    const scopeSelect = container.querySelector('#chain-access-scope');
    scopeSelect.innerHTML = [['municipality',tr('Município: ','Municipality: ')+placeName],['uf',tr('Estado: ','State: ')+(uf || tr('não selecionado','not selected'))],['covered_brazil',tr('Brasil com dados disponíveis','Brazil with available data')]].map(([v,t]) => '<option value="'+v+'">'+escape(t)+'</option>').join('');
    scopeSelect.value = scope;
    container.querySelector('[data-chain-status]').textContent = tr('Carregando as estatísticas deste recorte…', 'Loading statistics for this scope…');
    let rows;
    try {rows = await load(scope === 'covered_brazil' ? 'BR' : uf);} catch (_) {
      if (request !== serial) return;
      container.querySelector('[data-chain-status]').textContent = tr('Não foi possível abrir as estatísticas locais. Mantenha a pasta assets junto ao Atlas.', 'Local statistics could not be opened. Keep the assets folder beside the Atlas.');
      return;
    }
    if (request !== serial) return;
    rows = rows.filter(r => r.level === scope && (scope !== 'municipality' || String(r.municipality_code) === code));
    const origins = [...new Set(rows.map(stratum))].sort((a,b) => label('origins',a).localeCompare(label('origins',b)));
    if (!origins.includes(origin) && !(tableView && origin==='__all_origins__')) origin = stratum(rows.find(r => r.origin_category === 'feedlot') || rows[0] || {origin_category:''});
    options(container.querySelector('#chain-access-origin'), origins, origin, tableView?['__all_origins__',tr('Todas as origens','All origins')]:null);
    const destinations = [...new Set(rows.filter(r => origin==='__all_origins__'||stratum(r) === origin).map(r => r.reference_group))].sort((a,b) => label('references',a).localeCompare(label('references',b)));
    if (!destinations.includes(destination) && !(tableView && destination==='__all_destinations__')) destination = tableView?'__all_destinations__':['grain_generic_infrastructure','corn_grain_storage_trade','corn_ethanol_potential_coproduct','sanitary_local_office'].find(x => destinations.includes(x)) || destinations[0] || '';
    options(container.querySelector('#chain-access-destination'), destinations, destination, tableView?['__all_destinations__',tr('Todos os destinos','All destinations')]:null);
    const matches = rows.filter(r => (origin==='__all_origins__'||stratum(r) === origin) && (destination==='__all_destinations__'||r.reference_group === destination));
    container.querySelector('[data-chain-results]').innerHTML = tableView?distanceTable(matches):matches.length ? matches.map(r => rowCard(r, label('origins', origin) + ' → ' + label('references', destination) + ' · ' + sourceLabel(r.reference_source)) + '<p class="chain-access-evidence">' + escape(sourceLabel(r.reference_source)) + ' · ' + escape(label('evidence', r.reference_evidence_class)) + '</p>').join('') : '<p>' + tr('Sem resultado para esta combinação. Ausência na base não comprova ausência no território.', 'No result for this combination. Absence from the dataset does not establish absence in the territory.') + '</p>';
    const coverage = manifest.car_coverage_uf || [];
    const originCategory = matches[0]?.origin_category || rows.find(r => stratum(r) === origin)?.origin_category;
    const car = matches.some(row=>row.origin_category==='CAR_active_pending_pasture_gt1ha'||row.reference_group==='active_pending_pasture_gt1ha');
    container.querySelector('[data-chain-status]').textContent = rows.length ? tr('Estatísticas dos locais mapeados; não são um censo da cadeia.', 'Statistics describe mapped locations; they are not a supply-chain census.') : tr('Sem estatísticas neste recorte. Isso não equivale a distância zero.', 'No statistics in this scope. This does not mean zero distance.');
    const certifiedNearest = matches.length > 0 && matches.every(r => r.relation === 'feedlot_to_nearest_eligible_CAR_national_certified') && manifest.certified_feedlot_car_national;
    container.querySelector('[data-chain-coverage]').textContent = certifiedNearest ? tr('Para cada confinamento, a busca nacional verifica os CARs mais próximos até encontrar um cadastro CAR rural ativo ou pendente com mais de 1 ha de pasto em 2025. Isso não constitui um censo nacional de cadastros CAR rurais com pastagem.', 'For each feedlot, the national search checks nearby CARs until finding an active or pending rural CAR registration with more than 1 ha of pasture in 2025. This does not constitute a national census of rural CAR registrations with pasture.') : car ? tr('CARs ativos ou pendentes, rurais, com mais de 1 ha de pasto em 2025. UFs de origem dos cadastros processados: ', 'Active or pending rural CARs with more than 1 ha of pasture in 2025. Source states of processed registrations: ') + coverage.join(', ') + (scope !== 'covered_brazil' && uf && !coverage.includes(uf) ? tr('. O estado selecionado ainda não tem essa coorte processada.', '. The selected state does not yet have this processed cohort.') : '.') : '';
    container.querySelector('[data-chain-method-title]').textContent = tr('Como interpretar as distâncias', 'How to interpret these distances');
    container.querySelector('[data-chain-method]').textContent = tr('A média usa uma distância por origem. O desvio padrão descreve a dispersão dessas distâncias, e não a incerteza da estimativa. Com uma única origem, o desvio padrão é zero. Os CARs usam pontos internos representativos dos polígonos, não sedes observadas. O município é o desses pontos. A pastagem corresponde à classe 15 do MapBiomas; campos naturais não entram nessa definição. Proximidade não comprova compra de milho, fornecimento de gado ou atendimento sanitário. Para os órgãos sanitários, a comparação principal permanece na mesma UF; isso não confirma competência administrativa. Cadastros incompletos podem elevar a distância ao ponto disponível mais próximo.', 'The mean uses one distance per origin. The standard deviation describes the spread of those distances, not estimation uncertainty. With one origin, the standard deviation is zero. CARs use representative interior polygon points, not observed farm headquarters. Municipality follows these points. Pasture means MapBiomas class 15; natural grasslands are excluded. Proximity does not establish corn purchases, cattle supply or sanitary service. The main sanitary-office comparison remains within the same state; this does not establish administrative jurisdiction. Incomplete records can increase distance to the nearest available point.');
    window.ATLAS_CHAIN_ACCESS_READY = true;
    window.ATLAS_CHAIN_ACCESS_STATE = {code, scope, origin, origin_category:originCategory, destination, rows:matches};
  }
  function init() {
    if (!document.getElementById('resumo') || !window.ATLAS_SECONDARY_READY) return false;
    if (window.ATLAS_PAGE_READY === 'map' || document.documentElement.dataset.atlasPage === 'map') return true;
    container = document.createElement('section');
    container.id = 'chain-access-distances';
    container.className = 'section';
    container.innerHTML = '<div class="wrap"><h2></h2><p data-chain-intro></p><div class="chain-access-filters"><label for="chain-access-scope"></label><select id="chain-access-scope"></select><label for="chain-access-origin"></label><select id="chain-access-origin"></select><label for="chain-access-destination"></label><select id="chain-access-destination"></select></div><p data-chain-status role="status"></p><div data-chain-results></div><p data-chain-coverage class="chain-access-coverage"></p><details><summary data-chain-method-title></summary><p data-chain-method></p></details></div>';
    const indicators = document.getElementById('indicadores');
    (indicators || document.getElementById('resumo')).after(container);
    const css = document.createElement('style');
    css.textContent = '#chain-access-distances{border-top:1px solid #dde5e0}#chain-access-distances h2{font-size:22px;color:#005449;margin:0 0 12px}.chain-access-filters{display:grid;grid-template-columns:180px minmax(0,1fr);gap:10px 16px;align-items:center;margin:18px 0}.chain-access-filters select{width:100%;max-width:100%;min-height:44px;font:inherit;color:inherit;background:white;border:1px solid #becdc5;border-radius:6px;padding:8px}.chain-access-card{padding:18px 0;border-top:1px solid #dde5e0}.chain-access-card h3{font-size:16px;margin:0 0 12px}.chain-access-value{font-size:32px;font-weight:700;margin:8px 0}.chain-access-value span{font-size:22px;font-weight:400}.chain-access-card p:not(.chain-access-value),.chain-access-evidence,.chain-access-coverage,#chain-access-distances details p{font-size:13px;line-height:1.5}.chain-access-coverage{background:#fff5da;padding:10px}.chain-access-coverage:empty{display:none}#chain-access-distances details{margin-top:14px}#chain-access-distances summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:700}@media(max-width:600px){.chain-access-filters{grid-template-columns:minmax(0,1fr);gap:6px}.chain-access-filters select{margin-bottom:8px}.chain-access-value{font-size:28px}.chain-access-value span{font-size:20px}}';
    document.head.append(css);
    if(tableView){
      const tableCSS=document.createElement('style');
      tableCSS.textContent='.chain-distance-table{width:100%;border-collapse:collapse;table-layout:fixed;margin:20px 0;font-size:13px}.chain-distance-table caption{text-align:left;padding:0 0 12px;font-size:13px;color:#4e6057}.chain-distance-table th{background:#f2f4f3;font-size:12px;text-align:left;padding:12px 8px;border-bottom:2px solid #b6c5bc;vertical-align:bottom}.chain-distance-table td{padding:14px 8px;border-bottom:1px solid #dbe3de;vertical-align:top;overflow-wrap:anywhere}.chain-distance-table th:nth-child(1){width:21%}.chain-distance-table th:nth-child(2){width:24%}.chain-distance-table th:nth-child(3),.chain-distance-table th:nth-child(4){width:11%}.chain-distance-table th:nth-child(5),.chain-distance-table th:nth-child(6){width:10%}.chain-distance-table th:nth-child(7){width:13%}.chain-distance-table small{display:block;font-size:11px;color:#52665a;margin-top:5px}.chain-distance-number{text-align:right;font-variant-numeric:tabular-nums;font-size:15px}.chain-source-evidence{display:inline-block;position:relative;margin:0 0 0 4px!important}.chain-source-evidence summary{display:inline-flex!important;align-items:center;justify-content:center!important;width:44px;min-height:44px!important;border:1px solid #71867a;border-radius:50%;font:13px Arial!important;list-style:none;cursor:pointer}.chain-source-evidence summary::-webkit-details-marker{display:none}.chain-source-evidence>div{position:absolute;z-index:1500;right:0;top:48px;width:min(280px,calc(100vw - 40px));padding:12px;background:white;border:1px solid #aabbb0;font-size:13px;line-height:1.5;overflow-wrap:anywhere}.chain-distance-missing li{margin:10px 0;font-size:13px}@media(max-width:800px){.chain-distance-table,.chain-distance-table tbody{display:block}.chain-distance-table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.chain-distance-table tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px;padding:18px 0;border-bottom:1px solid #c8d5cc}.chain-distance-table td{display:block;padding:0;border:0;min-width:0;text-align:left;font-size:14px}.chain-distance-table td:nth-child(7){grid-column:1/-1}.chain-distance-table td:before{content:attr(data-label);display:block;font-size:11px;font-weight:400;color:#52665a;margin-bottom:4px}.chain-distance-table td.chain-distance-number{font-size:22px;font-weight:700}.chain-distance-table small{font-size:11px}.chain-source-evidence>div{position:fixed;left:20px;right:20px;top:auto;bottom:20px;width:auto}.chain-access-filters{grid-template-columns:minmax(0,1fr)}}';
      document.head.append(tableCSS);
    }
    container.querySelector('#chain-access-scope').onchange = e => {scope=e.target.value;render();};
    container.querySelector('#chain-access-origin').onchange = e => {origin=e.target.value;destination='';render();};
    container.querySelector('#chain-access-destination').onchange = e => {destination=e.target.value;render();};
    container.addEventListener('toggle',event=>{
      if(event.target.matches('.chain-source-evidence')&&event.target.open){
        for(const item of container.querySelectorAll('.chain-source-evidence[open]'))if(item!==event.target)item.open=false;
      }
    },true);
    container.addEventListener('keydown',event=>{
      if(event.key==='Escape')for(const item of container.querySelectorAll('.chain-source-evidence[open]'))item.open=false;
    });
    const priorLanguage = setLanguage;
    setLanguage = function(...args) {const out=priorLanguage(...args);render();return out;};
    const priorMunicipality = setMunicipality;
    setMunicipality = function(...args) {const out=priorMunicipality(...args);requestAnimationFrame(render);return out;};
    render();
    return true;
  }
  if (!init()) {const timer=setInterval(() => {if(init()) clearInterval(timer);},100);setTimeout(() => clearInterval(timer),60000);}
})();
