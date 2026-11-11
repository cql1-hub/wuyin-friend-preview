// An ink-and-starlight apparition with gesture-played cards.
// Hand landmarks drive the cards; the hand skeleton itself is intentionally not drawn.
export async function createFoolAvatar(host,{study=false,reduce=false}={}){
 const canvas=document.createElement('canvas');canvas.className='fool-canvas';host.append(canvas);
 const handsCanvas=document.createElement('canvas');handsCanvas.className='fool-hands';handsCanvas.style.display='none';document.body.append(handsCanvas);
 const background=canvas.getContext('2d'),handCtx=handsCanvas.getContext('2d');let ctx=background;const portrait=new Image();portrait.src='./media/fool/klein-portrait-v2.png';
 let enabled=study,tracking=null,lastSeen=0,previous=0,time=0;
 let gesture={kind:'',progress:0,charge:0},lastKind='';
 let cards=[],held=null,nextId=1,nextArt=0,deckCount=2,drawCooldown=0,flipCooldown=0,seeded=false,lastPinch=null;
 const CARD_ART=[
  {name:'黑皇帝',src:'./media/relic-v3/black-emperor-art.webp'},
  {name:'律令',src:'./media/relic-v3/law.webp'},
  {name:'秩序',src:'./media/relic-v3/order.webp'},
  {name:'扭曲',src:'./media/relic-v3/distortion.webp'},
  {name:'威严',src:'./media/relic-v3/majesty.webp'}
 ].map(item=>{const img=new Image();img.decoding='async';img.src=item.src;return {...item,img}});
 const particles=Array.from({length:150},(_,i)=>({x:Math.sin(i*91.7)*.5,y:(i*.618)%1,r:.3+(i%5)*.24,phase:i*2.4}));

 function resize(){
  const d=Math.min(devicePixelRatio,2),w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;
  canvas.width=w*d;canvas.height=h*d;canvas.style.width=w+'px';canvas.style.height=h+'px';
  handsCanvas.width=w*d;handsCanvas.height=h*d;handsCanvas.style.width=w+'px';handsCanvas.style.height=h+'px';
  background.setTransform(d,0,0,d,0,0);handCtx.setTransform(d,0,0,d,0,0);
  for(const card of cards){if(card.slot>=0){const slot=fanSlot(card.slot,w,h);card.x=slot.x;card.y=slot.y;card.ang=slot.ang;card.tx=slot.x;card.ty=slot.y;card.tang=slot.ang}}
 }
 new ResizeObserver(resize).observe(host);resize();
 function setEnabled(value){enabled=value;host.classList.toggle('avatar-active',value);handsCanvas.classList.toggle('active',value);if(!value){tracking=null;gesture={kind:'',progress:0,charge:0};lastKind='';if(held){held.slot=-1;held=null}handCtx.clearRect(0,0,host.clientWidth,host.clientHeight)}}
 function input(data){tracking=data;lastSeen=performance.now()}
 document.addEventListener('fool-tracking',e=>input(e.detail));
 document.addEventListener('fool-camera',e=>setEnabled(e.detail));
 document.addEventListener('fool-gesture',e=>handleGesture(e.detail||{}));

 function stroke(path,color,width=1){ctx.beginPath();path(ctx);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}

 /* ---------- card geometry ---------- */
 function cardSize(w){const cw=Math.max(72,Math.min(118,w*.12));return {w:cw,h:cw*1.5}}
 function deckPoint(w,h){return {x:w*.13,y:h*.73}}
 function fanSlot(index,w,h){
  const s=cardSize(w),spacing=s.w*.72,cx=w*.5,cy=h*.72;
  return {x:cx+(index-2)*spacing,y:cy+Math.abs(index-2)*h*.018,ang:(index-2)*.075};
 }
 function readPinch(w,h){
  const data=tracking?.hands?.[0];
  if(!data)return null;
  return {x:(1-(data[4].x+data[8].x)/2)*w,y:(data[4].y+data[8].y)/2*h};
 }
 function freeSlot(){for(let i=4;i>=0;i--){if(!cards.some(c=>c.slot===i))return i}return 2}
 function spawnCard(slot,w,h){
  const art=CARD_ART[nextArt]||CARD_ART[0],deck=deckPoint(w,h);
  const target=fanSlot(slot,w,h);
  nextArt++;
  return {id:nextId++,art,faceUp:true,x:deck.x,y:deck.y,ang:-.12,scale:.92,tx:target.x,ty:target.y,tang:target.ang,slot,held:false};
 }
 function ensureCards(w,h){
  if(seeded)return;
  seeded=true;
  for(const slot of [1,2,3]){cards.push(spawnCard(slot,w,h));const card=cards.at(-1);const t=fanSlot(slot,w,h);card.x=t.x;card.y=t.y;card.ang=t.ang;card.scale=1}
 }
 function pickAt(point,w,h){
  if(held)return;
  const size=cardSize(w);
  let best=null,bestDistance=size.w*.85;
  for(const card of cards){
   const distance=Math.hypot(card.x-point.x,card.y-point.y);
   if(distance<bestDistance){best=card;bestDistance=distance}
  }
  if(best){held=best;best.slot=-1;best.faceUp=true;best.scale=1.06;return}
  const deck=deckPoint(w,h);
  if(deckCount>0&&cards.length<5&&Math.hypot(deck.x-point.x,deck.y-point.y)<size.w*1.35){
   const card=spawnCard(2,w,h);card.slot=-1;card.faceUp=true;cards.push(card);held=card;deckCount--;
  }
 }
 function drawByPalm(w,h){
  const now=performance.now();
  if(held||deckCount<=0||cards.length>=5||now<drawCooldown)return;
  drawCooldown=now+700;
  const slot=freeSlot();
  const card=spawnCard(slot,w,h);cards.push(card);deckCount--;
 }
 function flipAt(point,w,h){
  const now=performance.now();if(now<flipCooldown)return;flipCooldown=now+450;
  let best=null,bestDistance=cardSize(w).w*.9;
  for(const card of cards){const d=Math.hypot(card.x-point.x,card.y-point.y);if(d<bestDistance){best=card;bestDistance=d}}
  if(best)best.faceUp=!best.faceUp;
 }
 function handleGesture(data){
  const kind=data.kind||'';
  const w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;
  const point=readPinch(w,h);lastPinch=point;
  if(kind==='grab'&&lastKind!=='grab'&&point)pickAt(point,w,h);
  if(kind==='palm'&&lastKind!=='palm')drawByPalm(w,h);
  if(kind==='inspect'&&lastKind!=='inspect'&&point)flipAt(point,w,h);
  if(kind!=='grab'&&lastKind==='grab'&&held){held.slot=-1;held.scale=1;held.faceUp=true;held=null}
  lastKind=kind;
 }
 function updateCards(dt,w,h){
  const point=readPinch(w,h);
  for(const card of cards){
   if(card===held){
    if(point){card.tx=point.x;card.ty=point.y;card.tang=0;card.scale=1.08;card.slot=-1}
    else{card.slot=-1;held=null}
   }else if(card.slot>=0){const slot=fanSlot(card.slot,w,h);card.tx=slot.x;card.ty=slot.y;card.tang=slot.ang;card.scale=1}
   const ease=1-Math.exp(-dt*9);
   card.x+=(card.tx-card.x)*ease;card.y+=(card.ty-card.y)*ease;card.ang+=(card.tang-card.ang)*ease;card.scale+=( (card===held?1.08:1)-card.scale)*ease;
  }
 }

 /* ---------- card drawing ---------- */
 function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
 function drawCardBack(cw,ch,alpha=1,held=false){
  ctx.save();ctx.globalAlpha=alpha;
  if(held){ctx.shadowColor='rgba(226,197,140,.8)';ctx.shadowBlur=22}
  else{ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=12;ctx.shadowOffsetY=5}
  const g=ctx.createLinearGradient(-cw/2,-ch/2,cw/2,ch/2);g.addColorStop(0,'#3d1922');g.addColorStop(.55,'#241319');g.addColorStop(1,'#160e12');
  roundRect(ctx,-cw/2,-ch/2,cw,ch,cw*.075);ctx.fillStyle=g;ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  ctx.strokeStyle='#b2925b';ctx.lineWidth=Math.max(1,cw*.018);ctx.stroke();
  roundRect(ctx,-cw*.42,-ch*.44,cw*.84,ch*.88,cw*.05);ctx.strokeStyle='rgba(208,180,124,.4)';ctx.lineWidth=.8;ctx.stroke();
  ctx.strokeStyle='rgba(208,180,124,.32)';ctx.lineWidth=.7;
  for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(-cw*.36,i*cw*.11);ctx.lineTo(cw*.36,i*cw*.11);ctx.stroke()}
  ctx.beginPath();ctx.arc(0,0,cw*.24,0,Math.PI*2);ctx.strokeStyle='rgba(226,198,142,.55)';ctx.lineWidth=1;ctx.stroke();
  ctx.beginPath();ctx.arc(0,0,cw*.18,0,Math.PI*2);ctx.strokeStyle='rgba(226,198,142,.28)';ctx.stroke();
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*cw*.06,Math.sin(a)*cw*.06);ctx.lineTo(Math.cos(a)*cw*.18,Math.sin(a)*cw*.18);ctx.strokeStyle='rgba(226,198,142,.45)';ctx.stroke()}
  ctx.fillStyle='rgba(238,216,168,.8)';ctx.beginPath();ctx.arc(0,0,cw*.03,0,Math.PI*2);ctx.fill();
  ctx.restore();
 }
 function drawCardFront(card,cw,ch){
  const img=card.art?.img;
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,.48)';ctx.shadowBlur=14;ctx.shadowOffsetY=6;
  roundRect(ctx,-cw/2,-ch/2,cw,ch,cw*.075);ctx.fillStyle='#16120d';ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  if(img&&img.complete&&img.naturalWidth){
   ctx.save();roundRect(ctx,-cw/2,-ch/2,cw,ch,cw*.075);ctx.clip();ctx.imageSmoothingEnabled=true;ctx.drawImage(img,-cw/2,-ch/2,cw,ch);ctx.restore();
  }else{
   ctx.fillStyle='#d8c59d';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${Math.max(10,cw*.14)}px SimSun,serif`;ctx.fillText(card.art?.name||'绘牌',0,-cw*.04);
   ctx.font=`${Math.max(7,cw*.075)}px SimSun,serif`;ctx.fillStyle='rgba(216,197,157,.6)';ctx.fillText('绘牌载入中',0,cw*.18);
  }
  ctx.strokeStyle='#b2925b';ctx.lineWidth=Math.max(1,cw*.018);roundRect(ctx,-cw/2,-ch/2,cw,ch,cw*.075);ctx.stroke();
  ctx.restore();
 }
 function drawDeck(w,h){
  const size=cardSize(w),deck=deckPoint(w,h);
  if(deckCount<=0)return;
  ctx.save();ctx.translate(deck.x,deck.y);ctx.rotate(-.12);
  const show=Math.min(6,Math.max(0,deckCount));
  for(let i=show-1;i>=0;i--){ctx.save();ctx.translate(0,-i*1.8);drawCardBack(size.w,size.h,1,false);ctx.restore()}
  ctx.restore();
  ctx.save();ctx.fillStyle='rgba(223,204,161,.66)';ctx.font=`${Math.max(8,size.w*.11)}px SimSun,serif`;ctx.textAlign='center';ctx.fillText('牌堆 · 张掌抽牌',deck.x,deck.y+size.h*.68);ctx.restore();
 }
 function drawCards(w,h){
  ensureCards(w,h);
  drawDeck(w,h);
  const ordered=cards.slice().sort((a,b)=>(a===held?1:0)-(b===held?1:0));
  for(const card of ordered){
   const size=cardSize(w);
   ctx.save();ctx.translate(card.x,card.y);ctx.rotate(card.ang);ctx.scale(card.scale,card.scale);
   if(card===held){ctx.shadowColor='rgba(226,197,140,.9)';ctx.shadowBlur=26}
   if(card.faceUp)drawCardFront(card,size.w,size.h);else drawCardBack(size.w,size.h,1,card===held);
   if(card===held){ctx.shadowBlur=0;ctx.strokeStyle='rgba(244,219,166,.92)';ctx.lineWidth=2;roundRect(ctx,-size.w*.53,-size.h*.53,size.w*1.06,size.h*1.06,size.w*.085);ctx.stroke()}
   ctx.restore();
  }
 }

 /* ---------- atmosphere ---------- */
 function drawFoolBackground(w,h){
  let unit=w<700?Math.min(h*1.05,w*2.2):Math.min(h*.9,w*.8),cx=w*(w<700?.69:.73),cy=h*.05;
  if(document.body.classList.contains('gesture-immersive')&&w<=900&&h>w){unit=Math.min(h*.64,w*1.15);cx=w*.5;cy=h*.015;}
  ctx.save();ctx.translate(cx,cy);ctx.scale(unit/500,unit/500);ctx.lineCap='round';ctx.lineJoin='round';
  for(const radius of [77,86,98])stroke(c=>{c.arc(0,66,radius,0,Math.PI*2);},'rgba(196,169,108,.3)',.7);
  for(let i=0;i<48;i++){const a=i/48*Math.PI*2;stroke(c=>{c.moveTo(Math.cos(a)*88,66+Math.sin(a)*88);c.lineTo(Math.cos(a)*(i%4===0?103:96),66+Math.sin(a)*(i%4===0?103:96));},'rgba(208,183,124,.42)',.7);}
  if(portrait.complete&&portrait.naturalWidth){ctx.save();ctx.filter='brightness(1.18) contrast(1.05)';ctx.drawImage(portrait,-235,-35,470,565);ctx.restore();}
  ctx.globalCompositeOperation='screen';
  for(const p of particles){const y=(p.y*520+(reduce?0:time*10))%520,x=p.x*(100+y*.32)+Math.sin(time*.5+p.phase)*5;ctx.globalAlpha=(.16+.25*Math.sin(time*.8+p.phase)**2)*(1-y/600);ctx.fillStyle='#c4ad79';ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;ctx.restore();
 }

 function frame(now){
  requestAnimationFrame(frame);
  const dt=previous?Math.min(.05,(now-previous)/1000):0;previous=now;
  if(!enabled||document.hidden||document.body.classList.contains('arrival-active'))return;
  if(!reduce)time+=dt;if(now-lastSeen>800&&lastKind==='grab'){if(held){held.slot=-1;held.scale=1;held=null}lastKind='lost'}
  const w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;
  ctx=background;ctx.clearRect(0,0,w,h);drawFoolBackground(w,h);
  canvas.dataset.sceneReady='1';
 }
 requestAnimationFrame(frame);setEnabled(study);
 return {setEnabled,input};
}
