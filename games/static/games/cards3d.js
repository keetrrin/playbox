(function(){
const T=THREE,COLU={R:'#e53935',Y:'#fbc02d',G:'#43a047',B:'#1e88e5',K:'#1a1a1a'},SYM={S:'⊘',R:'⇄',D:'+2',W:'★',F:'+4'},cache={};
const draws={
 u:(g,c)=>{g.fillStyle='#fff';g.fillRect(0,0,256,360);const col=COLU[c[0]];g.fillStyle=col;g.fillRect(10,10,236,340);
  if(c[0]=='K')['#e53935','#fbc02d','#43a047','#1e88e5'].forEach((q,i)=>{g.fillStyle=q;g.fillRect(10+(i%2)*118,10+(i>>1)*170,118,170)});
  g.save();g.translate(128,180);g.rotate(-.5);g.fillStyle='#fff';g.beginPath();g.ellipse(0,0,100,150,0,0,7);g.fill();g.restore();
  const s=SYM[c[1]]||c[1];g.fillStyle=c[0]=='K'?'#222':col;g.font='bold 110px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(s,128,185);g.fillStyle='#fff';g.font='bold 44px Arial';g.fillText(s,48,50);g.fillText(s,208,310)},
 p:(g,c)=>{g.fillStyle='#fffdf7';g.fillRect(0,0,256,360);g.strokeStyle='#bbb';g.lineWidth=6;g.strokeRect(3,3,250,354);const su={S:'♠',H:'♥',D:'♦',C:'♣'}[c[0]],col='HD'.includes(c[0])?'#c62828':'#111',r=c.slice(1);
  g.fillStyle=col;g.textAlign='center';g.textBaseline='middle';g.font='bold 54px Arial';g.fillText(r,40,46);g.font='44px Arial';g.fillText(su,40,96);g.font='140px Arial';g.fillText(su,128,190);
  g.save();g.translate(216,314);g.rotate(Math.PI);g.font='bold 54px Arial';g.fillText(r,0,0);g.font='44px Arial';g.fillText(su,0,50);g.restore()},
 bu:g=>{g.fillStyle='#111';g.fillRect(0,0,256,360);g.fillStyle='#e53935';g.beginPath();g.ellipse(128,180,100,150,-.5,0,7);g.fill();g.fillStyle='#fdd835';g.font='italic bold 70px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('UNO',128,180)},
 bp:g=>{g.fillStyle='#1a3a8a';g.fillRect(0,0,256,360);g.strokeStyle='#8fb0ff';g.lineWidth=4;for(let i=-360;i<360;i+=24){g.beginPath();g.moveTo(i,0);g.lineTo(i+360,360);g.stroke()}g.strokeStyle='#fff';g.lineWidth=8;g.strokeRect(10,10,236,340)}};
const tex=k=>cache[k]||(cache[k]=(()=>{const c=document.createElement('canvas');c.width=256;c.height=360;const g=c.getContext('2d'),i=k.indexOf(':');if(i>0)draws[k.slice(0,i)](g,k.slice(i+1));else draws[k](g);return new T.CanvasTexture(c)})());
const edge=new T.MeshStandardMaterial({color:0xb0b0b0});
const cardM=k=>{const g=new T.Group(),f=new T.Mesh(new T.PlaneGeometry(1.5,2.1),new T.MeshStandardMaterial({map:tex(k),roughness:.8,metalness:0,color:0xc8c8c8}));f.rotation.x=-Math.PI/2;f.position.y=.025;f.castShadow=true;g.add(f);const e=new T.Mesh(new T.BoxGeometry(1.5,.04,2.1),edge);e.castShadow=true;g.add(e);return g};
const label=n=>{const q=document.createElement('canvas');q.width=256;q.height=64;const g=q.getContext('2d');g.font='bold 30px Arial';g.textAlign='center';g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=5;g.strokeText(n,128,42);g.fillText(n,128,42);const s=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(q),depthTest:false}));s.scale.set(3.2,.8,1);return s};
window.CardTable=(box,onPick)=>{
 const W=1280,H=720,cv=document.createElement('canvas');cv.width=W;cv.height=H;box.append(cv);box.style.touchAction='none';
 const R=new T.WebGLRenderer({canvas:cv,antialias:true});R.setSize(W,H,false);R.shadowMap.enabled=true;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=.55;R.outputEncoding=T.sRGBEncoding;
 const sc=new T.Scene();sc.background=new T.Color(0x05090a);const cam=new T.PerspectiveCamera(45,W/H,.1,100);cam.position.set(0,15,12);cam.lookAt(0,0,1.2);
 sc.add(new T.HemisphereLight(0xffffff,0x223322,.3));const L=new T.SpotLight(0xffffff,.9,70,.8,.5);L.position.set(0,20,5);L.castShadow=true;sc.add(L);
 const felt=new T.Mesh(new T.CylinderGeometry(12,12,.5,64),new T.MeshStandardMaterial({color:0x14503a,roughness:.95}));felt.position.y=-.3;felt.receiveShadow=true;sc.add(felt);
 const rim=new T.Mesh(new T.TorusGeometry(12,.5,12,80),new T.MeshStandardMaterial({color:0x5a3a22,roughness:.5}));rim.rotation.x=Math.PI/2;rim.position.y=-.1;sc.add(rim);
 let grp=new T.Group(),prev={},hov=-1,hands=[],decks=[],sig='',D={kind:'u'};sc.add(grp);const rc=new T.Raycaster(),v2=new T.Vector2(),DECK=new T.Vector3(-3,1.2,.5);
 const put=(m,key,x,y,z,ry)=>{m.userData.t=new T.Vector3(x,y,z);m.userData.k=key;m.position.copy(prev[key]||DECK);m.rotation.y=ry||0;grp.add(m);return m};
 const build=d=>{prev={};grp.children.forEach(m=>{if(m.userData.k)prev[m.userData.k]=m.position.clone()});grp.clear();hands=[];decks=[];D=d;const bk=d.kind=='u'?'bu':'bp',occ={};
  const op=d.opp||[],POS={1:[[0,-7.2,0]],2:[[-9.5,.5,Math.PI/2],[9.5,.5,-Math.PI/2]],3:[[-9.5,.5,Math.PI/2],[0,-7.2,0],[9.5,.5,-Math.PI/2]]}[op.length]||[];
  op.forEach((o,j)=>{const[ox,oz,ry]=POS[j],n=Math.min(o.n,14);for(let k=0;k<n;k++){const off=(k-(n-1)/2)*.55;put(cardM(bk),'o'+j+'|'+k,ox+off*Math.cos(ry),.05+k*.012,oz-off*Math.sin(ry),ry)}
   const l=label(o.name+' · '+o.n);l.position.set(ox*.9,2.4,oz*.9+(oz<-5?-1.2:oz>5?1.2:0));grp.add(l);if(o.turn){const r=new T.Mesh(new T.TorusGeometry(1.3,.08,8,40),new T.MeshStandardMaterial({color:0xffd54f,emissive:0xffb300}));r.rotation.x=Math.PI/2;r.position.set(ox*.9,.1,oz*.9);grp.add(r)}});
  for(let k=0;k<Math.min(d.pile||0,6);k++){const m=put(cardM(bk),'d'+k,-3,.05+k*.05,.5,0);decks.push(m)}
  if(d.trump)put(cardM('p:'+d.trump.c),'tr',-3.9,.04,.5,Math.PI/2);
  if(d.top){put(cardM(d.top.t+':'+d.top.c),'top'+d.top.c,1.2,.1,.5,.15);if(d.ring){const r=new T.Mesh(new T.TorusGeometry(1.6,.09,8,40),new T.MeshStandardMaterial({color:new T.Color(COLU[d.ring]||'#fff'),emissive:new T.Color(COLU[d.ring]||'#fff'),emissiveIntensity:.8}));r.rotation.x=Math.PI/2;r.position.set(1.2,.05,.5);grp.add(r)}}
  (d.table||[]).forEach((p,i)=>{const x=.8+(i%3)*2.8,z=i<3?-1.2:1.5;put(cardM('p:'+p.a.c),'ta'+i,x,.08,z,0);if(p.d)put(cardM('p:'+p.d.c),'td'+i,x+.45,.14,z+.35,.2)});
  (d.hand||[]).forEach((c,i,a)=>{const n=a.length,sp=Math.min(1.25,11/Math.max(n,1)),x=(i-(n-1)/2)*sp,key=c.t+c.c,o=occ[key]=(occ[key]||0)+1;const m=put(cardM(c.t+':'+c.c),'h'+key+o,x,.2+i*.012+(c.ok?.25:0),7.2+Math.abs(x)*.04,-x*.02);if(c.ok===false)m.children[0].material.color.set(0x585858);m.userData.hi=i;m.userData.base=m.userData.t.clone();hands.push(m)});
  if(d.mine){const b=new T.Mesh(new T.BoxGeometry(10,.03,.2),new T.MeshStandardMaterial({color:0xffd54f,emissive:0xffb300}));b.position.set(0,.02,9);grp.add(b)}};
 const ptr=e=>{const r=cv.getBoundingClientRect();v2.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);rc.setFromCamera(v2,cam)};
 const hit=l=>{const h=rc.intersectObjects(l,true)[0];if(!h)return -1;let o=h.object;while(o&&o.userData.hi==null&&!decks.includes(o))o=o.parent;return o?(o.userData.hi!=null?o.userData.hi:'deck'):-1};
 cv.onpointermove=e=>{ptr(e);const h=hit(hands);hov=h===-1?-1:h};
 cv.onpointerdown=e=>{ptr(e);const h=hit(hands);if(h!==-1)return onPick(h);if(decks.length&&hit(decks)==='deck')onPick('deck')};
 (function loop(){requestAnimationFrame(loop);grp.children.forEach(m=>{const t=m.userData.t;if(!t)return;let g=t;if(m.userData.hi!=null&&m.userData.hi===hov){g=t.clone();g.y+=.8;g.z-=.7}m.position.lerp(g,.2)});R.render(sc,cam)})();
 return{set:d=>{const s=JSON.stringify(d);if(s!==sig){sig=s;build(d)}}};
};})();
