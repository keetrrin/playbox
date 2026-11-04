// Каждая игра: start(контейнер, onScore) -> функция остановки. onScore(очки) вызывается в конце партии.
const mk=(t,c,p)=>{const e=document.createElement(t);if(c)e.className=c;if(p)p.append(e);return e};

function snake(el,onScore){el.dataset.t='snake';el.style.setProperty('--ui','170px');
  const c=mk('canvas','',el);c.width=c.height=300;const x=c.getContext('2d');
  const info=mk('div','',el),btn=mk('button','',el);btn.textContent='Играть снова';btn.style.display='none';
  let s,d,nd,f,score,t;
  const P=p=>[p.x*20+10,p.y*20+10],dot=(a,b,r,col)=>{x.fillStyle=col;x.beginPath();x.arc(a,b,r,0,7);x.fill()};
  const food=()=>{do f={x:Math.random()*15|0,y:Math.random()*15|0};while(s.some(p=>p.x==f.x&&p.y==f.y))};
  const reset=()=>{s=[{x:7,y:7},{x:6,y:7},{x:5,y:7}];d=nd={x:1,y:0};score=0;food();clearInterval(t);t=setInterval(tick,130);info.textContent='Очки: 0';btn.style.display='none';draw()};
  const turn=(a,b)=>{if(a+d.x||b+d.y)nd={x:a,y:b}};
  const keys={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
  const key=e=>{const m=keys[e.key];if(m){e.preventDefault();turn(...m)}};
  function draw(){
    for(let i=0;i<15;i++)for(let j=0;j<15;j++){x.fillStyle=(i+j)%2?'#1b2d20':'#203526';x.fillRect(i*20,j*20,20,20)}
    const[ax,ay]=P(f);dot(ax,ay+1,8,'#e53935');dot(ax-3,ay-2,2.5,'#ff8a80');
    x.strokeStyle='#5d4037';x.lineWidth=2;x.beginPath();x.moveTo(ax,ay-6);x.lineTo(ax+1,ay-10);x.stroke();
    x.fillStyle='#43a047';x.beginPath();x.ellipse(ax+5,ay-8,4,2,-.5,0,7);x.fill();
    x.lineCap=x.lineJoin='round';x.beginPath();s.forEach((p,i)=>{const[a,b]=P(p);i?x.lineTo(a,b):x.moveTo(a,b)});
    x.strokeStyle='#2e7d32';x.lineWidth=17;x.stroke();x.strokeStyle='#66bb6a';x.lineWidth=11;x.stroke();x.strokeStyle='#a5d6a7';x.lineWidth=3;x.stroke();
    const[hx,hy]=P(s[0]);dot(hx,hy,10,'#43a047');
    x.strokeStyle='#e53935';x.lineWidth=2;x.beginPath();x.moveTo(hx+d.x*10,hy+d.y*10);x.lineTo(hx+d.x*17,hy+d.y*17);x.stroke();
    [1,-1].forEach(k=>{const ex=hx+d.x*3-d.y*5*k,ey=hy+d.y*3+d.x*5*k;dot(ex,ey,3.2,'#fff');dot(ex+d.x*1.2,ey+d.y*1.2,1.6,'#111')});
  }
  function tick(){
    d=nd;const h={x:s[0].x+d.x,y:s[0].y+d.y};
    if(h.x<0||h.y<0||h.x>14||h.y>14||s.some(p=>p.x==h.x&&p.y==h.y)){clearInterval(t);info.textContent='Игра окончена! Очки: '+score;onScore(score);btn.style.display='';return}
    s.unshift(h);if(h.x==f.x&&h.y==f.y){score++;info.textContent='Очки: '+score;food()}else s.pop();draw();
  }
  const pad=mk('div','pad',el);
  [['',0,0],['▲',0,-1],['',0,0],['◀',-1,0],['▼',0,1],['▶',1,0]].forEach(([l,a,b])=>{const B=mk('button','',pad);B.textContent=l;if(l)B.onclick=()=>turn(a,b);else B.style.visibility='hidden'});
  btn.onclick=reset;document.addEventListener('keydown',key);reset();
  return()=>{clearInterval(t);document.removeEventListener('keydown',key)};
}

function ttt(el,onScore){
  const info=mk('div','',el),g=mk('div','ttt',el);let b,wins=0,end;
  const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const win=d=>{for(const[a,c,e]of L)if(d[a]&&d[a]==d[c]&&d[a]==d[e])return d[a];return d.includes('')?null:'D'};
  const mm=(d,p)=>{const w=win(d);if(w)return w=='O'?1:w=='X'?-1:0;let r=p=='O'?-2:2;
    d.forEach((v,i)=>{if(v)return;d[i]=p;const s=mm(d,p=='O'?'X':'O');d[i]='';r=p=='O'?Math.max(r,s):Math.min(r,s)});return r};
  const bot=()=>{const e=b.map((v,i)=>v?-1:i).filter(i=>i>=0);if(Math.random()<.2)return e[Math.random()*e.length|0];
    let bi=e[0],bs=-2;for(const i of e){b[i]='O';const s=mm(b,'X');b[i]='';if(s>bs){bs=s;bi=i}}return bi};
  const draw=()=>g.querySelectorAll('button').forEach((B,i)=>B.textContent=b[i]=='X'?'❌':b[i]=='O'?'⭕':'');
  const fin=m=>{end=true;info.textContent=m+' Победы: '+wins;draw();setTimeout(reset,1500)};
  const reset=()=>{b=Array(9).fill('');end=false;info.textContent='Вы ❌, бот ⭕ — он играет хитро. Победы: '+wins;draw()};
  for(let i=0;i<9;i++){const B=mk('button','',g);B.onclick=()=>{
    if(end||b[i])return;b[i]='X';let w=win(b);
    if(w=='X'){wins++;draw();onScore(wins);return fin('Вы победили!')}
    if(w=='D')return fin('Ничья.');
    b[bot()]='O';w=win(b);draw();
    if(w=='O')return fin('Бот победил.');if(w=='D')return fin('Ничья.')}}
  reset();return()=>{};
}

function g2048(el,onScore){
  const info=mk('div','',el),g=mk('div','board2',el);let C,score,over;
  const pos=t=>{t.el.style.left=t.i%4*25+'%';t.el.style.top=(t.i/4|0)*25+'%'};
  const show=t=>{t.el.firstChild.textContent=t.v;t.el.dataset.v=t.v};
  const add=()=>{const e=[];C.forEach((t,i)=>t||e.push(i));if(!e.length)return;const t={v:Math.random()<.9?2:4,i:e[Math.random()*e.length|0]};
    t.el=mk('div','tile new',g);mk('div','',t.el);show(t);pos(t);C[t.i]=t};
  const stuck=()=>C.every(Boolean)&&!C.some((t,i)=>(i%4<3&&t.v==C[i+1].v)||(i<12&&t.v==C[i+4].v));
  const mv=d=>{if(over)return;let moved=false;
    for(let k=0;k<4;k++){
      const idx=[0,1,2,3].map(j=>d<2?k*4+j:j*4+k);if(d%2)idx.reverse();
      const ts=idx.map(i=>C[i]).filter(Boolean),out=[];
      for(let i=0;i<ts.length;i++){const t=ts[i],n=ts[i+1];if(n&&n.v==t.v){t.v*=2;score+=t.v;out.push([t,n]);i++}else out.push([t])}
      idx.forEach(i=>C[i]=null);
      out.forEach((grp,j)=>{const i=idx[j],t=grp[0];C[i]=t;grp.forEach(u=>{if(u.i!=i)moved=true;u.i=i;pos(u)});
        if(grp[1]){const o=grp[1].el;o.style.zIndex=0;setTimeout(()=>o.remove(),140);
          setTimeout(()=>{show(t);t.el.classList.remove('bump');void t.el.offsetWidth;t.el.classList.add('bump')},140)}})}
    if(!moved)return;info.textContent='Очки: '+score;
    setTimeout(()=>{add();if(stuck()){over=1;info.textContent='Игра окончена! Очки: '+score;onScore(score)}},150)};
  const map={ArrowLeft:0,ArrowRight:1,ArrowUp:2,ArrowDown:3};
  const key=e=>{if(e.key in map){e.preventDefault();mv(map[e.key])}};
  let sx,sy;g.ontouchstart=e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY};
  g.ontouchend=e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))>25)mv(Math.abs(dx)>Math.abs(dy)?(dx<0?0:1):(dy<0?2:3))};
  const pad=mk('div','pad',el);
  [['',-1],['▲',2],['',-1],['◀',0],['▼',3],['▶',1]].forEach(([l,d])=>{const B=mk('button','',pad);B.textContent=l;if(l)B.onclick=()=>mv(d);else B.style.visibility='hidden'});
  const n=mk('button','',el);n.textContent='Новая игра';
  const start=()=>{g.querySelectorAll('.tile').forEach(e=>e.remove());C=Array(16).fill(null);score=0;over=0;add();add();info.textContent='Очки: 0'};
  n.onclick=start;document.addEventListener('keydown',key);start();
  return()=>document.removeEventListener('keydown',key);
}

function memory(el,onScore){
  const info=mk('div','',el),g=mk('div','mem',el);
  const E=['🍎','🍌','🍇','🍒','🍋','🥝','🍉','🍓'];let moves,open,done,lock;
  const start=()=>{const d=[...E,...E].sort(()=>Math.random()-.5);moves=0;open=[];done=0;lock=false;g.innerHTML='';info.textContent='Ходы: 0';
    d.forEach(v=>{const B=mk('button','',g);B.onclick=()=>{
      if(lock||B.textContent)return;B.textContent=v;open.push(B);
      if(open.length==2){moves++;info.textContent='Ходы: '+moves;const[a,b]=open;open=[];
        if(a.textContent==b.textContent){a.disabled=b.disabled=true;if(++done==8){const s=Math.max(10,300-moves*10);info.textContent='Победа! Очки: '+s;onScore(s)}}
        else{lock=true;setTimeout(()=>{a.textContent=b.textContent='';lock=false},700)}}}})};
  const n=mk('button','',el);n.textContent='Новая игра';n.onclick=start;start();return()=>{};
}

function mole(el,onScore){
  const info=mk('div','',el),g=mk('div','mole',el);let sc=0,left=0,t1,t2,cur=-1;
  const upd=()=>info.textContent=`Время: ${left}с · Очки: ${sc}`;
  const show=()=>{clearTimeout(t2);cells.forEach(c=>c.textContent='');if(left<=0)return;let n;do n=Math.random()*9|0;while(n==cur);cur=n;cells[n].textContent='🐹';t2=setTimeout(show,Math.max(750,1150-sc*15))};
  const cells=[...Array(9)].map((_,i)=>{const B=mk('button','',g);B.onclick=()=>{if(i===cur&&left>0){sc++;cur=-1;B.textContent='💥';upd();clearTimeout(t2);t2=setTimeout(show,400)}};return B});
  const start=()=>{clearInterval(t1);clearTimeout(t2);sc=0;left=30;cur=-1;upd();show();
    t1=setInterval(()=>{left--;upd();if(left<=0){clearInterval(t1);clearTimeout(t2);cells.forEach(c=>c.textContent='');info.textContent='Время вышло! Очки: '+sc;onScore(sc)}},1000)};
  const n=mk('button','',el);n.textContent='Начать / заново';n.onclick=start;info.textContent='Нажмите «Начать»';
  return()=>{clearInterval(t1);clearTimeout(t2)};
}

function reaction(el,onScore){
  const B=mk('button','react',el);let st='idle',t0,to;
  const set=(c,t)=>{B.style.background=c;B.textContent=t};
  set('#3a3f5c','Нажмите, чтобы начать');
  B.onclick=()=>{
    if(st=='idle'){st='wait';set('#c0392b','Ждите зелёного…');to=setTimeout(()=>{st='go';t0=performance.now();set('#27ae60','ЖМИТЕ!')},1000+Math.random()*3000)}
    else if(st=='wait'){clearTimeout(to);st='idle';set('#3a3f5c','Слишком рано! Нажмите, чтобы повторить')}
    else{const ms=Math.round(performance.now()-t0),s=Math.max(0,1000-ms);st='idle';set('#3a3f5c',`${ms} мс · очки ${s}. Ещё раз?`);onScore(s)}};
  return()=>clearTimeout(to);
}


function simon(el,onScore){
  const info=mk('div','',el),g=mk('div','simon',el);let seq=[],i=0,busy=true,sc=0;
  const sl=ms=>new Promise(r=>setTimeout(r,ms));
  const bs=['#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6','#e67e22'].map((c,k)=>{const B=mk('button','',g);B.style.background=c;B.onclick=()=>press(k);return B});
  const flash=async k=>{bs[k].classList.add('lit');await sl(350);bs[k].classList.remove('lit');await sl(150)};
  const play=async()=>{busy=true;i=0;info.textContent='Смотрите…';for(const k of seq)await flash(k);busy=false;info.textContent='Ваш ход'};
  const next=()=>{seq.push(Math.random()*6|0);play()};
  const press=k=>{if(busy)return;flash(k);if(k!=seq[i]){busy=true;info.textContent='Ошибка! Очки: '+sc;onScore(sc);return}
    if(++i==seq.length){sc=seq.length;info.textContent='Верно! Очки: '+sc;busy=true;setTimeout(next,700)}};
  const n=mk('button','',el);n.textContent='Начать / заново';n.onclick=()=>{seq=[];sc=0;next()};info.textContent='Нажмите «Начать»';
  return()=>{busy=true;seq=[]};
}

function clicker(el,onScore){
  const info=mk('div','',el),B=mk('button','big',el);let n=0,t=0,on=false,to;
  B.textContent='Начать';info.textContent='10 секунд — кликайте как можно быстрее';
  const upd=()=>info.textContent=`Время: ${t}с · Клики: ${n}`;
  B.onclick=()=>{if(!on){on=true;n=1;t=10;B.textContent='👆';upd();
      to=setInterval(()=>{t--;upd();if(t<=0){clearInterval(to);on=false;B.textContent='Ещё раз';info.textContent='Итог: '+n;onScore(n)}},1000)}
    else{n++;upd()}};
  return()=>clearInterval(to);
}

function flappy(el,onScore){el.dataset.t='flappy';
  const c=mk('canvas','tall',el);c.width=320;c.height=420;const x=c.getContext('2d');
  let y=200,v=0,p=[],sc=0,run=false,f=0;
  const flap=e=>{if(e.type=='keydown'&&e.code!='Space')return;e.preventDefault();if(!run){y=200;v=0;p=[{x:340,g:150}];sc=0;run=true}v=-6};
  const cloud=(a,b,r)=>{x.beginPath();x.arc(a,b,r,0,7);x.arc(a+r,b+4,r*.8,0,7);x.arc(a-r,b+5,r*.7,0,7);x.fill()};
  const pipe=(a,t,b,top)=>{const g=x.createLinearGradient(a,0,a+50,0);g.addColorStop(0,'#2e7d32');g.addColorStop(.5,'#7cb342');g.addColorStop(1,'#2e7d32');
    x.fillStyle=g;x.fillRect(a,t,50,b-t);x.fillStyle='#33691e';x.fillRect(a-4,top?b-16:t,58,16)};
  const el2=(a,b,rx,ry,col)=>{x.fillStyle=col;x.beginPath();x.ellipse(a,b,rx,ry,0,0,7);x.fill()};
  const tick=()=>{f++;
    const g=x.createLinearGradient(0,0,0,420);g.addColorStop(0,'#4fc3f7');g.addColorStop(1,'#c5ecff');x.fillStyle=g;x.fillRect(0,0,320,420);
    x.fillStyle='#ffffffcc';[[0,60,22],[130,110,18],[250,50,24]].forEach(([a,b,r])=>cloud(((a-f*.3)%380+380)%380-30,b,r));
    if(run){v+=.4;y+=v;p.forEach(o=>o.x-=2.5);if(p[0].x<-50)p.shift();if(p[p.length-1].x<170)p.push({x:340,g:90+Math.random()*200});
      p.forEach(o=>{if(!o.d&&o.x+50<46){o.d=1;sc++}if(74>o.x&&46<o.x+50&&(y-12<o.g-60||y+12>o.g+60))run=false});
      if(y<0||y>388)run=false;if(!run)onScore(sc)}
    p.forEach(o=>{pipe(o.x,0,o.g-60,1);pipe(o.x,o.g+60,400,0)});
    x.fillStyle='#8d6e63';x.fillRect(0,400,320,20);x.fillStyle='#7cb342';x.fillRect(0,400,320,6);
    x.save();x.translate(60,y);x.rotate(Math.max(-.5,Math.min(1.2,v/10)));
    el2(0,0,17,13,'#ffca28');el2(-2,6,10,6,'#fff3c4');
    x.save();x.rotate(-.4);el2(-5,2+Math.sin(f/3)*4,9,5,'#f9a825');x.restore();
    el2(7,-5,5,5,'#fff');el2(8.5,-5,2.4,2.4,'#111');
    x.fillStyle='#ff7043';x.beginPath();x.moveTo(14,-1);x.lineTo(26,3);x.lineTo(14,7);x.fill();x.restore();
    x.fillStyle='#fff';x.strokeStyle='#0006';x.lineWidth=4;x.font='bold 30px sans-serif';x.strokeText(sc,15,40);x.fillText(sc,15,40);
    if(!run){x.font='bold 20px sans-serif';x.strokeText('Пробел / тап — старт',55,215);x.fillText('Пробел / тап — старт',55,215)}};
  c.onclick=flap;document.addEventListener('keydown',flap);const t=setInterval(tick,16);
  return()=>{clearInterval(t);document.removeEventListener('keydown',flap)};
}

function guess(el,onScore){
  const info=mk('div','',el),val=mk('div','gv',el),r=mk('input','',el),hist=mk('div','',el),B=mk('button','',el);
  r.type='range';r.min=1;r.max=100;r.value=50;B.textContent='Проверить';let n,t,lo,hi;
  const upd=()=>{val.textContent=r.value;r.style.setProperty('--a',(lo-1)/99*100+'%');r.style.setProperty('--b',(hi-1)/99*100+'%')};
  r.oninput=upd;
  const start=()=>{n=1+Math.random()*100|0;t=0;lo=1;hi=100;hist.innerHTML='';r.value=50;info.textContent='Я загадал число от 1 до 100';upd()};
  B.onclick=()=>{const v=+r.value;t++;const ch=mk('span','chip',hist);ch.textContent=v;
    if(v==n){ch.classList.add('ok');const s=Math.max(10,110-t*10);info.textContent=`Верно за ${t} поп.! Очки: ${s}`;onScore(s);setTimeout(start,2500)}
    else{if(v<n)lo=Math.max(lo,v+1);else hi=Math.min(hi,v-1);ch.classList.add(v<n?'lo':'hi');info.textContent=(v<n?'Больше ⬆':'Меньше ⬇')+` · попыток: ${t}`;if(lo<=hi)r.value=lo+hi>>1;upd()}};
  start();return()=>{};
}

