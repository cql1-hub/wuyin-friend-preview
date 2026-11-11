import * as T from 'three';
// A visible local field for each relic, including a quiet standby state.
export function createRelicParticles(parent,reduce){
 const limit=innerWidth<720?420:840,positions=new Float32Array(limit*3),colors=new Float32Array(limit*3),tailPositions=new Float32Array(96*6);
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('color',new T.BufferAttribute(colors,3));
 function sprite(star=false){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#fff');g.addColorStop(.12,'#ffffff');g.addColorStop(.28,'#ffffff9a');g.addColorStop(.55,'#ffffff2b');g.addColorStop(1,'#ffffff00');x.fillStyle=g;x.fillRect(0,0,64,64);if(star){x.fillStyle='#ffffffe0';x.fillRect(30,13,4,38);x.fillRect(13,30,38,4);}return new T.CanvasTexture(c);}
 const dots=new T.Points(geometry,new T.PointsMaterial({map:sprite(),vertexColors:true,size:.105,transparent:true,opacity:.65,depthWrite:false,depthTest:false,blending:T.AdditiveBlending,toneMapped:false}));dots.renderOrder=8;parent.add(dots);
 const sparkGeo=new T.BufferGeometry();sparkGeo.setAttribute('position',geometry.attributes.position);const sparks=new T.Points(sparkGeo,new T.PointsMaterial({map:sprite(true),color:0xffe7b4,size:.16,transparent:true,opacity:.3,depthWrite:false,depthTest:false,blending:T.AdditiveBlending,toneMapped:false}));sparks.renderOrder=9;parent.add(sparks);
 const tailGeo=new T.BufferGeometry();tailGeo.setAttribute('position',new T.BufferAttribute(tailPositions,3));const tails=new T.LineSegments(tailGeo,new T.LineBasicMaterial({color:0xc9eaff,transparent:true,opacity:0,depthWrite:false,depthTest:false,blending:T.AdditiveBlending,toneMapped:false}));tails.renderOrder=7;parent.add(tails);
 const hash=n=>{const x=Math.sin(n)*43758.5453;return x-Math.floor(x)},seeds=Array.from({length:limit},(_,i)=>({a:i*2.39996323,r:hash(i*127.1+7),h:hash(i*269.5+3),v:.5+(i%11)/11})),palette=[new T.Color(0xadeaff),new T.Color(0xffd383),new T.Color(0xffdf9a),new T.Color(0xa5f2d8)];
 function path(i,t,s,index){const seed=seeds[i],q=s.charge,u=s.unfold,a=seed.a+t*(.15+q*1.1),h=seed.h;
  if(index===0){const wave=(h+t*.16)%1,r=q>.01?(1.7-h*q*1.3):(.58+wave*1.05+u*.35);return [Math.cos(a)*r*.72*(s.form?1.22:1),-.25+Math.sin(a)*r,.20+Math.sin(a*3+t)*(.1+u*.35)];}
  if(index===1){const cycle=a+t*(.4+u*.8),r=(.5+seed.r*.8)*(1-q*.65)+(s.form?.45:0);return [Math.cos(cycle)*r,-.95+Math.sin(cycle)*.3+(i%5===0?h*2.4:0),.5+Math.sin(cycle)*r*.65];}
  if(index===2){const k=i%5,slots=[[-1.25,.15],[-.65,.42],[0,.65],[.65,.42],[1.25,.15]],cx=slots[k][0]*(1-q*.9),cy=slots[k][1];const edge=h*4,dx=edge<1?-.46+edge*.92:edge<2?.46:edge<3?.46-(edge-2)*.92:-.46,dy=edge<1?-.75:edge<2?-.75+(edge-1)*1.5:edge<3?.75:.75-(edge-3)*1.5;return [cx+dx*(.7+u*.35),cy+dy*(.7+u*.35)+(s.form?u*Math.sin(k*1.3):0),.6+seed.r*.35+Math.sin(t+seed.a)*u*.2];}
  const rise=(h+t*.16)%1;return [(seed.r-.5)*(q>.01?1.5*(1-q*.7):2.25+u*.8)+Math.sin(t*.8+seed.a)*.13,-.9+rise*(1.65+u*1.4),.55+Math.cos(seed.a)*.38+rise*u*.3];
 }
 function update(s,{index,energy,time}){
  const u=reduce?(s.age>=0?1:0):s.unfold,q=s.charge,t=reduce?0:time,activity=Math.max(u,q,s.inspect*.85),count=Math.round(limit*(.32+.68*activity));const state={...s,unfold:u};geometry.setDrawRange(0,count);sparkGeo.setDrawRange(0,Math.min(count,Math.round(32+activity*96)));
  dots.visible=sparks.visible=true;dots.material.opacity=Math.min(1,.33+energy*.16+activity*.60);dots.material.size=.085+activity*.055;sparks.material.opacity=.10+activity*.28;sparks.material.color.copy(palette[index]);sparks.material.size=index===2?.14:.18;
  for(let i=0;i<count;i++){const p=path(i,t,state,index),offset=i*3,shimmer=reduce?.8:.6+.4*Math.sin(t*2.2+seeds[i].a);positions.set(p,offset);const c=palette[index];colors[offset]=c.r*shimmer;colors[offset+1]=c.g*shimmer;colors[offset+2]=c.b*shimmer;}
  geometry.attributes.position.needsUpdate=true;geometry.attributes.color.needsUpdate=true;geometry.computeBoundingSphere();sparkGeo.boundingSphere=geometry.boundingSphere;
  const trails=reduce?0:Math.round((index===3?38:96)*activity);tailGeo.setDrawRange(0,trails*2);tails.material.color.copy(palette[index]);tails.material.opacity=activity*(index===3?.32:.65);
  for(let i=0;i<trails;i++){const n=(i*7)%count;tailPositions.set(path(n,t,state,index),i*6);tailPositions.set(path(n,t-.10-q*.1,state,index),i*6+3);}tailGeo.attributes.position.needsUpdate=true;tailGeo.computeBoundingSphere();
  return {count,opacity:dots.material.opacity};
 }
 return {update};
}
