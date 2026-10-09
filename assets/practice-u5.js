/* ===== Unit 5 (IP) practice drills ===== */
(function(){
const {$,$$,ri,pick,shuffle,esc,bidi,norm,ipNorm,ok,no}=PR;
const b8=n=>n.toString(2).padStart(8,'0');
const W=[128,64,32,16,8,4,2,1];
const CLS={A:{lo:1,hi:126,pat:'NHHH',mask:'255.0.0.0',pre:8,n:1},B:{lo:128,hi:191,pat:'NNHH',mask:'255.255.0.0',pre:16,n:2},C:{lo:192,hi:223,pat:'NNNH',mask:'255.255.255.0',pre:24,n:3}};
const randIp=c=>{ const k=CLS[c]; return [ri(k.lo,k.hi),ri(0,255),ri(0,255),ri(1,254)]; };
const patHtml=p=>'<div class="pat">'+p.split('').map(x=>`<span class="${x}">${x}</span>`).join('')+'</div>';

/* ---------- drills ---------- */
const D=[];
/* 1. decimal → binary */
D.push({id:'bin',icon:'i-calc',title:'من العشري إلى الثنائي',desc:'حوّل عددًا عشريًا (0–255) إلى 8 بتات بالضغط على البتات.',
  make(){ return {n:ri(1,255)}; },
  render(q,b){ b.innerHTML=`<div class="qlabel">حوّل العدد إلى النظام الثنائي (8 بت)</div><div class="big">${q.n}</div>
    <div class="bits8">${W.map((w,i)=>`<button type="button" data-i="${i}" aria-label="بت ${w}">0<small>${w}</small></button>`).join('')}</div>
    <div class="sumline" id="sum"></div>`;
    $$('.bits8 button',b).forEach(x=>x.onclick=()=>{ if(this.done) return; x.classList.toggle('on'); x.firstChild.textContent=x.classList.contains('on')?'1':'0'; if(this.hinted) this.sum(b); }); this.done=false; this.hinted=false; },
  sum(b){ const v=$$('.bits8 button',b).reduce((s,x,i)=>s+(x.classList.contains('on')?W[i]:0),0); $('#sum',b).textContent='مجموع أوزان البتات المختارة = '+v; return v; },
  hint(q,b){ this.hinted=true; this.sum(b); return 'ابدأ من اليسار بالوزن 128: إذا كان العدد المتبقي أكبر من الوزن أو يساويه ضع 1 واطرح الوزن، وإلا ضع 0. سيظهر لك المجموع أثناء الضغط.'; },
  check(q,b){ this.done=true; const v=$$('.bits8 button',b).reduce((s,x,i)=>s+(x.classList.contains('on')?W[i]:0),0); const parts=W.filter((w,i)=>b8(q.n)[i]==='1');
    const sol=`<br>${q.n} = ${parts.join(' + ')} ← <code>${b8(q.n)}</code>`;
    return v===q.n?ok('',sol):no('',`اخترتَ بتات مجموعها ${v}.${sol}`); }});
/* 2. binary → decimal */
D.push({id:'dec',icon:'i-hash',title:'من الثنائي إلى العشري',desc:'اقرأ 8 بتات واكتب قيمتها بالنظام العشري.',
  make(){ return {n:ri(1,255)}; },
  render(q,b){ b.innerHTML=`<div class="qlabel">ما القيمة العشرية لهذا الأوكتت؟</div><div class="wts" id="wts" style="visibility:hidden">${W.map(w=>`<span>${w}</span>`).join('')}</div>
    <div class="bits8" style="pointer-events:none">${b8(q.n).split('').map(x=>`<button type="button" tabindex="-1" class="${x==='1'?'on':''}">${x}</button>`).join('')}</div>
    <div class="fld" style="margin-top:12px"><label for="ans">القيمة العشرية</label><input class="in" id="ans" inputmode="numeric" autocomplete="off" placeholder="0 – 255"></div>`; },
  hint(q,b){ $('#wts',b).style.visibility='visible'; return 'كل بت له وزن (ظهر فوق البتات). اجمع أوزان البتات التي قيمتها 1 فقط.'; },
  check(q,b){ const t=norm($('#ans',b).value); if(t==='') return {err:'اكتب الإجابة أولًا'}; if(!/^\d{1,3}$/.test(t)) return {err:'اكتب عددًا صحيحًا من 0 إلى 255'};
    const parts=W.filter((w,i)=>b8(q.n)[i]==='1'); const sol=`<br><code>${b8(q.n)}</code> = ${parts.join(' + ')} = <b>${q.n}</b>`;
    $('#ans',b).classList.add(+t===q.n?'ok':'no'); return +t===q.n?ok('',sol):no('',sol); }});
/* 3. class of address */
D.push({id:'cls',icon:'i-layers',title:'حدّد فئة العنوان',desc:'انظر إلى الأوكتت الأول وحدّد فئة العنوان A أو B أو C.',
  make(){ const c=pick(['A','B','C']); return {c,ip:randIp(c)}; },
  render(q,b){ b.innerHTML=`<div class="qlabel">إلى أي فئة ينتمي هذا العنوان؟</div><div class="big ip">${q.ip.join('.')}</div>
    <div class="opts g3">${['A','B','C'].map(c=>`<button type="button" class="opt" data-v="${c}">Class ${c}</button>`).join('')}</div>`;
    this.sel=null; $$('.opt',b).forEach(o=>o.onclick=()=>{ if(o.disabled) return; $$('.opt',b).forEach(x=>x.classList.remove('sel')); o.classList.add('sel'); this.sel=o.dataset.v; APP.clearErr(); }); },
  hint(){ return 'المدى حسب الأوكتت الأول: الفئة A من 1 إلى 126 — الفئة B من 128 إلى 191 — الفئة C من 192 إلى 223.'; },
  check(q,b){ if(!this.sel) return {err:'اختر الفئة أولًا'}; const k=CLS[q.c];
    $$('.opt',b).forEach(o=>{ o.disabled=true; if(o.dataset.v===q.c) o.classList.add('ok'); else if(o.dataset.v===this.sel) o.classList.add('no'); });
    const sol=`<br>الأوكتت الأول = <b>${q.ip[0]}</b> يقع ضمن المدى ${k.lo} – ${k.hi}، إذن العنوان من <b>الفئة ${q.c} (Class ${q.c})</b> ونمطه <b dir="ltr">${k.pat.split('').join('.')}</b>.`;
    return this.sel===q.c?ok('',sol):no('',sol); }});
/* 4. pattern + network ID */
D.push({id:'nid',icon:'i-sitemap',title:'النمط وعنوان الشبكة',desc:'حدّد نمط N/H ثم اكتب عنوان الشبكة (Network ID).',
  make(){ const c=pick(['A','B','C']); return {c,ip:randIp(c)}; },
  render(q,b){ b.innerHTML=`<div class="qlabel">للعنوان التالي:</div><div class="big ip">${q.ip.join('.')}</div>
    <div class="qlabel">1) ما نمط العنوان؟</div>
    <div class="opts g3" style="direction:ltr">${['NHHH','NNHH','NNNH'].map(p=>`<button type="button" class="opt" data-v="${p}">${p.split('').join('.')}</button>`).join('')}</div>
    <div class="qlabel" style="margin-top:14px">2) ما عنوان الشبكة (Network ID)؟</div>
    <input class="in" id="ans" inputmode="decimal" autocomplete="off" placeholder="مثال: 11.0.0.0/8">`;
    this.sel=null; $$('.opt',b).forEach(o=>o.onclick=()=>{ if(o.disabled) return; $$('.opt',b).forEach(x=>x.classList.remove('sel')); o.classList.add('sel'); this.sel=o.dataset.v; APP.clearErr(); }); },
  hint(){ return 'حدّد الفئة من الأوكتت الأول، ثم اجعل جميع أوكتتات المضيف (H) تساوي صفر. البادئة: ‎/8 للفئة A، و‎/16 للفئة B، و‎/24 للفئة C.'; },
  check(q,b){ if(!this.sel) return {err:'اختر نمط العنوان أولًا'}; const raw=$('#ans',b).value; if(norm(raw)==='') return {err:'اكتب عنوان الشبكة'}; const a=ipNorm(raw); if(!a) return {err:'اكتب العنوان بصيغة صحيحة مثل 11.0.0.0/8'};
    const k=CLS[q.c], net=q.ip.map((x,i)=>i<k.n?x:0).join('.'); const okPat=this.sel===k.pat, okNet=a.ip===net&&(a.pre===null||a.pre===k.pre);
    $$('.opt',b).forEach(o=>{ o.disabled=true; if(o.dataset.v===k.pat) o.classList.add('ok'); else if(o.dataset.v===this.sel) o.classList.add('no'); }); $('#ans',b).classList.add(okNet?'ok':'no');
    const sol=`<br>الأوكتت الأول ${q.ip[0]} ⇐ الفئة ${q.c}، والنمط:${patHtml(k.pat)}نجعل أوكتتات المضيف (H) أصفارًا: عنوان الشبكة هو <code>${net}/${k.pre}</code>`;
    if(okPat&&okNet) return ok('',(a.pre===null?`<br>ويُكتب مع البادئة: <code>${net}/${k.pre}</code>`:'')+sol.replace('<br>',' '));
    return no(!okPat&&!okNet?'النمط وعنوان الشبكة غير صحيحين':!okPat?'النمط غير صحيح':'عنوان الشبكة غير صحيح',sol); }});
/* 5. complete the table */
D.push({id:'tbl',icon:'i-grid',title:'أكمل الجدول',desc:'لعنوان شبكة: اكتب الفئة والقناع وأول وآخر مضيف وعنوان البث.',
  make(){ const c=pick(['A','B','C']); const k=CLS[c], ip=randIp(c); const base=ip.slice(0,k.n); const pad=v=>[...base,...Array(4-k.n).fill(v)];
    const last=[...base,...Array(4-k.n).fill(255)]; last[3]=254;
    return {c,net:pad(0).join('.')+'/'+k.pre,ans:{cls:c,mask:k.mask,first:(()=>{const f=pad(0);f[3]=1;return f.join('.');})(),last:last.join('.'),bc:pad(255).join('.')}}; },
  render(q,b){ const f=(id,l,s)=>`<div class="fld"><label for="${id}">${l}${s?`<small>${s}</small>`:''}</label><input class="in" id="${id}" autocomplete="off" inputmode="${id==='cls'?'text':'decimal'}" placeholder="${id==='cls'?'A / B / C':''}"></div>`;
    b.innerHTML=`<div class="qlabel">أكمل البيانات لعنوان الشبكة:</div><div class="big ip">${q.net}</div>`+f('cls','الفئة','(Class)')+f('mask','قناع الشبكة','(Subnet Mask)')+f('first','عنوان أول مضيف')+f('last','عنوان آخر مضيف')+f('bc','عنوان البث','(Broadcast)'); },
  hint(q){ return 'القناع حسب الفئة (A: 255.0.0.0، B: 255.255.0.0، C: 255.255.255.0). أول مضيف = عنوان الشبكة مع 1 في آخر خانة، والبث = جميع خانات المضيف 255، وآخر مضيف = البث ناقص 1.'; },
  check(q,b){ const ids=['cls','mask','first','last','bc']; if(ids.some(i=>norm($('#'+i,b).value)==='')) return {err:'أكمل جميع الحقول'};
    let good=0; ids.forEach(i=>{ const el=$('#'+i,b); let r; if(i==='cls') r=norm(el.value).toUpperCase().replace(/^CLASS/,'')===q.ans.cls; else { const a=ipNorm(el.value); r=!!a&&a.ip===q.ans[i]; } el.classList.add(r?'ok':'no'); if(r) good++; });
    const sol=`<br>الفئة <b>${q.ans.cls}</b> — القناع <code>${q.ans.mask}</code><br>أول مضيف <code>${q.ans.first}</code> — آخر مضيف <code>${q.ans.last}</code><br>البث <code>${q.ans.bc}</code>`;
    return good===5?ok('أحسنت! جميع الحقول صحيحة',sol):no(`${good} من 5 حقول صحيحة`,sol); }});
/* 6. IPv6 compression */
const H4=()=>{ let s; if(Math.random()<.25){ s=ri(1,15).toString(16)+'0'.repeat(ri(1,3)); } else { const len=pick([1,1,2,2,3,4]); s=ri(1,15).toString(16); while(s.length<len) s+=ri(0,15).toString(16); } return s.toUpperCase().padStart(4,'0'); };
function v6make(){ const L=ri(3,5), start=ri(1,8-L-1>1?8-L-1:1); const g=[]; for(let i=0;i<8;i++) g.push(i>=start&&i<start+L?'0000':H4());
  if(Math.random()<.4){ const cand=[...Array(8).keys()].filter(i=>(i<start-1||i>start+L)&&g[i-1]!=='0000'&&g[i+1]!=='0000'&&i!==0); if(cand.length) g[pick(cand)]='0000'; }
  const st=g.map(x=>x.replace(/^0+(?=.)/,'')); const canon=(start===0?'':st.slice(0,start).join(':'))+'::'+st.slice(start+L).join(':');
  return {g,canon,start,L}; }
function v6expand(s){ s=s.toUpperCase(); if(!/^[0-9A-F:]+$/.test(s)) return null; const parts=s.split('::'); if(parts.length>2) return null;
  const sp=x=>x===''?[]:x.split(':'); let a=sp(parts[0]), c=parts.length===2?sp(parts[1]):[]; if(a.concat(c).some(x=>x.length<1||x.length>4)) return null;
  if(parts.length===2){ const z=8-a.length-c.length; if(z<1) return null; a=a.concat(Array(z).fill('0'),c); } if(a.length!==8) return null; return a.map(x=>x.padStart(4,'0')); }
D.push({id:'v6',icon:'i-globe',title:'اختصار عنوان IPv6',desc:'طبّق قوانين الاختصار: احذف الأصفار على اليسار وادمج الخانات الصفرية بـ ::',
  make(){ return v6make(); },
  render(q,b){ b.innerHTML=`<div class="qlabel">اكتب الصيغة المختصرة لهذا العنوان (IPv6 Shortcut)</div><div class="v6">${q.g.join('<i>:</i>')}</div>
    <input class="in wide" id="ans" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="مثال: 2005:5:100::700">`; },
  hint(){ return '1) احذف الأصفار على يسار كل خانة (0005 ← 5، و0000 ← 0). 2) ادمج سلسلة الخانات الصفرية المتتالية الطويلة لتصبح :: (مرة واحدة فقط). 3) لا تحذف الأصفار على يمين الخانة (0100 ← 100).'; },
  check(q,b){ const raw=norm($('#ans',b).value).toUpperCase(); if(!raw) return {err:'اكتب العنوان المختصر'}; const el=$('#ans',b);
    const sol=`<br>الإجابة: <code>${q.canon}</code>`;
    if(raw===q.canon.toUpperCase()){ el.classList.add('ok'); return ok('',sol); }
    el.classList.add('no'); const ex=v6expand(raw);
    if(!ex) return no('صيغة العنوان غير صحيحة','<br>تأكد من استخدام النقطتين (:) بين الخانات، و :: مرة واحدة فقط.'+sol);
    if(ex.join(':')!==q.g.join(':')) return no('تغيّرت قيمة العنوان','<br>ربما حذفت أصفارًا على يمين خانة، أو لم يعد عدد الخانات 8.'+sol);
    if(raw.split(':').some(x=>x.length>1&&x[0]==='0')) return no('القيمة صحيحة لكن الاختصار ناقص','<br>بقيت أصفار على يسار بعض الخانات ويجب حذفها.'+sol);
    if(!raw.includes('::')) return no('القيمة صحيحة لكن الاختصار ناقص','<br>لم تدمج الخانات الصفرية المتتالية بـ ::'+sol);
    return no('القيمة صحيحة لكن الاختصار ليس الأقصر','<br>استخدم :: لأطول سلسلة من الخانات الصفرية المتتالية.'+sol); }});
/* 7. quick quiz */
const BANK=[
 ['ما طول عنوان IPv4؟',['32 بت','64 بت','128 بت','16 بت'],'عنوان IPv4 طوله 32 بت، مقسم إلى أربع خانات (Octets).'],
 ['كم خانة في عنوان IPv4، وكم بتًا في كل خانة؟',['4 خانات، كل خانة 8 بت','8 خانات، كل خانة 16 بت','4 خانات، كل خانة 16 بت','8 خانات، كل خانة 8 بت'],'IPv4 مقسم إلى أربع خانات (Octets) وكل خانة تحتوي على 8 بت.'],
 ['ما مدى الأرقام في كل خانة من عنوان IPv4؟','0 إلى 255|1 إلى 256|0 إلى 128|0 إلى 999'.split('|'),'كل خانة 8 بت، فمداها من 0 إلى 255.'],
 ['ما طول عنوان IPv6؟',['128 بت','32 بت','64 بت','256 بت'],'8 كتل × 16 بت = 128 بت.'],
 ['كيف يُقسَّم عنوان IPv6؟',['8 خانات (Blocks)، كل خانة 16 بت','4 خانات، كل خانة 8 بت','6 خانات، كل خانة 16 بت','8 خانات، كل خانة 8 بت'],'IPv6 مقسم إلى ثمان خانات (Block) وكل خانة تحتوي على 16 بت.'],
 ['على أي نظام ترقيم يعتمد عنوان IPv6؟',['النظام الست عشري (Hexadecimal)','النظام الثنائي (Binary)','النظام العشري (Decimal)','النظام الثماني'],'IPv6 يعتمد على النظام الست عشري، ورموزه من 0 إلى 9 ومن A إلى F.'],
 ['ما رموز النظام الست عشري؟',['0 إلى 9 و A إلى F','0 إلى 9 فقط','0 و 1 فقط','A إلى Z'],'يحتوي النظام الست عشري على 16 رمزًا: 0, 1, …, 9, A, B, C, D, E, F.'],
 ['ما البت (Bit)؟',['أصغر وحدة قياس في الحاسب وقيمته 0 أو 1','مجموعة من 8 بايت','رقم عشري من 0 إلى 9','وحدة تساوي 1024 بايت'],'البت أصغر وحدة قياس في الحاسب، ويمثل رقمًا ثنائيًا واحدًا قيمته 0 أو 1.'],
 ['البايت (Byte) يتكون من:',['8 بتات','4 بتات','16 بت','32 بت'],'البايت عبارة عن 8 بتات مجتمعة.'],
 ['ما وظيفة بروتوكول NAT؟',['تحويل العنوان الخاص إلى عنوان عام والعكس','اختبار الاتصال الداخلي للجهاز','تحويل العنوان من العشري إلى الثنائي','تقسيم العنوان إلى فئات'],'NAT (Network Address Translation) يحوّل العنوان الخاص إلى عام والعكس.'],
 ['يُستخدم العنوان الخاص (Private) لـ:',['الاتصال في الشبكات المحلية','الاتصال بشبكة الإنترنت','اختبار الاتصال الداخلي','الإرسال المتعدد'],'العنوان الخاص للشبكات المحلية، والعنوان العام للاتصال بالإنترنت.'],
 ['ما العنوان المستخدم لـ Loopback في IPv4؟',['127.0.0.0','192.168.1.1','255.255.255.0','10.0.0.0'],'يستخدم 127.0.0.0 للـ Loopback لاختبار الاتصال الداخلي في الجهاز نفسه.'],
 ['ما الهدف من عنوان Loopback؟',['اختبار الاتصال الداخلي والتأكد من عمل بروتوكولات الشبكة في الجهاز نفسه','الاتصال بشبكة الإنترنت','تحويل العناوين الخاصة إلى عامة','توزيع العناوين على الأجهزة'],'Loopback عنوان خاص يُستخدم داخل الجهاز نفسه لاختبار الاتصال الداخلي، مثل ping و tracert.'],
 ['لماذا ظهرت مشكلة محدودية عناوين IPv4؟',['عدد العناوين المتاحة نحو 4.2 مليار ولا يكفي احتياجات العالم','لأن عنوان IPv4 طوله 128 بت','لأنه يعتمد على النظام الست عشري','لأنه لا يدعم الشبكات المحلية'],'عدد عناوين IPv4 نحو 4.2 مليار، بينما عدد المستخدمين عالميًا نحو 7 مليار.'],
 ['الفئة D مخصصة لـ:',['مجموعات الإرسال المتعدد','الاستخدامات المستقبلية والبحث والتطوير','الوصول إلى شبكة الإنترنت','عنوان Loopback'],'الفئة D خاصة بمجموعات الإرسال المتعدد، والفئة E للاستخدامات المستقبلية والبحث.'],
 ['ما الفئات المستخدمة للوصول إلى شبكة الإنترنت؟',['A و B و C','D و E','A فقط','C و D'],'يتم استخدام الفئات A و B و C للوصول إلى شبكة الإنترنت.'],
 ['ما قناع الشبكة الافتراضي للفئة B؟',['255.255.0.0','255.0.0.0','255.255.255.0','255.255.255.255'],'الفئة B نمطها N.N.H.H وقناعها 255.255.0.0.'],
 ['ما نمط عنوان الفئة C؟',['N.N.N.H','N.H.H.H','N.N.H.H','H.H.H.N'],'الفئة C: ثلاثة أوكتتات للشبكة وأوكتت واحد للأجهزة.'],
 ['ماذا يعني الرقم 24/ في العنوان 192.168.8.10/24؟',['أول 24 بت من اليسار لجزء الشبكة، والـ 8 بت الباقية للأجهزة','العنوان يحتوي على 24 جهازًا','آخر أوكتت قيمته 24','العنوان من الفئة A'],'يشير 24/ إلى عدد بتات جزء الشبكة من اليسار، والمتبقي من 32 بت (8 بت) للأجهزة المضيفة.'],
 ['ما العملية المستخدمة لاستخراج عنوان الشبكة من العنوان وقناع الشبكة؟',['Bitwise AND','الجمع','Bitwise OR','الطرح'],'تُحدد المخرجات بالاعتماد على قناع الشبكة والعنوان الرئيسي باستخدام Bitwise AND.'],
 ['في الشبكة 192.168.8.0/24 ما عنوان الانتشار (Broadcast)؟',['192.168.8.255','192.168.8.254','192.168.8.1','192.168.255.255'],'أول مضيف 192.168.8.1، وآخر مضيف 192.168.8.254، والانتشار 192.168.8.255.'],
 ['متى نُشر IPv6؟',['1999','1981','2005','1990'],'نُشر IPv6 عام 1999، بينما نُشر IPv4 عام 1981.'],
 ['ما المقصود بـ Unicast (البث الأحادي)؟',['اتصال بين جهاز وآخر فقط','إرسال من مرسل واحد إلى مجموعة من المستقبلين','إرسال إلى أقرب عقدة من مجموعة وجهات','إرسال إلى جميع أجهزة الشبكة'],'في Unicast يتم تسليم حزمة IPv6 إلى عنوان واحد فقط.'],
 ['ما المقصود بـ Multicast (البث المتعدد)؟',['الإرسال من مرسل واحد إلى مجموعة من المستقبلين','اتصال بين جهاز وآخر فقط','إرسال إلى أقرب عقدة فقط','اختبار الاتصال الداخلي'],'Multicast يكون الإرسال فيه من مرسل واحد إلى مجموعة من المستقبلين.'],
 ['ما المقصود بـ Anycast؟',['إرسال الحزمة إلى عقدة واحدة هي الأقرب إلى المرسل من مجموعة وجهات','إرسال الحزمة إلى جميع العقد','اتصال بين جهازين فقط','إرسال من عدة مرسلين إلى مستقبل واحد'],'Anycast معرّف لمجموعة وجهات، وتُرسل الحزمة إلى العقدة الأقرب باستخدام خوارزمية التوجيه.'],
 ['ما عنوان الرجوع الذاتي (Loopback) في IPv6؟',['::1/128','FE80::/10','::/128','FF00::/8'],'Loopback في IPv6 هو ‎::1/128، بينما ‎::/128 عنوان غير محدد.'],
 ['ما البادئة الخاصة بعنوان الرابط المحلي (Link-Local) في IPv6؟',['FE80::/10','2000::/3','FC00::/7','FF00::/8'],'Link-Local بادئته FE80::/10، والعنوان الأحادي العام 2000::/3.'],
 ['كم عدد الكتل في عنوان IPv6؟',['8 كتل','4 كتل','6 كتل','16 كتلة'],'عدد الكتل = 8 كتل، و8 كتل × 16 بت = 128 بت.']
];
D.push(PR.mcq({bank:BANK}));
PR.run('u5',D);
})();
