/* shared app shell: theme, service worker, toast, install prompt */
(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const root=document.documentElement;
function setTheme(t){ if(t==='dark') root.setAttribute('data-theme','dark'); else root.removeAttribute('data-theme'); store.set('osi-theme',t); const m=$('meta[name=theme-color]'); if(m) m.content=t==='dark'?'#050a1a':'#f3f6fb'; }
setTheme(store.get('osi-theme')||'light');
const tb=$('#themeBtn'); if(tb) tb.onclick=()=>setTheme(root.getAttribute('data-theme')==='dark'?'light':'dark');
const toast=document.createElement('div'); toast.className='toast'; document.body.appendChild(toast); let tt;
function say(t,ms){ toast.textContent=t; toast.classList.add('show'); clearTimeout(tt); tt=setTimeout(()=>toast.classList.remove('show'),ms||1800); }
if('serviceWorker' in navigator && location.protocol!=='file:'){
  window.addEventListener('load',()=>{ navigator.serviceWorker.register('sw.js').then(reg=>{
    reg.addEventListener('updatefound',()=>{ const w=reg.installing; if(!w) return; w.addEventListener('statechange',()=>{ if(w.state==='installed'&&navigator.serviceWorker.controller) say('تم تحديث التطبيق — أعد فتحه لرؤية الجديد',4000); }); });
  }).catch(()=>{}); });
}
/* install */
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const ua=navigator.userAgent, ios=/iphone|ipad|ipod/i.test(ua)||(/macintosh/i.test(ua)&&navigator.maxTouchPoints>1);
const card=$('#installCard'); let deferred=null;
function showInstall(kind){ if(!card||standalone||store.get('app:noinstall')) return; card.hidden=false; $('#instAndroid').hidden=kind!=='a'; $('#instIos').hidden=kind!=='i'; }
window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); deferred=e; showInstall('a'); });
if(ios) showInstall('i');
const ib=$('#installBtn'); if(ib) ib.onclick=async()=>{ if(!deferred) return; deferred.prompt(); const r=await deferred.userChoice; deferred=null; if(r.outcome==='accepted'){ card.hidden=true; say('تم تثبيت التطبيق'); } };
const ix=$('#installX'); if(ix) ix.onclick=()=>{ card.hidden=true; store.set('app:noinstall','1'); };
window.addEventListener('appinstalled',()=>{ if(card) card.hidden=true; });
window.APP={$,$$,store,say,standalone};
})();
