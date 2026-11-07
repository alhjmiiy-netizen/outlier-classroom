(()=>{
const L=window.LESSONS,X=window.EXTRA,$=s=>document.querySelector(s),app=$('#app');
const KEY='outlier-classroom-v1',TEST_SECS=8*60,FINAL_SECS=20*60,A_MIN=90;
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
const fresh=()=>({qs:[{n:1,start:today(),skills:L.map(l=>l.skill),res:{}}],read:{},proj:{},notes:{},nb:{},warm:{},final:[],active:[]});
let S;try{S=Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){S=fresh()}
let noSave=false;const save=()=>{if(noSave)return;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
if(!S.active.includes(today()))S.active.push(today());save();
setInterval(save,120000);addEventListener('visibilitychange',()=>{if(document.hidden)save()});addEventListener('beforeunload',save);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const Q=()=>S.qs[S.qs.length-1];
const dayNum=()=>Math.max(1,Math.floor((new Date(today())-new Date(Q().start))/864e5)+1);
// ---------- grading (goal: A) ----------
const letter=p=>p>=90?'A':p>=80?'B':p>=70?'C':p>=60?'D':'F';
const GP={A:4,B:3,C:2,D:1,F:0};
const rec=(q,sk)=>q.res[sk]||(q.res[sk]={tries:[]});
const qBest=(q,sk)=>{const r=q.res[sk];return r&&r.tries.length?Math.max(...r.tries):null};
const earnedA=(q,sk)=>{const b=qBest(q,sk);return b!==null&&b>=A_MIN&&!!S.proj[sk]};
const hasA=sk=>S.qs.some(q=>earnedA(q,sk));
const best=sk=>{let b=null;S.qs.forEach(q=>{const x=qBest(q,sk);if(x!==null&&(b===null||x>b))b=x});return b};
const passed=sk=>(best(sk)||0)>=70;
const lockedIn=(q,sk)=>{const r=q.res[sk];return !!r&&(earnedA(q,sk)||r.tries.length>=2)};
const markedRetake=sk=>{const q=Q();return q.skills.includes(sk)&&lockedIn(q,sk)&&!earnedA(q,sk)};
const sessionOver=()=>dayNum()>Q().skills.length||Q().skills.every(sk=>lockedIn(Q(),sk));
const allA=()=>L.every(l=>hasA(l.skill));
const status=sk=>({learned:!!(S.read[sk]&&S.proj[sk]),tested:S.qs.some(q=>q.res[sk]&&q.res[sk].tries.length),passed:passed(sk),a:hasA(sk)});
const streak=()=>{let n=0,d=new Date(today());while(S.active.includes(d.toISOString().slice(0,10))){n++;d.setDate(d.getDate()-1)}return n};
function startQuarter(){const sk=L.map(l=>l.skill).filter(s=>!hasA(s));if(!sk.length)return;S.qs.push({n:S.qs.length+1,start:today(),skills:sk,res:{}});save();sel=1;tab='hook';view='today';render()}
// ---------- speech ----------
const synth=window.speechSynthesis;let rate=1,speakQ=[],speaking=false,paused=false;
function face(talk){document.querySelectorAll('.mouth').forEach(m=>m.classList.toggle('talk',!!talk))}
function stopSpeak(){speakQ=[];speaking=false;paused=false;try{synth&&synth.cancel()}catch(e){}face(false);document.querySelectorAll('.sent.hl').forEach(e=>e.classList.remove('hl'))}
function speakList(items){stopSpeak();speakQ=items.slice();speaking=true;nextSpeak()}
function nextSpeak(){document.querySelectorAll('.sent.hl').forEach(e=>e.classList.remove('hl'));
 if(!speakQ.length||!speaking){speaking=false;face(false);return}
 const it=speakQ.shift();if(it.el){it.el.classList.add('hl');it.el.scrollIntoView({block:'center',behavior:'smooth'})}
 face(true);
 if(!synth||!window.SpeechSynthesisUtterance){setTimeout(nextSpeak,Math.min(4000,it.text.length*55));return}
 const u=new SpeechSynthesisUtterance(it.text);u.rate=rate;u.onend=nextSpeak;u.onerror=nextSpeak;synth.speak(u)}
function say(t){speakList([{text:t}])}
const TEACHER=`<svg viewBox="0 0 100 100" class="face" aria-label="Teacher"><circle cx="50" cy="50" r="44" fill="#c68a5a"/><path d="M8 44 Q50 -6 92 44 Q80 22 50 22 Q20 22 8 44Z" fill="#2b1b10"/><rect x="26" y="38" width="20" height="14" rx="5" fill="none" stroke="#d4af37" stroke-width="3"/><rect x="54" y="38" width="20" height="14" rx="5" fill="none" stroke="#d4af37" stroke-width="3"/><line x1="46" y1="44" x2="54" y2="44" stroke="#d4af37" stroke-width="3"/><circle cx="36" cy="45" r="3" fill="#111" class="eye"/><circle cx="64" cy="45" r="3" fill="#111" class="eye"/><ellipse class="mouth" cx="50" cy="72" rx="11" ry="3" fill="#5a1f1f"/></svg>`;
const teach=(msg,id)=>`<div class="teacher"><div class="av">${TEACHER}<div class="tn">Ms. Ada</div></div><div class="bubble" ${id?`id="${id}"`:''}>${msg}</div></div>`;
// ---------- Q&A ----------
function corpus(l){const x=X[l.skill];return [l.why,l.breakdown,x.fund,x.matters,...l.concepts,...x.dos.map(d=>'Do: '+d),...x.donts.map(d=>'Avoid: '+d),...x.mistakes.map(m=>'Common mistake: '+m),...x.T.map(t=>t[0]+' '+t[1][t[2]]+'. '+t[3])]}
const sentences=t=>t.split(/(?<=[.!?])\s+(?=[A-Z<'"(])/).filter(s=>s.trim().length>3);
const STOP=new Set('the a an is are what how why do does i it to of in and or for on with my me you can be this that when should which about'.split(' '));
const toks=s=>s.toLowerCase().replace(/[^a-z0-9#+<>.\s]/g,' ').split(/\s+/).filter(w=>w&&!STOP.has(w));
function bank(l){const x=X[l.skill],s=l.skill;return [
 [['what is','explain','meaning','define'],`Great question! Here's the gist: ${l.breakdown.split('. ').slice(0,2).join('. ')}.`],
 [['why','matter','important','care','useful'],`${l.why} The biggest thing to hold onto: ${x.matters}`],
 [['mistake','wrong','error','bug','broken'],`The usual traps in ${s}: ${x.mistakes.slice(0,3).join('; ')}. Watch for those and you're ahead of most beginners.`],
 [['do','tip','best','practice','should'],`My top tips for ${s}: ${x.dos.slice(0,3).join('; ')}.`],
 [['avoid','dont','not','never'],`Things to avoid in ${s}: ${x.donts.slice(0,3).join('; ')}.`],
 [['start','begin','first','where'],`Start with the Reading tab, let me read it to you, then try the warm-ups and the mini-project in Learning. Concept one is: ${l.concepts[0]}.`],
 [['test','grade','pass','retake'],`The class test is ${x.T.length} questions in 8 minutes. We're aiming for an A — 90% or better — with your mini-project done. You get one retake; if it's still not an A, the class is marked for retake and comes back next quarter.`]]}
function answer(l,q){const qt=toks(q),ql=q.toLowerCase();
 for(const [keys,a] of bank(l)){if(keys.some(k=>new RegExp('\\b'+k+'\\b').test(ql))&&qt.length<=4)return a}
 let bestS=null,bs=0;corpus(l).forEach(c=>sentences(c).forEach(s=>{const st=new Set(toks(s));let sc=0;qt.forEach(w=>{if(st.has(w))sc+=w.length>3?2:1});if(sc>bs){bs=sc;bestS=s}}));
 if(bs>=2)return `Good question. Here's what we covered on that: ${bestS} Does that make sense? Ask me to explain any word in there.`;
 for(const [keys,a] of bank(l))if(keys.some(k=>ql.includes(k)))return a;
 return `Hmm, I don't have that one in today's notes. Try the "Fundamentals" and "Key concepts" sections in Reading — or ask me "what is ${l.skill}", "common mistakes", or "tips".`}
// ---------- nav ----------
let view='today',sel=Math.min(dayNum(),Q().skills.length),tab='hook';
function setNav(v){view=v;document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x.dataset.v===v))}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{setNav(b.dataset.v);render()});
function render(){stopSpeak();clearInterval(timerId);({today:renderClass,desks:renderDesks,nb:renderNotebook,report:renderReport,final:renderFinal})[view]();window.scrollTo(0,0)}
const lessonOf=sk=>L.find(l=>l.skill===sk);
function schedBar(){const dn=dayNum(),q=Q();return '<div class="daybar">'+q.skills.map((sk,i)=>{const d=i+1,st=status(sk);
 return `<button data-d="${d}" class="${d===sel?'cur':''} ${st.a?'gold':st.passed?'done':''} ${d>dn?'lock':''}">D${d}<br><span class="desk">${esc(sk)}</span></button>`}).join('')+'</div>'}
function quarterBanner(){const q=Q();if(allA())return `<div class="card gold-card">🏆 All 16 classes have an A. You graduated, Lord!</div>`;
 if(sessionOver()){const n=L.filter(l=>!hasA(l.skill)).length;return `<div class="card gold-card"><b>Quarter ${q.n} session is over.</b> ${n} class${n>1?'es':''} still need an A. <button class="btn gold" id="nq">Start New Quarter</button></div>`}
 return `<div class="row"><span class="mut">Need to jump ahead?</span><button class="btn" id="nq">Force-start Quarter ${q.n+1}</button></div>`}
function bindQuarter(){const b=$('#nq');if(b)b.onclick=()=>{if(sessionOver()||confirm('Start a new quarter now? It will contain only classes without an A.'))startQuarter()}}
function renderClass(){const dn=dayNum(),q=Q();
 let h=`<div class="row"><span class="pill">🔔 Quarter ${q.n} · Day ${Math.min(dn,q.skills.length)}${dn>q.skills.length?' (session over)':''}</span><span class="mut">Started ${q.start}</span></div>`+schedBar();
 const sk=q.skills[sel-1];if(!sk){app.innerHTML=h+quarterBanner();bindBar();bindQuarter();return}
 const l=lessonOf(sk),st=status(sk),r=q.res[sk];
 h+=`<div class="board ${l.hw?'lab':''}"><div class="mut">${l.hw?'🔬 HARDWARE LAB · ':''}Quarter ${q.n} · Class ${sel} of ${q.skills.length} ${sel>dn?'· 🔒 opens Day '+sel+' (peek allowed)':''}</div><h1>${esc(sk)}: ${esc(l.title)}</h1>
 <div><span class="badge ${st.learned?'y':''}">Learned</span><span class="badge ${st.tested?'y':''}">Tested</span><span class="badge ${st.passed?'y':''}">Passed</span><span class="badge ${st.a?'g':''}">A earned</span>${markedRetake(sk)?'<span class="badge r">Marked for retake</span>':''}</div></div>
 <div class="tabs">${[['hook','✨ Warm-up'],['read','📖 Reading'],['learn','🧪 Learning'],['test','⏱️ Test']].map(([k,n])=>`<button data-t="${k}" class="${tab===k?'on':''}">${n}</button>`).join('')}</div><div id="pane"></div>`+quarterBanner();
 app.innerHTML=h;bindBar();bindQuarter();document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{stopSpeak();clearInterval(timerId);tab=b.dataset.t;renderClass()});
 ({hook:paneHook,read:paneRead,learn:paneLearn,test:paneTest})[tab](l,$('#pane'),L.indexOf(l)+1)}
function bindBar(){document.querySelectorAll('.daybar button').forEach(b=>b.onclick=()=>{sel=+b.dataset.d;tab='hook';renderClass()})}
function controls(){return `<div class="row ctl"><button class="btn gold" data-sp="play">▶ Read to me</button><button class="btn" data-sp="pause">⏸ Pause</button><button class="btn" data-sp="stop">⏹ Stop</button><label class="mut">Speed <select id="rate">${[0.75,0.9,1,1.15,1.3].map(r=>`<option ${r===rate?'selected':''}>${r}</option>`).join('')}</select></label></div>`}
function bindControls(root){root.querySelector('#rate').onchange=e=>rate=+e.target.value;
 root.querySelector('[data-sp=play]').onclick=()=>{if(paused&&synth){synth.resume();paused=false;face(true);return}speakList([...root.querySelectorAll('.sent')].map(el=>({el,text:el.textContent})))};
 root.querySelector('[data-sp=pause]').onclick=()=>{if(synth&&speaking){synth.pause();paused=true;face(false)}};
 root.querySelector('[data-sp=stop]').onclick=stopSpeak}
const sp=t=>sentences(t).map(s=>`<span class="sent">${esc(s)}</span> `).join('');
function askBox(l){return `<div class="card"><h2>🙋 Ask the teacher</h2><div class="row"><input id="askq" placeholder="e.g. What's the difference between a wire and a reg?"><button class="btn gold" id="askb">Ask</button>${(window.SpeechRecognition||window.webkitSpeechRecognition)?'<button class="btn" id="mic">🎤</button>':''}</div><div id="askout"></div></div>`}
function bindAsk(l){const go=()=>{const q=$('#askq').value.trim();if(!q)return;const a=answer(l,q);$('#askout').innerHTML=teach(esc(a));say(a)};
 $('#askb').onclick=go;$('#askq').onkeydown=e=>{if(e.key==='Enter')go()};
 const m=$('#mic');if(m)m.onclick=()=>{const R=new(window.SpeechRecognition||window.webkitSpeechRecognition)();R.lang='en-US';R.onresult=e=>{$('#askq').value=e.results[0][0].transcript;go()};R.start();m.textContent='👂';R.onend=()=>m.textContent='🎤'}}
const GENERAL=[["What does an app need to show something on a screen?",["Code that describes what to display","Only a database","Only a Wi-Fi password","Nothing"],0,"Every app has code describing its screens — today you'll learn the first layer: HTML."],
["A 'programming language' is:",["A way to give instructions a computer can follow","A spoken language","A type of computer","A website"],0,"Languages are how we talk to computers."],
["What's the best way to learn coding?",["Read and never try","Try small things, break them, fix them","Memorize everything first","Wait until you're an expert"],1,"Dive in and learn by doing — your style."]];
function warmQs(l){const i=L.indexOf(l);if(i===0)return {from:'General',qs:GENERAL};const p=L[i-1];return {from:p.skill,qs:X[p.skill].T.slice(3,7)}}
function quizBlock(qs,pre){return qs.map((t,i)=>`<div class="q"><b>${i+1}. ${esc(t[0])}</b>${t[1].map((o,j)=>`<button class="opt" data-${pre}="${i}" data-j="${j}">${esc(o)}</button>`).join('')}<div class="mut" id="${pre}f${i}"></div></div>`).join('')}
function bindQuiz(p,qs,pre,onAll){const got={};p.querySelectorAll(`[data-${pre}]`).forEach(b=>b.onclick=()=>{const i=b.dataset[pre],t=qs[i],ok=+b.dataset.j===t[2];
 p.querySelectorAll(`[data-${pre}="${i}"]`).forEach(o=>o.classList.remove('right','wrong'));b.classList.add(ok?'right':'wrong');got[i]=ok;
 const m=(ok?'Yes! ':'Not quite. ')+t[3];$('#'+pre+'f'+i).textContent=m;say(m);if(onAll&&Object.keys(got).length===qs.length)onAll(Object.values(got).filter(Boolean).length)})}
function paneHook(l,p){const w=warmQs(l),wk=Q().n+':'+l.skill;
 const msg=l.hw?`Welcome to the <b>Hardware Lab</b>, Lord! 🔬 Today is different: ${esc(l.why)} First, a quick warm-up on ${esc(w.from)}.`:`Welcome to class, Lord! ✨ Today is <b>${esc(l.skill)}</b>. ${esc(l.why)} First, a quick warm-up ${w.from==='General'?'to get your brain going':'on yesterday\'s class, '+esc(w.from)}. Then reading, then hands-on, then a timed test. We're aiming for an A.`;
 p.innerHTML=teach(msg)+`<div class="row"><button class="btn gold" id="hk">🔊 Hear it</button></div><div class="card"><h2>☀️ Daily warm-up: ${esc(w.from)}</h2>${quizBlock(w.qs,'wu')}<p id="wres" class="status">${S.warm[wk]?'✔ Warm-up done':''}</p></div><button class="btn gold" id="go">Start reading →</button>`;
 $('#hk').onclick=()=>say(msg.replace(/<[^>]+>/g,''));$('#go').onclick=()=>{tab='read';renderClass()};
 bindQuiz(p,w.qs,'wu',n=>{S.warm[wk]=n+'/'+w.qs.length;save();$('#wres').textContent=`✔ Warm-up done: ${n}/${w.qs.length}`})}
function paneRead(l,p){const x=X[l.skill],nb=S.nb[l.skill]||(S.nb[l.skill]={});
 p.innerHTML=teach(l.hw?`This is a hardware class — think circuits, not steps. I'll read it to you; follow the gold highlight.`:`I'll read this to you — follow the gold highlight. Pause any time and ask me questions below.`)+controls()+`
 <div class="card reading"><h2>The big idea</h2><p>${sp(l.breakdown)}</p><h2>Fundamentals</h2><p>${sp(x.fund)}</p>
 <h2>What matters most</h2><p>${sp(x.matters)}</p><h2>Key concepts <span class="mut">(write each in your own words — saved to your Notebook)</span></h2><ol class="concepts">${l.concepts.map((c,i)=>`<li><span class="sent">${esc(c)}.</span><textarea class="nbx" data-c="${i}" rows="2" placeholder="✍️ In my own words…">${esc(nb[i]||'')}</textarea></li>`).join('')}</ol>
 <h2>Do's</h2><ul class="do">${x.dos.map(c=>`<li><span class="sent">${esc(c)}.</span></li>`).join('')}</ul>
 <h2>Don'ts</h2><ul class="dont">${x.donts.map(c=>`<li><span class="sent">${esc(c)}.</span></li>`).join('')}</ul>
 <h2>Common mistakes</h2><ul class="oops">${x.mistakes.map(c=>`<li><span class="sent">${esc(c)}.</span></li>`).join('')}</ul>
 <button class="btn gold" id="rd">${S.read[l.skill]?'✔ Reading done':'I finished the reading'}</button></div>`+askBox(l);
 p.querySelectorAll('.nbx').forEach(t=>{t.oninput=()=>{nb[t.dataset.c]=t.value};t.onchange=save});
 bindControls(p);bindAsk(l);$('#rd').onclick=()=>{S.read[l.skill]=true;save();tab='learn';renderClass()}}
function paneLearn(l,p,d){const x=X[l.skill],warm=x.T.slice(0,3);
 p.innerHTML=teach(`Hands-on time! 3 quick checks first, then build the mini-project. Finishing the project counts toward your A — it shows you understand, not just memorized.`)+controls()+`
 <div class="card"><h2>Quick recap</h2><p>${l.concepts.slice(0,4).map(c=>`<span class="sent">${esc(c)}.</span>`).join(' ')}</p></div>
 <div class="card"><h2>Checks</h2>${quizBlock(warm,'w')}</div>
 <div class="card"><h2>🛠 Mini-project</h2><p>${esc(l.project.prompt)}</p><div id="runner"></div><p class="status" id="pst">${S.proj[l.skill]?'<span class="ok">✔ Project complete</span>':''}</p></div>
 <div class="card"><h2>📝 Class notes</h2><textarea id="notes" placeholder="What clicked today? What's still fuzzy?">${esc(S.notes[l.skill]||'')}</textarea></div>`+askBox(l);
 bindControls(p);bindAsk(l);bindQuiz(p,warm,'w');
 $('#notes').oninput=e=>{S.notes[l.skill]=e.target.value};$('#notes').onchange=save;
 RUN[l.project.type](l,$('#runner'))}
function projDone(l,ok,msg){const e=$('#pst');if(ok){S.proj[l.skill]=true;save()}if(!e)return;e.innerHTML=ok?`<span class="ok">✔ ${esc(msg||'Project complete! Nice work.')}</span>`:`<span class="bad">✗ ${esc(msg)}</span>`;e.className='status '+(ok?'ok':'bad')}
// ---------- runners ----------
const CHECKS={
 html_intro:r=>/<h1[\s>]/i.test(r.html)&&/<p[\s>]/i.test(r.html)&&(r.html.match(/<li[\s>]/gi)||[]).length>=3?[1,'Intro card has h1, p, and 3+ goals!']:[0,'Need an <h1>, a <p>, and at least 3 <li> goals.'],
 css_card:r=>{const s=r.code.replace(/\s/g,'').toLowerCase();return /\.card\{[^}]*background/.test(s)&&/border/.test(s)&&/padding/.test(s)&&/border-radius/.test(s)&&/display:flex/.test(s)?[1,'Styled like a pro!']:[0,'Need background, border, padding, border-radius on .card and display:flex somewhere.']},
 js_avg:r=>r.logs.some(x=>String(x).trim()==='25')?[1,'Prints 25 — correct!']:[0,'Expected the console to show 25. Got: '+(r.logs.join(' | ')||'nothing')],
 ts_signal:r=>/interface\s+Signal\s*\{[^}]*ticker\s*:\s*string[^}]*score\s*:\s*number|interface\s+Signal\s*\{[^}]*score\s*:\s*number[^}]*ticker\s*:\s*string/.test(r.code)&&r.logs.includes('HOT')?[1,'Typed and prints HOT!']:[0,'Signal needs ticker: string and score: number, and the log should say HOT.'],
 react_counter:r=>/Count:\s*1\b/.test(r.after||'')?[1,'Clicking works — count went up!']:[0,'After clicking the button the count should show 1.']};
function webRunner(l,el,kind){el.innerHTML=`<textarea class="code" spellcheck="false">${esc(localStorage.getItem('code-'+l.skill)||l.project.starter)}</textarea><div class="row"><button class="btn gold run">▶ Run</button><button class="btn rs">Reset code</button></div><iframe sandbox="allow-scripts" title="output"></iframe><pre class="out"></pre>`;
 const ta=el.querySelector('textarea'),fr=el.querySelector('iframe'),out=el.querySelector('pre');
 ta.oninput=()=>localStorage.setItem('code-'+l.skill,ta.value);el.querySelector('.rs').onclick=()=>{ta.value=l.project.starter;localStorage.removeItem('code-'+l.skill)};
 el.querySelector('.run').onclick=async()=>{let code=ta.value,body='',err='';
  if(kind==='ts'){try{await loadScript('https://cdn.jsdelivr.net/npm/typescript@5.4.5/lib/typescript.js');code=ts.transpile(code,{target:ts.ScriptTarget.ES2017})}catch(e){err=e.message}}
  const rep=`<script>(function(){var logs=[];var P=function(m){parent.postMessage(Object.assign({cp:1},m),'*')};['log','info','warn'].forEach(function(k){var o=console[k];console[k]=function(){var a=[].slice.call(arguments).map(function(x){return typeof x==='object'?JSON.stringify(x):String(x)});logs.push(a.join(' '));P({log:a.join(' ')});o.apply(console,arguments)}});window.onerror=function(m){P({err:String(m)})};window.addEventListener('load',function(){setTimeout(function(){var h=document.body.innerHTML;var b=document.querySelector('button');if(b)b.click();setTimeout(function(){P({done:1,html:h,after:document.body.innerText,logs:logs})},300)},${kind==='react'?1500:200})})})()<\/script>`;
  if(kind==='html')body=rep+code;
  else if(kind==='react')body=rep+`<div id="root"></div><script src="https://unpkg.com/react@18/umd/react.development.js"><\/script><script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script><script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script><script type="text/babel">${code.replace(/<\/script/gi,'<\\/script')}<\/script>`;
  else body=rep+`<script>${code.replace(/<\/script/gi,'<\\/script')}<\/script>`;
  out.textContent=err?'Error: '+err:'';fr.style.background='#fff';
  const h=e=>{if(!e.data||!e.data.cp||e.source!==fr.contentWindow)return;if(e.data.log!==undefined)out.textContent+=e.data.log+'\n';if(e.data.err)out.textContent+='⚠ '+e.data.err+'\n';
   if(e.data.done){window.removeEventListener('message',h);const [ok,m]=CHECKS[l.project.check]({code:ta.value,html:kind==='html'?ta.value:e.data.html,after:e.data.after,logs:e.data.logs});projDone(l,ok,m)}};
  window.addEventListener('message',h);fr.srcdoc=`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif">${body}</body></html>`}}
const loaded={};function loadScript(src){return loaded[src]||(loaded[src]=new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('Could not load '+src+' (are you online?)'));document.head.appendChild(s)}))}
function codeBox(l,el,label){el.innerHTML=`<textarea class="code" spellcheck="false">${esc(localStorage.getItem('code-'+l.skill)||l.project.starter)}</textarea><div class="row"><button class="btn gold run">▶ ${label}</button><button class="btn rs">Reset code</button></div><pre class="out"></pre>`;
 const ta=el.querySelector('textarea');ta.oninput=()=>localStorage.setItem('code-'+l.skill,ta.value);el.querySelector('.rs').onclick=()=>{ta.value=l.project.starter;localStorage.removeItem('code-'+l.skill)};return [ta,el.querySelector('.run'),el.querySelector('.out')]}
