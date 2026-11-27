(function(){
  function language(){return document.documentElement.lang.startsWith('en')?'en':'pt';}
  function municipality(){
    if(window.ATLAS_MAP_SELECTED_CODE)return window.ATLAS_MAP_SELECTED_CODE;
    if(typeof selected!=='undefined'&&/^\d{7}$/.test(String(selected)))return String(selected);
    if(window.ATLAS_RANKING_STATE?.selected)return String(window.ATLAS_RANKING_STATE.selected);
    if(window.ATLAS_CHAIN_ACCESS_STATE?.code)return window.ATLAS_CHAIN_ACCESS_STATE.code;
    return new URLSearchParams(location.search).get('municipio')||'1507300';
  }
  function update(){
    const en=language()==='en',url='cadeia.html?municipio='+encodeURIComponent(municipality())+'&lang='+language();
    for(const nav of document.querySelectorAll('.stepnav')){
      let link=nav.querySelector('[data-supply-chain-tab],a[href*="cadeia.html"]');
      if(!link){link=document.createElement('a');link.dataset.supplyChainTab='true';const rank=nav.querySelector('[data-ranking-tab],a[href*="ranking.html"]');if(rank)rank.after(link);else nav.append(link);}
      const title=en?'Supply chain':'Cadeia produtiva';if(link.textContent!==title)link.textContent=title;
      if(link.getAttribute('href')!==url)link.setAttribute('href',url);
      if(location.pathname.endsWith('/cadeia.html'))link.setAttribute('aria-current','page');
      for(const anchor of nav.querySelectorAll('a[href]')){
        const target=new URL(anchor.getAttribute('href'),location.href);
        const page=target.pathname.split('/').pop();
        if(!['Atlas.html','municipio.html','ranking.html','cadeia.html'].includes(page))continue;
        target.searchParams.set('municipio',municipality());
        target.searchParams.set('lang',language());
        const href=page+target.search+target.hash;
        if(anchor.getAttribute('href')!==href)anchor.setAttribute('href',href);
      }
    }
  }
  let scheduled=false;function queue(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;update();});}
  for(const nav of document.querySelectorAll('.stepnav'))new MutationObserver(queue).observe(nav,{subtree:true,childList:true});
  document.addEventListener('change',queue);document.addEventListener('click',queue);window.addEventListener('popstate',queue);
  const style=document.createElement('style');style.textContent='@media(max-width:680px){.stepnav .wrap{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 6px!important}.stepnav .wrap>a{font-size:12px!important;min-height:38px;display:flex;align-items:center;justify-content:center;text-align:center;white-space:normal}}html[data-atlas-page=map] #map-workspace{height:calc(100dvh - var(--atlas-chain-top,160px))!important}';document.head.append(style);
  const resize=()=>{const h=document.querySelector('header'),n=document.querySelector('.stepnav'),s=document.getElementById('atlas-load-status');if(h&&n)document.documentElement.style.setProperty('--atlas-chain-top',(h.getBoundingClientRect().height+n.getBoundingClientRect().height+(s?s.getBoundingClientRect().height:0))+'px');};
  if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(resize);for(const el of document.querySelectorAll('header,.stepnav,#atlas-load-status'))observer.observe(el);}window.addEventListener('resize',resize);resize();
  let hooks=false;function hook(){if(hooks||typeof setMunicipality!=='function'||typeof setLanguage!=='function')return false;hooks=true;const priorMunicipality=setMunicipality;setMunicipality=function(...args){const result=priorMunicipality(...args);queue();return result;};const priorLanguage=setLanguage;setLanguage=function(...args){const result=priorLanguage(...args);queue();return result;};return true;}
  if(!hook()){const timer=setInterval(()=>{if(hook())clearInterval(timer);},100);setTimeout(()=>clearInterval(timer),60000);}
  update();window.ATLAS_SUPPLY_CHAIN_NAVIGATION_READY=true;
})();
