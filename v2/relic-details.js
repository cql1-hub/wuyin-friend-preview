import * as T from 'three';

export function rebuildPendulum(pivot){
 pivot.children.forEach(c=>c.visible=false);
 const silver=new T.MeshStandardMaterial({color:0x9ca6ad,metalness:1,roughness:.26});
 const socket=new T.MeshStandardMaterial({color:0x877a5d,metalness:.95,roughness:.32});
 const holding=new T.Mesh(new T.TorusGeometry(.135,.016,10,64),silver);holding.position.y=.12;pivot.add(holding);
 for(let i=0;i<32;i++){
  const link=new T.Mesh(new T.TorusGeometry(.038,.009,8,20),silver);link.scale.y=1.5;link.position.y=-.075-i*.061;link.rotation.y=i%2*Math.PI/2;pivot.add(link);
 }
 const bail=new T.Mesh(new T.TorusGeometry(.06,.012,8,24),silver);bail.position.y=-2.03;pivot.add(bail);
 const cap=new T.Mesh(new T.CylinderGeometry(.065,.23,.14,32),socket);cap.position.y=-2.15;pivot.add(cap);
 const positions=[],sections=[[0,.095],[-.055,.19],[-.12,.245],[-.25,.225],[-.66,.165],[-.95,0]],N=12;
 for(let j=0;j<sections.length-1;j++)for(let i=0;i<N;i++){
  const point=(row,n)=>{const a=n/N*Math.PI*2+Math.PI/12+(row===3?Math.PI/N:0);return [Math.cos(a)*sections[row][1],sections[row][0],Math.sin(a)*sections[row][1]];};
  for(const p of [point(j,i),point(j+1,i),point(j,i+1),point(j,i+1),point(j+1,i),point(j+1,i+1)])positions.push(...p);
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.computeVertexNormals();
 const crystal=new T.Mesh(geo,new T.MeshPhysicalMaterial({color:0xfff1cd,metalness:0,roughness:.045,transmission:.96,thickness:.55,ior:1.548,dispersion:.008,attenuationColor:0xe9b64b,attenuationDistance:1.1,envMapIntensity:1.0}));crystal.position.y=-2.23;pivot.add(crystal);
 crystal.name='CitrinePrecisionCut';
 for(let i=0;i<16;i++){
  const a=i/16*Math.PI*2,bead=new T.Mesh(new T.SphereGeometry(.012,8,6),socket);bead.position.set(Math.cos(a)*.195,-2.19,Math.sin(a)*.195);pivot.add(bead);
  const flute=new T.Mesh(new T.CylinderGeometry(.007,.007,.07,6),silver);flute.position.set(Math.cos(a)*.15,-2.14,Math.sin(a)*.15);pivot.add(flute);
 }
 for(let i=0;i<4;i++){
  const a=i*Math.PI/2+Math.PI/4;
  const points=[new T.Vector3(Math.cos(a)*.19,-2.13,Math.sin(a)*.19),new T.Vector3(Math.cos(a)*.225,-2.3,Math.sin(a)*.225),new T.Vector3(Math.cos(a)*.21,-2.4,Math.sin(a)*.21)];
  pivot.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),12,.012,6,false),socket));
 }
 return crystal;
}

export function rebuildCard(card,art,index){
 const w=.9,h=1.5,r=.045,s=new T.Shape();
 s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
 const g=new T.ExtrudeGeometry(s,{depth:.009,bevelEnabled:true,bevelSize:.003,bevelThickness:.002,bevelSegments:2,steps:1,curveSegments:8});g.translate(0,0,-.0045);
 const uv=g.attributes.uv,p=g.attributes.position;
 for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+w/2)/w,(p.getY(i)+h/2)/h);
 g.clearGroups();const n=g.attributes.normal;
 for(let i=0;i<p.count;i+=3)g.addGroup(i,3,n.getZ(i)>.9?4:n.getZ(i)<-.9?5:0);
 card.geometry.dispose();card.geometry=g;
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=1280;
 const c=canvas.getContext('2d');
 if(art)c.drawImage(art,0,0,768,1280);
 else{
  c.fillStyle='#101b20';c.fillRect(0,0,768,1280);c.strokeStyle='#b7a179';c.lineWidth=3;c.strokeRect(35,35,698,1210);c.lineWidth=1;c.strokeRect(48,48,672,1184);
  c.save();c.translate(384,640);c.rotate(index*Math.PI/4);
  for(let k=0;k<3;k++){c.beginPath();c.ellipse(0,0,170+k*22,265+k*22,0,0,Math.PI*2);c.stroke();}
  for(let k=0;k<12;k++){const a=k/12*Math.PI*2;c.beginPath();c.moveTo(Math.cos(a)*135,Math.sin(a)*230);c.lineTo(Math.cos(a+Math.PI*.83)*135,Math.sin(a+Math.PI*.83)*230);c.stroke();}c.restore();
  c.fillStyle='#b7a179';c.textAlign='center';c.font='30px SimSun';c.fillText(['律令','秩序','','扭曲','威严'][index],384,1100);
 }
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
 card.material[4]=new T.MeshStandardMaterial({map,roughness:.83,metalness:0});
 if(index===2){
  const gold={value:0};card.userData.gold=gold;
  card.material[4].onBeforeCompile=shader=>{
   shader.uniforms.cardGold=gold;
   shader.fragmentShader='uniform float cardGold;\n'+shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\nfloat ash=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));diffuseColor.rgb=mix(vec3(ash*.88),diffuseColor.rgb,cardGold);');
  };
 }
 card.material[5].metalness=0;card.material[5].roughness=.88;
 card.material[0]=new T.MeshStandardMaterial({color:0xb4a48a,roughness:.96,metalness:0});
 const border=new T.LineLoop(new T.BufferGeometry().setFromPoints(s.getPoints(48).map(p=>new T.Vector3(p.x*.94,p.y*.965,.008))),new T.LineBasicMaterial({color:index===2?0xa28451:0xa6a095}));border.visible=index!==2;card.add(border);card.userData.edgeLight=border;
}

export function addBookBinding(coverHinge,coverBounds){
 const brass=new T.MeshStandardMaterial({color:0x8f784a,metalness:.92,roughness:.43});
 const x=coverBounds.max.x+.0006,y0=coverBounds.min.y,y1=coverBounds.max.y,z0=coverBounds.min.z,z1=coverBounds.max.z;
 const origin=coverHinge.position;
 for(const y of [y0+.014,y1-.014])for(const z of [z0+.014,z1-.014]){
  const fitting=new T.Group();fitting.position.set(x-origin.x,y-origin.y,z-origin.z);
  for(const size of [[.0018,.024,.007],[.0018,.007,.024]])fitting.add(new T.Mesh(new T.BoxGeometry(...size),brass));
  const rivet=new T.Mesh(new T.SphereGeometry(.0018,10,6),brass);rivet.position.x=.0012;fitting.add(rivet);coverHinge.add(fitting);
 }
}
