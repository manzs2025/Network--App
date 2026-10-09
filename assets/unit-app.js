/* unit page inside the app: remember viewed sections + last position, register service worker */
(function(){
const uid=document.body.dataset.unit; const st={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
let seen=[]; try{ seen=JSON.parse(st.get('app:seen:'+uid)||'[]'); }catch(e){}
const secs=[...document.querySelectorAll('main > .sec')];
const lbl=s=>{ const h=s.querySelector('h1,h2'); return h?h.textContent.replace(/\s+/g,' ').trim():''; };
let t=null;
const io=new IntersectionObserver(es=>es.forEach(e=>{ if(!e.isIntersecting) return; const s=e.target; if(!seen.includes(s.id)){ seen.push(s.id); st.set('app:seen:'+uid,JSON.stringify(seen)); }
  clearTimeout(t); t=setTimeout(()=>st.set('app:last',JSON.stringify({u:uid,s:s.id,t:lbl(s)})),600); }),{rootMargin:'-40% 0px -40% 0px'});
secs.forEach(s=>io.observe(s));
if('serviceWorker' in navigator && location.protocol!=='file:') window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
const m=document.querySelector('meta[name=theme-color]'); const sync=()=>{ if(m) m.content=document.documentElement.getAttribute('data-theme')==='dark'?'#050a1a':'#f3f6fb'; };
sync(); new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
})();