function lights(el,onScore){
  const info=mk('div','',el),g=mk('div','lights',el);let b,m;
  const tg=i=>{const r=i/5|0,c=i%5;[[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,d])=>{const R=r+a,C=c+d;if(R>=0&&R<5&&C>=0&&C<5)b[R*5+C]^=1})};
  const draw=()=>g.querySelectorAll('button').forEach((B,i)=>B.className=b[i]?'on':'');
  const start=()=>{b=Array(25).fill(0);m=0;for(let k=0;k<10;k++)tg(Math.random()*25|0);if(!b.includes(1))tg(12);draw();info.textContent='Погасите все лампочки'};
  for(let i=0;i<25;i++){const B=mk('button','',g);B.onclick=()=>{tg(i);m++;draw();
    if(!b.includes(1)){const s=Math.max(10,200-m*5);info.textContent=`Готово за ${m} ходов! Очки: ${s}`;onScore(s)}else info.textContent='Ходы: '+m}}
  const n=mk('button','',el);n.textContent='Новая игра';n.onclick=start;start();return()=>{};
}

function math(el,onScore){
  const info=mk('div','',el),q=mk('div','gv',el),i=mk('input','',el),B=mk('button','',el);i.type='number';i.placeholder='Ответ';
  let a,b,o,sc=0,t=0,iv;
  const ask=()=>{o=['+','−','×'][Math.random()*3|0];const m=o=='×'?10:30;a=2+Math.random()*m|0;b=2+Math.random()*m|0;q.textContent=`${a} ${o} ${b}`;i.value='';i.focus()};
  const upd=()=>info.textContent=`Время: ${t}с · Верно: ${sc}`;
  const sub=()=>{if(t<=0)return;if(i.value!==''&&+i.value===(o=='+'?a+b:o=='−'?a-b:a*b))sc++;ask();upd()};
  B.textContent='Старт';B.onclick=()=>{clearInterval(iv);sc=0;t=30;ask();upd();iv=setInterval(()=>{t--;upd();if(t<=0){clearInterval(iv);q.textContent='Время!';info.textContent='Итог: '+sc;onScore(sc)}},1000)};
  i.onkeydown=e=>{if(e.key=='Enter')sub()};info.textContent='30 секунд на примеры. Enter — ответить';q.textContent='?';
  return()=>clearInterval(iv);
}

function rps(el,onScore){
  const E=[['✊','Камень'],['✋','Бумага'],['✌️','Ножницы']];let st=0,best=0,busy=false;
  const sc=mk('div','rps-sc',el),ar=mk('div','rps-arena',el),res=mk('div','rps-res',el),row=mk('div','rps-row',el);
  const L=mk('div','rps-hand',ar),V=mk('div','rps-vs',ar),R=mk('div','rps-hand bot',ar);
  V.textContent='VS';L.textContent=R.textContent='✊';res.textContent='Выберите ход';
  const upd=()=>sc.textContent=`Серия: ${st} · Лучшая: ${best}`;upd();
  E.forEach(([e,n],k)=>{const B=mk('button','rps-card',row);B.innerHTML=`<span>${e}</span><small>${n}</small>`;B.onclick=()=>{
    if(busy)return;busy=true;L.textContent=R.textContent='✊';L.classList.add('shake');R.classList.add('shake');res.className='rps-res';res.textContent='…';
    setTimeout(()=>{L.classList.remove('shake');R.classList.remove('shake');const r=Math.random()*3|0,w=(k-r+3)%3;L.textContent=e;R.textContent=E[r][0];
      if(w==0){res.textContent='Ничья';res.classList.add('draw')}
      else if(w==1){st++;best=Math.max(best,st);res.textContent='Победа!';res.classList.add('win');onScore(st)}
      else{st=0;res.textContent='Поражение';res.classList.add('lose')}upd();busy=false},700)}});
  return()=>{};
}

function numbers(el,onScore){
  const info=mk('div','',el),g=mk('div','nums',el);let nx,t0;
  const start=()=>{g.innerHTML='';nx=1;info.textContent='Нажимайте числа от 1 до 16 по порядку';
    [...Array(16)].map((_,i)=>i+1).sort(()=>Math.random()-.5).forEach(v=>{const B=mk('button','',g);B.textContent=v;B.onclick=()=>{
      if(v!=nx)return;if(nx==1)t0=performance.now();B.classList.add('done');
      if(nx++==16){const ms=performance.now()-t0,s=Math.max(10,1000-Math.round(ms/50));info.textContent=`${(ms/1000).toFixed(1)} с · очки ${s}`;onScore(s)}}})};
  const n=mk('button','',el);n.textContent='Заново';n.onclick=start;start();return()=>{};
}

function timed(el,sec,end){let t=0,iv;const info=mk('div','',el);
  return{info,get t(){return t},start(upd){clearInterval(iv);t=sec;upd();iv=setInterval(()=>{t--;upd();if(t<=0){clearInterval(iv);end()}},1000)},stop(){clearInterval(iv)}};
}

function stroop(el,onScore){
  let sc=0,ans;const T=timed(el,30,()=>{w.textContent='Время!';onScore(sc)}),w=mk('div','gv',el),row=mk('div','rps-row',el),B0=mk('button','',el);
  const C=[['Красный','#e74c3c'],['Синий','#3498db'],['Зелёный','#2ecc71'],['Жёлтый','#c9a227']];
  const ask=()=>{const a=C[Math.random()*4|0],b=C[Math.random()*4|0];w.textContent=a[0];w.style.color=b[1];ans=b[0]};
  const upd=()=>T.info.textContent=`Время: ${T.t}с · Очки: ${sc}`;
  C.forEach(([n,c])=>{const B=mk('button','rps-card',row);B.style.background=c;B.textContent=n;B.onclick=()=>{if(T.t<=0)return;sc=n==ans?sc+1:Math.max(0,sc-1);ask();upd()}});
  B0.textContent='Старт';B0.onclick=()=>{sc=0;ask();T.start(upd)};T.info.textContent='Нажимайте на ЦВЕТ слова, а не на его значение';w.textContent='?';
  return()=>T.stop();
}

function slide(el,onScore){
  const info=mk('div','',el),g=mk('div','slide',el);let b,m;
  const draw=()=>{g.innerHTML='';b.forEach((v,i)=>{const B=mk('button',v?'':'empty',g);B.textContent=v||'';B.onclick=()=>{
    const z=b.indexOf(0);if(Math.abs((i/3|0)-(z/3|0))+Math.abs(i%3-z%3)!=1)return;[b[i],b[z]]=[b[z],b[i]];m++;draw();
    if(b.every((x,j)=>x==(j+1)%9)){const s=Math.max(10,500-m*5);info.textContent=`Собрано за ${m} ходов! Очки: ${s}`;onScore(s)}else info.textContent='Ходы: '+m}})};
  const start=()=>{b=[1,2,3,4,5,6,7,8,0];m=0;for(let k=0;k<80;k++){const z=b.indexOf(0),n=[z-3,z+3,z%3?z-1:-1,z%3<2?z+1:-1].filter(i=>i>=0&&i<9),i=n[Math.random()*n.length|0];[b[i],b[z]]=[b[z],b[i]]}
    draw();info.textContent='Соберите числа по порядку'};
  const n=mk('button','',el);n.textContent='Перемешать';n.onclick=start;start();return()=>{};
}

function typing(el,onScore){
  let cur,sc=0;const T=timed(el,30,()=>{w.textContent='Время!';onScore(sc)}),w=mk('div','gv',el),i=mk('input','',el),B=mk('button','',el);
  i.type='text';i.autocomplete='off';i.placeholder='Печатайте слово';
  const W='кот дом лес река небо ветер книга игра сайт код мир звезда океан гора ночь огонь свет поле город птица'.split(' ');
  const next=()=>{cur=W[Math.random()*W.length|0];w.textContent=cur;i.value=''};
  const upd=()=>T.info.textContent=`Время: ${T.t}с · Слов: ${sc}`;
  i.oninput=()=>{if(T.t>0&&i.value.trim().toLowerCase()==cur){sc++;next();upd()}};
  B.textContent='Старт';B.onclick=()=>{sc=0;next();i.focus();T.start(upd)};T.info.textContent='Печатайте слова за 30 секунд';w.textContent='?';
  return()=>T.stop();
}

function hilo(el,onScore){
  const info=mk('div','',el),c=mk('div','gv',el),row=mk('div','rps-row',el);let cur=1+Math.random()*13|0,sc=0;
  c.textContent=cur;info.textContent='Следующее число (1–13) больше или меньше?';
  [['Больше',1],['Меньше',-1]].forEach(([l,d])=>{const B=mk('button','rps-card',row);B.textContent=l;B.onclick=()=>{const n=1+Math.random()*13|0;
    if(n==cur){info.textContent='Выпало такое же — повтор';return}
    if((n>cur?1:-1)==d){sc++;info.textContent='Верно! Серия: '+sc;onScore(sc)}else{info.textContent=`Мимо! Выпало ${n}. Серия сброшена`;sc=0}cur=n;c.textContent=n}});
  return()=>{};
}

function catcher(el,onScore){el.dataset.t='catcher';
  const c=mk('canvas','tall',el);c.width=320;c.height=420;const x=c.getContext('2d');
  let bx=160,it=[],sc=0,life=3,f=0,run=false,L=0,R=0;
  const key=e=>{if(e.key=='ArrowLeft')L=e.type=='keydown';if(e.key=='ArrowRight')R=e.type=='keydown'};
  const mv=e=>{const r=c.getBoundingClientRect(),cx=e.touches?e.touches[0].clientX:e.clientX;bx=(cx-r.left)*320/r.width};
  c.onmousemove=mv;c.ontouchmove=e=>{e.preventDefault();mv(e)};c.onclick=()=>{if(!run){it=[];sc=0;life=3;f=0;run=true}};
  const tick=()=>{x.fillStyle='#142033';x.fillRect(0,0,320,420);
    if(run){f++;bx=Math.max(30,Math.min(290,bx+(R-L)*6));if(f%Math.max(14,40-f/80|0)==0)it.push({x:20+Math.random()*280,y:-10,b:Math.random()<.25,s:2+Math.random()*2+f/700});
      it.forEach(o=>o.y+=o.s);
      it=it.filter(o=>{if(o.y>385&&o.y<415&&Math.abs(o.x-bx)<34){if(o.b)life--;else sc++;return false}if(o.y>430){if(!o.b)life--;return false}return true});
      if(life<=0){run=false;onScore(sc)}}
    x.font='26px serif';x.textAlign='center';it.forEach(o=>x.fillText(o.b?'💣':'🍎',o.x,o.y));x.fillText('🧺',bx,410);
    x.font='bold 20px sans-serif';x.fillStyle='#fff';x.textAlign='left';x.fillText(`Очки ${sc}   Жизни ${life}`,10,26);
    if(!run){x.textAlign='center';x.fillText('Нажмите — старт',160,210)}};
  document.addEventListener('keydown',key);document.addEventListener('keyup',key);const t=setInterval(tick,16);
  return()=>{clearInterval(t);document.removeEventListener('keydown',key);document.removeEventListener('keyup',key)};
}

