(function(){
const {$,$$,store}=APP;
const U=window.UNITS||[];
let tot=0, seenTot=0;
U.forEach(u=>{
  let seen=[]; try{ seen=JSON.parse(store.get('app:seen:'+u.id)||'[]'); }catch(e){}
  const n=Math.min(seen.length,u.secs), pct=u.secs?Math.round(n/u.secs*100):0; tot+=u.secs; seenTot+=n;
  const c=$('#card-'+u.id); if(!c) return;
  setTimeout(()=>{ $('.bar i',c).style.width=pct+'%'; },120);
  $('.m1',c).textContent='الشرح: '+pct+'٪';
  if(u.practice){ let p={}; try{ p=JSON.parse(store.get('app:prac:'+u.id)||'{}'); }catch(e){}
    const done=u.drills.filter(d=>p[d]&&p[d].c>=5).length; $('.m2',c).textContent='أتقنت '+done+' من '+u.drills.length+' تمارين'; }
});
const all=tot?Math.round(seenTot/tot*100):0; const r=$('#ring'); if(r){ r.style.setProperty('--p',all); $('#ringV').textContent=all+'٪'; }
let last=null; try{ last=JSON.parse(store.get('app:last')||'null'); }catch(e){}
if(last&&last.u){ const u=U.find(x=>x.id===last.u); const a=$('#contBtn'); if(u&&a){ a.href=last.u+'.html'+(last.s?'#'+last.s:''); $('#contTxt').textContent=u.unit+' — '+(last.t||u.title); a.hidden=false; } }
})();
