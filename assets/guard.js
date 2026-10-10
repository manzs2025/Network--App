/* content protection: block copy / selection / long-press menu / drag, and hide content when the app leaves focus or a screenshot key is pressed */
(function(){
const editable=t=>t&&t.closest&&t.closest('input,textarea,select,[contenteditable="true"]');
const stop=e=>{ if(!editable(e.target)) e.preventDefault(); };
['copy','cut','contextmenu','selectstart','dragstart'].forEach(ev=>document.addEventListener(ev,stop,{capture:true}));
document.querySelectorAll('img').forEach(i=>i.setAttribute('draggable','false'));
new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{ if(n.tagName==='IMG') n.setAttribute('draggable','false'); }))).observe(document.documentElement,{childList:true,subtree:true});
const shield=document.createElement('div'); shield.className='guard-shield'; shield.innerHTML='<div><b>مبادئ شبكات الحاسب</b><span>المحتوى محمي — النسخ والتصوير غير مسموح</span></div>'; document.body.appendChild(shield);
let t; const hide=ms=>{ document.body.classList.add('guard-on'); clearTimeout(t); if(ms) t=setTimeout(show,ms); }, show=()=>document.body.classList.remove('guard-on');
document.addEventListener('keydown',e=>{ const k=(e.key||'').toLowerCase(), mod=e.ctrlKey||e.metaKey;
  if(k==='printscreen'||(e.metaKey&&e.shiftKey&&['3','4','5','s'].includes(k))||(mod&&e.shiftKey&&k==='s')){ hide(1500); try{ navigator.clipboard&&navigator.clipboard.writeText(''); }catch(_){} e.preventDefault(); return; }
  if(mod&&['c','x','s','p','u'].includes(k)&&!editable(e.target)){ e.preventDefault(); }
  if(mod&&k==='a'&&!editable(e.target)) e.preventDefault(); },true);
document.addEventListener('keyup',e=>{ if((e.key||'').toLowerCase()==='printscreen'){ hide(1500); try{ navigator.clipboard&&navigator.clipboard.writeText(''); }catch(_){} } },true);
document.addEventListener('visibilitychange',()=>{ if(document.hidden) hide(); else show(); });
window.addEventListener('blur',()=>hide()); window.addEventListener('focus',show); window.addEventListener('pagehide',()=>hide()); window.addEventListener('pageshow',show);
window.addEventListener('beforeprint',()=>hide()); window.addEventListener('afterprint',show);
})();