function racing(el,onScore){
  el.dataset.t='racing3d';el.style.setProperty('--ui','0px');
  if(!window.THREE){el.textContent='3D-движок не загрузился. Проверьте интернет и обновите страницу.';return()=>{}}
  const T=THREE,W=1280,H=720,SEG=5,NS=90;
  const CARS={hatch:{n:'Хэтчбек',w:2,l:4.2,h:.9,ch:.8,cl:2.2,cz:.2,sp:0,hd:1},sport:{n:'Спорткар',w:2.1,l:4.7,h:.7,ch:.6,cl:2.3,cz:.4,sp:.18,hd:1.1},suv:{n:'Внедорожник',w:2.25,l:4.9,h:1.25,ch:.95,cl:3,cz:.3,sp:-.05,hd:.9},vaz:{n:'ВАЗ-2114',w:1.8,l:4.3,h:.75,ch:.4,cl:1.6,cz:.2,sp:-.02,hd:.95}};
  const TRK={meadow:{n:'Луга',top:'#3b7ddd',hor:'#cfe8ff',ground:0x4f8a35,l:1,tc:[0x2e7d32,0x1b5e20]},desert:{n:'Пустыня',top:'#e08a3c',hor:'#fbe3b8',ground:0xd2a86a,l:1.1,tc:[0x8d6e3b,0x6d4c25]},night:{n:'Ночь',top:'#02040f',hor:'#16224a',ground:0x0e1f16,l:.3,tc:[0x14361c,0x0e2a15],night:1}};
  const COLS=['#1e88e5','#e53935','#fdd835','#43a047','#eceff1','#212121','#8e24aa','#fb8c00','#b0b4ba','#7b1e24'],UP={engine:['Двигатель',60],nitro:['Нитро',50],handling:['Управление',40],accel:['Разгон',45],armor:['Броня',90],magnet:['Магнит монет',50],brakes:['Тормоза',35]};
  let G={coins:0,car:'hatch',color:'#1e88e5',track:'meadow',upg:{engine:0,nitro:0,handling:0,accel:0,armor:0,magnet:0,brakes:0}},online=false,ctl='keys',lastTxt='',mode='garage';
  try{ctl=localStorage.getItem('rcctl')||(('ontouchstart' in window)?'pointer':'keys')}catch(e){}
  const api=(u,b)=>fetch(u,{method:b?'POST':'GET',headers:b?{'Content-Type':'application/json','X-CSRFToken':(document.cookie.match(/csrftoken=([^;]+)/)||[])[1]||''}:{},body:b?JSON.stringify(b):undefined}).then(r=>r.json());
  const st=mk('div','stage',el),c=mk('canvas','',st),hud=mk('canvas','hud',st),gui=mk('div','gui',st),nb=mk('button','nitro',st),xb=mk('button','exitr',st);
  c.width=hud.width=W;c.height=hud.height=H;nb.textContent='НИТРО';xb.textContent='В гараж';
  const R3=new T.WebGLRenderer({canvas:c,antialias:true});R3.setSize(W,H,false);R3.setPixelRatio(1);R3.shadowMap.enabled=true;R3.shadowMap.type=T.PCFSoftShadowMap;R3.toneMapping=T.ACESFilmicToneMapping;R3.outputEncoding=T.sRGBEncoding;
  const scene=new T.Scene(),cam=new T.PerspectiveCamera(62,W/H,.1,560),hemi=new T.HemisphereLight(0xffffff,0x445544,1),sun=new T.DirectionalLight(0xfff3dd,1.1),lamp=new T.PointLight(0xfff0c8,0,45);
  sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:170});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.0005;scene.add(hemi,sun,sun.target);
  const world=new T.Group(),gg=new T.Group();scene.add(world,gg);
  const box=(w,h,l,m,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,l),m);o.position.set(x||0,y||0,z||0);return o};
  const std=(col,e,mt,rg)=>new T.MeshStandardMaterial({color:col,metalness:mt==null?.5:mt,roughness:rg==null?.4:rg,emissive:e||0});
  const skyTex=(a,b)=>{const q=document.createElement('canvas');q.width=2;q.height=256;const g=q.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,a);gr.addColorStop(.6,b);gr.addColorStop(1,b);g.fillStyle=gr;g.fillRect(0,0,2,256);return new T.CanvasTexture(q)};
  const mkTex=f=>{const q=document.createElement('canvas');q.width=256;q.height=128;f(q.getContext('2d'));const t=new T.CanvasTexture(q);t.anisotropy=8;return t};
  const roadTex=mkTex(g=>{g.fillStyle='#3a3d44';g.fillRect(0,0,256,128);for(let i=0;i<2600;i++){const v=40+Math.random()*30|0;g.fillStyle=`rgb(${v},${v},${v+4})`;g.fillRect(Math.random()*256,Math.random()*128,2,2)}
    g.fillStyle='#e8e8e8';g.fillRect(3,0,4,128);g.fillRect(249,0,4,128);[85,171].forEach(x=>g.fillRect(x-2,32,4,64))});
  // ---- гараж ----
  const flo=new T.Mesh(new T.PlaneGeometry(90,90),std(0x151922,0,.4,.55));flo.rotation.x=-Math.PI/2;flo.receiveShadow=true;gg.add(flo);
  const plat=new T.Mesh(new T.CylinderGeometry(4.4,4.6,.2,64),std(0x232833,0,.6,.4));plat.position.y=.1;plat.receiveShadow=true;gg.add(plat);
  const ring=new T.Mesh(new T.TorusGeometry(4.5,.07,8,80),std(0x2d7dff,0x2d7dff,.2,.4));ring.material.emissiveIntensity=2;ring.rotation.x=Math.PI/2;ring.position.y=.2;gg.add(ring);
  const wall=new T.Mesh(new T.CylinderGeometry(20,20,10,48,1,true),new T.MeshStandardMaterial({color:0x10141c,roughness:.8,side:T.BackSide}));wall.position.y=5;gg.add(wall);
  [2.5,6,9.5].forEach(y=>{const t=new T.Mesh(new T.TorusGeometry(19.8,.08,6,80),std(0xffffff,0xaaccff,.2,.4));t.material.emissiveIntensity=1.8;t.rotation.x=Math.PI/2;t.position.y=y;gg.add(t)});
  const spot=new T.SpotLight(0xffffff,1.8,45,.6,.5);spot.position.set(0,14,2);spot.castShadow=true;gg.add(spot,spot.target);
  [[0x3d8bff,-9,3,-4],[0xff8a3d,9,3,4]].forEach(([col,x,y,z])=>{const p=new T.PointLight(col,1.4,30);p.position.set(x,y,z);gg.add(p)});
  // ---- мир ----
  const gmat=new T.MeshStandardMaterial({color:0x4f8a35,roughness:1}),ground=new T.Mesh(new T.PlaneGeometry(2600,2600),gmat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;world.add(ground);
  const tmat=[0,1].map(()=>new T.MeshStandardMaterial({color:0x2e7d32,roughness:.9})),trunk=new T.MeshStandardMaterial({color:0x5d4037});
  const theme=()=>{const t=TRK[G.track];scene.background=skyTex(t.top,t.hor);scene.fog=new T.Fog(new T.Color(t.hor),70,350);gmat.color.set(t.ground);hemi.intensity=t.l;sun.intensity=t.l*1.1;lamp.intensity=t.night?1.6:0;tmat.forEach((m,i)=>m.color.set(t.tc[i]))};
  const asph=new T.MeshStandardMaterial({map:roadTex,roughness:.92}),bar=std(0xaeb4bb,0,.6,.4),lampM=std(0xffffee,0xffeeaa,.2,.4);lampM.emissiveIntensity=1.6;
  const segs=[...Array(NS)].map(()=>{const g=new T.Group(),r=box(14,.2,SEG+.05,asph);r.receiveShadow=true;g.add(r);
    [-7.7,7.7].forEach(xx=>g.add(box(.18,.35,SEG+.05,bar,xx,.75),box(.18,.35,SEG+.05,bar,xx,.35),box(.14,1,.14,bar,xx,.5,SEG/2-.2)));
    const pole=new T.Group();pole.add(box(.2,7,.2,bar,0,3.5),box(2.6,.15,.15,bar,-1.3,7),box(.8,.2,.5,lampM,-2.6,6.9));pole.position.x=9.2;g.add(pole);g.pole=pole;world.add(g);return g});
  const RX=z=>38*Math.sin(z/170)+18*Math.sin(z/71),SL=z=>(RX(z+3)-RX(z-3))/6,LN=[-4.67,0,4.67];
  const trees=[...Array(80)].map(()=>{const g=new T.Group(),t=new T.Mesh(new T.CylinderGeometry(.25,.35,2,6),trunk);t.position.y=1;t.castShadow=true;g.add(t);
    [[2.2,2.4,3.2],[1.7,2.2,4.6],[1.2,1.8,5.8]].forEach(([r,h,y],i)=>{const k=new T.Mesh(new T.ConeGeometry(r,h,8),tmat[i%2]);k.position.y=y;k.castShadow=true;g.add(k)});world.add(g);return{g,z:0,o:0}});
  const place=(t,z)=>{t.z=z;t.o=(Math.random()<.5?-1:1)*(12+Math.random()*50)};
  const cmat=new T.MeshStandardMaterial({color:0xffc107,metalness:.9,roughness:.2,emissive:0x553300});
  const coins=[...Array(10)].map(()=>{const g=new T.Group(),m=new T.Mesh(new T.CylinderGeometry(.7,.7,.18,24),cmat);m.rotation.x=Math.PI/2;g.add(m);world.add(g);return{g,z:0,l:0}});
  const resC=(o,z)=>{o.z=z;o.l=LN[Math.random()*3|0]};
  const cloudTex=mkTex(g=>{const gr=g.createRadialGradient(128,64,4,128,64,60);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,128)});
  const clouds=[...Array(14)].map(()=>{const sp=new T.Sprite(new T.SpriteMaterial({map:cloudTex,transparent:true,opacity:.8,fog:false}));sp.scale.set(80+Math.random()*60,30,1);world.add(sp);return{sp,z:Math.random()*500,o:(Math.random()-.5)*500,y:70+Math.random()*50}});
  const buildVaz=color=>{const g=new T.Group(),W2=1.8,L=4.3,paint=std(color,0,.55,.35),dark=std(0x0c1016,0,.2,.7),gl=std(0x0a1622,0,.95,.05),chr=std(0xb8bec6,0,.9,.3),by=.42;
    g.add(box(W2,.75,L,paint,0,by+.375),box(W2*.97,.1,L*.27,paint,0,by+.8,-L*.365),box(W2*.97,.1,.7,paint,0,by+.8,L*.4));
    const wsh=box(W2*.86,.03,.78,gl,0,1.385,-.725);wsh.rotation.x=-.58;g.add(wsh);const rg=box(W2*.84,.03,.72,gl,0,1.4,1.25);rg.rotation.x=.59;g.add(rg);
    g.add(box(W2*.89,.34,1.65,gl,0,1.42,.2),box(W2*.84,.07,1.7,paint,0,1.6,.2),box(W2*.8,.05,.3,paint,0,1.64,1.1));
    [-1,1].forEach(a=>{g.add(box(.05,.36,.1,paint,a*W2*.44,1.42,-.55),box(.05,.36,.1,paint,a*W2*.44,1.42,.95),box(.05,.36,.12,paint,a*W2*.44,1.42,.2));
      g.add(box(.42,.2,.08,std(0xffffff,0xfff2c0,.2,.2),a*W2*.33,by+.5,-L/2-.02),box(.3,.07,.06,std(0xff9800,0xff9800,.1,.5),a*W2*.33,by+.34,-L/2-.02),
        box(.14,.34,.06,std(0x330000,0xff1010,.2,.3),a*W2*.4,by+.55,L/2+.02),box(.1,.12,.06,std(0xff9800,0xff9800,.1,.5),a*W2*.4,by+.3,L/2+.02),
        box(.02,.08,L*.78,dark,a*(W2/2+.005),by+.45,0),box(.16,.12,.28,dark,a*(W2/2+.12),1.35,-.6))});
    g.add(box(W2*.36,.14,.05,dark,0,by+.52,-L/2-.015),box(W2*.34,.04,.03,chr,0,by+.62,-L/2-.03),box(W2,.26,.3,paint,0,by+.1,-L/2+.05),box(W2*.55,.1,.05,dark,0,by+.08,-L/2-.1),
      box(W2,.26,.3,paint,0,by+.1,L/2-.05),box(.5,.13,.03,std(0xf2f2f2,0,.1,.8),0,by+.35,L/2+.03),box(.4,.02,.04,dark,0,by+.35,L/2+.045));
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const w=new T.Mesh(new T.CylinderGeometry(.36,.36,.26,22),std(0x0a0a0a,0,.1,.9));w.rotation.z=Math.PI/2;w.position.set(a*W2/2,.36,b*L*.33);g.add(w);
      const rm=new T.Mesh(new T.CylinderGeometry(.24,.24,.28,12),std(0xcfd4da,0,.9,.35));rm.rotation.z=Math.PI/2;rm.position.copy(w.position);g.add(rm)});
    g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g};
  // ---- машина ----
  const buildCar=(type,color)=>{if(type=='vaz')return buildVaz(color);const m=CARS[type],g=new T.Group(),paint=std(color,0,.7,.25),dark=std(0x0c1016,0,.3,.6),gl=std(0x0a1622,0,.95,.05),by=.42;
    g.add(box(m.w,m.h*.7,m.l,paint,0,by+m.h*.35),box(m.w*.96,m.h*.3,m.l*.3,paint,0,by+m.h*.7,-m.l*.34),box(m.w*.96,m.h*.34,m.l*.22,paint,0,by+m.h*.72,m.l*.4));
    g.add(box(m.w*.84,m.ch,m.cl,paint,0,by+m.h+m.ch/2,m.cz),box(m.w*.86,m.ch*.62,m.cl*1.03,gl,0,by+m.h+m.ch*.55,m.cz));
    g.add(box(m.w*1.02,.18,.25,dark,0,by+.18,-m.l/2),box(m.w*1.02,.2,.25,dark,0,by+.18,m.l/2));
    [-1,1].forEach(a=>{g.add(box(.55,.16,.08,std(0xffffff,0xfff2c0,.2,.2),a*m.w*.3,by+m.h*.55,-m.l/2-.02),box(.6,.16,.08,std(0x330000,0xff1010,.2,.3),a*m.w*.3,by+m.h*.62,m.l/2+.02),box(.18,.12,.3,paint,a*(m.w/2+.1),by+m.h+.15,m.cz-m.cl*.35));
      const ex=new T.Mesh(new T.CylinderGeometry(.08,.08,.3,10),std(0x999999,0,.9,.3));ex.rotation.x=Math.PI/2;ex.position.set(a*m.w*.28,by,m.l/2+.1);g.add(ex)});
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const w=new T.Mesh(new T.CylinderGeometry(.43,.43,.34,20),std(0x0a0a0a,0,.1,.9));w.rotation.z=Math.PI/2;w.position.set(a*m.w/2,.43,b*m.l*.32);g.add(w);
      const rm=new T.Mesh(new T.CylinderGeometry(.27,.27,.36,12),std(0xc5ccd3,0,.95,.2));rm.rotation.z=Math.PI/2;rm.position.copy(w.position);g.add(rm)});
    if(type=='sport')g.add(box(m.w*.95,.08,.6,dark,0,by+m.h+.55,m.l/2-.3),box(.08,.4,.1,dark,-m.w*.3,by+m.h+.35,m.l/2-.3),box(.08,.4,.1,dark,m.w*.3,by+m.h+.35,m.l/2-.3));
    g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g};
  let me=null,tr=[],s=0,lat=0,sv=0,v=0,run=false,got=0,boost=0,cool=0,L=0,R=0,Br=0,tlat=0,score=0,alive=true,last0=performance.now(),ga=0,f0=0,shield=0;
  const setCar=()=>{if(me)scene.remove(me);me=buildCar(G.car,G.color);lamp.position.set(0,1.5,-4);me.add(lamp);scene.add(me)};
  const setMode=m=>{mode=m;world.visible=m=='race';gg.visible=m=='garage';gui.style.display=m=='garage'?'':'none';nb.style.display=xb.style.display=m=='race'?'':'none';
    if(m=='garage'){scene.background=new T.Color(0x0d1117);scene.fog=null;me.position.set(0,0,0);me.rotation.set(0,0,0);sun.intensity=.5;hemi.intensity=.7;lamp.intensity=0;ui()}else theme()};
  const bars=(a,b)=>`<i class="bar"><b style="width:${Math.min(100,a/b*100)}%"></b></i>`;
  const ui=()=>{const m=CARS[G.car],u=G.upg;gui.innerHTML=`<h3>ГАРАЖ</h3><div class="cn">Монеты: <b>${G.coins}</b></div>${lastTxt?`<div class="lr">${lastTxt}</div>`:''}
    <div class="gs">Машина</div><div class="gr">${Object.entries(CARS).map(([k,x])=>`<button class="gb ${G.car==k?'on':''}" data-a="car:${k}">${x.n}</button>`).join('')}</div>
    <div class="st">Скорость ${bars(1.45+m.sp+.09*(u.engine||0),2.2)}Управление ${bars(m.hd*(1+.1*(u.handling||0)),1.7)}</div>
    <div class="gs">Цвет</div><div class="gr">${COLS.map(x=>`<button class="sw ${G.color==x?'on':''}" style="background:${x}" data-a="color:${x}"></button>`).join('')}</div>
    <div class="gs">Трасса</div><div class="gr">${Object.entries(TRK).map(([k,t])=>`<button class="gb ${G.track==k?'on':''}" data-a="track:${k}">${t.n}</button>`).join('')}</div>
    <div class="gs">Улучшения</div><div class="gr">${Object.entries(UP).map(([k,[n,p]])=>{const l=u[k]||0;return`<button class="gb" data-a="buy:${k}">${n} ${l}/5${l<5?' · '+p*(l+1):''}</button>`}).join('')}</div>
    <div class="gs">Управление</div><div class="gr"><button class="gb ${ctl=='keys'?'on':''}" data-a="ctl:keys">Стрелки / A·D</button><button class="gb ${ctl=='pointer'?'on':''}" data-a="ctl:pointer">Мышь / палец</button></div>
    <button class="go" data-a="go:1">СТАРТ ГОНКИ</button>${online?'':'<small>Войдите, чтобы сохранять гараж и монеты</small>'}`};
  const start=()=>{s=0;lat=0;sv=0;v=.6;got=0;boost=0;cool=0;f0=0;tlat=0;shield=G.upg.armor||0;tr.forEach(o=>world.remove(o.g));tr=[];trees.forEach(t=>place(t,Math.random()*420));coins.forEach(o=>resC(o,40+Math.random()*380));run=true;setMode('race')};
  gui.onclick=async e=>{const a=e.target.dataset.a;if(!a)return;const i=a.indexOf(':'),k=a.slice(0,i),val=a.slice(i+1);
    if(k=='go')return start();
    if(k=='ctl'){ctl=val;try{localStorage.setItem('rcctl',val)}catch(x){}return ui()}
    if(k=='buy'){if(!online)return toast('Войдите в аккаунт, чтобы покупать улучшения','info');try{const d=await api('/api/garage/buy/',{upg:val});if(d.error)toast(d.error,'error');else{G=d;toast('Улучшение куплено','success');ui()}}catch(x){toast('Ошибка сети','error')}return}
    G[k]=val;if(k=='car'||k=='color')setCar();ui();if(online)api('/api/garage/save/',{car:G.car,color:G.color,track:G.track}).catch(()=>{})};
  const nitro=()=>{if(run&&cool<=0){boost=70+25*(G.upg.nitro||0);cool=420-30*(G.upg.nitro||0)}};
  const key=e=>{const d=e.type=='keydown',k=e.key.toLowerCase();if(mode!='race')return;if(k=='arrowleft'||k=='a')L=d;if(k=='arrowright'||k=='d')R=d;if(k=='arrowdown'||k=='s')Br=d;if(d&&e.code=='Space'&&!e.repeat){e.preventDefault();nitro()}if(['arrowleft','arrowright','arrowdown'].includes(k))e.preventDefault()};
  const mv=e=>{if(e.target!==c&&e.target!==hud)return;if(mode!='race'||ctl!='pointer')return;const r=st.getBoundingClientRect(),cx=e.touches?e.touches[0].clientX:e.clientX;tlat=Math.max(-7,Math.min(7,((cx-r.left)/r.width-.5)*16));if(e.cancelable&&e.touches)e.preventDefault()};
  st.onmousemove=mv;st.ontouchstart=st.ontouchmove=mv;nb.onclick=nitro;
  const end=()=>{run=false;score=(s/10|0)+got*10;lastTxt=`Последний заезд: ${score} очков, +${got} монет`;onScore(score);
    if(online&&got)api('/api/garage/coins/',{n:got}).then(d=>{if(d.car){G=d;(d.ach||[]).forEach(a=>toast('Достижение: '+a,'success'));if(mode=='garage')ui()}}).catch(()=>{})};
  xb.onclick=()=>{if(run)end();setMode('garage')};
  const hx=hud.getContext('2d'),txt=(t,x,y,sz,al,col)=>{hx.font=`italic 900 ${sz}px Arial Black,Impact,sans-serif`;hx.textAlign=al;hx.lineWidth=6;hx.strokeStyle='#000a';hx.strokeText(t,x,y);hx.fillStyle=col||'#fff';hx.fillText(t,x,y)};
  const frame=()=>{if(!alive)return;requestAnimationFrame(frame);const now=performance.now(),k=Math.min(2.5,(now-last0)/16.67);last0=now;
    if(mode=='garage'){ga+=.006*k;cam.position.set(Math.sin(ga)*9.5,2.8,Math.cos(ga)*9.5);cam.lookAt(0,.9,0);cam.fov=45;cam.updateProjectionMatrix();R3.render(scene,cam);hx.clearRect(0,0,W,H);return}
    f0+=k;const m=CARS[G.car],hm=m.hd*(1+.1*(G.upg.handling||0));
    if(run){const vm=(1.45+m.sp+.09*(G.upg.engine||0)+(boost>0?.7:0))*(Br?Math.max(.15,.4-.05*(G.upg.brakes||0)):1);v+=(vm-v)*.025*(1+.15*(G.upg.accel||0))*k;
      if(ctl=='keys'){sv+=((R-L)*.3*hm-sv)*.2*k;lat+=sv*k*(.45+v/1.5)}else{const d=(tlat-lat)*.12*k;lat+=d;sv=d}
      lat-=(RX(s+6)-2*RX(s)+RX(s-6))/36*v*v*5*k;
      if(Math.abs(lat)>6.8)v*=1-.015*k;if(Math.abs(lat)>7.4){lat=Math.sign(lat)*7.4;v*=1-.08*k}
      s+=v*k;if(boost>0)boost-=k;if(cool>0)cool-=k;
      coins.forEach(o=>{if(o.z<s-10)resC(o,s+80+Math.random()*350);if(Math.abs(o.z-s)<2.5+(G.upg.magnet||0)&&Math.abs(o.l-lat)<2.4+1.2*(G.upg.magnet||0)){got++;resC(o,s+80+Math.random()*350)}});
      if(tr.length<7&&Math.random()<.03*k)tr.push((()=>{const g=buildCar(['hatch','sport','suv','vaz','vaz'][Math.random()*5|0],COLS[Math.random()*8|0]);world.add(g);return{g,z:s+300+Math.random()*100,l:LN[Math.random()*3|0],v:.5+Math.random()*.5}})());
      tr.forEach(o=>o.z+=o.v*k);tr=tr.filter(o=>{if(o.z<s-20){world.remove(o.g);return false}return true});
      const hit=tr.find(o=>Math.abs(o.z-s)<4.2&&Math.abs(o.l-lat)<2.2);if(hit){if(shield>0){shield--;world.remove(hit.g);tr=tr.filter(o=>o!==hit);v*=.6;toast('Броня спасла вас!','info')}else{end();setTimeout(()=>{if(alive&&mode=='race')setMode('garage')},1500)}}}
    else{v*=Math.pow(.9,k);s+=v*k*.3}
    const k0=Math.floor(s/SEG)-6;segs.forEach((g,i)=>{const kk=k0+i,z=kk*SEG;g.position.set(RX(z),0,-z);g.rotation.y=-Math.atan(SL(z));g.pole.visible=kk%4==0});
    trees.forEach(t=>{if(t.z<s-30)place(t,s+420+Math.random()*30);t.g.position.set(RX(t.z)+t.o,0,-t.z)});
    coins.forEach(o=>{o.g.position.set(RX(o.z)+o.l,1.2,-o.z);o.g.rotation.y+=.06*k});clouds.forEach(q=>{if(q.z<s-60)q.z=s+480;q.sp.position.set(RX(q.z)+q.o,q.y,-q.z)});
    tr.forEach(o=>{o.g.position.set(RX(o.z)+o.l,0,-o.z);o.g.rotation.y=-Math.atan(SL(o.z))});
    me.position.set(RX(s)+lat,0,-s);me.rotation.y=-Math.atan(SL(s))-sv*.5;me.rotation.z=-sv*.06;ground.position.set(RX(s),-.06,-s);
    sun.position.set(RX(s)+lat+30,60,-s+25);sun.target.position.set(RX(s)+lat,0,-s);sun.target.updateMatrixWorld();
    cam.position.set(RX(s-9)+lat*.85+(Math.random()-.5)*.03*v,3.7+(Math.random()-.5)*.03*v,-(s-9));cam.lookAt(RX(s+14)+lat*.7,1.4,-(s+14));cam.fov=62+v*6+(boost>0?8:0);cam.updateProjectionMatrix();R3.render(scene,cam);
    hx.clearRect(0,0,W,H);txt(Math.round(v*100)+' км/ч',W-40,H-40,72,'right');txt('Очки '+(run?(s/10|0)+got*10:score),40,76,40,'left');txt('● '+got,W-40,76,40,'right','#ffd54f');if(shield)txt('Броня ×'+shield,W-40,120,26,'right','#90caf9');
    hx.fillStyle='#0008';hx.fillRect(40,H-70,300,20);hx.fillStyle=cool>0?'#ff7043':'#29b6f6';hx.fillRect(40,H-70,cool>0?300*(1-cool/420):300,20);
    if(f0<240&&run){hx.fillStyle='#fff';hx.font='24px Arial';hx.textAlign='center';hx.fillText(ctl=='keys'?'← → или A/D — руль · S — тормоз · Пробел — нитро':'Ведите мышью или пальцем влево-вправо',W/2,H-30)}
    if(!run){txt('АВАРИЯ!',W/2,H/2,90,'center','#ff5252')}};
  document.addEventListener('keydown',key);document.addEventListener('keyup',key);
  setCar();theme();trees.forEach(t=>place(t,Math.random()*420));coins.forEach(o=>resC(o,40+Math.random()*380));setMode('garage');frame();
  api('/api/garage/').then(d=>{if(d&&d.car){G=d;online=true;setCar();if(mode=='garage')setMode('garage')}}).catch(()=>{});
  return()=>{alive=false;document.removeEventListener('keydown',key);document.removeEventListener('keyup',key);R3.dispose()};
}

