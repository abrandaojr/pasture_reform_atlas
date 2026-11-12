(function(){
'use strict';
const small=matchMedia('(max-width:700px)'),en=()=>document.documentElement.lang.startsWith('en'),t=(p,e)=>en()?e:p;
let pending=false;
function sync(){pending=false;
 const nav=document.querySelector('body > .stepnav');
 if(nav){let button=nav.querySelector('.mobile-menu-toggle'),wrap=nav.querySelector(':scope>.wrap');if(wrap){if(!button){button=document.createElement('button');button.type='button';button.className='mobile-menu-toggle';button.setAttribute('aria-expanded','false');wrap.id='atlas-primary-links';button.setAttribute('aria-controls',wrap.id);nav.prepend(button);button.onclick=()=>{const open=nav.classList.toggle('mobile-menu-open');button.setAttribute('aria-expanded',String(open));};nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('mobile-menu-open');button.setAttribute('aria-expanded','false');}});nav.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('mobile-menu-open');button.setAttribute('aria-expanded','false');button.focus();}});}
 const current=wrap.querySelector('[aria-current=page]')?.textContent.trim().replace(/^\d+[.\s]*/,'')||t('Atlas','Atlas'),label=current+' · '+t('Menu','Menu')+' ☰';if(button.textContent!==label)button.textContent=label;
 }}
 for(const table of document.querySelectorAll('main table')){
  if(table.closest('.history-values')||document.documentElement.dataset.atlasTab==='ranking'||table.closest('#ranking-list'))continue;
  const header=table.tHead?.rows[table.tHead.rows.length-1];if(!header||header.cells.length<2)continue;
  const labels=[...header.cells].map(c=>c.textContent.trim());if([...header.cells].some(c=>c.colSpan!==1))continue;
  if(!table.classList.contains('mobile-record-table')){table.classList.add('mobile-record-table');table.setAttribute('role','table');table.tHead.setAttribute('role','rowgroup');header.setAttribute('role','row');for(const c of header.cells)c.setAttribute('role','columnheader');}
  for(const body of table.tBodies)for(const row of body.rows){if(row.cells.length!==labels.length)continue;if(body.getAttribute('role')!=='rowgroup')body.setAttribute('role','rowgroup');if(row.getAttribute('role')!=='row')row.setAttribute('role','row');for(let i=0;i<row.cells.length;i++){const cell=row.cells[i];const role=cell.tagName==='TH'?'rowheader':'cell';if(cell.getAttribute('role')!==role)cell.setAttribute('role',role);if(cell.dataset.mobileLabel!==labels[i])cell.dataset.mobileLabel=labels[i];}}
 }
 const stage=document.querySelector('#supply-stage-picker');if(stage){let picker=document.querySelector('#mobile-supply-stage');if(!picker){const label=document.createElement('label');label.className='mobile-stage-control';label.innerHTML='<span></span><select id="mobile-supply-stage"></select>';stage.before(label);picker=label.querySelector('select');picker.onchange=()=>stage.querySelectorAll('button')[Number(picker.value)]?.click();}
 const buttons=[...stage.querySelectorAll('button')],signature=buttons.map(b=>b.textContent).join('|');if(picker.dataset.signature!==signature){picker.replaceChildren(...buttons.map((b,i)=>new Option(b.querySelector('strong')?.textContent||b.textContent,String(i))));picker.dataset.signature=signature;}
 const index=buttons.findIndex(b=>b.getAttribute('aria-pressed')==='true');if(index>=0)picker.value=String(index);const title=t('Etapa da cadeia produtiva','Supply-chain stage');if(picker.previousElementSibling.textContent!==title)picker.previousElementSibling.textContent=title;
 }
}
const schedule=()=>{if(!pending){pending=true;setTimeout(sync,160);}};
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['lang','aria-current','aria-pressed']});
new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
document.addEventListener('click',e=>{const nav=document.querySelector('.stepnav.mobile-menu-open');if(nav&&!nav.contains(e.target)){nav.classList.remove('mobile-menu-open');nav.querySelector('.mobile-menu-toggle')?.setAttribute('aria-expanded','false');}});
small.addEventListener('change',()=>{document.querySelector('.stepnav')?.classList.remove('mobile-menu-open');document.querySelector('.mobile-menu-toggle')?.setAttribute('aria-expanded','false');window.ATLAS_ENTRY_MAP?.invalidateSize();schedule();});sync();
})();
