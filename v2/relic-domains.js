import * as T from 'three';
const TAU=Math.PI*2,clamp=T.MathUtils.clamp;
const vertex=`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
// Four distinct translucent fields, built without screen-wide bloom or opaque overlays.
const fragment=`
uniform float time, strength, kind; uniform vec3 tint; varying vec2 vUv;
float line(float d,float w){return 1.-smoothstep(w,w+0.007,abs(d));}
void main(){
 vec2 p=(vUv-.5)*2.; float r=length(p),a=atan(p.y,p.x),t=time;
 float veil=0.;
 if(kind<.5){
  float wave=sin(a*7.+r*20.-t*.8)*.028;
  veil=line(r+wave-.73,.008)*.65+line(r+wave-.84,.002)*.4;
  veil+=pow(max(0.,1.-r),3.)*(.14+.12*sin(p.y*18.+sin(p.x*7.+t)*2.-t));
  veil+=pow(max(0.,sin(a*14.+t*.2)),22.)*(1.-smoothstep(.55,.95,r))*.13;
 }else if(kind<1.5){
  veil=line(r-.82,.002)*.7+line(r-.70,.001)*.32;
  float longitude=abs(sin(a*12.));veil+=line(longitude, .009)*smoothstep(.67,.75,r)*(1.-smoothstep(.83,.88,r))*.8;
  veil+=line(length(p*vec2(1.,2.8))-.74,.003)*.35;
  veil+=pow(max(0.,sin(a*3.+r*10.-t*.18)),16.)*(1.-smoothstep(.1,1.,r))*.08;
 }else if(kind<2.5){
  float x=p.x+sin(p.y*2.-t*.15)*.025;
  float ray=pow(max(0.,cos(x*20.)),28.);veil=ray*(1.-smoothstep(.3,1.,abs(p.y)))*.38;
  veil+=line(abs(p.x)+p.y*.17-.58,.004)*smoothstep(-1.,-.5,p.y)*.45;
  veil+=pow(max(0.,1.-length(p-vec2(0.,.65))),6.)*.48;
 }else{
  float arch=length(vec2(p.x,p.y*.8+.05));
  veil=line(arch-.76+sin(a*8.-t*.4)*.016,.006)*.6;
  veil+=line(arch-.83,.002)*.3;
  veil+=pow(max(0.,sin(p.y*22.+p.x*7.+sin(p.x*8.+t*.2))),24.)*(1.-smoothstep(.1,.8,abs(p.x)))*.14;
 }
 float edge=1.-smoothstep(.9,1.,length(p));
 gl_FragColor=vec4(tint,clamp(veil*edge*strength,0.,.65));
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
function field(kind,color,w,h){return new T.Mesh(new T.PlaneGeometry(w,h),new T.ShaderMaterial({uniforms:{time:{value:0},strength:{value:0},kind:{value:kind},tint:{value:new T.Color(color)}},vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}));}
function mist(){return new T.Mesh(new T.PlaneGeometry(11,11,1,1),new T.ShaderMaterial({uniforms:{time:{value:0},strength:{value:0}},vertexShader:vertex,fragmentShader:`uniform float time,strength;varying vec2 vUv;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+1.),f.x),f.y);}void main(){vec2 p=(vUv-.5)*2.;float n=noise(p*4.+vec2(time*.08,-time*.035))*.6+noise(p*9.-time*.03)*.3;float edge=1.-smoothstep(.55,1.,length(p));gl_FragColor=vec4(vec3(.43,.53,.58),pow(n,1.4)*edge*strength*.66);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>}`,transparent:true,depthWrite:false,side:T.DoubleSide}));}
function metal(color){return new T.MeshStandardMaterial({color,metalness:.82,roughness:.27,emissive:color,emissiveIntensity:.015});}
function path(points,material,radius=.012){return new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),64,radius,5,false),material);}
function ring(radius,material,tube=.012){return new T.Mesh(new T.TorusGeometry(radius,tube,6,128),material);}
function fitted(source,height){const o=source.clone(true),b=new T.Box3().setFromObject(o),s=b.getSize(new T.Vector3()),c=b.getCenter(new T.Vector3());const g=new T.Group();o.position.sub(c);g.add(o);g.scale.setScalar(height/s.y);return g;}
function inscription(text,color){const c=document.createElement('canvas');c.width=256;c.height=1024;const x=c.getContext('2d');x.textAlign='center';x.fillStyle=color;x.font='30px SimSun';[...text].forEach((s,i)=>x.fillText(s,128,90+i*63));const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return new T.Mesh(new T.PlaneGeometry(.36,2.1),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}));}
function ribbon(radius,height,turns,material){const points=[];for(let i=0;i<=100;i++){const t=i/100,a=t*TAU*turns;points.push(new T.Vector3(Math.cos(a)*radius,(t-.5)*height,Math.sin(a)*radius));}return path(points,material,.014);}
function pointedArch(w,h,material){const shape=new T.Shape(),trace=(p,width,height)=>{p.moveTo(-width/2,-height/2);p.lineTo(-width/2,height*.08);p.bezierCurveTo(-width/2,height*.30,-width*.22,height*.43,0,height/2);p.bezierCurveTo(width*.22,height*.43,width/2,height*.30,width/2,height*.08);p.lineTo(width/2,-height/2);p.closePath();};trace(shape,w,h);const hole=new T.Path();trace(hole,w-.24,h-.27);shape.holes.push(hole);return new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1,curveSegments:12}),material);}
function shelvedBooks(source){const group=new T.Group(),sample=fitted(source,.48),size=new T.Box3().setFromObject(sample).getSize(new T.Vector3());sample.scale.x*=.13/size.x;sample.scale.z*=.32/size.z;sample.updateMatrixWorld(true);sample.traverse(mesh=>{if(!mesh.isMesh)return;const inst=new T.InstancedMesh(mesh.geometry,mesh.material,50),pose=new T.Object3D(),matrix=new T.Matrix4();for(let i=0;i<50;i++){pose.position.set((i%10-4.5)*.15,-1.4+Math.floor(i/10)*.61,.18);pose.rotation.z=Math.sin(i*2.1)*.045;pose.scale.set(1,.82+(i%4)*.055,1);pose.updateMatrix();matrix.multiplyMatrices(pose.matrix,mesh.matrixWorld);inst.setMatrixAt(i,matrix);inst.setColorAt(i,new T.Color([0x9baea1,0xa29c7e,0x8b9da6,0xa9917f][i%4]));}group.add(inst);});return group;}