function shooter(el,onScore){el.dataset.t='shooter';
  const c=mk('canvas','tall',el);c.width=320;c.height=480;const x=c.getContext('2d');
  let px=160,tx=160,B=[],E=[],P=[],sc=0,life=3,f=0,run=false,L=0,R=0,inv=0;
  const S=[...Array(45)].map(()=>({x:Math.random()*320,y:Math.random()*480,s:.4+Math.random()*2}));
  const key=e=>{const d=e.type=='keydown';if(e.key=='ArrowLeft')L=d;if(e.key=='ArrowRight')R=d};
  const mv=e=>{const r=c.getBoundingClientRect(),cx=e.touches?e.touches[0].clientX:e.clientX;tx=Math.max(20,Math.min(300,(cx-r.left)*320/r.width))};
  c.onmousemove=mv;c.ontouchstart=c.ontouchmove=e=>{e.preventDefault();mv(e)};
  c.onclick=()=>{if(!run){B=[];E=[];P=[];sc=0;life=3;f=0;run=true;inv=60}};
  const boom=(a,b,col)=>{for(let i=0;i<16;i++)P.push({x:a,y:b,vx:Math.random()*6-3,vy:Math.random()*6-3,l:28,c:col})};
  const ship=()=>{x.save();x.translate(px,430);
    x.fillStyle='#ffb300';x.beginPath();x.moveTo(-5,14);x.lineTo(0,24+Math.random()*9);x.lineTo(5,14);x.fill();
    x.fillStyle='#90a4ae';x.beginPath();x.moveTo(0,-24);x.lineTo(18,14);x.lineTo(0,8);x.lineTo(-18,14);x.closePath();x.fill();
    x.fillStyle='#546e7a';x.beginPath();x.moveTo(0,-24);x.lineTo(6,8);x.lineTo(0,8);x.closePath();x.fill();
    x.fillStyle='#4fc3f7';x.beginPath();x.ellipse(0,-4,4,8,0,0,7);x.fill();x.restore()};
  const alien=o=>{x.save();x.translate(o.x,o.y);x.fillStyle=o.t?'#ab47bc':'#66bb6a';x.beginPath();x.ellipse(0,0,17,8,0,0,7);x.fill();
    x.fillStyle=o.t?'#ce93d8':'#a5d6a7';x.beginPath();x.ellipse(0,-4,9,8,0,Math.PI,0);x.fill();
    x.fillStyle='#ffee58';[-9,0,9].forEach(a=>{x.beginPath();x.arc(a,2,2,0,7);x.fill()});x.restore()};
  const tick=()=>{const g=x.createLinearGradient(0,0,0,480);g.addColorStop(0,'#050a1f');g.addColorStop(1,'#14224a');x.fillStyle=g;x.fillRect(0,0,320,480);
    x.fillStyle='#fff';S.forEach(s=>{s.y=(s.y+s.s)%480;x.globalAlpha=.3+s.s/3;x.fillRect(s.x,s.y,s.s>1.5?2:1,s.s>1.5?2:1)});x.globalAlpha=1;
    if(run){f++;if(inv>0)inv--;tx=Math.max(20,Math.min(300,tx+(R-L)*6));px+=(tx-px)*.3;
      if(f%12==0)B.push({x:px,y:405});
      if(f%Math.max(20,60-f/50|0)==0){const t=Math.random()<.3;E.push({x:30+Math.random()*260,y:-20,t,hp:t?3:1,vx:Math.random()*2-1})}
      B.forEach(b=>b.y-=7);B=B.filter(b=>b.y>-10);
      E.forEach(e=>{e.y+=1.2+f/1500;e.x+=e.vx;if(e.x<20||e.x>300)e.vx*=-1});
      B=B.filter(b=>{const e=E.find(e=>Math.abs(e.x-b.x)<20&&Math.abs(e.y-b.y)<14);if(!e)return true;e.hp--;if(e.hp<=0){sc+=e.t?20:10;boom(e.x,e.y,e.t?'#ce93d8':'#a5d6a7')}return false});
      E=E.filter(e=>{if(e.hp<=0)return false;
        if(inv<=0&&Math.abs(e.x-px)<26&&Math.abs(e.y-430)<26){life--;inv=90;boom(px,430,'#ff7043');return false}
        if(e.y>500){life--;return false}return true});
      if(life<=0){run=false;onScore(sc)}}
    x.fillStyle='#ffee58';B.forEach(b=>x.fillRect(b.x-1.5,b.y,3,12));E.forEach(alien);
    P=P.filter(p=>p.l>0);P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.l--;x.globalAlpha=p.l/28;x.fillStyle=p.c;x.fillRect(p.x,p.y,4,4)});x.globalAlpha=1;
    if(!(inv>0&&f%6<3)||!run)ship();
    x.fillStyle='#fff';x.font='bold 18px sans-serif';x.textAlign='left';x.fillText('Очки '+sc,10,26);x.textAlign='right';x.fillText('♥'.repeat(Math.max(0,life)),310,26);
    if(!run){x.textAlign='center';x.font='bold 22px sans-serif';x.fillText(f?'Игра окончена! Очки: '+sc:'Звёздный бой',160,220);x.font='16px sans-serif';x.fillText('Нажмите — старт · огонь автоматический',160,250)}};
  document.addEventListener('keydown',key);document.addEventListener('keyup',key);const t=setInterval(tick,16);
  return()=>{clearInterval(t);document.removeEventListener('keydown',key);document.removeEventListener('keyup',key)};
}

function tetris(el,onScore){
  el.dataset.t='tetris';const c=mk('canvas','tall',el);c.width=240;c.height=480;const x=c.getContext('2d');
  const S=24,CO=10,RO=20,SH=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];
  const CL=['#00bcd4','#fdd835','#ab47bc','#1e88e5','#fb8c00','#43a047','#e53935'];let b,p,sc=0,over=1,acc=0;
  const rot=m=>m[0].map((_,i)=>m.map(r=>r[i]).reverse());
  const hit=(m,ox,oy)=>m.some((r,y)=>r.some((v,i)=>v&&(ox+i<0||ox+i>=CO||oy+y>=RO||(oy+y>=0&&b[oy+y][ox+i]))));
  const spawn=()=>{const i=Math.random()*7|0;p={m:SH[i],c:i+1,x:3,y:0};if(hit(p.m,p.x,p.y)){over=1;onScore(sc)}};
  const lock=()=>{p.m.forEach((r,y)=>r.forEach((v,i)=>{if(v)b[p.y+y][p.x+i]=p.c}));let n=0;b=b.filter(r=>{const f=r.every(v=>v);if(f)n++;return!f});
    while(b.length<RO)b.unshift(Array(CO).fill(0));sc+=[0,100,300,500,800][n];spawn()};
  const mv=d=>{if(!over&&!hit(p.m,p.x+d,p.y))p.x+=d};
  const rt=()=>{if(over)return;const m=rot(p.m);for(const k of[0,-1,1,-2,2])if(!hit(m,p.x+k,p.y)){p.m=m;p.x+=k;return}};
  const down=()=>{if(over)return;if(!hit(p.m,p.x,p.y+1))p.y++;else lock()};
  const hard=()=>{if(over)return;while(!hit(p.m,p.x,p.y+1)){p.y++;sc+=2}lock()};
  const start=()=>{b=Array.from({length:RO},()=>Array(CO).fill(0));sc=0;over=0;acc=0;spawn()};
  const cell=(a,r,col,al)=>{x.globalAlpha=al||1;x.fillStyle=col;x.fillRect(a*S+1,r*S+1,S-2,S-2);if(!al){x.fillStyle='#ffffff45';x.fillRect(a*S+1,r*S+1,S-2,6);x.fillStyle='#0003';x.fillRect(a*S+1,r*S+S-7,S-2,6)}x.globalAlpha=1};
  const key=e=>{const m={ArrowLeft:()=>mv(-1),ArrowRight:()=>mv(1),ArrowUp:rt,ArrowDown:down,' ':hard}[e.key];if(m){e.preventDefault();m()}};
  const tick=()=>{x.fillStyle='#0b1020';x.fillRect(0,0,240,480);x.strokeStyle='#ffffff10';
    for(let i=1;i<CO;i++){x.beginPath();x.moveTo(i*S,0);x.lineTo(i*S,480);x.stroke()}for(let i=1;i<RO;i++){x.beginPath();x.moveTo(0,i*S);x.lineTo(240,i*S);x.stroke()}
    if(!over){acc+=16;if(acc>=Math.max(90,600-sc/4)){acc=0;down()}}
    if(b){b.forEach((r,y)=>r.forEach((v,i)=>v&&cell(i,y,CL[v-1])));
      if(!over){let gy=p.y;while(!hit(p.m,p.x,gy+1))gy++;p.m.forEach((r,y)=>r.forEach((v,i)=>v&&cell(p.x+i,gy+y,CL[p.c-1],.25)));p.m.forEach((r,y)=>r.forEach((v,i)=>v&&cell(p.x+i,p.y+y,CL[p.c-1])))}}
    x.fillStyle='#fff';x.font='bold 16px sans-serif';x.textAlign='left';x.fillText('Очки '+sc,8,20);
    if(over){x.fillStyle='#000a';x.fillRect(0,190,240,100);x.fillStyle='#fff';x.textAlign='center';x.fillText(b?'Игра окончена · '+sc:'Тетрис',120,230);x.font='14px sans-serif';x.fillText('Нажмите — старт',120,256)}};
  c.onclick=()=>{if(over)start()};
  const row=mk('div','rps-row',el);[['◀',()=>mv(-1)],['⟳',rt],['▶',()=>mv(1)],['▼',down],['⤓',hard]].forEach(([l,f])=>{const B=mk('button','',row);B.textContent=l;B.onclick=f});
  document.addEventListener('keydown',key);const t=setInterval(tick,16);
  return()=>{clearInterval(t);document.removeEventListener('keydown',key)};
}

function breakout(el,onScore){
  el.dataset.t='tetris';const c=mk('canvas','tall',el);c.width=320;c.height=480;const x=c.getContext('2d');
  const RC=['#e53935','#fb8c00','#fdd835','#43a047','#1e88e5','#8e24aa'];let pd=160,bl,bk=[],sc=0,life=3,run=false,tr=[],L=0,R=0;
  const build=()=>{bk=[];for(let r=0;r<6;r++)for(let k=0;k<8;k++)bk.push({x:k*40+2,y:50+r*20,c:RC[r],a:1})};
  const serve=()=>{bl={x:160,y:380,vx:(Math.random()<.5?-1:1)*2.4,vy:-4.2};tr=[]};
  const key=e=>{const d=e.type=='keydown';if(e.key=='ArrowLeft')L=d;if(e.key=='ArrowRight')R=d};
  const mv=e=>{const r=c.getBoundingClientRect(),cx=e.touches?e.touches[0].clientX:e.clientX;pd=Math.max(40,Math.min(280,(cx-r.left)*320/r.width))};
  c.onmousemove=mv;c.ontouchstart=c.ontouchmove=e=>{e.preventDefault();mv(e)};c.onclick=()=>{if(!run){build();sc=0;life=3;serve();run=true}};
  const tick=()=>{const g=x.createLinearGradient(0,0,0,480);g.addColorStop(0,'#0b1020');g.addColorStop(1,'#1a2547');x.fillStyle=g;x.fillRect(0,0,320,480);
    if(run){pd=Math.max(40,Math.min(280,pd+(R-L)*7));bl.x+=bl.vx;bl.y+=bl.vy;tr.push({x:bl.x,y:bl.y});if(tr.length>9)tr.shift();
      if(bl.x<6||bl.x>314)bl.vx*=-1;if(bl.y<6)bl.vy*=-1;
      if(bl.vy>0&&bl.y>440&&bl.y<456&&Math.abs(bl.x-pd)<44){bl.vx=(bl.x-pd)/44*4.5;bl.vy=-Math.max(3.5,Math.sqrt(Math.max(0,bl.vx*bl.vx*0+Math.hypot(bl.vx,bl.vy)**2-bl.vx*bl.vx)))}
      const h=bk.find(b=>b.a&&bl.x>b.x&&bl.x<b.x+36&&bl.y>b.y&&bl.y<b.y+16);if(h){h.a=0;sc+=10;bl.vy*=-1.01}
      if(bl.y>490){life--;if(life<=0){run=false;onScore(sc)}else serve()}
      if(!bk.some(b=>b.a)){sc+=100;build();serve()}}
    bk.forEach(b=>{if(!b.a)return;x.fillStyle=b.c;x.beginPath();x.roundRect(b.x,b.y,36,16,4);x.fill();x.fillStyle='#ffffff40';x.fillRect(b.x+3,b.y+2,30,4)});
    if(bl){tr.forEach((t,i)=>{x.globalAlpha=i/20;x.fillStyle='#fff';x.beginPath();x.arc(t.x,t.y,5,0,7);x.fill()});x.globalAlpha=1;
      const rg=x.createRadialGradient(bl.x-2,bl.y-2,1,bl.x,bl.y,7);rg.addColorStop(0,'#fff');rg.addColorStop(1,'#8ecbff');x.fillStyle=rg;x.beginPath();x.arc(bl.x,bl.y,7,0,7);x.fill()}
    const pg=x.createLinearGradient(0,444,0,456);pg.addColorStop(0,'#90caf9');pg.addColorStop(1,'#1565c0');x.fillStyle=pg;x.beginPath();x.roundRect(pd-44,444,88,12,6);x.fill();
    x.fillStyle='#fff';x.font='bold 16px sans-serif';x.textAlign='left';x.fillText('Очки '+sc,10,24);x.textAlign='right';x.fillText('♥'.repeat(Math.max(0,life)),310,24);
    if(!run){x.textAlign='center';x.font='bold 22px sans-serif';x.fillText(bl&&life<=0?'Игра окончена · '+sc:'Арканоид',160,300);x.font='15px sans-serif';x.fillText('Нажмите — старт · мышь или палец',160,326)}};
  document.addEventListener('keydown',key);document.addEventListener('keyup',key);const t=setInterval(tick,16);
  return()=>{clearInterval(t);document.removeEventListener('keydown',key);document.removeEventListener('keyup',key)};
}

function jumper(el,onScore){
  el.dataset.t='doodle';const c=mk('canvas','tall',el);c.width=320;c.height=480;const x=c.getContext('2d');
  let X=160,Y=380,vy=0,P=[],sc=0,run=false,L=0,R=0,tx=160,f=0;
  const np=y=>({x:Math.random()*250,y,w:64,m:Math.random()<.25?(Math.random()<.5?1:-1):0});
  const reset=()=>{P=[{x:128,y:430,w:64,m:0}];for(let y=365;y>-60;y-=65)P.push(np(y));X=tx=160;Y=380;vy=-10;sc=0;run=true};
  const key=e=>{const d=e.type=='keydown';if(e.key=='ArrowLeft')L=d;if(e.key=='ArrowRight')R=d};
  const mv=e=>{const r=c.getBoundingClientRect(),cx=e.touches?e.touches[0].clientX:e.clientX;tx=(cx-r.left)*320/r.width};
  c.onmousemove=mv;c.ontouchstart=c.ontouchmove=e=>{e.preventDefault();mv(e)};c.onclick=()=>{if(!run)reset()};
  const tick=()=>{f++;const g=x.createLinearGradient(0,0,0,480);g.addColorStop(0,'#8fd3ff');g.addColorStop(1,'#e6f6ff');x.fillStyle=g;x.fillRect(0,0,320,480);
    x.fillStyle='#ffffffb0';[[50,90,26],[230,200,30],[120,330,24]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,(b+sc*.15)%520-20,r,0,7);x.arc(a+r,(b+sc*.15)%520-14,r*.8,0,7);x.arc(a-r,(b+sc*.15)%520-12,r*.7,0,7);x.fill()});
    if(run){X+=(tx-X)*.2+(R-L)*5;if(X<-15)X=335;if(X>335)X=-15;vy+=.38;Y+=vy;
      if(vy>0)P.forEach(p=>{if(X>p.x-8&&X<p.x+p.w+8&&Y+18>p.y&&Y+18<p.y+vy+10)vy=-10.5});
      P.forEach(p=>{if(p.m){p.x+=p.m*1.5;if(p.x<0||p.x>256)p.m*=-1}});
      if(Y<200){const d=200-Y;Y=200;P.forEach(p=>p.y+=d);sc+=d}
      P=P.filter(p=>p.y<500);while(P.length<9)P.push(np(Math.min(...P.map(p=>p.y))-60-Math.random()*20));
      if(Y>500){run=false;onScore(sc/10|0)}}
    P.forEach(p=>{x.fillStyle=p.m?'#1e88e5':'#43a047';x.beginPath();x.roundRect(p.x,p.y,p.w,12,6);x.fill();x.fillStyle='#ffffff55';x.fillRect(p.x+6,p.y+2,p.w-12,3)});
    const sq=1+Math.max(-.15,Math.min(.15,-vy*.015));x.save();x.translate(X,Y);x.scale(1/sq,sq);
    x.fillStyle='#7cb342';x.beginPath();x.ellipse(0,0,16,18,0,0,7);x.fill();x.fillStyle='#aed581';x.beginPath();x.ellipse(-3,-5,8,9,0,0,7);x.fill();
    x.fillStyle='#fff';x.beginPath();x.arc(-5,-6,5,0,7);x.arc(6,-6,5,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(-4,-6,2,0,7);x.arc(7,-6,2,0,7);x.fill();
    x.fillStyle='#558b2f';x.fillRect(-9,14,5,6);x.fillRect(5,14,5,6);x.restore();
    x.fillStyle='#0d3b66';x.font='bold 18px sans-serif';x.textAlign='left';x.fillText('Высота '+(sc/10|0),10,26);
    if(!run){x.textAlign='center';x.font='bold 22px sans-serif';x.fillText(f>2&&sc?'Падение! Высота '+(sc/10|0):'Прыгун',160,220);x.font='15px sans-serif';x.fillText('Нажмите — старт · мышь, палец или стрелки',160,246)}};
  document.addEventListener('keydown',key);document.addEventListener('keyup',key);const t=setInterval(tick,16);
  return()=>{clearInterval(t);document.removeEventListener('keydown',key);document.removeEventListener('keyup',key)};
}

