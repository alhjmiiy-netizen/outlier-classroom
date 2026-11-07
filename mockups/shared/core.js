// Shared mock-up core: data + state + quiz logic. No audio, no narration.
window.MK=(function(){const L=window.LESSONS,X=window.EXTRA;
const today=()=>new Date().toISOString().slice(0,10);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const letter=p=>p==null?'—':p>=90?'A':p>=80?'B':p>=70?'C':p>=60?'D':'F';
const GP={A:4,B:3,C:2,D:1,F:0};
function load(key){let s=null;try{s=JSON.parse(localStorage.getItem(key))}catch(e){}
 if(!s){s={demo:true,grades:{HTML:96,Git:84,CSS:92},read:{HTML:1,Git:1,CSS:1,JavaScript:1},warm:{},notes:{},streak:4,lastDay:today(),last:{day:4,mode:'Learning'}}}
 const y=new Date(Date.now()-864e5).toISOString().slice(0,10);
 if(s.lastDay!==today()){s.streak=s.lastDay===y?(s.streak||0)+1:1;s.lastDay=today()}
 const st={s,key,save(){localStorage.setItem(key,JSON.stringify(s))},
  touch(day,mode){s.last={day,mode};this.save()},
  greeting(){const d=s.last.day,l=L[d-1];return {name:'Lord',streak:s.streak,where:`Day ${d} · ${l.skill} · ${s.last.mode}`,demo:!!s.demo}},
  grade(sk,p){s.grades[sk]=Math.max(p,s.grades[sk]||0);s.demo=false;this.save()},
  gpa(){const g=Object.values(s.grades);return g.length?(g.reduce((a,p)=>a+GP[letter(p)],0)/g.length).toFixed(2):'—'},
  status(sk){const p=s.grades[sk];return p>=90?'a':p>=70?'pass':p!=null?'tried':s.read[sk]?'read':'none'}};
 st.save();return st}
function warm(day){if(day===1)return [["A programming language is:",["A way to give instructions a computer can follow","A spoken language","A type of computer","A website"],0,"Languages are how we give computers instructions."],["Best way to learn code?",["Only read","Try small things, break them, fix them","Memorize first","Wait"],1,"Learn by doing."],["What shows things on a web page first?",["HTML","SQL","Docker","Verilog"],0,"HTML is the first layer."]];
 return X[L[day-2].skill].T.slice(3,6)}
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
function test(sk){return shuffle(X[sk].T)}
function timer(secs,el,onEnd){let left=secs;const t=()=>{if(!document.body.contains(el))return clearInterval(id);el.textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');el.classList.toggle('low',left<=60);if(left--<=0){clearInterval(id);onEnd()}};const id=setInterval(t,1000);t();return()=>clearInterval(id)}
function score(qs,ans){let ok=0;qs.forEach((q,i)=>{if(ans[i]===q[2])ok++});return {ok,pct:Math.round(ok/qs.length*100)}}
return {L,X,esc,letter,load,warm,test,timer,score,shuffle}})();
// generic quiz UI helpers (styled by each mock-up's CSS)
MK.quiz=function(root,qs,{instant=false,onAnswer}={}){const ans={};
 root.innerHTML=qs.map((q,i)=>`<div class="q"><div class="qt">${i+1}. ${MK.esc(q[0])}</div>${q[1].map((o,j)=>`<button class="opt" data-i="${i}" data-j="${j}">${MK.esc(o)}</button>`).join('')}<div class="fb" id="fb${i}"></div></div>`).join('');
 root.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,j=+b.dataset.j;ans[i]=j;root.querySelectorAll(`.opt[data-i="${i}"]`).forEach(o=>o.classList.toggle('sel',o===b));
  if(instant){const ok=j===qs[i][2];b.classList.add(ok?'right':'wrong');root.querySelector('#fb'+i).textContent=(ok?'✓ ':'✗ ')+qs[i][3]}onAnswer&&onAnswer(ans)});return ans};
MK.review=(qs,ans)=>qs.map((q,i)=>`<div class="q"><div class="qt">${ans[i]===q[2]?'✓':'✗'} ${MK.esc(q[0])}</div><div>Correct: <b>${MK.esc(q[1][q[2]])}</b>${ans[i]!==q[2]?` · yours: ${ans[i]==null?'blank':MK.esc(q[1][ans[i]])}`:''}</div><div class="fb">${MK.esc(q[3])}</div></div>`).join('');