let pyP=null;
const RUN={html:(l,e)=>webRunner(l,e,'html'),js:(l,e)=>webRunner(l,e,'js'),ts:(l,e)=>webRunner(l,e,'ts'),react:(l,e)=>webRunner(l,e,'react'),
 py:(l,el)=>{const [ta,b,out]=codeBox(l,el,'Run Python');b.onclick=async()=>{out.textContent='Loading Python (first time takes ~10s)…';
  try{if(!pyP)pyP=loadScript('https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js').then(()=>loadPyodide());const py=await pyP;let buf='';py.setStdout({batched:s=>buf+=s+'\n'});py.setStderr({batched:s=>buf+=s+'\n'});
   try{await py.runPythonAsync(ta.value)}catch(e){buf+=String(e.message||e).split('\n').slice(-3).join('\n')}out.textContent=buf||'(no output)';
   const ok=buf.trim().split('\n').pop()==='10.0';projDone(l,ok,ok?'Prints 10.0 — correct!':'Expected the last line to print 10.0')}catch(e){out.textContent='Error: '+e.message}}},
 sql:(l,el)=>{const [ta,b,out]=codeBox(l,el,'Run SQL');el.insertAdjacentHTML('afterbegin','<p class="mut">Table <b>signals</b>(ticker, sector, score): 8 rows of sample MarketPulse-style data.</p>');
  b.onclick=async()=>{out.textContent='Loading SQL engine…';try{await loadScript('https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-wasm.js');const SQL=await initSqlJs({locateFile:f=>'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/'+f});
   const db=new SQL.Database();db.run(`CREATE TABLE signals(ticker TEXT,sector TEXT,score INT);INSERT INTO signals VALUES('BTC','Crypto',82),('ETH','Crypto',74),('NVDA','Tech',91),('AAPL','Tech',63),('XOM','Energy',55),('JPM','Finance',71),('SOL','Crypto',68),('TSLA','Auto',48);`);
   const r=db.exec(ta.value);if(!r.length){out.textContent='(no rows)';return}const t=r[r.length-1];out.innerHTML=`<table><tr>${t.columns.map(c=>`<th>${esc(c)}</th>`).join('')}</tr>${t.values.map(v=>`<tr>${v.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`;
   const cols=t.columns.map(c=>c.toLowerCase()),tk=t.values.map(v=>v[cols.indexOf('ticker')]).join(',');
   const ok=cols.length===2&&cols.includes('ticker')&&cols.includes('score')&&tk==='NVDA,BTC,ETH,JPM';projDone(l,ok,ok?'Perfect query!':'Expect only ticker & score, scores above 70, highest first (NVDA, BTC, ETH, JPM).')}catch(e){out.textContent='SQL error: '+e.message}}},
 git:(l,el)=>{el.innerHTML=`<div class="term" id="term"></div><div class="row"><input id="tin" placeholder="type a command, e.g. git init" autocapitalize="off"><button class="btn gold" id="tgo">Enter</button></div><p class="mut">Commands: git init, touch &lt;file&gt;, git status, git add &lt;file|.&gt;, git commit -m "msg", git log, git branch [name], git checkout &lt;branch&gt;, ls, help</p>`;
  const g={init:false,files:{},staged:new Set(),commits:[],branches:['main'],cur:'main'},T=$('#term'),pr=s=>{T.innerHTML+=s+'\n';T.scrollTop=1e9};T.style.whiteSpace='pre-wrap';pr('Welcome to the practice terminal. Type help.');
  const run=c=>{pr('<span class="p">lord@codepath $</span> '+esc(c));const a=c.match(/"[^"]*"|\S+/g)||[];
   if(a[0]==='help')return pr('Try: git init → touch index.html → git add . → git commit -m "First save" → git log → git branch feature');
   if(a[0]==='ls')return pr(Object.keys(g.files).join('  ')||'(empty)');
   if(a[0]==='touch'&&a[1]){g.files[a[1]]='new';return pr('created '+esc(a[1]))}
   if(a[0]!=='git')return pr('command not found: '+esc(a[0]||''));
   if(a[1]==='init'){g.init=true;return pr('Initialized empty Git repository in /home/lord/project/.git/')}
   if(!g.init)return pr('fatal: not a git repository (run git init first)');
   if(a[1]==='status'){const st=[...g.staged],un=Object.keys(g.files).filter(f=>g.files[f]==='new'&&!g.staged.has(f));return pr(`On branch ${g.cur}\n`+(st.length?'Changes to be committed:\n  '+st.map(f=>'new file: '+f).join('\n  ')+'\n':'')+(un.length?'Untracked files:\n  '+un.join('\n  '):'')+(!st.length&&!un.length?'nothing to commit, working tree clean':''))}
   if(a[1]==='add'){const fs=a[2]==='.'?Object.keys(g.files).filter(f=>g.files[f]==='new'):[a[2]];if(!fs[0]||!g.files[fs[0]])return pr("fatal: pathspec did not match any files");fs.forEach(f=>g.staged.add(f));return pr('')}
   if(a[1]==='commit'){if(a[2]!=='-m'||!a[3])return pr('error: use git commit -m "your message"');if(!g.staged.size)return pr('nothing added to commit (use "git add")');
    const h=Math.random().toString(16).slice(2,9);g.commits.unshift({h,m:a[3].replace(/"/g,''),b:g.cur});g.staged.forEach(f=>g.files[f]='committed');const n=g.staged.size;g.staged.clear();return pr(`[${g.cur} ${h}] ${esc(a[3].replace(/"/g,''))}\n ${n} file(s) changed`)}
   if(a[1]==='log')return pr(g.commits.map(c=>`commit ${c.h}\n    ${esc(c.m)}`).join('\n')||'fatal: no commits yet');
   if(a[1]==='branch'){if(a[2]){g.branches.push(a[2]);pr('');}else pr(g.branches.map(b=>(b===g.cur?'* ':'  ')+b).join('\n'));
    if(g.commits.length&&g.branches.includes('feature'))projDone(l,true,'You made a save point and a branch — real Git skills!');return}
   if(a[1]==='checkout'){if(!g.branches.includes(a[2]))return pr("error: branch not found");g.cur=a[2];return pr("Switched to branch '"+esc(a[2])+"'")}
   pr('git: unknown command in this simulator')};
  const go=()=>{const v=$('#tin').value.trim();if(v)run(v);$('#tin').value=''};$('#tgo').onclick=go;$('#tin').onkeydown=e=>{if(e.key==='Enter')go()}},
 quiz:(l,el)=>{const qs=l.project.questions;el.innerHTML=qs.map((q,i)=>`<div class="q"><pre>${esc(q.q)}</pre><input data-i="${i}" placeholder="your answer" autocapitalize="off"><div class="mut" id="qf${i}"></div></div>`).join('')+`<button class="btn gold" id="qchk">Check answers</button><p class="mut">No fake compiler here — this is a guided fill-the-blank / predict-the-output drill, auto-checked.</p>`;
  $('#qchk').onclick=()=>{let ok=0;qs.forEach((q,i)=>{const v=el.querySelector(`[data-i="${i}"]`).value.trim().toLowerCase(),r=q.a.some(a=>a.toLowerCase()===v);if(r)ok++;$('#qf'+i).innerHTML=r?'<span class="ok">✔ Correct</span>':`<span class="bad">✗ Answer: ${esc(q.a[0])}</span>${q.hint?' — '+esc(q.hint):''}`});
   projDone(l,ok===qs.length,ok===qs.length?'All correct!':`${ok}/${qs.length} — fix the red ones and check again.`)}}};
// ---------- test ----------
let timerId=null;
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function paneTest(l,p){const sk=l.skill,x=X[sk],q=Q(),r=q.res[sk],got=earnedA(q,sk),lk=lockedIn(q,sk);
 const tryN=r?r.tries.length+1:1;
 const hist=S.qs.map(qq=>{const rr=qq.res[sk];return rr&&rr.tries.length?`Q${qq.n}: ${rr.tries.map(t=>t+'% ('+letter(t)+')').join(' → ')}${earnedA(qq,sk)?' · A ✔':lockedIn(qq,sk)?' · marked for retake':''}`:''}).filter(Boolean).join('<br>');
 let can=!lk,why='';
 if(got)why='You earned an A in this class. Practice tests won\'t change your grade.';
 else if(lk)why=`This class is <b>marked for retake</b>. It will be in Quarter ${q.n+1} — start it from the banner when this session ends.`;
 p.innerHTML=teach(`Final class test! ${x.T.length} questions, 8 minutes. Our goal is an <b>A (90%+)</b>, and your mini-project must be complete to lock it in. ${tryN===2&&!got?'This is your one <b>retake</b> for this class this quarter.':'You get one retake if you need it.'} Breathe — you've got this.`)+
 `<div class="card"><p><b>Grading:</b> A 90+ · B 80+ · C 70+ · D 60+ · F below 60. Goal = A (90%+) with the mini-project done. One retake per class per quarter; no A → marked for retake next quarter.</p>${S.proj[sk]?'':'<p class="bad">Mini-project not done yet — even a 100% can\'t count as an A until it is.</p>'}<p class="mut">${hist||'No attempts yet.'}</p><p>${why}</p>${can||got?`<button class="btn gold" id="start">${got?'Practice test':tryN===2?'Start retake':'Start test'}</button>`:''}</div><div id="tz"></div>`;
 const b=$('#start');if(b)b.onclick=()=>runTest(l,got)}
function runQuiz(z,qs,secs,onDone){const ans={};let left=secs;
 z.innerHTML=`<div class="card"><div class="row"><span class="timer" id="tm"></span><span class="mut">answered <b id="ac">0</b>/${qs.length}</span></div>${qs.map((t,i)=>`<div class="q"><b>${i+1}. ${t.tag?'<span class="pill">'+esc(t.tag)+'</span> ':''}${esc(t[0])}</b>${t[1].map((o,j)=>`<button class="opt" data-q="${i}" data-j="${j}">${esc(o)}</button>`).join('')}</div>`).join('')}<button class="btn gold" id="sub">Submit</button></div>`;
 z.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{ans[b.dataset.q]=+b.dataset.j;z.querySelectorAll(`[data-q="${b.dataset.q}"]`).forEach(o=>o.classList.toggle('sel',o===b));$('#ac').textContent=Object.keys(ans).length});
 const tick=()=>{const m=$('#tm');if(!m)return clearInterval(timerId);m.textContent=`⏱ ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;m.classList.toggle('low',left<=60);if(left--<=0)fin()};
 clearInterval(timerId);timerId=setInterval(tick,1000);tick();$('#sub').onclick=fin;
 function fin(){clearInterval(timerId);let ok=0;qs.forEach((t,i)=>{if(ans[i]===t[2])ok++});const pct=Math.round(ok/qs.length*100);
  const review=`<div class="card"><h2>Review</h2>${qs.map((t,i)=>{const r=ans[i]===t[2];return `<div class="q"><b>${r?'✅':'❌'} ${esc(t[0])}</b><div>${r?'':`Your answer: ${ans[i]===undefined?'(blank)':esc(t[1][ans[i]])}<br>`}Correct: <b>${esc(t[1][t[2]])}</b></div><div class="mut">${esc(t[3])}</div></div>`}).join('')}</div>`;
  onDone(pct,ok,review)}}
function runTest(l,practice){const sk=l.skill,q=Q();$('#start').remove();
 runQuiz($('#tz'),shuffle(X[sk].T),TEST_SECS,(pct,ok,review)=>{const g=letter(pct);
  if(!practice){rec(q,sk).tries.push(pct);save()}
  const r=q.res[sk]||{tries:[]},isA=earnedA(q,sk),retakeLeft=!practice&&!isA&&r.tries.length<2,marked=!practice&&!isA&&r.tries.length>=2;
  const msg=practice?`Practice score: ${g}.`:isA?`An A! That's exactly what we're going for, Lord. Proud of you.`:pct>=A_MIN?`You scored ${g}, but finish the mini-project to lock in the A.${retakeLeft?' Your retake is still available.':''}`:retakeLeft?`That's a ${g} — not an A yet. Review the misses below, re-read, then use your one retake.`:`That's a ${g}. This class is now marked for retake — it'll be in next quarter. No stress; repetition is how mastery happens.`;
  $('#tz').innerHTML=`<div class="card" style="text-align:center"><div class="grade">${g}</div><div>${ok}/${X[sk].T.length} correct · ${pct}%</div>${marked?'<div class="bad">Marked for retake</div>':''}</div>`+teach(esc(msg))+review+(retakeLeft?'<button class="btn gold" id="again">Back to test page</button>':'');
  say(msg);const a=$('#again');if(a)a.onclick=()=>renderClass()})}
// ---------- final exam ----------
const finalOpen=()=>S.qs.length>1||dayNum()>16||L.every(l=>status(l.skill).tested);
function renderFinal(){const hist=S.final.map((f,i)=>`Attempt ${i+1} (${f.date}): ${f.pct}% (${letter(f.pct)})`).join('<br>');
 app.innerHTML=`<div class="board"><h1>🎓 Final Exam</h1><div class="mut">Mixed questions across all 16 classes plus cross-skill questions (HTML+CSS+JS, React+TS, SQL+Python, Docker+Go, Git everywhere). 20 minutes.</div></div>`+
 teach(finalOpen()?`This is the big one: everything connects. Take your time reading each question — the cross-skill ones reward real understanding.`:`The final exam unlocks after Day 16 (or once every class has been tested). Keep going — you're building toward it.`)+
 `<div class="card"><p class="mut">${hist||'No final exam attempts yet.'}</p>${finalOpen()?'<button class="btn gold" id="fx">Start final exam</button>':''}</div><div id="tz"></div>`;
 const b=$('#fx');if(b)b.onclick=()=>{b.remove();const qs=shuffle([...L.map(l=>{const t=shuffle(X[l.skill].T)[0].slice();t.tag=l.skill;return t}),...shuffle(window.CROSS).slice(0,10).map(t=>{t=t.slice();t.tag='Cross-skill';return t})]);
  runQuiz($('#tz'),qs,FINAL_SECS,(pct,ok,review)=>{S.final.push({pct,date:today()});save();const g=letter(pct);
   $('#tz').innerHTML=`<div class="card" style="text-align:center"><div class="grade">${g}</div><div>${ok}/${qs.length} correct · ${pct}%</div></div>`+teach(esc(pct>=A_MIN?'An A on the final! You really get how it all fits together.':`That's a ${g}. Look at which skills the misses came from — those are your study list.`))+review;say(pct>=A_MIN?'An A on the final!':`That's a ${g}.`)})}}
// ---------- desks ----------
function renderDesks(){const q=Q();
 app.innerHTML=`<div class="board"><h1>🪑 Classroom — Quarter ${q.n}</h1><div class="mut">Each desk lights up when its class is passed. Gold = A.</div></div>${teach(`${L.filter(l=>hasA(l.skill)).length} of 16 desks are gold. Tap any desk to go to that class.`)}
 <div class="room"><div class="chalk">Lord's Outlier Skills</div><div class="desks">${L.map((l,i)=>{const st=status(l.skill),inQ=q.skills.indexOf(l.skill);const b=best(l.skill);
 return `<div class="dk ${st.a?'gold':st.passed?'lit':''} ${inQ<0?'grad':''} ${markedRetake(l.skill)?'retake':''}" data-s="${esc(l.skill)}"><div class="top">${esc(l.skill)}</div><div class="g">${b===null?'—':letter(b)}</div><div class="mut">${st.a?'A ✔':markedRetake(l.skill)?'Retake':st.tested?'Tested':st.learned?'Learned':'Day '+(i+1)}</div></div>`}).join('')}</div></div>`;
 document.querySelectorAll('.dk').forEach(d=>d.onclick=()=>{const i=Q().skills.indexOf(d.dataset.s);if(i<0)return alert('You already earned an A in '+d.dataset.s+'!');sel=i+1;tab='hook';setNav('today');render()})}
// ---------- notebook ----------
let nbSel=L[0].skill;
function nbText(){return L.map(l=>{const nb=S.nb[l.skill]||{};return `=== ${l.skill}: ${l.title} ===\n`+l.concepts.map((c,i)=>`• ${c}\n  My words: ${nb[i]||'(not written yet)'}`).join('\n')+(S.notes[l.skill]?`\nClass notes: ${S.notes[l.skill]}`:'')}).join('\n\n')}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function renderNotebook(){const l=lessonOf(nbSel),nb=S.nb[nbSel]||(S.nb[nbSel]={});
 app.innerHTML=`<div class="board"><h1>📓 My Notebook</h1><div class="mut">Every concept, in your own words.</div></div>
 <div class="row"><select id="nbs">${L.map(x=>`<option ${x.skill===nbSel?'selected':''}>${esc(x.skill)}</option>`).join('')}</select><button class="btn gold" id="nbx">Export notebook (.txt)</button></div>
 <div class="card page"><h2>${esc(l.skill)} — ${esc(l.title)}</h2>${l.concepts.map((c,i)=>`<div class="q"><b>${i+1}. ${esc(c)}</b><textarea class="nbx" data-c="${i}" rows="2" placeholder="Explain it like you're teaching a friend…">${esc(nb[i]||'')}</textarea></div>`).join('')}
 <h2>Class notes</h2><textarea id="cn" rows="3">${esc(S.notes[l.skill]||'')}</textarea></div>`;
 $('#nbs').onchange=e=>{nbSel=e.target.value;renderNotebook()};$('#nbx').onclick=()=>download('lord-notebook.txt',nbText(),'text/plain');
 document.querySelectorAll('.nbx').forEach(t=>{t.oninput=()=>{nb[t.dataset.c]=t.value};t.onchange=save});$('#cn').oninput=e=>{S.notes[l.skill]=e.target.value};$('#cn').onchange=save}
// ---------- report ----------
function gpaOf(q){let p=0,n=0;q.skills.forEach(sk=>{const b=qBest(q,sk);if(b!==null){p+=GP[letter(b)];n++}});return n?(p/n).toFixed(2):'—'}
function renderReport(){const initialDone=S.qs.length>1||sessionOver();
 let p=0,n=0;L.forEach(l=>{const b=best(l.skill);if(b!==null){p+=GP[letter(b)];n++}});const gpa=n?(p/n).toFixed(2):'—',na=L.filter(l=>hasA(l.skill)).length;
 const qTables=S.qs.slice().reverse().map(q=>`<div class="card" style="overflow-x:auto"><h2>Quarter ${q.n} report card <span class="mut">· started ${q.start} · GPA ${gpaOf(q)}</span></h2><table class="rc"><tr><th>Class</th><th>Grade</th><th>Attempts</th><th>Project</th><th>Status</th></tr>${q.skills.map(sk=>{const r=q.res[sk],b=qBest(q,sk);
  return `<tr><td>${esc(sk)}</td><td><b>${b===null?'—':letter(b)}</b>${b===null?'':' ('+b+'%)'}</td><td>${r?r.tries.map(t=>t+'%').join(' → ')||'0':'0'}</td><td>${S.proj[sk]?'✔':'·'}</td><td>${earnedA(q,sk)?'<span class="ok">A ✔</span>':lockedIn(q,sk)?'<span class="bad">Marked for retake</span>':r&&r.tries.length?'Retake available':''}</td></tr>`}).join('')}</table></div>`).join('');
 app.innerHTML=`<div class="board"><h1>📋 Report Card — Lord A'lhjmii</h1><div class="mut">Lord's Outlier Skills Classroom · Quarter ${Q().n}${initialDone?'':' · first session in progress'}</div></div>
 <div class="card stats"><div class="stat"><div class="n">${gpa}</div>Overall GPA</div><div class="stat"><div class="n">${na}/16</div>A's earned</div><div class="stat"><div class="n">${S.final.length?letter(Math.max(...S.final.map(f=>f.pct))):'—'}</div>Final exam</div><div class="stat"><div class="n">${streak()}🔥</div>Day streak</div></div>
 <div class="card"><div class="bar"><div style="width:${Math.round(na/16*100)}%"></div></div></div>${quarterBanner()}
 <div class="card"><h2>Skill tracker</h2><div class="grid">${L.map(l=>{const st=status(l.skill);return `<div class="tile ${st.a?'gold':st.passed?'done':''}"><b>${esc(l.skill)}</b><br><span class="badge ${st.learned?'y':''}">Learned</span><span class="badge ${st.tested?'y':''}">Tested</span><span class="badge ${st.passed?'y':''}">Passed</span><span class="badge ${st.a?'g':''}">A</span></div>`}).join('')}</div></div>
 ${qTables}
 <p class="mut">A 90+ · B 80+ · C 70+ · D 60+ · F &lt;60. Goal: an A (90%+) with the mini-project done. One retake per class per quarter; classes without an A go into the next quarter until all 16 are A.</p>
 <div class="card"><h2>Backup & devices</h2><p class="mut">Progress saves automatically on this device. Export a backup file to keep it safe or move to another phone/computer.</p><div class="row"><button class="btn gold" id="exp">Export progress (.json)</button><label class="btn">Import progress<input type="file" id="imp" accept=".json,application/json" hidden></label><label>Quarter start <input type="date" id="sd" value="${Q().start}" style="width:auto"></label><button class="btn" id="reset">Reset all</button></div><p id="impmsg" class="mut"></p></div>`;
 bindQuarter();
 $('#exp').onclick=()=>{save();download(`outlier-classroom-backup-${today()}.json`,JSON.stringify({app:'outlier-classroom',version:1,saved:new Date().toISOString(),state:S,code:Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('code-')).map(k=>[k,localStorage.getItem(k)]))},null,1),'application/json')};
 $('#imp').onchange=async e=>{try{const d=JSON.parse(await e.target.files[0].text());if(d.app!=='outlier-classroom'||!d.state||!Array.isArray(d.state.qs))throw new Error('Not an Outlier Classroom backup');
  if(!confirm('Replace current progress with this backup?'))return;S=Object.assign(fresh(),d.state);Object.entries(d.code||{}).forEach(([k,v])=>localStorage.setItem(k,v));save();renderReport();$('#impmsg').textContent='Backup restored.'}catch(err){$('#impmsg').textContent='Import failed: '+err.message}};
 $('#sd').onchange=e=>{Q().start=e.target.value;save();renderReport()};
 $('#reset').onclick=()=>{if(confirm('Reset ALL progress, grades, notebook, and notes?')){noSave=true;localStorage.removeItem(KEY);Object.keys(localStorage).filter(k=>k.startsWith('code-')).forEach(k=>localStorage.removeItem(k));location.reload()}}}
window.__oc={get S(){return S},save,render,startQuarter};
render();
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js');
})();