function mines(el,onScore){
  const N=9,M=10,info=mk('div','',el),g=mk('div','mines',el),fb=mk('button','ghost',el);let b,open,flag,over,first,t0,fm=false;
  const nb=i=>{const r=i/N|0,c=i%N,o=[];for(let a=-1;a<2;a++)for(let d=-1;d<2;d++){const R=r+a,C=c+d;if((a||d)&&R>=0&&R<N&&C>=0&&C<N)o.push(R*N+C)}return o};
  const place=s=>{let n=0;while(n<M){const i=Math.random()*N*N|0;if(b[i]!=-1&&i!=s&&!nb(s).includes(i)){b[i]=-1;n++}}b.forEach((v,i)=>{if(v!=-1)b[i]=nb(i).filter(j=>b[j]==-1).length})};
  const flood=i=>{if(open[i]||flag[i])return;open[i]=1;if(b[i]==0)nb(i).forEach(flood)};
  const draw=()=>{g.innerHTML='';b.forEach((v,i)=>{const B=mk('button',open[i]?'o':'',g);B.textContent=open[i]?(v==-1?'💣':v||''):flag[i]?'🚩':(over&&v==-1?'💣':'');if(open[i]&&v>0)B.dataset.n=v;
    B.onclick=()=>tap(i,fm);B.oncontextmenu=e=>{e.preventDefault();tap(i,true)}})};
  const tap=(i,fl)=>{if(over)return;if(fl){if(!open[i])flag[i]^=1;draw();return}
    if(open[i]||flag[i])return;if(first){place(i);first=0;t0=Date.now()}
    if(b[i]==-1){over=1;open[i]=1;info.textContent='Бум! Игра окончена';draw();return}
    flood(i);draw();
    if(b.every((v,j)=>v==-1||open[j])){over=1;const s=Math.max(10,600-((Date.now()-t0)/1000*4|0));info.textContent='Победа! Очки: '+s;onScore(s)}};
  const start=()=>{b=Array(N*N).fill(0);open=Array(N*N).fill(0);flag=Array(N*N).fill(0);over=0;first=1;draw();info.textContent='Мин: '+M+' · правая кнопка мыши или режим флажка — пометить'};
  fb.textContent='Режим флажка: выкл';fb.onclick=()=>{fm=!fm;fb.textContent='Режим флажка: '+(fm?'вкл':'выкл')};
  const n=mk('button','',el);n.textContent='Новая игра';n.onclick=start;start();return()=>{};
}

function pong(el,onScore){
  el.dataset.t='tetris';const c=mk('canvas','tall',el);c.width=320;c.height=480;const x=c.getContext('2d');
  let pd=160,ai=160,bl,sc=0,life=3,run=false,L=0,R=0;
  const serve=()=>{bl={x:160,y:240,vx:(Math.random()-.5)*4,vy:(Math.random()<.5?-1:1)*(3.5+sc*.15)}};
  const key=e=>{const d=e.type=='keydown';if(e.key=='ArrowLeft')L=d;if(e.key=='ArrowRight')R=d};
  const mv=e=>{const r=c.getBoundingClientRect(),cx=e.touches?e.touches[0].clientX:e.clientX;pd=Math.max(46,Math.min(274,(cx-r.left)*320/r.width))};
  c.onmousemove=mv;c.ontouchstart=c.ontouchmove=e=>{e.preventDefault();mv(e)};c.onclick=()=>{if(!run){sc=0;life=3;serve();run=true}};
  const pad=(a,b,col)=>{const g=x.createLinearGradient(0,b,0,b+12);g.addColorStop(0,col);g.addColorStop(1,'#222');x.fillStyle=g;x.beginPath();x.roundRect(a-46,b,92,12,6);x.fill()};
  const tick=()=>{x.fillStyle='#0b1a12';x.fillRect(0,0,320,480);x.strokeStyle='#ffffff40';x.setLineDash([10,10]);x.beginPath();x.moveTo(0,240);x.lineTo(320,240);x.stroke();x.setLineDash([]);
    x.strokeStyle='#ffffff25';x.strokeRect(4,4,312,472);
    if(run){pd=Math.max(46,Math.min(274,pd+(R-L)*8));const sp=2.6+sc*.12;ai+=Math.max(-sp,Math.min(sp,bl.x-ai));bl.x+=bl.vx;bl.y+=bl.vy;if(bl.x<8||bl.x>312)bl.vx*=-1;
      if(bl.vy>0&&bl.y>440&&bl.y<456&&Math.abs(bl.x-pd)<50){bl.vy=-Math.abs(bl.vy)*1.03;bl.vx=(bl.x-pd)/50*5}
      if(bl.vy<0&&bl.y<40&&bl.y>24&&Math.abs(bl.x-ai)<50){bl.vy=Math.abs(bl.vy)*1.03;bl.vx=(bl.x-ai)/50*5}
      if(bl.y<0){sc++;serve()}if(bl.y>480){life--;if(life<=0){run=false;onScore(sc)}else serve()}}
    pad(ai,20,'#ef5350');pad(pd,448,'#42a5f5');
    if(bl){x.shadowColor='#fff';x.shadowBlur=12;x.fillStyle='#fff';x.beginPath();x.arc(bl.x,bl.y,7,0,7);x.fill();x.shadowBlur=0}
    x.fillStyle='#fff';x.font='bold 16px sans-serif';x.textAlign='left';x.fillText('Очки '+sc,12,240);x.textAlign='right';x.fillText('♥'.repeat(Math.max(0,life)),308,240);
    if(!run){x.textAlign='center';x.font='bold 22px sans-serif';x.fillText(bl&&life<=0?'Игра окончена · '+sc:'Пинг-понг',160,150);x.font='15px sans-serif';x.fillText('Нажмите — старт · мышь или палец',160,176)}};
  document.addEventListener('keydown',key);document.addEventListener('keyup',key);const t=setInterval(tick,16);
  return()=>{clearInterval(t);document.removeEventListener('keydown',key);document.removeEventListener('keyup',key)};
}

function quest(el,onScore){
  el.dataset.t='castle';const b=mk('div','story',el);
  b.innerHTML='<h3>Остров сокровищ · 3D-приключение</h3><p>Порт, корабль, шторм, джунгли, пещера и сундук с золотом: всё нарисовано в 3D. Играйте один или позовите друзей — решения принимаются голосованием. За прохождение каждый игрок получает монеты.</p>';
  const B=mk('button','',b);B.textContent='Начать приключение';
  B.onclick=async()=>{try{const r=await fetch('/story/new/',{method:'POST',headers:{'X-CSRFToken':(document.cookie.match(/csrftoken=([^;]+)/)||[])[1]||''}});location.href=r.url}catch(e){toast('Нет связи с сервером','error')}};
  return()=>{};
}

function zombies(el,onScore){
  el.dataset.t='zombies';const c=mk('canvas','wide',el);c.width=640;c.height=360;const x=c.getContext('2d');
  let Z=[],P=[],sc=0,hp=5,f=0,run=false,fl=0;
  const shoot=e=>{if(!run){Z=[];P=[];sc=0;hp=5;f=0;run=true;return}const r=c.getBoundingClientRect(),t=e.changedTouches?e.changedTouches[0]:e,
      cx=(t.clientX-r.left)*640/r.width,cy=(t.clientY-r.top)*360/r.height;fl=3;
    const z=Z.filter(z=>Math.abs(cx-z.x)<18&&cy>z.y-50&&cy<z.y+4).sort((a,b)=>b.y-a.y)[0];
    if(z){const hs=cy<z.y-34;z.hp-=hs?2:1;for(let i=0;i<8;i++)P.push({x:cx,y:cy,vx:Math.random()*4-2,vy:-Math.random()*3,l:22});if(z.hp<=0){sc+=hs?20:10;z.dead=1}}};
  c.onclick=shoot;
  const zomb=z=>{const b=Math.sin(f/8+z.p)*2;x.fillStyle='#2b2f2a';x.fillRect(z.x-6,z.y-14,5,14+b);x.fillRect(z.x+1,z.y-14,5,14-b);x.fillStyle='#46513f';x.fillRect(z.x-8,z.y-32,16,20);x.fillRect(z.x-26,z.y-30,18,5);
    x.fillStyle='#7aa36b';x.beginPath();x.arc(z.x,z.y-40,8,0,7);x.fill();x.fillStyle='#e53935';x.fillRect(z.x-5,z.y-42,3,3);x.fillRect(z.x+1,z.y-42,3,3)};
  const tick=()=>{f++;const g=x.createLinearGradient(0,0,0,360);g.addColorStop(0,'#05070f');g.addColorStop(.6,'#1b2540');g.addColorStop(1,'#22301f');x.fillStyle=g;x.fillRect(0,0,640,360);
    x.fillStyle='#e8efff';x.beginPath();x.arc(520,60,26,0,7);x.fill();x.fillStyle='#0003';x.beginPath();x.arc(512,54,6,0,7);x.fill();
    x.fillStyle='#16210f';x.fillRect(0,250,640,110);x.fillStyle='#3b2a20';x.fillRect(20,160,110,110);x.fillStyle='#5a2d1e';x.beginPath();x.moveTo(8,160);x.lineTo(75,108);x.lineTo(142,160);x.fill();
    x.fillStyle=hp>2?'#ffd27a':'#6a4a22';x.fillRect(45,190,28,28);x.fillRect(90,190,28,28);
    if(run){if(f%Math.max(35,110-f/25|0)==0)Z.push({x:660,y:270+Math.random()*70,hp:Math.random()<.2?3:2,p:Math.random()*6,s:.5+Math.random()*.5+f/6000});
      Z.forEach(z=>z.x-=z.s);Z=Z.filter(z=>{if(z.dead)return false;if(z.x<135){hp--;return false}return true});if(hp<=0){run=false;onScore(sc)}}
    [...Z].sort((a,b)=>a.y-b.y).forEach(zomb);P=P.filter(p=>p.l>0);P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.3;p.l--;x.fillStyle='#8b0000';x.fillRect(p.x,p.y,3,3)});
    if(fl>0){fl--;x.fillStyle='#ffffff30';x.fillRect(0,0,640,360)}
    x.fillStyle='#fff';x.font='bold 18px sans-serif';x.textAlign='left';x.fillText('Очки '+sc+'   Дом '+'♥'.repeat(Math.max(0,hp)),14,26);
    if(!run){x.fillStyle='#000b';x.fillRect(120,110,400,130);x.fillStyle='#fff';x.textAlign='center';x.font='bold 24px sans-serif';x.fillText(f>1&&sc+hp<5+sc&&hp<=0?'Дом захвачен! Очки: '+sc:'Ночная оборона',320,150);
      x.font='15px sans-serif';x.fillText('Зомби идут к дому. Стреляйте мышью или тапом,',320,182);x.fillText('в голову — двойной урон. Нажмите — старт.',320,206)}};
  const t=setInterval(tick,16);return()=>clearInterval(t);
}

function fishing(el,onScore){
  el.dataset.t='fishing';const c=mk('canvas','wide',el);c.width=640;c.height=360;const x=c.getContext('2d');
  let fy=.5,fv=0,hy=.5,hv=0,pr=.3,hold=0,sc=0,left=0,run=false,f=0,w=2,msg='';
  const nf=()=>{w=1+Math.random()*4;pr=.3;fv=0};
  const on=e=>{if(e.type=='keydown'&&e.code!='Space')return;e.preventDefault();if(!run){sc=0;left=2700;nf();run=true;msg=''}hold=1};
  const off=e=>{hold=0};
  c.onmousedown=on;c.onmouseup=off;c.ontouchstart=on;c.ontouchend=off;document.addEventListener('keydown',on);document.addEventListener('keyup',off);
  const tick=()=>{f++;
    if(run){left--;fv+=(Math.random()-.5)*.014;fv*=.97;fy+=fv;if(fy<.08||fy>.92){fv*=-1;fy=Math.max(.08,Math.min(.92,fy))}
      hv+=hold?-.0042:.0032;hv*=.97;hy+=hv;if(hy<.12){hy=.12;hv=0}if(hy>.88){hy=.88;hv=0}
      const ok=Math.abs(hy-fy)<.13;pr+=ok?.0045:-.003;
      if(pr>=1){sc+=Math.round(w*10);msg='Поймали рыбу на '+w.toFixed(1)+' кг!';nf()}if(pr<=0){msg='Рыба сорвалась…';nf()}
      if(left<=0){run=false;onScore(sc)}}
    const g=x.createLinearGradient(0,0,0,360);g.addColorStop(0,'#ffb26b');g.addColorStop(.38,'#ffe3b3');g.addColorStop(.39,'#2f7fa8');g.addColorStop(1,'#0b2f4a');x.fillStyle=g;x.fillRect(0,0,640,360);
    x.fillStyle='#fff3c4';x.beginPath();x.arc(150,110,34,0,7);x.fill();x.fillStyle='#0004';x.beginPath();x.moveTo(0,137);x.lineTo(90,100);x.lineTo(210,137);x.lineTo(330,92);x.lineTo(460,137);x.lineTo(640,110);x.lineTo(640,140);x.lineTo(0,140);x.fill();
    x.strokeStyle='#ffffff30';for(let i=0;i<14;i++){const y=150+i*15;x.beginPath();x.moveTo(0,y+Math.sin(f/20+i)*3);x.lineTo(500,y+Math.sin(f/20+i+2)*3);x.stroke()}
    const fx=250+Math.sin(f/30)*20,fyy=170+fy*150;x.fillStyle='#ffcc80';x.beginPath();x.ellipse(fx,fyy,26,11,0,0,7);x.fill();x.beginPath();x.moveTo(fx+22,fyy);x.lineTo(fx+40,fyy-10);x.lineTo(fx+40,fyy+10);x.fill();x.fillStyle='#000';x.fillRect(fx-16,fyy-3,3,3);
    x.fillStyle='#0008';x.fillRect(560,30,34,300);x.fillStyle='#43a047aa';x.fillRect(560,30+hy*300-40,34,80);x.fillStyle='#ffcc80';x.beginPath();x.arc(577,30+fy*300,8,0,7);x.fill();
    x.fillStyle='#0008';x.fillRect(510,30,10,300);x.fillStyle='#ffc107';x.fillRect(510,330-pr*300,10,pr*300);
    x.fillStyle='#fff';x.font='bold 18px sans-serif';x.textAlign='left';x.fillText('Улов '+sc+'   Время '+Math.ceil(left/60)+' с',14,26);x.font='16px sans-serif';x.fillText(msg,14,52);
    if(!run){x.fillStyle='#000b';x.fillRect(110,110,380,120);x.fillStyle='#fff';x.textAlign='center';x.font='bold 24px sans-serif';x.fillText(sc?'Рыбалка окончена! Улов: '+sc:'Рыбалка на рассвете',300,150);
      x.font='15px sans-serif';x.fillText('Держите кнопку/палец/пробел, чтобы поднимать крючок,',300,182);x.fillText('и не теряйте рыбу из зелёной зоны. Нажмите — старт.',300,206)}};
  const t=setInterval(tick,16);
  return()=>{clearInterval(t);document.removeEventListener('keydown',on);document.removeEventListener('keyup',off)};
}