export function createRelicDomains(models,{mirror,book,gem,paper,chair,shelf,door}){
 const mobile=matchMedia('(max-width: 850px)').matches,roots=models.map(m=>{const g=new T.Group();g.visible=false;m.add(g);return g;});
 const silver=metal(0xa7cbd8),gold=metal(0xc7a56b),ink=metal(0xaba1ac);
 const fields=roots.map((g,i)=>{const f=field(i,[0x83cbe8,0xeec47a,0xe6bc72,0xb3a5bb][i],7.6,6.4);f.position.set(0,.2,-2.9);g.add(f);return f;});

 // ARRODES: an actual fog court. The central throne is privileged; six lesser seats answer it.
 const court=new T.Group();roots[0].add(court);const seats=[];
 for(let i=0;i<7;i++){
  const main=i===0,side=i%2?1:-1,rank=Math.ceil(i/2),seat=new T.Group();
  const throne=fitted(chair,main?3.25:2.05);throne.position.y=main?-.12:-.55;
  throne.traverse(o=>{if(o.isMesh){const source=o.material;o.material=source.clone();o.material.onBeforeCompile=source.onBeforeCompile;o.material.color.setHex(main?0x9badbf:0x617a90);o.material.emissive=new T.Color(main?0x263c53:0x101b29);o.material.emissiveIntensity=.12;}});
  seat.add(throne);
  if(!main){const m=fitted(mirror,1.05);m.traverse(o=>{if(o.isMesh&&o.material.isMeshPhysicalMaterial){o.material=o.material.clone();o.material.emissiveIntensity=.09;}});m.position.set(0,-.05,.5);seat.add(m);}
  seat.userData={main,side,rank};seat.position.set(main?0:side*(1.35+rank*.76),0,main?-.9:-.5-rank*.95);court.add(seat);seats.push(seat);
 }
 const mirrorFloor=field(0,0x91b6cb,9,9);mirrorFloor.rotation.x=-Math.PI/2;mirrorFloor.position.set(0,-1.98,-1.5);roots[0].add(mirrorFloor);
 const mistLayers=Array.from({length:3},(_,i)=>{const f=mist();f.rotation.x=-Math.PI/2;f.position.set(0,-1.87+i*.36,-1.2);roots[0].add(f);return f;});
 const mainHalo=field(0,0xc4e9ff,4.3,5);mainHalo.position.set(0,.35,-.45);roots[0].add(mainHalo);
 const throneLight=new T.PointLight(0xb8e2ff,0,6,2);throneLight.position.set(0,1.2,1.2);roots[0].add(throneLight);

 // PENDULUM: a moving brass armillary, engraved divisions, star connections and crystal moons.
 const sphere=new T.Group();sphere.position.y=-.15;roots[1].add(sphere);
 const gimbals=Array.from({length:5},(_,i)=>{const g=new T.Group(),r=ring(2.02+i*.055,gold,i===0?.024:.011);g.add(r);const ticks=new T.InstancedMesh(new T.BoxGeometry(1,1,.012),gold,48),pose=new T.Object3D();for(let j=0;j<48;j++){const a=j/48*TAU;pose.position.set(Math.cos(a)*(2.02+i*.055),Math.sin(a)*(2.02+i*.055),0);pose.rotation.z=a-Math.PI/2;pose.scale.set(j%4===0?.018:.009,j%4===0?.13:.06,1);pose.updateMatrix();ticks.setMatrixAt(j,pose.matrix);}g.add(ticks);sphere.add(g);return g;});
 const stars=[];for(let i=0;i<(mobile?9:15);i++){const a=i*2.39996,y=1.8-i*.25,r=Math.sqrt(Math.max(.1,4-y*y)),p=new T.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);stars.push(p);const s=new T.Mesh(new T.OctahedronGeometry(i%4===0?.065:.029),new T.MeshBasicMaterial({color:0xffe0a0}));s.position.copy(p);sphere.add(s);}
 const starLines=new T.Line(new T.BufferGeometry().setFromPoints(stars),new T.LineBasicMaterial({color:0xd9b979,transparent:true,opacity:.32}));sphere.add(starLines);
 const moons=Array.from({length:4},(_,i)=>{const g=fitted(gem,.22+i*.04);roots[1].add(g);return g;});
 const meridian=ring(2.55,gold,.009);meridian.rotation.x=Math.PI/2;meridian.position.y=-1.85;roots[1].add(meridian);
 const starFloor=field(1,0xe5c483,9,9);starFloor.rotation.x=-Math.PI/2;starFloor.position.set(0,-1.81,-1);roots[1].add(starFloor);
 const sky=new T.Group();roots[1].add(sky);for(let i=0;i<3;i++){const dome=ring(3.7+i*.2,gold,.006);dome.rotation.set(.3+i*.53,i*.8,.2+i*.4);dome.position.z=-1.3;sky.add(dome);}

 // BLACK EMPEROR: a suspended court, vaulted ribs and descending laws.
 const vaults=[];
 for(let i=0;i<7;i++){const a=(i/6-.5)*Math.PI*1.12,x=Math.sin(a)*2.65,z=-.8-Math.cos(a)*1.5;const column=new T.Group();const pts=[new T.Vector2(.14,0),new T.Vector2(.13,.1),new T.Vector2(.065,.18),new T.Vector2(.055,2.5),new T.Vector2(.12,2.58),new T.Vector2(.15,2.64)];column.add(new T.Mesh(new T.LatheGeometry(pts,8),gold));column.position.set(x,-1.6,z);const rib=path([new T.Vector3(),new T.Vector3(-x*.15,1,0),new T.Vector3(-x*.7,1.8,-z*.25),new T.Vector3(-x,2.1,-z*.6)],gold,.024);rib.position.y=2.6;column.add(rib);roots[2].add(column);vaults.push(column);}
 const laws=['秩序之下皆为臣属','扭曲此间既定之律','以威严敕令现实','混乱重归帝国之序'].map((text,i)=>{const m=inscription(text,'#e2c183');m.position.set((i-1.5)*1.22,.15,-.9-Math.abs(i-1.5)*.2);roots[2].add(m);return m;});
 const crown=new T.Group();crown.position.set(0,2.3,-1.5);for(let i=0;i<12;i++){const a=i/12*TAU,p=new T.Mesh(new T.ConeGeometry(.07,i%2?.23:.4,4),gold);p.position.set(Math.cos(a)*.56,0,Math.sin(a)*.56);crown.add(p);}const band=ring(.56,gold,.025);band.rotation.x=Math.PI/2;crown.add(band);roots[2].add(crown);
 const imperialArchitecture=new T.Group();for(let i=0;i<5;i++){const a=(i-2)*.34,arch=pointedArch(1.55,4.7,metal(0x29313c));arch.position.set(Math.sin(a)*4.7,.55,-2.5-Math.cos(a)*.4);arch.rotation.y=-a*.7;imperialArchitecture.add(arch);}roots[2].add(imperialArchitecture);
 const lawFloor=field(2,0xd3a768,8,7);lawFloor.rotation.x=-Math.PI/2;lawFloor.position.set(0,-1.95,-1);roots[2].add(lawFloor);

 // ANTIGONUS: books become a curved airborne library, with a woven paper/ink passage.
 const volumes=[];for(let i=0;i<(mobile?12:18);i++){const b=fitted(book,.58+(i%3)*.13);const a=(i/(mobile?12:18))*TAU;b.userData={a,row:i%3};roots[3].add(b);volumes.push(b);}
 const shelves=Array.from({length:3},(_,i)=>{const pts=[];for(let j=0;j<=48;j++){const a=Math.PI*.08+j/48*Math.PI*.84;pts.push(new T.Vector3(Math.cos(a)*3,-1.2+i*1.1,-1.2-Math.sin(a)*1.6));}const group=new T.Group();group.add(path(pts,metal(0x514854),.07));const trim=path(pts,silver,.009);trim.position.y=.075;group.add(trim);roots[3].add(group);return group;});
 const archiveFloor=field(3,0xb3a5bb,9,8);archiveFloor.rotation.x=-Math.PI/2;archiveFloor.position.set(0,-2.1,-1);roots[3].add(archiveFloor);
 const archiveArchitecture=new T.Group();for(const side of [-1,1])for(let depth=0;depth<2;depth++){const s=fitted(shelf,3.6);s.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.color.setHex(0x514950);o.material.roughness=.86;}});const bay=new T.Group();bay.add(s);if(!depth)bay.add(shelvedBooks(book));bay.position.set(side*(2.7+depth*.75),-.25,-.7-depth*1.7);bay.rotation.y=-side*(.2+depth*.08);archiveArchitecture.add(bay);}const gate=fitted(door,5.5);gate.position.set(0,.5,-4.1);archiveArchitecture.add(gate);roots[3].add(archiveArchitecture);
 const helices=[ribbon(2.2,4.1,1.25,ink),ribbon(2.32,3.8,1.25,silver)];helices[1].rotation.y=Math.PI;roots[3].add(...helices);
 const scripts=['隐秘之语记于残篇','历史迷雾覆住归途','勿向无名之门回望'].map((text,i)=>{const m=inscription(text,'#c4b8cb');m.position.set((i-1)*1.6,.2,-1.4);roots[3].add(m);return m;});
 const sheets=[];for(let i=0;i<(mobile?6:10);i++){const geo=new T.PlaneGeometry(.42,.64,10,8),pos=geo.attributes.position;for(let j=0;j<pos.count;j++)pos.setZ(j,Math.sin(pos.getX(j)*7)*.07);geo.computeVertexNormals();const mat=paper.clone();mat.side=T.DoubleSide;const m=new T.Mesh(geo,mat);m.userData.a=i/(mobile?6:10)*TAU;roots[3].add(m);sheets.push(m);}
 const values=[0,0,0,0];
 const frames=[
  {size:[10.1,6.1,6],center:[0,.1,-1.8]},
  {size:[8.6,6.7,5.6],center:[0,0,-.7]},
  {size:[9.4,6.3,6],center:[0,.25,-1.6]},
  {size:[9.2,6.3,6.6],center:[0,.15,-1.9]}
 ];
 function update(s,{index,form,energy,time,reduce,dt}){
  // Switching to the original form removes its entire environment immediately; no stale realms.
  roots.forEach((g,i)=>{if(i!==index||!form){g.visible=false;values[i]=0;}});
  if(!form)return {amount:0,objects:0};
  const u=reduce?(s.age>=0?1:0):s.unfold,desired=clamp(Math.max(0,(energy-.18)*.72,u,s.charge*.31),0,1);
  values[index]+=(desired-values[index])*(reduce?1:1-Math.exp(-dt*4));const v=values[index],t=reduce?0:time,g=roots[index];g.visible=v>.015;g.scale.setScalar(.24+v*.76);
  const f=fields[index];f.material.uniforms.time.value=t;f.material.uniforms.strength.value=.35+v*.65;
  if(index===0){seats.forEach((p,i)=>{const {main,side,rank}=p.userData;const emerge=clamp(v*1.8-rank*.13,0,1);p.position.y=-2.1*(1-emerge);p.scale.setScalar(.5+emerge*.5);p.rotation.y=main?0:-side*(.15+rank*.055);});mirrorFloor.material.uniforms.time.value=t;mirrorFloor.material.uniforms.strength.value=v;mistLayers.forEach((f,i)=>{f.material.uniforms.time.value=t+i*13;f.material.uniforms.strength.value=v;f.rotation.z=t*(i%2?-.018:.018);});mainHalo.material.uniforms.time.value=t;mainHalo.material.uniforms.strength.value=.5+v;throneLight.intensity=4+v*10+u*8;}
  if(index===1){gimbals.forEach((r,i)=>r.rotation.set(.3+i*.53+t*(.025+i*.008)*(1+u),i*.6+t*.045,i*.31+s.charge*.3));sphere.rotation.y=t*.045;moons.forEach((m,i)=>{const a=i/4*TAU+t*(.18+u*.13);m.position.set(Math.cos(a)*2.55,Math.sin(a)*1.85,Math.sin(a*1.5)*.8);m.rotation.y=-a;});meridian.rotation.z=t*.08;sky.rotation.y=t*.013;starFloor.material.uniforms.time.value=t;starFloor.material.uniforms.strength.value=v;}
  if(index===2){vaults.forEach((c,i)=>{const stagger=clamp(v*1.6-i*.06,0,1);c.scale.y=.3+stagger*.7;c.rotation.y=(i-3)*.06*s.charge;});laws.forEach((m,i)=>{m.position.set((i-1.5)*1.5,.2+Math.sin(t*.45+i)*.09+u*.22,-.5);m.rotation.y=(i-1.5)*-.16;m.material.opacity=.25+v*.65;});crown.rotation.y=t*.13;crown.position.y=1.9+v*.45;imperialArchitecture.scale.y=.5+v*.5;lawFloor.material.uniforms.time.value=t;lawFloor.material.uniforms.strength.value=v;}
  if(index===3){const columns=mobile?4:6;volumes.forEach((b,i)=>{const row=Math.floor(i/columns),a=Math.PI*.08+(i%columns)/(columns-1)*Math.PI*.84;b.position.set(Math.cos(a)*3,-.85+row*1.1+Math.sin(t*.4+i)*.025,-1.2-Math.sin(a)*1.6);b.rotation.set(.05*Math.sin(t*.3+i),a-Math.PI/2,Math.sin(i*2.3)*.13+u*Math.sin(t+i)*.06);});shelves.forEach((s,i)=>s.position.y=-(1-v)*(i+1)*.3);helices.forEach((r,i)=>r.rotation.y=(i?Math.PI:0)+t*(i?-.06:.06));scripts.forEach((m,i)=>{m.material.opacity=.2+v*.55;m.position.y=.15+Math.sin(t*.3+i)*.13;});sheets.forEach((m,i)=>{const a=m.userData.a+t*.16;m.position.set(Math.cos(a)*1.7,Math.sin(a)*1.6,-.15+Math.sin(a*2)*.5);m.rotation.set(Math.sin(a)*.3,a*.35,Math.cos(a)*.4);});archiveFloor.material.uniforms.time.value=t;archiveFloor.material.uniforms.strength.value=v;}
  return {amount:v,objects:g.visible?g.children.length:0,frame:frames[index]};
 }
 return {update};
}

