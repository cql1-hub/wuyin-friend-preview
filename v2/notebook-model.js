import * as T from 'three';

export function createNotebook(coverSource,paperSource,coverArt){
 const body=new T.Group();body.userData.unitScale=1;
 const leather=coverSource.clone();leather.color.setHex(0x76614e);leather.roughness=.88;leather.metalness=0;
 for(const key of ['map','normalMap','roughnessMap','metalnessMap'])if(leather[key]){leather[key]=leather[key].clone();leather[key].matrixAutoUpdate=true;leather[key].offset.set(.02,.18);leather[key].repeat.set(.12,.10);leather[key].updateMatrix();}
 const brass=new T.MeshStandardMaterial({color:0x8b784c,metalness:.94,roughness:.4});
 const paper=paperSource.clone();paper.color.setHex(0xbeb293);paper.roughness=.94;paper.metalness=0;
 function add(geo,mat,parent,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 function board(){const w=1.7,h=2.45,r=.055,s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const g=new T.ExtrudeGeometry(s,{depth:.055,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2,curveSegments:8}),p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+w/2)/w,(p.getY(i)+h/2)/h);return g;}
 add(board(),leather,body,0,0,-.235);
 const hinge=new T.Group();hinge.position.set(-.85,0,.195);body.add(hinge);add(board(),leather,hinge,.85,0,0);
 if(coverArt){const tooling=new T.MeshStandardMaterial({map:coverArt,roughness:.84,metalness:.08,bumpMap:coverArt,bumpScale:.003});add(new T.PlaneGeometry(1.52,2.28),tooling,hinge,.85,0,.066);}
 const leaf=new T.MeshStandardMaterial({color:0xc7b794,roughness:.97});
 add(new T.BoxGeometry(1.56,2.3,.32),[paper,paper,paper,paper,leaf,leaf],body,.025,0,-.01);
 const edge=new T.MeshStandardMaterial({color:0x81745c,roughness:1});
 for(let i=0;i<48;i++){
  const z=-.16+i*.0066;
  add(new T.BoxGeometry(.004,2.28,.001),edge,body,.81+Math.sin(i*2.1)*.007,0,z);
  add(new T.BoxGeometry(1.55,.003,.001),edge,body,.025,1.15+Math.sin(i*3.2)*.004,z);
  add(new T.BoxGeometry(1.55,.003,.001),edge,body,.025,-1.15+Math.sin(i*1.7)*.004,z);
 }
 const spine=add(new T.CylinderGeometry(.205,.205,2.4,24,1,false,0,Math.PI),leather,body,-.78,0,-.015);spine.rotation.y=Math.PI/2;
 for(const y of [-.92,-.66,.66,.92])add(new T.TorusGeometry(.215,.012,6,32,Math.PI),leather,body,-.78,y,-.015).rotation.x=Math.PI/2;
 for(const x of [.1,1.6])for(const y of [-1.12,1.12]){
  add(new T.BoxGeometry(.16,.025,.016),brass,hinge,x,y,.07);add(new T.BoxGeometry(.025,.16,.016),brass,hinge,x,y,.07);
  add(new T.SphereGeometry(.018,12,8),brass,hinge,x,y,.085);
 }
 const embossed=new T.MeshStandardMaterial({color:0x4b4435,metalness:.4,roughness:.7});
 if(!coverArt){for(const r of [.25,.29])add(new T.TorusGeometry(r,.008,5,64),embossed,hinge,.85,.2,.069);const seal=add(new T.BoxGeometry(.3,.012,.01),embossed,hinge,.85,.2,.075);seal.rotation.z=.65;}
 const clasp=new T.Group();clasp.position.set(.86,0,-.21);body.add(clasp);
 add(new T.CylinderGeometry(.035,.035,.18,16),brass,body,.86,0,-.21);
 add(new T.BoxGeometry(.035,.17,.5),leather,clasp,.035,0,.25);
 add(new T.BoxGeometry(.33,.17,.04),leather,clasp,-.12,0,.50);
 add(new T.BoxGeometry(.16,.13,.025),brass,clasp,-.2,0,.53);
 for(const x of [-.25,-.15])add(new T.SphereGeometry(.014,12,8),brass,clasp,x,0,.55);
 body.clasp=clasp;
 return {body,hinge};
}