function lockpick(el,onScore){
  el.dataset.t='lock';const c=mk('canvas','',el);c.width=c.height=360;const x=c.getContext('2d');
  let a=0,dir=1,sp=.03,tg=2,w=.7,lv=0,life=3,run=false,shake=0;
  const nl=()=>{tg=Math.random()*6.28;w=Math.max(.2,.7-lv*.05);sp=.03+lv*.004;dir*=-1};
  const press=e=>{if(e.type=='keydown'&&e.code!='Space')return;if(e.cancelable)e.preventDefault();
    if(!run){lv=0;life=3;nl();run=true;return}
    if(Math.abs(Math.atan2(Math.sin(a-tg),Math.cos(a-tg)))<w/2){lv++;nl()}else{life--;shake=12;if(life<=0){run=false;onScore(lv)}}};
  c.onclick=press;document.addEventListener('keydown',press);
  const tick=()=>{if(run)a+=sp*dir;x.fillStyle='#07090f';x.fillRect(0,0,360,360);
    x.save();x.translate(180+(shake>0?(Math.random()-.5)*8:0),190);if(shake>0)shake--;
    x.strokeStyle='#8a929c';x.lineWidth=16;x.beginPath();x.arc(0,-100,60,Math.PI,0);x.stroke();
    const g=x.createRadialGradient(-40,-50,10,0,0,150);g.addColorStop(0,'#c9ced6');g.addColorStop(.6,'#7b828c');g.addColorStop(1,'#343a42');x.fillStyle=g;x.beginPath();x.arc(0,0,140,0,7);x.fill();
    x.strokeStyle='#1a1d22';x.lineWidth=3;x.beginPath();x.arc(0,0,128,0,7);x.stroke();
    for(let i=0;i<36;i++){const t=i/36*6.28;x.strokeStyle='#222';x.lineWidth=i%3?1:3;x.beginPath();x.moveTo(Math.cos(t)*108,Math.sin(t)*108);x.lineTo(Math.cos(t)*118,Math.sin(t)*118);x.stroke()}
    if(run){x.strokeStyle='#43a047aa';x.lineWidth=14;x.beginPath();x.arc(0,0,100,tg-w/2,tg+w/2);x.stroke()}
    x.fillStyle='#111';x.beginPath();x.arc(0,0,22,0,7);x.fill();x.fillRect(-5,10,10,30);
    x.rotate(a);x.strokeStyle='#e53935';x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(0,0);x.lineTo(112,0);x.stroke();x.restore();
    x.fillStyle='#fff';x.font='bold 18px sans-serif';x.textAlign='left';x.fillText('Замок '+(lv+1)+'/10',12,26);x.textAlign='right';x.fillText('Попытки '+'♥'.repeat(Math.max(0,life)),348,26);
    if(lv>=10){run=false;onScore(lv+5)}
    if(!run){x.fillStyle='#000b';x.fillRect(30,140,300,90);x.fillStyle='#fff';x.textAlign='center';x.font='bold 20px sans-serif';x.fillText(lv>=10?'Сейф вскрыт!':lv?'Сигнализация! Замков: '+lv:'Ограбление',180,175);x.font='14px sans-serif';x.fillText('Нажмите, когда стрелка в зелёной зоне',180,200)}};
  const t=setInterval(tick,16);return()=>{clearInterval(t);document.removeEventListener('keydown',press)};
}

function courier(el,onScore){
  el.dataset.t='courier';const c=mk('canvas','tall',el);c.width=320;c.height=480;const x=c.getContext('2d');
  const S=[...Array(60)].map(()=>({x:Math.random()*320,y:Math.random()*480,s:.5+Math.random()*3}));
  let ln=1,px=160,O=[],C=[],sc=0,hp=3,fuel=100,f=0,run=false,inv=0;
  const mv=d=>{if(run)ln=Math.max(0,Math.min(2,ln+d))};
  const key=e=>{if(e.key=='ArrowLeft'||e.key=='a')mv(-1);else if(e.key=='ArrowRight'||e.key=='d')mv(1);else if(e.code=='Space'&&!run){e.preventDefault();reset()}};
  const reset=()=>{O=[];C=[];sc=0;hp=3;fuel=100;f=0;ln=1;run=true;inv=60};
  let sx=0;c.ontouchstart=e=>{e.preventDefault();sx=e.touches[0].clientX};c.ontouchend=e=>{const d=e.changedTouches[0].clientX-sx;if(!run)reset();else if(Math.abs(d)>20)mv(d<0?-1:1)};
  c.onclick=e=>{if(!run)return reset();const r=c.getBoundingClientRect();mv((e.clientX-r.left)/r.width<.5?-1:1)};
  const LX=[60,160,260];
  const rock=(a,b,r,ph)=>{const g=x.createRadialGradient(a-r*.3,b-r*.3,r*.1,a,b,r);g.addColorStop(0,'#b8a89a');g.addColorStop(1,'#4a3f38');x.fillStyle=g;x.beginPath();for(let i=0;i<9;i++){const t=i/9*6.28+ph,q=r*(.85+.15*Math.sin(i*3+ph*2));x.lineTo(a+Math.cos(t)*q,b+Math.sin(t)*q)}x.fill();
    x.fillStyle='#0004';x.beginPath();x.arc(a+r*.25,b+r*.1,r*.2,0,7);x.arc(a-r*.3,b+r*.35,r*.14,0,7);x.fill()};
  const tick=()=>{const g=x.createLinearGradient(0,0,0,480);g.addColorStop(0,'#03040c');g.addColorStop(1,'#16113a');x.fillStyle=g;x.fillRect(0,0,320,480);
    x.fillStyle='#fff';S.forEach(s=>{s.y=(s.y+s.s*(run?1+f/1500:.5))%480;x.globalAlpha=.3+s.s/4;x.fillRect(s.x,s.y,s.s>2?2:1,s.s>2?3:1)});x.globalAlpha=1;
    if(run){f++;inv>0&&inv--;px+=(LX[ln]-px)*.25;fuel-=.035;
      if(f%Math.max(22,55-f/60|0)==0)O.push({l:Math.random()*3|0,y:-30,ph:Math.random()*6});if(f%70==0)C.push({l:Math.random()*3|0,y:-20});
      const v=3+f/500;O.forEach(o=>{o.y+=v;o.ph+=.02});C.forEach(o=>o.y+=v);
      O=O.filter(o=>{if(!inv&&o.y>400&&o.y<450&&o.l==ln&&Math.abs(LX[o.l]-px)<30){hp--;inv=70;return false}return o.y<520});
      C=C.filter(o=>{if(o.y>400&&o.y<450&&o.l==ln){sc+=10;fuel=Math.min(100,fuel+18);return false}return o.y<520});sc+=.05;
      if(hp<=0||fuel<=0){run=false;onScore(sc|0)}}
    O.forEach(o=>rock(LX[o.l],o.y,26,o.ph));C.forEach(o=>{x.fillStyle='#4dd0e1';x.shadowColor='#4dd0e1';x.shadowBlur=14;x.beginPath();x.arc(LX[o.l],o.y,9,0,7);x.fill();x.shadowBlur=0});
    if(!(inv>0&&f%6<3)||!run){x.save();x.translate(px,425);x.fillStyle='#ffb300';x.beginPath();x.moveTo(-6,16);x.lineTo(0,28+Math.random()*10);x.lineTo(6,16);x.fill();
      x.fillStyle='#cfd8dc';x.beginPath();x.moveTo(0,-26);x.lineTo(20,18);x.lineTo(0,10);x.lineTo(-20,18);x.fill();x.fillStyle='#78909c';x.beginPath();x.moveTo(0,-26);x.lineTo(6,10);x.lineTo(0,10);x.fill();x.fillStyle='#4fc3f7';x.beginPath();x.ellipse(0,-4,4,9,0,0,7);x.fill();x.restore()}
    x.fillStyle='#fff';x.font='bold 16px sans-serif';x.textAlign='left';x.fillText('Очки '+(sc|0),10,24);x.textAlign='right';x.fillText('♥'.repeat(Math.max(0,hp)),310,24);
    x.fillStyle='#0008';x.fillRect(10,34,100,8);x.fillStyle=fuel>30?'#4dd0e1':'#ef5350';x.fillRect(10,34,Math.max(0,fuel),8);
    if(!run){x.fillStyle='#000b';x.fillRect(30,170,260,120);x.fillStyle='#fff';x.textAlign='center';x.font='bold 21px sans-serif';x.fillText(f>1?'Рейс прерван · '+(sc|0):'Космический курьер',160,205);x.font='14px sans-serif';x.fillText('Доставьте груз на станцию «Орион»:',160,232);x.fillText('уворачивайтесь, собирайте топливо.',160,252);x.fillText('Нажмите — старт · тап/стрелки — смена полосы',160,276)}};
  document.addEventListener('keydown',key);const t=setInterval(tick,16);return()=>{clearInterval(t);document.removeEventListener('keydown',key)};
}

function g3(el,onScore,o){
  el.dataset.t='racing3d';el.style.setProperty('--ui','0px');
  if(!window.THREE){el.textContent='3D-движок не загрузился. Проверьте интернет и обновите страницу.';return()=>{}}
  const T=THREE,W=960,H=540,st=mk('div','stage',el),cv=mk('canvas','',st),hud=mk('canvas','hud',st);cv.width=hud.width=W;cv.height=H;hud.height=H;st.style.touchAction='none';
  const R=new T.WebGLRenderer({canvas:cv,antialias:true});R.setSize(W,H,false);R.shadowMap.enabled=true;R.toneMapping=T.ACESFilmicToneMapping;R.outputEncoding=T.sRGBEncoding;
  const scene=new T.Scene(),cam=new T.PerspectiveCamera(60,W/H,.1,300),sun=new T.DirectionalLight(0xffffff,1.05);
  scene.add(new T.HemisphereLight(0xffffff,0x445566,.85),sun,sun.target);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:120});sun.shadow.camera.updateProjectionMatrix();
  const c={T,scene,cam,k:{},kp:{},px:0,py:0,sx:0,sy:0,cx:0,cy:0,kx:0,ky:0,ptr:0,tap:false,score:0,state:'idle',t:0,msg:'',extra:'',root:null};
  c.m=(g,col,x,y,z,e)=>{const q=new T.Mesh(g,new T.MeshStandardMaterial(Object.assign({color:col,roughness:.6,metalness:.1},e||{})));q.position.set(x||0,y||0,z||0);q.castShadow=q.receiveShadow=true;c.root.add(q);return q};
  c.box=(w,h,d,col,x,y,z,e)=>c.m(new T.BoxGeometry(w,h,d),col,x,y,z,e);c.sph=(r,col,x,y,z,e)=>c.m(new T.SphereGeometry(r,16,12),col,x,y,z,e);c.cyl=(r,h,col,x,y,z,e)=>c.m(new T.CylinderGeometry(r,r,h,16),col,x,y,z,e);
  c.ax=()=>(c.k.arrowright||c.k.d?1:0)-(c.k.arrowleft||c.k.a?1:0);c.ay=()=>(c.k.arrowup||c.k.w?1:0)-(c.k.arrowdown||c.k.s?1:0);
  const rc=new T.Raycaster(),v2=new T.Vector2();c.pick=l=>{v2.set(c.px,c.py);rc.setFromCamera(v2,cam);return rc.intersectObjects(l,true)};
  c.over=v=>{if(c.state!='play')return;const sc=v==null?c.score|0:v;c.state='over';c.msg='Конец! Очки: '+sc;onScore(sc)};
  const start=()=>{if(c.root)scene.remove(c.root);c.root=new T.Group();scene.add(c.root);c.score=0;c.t=0;c.msg='';c.extra='';c.kx=c.ky=0;c.tap=false;c.state='play';scene.background=new T.Color(o.bg);scene.fog=new T.Fog(o.bg,o.fog||40,(o.fog||40)*3);cam.position.set(...o.cam);cam.lookAt(...o.look);o.setup(c)};
  const press=()=>{if(c.state=='play')c.tap=true;else start()};
  const setp=e=>{c.ptr=1;const r=st.getBoundingClientRect();c.px=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));c.py=Math.max(-1,Math.min(1,-((e.clientY-r.top)/r.height-.5)*2))};
  st.onpointermove=setp;st.onpointerdown=e=>{setp(e);press()};
  const key=e=>{if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;const d=e.type=='keydown',k=e.key.toLowerCase();c.k[k]=d;
    if(d){if(!e.repeat)c.kp[k]=true;if(['arrowleft','arrowright','arrowup','arrowdown','a','d','w','s'].includes(k))c.ptr=0;if((k==' '||k=='enter')&&!e.repeat)press()}
    if([' ','arrowleft','arrowright','arrowup','arrowdown'].includes(k))e.preventDefault()};
  const hx=hud.getContext('2d'),wrap=(t,n)=>{const out=[];let l='';t.split(' ').forEach(w=>{if((l+w).length>n){out.push(l);l=''}l+=w+' '});out.push(l);return out};
  const draw=()=>{hx.clearRect(0,0,W,H);hx.font='bold 34px Arial';hx.textAlign='left';hx.lineWidth=5;hx.strokeStyle='#000a';hx.fillStyle='#fff';const t='Очки '+(c.score|0)+(c.extra?'   '+c.extra:'');hx.strokeText(t,20,48);hx.fillText(t,20,48);
    if(o.hud&&c.state=='play')o.hud(hx,c,W,H);
    if(c.state!='play'){hx.fillStyle='#000b';hx.fillRect(W/2-380,H/2-130,760,250);hx.fillStyle='#fff';hx.textAlign='center';hx.font='bold 44px Arial';hx.fillText(c.state=='over'?c.msg:o.title,W/2,H/2-60);
      hx.font='22px Arial';wrap(o.help,58).forEach((l,i)=>hx.fillText(l,W/2,H/2-15+i*28));hx.fillStyle='#ffd54f';hx.fillText('Нажмите или Пробел — '+(c.state=='over'?'ещё раз':'старт'),W/2,H/2+95)}};
  let alive=true,last=performance.now();
  const loop=()=>{if(!alive)return;requestAnimationFrame(loop);const n=performance.now(),dt=Math.min(.05,(n-last)/1000);last=n;
    if(c.state=='play'){c.t+=dt;c.sx=c.ptr?c.px:c.ax();c.sy=c.ptr?c.py:c.ay();c.kx=Math.max(-1,Math.min(1,c.kx+c.ax()*2.4*dt));c.ky=Math.max(-1,Math.min(1,c.ky+c.ay()*2.4*dt));c.cx=c.ptr?c.px:c.kx;c.cy=c.ptr?c.py:c.ky;
      try{o.tick(c,dt)}catch(e){console.error(e)}c.tap=false;c.kp={}}
    sun.target.position.set(cam.position.x,0,cam.position.z-10);sun.position.set(cam.position.x+12,26,cam.position.z+2);sun.target.updateMatrixWorld();R.render(scene,cam);draw()};
  document.addEventListener('keydown',key);document.addEventListener('keyup',key);start();c.state='idle';loop();
  return()=>{alive=false;document.removeEventListener('keydown',key);document.removeEventListener('keyup',key);R.dispose()};
}

const flight=(el,s)=>g3(el,s,{title:'Звёздный полёт',help:'Мышь, палец или стрелки — штурвал. Уворачивайтесь от астероидов и собирайте кристаллы.',bg:0x02030a,cam:[0,2.2,9],look:[0,0,-20],
 setup(c){const T=c.T;c.sh=new T.Group();c.root.add(c.sh);const b=new T.Mesh(new T.ConeGeometry(.45,2.2,10),new T.MeshStandardMaterial({color:0xaab8c8,metalness:.8,roughness:.3}));b.rotation.x=-Math.PI/2;c.sh.add(b);
  const w=new T.Mesh(new T.BoxGeometry(2.6,.08,.9),new T.MeshStandardMaterial({color:0x4f7bb8,metalness:.6}));w.position.z=.4;c.sh.add(w);const f=new T.Mesh(new T.ConeGeometry(.25,1,8),new T.MeshBasicMaterial({color:0xffb347}));f.rotation.x=Math.PI/2;f.position.z=1.5;c.sh.add(f);
  c.ob=[];c.st=[...Array(140)].map(()=>c.sph(.05,0xffffff,(Math.random()-.5)*90,(Math.random()-.5)*60,-Math.random()*160,{emissive:0xffffff}))},
 tick(c,dt){const T=c.T,sp=16+c.t*.6,P=c.sh.position;P.x+=(c.cx*7-P.x)*4*dt;P.y+=(c.cy*4-P.y)*4*dt;c.sh.rotation.z=-(c.cx*7-P.x)*.12;
  c.st.forEach(q=>{q.position.z+=sp*dt;if(q.position.z>12)q.position.z=-160});
  if(Math.random()<dt*(1.5+c.t*.03)){const r=.7+Math.random()*1.1,a=c.m(new T.DodecahedronGeometry(r),0x6e6a66,(Math.random()-.5)*17,(Math.random()-.5)*9,-110,{roughness:1});a.userData={r};c.ob.push(a)}
  if(Math.random()<dt*.9){const q=c.m(new T.OctahedronGeometry(.5),0x4df0ff,(Math.random()-.5)*15,(Math.random()-.5)*8,-110,{emissive:0x18b4d4});q.userData={cr:1};c.ob.push(q)}
  c.ob=c.ob.filter(o=>{o.position.z+=sp*dt;o.rotation.x+=dt;o.rotation.y+=dt*.8;const d=o.position.distanceTo(P),u=o.userData;
   if(u.cr&&d<1.5){c.score+=10;c.root.remove(o);return false}if(!u.cr&&d<u.r+.7)c.over();if(o.position.z>12){c.root.remove(o);return false}return true});c.score+=dt*5}});

const ball=(el,s)=>g3(el,s,{title:'Катящийся шар',help:'Руль — мышь, палец или стрелки. Клик или Пробел — прыжок. Не падайте в пропасти и объезжайте красные кубы.',bg:0x101a33,fog:30,cam:[0,4,8],look:[0,.5,-8],
 setup(c){c.sg=new Map();c.d=0;c.by=.6;c.vy=0;c.bx=0;c.ball=c.sph(.6,0xff7043,0,.6,0,{metalness:.6,roughness:.3});
  c.gen=i=>{if(c.sg.has(i))return;const gap=i>3&&Math.random()<.18,pr=[];if(!gap){pr.push(c.box(8,.6,6,i%2?0x3d4a63:0x4b5b80,0,-.3,-i*6));if(i>2&&Math.random()<.5){const x=(Math.random()-.5)*6;pr.push(c.box(1.4,1.4,1.4,0xe53935,x,.7,-i*6-1));pr.x=x}}c.sg.set(i,{gap,pr})};for(let i=0;i<14;i++)c.gen(i)},
 tick(c,dt){const sp=10+Math.min(10,c.t*.25);c.d+=sp*dt;c.bx+=(c.cx*3.3-c.bx)*6*dt;c.vy-=28*dt;c.by+=c.vy*dt;const i=Math.floor((c.d+3)/6);for(let k=i;k<i+14;k++)c.gen(k);
  const sg=c.sg.get(i),gr=sg&&!sg.gap;if(gr&&c.by<=.6&&c.by>.1){c.by=.6;c.vy=c.tap?11:0}
  if(sg&&sg.pr.length>1&&Math.abs(-c.d+i*6+1)<1.2&&Math.abs(c.bx-sg.pr.x)<1.3&&c.by<1.6)c.over();
  if(c.by<-7)c.over();c.ball.position.set(c.bx,c.by,-c.d);c.ball.rotation.x-=sp*dt/.6;
  c.sg.forEach((v,k)=>{if(k<i-3){v.pr.forEach(m=>c.root.remove(m));c.sg.delete(k)}});c.cam.position.set(c.bx*.5,4,-c.d+8);c.cam.lookAt(c.bx*.3,.5,-c.d-8);c.score=c.d/3}});

