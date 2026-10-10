/* ===== practice engine (shared by all units) ===== */
window.PR=(function(){
const {$,$$,store,say}=APP;
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1)), pick=a=>a[ri(0,a.length-1)];
const shuffle=a=>{ a=[...a]; for(let i=a.length-1;i>0;i--){ const j=ri(0,i); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* keep Latin / address fragments readable inside Arabic text */
const bidi=s=>esc(s).replace(/\(([^()]*[A-Za-z0-9][^()]*)\)/g,(m,x)=>/[؀-ۿ]/.test(x)?m:'<bdi dir="ltr">('+x+')</bdi>').replace(/(^|[\s،:]|>)([A-Za-z0-9]*[:.\/][A-Za-z0-9:.\/]*[A-Za-z0-9\/])(?=$|[\s،.؟)<])/g,(m,a,b)=>a+'<bdi dir="ltr">'+b+'</bdi>');
/* Arabic-Indic digits and separators → Latin */
const norm=s=>String(s||'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٫،,]/g,'.').replace(/\s+/g,'');
const ipNorm=s=>{ const t=norm(s); const m=t.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(\/\d{1,2})?$/); if(!m) return null; const o=m.slice(1,5).map(Number); if(o.some(x=>x>255)) return null; return {ip:o.join('.'),pre:m[5]?+m[5].slice(1):null}; };
const ok=(t,h)=>({ok:true,html:`<b class="t">${t||'إجابة صحيحة'}</b>${h||''}`});
const no=(t,h)=>({ok:false,html:`<b class="t">${t||'إجابة غير صحيحة'}</b>${h||''}`});
const selectable=(b,self,attr)=>$$('.opt',b).forEach(o=>o.onclick=()=>{ if(o.disabled) return; $$('.opt',b).forEach(x=>x.classList.remove('sel')); o.classList.add('sel'); self.sel=o.dataset[attr]; clearErr(); });
let clearErr=()=>{};

/* --- multiple-choice round (bank: [question, [correct, ...wrong], explanation]) --- */
function mcq(o){ const QN=o.count||10;
  return {id:o.id||'quiz',icon:o.icon||'i-quiz',title:o.title||'اختبار سريع',desc:o.desc||`${QN} أسئلة متنوعة من الوحدة مع شرح لكل إجابة.`,quiz:true,QN,
  make(){ if(!this.round||this.round.i>=QN){ this.round={qs:shuffle(o.bank).slice(0,QN),i:0,score:0}; } const r=this.round, it=r.qs[r.i]; return {it,opts:shuffle(it[1].map((t,k)=>({t,k}))),i:r.i}; },
  render(q,b){ b.innerHTML=`<div class="qprog"><i style="width:${q.i/QN*100}%"></i></div><div class="qlabel">السؤال ${q.i+1} من ${QN}</div><div class="qtext">${bidi(q.it[0])}</div>
    <div class="opts list">${q.opts.map(x=>`<button type="button" class="opt" data-k="${x.k}"><span dir="auto">${esc(x.t)}</span></button>`).join('')}</div>`; this.sel=null; selectable(b,this,'k'); },
  hint(q){ const w=q.opts.filter(x=>x.k!==0); return 'الخيار «⁨'+pick(w).t+'⁩» ليس هو الإجابة.'; },
  check(q,b){ if(this.sel===null) return {err:'اختر إجابة أولًا'}; const s=+this.sel; $$('.opt',b).forEach(x=>{ x.disabled=true; if(+x.dataset.k===0) x.classList.add('ok'); else if(+x.dataset.k===s) x.classList.add('no'); });
    const r=this.round; r.i++; const good=s===0; if(good) r.score++; $('.qprog i',b).style.width=(r.i/QN*100)+'%';
    return good?ok('',`<br>${bidi(q.it[2])}`):no('',`<br>${bidi(q.it[2])}`); }}; }

/* --- classify: show an item, choose its category (items: [text, catKey, explanation]) --- */
function classify(o){ let last=-1;
  return {id:o.id,icon:o.icon,title:o.title,desc:o.desc,
  make(){ let i; do{ i=ri(0,o.items.length-1); }while(o.items.length>1&&i===last); last=i; const it=o.items[i]; return {t:it[0],k:it[1],x:it[2]||'',cats:o.shuffleCats?shuffle(o.cats):o.cats}; },
  render(q,b){ b.innerHTML=`<div class="qlabel">${esc(o.label)}</div><div class="item">${typeof q.t==="object"?q.t.html:bidi(q.t)}</div>
    <div class="opts ${o.cats.length<=3&&o.cats.every(c=>c.t.length<=(o.cats.length===2?26:12))?'g'+o.cats.length:'list'}">${q.cats.map(c=>`<button type="button" class="opt" data-c="${c.k}"><span dir="auto">${bidi(c.t)}</span></button>`).join('')}</div>`; this.sel=null; selectable(b,this,'c'); },
  hint:o.hint?(q=>typeof o.hint==='function'?o.hint(q):o.hint):undefined,
  check(q,b){ if(this.sel===null) return {err:'اختر إجابة أولًا'}; $$('.opt',b).forEach(x=>{ x.disabled=true; if(x.dataset.c===q.k) x.classList.add('ok'); else if(x.dataset.c===this.sel) x.classList.add('no'); });
    const cat=o.cats.find(c=>c.k===q.k); const sol=`<br>الإجابة: <b>${bidi(cat.t)}</b>${q.x?'<br>'+bidi(q.x):''}`; return this.sel===q.k?ok('',q.x?'<br>'+bidi(q.x):''):no('',sol); }}; }

/* --- order: tap items in the correct sequence (sets: [{prompt, items:[{t,sw?}], explain}]) --- */
function order(o){
  return {id:o.id,icon:o.icon,title:o.title,desc:o.desc,
  make(){ const s=pick(o.sets); return {s,pool:shuffle(s.items.map((x,i)=>({...x,i})))}; },
  render(q,b){ const n=q.s.items.length; this.picked=[];
    b.innerHTML=`<div class="qlabel">${esc(o.label||'رتّب العناصر بالضغط عليها بالترتيب الصحيح')}</div><div class="qtext">${bidi(q.s.prompt)}</div>
    <ol class="seq" id="seq">${Array.from({length:n},(_,k)=>`<li data-k="${k}"><span class="sn">${k+1}</span><span class="sv"></span></li>`).join('')}</ol>
    <div class="pool" id="pool">${q.pool.map(x=>`<button type="button" class="chipb" data-i="${x.i}">${x.sw?`<i class="sw" style="${x.sw}"></i>`:''}<span dir="auto">${bidi(x.t)}</span></button>`).join('')}</div>
    <div class="seqctl"><button type="button" class="btn ghost sm" id="undo"><svg class="ic"><use href="#i-reset"/></svg>تراجع</button></div>`;
    const draw=()=>{ $$('#seq li',b).forEach((li,k)=>{ const p=this.picked[k]; const it=p!==undefined?q.s.items[p]:null; li.classList.toggle('fill',!!it); $('.sv',li).innerHTML=it?(it.sw?`<i class="sw" style="${it.sw}"></i>`:'')+`<span dir="auto">${bidi(it.t)}</span>`:''; });
      $$('#pool .chipb',b).forEach(c=>c.disabled=this.picked.includes(+c.dataset.i)); };
    $$('#pool .chipb',b).forEach(c=>c.onclick=()=>{ if(this.done||c.disabled) return; this.picked.push(+c.dataset.i); clearErr(); draw(); });
    $('#undo',b).onclick=()=>{ if(this.done) return; this.picked.pop(); draw(); }; this.done=false; draw(); },
  hint(q){ const k=this.picked.findIndex((p,i)=>p!==i); const pos=k===-1?this.picked.length:k; const it=q.s.items[pos]; return it?`العنصر رقم ${pos+1} هو: «⁨${it.t}⁩».`:null; },
  check(q,b){ const n=q.s.items.length; if(this.picked.length<n) return {err:'رتّب جميع العناصر أولًا'}; this.done=true; let good=0;
    $$('#seq li',b).forEach((li,k)=>{ const r=this.picked[k]===k; li.classList.add(r?'ok':'no'); if(r) good++; });
    const sol='<br>الترتيب الصحيح: '+q.s.items.map((x,k)=>`${k+1}) ${bidi(x.t)}`).join(' — ')+(q.s.explain?'<br>'+bidi(q.s.explain):'');
    return good===n?ok('ترتيب صحيح',q.s.explain?'<br>'+bidi(q.s.explain):''):no(`${good} من ${n} في مكانها الصحيح`,sol); }}; }

/* ---------- engine ---------- */
function run(UID,D){
const KEY='app:prac:'+UID;
let stats={}; try{ stats=JSON.parse(store.get(KEY)||'{}'); }catch(e){}
const saveStats=()=>store.set(KEY,JSON.stringify(stats));
const menu=$('#menu'), view=$('#drill'), box=$('#qbody'), fb=$('#fb'), err=$('#err'), chk=$('#chk'), nxt=$('#nxt'), hnt=$('#hnt'), hbox=$('#hbox');
let cur=null, q=null, done=false, sess={c:0,a:0,s:0}, fromMenu=false;
clearErr=()=>{ err.textContent=''; }; APP.clearErr=clearErr;
function drawMenu(){ $('#drills').innerHTML=D.map(d=>{ const s=stats[d.id]||{c:0,a:0,best:0}; const m=s.c>=5;
  return `<button class="panel dcard" data-d="${d.id}"><span class="di"><svg class="ic"><use href="#${d.icon}"/></svg></span><div><h3>${d.title}</h3><p>${d.desc}</p>
  <div class="st">${m?'<span class="chip ok"><svg class="ic"><use href="#i-check"/></svg>متقَن</span>':''}<span class="chip">صحيح: ${s.c}</span><span class="chip">أفضل سلسلة: ${s.best||0}</span></div></div><svg class="ic"><use href="#i-left"/></svg></button>`; }).join('');
  $$('#drills .dcard').forEach(c=>c.onclick=()=>{ fromMenu=true; location.hash=c.dataset.d; }); }
function scoreTxt(){ $('#sc1').textContent='صحيح '+sess.c+' من '+sess.a; $('#sc2').textContent='سلسلة '+sess.s; }
function newQ(){ q=cur.make(); done=false; cur.render(q,box); fb.className='fb'; fb.innerHTML=''; err.textContent=''; hbox.hidden=true; chk.hidden=false; nxt.hidden=true; hnt.hidden=!cur.hint;
  const inp=$('input.in',box); if(inp&&matchMedia('(hover:hover)').matches) inp.focus(); }
function open(id){ cur=D.find(d=>d.id===id); if(!cur){ menu.hidden=false; view.hidden=true; drawMenu(); return; }
  sess={c:0,a:0,s:0}; if(cur.quiz) cur.round=null; $('#dtitle').textContent=cur.title; menu.hidden=true; view.hidden=false; $('#result').hidden=true; $('#qwrap').hidden=false; scoreTxt(); newQ(); scrollTo(0,0); }
function check(){ if(done||!cur) return; const r=cur.check(q,box); if(r.err){ err.textContent=r.err; box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); return; }
  done=true; sess.a++; const s=stats[cur.id]||(stats[cur.id]={c:0,a:0,best:0}); s.a++;
  if(r.ok){ sess.c++; sess.s++; s.c++; s.best=Math.max(s.best,sess.s); } else sess.s=0; saveStats(); scoreTxt();
  fb.className='fb show '+(r.ok?'ok':'no'); fb.innerHTML=r.html; fb.classList.add('pop'); chk.hidden=true; hnt.hidden=true; nxt.hidden=false;
  if(sess.s>0&&sess.s%5===0) say('رائع! '+sess.s+' إجابات صحيحة متتالية');
  if(cur.quiz&&cur.round.i>=cur.QN) nxt.innerHTML='<svg class="ic"><use href="#i-flag"/></svg>النتيجة'; else nxt.innerHTML='التالي<svg class="ic"><use href="#i-left"/></svg>';
  setTimeout(()=>fb.scrollIntoView({behavior:'smooth',block:'nearest'}),60); }
function next(){ if(cur.quiz&&cur.round&&cur.round.i>=cur.QN){ const r=cur.round, QN=cur.QN, p=Math.round(r.score/QN*100); $('#qwrap').hidden=true; const R=$('#result'); R.hidden=false;
    $('#rring').style.setProperty('--p',p); $('#rval').textContent=r.score+' من '+QN; $('#rmsg').textContent=p>=90?'ممتاز! استيعاب رائع للوحدة':p>=70?'جيد جدًا، راجع الأسئلة التي أخطأت فيها':p>=50?'جيد، ننصح بمراجعة الشرح ثم المحاولة مرة أخرى':'راجع شرح الوحدة ثم أعد المحاولة'; cur.round=null; return; }
  newQ(); }
chk.onclick=check; nxt.onclick=next;
hnt.onclick=()=>{ const t=cur.hint&&cur.hint(q,box); if(t){ hbox.textContent=t; hbox.hidden=false; } };
box.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target.matches('input')){ e.preventDefault(); if(!done) check(); else next(); } });
box.addEventListener('input',()=>{ err.textContent=''; });
$('#again').onclick=()=>open(cur.id);
$('#toMenu').onclick=()=>{ if(fromMenu){ history.back(); } else { history.replaceState(null,'',location.pathname); open(null); } };
addEventListener('hashchange',()=>{ if(!location.hash) fromMenu=false; open(location.hash.slice(1)); });
open(location.hash.slice(1));
}
return {ri,pick,shuffle,esc,bidi,norm,ipNorm,ok,no,selectable,mcq,classify,order,run,$,$$,clr:()=>clearErr()};
})();
