import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const TAU=Math.PI*2;

export function createRelicDomains(models,{mirror,book,gem,paper,cards}){
 const roots=models.map(m=>{const g=new T.Group();g.visible=false;m.add(g);return g;});
 const brass=new T.MeshStandardMaterial({color:'#9e8655',metalness:.9,roughness:.4});
 const iron=new T.MeshStandardMaterial({color:'#172125',metalness:.72,roughness:.51});
 const stone=new T.MeshStandardMaterial({color:'#313f40',metalness:.04,roughness:.88});
 const ivory=new T.MeshStandardMaterial({color:'#bdb19a',metalness:0,roughness:.95});
 const add=(parent,geo,mat,x=0,y=0,z=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;};
 function curve(parent,points,mat=brass,r=.018){return add(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),48,r,6,false),mat);}
 function ring(parent,r,mat=brass,t=.016){return add(parent,new T.TorusGeometry(r,t,8,128),mat);}
 function fitted(source,height){const o=source.clone(true);o.position.set(0,0,0);o.updateMatrixWorld(true);const b=new T.Box3().setFromObject(o),size=b.getSize(new T.Vector3());o.position.sub(b.getCenter(new T.Vector3()));const g=new T.Group();g.add(o);g.scale.setScalar(height/size.y);return g;}
 // Bake the closed notebook once; a bookcase must not repeat hundreds of paper-edge draw calls.
 const bookTemplate=new T.Group(),batches=new Map();book.updateWorldMatrix(true,true);const inverseBook=book.matrixWorld.clone().invert();
 book.traverse(o=>{if(o.isMesh){const source=o.geometry.index?o.geometry.toNonIndexed():o.geometry;const groups=Array.isArray(o.material)?source.groups:[{start:0,count:source.attributes.position.count,materialIndex:0}];for(const group of groups){const mat=Array.isArray(o.material)?o.material[group.materialIndex]:o.material;const g=new T.BufferGeometry();for(const name of ['position','normal','uv']){const a=source.attributes[name];g.setAttribute(name,new T.BufferAttribute(a.array.slice(group.start*a.itemSize,(group.start+group.count)*a.itemSize),a.itemSize));}g.applyMatrix4(new T.Matrix4().multiplyMatrices(inverseBook,o.matrixWorld));if(!batches.has(mat))batches.set(mat,[]);batches.get(mat).push(g);}}});
 for(const [mat,geometries] of batches)bookTemplate.add(new T.Mesh(mergeGeometries(geometries,false),mat));
 function pedestal(parent,x,z,r=.6,height=.65){
  const g=new T.Group();g.position.set(x,-2.05,z);parent.add(g);
  const profile=[new T.Vector2(r*.95,0),new T.Vector2(r,.08),new T.Vector2(r,.14),new T.Vector2(r*.72,.2),new T.Vector2(r*.68,height-.12),new T.Vector2(r*.9,height-.08),new T.Vector2(r*.92,height)];
  add(g,new T.LatheGeometry(profile,32),stone);
  for(const y of [.14,height-.08]){const band=ring(g,r*.92,brass,.012);band.rotation.x=Math.PI/2;band.position.y=y;}
  return g;
 }
 function arch(parent,width,height,mat=brass){return curve(parent,[[-width/2,-1.8,0],[-width/2,height*.25,0],[-width*.36,height*.68,0],[0,height,0],[width*.36,height*.68,0],[width/2,height*.25,0],[width/2,-1.8,0]],mat,.027);}
 // Mirror court: six actual silver mirrors flank the original, on matched carved stands.
 const mirrors=[];
 for(let i=0;i<6;i++){
  const side=i%2?1:-1,rank=Math.floor(i/2),frame=new T.Group();frame.position.set(side*(1.65+rank*.8),-.1-rank*.12,-.9-rank*.85);frame.rotation.y=-side*.17;roots[0].add(frame);
  const m=fitted(mirror,2.1-rank*.12);frame.add(m);m.position.y=.15;
  const stand=pedestal(frame,0,0,.6,.8);stand.position.y=-1.65;
  for(const x of [-.44,.44])curve(frame,[[x,-1.05,.03],[x,-.75,.02],[x*.75,-.62,.02]],brass,.035);
  mirrors.push({frame,rank,y:frame.position.y});
 }
 const mirrorGate=new T.Group();mirrorGate.position.set(0,.1,-3.5);roots[0].add(mirrorGate);
 for(let i=0;i<3;i++)arch(mirrorGate,5.1+i*.2,3.2+i*.15,i===1?iron:brass);
 const mirrorFloor=add(roots[0],new T.CylinderGeometry(4.7,4.8,.1,96),iron,0,-2.14,-1.4);
 for(const r of [3.9,4.3,4.6]){const band=ring(roots[0],r,brass,.012);band.rotation.x=Math.PI/2;band.position.set(0,-2.07,-1.4);}
 // Armillary: engraved latitude rings, a proper cradle, curved legs and a readable moving axis.
 const armillary=new T.Group();armillary.position.set(0,-.2,-.6);roots[1].add(armillary);
 const gimbals=[];
 for(let i=0;i<4;i++){
  const g=new T.Group(),r=ring(g,2.05+i*.08,brass,i===0?.045:.018);armillary.add(g);gimbals.push(g);
  const ticks=new T.InstancedMesh(new T.BoxGeometry(.013,.08,.014),brass,72),p=new T.Object3D();
  for(let j=0;j<72;j++){const a=j/72*TAU;p.position.set(Math.cos(a)*(2.05+i*.08),Math.sin(a)*(2.05+i*.08),0);p.rotation.z=a-Math.PI/2;p.scale.set(1,j%6===0?1.8:.75,1);p.updateMatrix();ticks.setMatrixAt(j,p.matrix);}g.add(ticks);
 }
 const axis=add(armillary,new T.CylinderGeometry(.025,.025,4.85,16),brass);axis.rotation.z=.25;
 const cradle=ring(roots[1],2.55,iron,.07);cradle.position.set(0,-.15,-.6);cradle.rotation.y=.2;
 pedestal(roots[1],0,-.6,1.4,.3);
 for(let i=0;i<3;i++){const a=i/3*TAU;curve(roots[1],[[Math.cos(a)*.45,-1.5,Math.sin(a)*.45-.6],[Math.cos(a)*1.4,-1.8,Math.sin(a)*1.4-.6],[Math.cos(a)*1.6,-2.05,Math.sin(a)*1.6-.6]],brass,.055);}
 const crystalMoons=Array.from({length:4},(_,i)=>{const c=fitted(gem,.24+i*.025);roots[1].add(c);return c;});
 // A paper-and-bronze imperial court: actual engraved panels instead of unconnected props.
 const court=new T.Group();court.position.z=-1;roots[2].add(court);
 for(let i=0;i<3;i++){const y=-2+i*.15;add(court,new T.CylinderGeometry(2.65-i*.3,2.72-i*.3,.15,8),iron,0,y,0);const band=ring(court,2.6-i*.3,brass,.014);band.rotation.x=Math.PI/2;band.position.y=y+.09;}
 const throne=new T.Group();throne.position.set(0,-1.5,-1.2);court.add(throne);
 add(throne,new T.BoxGeometry(1.35,.15,1.1),iron,0,.35,.1);add(throne,new T.BoxGeometry(1.32,2.85,.18),iron,0,1.75,-.38);
 for(const side of [-1,1]){curve(throne,[[side*.64,.35,.55],[side*.68,.8,.5],[side*.68,.9,-.3]],brass,.035);add(throne,new T.CylinderGeometry(.035,.035,3.3,12),brass,side*.7,1.7,-.4);}
 for(let i=-3;i<=3;i++)add(throne,new T.BoxGeometry(.018,2.6,.025),brass,i*.17,1.8,-.27);
 const crown=ring(throne,.3,brass,.02);crown.position.set(0,3.25,-.28);
 const pillars=[];
 for(const side of [-1,1])for(let i=0;i<3;i++){
  const bay=new T.Group();bay.position.set(side*(2.3+i*.52),-.1,-1.2-i*.75);bay.rotation.y=-side*.25;court.add(bay);
  arch(bay,1.35,3.5,brass);arch(bay,1.17,3.3,iron);pillars.push(bay);
  const face=cards[(i+(side>0?3:0))%5].children.find(o=>o.isMesh).material[4].map;
  const etched=new T.MeshStandardMaterial({map:face,color:'#8a7b60',metalness:.18,roughness:.8});
  add(bay,new T.BoxGeometry(1.12,2.55,.07),[iron,iron,iron,iron,etched,iron],0,.5,-.06);
  for(const x of [-.69,.69]){add(bay,new T.CylinderGeometry(.045,.07,3.5,12),brass,x,-.05,0);pedestal(bay,x,0,.16,.25);}
 }
 // Book archive: the new notebook supplies every volume; shelves are built around them.
 const archive=new T.Group();archive.position.set(0,-.05,-1.4);roots[3].add(archive);
 const bays=[],volumes=[];
 for(const side of [-1,1]){
  const bay=new T.Group();bay.position.set(side*2.55,-1.4,-.8);bay.rotation.y=-side*.28;archive.add(bay);bays.push(bay);
  for(const x of [-.92,.92]){add(bay,new T.BoxGeometry(.1,3.7,.64),iron,x,1.7,0);curve(bay,[[x-.04,-.1,.35],[x-.04,3.5,.35]],brass,.009);}
  for(let row=0;row<4;row++){
   add(bay,new T.BoxGeometry(1.94,.07,.68),iron,0,row*.95,0);curve(bay,[[-.95,row*.95+.04,.36],[.95,row*.95+.04,.36]],brass,.009);
   for(let j=0;j<6;j++){const b=fitted(bookTemplate,.7);b.rotation.y=Math.PI/2;b.position.set((j-2.5)*.28,row*.95+.4,.03);bay.add(b);volumes.push(b);}
  }
  arch(bay,1.95,4.1,brass);
 }
 const portalFrame=new T.Group();portalFrame.position.set(0,.2,-3.6);archive.add(portalFrame);arch(portalFrame,3.4,3.8,brass);arch(portalFrame,3.16,3.6,iron);
 const scrolls=[];
 for(let i=0;i<12;i++){
  const g=new T.PlaneGeometry(.44,.66,10,5),p=g.attributes.position;for(let j=0;j<p.count;j++)p.setZ(j,Math.sin(p.getX(j)*7)*.05);g.computeVertexNormals();
  const mat=paper.clone();mat.side=T.DoubleSide;const m=add(archive,g,mat);scrolls.push(m);
 }
 const steps=[];for(let i=0;i<6;i++){const step=add(archive,new T.BoxGeometry(1.3-i*.08,.055,.48),ivory,0,-2+i*.14,1.7-i*.65);step.rotation.y=Math.sin(i*.5)*.12;steps.push(step);}
 // Far architecture stays behind the moving objects and makes each domain a complete space.
 for(const side of [-1,1]){
  const column=new T.Group();column.position.set(side*3.7,0,-3.8);roots[0].add(column);
  add(column,new T.CylinderGeometry(.13,.22,4.6,20),stone,0,.4,0);pedestal(column,0,0,.38,.35);
  for(let n=0;n<12;n++){const a=n/12*TAU;add(column,new T.CylinderGeometry(.012,.012,4.25,6),brass,Math.cos(a)*.145,.4,Math.sin(a)*.145);}
  const decoration=ring(column,.32,brass,.014);decoration.position.y=2.78;
  const bay=bays[side<0?0:1].clone(true);bay.position.set(side*3.35,-1.4,-2.65);bay.rotation.y=-side*.4;archive.add(bay);
 }
 const distantArch=new T.Group();distantArch.position.set(0,.2,-4.9);roots[0].add(distantArch);
 for(let i=0;i<4;i++)arch(distantArch,7.2+i*.16,3.8+i*.12,i%2?iron:brass);
 const zodiac=new T.Group();zodiac.position.set(0,-2.02,-.6);roots[1].add(zodiac);
 for(const radius of [2.95,3.05,3.18]){const r=ring(zodiac,radius,brass,.012);r.rotation.x=Math.PI/2;}
 const marks=new T.InstancedMesh(new T.BoxGeometry(.012,.012,.13),brass,96),markPose=new T.Object3D();
 for(let i=0;i<96;i++){const a=i/96*TAU;markPose.position.set(Math.cos(a)*3.02,.01,Math.sin(a)*3.02);markPose.rotation.y=-a;markPose.scale.set(1,1,i%8===0?2:.7);markPose.updateMatrix();marks.setMatrixAt(i,markPose.matrix);}zodiac.add(marks);
 for(let i=0;i<12;i++){const a=i/12*TAU;const star=add(zodiac,new T.OctahedronGeometry(.055),brass,Math.cos(a)*2.85,.03,Math.sin(a)*2.85);star.rotation.y=a;}
 for(let i=0;i<5;i++){const step=add(court,new T.BoxGeometry(5-i*.35,.11,.45),stone,0,-2.15+i*.12,1.8-i*.42);step.rotation.y=0;}
 for(const side of [-1,1]){
  const wing=new T.Group();wing.position.set(side*3.7,-.2,-3.8);wing.rotation.y=-side*.2;court.add(wing);
  for(let i=0;i<3;i++)arch(wing,1.3+i*.15,3.4+i*.16,i===1?iron:brass);
  for(let i=0;i<5;i++){const bar=add(wing,new T.CylinderGeometry(.014,.014,2.7,8),brass,(i-2)*.2,.1,0);bar.rotation.z=(i-2)*-.04;}
 }
 const values=[0,0,0,0];
 const frames=roots.map(g=>{g.updateWorldMatrix(true,true);const b=new T.Box3().setFromObject(g),size=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3());return {size:size.toArray(),center:center.toArray()};});
 frames[1]={size:[7,7,4],center:[0,-.2,-.6]};
 function update(s,{index,form,energy,time,reduce,dt}){
  roots.forEach((g,i)=>{if(i!==index||!form){g.visible=false;values[i]=0;}});
  if(!form)return {amount:0,objects:0};
  const u=reduce?(s.age>=0?1:0):s.unfold,desired=T.MathUtils.clamp(.2+energy*.55+u*.6+s.charge*.3,0,1);values[index]+=(desired-values[index])*(reduce?1:1-Math.exp(-dt*4));const v=values[index],t=reduce?0:time,g=roots[index];g.visible=true;
  if(index===0){mirrors.forEach(({frame,rank,y})=>{frame.position.y=y-(1-v)*(1+rank*.35);frame.rotation.y=Math.sign(frame.position.x)*(-.1-v*.08);});mirrorGate.position.y=.1-(1-v)*1.3;mirrorFloor.rotation.y=Math.sin(t*.08)*.008;}
  if(index===1){gimbals.forEach((r,i)=>r.rotation.set(.3+i*.55+t*(.025+i*.008),i*.6+t*.035,i*.31+s.charge*.2));crystalMoons.forEach((c,i)=>{const a=i/4*TAU+t*.17;c.position.set(Math.cos(a)*3.1,Math.sin(a)*2.9-.2,Math.sin(a)*.7-.6);c.rotation.y=-a;});cradle.rotation.z=.12;}
  if(index===2){pillars.forEach((p,i)=>p.position.y=-.1-(1-T.MathUtils.clamp(v*1.5-i*.06,0,1))*2.2);court.position.y=-(1-v)*.7;throne.rotation.y=0;}
  if(index===3){bays.forEach((b,i)=>{b.position.x=(i?1:-1)*(1.7+v*.85);b.position.y=-1.4-(1-v);});scrolls.forEach((m,i)=>{const a=i/12*TAU+t*.15;m.position.set(Math.cos(a)*1.75,Math.sin(a)*1.7+.35,-.1+Math.sin(a*2)*.4);m.rotation.set(Math.sin(a)*.2,a*.25,Math.cos(a)*.35);});steps.forEach((p,i)=>p.position.y=-2+i*.14-(1-v)*.6);portalFrame.position.y=.2-(1-v)*1.5;}
  return {amount:v,objects:g.children.length,frame:frames[index]};
 }
 return {update};
}