const stack=(el,s)=>g3(el,s,{title:'Башня',help:'Блок скользит туда-сюда. Нажмите, чтобы уронить его на башню: всё, что выступает, отрезается. Точное попадание сохраняет размер.',bg:0x1a2238,fog:60,cam:[9,9,9],look:[0,0,0],
 setup(c){c.lv=1;c.pr={x:0,z:0,w:4,d:4};c.col=l=>new c.T.Color().setHSL(l*.06%1,.6,.55).getHex();c.box(4,1,4,0x3d4a63,0,-.5,0);c.mv=c.box(4,1,4,c.col(1),0,.5,0);c.p=-5.5;c.dr=1;c.axis='x';c.box(80,.2,80,0x121a2e,0,-1,0)},
 tick(c,dt){const x=c.axis=='x',sp=3.5+c.lv*.25;c.p+=c.dr*sp*dt;if(Math.abs(c.p)>5.5)c.dr*=-1;c.mv.position[x?'x':'z']=c.p;
  if(c.tap){const pr=c.pr,dl=x?c.p-pr.x:c.p-pr.z,sz=x?pr.w:pr.d,ov=sz-Math.abs(dl);if(ov<=0)return c.over(c.lv-1);
   const perfect=Math.abs(dl)<.2,nl=perfect?sz:ov,np=(x?pr.x:pr.z)+(perfect?0:dl/2);if(x){pr.x=np;pr.w=nl}else{pr.z=np;pr.d=nl}
   c.mv.scale.set(pr.w/4,1,pr.d/4);c.mv.position.set(pr.x,c.lv-.5,pr.z);c.lv++;c.score=c.lv-1+(perfect?.5:0);c.axis=x?'z':'x';c.p=-5.5;
   c.mv=c.box(4,1,4,c.col(c.lv),pr.x,c.lv-.5,pr.z);c.mv.scale.set(pr.w/4,1,pr.d/4)}
  c.cam.position.y+=((c.lv+8)-c.cam.position.y)*dt*3;c.cam.lookAt(0,c.lv-1.5,0)}});

const gallery=(el,s)=>g3(el,s,{title:'Тир',help:'Наведите прицел мышью или пальцем и нажмите, чтобы выстрелить. За 45 секунд поразите как можно больше мишеней.',bg:0x8fb4d9,fog:80,cam:[0,2.2,7],look:[0,1.6,-10],
 setup(c){c.tg=[];c.nx=0;c.box(80,.2,60,0x4c7a3d,0,-.1,-20);c.box(30,.3,.4,0x6b4a2a,0,2.4,-14);for(let i=0;i<9;i++)c.box(.3,2.4,.3,0x6b4a2a,-12+i*3,1.2,-14);for(let i=0;i<7;i++)c.cyl(.5,3,0x2e7d32,-18+i*6,1.5,-26)},
 tick(c,dt){c.extra='Время '+Math.max(0,45-c.t|0);if(c.t>45)return c.over();c.nx-=dt;
  if(c.nx<=0){c.nx=.55;const g=new c.T.Group(),x=(Math.random()-.5)*20,y=1+Math.random()*3.2;[[.9,0xe53935],[.62,0xffffff],[.34,0xe53935]].forEach(([r,col],i)=>{const m=c.m(new c.T.CylinderGeometry(r,r,.1+i*.02,24),col,0,0,i*.02);m.rotation.x=Math.PI/2;g.add(m);m.userData.t=g});
   g.position.set(x,y,-10-Math.random()*8);g.scale.setScalar(.01);g.userData={life:1.8};c.root.add(g);c.tg.push(g)}
  c.tg=c.tg.filter(g=>{g.userData.life-=dt;const u=g.userData.life<.3?g.userData.life/.3:1;g.scale.setScalar(Math.max(.01,Math.min(1,g.scale.x+dt*5)*u));if(g.userData.life<=0){c.root.remove(g);return false}return true});
  if(c.tap){const h=c.pick(c.tg)[0];if(h){const g=h.object.userData.t;c.score+=10;g.userData.life=0}}},
 hud(g,c,W,H){const x=(c.px+1)/2*W,y=(1-c.py)/2*H;g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.arc(x,y,16,0,7);g.moveTo(x-26,y);g.lineTo(x+26,y);g.moveTo(x,y-26);g.lineTo(x,y+26);g.stroke()}});

const ski=(el,s)=>g3(el,s,{title:'Слалом',help:'Рулите мышью, пальцем или стрелками. Проезжайте между флажками (+10), не врезайтесь в ёлки. Три пропущенных ворот — конец.',bg:0xcfe6f7,fog:50,cam:[0,4,9],look:[0,1,-10],
 setup(c){c.d=0;c.x=0;c.nz=-25;c.ob=[];c.miss=0;c.gr=c.box(90,.2,500,0xf4f8fc,0,-.1,-200);c.sk=new c.T.Group();c.root.add(c.sk);[c.box(.5,1.1,.4,0x1e88e5,0,.9,0),c.sph(.28,0xffcc99,0,1.7,0),c.box(.5,.08,2,0x333333,0,.1,0)].forEach(m=>c.sk.add(m))},
 tick(c,dt){const sp=13+Math.min(12,c.t*.35);c.d+=sp*dt;c.x+=(c.cx*7-c.x)*3.5*dt;c.sk.position.set(c.x,0,-c.d);c.sk.rotation.y=-(c.cx*7-c.x)*.12;c.gr.position.z=-c.d-200;
  while(c.nz>-(c.d+110)){c.nz-=7;if(Math.random()<.45){const gx=(Math.random()-.5)*9;c.ob.push({g:1,x:gx,z:c.nz,ms:[c.cyl(.07,2.2,0xe53935,gx-1.8,1.1,c.nz),c.cyl(.07,2.2,0x1e88e5,gx+1.8,1.1,c.nz)],done:0})}
   else for(let k=0;k<2;k++){const x=(Math.random()-.5)*26,z=c.nz-k*2;c.ob.push({x,z,ms:[c.cyl(.25,1.4,0x5d4037,x,.7,z),c.m(new c.T.ConeGeometry(1.2,3.2,8),0x1f6b2f,x,2.6,z)],done:0})}}
  c.ob=c.ob.filter(o=>{const z=-c.d;if(o.g&&!o.done&&z<o.z){o.done=1;if(Math.abs(c.x-o.x)<1.8)c.score+=10;else{c.miss++;if(c.miss>=3)c.over()}}
   if(!o.g&&Math.abs(z-o.z)<.9&&Math.abs(c.x-o.x)<1.1)c.over();if(o.z>z+15){o.ms.forEach(m=>c.root.remove(m));return false}return true});
  c.extra='Промахи '+c.miss+'/3';c.cam.position.set(c.x*.6,4,-c.d+9);c.cam.lookAt(c.x*.5,1,-c.d-10)}});

const defense=(el,s)=>g3(el,s,{title:'Оборона базы',help:'Нажимайте на землю, чтобы сбросить бомбу. Роботы идут к вашей базе: уничтожайте их взрывами. База выдерживает 5 попаданий.',bg:0x1c2a22,fog:60,cam:[0,20,13],look:[0,0,1],
 setup(c){c.hp=5;c.en=[];c.ex=[];c.cd=0;c.nx=1;c.g=c.box(44,.2,44,0x2f5a3a,0,-.1,0);c.box(2.4,1.6,2.4,0x90a4ae,0,.8,0);c.box(1.2,.7,1.2,0x546e7a,0,1.95,0);c.box(.15,1.4,.15,0xe53935,0,3,0)},
 tick(c,dt){c.cd-=dt;c.nx-=dt;c.extra='База '+c.hp+'/5';
  if(c.tap&&c.cd<=0){const h=c.pick([c.g])[0];if(h){c.cd=.5;const px=h.point.x,pz=h.point.z,m=c.sph(.5,0xffa726,px,.4,pz,{emissive:0xff7a00,transparent:true,opacity:.7});c.ex.push({m,t:0});
    c.en=c.en.filter(e=>{if(Math.hypot(e.m.position.x-px,e.m.position.z-pz)<3.4){c.root.remove(e.m);c.score+=5;return false}return true})}}
  c.ex=c.ex.filter(x=>{x.t+=dt*3;x.m.scale.setScalar(1+x.t*6);x.m.material.opacity=Math.max(0,.7-x.t*.7);if(x.t>1){c.root.remove(x.m);return false}return true});
  if(c.nx<=0){c.nx=Math.max(.35,1.3-c.t*.015);const a=Math.random()*6.28;c.en.push({m:c.box(.9,1.2,.9,0xc62828,Math.cos(a)*21,.6,Math.sin(a)*21,{emissive:0x440000}),v:1.6+c.t*.02})}
  c.en=c.en.filter(e=>{const p=e.m.position,d=Math.hypot(p.x,p.z);p.x-=p.x/d*e.v*dt;p.z-=p.z/d*e.v*dt;e.m.rotation.y+=dt*3;if(d<1.9){c.root.remove(e.m);c.hp--;if(c.hp<=0)c.over();return false}return true})}});

const parking=(el,s)=>g3(el,s,{title:'Парковка',help:'Руль и газ — мышь или палец (влево-вправо руль, вверх-вниз газ и задний ход) либо стрелки. Встаньте в зелёную зону и остановитесь. 60 секунд.',bg:0x7e8a97,fog:90,cam:[0,17,9],look:[0,0,1],
 setup(c){const T=c.T;c.car=new T.Group();c.root.add(c.car);[c.box(1.8,.7,4,0xe53935,0,.6,0),c.box(1.5,.6,2,0x222831,0,1.2,-.1)].forEach(m=>c.car.add(m));
  [[-1,1.3],[1,1.3],[-1,-1.3],[1,-1.3]].forEach(([x,z])=>{const w=c.cyl(.38,.3,0x111111,x*.95,.38,z);w.rotation.z=Math.PI/2;c.car.add(w)});
  c.box(40,.2,28,0x444a54,0,-.1,0);c.qx=0;c.qz=7;c.th=0;c.v=0;c.cones=[];c.slot=null;c.park=0;c.lvl=0;
  c.next=()=>{c.cones.forEach(m=>c.root.remove(m));c.cones=[];if(c.slot)c.root.remove(c.slot);const sx=(Math.random()-.5)*20,sz=-6-Math.random()*3;c.slot=c.box(2.8,.05,5,0x2ecc71,sx,.02,sz,{emissive:0x1a8a4a,transparent:true,opacity:.6});c.sl={x:sx,z:sz};
   for(let i=0;i<5+c.lvl;i++){let x,z;do{x=(Math.random()-.5)*30;z=(Math.random()-.5)*20-2}while(Math.hypot(x-sx,z-sz)<4||Math.hypot(x,z-7)<5);const cn=c.m(new T.ConeGeometry(.45,1,10),0xff6f00,x,.5,z);cn.userData={x,z};c.cones.push(cn)}};c.next()},
 tick(c,dt){c.extra='Время '+Math.max(0,60-c.t|0);if(c.t>60)return c.over();c.v+=c.sy*9*dt;c.v*=Math.pow(.35,dt);c.v=Math.max(-6,Math.min(9,c.v));c.th+=-c.sx*Math.min(1,Math.abs(c.v)/3)*1.6*dt*Math.sign(c.v||1);
  c.qx=Math.max(-19,Math.min(19,c.qx-Math.sin(c.th)*c.v*dt));c.qz=Math.max(-13,Math.min(13,c.qz-Math.cos(c.th)*c.v*dt));c.car.position.set(c.qx,0,c.qz);c.car.rotation.y=c.th;
  if(c.cones.some(n=>Math.hypot(n.userData.x-c.qx,n.userData.z-c.qz)<1.7)){c.v*=-.4;c.t+=2}
  const dx=Math.abs(c.qx-c.sl.x),dz=Math.abs(c.qz-c.sl.z),an=Math.abs(Math.sin(c.th));
  if(dx<.9&&dz<1.2&&an<.18&&Math.abs(c.v)<.8){c.park+=dt;if(c.park>.8){c.score+=100;c.lvl++;c.t=Math.max(0,c.t-8);c.park=0;c.next()}}else c.park=0}});

const rings=(el,s)=>g3(el,s,{title:'Кольца дракона',help:'Летите мышью, пальцем или стрелками. Пролетайте сквозь золотые кольца: +10 за каждое. Три промаха — конец.',bg:0x8fd3ff,fog:60,cam:[0,2.5,9],look:[0,0,-20],
 setup(c){const T=c.T,G=0x2e9e5b;c.dr=new T.Group();c.root.add(c.dr);const bd=c.m(new T.SphereGeometry(.6,16,12),G);bd.scale.z=2.2;const hd=c.m(new T.ConeGeometry(.35,.9,10),G,0,.1,-1.6);hd.rotation.x=-Math.PI/2;
  c.wl=c.box(2.2,.06,.9,0x7fd6a0,-1.3,.2,0);c.wr=c.box(2.2,.06,.9,0x7fd6a0,1.3,.2,0);const tl=c.m(new T.ConeGeometry(.3,1.8,8),G,0,0,1.9);tl.rotation.x=Math.PI/2;[bd,hd,c.wl,c.wr,tl].forEach(m=>c.dr.add(m));
  c.rg=[];c.cl=[...Array(14)].map(()=>c.sph(2+Math.random()*2,0xffffff,(Math.random()-.5)*70,-8-Math.random()*6,-Math.random()*150,{roughness:1,transparent:true,opacity:.85}));c.miss=0;c.nx=0},
 tick(c,dt){const sp=17+c.t*.3,P=c.dr.position;P.x+=(c.cx*6-P.x)*4*dt;P.y+=(c.cy*3.5-P.y)*4*dt;c.dr.rotation.z=-(c.cx*6-P.x)*.1;c.wl.rotation.z=Math.sin(c.t*9)*.5;c.wr.rotation.z=-Math.sin(c.t*9)*.5;
  c.cl.forEach(q=>{q.position.z+=sp*dt;if(q.position.z>14)q.position.z=-150});c.nx-=dt;
  if(c.nx<=0){c.nx=Math.max(.9,2.2-c.t*.02);c.rg.push(c.m(new c.T.TorusGeometry(2.2,.18,10,28),0xffc107,(Math.random()-.5)*12,(Math.random()-.5)*6,-100,{emissive:0xaa7700,metalness:.8}))}
  c.rg=c.rg.filter(r=>{r.position.z+=sp*dt;r.rotation.z+=dt;if(!r.d&&r.position.z>0){r.d=1;if(Math.hypot(r.position.x-P.x,r.position.y-P.y)<1.9)c.score+=10;else{c.miss++;if(c.miss>=3)c.over()}}if(r.position.z>12){c.root.remove(r);return false}return true});c.extra='Промахи '+c.miss+'/3'}});

const sumo=(el,s)=>g3(el,s,{title:'Сумо-арена',help:'Двигайте синий шар мышью, пальцем или стрелками. Столкните красные шары с арены и не упадите сами! Каждая волна сильнее.',bg:0x1a1230,fog:50,cam:[0,15,12],look:[0,0,0],
 setup(c){c.pl=c.sph(.8,0x42a5f5,0,.8,4,{metalness:.5,roughness:.3});c.pl.v=new c.T.Vector3();c.en=[];c.R=8;c.cyl(c.R,1,0x3a3f5c,0,-.5,0);const r=c.m(new c.T.TorusGeometry(c.R,.12,8,60),0xffffff,0,0,0,{emissive:0x8888ff});r.rotation.x=Math.PI/2;c.wave=0;
  c.spawn=()=>{c.wave++;for(let i=0;i<2+c.wave;i++){const a=Math.random()*6.28,e=c.sph(.8,0xe53935,Math.cos(a)*5,.8,Math.sin(a)*5,{metalness:.5,roughness:.3});e.v=new c.T.Vector3();e.sp=2.5+Math.random()*1.5+c.wave*.3;c.en.push(e)}};c.spawn()},
 tick(c,dt){const P=c.pl,all=[P,...c.en];P.v.x+=c.sx*9*dt;P.v.z+=-c.sy*9*dt;
  c.en.forEach(e=>{const dx=P.position.x-e.position.x,dz=P.position.z-e.position.z,d=Math.hypot(dx,dz)||1;if(!e.fall){e.v.x+=dx/d*e.sp*dt*1.6;e.v.z+=dz/d*e.sp*dt*1.6}});
  all.forEach(b=>{b.position.x+=b.v.x*dt;b.position.z+=b.v.z*dt;if(b.fall)b.position.y-=12*dt;else b.v.multiplyScalar(Math.pow(.45,dt))});
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const a=all[i],b=all[j];if(a.fall||b.fall)continue;let dx=b.position.x-a.position.x,dz=b.position.z-a.position.z;const d=Math.hypot(dx,dz);
   if(d<1.6&&d>0){dx/=d;dz/=d;const rv=(a.v.x-b.v.x)*dx+(a.v.z-b.v.z)*dz;if(rv>0){a.v.x-=dx*rv*1.4;a.v.z-=dz*rv*1.4;b.v.x+=dx*rv*1.4;b.v.z+=dz*rv*1.4}const o=(1.6-d)/2;a.position.x-=dx*o;a.position.z-=dz*o;b.position.x+=dx*o;b.position.z+=dz*o}}
  all.forEach(b=>{if(!b.fall&&Math.hypot(b.position.x,b.position.z)>c.R+.5)b.fall=1});
  if(P.fall&&P.position.y<-6)return c.over();
  c.en=c.en.filter(e=>{if(e.position.y<-6){c.root.remove(e);c.score+=20;return false}return true});if(!c.en.length&&!P.fall)c.spawn();c.extra='Волна '+c.wave}});

const hopper=(el,s)=>g3(el,s,{title:'Перекрёсток',help:'Нажмите, чтобы прыгнуть вперёд (слева или справа экрана — в сторону) либо стрелки и WASD. Избегайте машин и обходите деревья.',bg:0x8fd3ff,fog:45,cam:[5,10,8],look:[0,0,-2],
 setup(c){const T=c.T;c.rows=new Map();c.r=0;c.hx=0;c.tx=0;c.tr=0;c.hop=0;c.hr=new T.Group();c.root.add(c.hr);[c.box(.7,.7,.7,0xffffff,0,.35,0),c.box(.15,.2,.3,0xe53935,0,.85,0),c.box(.2,.15,.3,0xffa000,0,.4,-.45)].forEach(m=>c.hr.add(m));
  c.gen=r=>{if(c.rows.has(r))return;const road=r>1&&Math.random()<.55,row={road,cars:[],trees:new Set(),v:(Math.random()<.5?-1:1)*(2+Math.random()*3+Math.min(3,r*.03))};
   c.box(22,.2,1,road?0x3a3d44:(r%2?0x6cc04a:0x5fb53f),0,-.1,-r);
   if(road)for(let k=0;k<3;k++){const col=[0xe53935,0xfdd835,0x1e88e5,0x8e24aa][Math.random()*4|0];row.cars.push(c.box(1.6,.7,.9,col,(k-1)*7+Math.random()*2,.45,-r))}
   else if(r>1)for(let x=-5;x<=5;x++)if(Math.random()<.18&&x!=0){row.trees.add(x);c.cyl(.2,.8,0x5d4037,x,.4,-r);c.m(new T.ConeGeometry(.6,1.4,7),0x2e7d32,x,1.3,-r)}
   c.rows.set(r,row)};for(let r=-1;r<24;r++)c.gen(r)},
 tick(c,dt){const mv=(dx,dz)=>{if(c.hop>0)return;const nr=c.r+dz,nx=c.tx+dx;if(Math.abs(nx)>5||nr<0)return;c.gen(nr);if(c.rows.get(nr).trees.has(nx))return;c.tx=nx;c.r=nr;c.hop=.12;c.score=Math.max(c.score,c.r)};
  const kp=c.kp;if(kp.arrowup||kp.w)mv(0,1);else if(kp.arrowleft||kp.a)mv(-1,0);else if(kp.arrowright||kp.d)mv(1,0);else if(c.tap){const side=c.ptr&&Math.abs(c.px)>.45;if(side)mv(c.px<0?-1:1,0);else mv(0,1)}
  if(c.hop>0)c.hop-=dt;c.hx+=(c.tx-c.hx)*Math.min(1,dt*18);c.tr+=(c.r-c.tr)*Math.min(1,dt*18);c.hr.position.set(c.hx,Math.abs(Math.sin(Math.max(0,c.hop)*26))*.4,-c.tr);
  for(let r=c.r;r<c.r+24;r++)c.gen(r);
  c.rows.forEach((row,r)=>{row.cars.forEach(m=>{m.position.x+=row.v*dt;if(m.position.x>11)m.position.x=-11;if(m.position.x<-11)m.position.x=11;if(r==c.r&&Math.abs(m.position.x-c.hx)<1.05)c.over()})});
  c.cam.position.set(c.hx*.5+5,10,-c.tr+8);c.cam.lookAt(c.hx*.5,0,-c.tr-2);if(c.r==0&&c.t>12)c.over()}});

const maze3d=(el,s)=>g3(el,s,{title:'Лабиринт 3D',help:'Катите шар мышью, пальцем или стрелками. Соберите все кристаллы и доберитесь до зелёного выхода за 90 секунд.',bg:0x161b2e,fog:60,cam:[0,19,9],look:[0,0,1],
 setup(c){const N=9,S=3,o=-(N*S)/2+S/2,D=[[0,-1,0,2],[1,0,1,3],[0,1,2,0],[-1,0,3,1]],M=[...Array(N*N)].map(()=>[1,1,1,1]),seen=Array(N*N).fill(0),st=[0];seen[0]=1;
  while(st.length){const i=st[st.length-1],cx=i%N,cy=i/N|0,op=D.filter(([dx,dy])=>cx+dx>=0&&cx+dx<N&&cy+dy>=0&&cy+dy<N&&!seen[(cy+dy)*N+cx+dx]);if(!op.length){st.pop();continue}const[dx,dy,a,b]=op[Math.random()*op.length|0],j=(cy+dy)*N+cx+dx;M[i][a]=0;M[j][b]=0;seen[j]=1;st.push(j)}
  c.W=[];const wall=(x,z,w,d)=>{c.box(w,1.4,d,0x5b6b9a,x,.7,z);c.W.push([x-w/2,x+w/2,z-d/2,z+d/2])};
  M.forEach((w,i)=>{const x=o+(i%N)*S,z=o+(i/N|0)*S;if(w[0])wall(x,z-S/2,S+.25,.25);if(w[3])wall(x-S/2,z,.25,S+.25);if(i%N==N-1&&w[1])wall(x+S/2,z,.25,S+.25);if((i/N|0)==N-1&&w[2])wall(x,z+S/2,S+.25,.25)});
  c.box(N*S+1,.3,N*S+1,0x2a3350,0,-.15,0);c.gm=[];for(let k=0;k<5;k++){const i=1+Math.random()*(N*N-2)|0;c.gm.push(c.m(new c.T.OctahedronGeometry(.45),0xffd54f,o+(i%N)*S,.9,o+(i/N|0)*S,{emissive:0xaa8800}))}
  c.ex=c.cyl(1,.2,0x2ecc71,o+(N-1)*S,.1,o+(N-1)*S,{emissive:0x1a8a4a});c.bl=c.sph(.55,0xff7043,o,.55,o,{metalness:.6,roughness:.3});c.v=[0,0];c.got=0},
 tick(c,dt){c.extra='Время '+Math.max(0,90-c.t|0)+'  Кристаллы '+c.got+'/5';if(c.t>90)return c.over();const b=c.bl,v=c.v;v[0]+=c.sx*18*dt;v[1]+=-c.sy*18*dt;v[0]*=Math.pow(.2,dt);v[1]*=Math.pow(.2,dt);b.position.x+=v[0]*dt;b.position.z+=v[1]*dt;
  c.W.forEach(([x1,x2,z1,z2])=>{const nx=Math.max(x1,Math.min(b.position.x,x2)),nz=Math.max(z1,Math.min(b.position.z,z2)),dx=b.position.x-nx,dz=b.position.z-nz,d=Math.hypot(dx,dz);if(d<.55&&d>0){b.position.x+=dx/d*(.55-d);b.position.z+=dz/d*(.55-d);v[0]*=.5;v[1]*=.5}});
  b.rotation.x+=v[1]*dt;b.rotation.z-=v[0]*dt;c.gm=c.gm.filter(g=>{g.rotation.y+=dt*2;if(g.position.distanceTo(b.position)<1){c.score+=20;c.got++;c.root.remove(g);return false}return true});
  if(!c.gm.length&&b.position.distanceTo(c.ex.position)<1.3){c.score+=100+(90-c.t|0)*2;c.over()}}});

const tanks=(el,s)=>g3(el,s,{title:'Танчики 3D',help:'WASD или стрелки — ехать, мышь — прицел, клик — выстрел. Уничтожайте вражеские танки. Три попадания — конец.',bg:0x2a3a2a,fog:80,cam:[0,24,13],look:[0,0,1],
 setup(c){const T=c.T;c.g=c.box(70,.2,70,0x4b6b3a,0,-.1,0);for(let i=0;i<14;i++){const x=(Math.random()-.5)*50,z=(Math.random()-.5)*40;if(Math.hypot(x,z)>6)c.box(2+Math.random()*2,1.4,2+Math.random()*2,0x6d7a5a,x,.7,z)}
  c.mk=col=>{const g=new T.Group(),tu=new T.Group();tu.add(c.box(1.2,.5,1.3,col,0,.9,0));const br=c.cyl(.12,1.8,0x222222,0,.9,1.2);br.rotation.x=Math.PI/2;tu.add(br);g.add(c.box(2,.7,2.8,col,0,.45,0),tu);g.tu=tu;c.root.add(g);return g};
  c.p=c.mk(0x2e7d32);c.hp=3;c.bu=[];c.en=[];c.nx=1},
 tick(c,dt){const p=c.p,k=c.k,mx=(k.d||k.arrowright?1:0)-(k.a||k.arrowleft?1:0),mz=(k.s||k.arrowdown?1:0)-(k.w||k.arrowup?1:0);c.extra='Жизни '+c.hp;
  if(mx||mz){const l=Math.hypot(mx,mz);p.position.x=Math.max(-30,Math.min(30,p.position.x+mx/l*7*dt));p.position.z=Math.max(-30,Math.min(30,p.position.z+mz/l*7*dt));p.rotation.y=Math.atan2(mx,mz)}
  const h=c.pick([c.g])[0];let aim=p.rotation.y+p.tu.rotation.y;if(h){aim=Math.atan2(h.point.x-p.position.x,h.point.z-p.position.z);p.tu.rotation.y=aim-p.rotation.y}
  if(c.tap)c.bu.push({m:c.sph(.22,0xffeb3b,p.position.x+Math.sin(aim)*1.8,1.1,p.position.z+Math.cos(aim)*1.8,{emissive:0xffaa00}),dx:Math.sin(aim)*24,dz:Math.cos(aim)*24,l:1.2,e:0});
  c.nx-=dt;if(c.nx<=0){c.nx=Math.max(1,3-c.t*.03);const a=Math.random()*6.28,e=c.mk(0xc62828);e.position.set(Math.cos(a)*30,0,Math.sin(a)*30);c.en.push({m:e,sh:1+Math.random()*2})}
  c.en=c.en.filter(e=>{const m=e.m,dx=p.position.x-m.position.x,dz=p.position.z-m.position.z,d=Math.hypot(dx,dz)||1;m.position.x+=dx/d*2.2*dt;m.position.z+=dz/d*2.2*dt;m.rotation.y=Math.atan2(dx,dz);m.tu.rotation.y=0;e.sh-=dt;
   if(e.sh<=0){e.sh=2.5;c.bu.push({m:c.sph(.2,0xff5252,m.position.x+dx/d*1.8,1.1,m.position.z+dz/d*1.8,{emissive:0xaa0000}),dx:dx/d*12,dz:dz/d*12,l:2,e:1})}
   if(d<1.8){c.root.remove(m);c.hp--;return false}return true});
  c.bu=c.bu.filter(b=>{b.m.position.x+=b.dx*dt;b.m.position.z+=b.dz*dt;b.l-=dt;let dead=b.l<=0;
   if(!b.e)c.en=c.en.filter(e=>{if(!dead&&Math.hypot(e.m.position.x-b.m.position.x,e.m.position.z-b.m.position.z)<1.4){c.root.remove(e.m);c.score+=10;dead=true;return false}return true});
   else if(Math.hypot(p.position.x-b.m.position.x,p.position.z-b.m.position.z)<1.2){c.hp--;dead=true}
   if(dead)c.root.remove(b.m);return !dead});
  if(c.hp<=0)c.over()}});

const penalty=(el,s)=>g3(el,s,{title:'Пенальти 3D',help:'Наведите прицел на ворота и нажмите — удар. Вратарь прыгает в случайную сторону. 5 ударов, каждый гол +20.',bg:0x87ceeb,fog:90,cam:[0,2.2,9],look:[0,1.6,-8],
 setup(c){c.box(70,.2,50,0x2e8b3a,0,-.1,-15);const P=0xf5f5f5;c.cyl(.12,2.6,P,-3.6,1.3,-14);c.cyl(.12,2.6,P,3.6,1.3,-14);const cb=c.cyl(.12,7.4,P,0,2.6,-14);cb.rotation.z=Math.PI/2;c.box(7.2,2.5,.05,0xffffff,0,1.3,-14.6,{transparent:true,opacity:.18});
  c.gk=new c.T.Group();c.root.add(c.gk);[c.box(.9,1.2,.4,0xff9800,0,1.2,0),c.sph(.3,0xf0c8a0,0,2,0),c.box(1.7,.25,.3,0xff9800,0,1.5,0)].forEach(m=>c.gk.add(m));c.gk.position.set(0,0,-13.8);
  c.bl=c.sph(.32,0xffffff,0,.32,3);c.n=0;c.fl=null;c.res=''},
 tick(c,dt){c.extra='Удар '+Math.min(5,c.n+1)+'/5  '+c.res;
  if(c.fl){const f=c.fl;f.t+=dt/.8;const k=Math.min(1,f.t);c.bl.position.set(f.x*k,.32+f.y*k+Math.sin(k*Math.PI)*1.2,3-17*k);c.gk.position.x+=(f.kx-c.gk.position.x)*Math.min(1,dt*7);c.gk.rotation.z=-(f.kx-c.gk.position.x)*.15;
   if(f.t>=1&&!f.d){f.d=1;const saved=Math.abs(f.kx-f.x)<1.4&&f.y<2.4,goal=Math.abs(f.x)<3.5&&f.y<2.4&&f.y>0;if(goal&&!saved){c.score+=20;c.res='ГОЛ!'}else c.res=goal?'Сейв!':'Мимо!';f.w=1}
   if(f.d){f.w-=dt;if(f.w<=0){c.fl=null;c.n++;c.bl.position.set(0,.32,3);c.gk.position.x=0;c.gk.rotation.z=0;if(c.n>=5)c.over()}}}
  else if(c.tap)c.fl={t:0,x:c.px*6.5,y:Math.max(0,1.2+c.py*2.4),kx:(Math.random()-.5)*6}},
 hud(g,c,W,H){const x=(c.px+1)/2*W,y=(1-c.py)/2*H;g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.arc(x,y,16,0,7);g.moveTo(x-26,y);g.lineTo(x+26,y);g.moveTo(x,y-26);g.lineTo(x,y+26);g.stroke()}});

const snake3d=(el,s)=>g3(el,s,{title:'Змейка 3D',help:'Стрелки или WASD — повороты. На телефоне коснитесь левой или правой стороны экрана, чтобы повернуть. Ешьте яблоки и не врезайтесь.',bg:0x12301d,fog:60,cam:[0,17,11],look:[0,0,1],
 setup(c){const N=15;c.N=N;c.sn=[{x:7,y:7},{x:6,y:7},{x:5,y:7}];c.dir=[1,0];c.nd=[1,0];c.acc=0;c.ms=[];c.w=(x,y)=>[(x-7)*1.2,(y-7)*1.2];
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){const[w,z]=c.w(i,j);c.box(1.2,.2,1.2,(i+j)%2?0x1f4d2c:0x23572f,w,-.1,z)}
  c.fd=()=>{do c.f={x:Math.random()*N|0,y:Math.random()*N|0};while(c.sn.some(p=>p.x==c.f.x&&p.y==c.f.y));if(c.ap)c.root.remove(c.ap);const[w,z]=c.w(c.f.x,c.f.y);c.ap=c.sph(.45,0xe53935,w,.5,z,{emissive:0x550000})};c.fd();
  c.draw=()=>{c.ms.forEach(m=>c.root.remove(m));c.ms=c.sn.map((p,i)=>{const[w,z]=c.w(p.x,p.y);return c.sph(i?Math.max(.38,.5-i*.004):.62,i?0x43a047:0x7cb342,w,.5,z)})};c.draw()},
 tick(c,dt){const kp=c.kp,[dx,dy]=c.dir,T=(a,b)=>{if(a+dx||b+dy)c.nd=[a,b]};
  if(kp.arrowup||kp.w)T(0,-1);if(kp.arrowdown||kp.s)T(0,1);if(kp.arrowleft||kp.a)T(-1,0);if(kp.arrowright||kp.d)T(1,0);if(c.tap&&c.ptr)c.px<0?T(dy,-dx):T(-dy,dx);
  c.ap.position.y=.5+Math.sin(c.t*5)*.1;c.acc+=dt;if(c.acc<Math.max(.07,.2-c.score*.004))return;c.acc=0;c.dir=c.nd;const h={x:c.sn[0].x+c.dir[0],y:c.sn[0].y+c.dir[1]};
  if(h.x<0||h.y<0||h.x>=c.N||h.y>=c.N||c.sn.some(p=>p.x==h.x&&p.y==h.y))return c.over();c.sn.unshift(h);if(h.x==c.f.x&&h.y==c.f.y){c.score++;c.fd()}else c.sn.pop();c.draw()}});

const sky=(el,s)=>g3(el,s,{title:'Небесный прыгун',help:'Руль — мышь, палец или стрелки. Шарик сам подпрыгивает: приземляйтесь на облачные платформы и взлетайте всё выше.',bg:0x7ec8f5,fog:70,cam:[0,6,14],look:[0,4,0],
 setup(c){c.pl=c.sph(.6,0xff7043,0,1,0);c.x=0;c.y=1;c.vy=12;c.P=[];c.cy=2;c.add=y=>{const m=c.box(3,.4,3,0xf4faff,(Math.random()-.5)*14,y,0);m.d=Math.random()<.25?1.5*(Math.random()<.5?-1:1):0;c.P.push(m)};c.add(0);c.top=0;while(c.top<30){c.top+=2.2+Math.random()*.7;c.add(c.top)}},
 tick(c,dt){c.x+=(c.cx*8-c.x)*5*dt;c.vy-=24*dt;const py=c.y;c.y+=c.vy*dt;
  if(c.vy<0)c.P.forEach(p=>{if(Math.abs(c.x-p.position.x)<1.9&&py-.6>=p.position.y+.15&&c.y-.6<=p.position.y+.2)c.vy=13});
  c.P.forEach(p=>{if(p.d){p.position.x+=p.d*dt;if(Math.abs(p.position.x)>7)p.d*=-1}});
  while(c.top<c.y+30){c.top+=2.2+Math.random()*.7;c.add(c.top)}c.P=c.P.filter(p=>{if(p.position.y<c.cy-14){c.root.remove(p);return false}return true});
  c.cy=Math.max(c.cy,c.y);c.score=Math.max(c.score,c.y*1.5|0);c.pl.position.set(c.x,c.y,0);c.cam.position.set(c.x*.2,c.cy+4,14);c.cam.lookAt(c.x*.2,c.cy+2,0);if(c.y<c.cy-10)c.over()}});

export const GAMES={snake:{start:snake},ttt:{start:ttt},g2048:{start:g2048},memory:{start:memory},mole:{start:mole},reaction:{start:reaction},
  simon:{start:simon},clicker:{start:clicker},flappy:{start:flappy},guess:{start:guess},lights:{start:lights},math:{start:math},rps:{start:rps},numbers:{start:numbers},
  stroop:{start:stroop},slide:{start:slide},typing:{start:typing},hilo:{start:hilo},catcher:{start:catcher},racing:{start:racing},shooter:{start:shooter},
  tetris:{start:tetris},breakout:{start:breakout},jumper:{start:jumper},mines:{start:mines},pong:{start:pong},
  quest:{start:quest},zombies:{start:zombies},fishing:{start:fishing},lockpick:{start:lockpick},courier:{start:courier},flight:{start:flight},ball:{start:ball},stack:{start:stack},gallery:{start:gallery},ski:{start:ski},defense:{start:defense},parking:{start:parking},rings:{start:rings},sumo:{start:sumo},hopper:{start:hopper},maze3d:{start:maze3d},tanks:{start:tanks},penalty:{start:penalty},snake3d:{start:snake3d},sky:{start:sky}};
