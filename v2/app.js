import {prepareFool} from './gesture-avatar.js';
import './gesture-echo.js?v=20261111-camera';
import {installSceneBackgrounds} from './scene-backgrounds.js';
import {RelicGestures} from './gesture-controller.js';
import {createRitualFeedback} from './ritual-feedback.js';
import {createRelicForms} from './asset-relics.js';
import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const $=s=>document.querySelector(s),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try{renderer=new T.WebGLRenderer({canvas:$('#world'),antialias:true,alpha:true,powerPreference:'high-performance'});}catch(error){$('#failure').hidden=false;$('#failure pre').textContent=error.message;throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<850?1.25:1.6));renderer.setSize($('#world').parentElement.clientWidth,$('#world').parentElement.clientHeight);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=innerWidth>850;renderer.shadowMap.type=T.PCFShadowMap;
const scene=new T.Scene();scene.background=null;renderer.setClearColor(0x000000,0);scene.fog=null;
const camera=new T.PerspectiveCamera(38,innerWidth/innerHeight,.1,150);camera.position.set(0,1.5,14);
const pmrem=new T.PMREMGenerator(renderer),environment=new RoomEnvironment();scene.environment=pmrem.fromScene(environment,.04).texture;environment.dispose();pmrem.dispose();scene.environmentIntensity=.4;
scene.add(new T.HemisphereLight('#ccd2d8','#29272a',.7));const key=new T.DirectionalLight('#dde9ee',1.4);key.castShadow=innerWidth>850;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;key.shadow.bias=-.0005;key.position.set(-4,6,6);scene.add(key);
const warm=new T.PointLight('#c8b694',28,25,2);warm.position.set(4,3,2);scene.add(warm);const rimLight=new T.PointLight('#b7c6d2',42,35,2);rimLight.position.set(-4,2,-2);scene.add(rimLight);
const material=(color,metal=.0,rough=.6)=>new T.MeshStandardMaterial({color,metalness:metal,roughness:rough});
function texture(kind){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),image=ctx.createImageData(256,256);for(let i=0;i<image.data.length;i+=4){const v=kind==='stone'?90+Math.random()*70:130+Math.random()*70;image.data[i]=image.data[i+1]=image.data[i+2]=v;image.data[i+3]=255}ctx.putImageData(image,0,0);const tx=new T.CanvasTexture(c);tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(3,3);return tx;}
const grain=texture('metal'),stone=material('#303c44',.05,.89);stone.bumpMap=texture('stone');stone.bumpScale=.08;
const silver=material('#b8c4cb',.93,.3);silver.roughnessMap=grain;silver.bumpMap=grain;silver.bumpScale=.008;
const gold=material('#a98b53',.85,.34),darkMetal=material('#263940',.85,.45),paper=material('#c7b68f',0,.9),leather=material('#1a2e26',.05,.7);leather.bumpMap=grain;leather.bumpScale=.018;
function mesh(geometry,mat,parent,x=0,y=0,z=0){const object=new T.Mesh(geometry,mat);object.position.set(x,y,z);parent.add(object);return object;}
function box(parent,w,h,d,x,y,z,mat=stone){return mesh(new T.BoxGeometry(w,h,d),mat,parent,x,y,z)}
function tube(parent,points,r,mat=gold){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),40,r,7,false),mat,parent)}
function ring(parent,r,t,mat=silver,x=0,y=0,z=0){return mesh(new T.TorusGeometry(r,t,8,64),mat,parent,x,y,z)}
function ball(parent,r,x,y,z,mat=silver){return mesh(new T.SphereGeometry(r,16,12),mat,parent,x,y,z)}
const palace=new T.Group();scene.add(palace);palace.position.z=-10;palace.visible=false;
// Actual stone architecture, not a background image.
const floor=mesh(new T.PlaneGeometry(90,90),stone,palace,0,-3,0);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;
for(let i=0;i<7;i++)box(palace,12-i*.65,.22,1.2,0,-2.9+i*.22,-1-i*.85);
const throne=new T.Group();palace.add(throne);throne.position.set(0,-1.5,-6.5);
box(throne,2.8,.45,2.5,0,0,0);box(throne,2.5,3.3,.5,0,1.65,-.9);box(throne,1.9,2.6,.1,0,1.7,-.6,darkMetal);
for(const side of [-1,1]){box(throne,.35,1.3,2.2,side*1.4,.6,0);box(throne,.45,4.1,.6,side*1.25,2,-.8);mesh(new T.ConeGeometry(.32,1,5),stone,throne,side*1.25,4.5,-.8);ball(throne,.19,side*1.4,1.4,.8,gold)}
const crown=[];for(let i=0;i<7;i++)crown.push([-1.25+i*.42,3.4+(i%2?.3:.9),-.8]);tube(throne,crown,.07,gold);
// Recessed stone ribs and weathered ornaments give the throne a readable silhouette.
for(let i=-3;i<=3;i++){box(throne,.06,2.7,.16,i*.26,1.65,-.48,darkMetal);if(i%2===0)ball(throne,.065,i*.26,2.85,-.35,gold)}
for(const side of [-1,1]){tube(throne,[[side*1.37,.8,.75],[side*1.55,1.25,.4],[side*1.4,1.45,-.3]],.09,darkMetal);for(let j=0;j<4;j++)box(throne,.09,.09,.5,side*1.45,.25+j*.23,.4,gold)}
for(const side of [-1,1])for(let i=0;i<6;i++){const x=side*(5+i*.7),z=3-i*4;mesh(new T.CylinderGeometry(.38,.54,12,12),stone,palace,x,3,z);box(palace,1.1,.4,1.1,x,-2.8,z);box(palace,1.2,.5,1.2,x,9,z);tube(palace,[[x,7,z],[x*.65,10,z],[0,12,z],[-x*.65,10,z],[-x,7,z]],.13,stone)}
const halo=ring(palace,4.5,.025,material('#52616b',.6,.5),0,3,-9);for(let i=0;i<24;i++){const a=i/24*Math.PI*2;const b=box(palace,.025,.22,.03,Math.cos(a)*4.5,3+Math.sin(a)*4.5,-8.96,gold);b.rotation.z=a-Math.PI/2}
// Local procedural fog sprites with soft alpha, layered in 3D.
const fogCanvas=document.createElement('canvas');fogCanvas.width=fogCanvas.height=128;const fc=fogCanvas.getContext('2d'),gradient=fc.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(174,191,196,.34)');gradient.addColorStop(.4,'rgba(122,149,166,.15)');gradient.addColorStop(1,'rgba(83,112,132,0)');fc.fillStyle=gradient;fc.fillRect(0,0,128,128);const fogTexture=new T.CanvasTexture(fogCanvas),fogs=[];
for(let i=0;i<25;i++){const m=new T.SpriteMaterial({map:fogTexture,transparent:true,opacity:.28,depthWrite:false,color:i%3?'#a2b7c5':'#536e8a'}),sp=new T.Sprite(m);sp.position.set((Math.random()-.5)*30,-2+Math.random()*7,-15+Math.random()*22);sp.scale.set(12+Math.random()*7,3+Math.random()*4,1);sp.visible=false;scene.add(sp);fogs.push({sp,x:sp.position.x,phase:Math.random()*6.28})}
const dustCount=innerWidth<850?500:1100,dustGeo=new T.BufferGeometry(),positions=new Float32Array(dustCount*3);for(let i=0;i<positions.length;i+=3){positions[i]=(Math.random()-.5)*24;positions[i+1]=(Math.random()-.5)*14;positions[i+2]=(Math.random()-.5)*18}dustGeo.setAttribute('position',new T.BufferAttribute(positions,3));const dust=new T.Points(dustGeo,new T.PointsMaterial({color:'#acc9cf',size:.025,map:fogTexture,transparent:true,opacity:.65,depthWrite:false,blending:T.AdditiveBlending}));scene.add(dust);dust.visible=false;
const relicRoot=new T.Group();scene.add(relicRoot);relicRoot.position.y=.2;const models=[],mechanics=[];
function mirror(){const group=new T.Group();const back=mesh(new T.CylinderGeometry(1,1,.16,96),darkMetal,group);back.rotation.x=Math.PI/2;back.scale.set(1.25,1,1.7);
 for(let band=0;band<4;band++){const r=ring(group,1.2+band*.065,band===1?.065:.024,band%2?silver:darkMetal,0,0,.13+band*.015);r.scale.y=1.43}
 const glass=material('#172c3c',.96,.08);glass.envMapIntensity=1.7;const face=mesh(new T.CircleGeometry(1.17,96),glass,group,0,0,.18);face.scale.y=1.43;
 for(let i=0;i<40;i++){const a=i/40*Math.PI*2;ball(group,.026,Math.cos(a)*1.32,Math.sin(a)*1.88,.21,gold)}
 for(const side of [-1,1]){const socket=ring(group,.18,.045,silver,side*1.53,0,.2);socket.scale.y=1.3;const gem=ball(group,.14,side*1.53,0,.24,new T.MeshPhysicalMaterial({color:'#0a232c',metalness:.45,roughness:.08,clearcoat:1}));gem.scale.y=1.3;ball(group,.026,side*1.53-.035,.055,.37,material('#bddee4',.2,.1));for(let j=0;j<4;j++){const y=(j-1.5)*.45;tube(group,[[side*1.24,y,.19],[side*1.5,y+.15,.18],[side*1.39,y+.35,.2]],.022,silver)}}
 for(let i=-2;i<=2;i++){const spike=mesh(new T.ConeGeometry(.14,.5-Math.abs(i)*.07,4),silver,group,i*.22,2.02-Math.abs(i)*.06,.15);spike.rotation.z=-i*.12}box(group,.68,.13,.15,0,1.83,.15,silver);
 const screen=document.createElement('canvas');screen.width=512;screen.height=768;const tex=new T.CanvasTexture(screen);tex.colorSpace=T.SRGBColorSpace;const textMesh=mesh(new T.PlaneGeometry(1.6,2.35),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}),group,0,0,.207);mechanics[0]={screen,tex,textMesh,face};paintMirror('');return group;}
let mirrorText='',mirrorPage=0,mirrorPages=[],mirrorChars=0;
function paintMirror(text,page=0){const m=mechanics[0];if(!m)return;const c=m.screen,ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.font='29px SimSun,serif';ctx.textAlign='center';const lines=[];let line='';for(const char of text){if(char==='\n'){lines.push(line);line=''}else if(line&&ctx.measureText(line+char).width>360){lines.push(line);line=char}else line+=char}if(line)lines.push(line);mirrorPages=[];for(let i=0;i<lines.length;i+=9)mirrorPages.push(lines.slice(i,i+9));if(!mirrorPages.length)mirrorPages=[['']];mirrorPage=Math.max(0,Math.min(page,mirrorPages.length-1));ctx.fillStyle='#e0e8dc';ctx.shadowColor='#a3cbd4';ctx.shadowBlur=5;mirrorPages[mirrorPage].forEach((value,i)=>ctx.fillText(value,256,280+i*44-(mirrorPages[mirrorPage].length-1)*22));m.tex.needsUpdate=true;document.dispatchEvent(new CustomEvent('mirror-pagination',{detail:{page:mirrorPage,total:mirrorPages.length}}))}
function pendulum(){const g=new T.Group(),pivot=new T.Group();g.add(pivot);pivot.position.y=1.7;for(let i=0;i<28;i++){const link=ring(pivot,.065,.014,i%3?gold:silver,0,-i*.075,0);link.rotation.y=i%2*Math.PI/2;link.scale.y=1.3}
const crystal=new T.MeshPhysicalMaterial({color:'#d1a04c',metalness:.15,roughness:.13,transmission:.55,thickness:.8,ior:1.7,clearcoat:1});const gem=mesh(new T.CylinderGeometry(.22,0,.9,6,1),crystal,pivot,0,-2.55,0);gem.rotation.z=Math.PI;mesh(new T.CylinderGeometry(.23,.23,.12,12),gold,pivot,0,-2.1,0);const cap=ring(pivot,.18,.027,gold,0,-2.04,0);cap.rotation.x=Math.PI/2;mechanics[1]={pivot,speed:0,angle:0,direction:1};return g;}
function cardBack(){
 const c=document.createElement('canvas');c.width=384;c.height=640;
 const ctx=c.getContext('2d');ctx.fillStyle='#29282d';ctx.fillRect(0,0,384,640);
 ctx.strokeStyle='#706a67';ctx.lineWidth=2;ctx.strokeRect(21,21,342,598);
 ctx.fillStyle='#a39b90';ctx.font='19px SimSun';ctx.textAlign='center';
 const bands=['── · ─── · ─','│ · ─ │ · │ ─','─ │ · │ ─ · │'];
 for(let row=0;row<12;row++)ctx.fillText(bands[row%3],192+(row%3-1)*12,155+row*29);
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return tex;
}
const CARD_PAINTINGS=['law.webp','order.webp','black-emperor-art.webp','distortion.webp','majesty.webp'];
function paintedCardTexture(index){
 const c=document.createElement('canvas');c.width=384;c.height=640;const x=c.getContext('2d');
 x.fillStyle='#d8c7a3';x.fillRect(0,0,384,640);x.strokeStyle='#8a6d3f';x.lineWidth=4;x.strokeRect(10,10,364,620);
 x.fillStyle='#5b4a33';x.font='26px SimSun,serif';x.textAlign='center';x.fillText('绘牌载入',192,320);
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
 const img=new Image();img.decoding='async';img.onload=()=>{x.imageSmoothingEnabled=true;x.drawImage(img,0,0,384,640);tex.needsUpdate=true};img.src='./media/relic-v3/'+CARD_PAINTINGS[index];
 return tex;
}
function cards(){const g=new T.Group(),leaves=[],reverse=cardBack();for(let i=0;i<5;i++){const pivot=new T.Group();g.add(pivot);const edge=material('#7a6240',.3,.65),front=material('#ffffff',.15,.65),back=material('#ffffff',.2,.6);front.map=paintedCardTexture(i);back.map=reverse;const card=mesh(new T.BoxGeometry(.9,1.5,.035),[edge,edge,edge,edge,front,back],pivot);pivot.userData.index=i;pivot.rotation.y=Math.PI;leaves.push(pivot)}mechanics[2]={leaves,selected:2,flip:0,target:0};return g}
function book(){const g=new T.Group();g.rotation.x=.17;const w=1.55,h=2.15;box(g,w,h,.15,0,0,-.18,leather);const pageMat=paper.clone();pageMat.bumpMap=grain;pageMat.bumpScale=.003;box(g,w-.12,h-.12,.22,0,0,0,pageMat);for(let i=0;i<12;i++)box(g,w-.14,.009,.22,0,-h/2+.12+i*.16,.02,material('#8d8064',0,.9));const cover=new T.Group();g.add(cover);cover.position.x=-w/2;box(cover,w,h,.13,w/2,0,.19,leather);for(const side of [-1,1])for(const up of [-1,1]){box(cover,.22,.035,.04,w/2+side*(w/2-.13),up*(h/2-.1),.28,gold);box(cover,.035,.22,.04,w/2+side*(w/2-.1),up*(h/2-.13),.28,gold)}const seal=ring(cover,.29,.025,gold,w/2,0,.28);box(cover,.5,.07,.035,w/2,0,.29,gold).rotation.z=.75;mesh(new T.CylinderGeometry(.11,.11,h,12),leather,g,-w/2,0,0);
 const sheetGroup=new T.Group();sheetGroup.position.set(-w/2,0,.14);g.add(sheetGroup);const sheetGeo=new T.PlaneGeometry(w-.1,h-.15,18,1),sheet=mesh(sheetGeo,paper.clone(),sheetGroup,(w-.1)/2,0,0);sheet.material.side=T.DoubleSide;const paperCanvas=document.createElement('canvas');paperCanvas.width=512;paperCanvas.height=768;const pt=new T.CanvasTexture(paperCanvas);pt.colorSpace=T.SRGBColorSpace;sheet.material.map=pt;mechanics[3]={cover,sheetGroup,sheet,base:sheetGeo.attributes.position.array.slice(),pageTurn:0,pageTarget:0,paperCanvas,pt};paintBook('安提哥努斯笔记','纸页保持沉默。选择一章，开始阅读。');return g;}
function paintBook(title,text){const m=mechanics[3];if(!m)return;const c=m.paperCanvas,x=c.getContext('2d');x.fillStyle='#d1c8b5';x.fillRect(0,0,512,768);x.fillStyle='#3b342f';x.textAlign='left';x.font='30px SimSun';x.fillText(title,45,80);x.font='22px SimSun';let line='',y=140;for(const char of text.slice(0,230)){if(x.measureText(line+char).width>420){x.fillText(line,45,y);y+=38;line=char}else line+=char}x.fillText(line,45,y);m.pt.needsUpdate=true}
models.push(mirror(),pendulum(),cards(),book());let relicForms;try{relicForms=await createRelicForms(models,mechanics)}catch(error){$('#failure').hidden=false;$('#failure pre').textContent='遗物素材加载失败。请完整解压作品，检查 media/models 目录后刷新；也可打开轻量版。';throw error}models.forEach((g,i)=>{relicRoot.add(g);g.visible=i===0;g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}})});
const state={scene:0,energy:.18,target:.18,yaw:0,pitch:0,impulse:0,camera:false,charge:0};let transition=null,drag=null,last=performance.now(),time=0,paused=document.hidden||document.body.classList.contains('arrival-active');
const morphCount=768,morphGeometry=new T.BufferGeometry();
morphGeometry.setAttribute('position',new T.BufferAttribute(new Float32Array(morphCount*3),3));
morphGeometry.setAttribute('target',new T.BufferAttribute(new Float32Array(morphCount*3),3));
const morphMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{progress:{value:0}},vertexShader:`attribute vec3 target;uniform float progress;varying float fade;void main(){float p=smoothstep(0.,1.,progress);vec3 point=mix(position,target,p);float wave=sin(progress*3.14159265);point.xy+=vec2(sin(point.y*4.+progress*8.),cos(point.x*4.-progress*8.))*.12*wave;gl_Position=projectionMatrix*modelViewMatrix*vec4(point,1.);gl_PointSize=3.;fade=wave;}`,fragmentShader:`varying float fade;void main(){float dotMask=1.-smoothstep(.18,.5,length(gl_PointCoord-.5));gl_FragColor=vec4(.80,.75,.60,dotMask*fade*.8);}`});
const morphCloud=new T.Points(morphGeometry,morphMaterial);morphCloud.visible=false;morphCloud.frustumCulled=false;relicRoot.add(morphCloud);
function captureMorph(model,attribute){
 relicRoot.updateWorldMatrix(true,true);const inverse=new T.Matrix4().copy(relicRoot.matrixWorld).invert(),meshes=[];
 model.traverse(object=>{if(object.isMesh&&object.geometry.attributes.position)meshes.push({position:object.geometry.attributes.position,matrix:new T.Matrix4().multiplyMatrices(inverse,object.matrixWorld)});});
 const point=new T.Vector3();for(let i=0;i<morphCount;i++){const mesh=meshes[i%meshes.length];point.fromBufferAttribute(mesh.position,(i*7919)%mesh.position.count).applyMatrix4(mesh.matrix);attribute.setXYZ(i,point.x,point.y,point.z)}attribute.needsUpdate=true;
}
const names=['阿罗德斯','黄水晶灵摆','亵渎之牌','安提哥努斯笔记'],categories=['有意志的银镜','占卜媒介 · 黄水晶','途径知识的封存','历史与异常的记录'],descriptions=['答案在镜中，也在交换之中。','静下来，听见灵性的偏转。','牌面背后，是通往神座的道路。','你读到的，未必是别人所见。'];
const CARD_NAMES=['律令','秩序','黑皇帝','扭曲','威严'];
const cardDetail=document.createElement('div');cardDetail.id='card-detail';cardDetail.hidden=true;cardDetail.setAttribute('role','dialog');cardDetail.setAttribute('aria-modal','true');cardDetail.setAttribute('aria-label','绘牌放大查看');cardDetail.innerHTML='<button id="card-detail-close" type="button">关闭</button><figure><img id="card-detail-img" alt=""><figcaption id="card-detail-name"></figcaption></figure>';document.body.append(cardDetail);
const cardDetailImg=cardDetail.querySelector('#card-detail-img'),cardDetailName=cardDetail.querySelector('#card-detail-name'),cardDetailClose=cardDetail.querySelector('#card-detail-close');
function showCardDetail(index){const i=Math.max(0,Math.min(4,Number(index)||0));cardDetail.dataset.card=String(i);cardDetailImg.src='./media/relic-v3/'+CARD_PAINTINGS[i];cardDetailImg.alt=CARD_NAMES[i]+' · 绘牌';cardDetailName.innerHTML=CARD_NAMES[i]+'<small>亵渎之牌 · 五张绘牌</small>';cardDetail.hidden=false;document.body.classList.add('card-detail-open');cardDetailClose.focus({preventScroll:true})}
function closeCardDetail(){cardDetail.hidden=true;document.body.classList.remove('card-detail-open')}
cardDetail.addEventListener('click',event=>{if(event.target===cardDetail||event.target.id==='card-detail-close')closeCardDetail()});
function toast(text){$('.toast').textContent=text;$('.toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('.toast').classList.remove('show'),3500)}
function selectRelic(index){if(index===state.scene&&!transition)return;if(index!==2)closeCardDetail();lastGestureKind='';cancelCharge(true);state.yaw=state.pitch=0;gestures.changeRelic();ritualFX.reset(state.scene);if(!reduce){captureMorph(models[state.scene],morphGeometry.attributes.position);captureMorph(models[index],morphGeometry.attributes.target)}transition={age:0,to:index,changed:false};state.impulse=.7;}
function updateUI(){document.querySelectorAll('.relic').forEach((b,i)=>{b.disabled=false;b.classList.toggle('active',i===state.scene);b.setAttribute('aria-pressed',i===state.scene)});$('#object-name').textContent=names[state.scene];$('#relic-category').textContent=categories[state.scene];$('#object-description').textContent=descriptions[state.scene];$('#relic-action').textContent=['向魔镜提问','灵摆占卜','解锁亵渎之牌','阅读安提哥努斯笔记'][state.scene];document.dispatchEvent(new CustomEvent('chapter-relic-selected',{detail:state.scene}));}
const ritualFX=createRitualFeedback(relicRoot,reduce,{models,mechanics});ritualFX.hud.querySelector('.effect-demo').onclick=()=>releaseRelic(1);
function releaseRelic(strength){if(paused||transition||!ritualFX.release(strength))return false;energy(strength);state.impulse=1;document.dispatchEvent(new CustomEvent('chapter-release',{detail:state.scene}));return true;}
document.addEventListener('relic-form',()=>{cancelCharge(true);gestures.reset();});
document.addEventListener('chapter-select-relic',e=>{if(Number.isInteger(e.detail)&&e.detail>=0&&e.detail<4)selectRelic(e.detail);});
document.addEventListener('chapter-feedback',e=>{if(e.detail.kind==='restore')return;energy(e.detail.kind==='ending'?.95:.7);state.impulse=.8;ritualFX.touch();});
document.querySelectorAll('.relic').forEach((b,i)=>b.onclick=()=>selectRelic(i));
function energy(value){state.target=Math.max(0,Math.min(1,value));$('#energy').value=Math.round(state.target*100)}$('#energy').oninput=e=>energy(+e.target.value/100);$('#awaken').onclick=()=>releaseRelic(1);

// Fog replay is owned by scene-backgrounds.js; it never hides the relic stage.
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{toast('此浏览器不支持全屏')}};
const canvas=$('#world');let spaceStart=0,spaceRestEnergy=.18;
function cancelCharge(restore=false){if(restore&&(drag||spaceStart))energy(drag?drag.restEnergy:spaceRestEnergy);drag=null;spaceStart=0;state.charge=0;}
canvas.onpointerenter=()=>{if(!paused&&!transition)ritualFX.touch()};
canvas.onpointerdown=e=>{if(paused||transition||e.button!==0)return;canvas.focus({preventScroll:true});drag={x:e.clientX,y:e.clientY,last:e.clientX,pitch:state.pitch,restEnergy:state.target,start:performance.now(),moved:false};canvas.setPointerCapture(e.pointerId)};
canvas.onpointermove=e=>{if(!drag)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8){if(!drag.moved)energy(drag.restEnergy);drag.moved=true;state.charge=0;}if(drag.moved){if(state.scene===1)mechanics[1].speed+=T.MathUtils.clamp((e.clientX-drag.last)*.02,-.4,.4);state.yaw+=(e.clientX-drag.last)*.009;state.pitch=T.MathUtils.clamp(drag.pitch+(e.clientY-drag.y)*.004,-.6,.6);drag.last=e.clientX}};
canvas.onpointerup=()=>{if(!drag)return;const held=performance.now()-drag.start;if(!drag.moved){if(held>=450)releaseRelic(Math.min(1,(held-120)/1200));else inspectRelic()}cancelCharge()};
canvas.onpointercancel=()=>cancelCharge(true);canvas.onlostpointercapture=()=>cancelCharge(true);
canvas.onkeydown=e=>{if(e.key===' '){e.preventDefault();if(!e.repeat&&!spaceStart){spaceRestEnergy=state.target;spaceStart=performance.now()}}if(e.key==='ArrowRight')selectRelic((state.scene+1)%4);if(e.key==='ArrowLeft')selectRelic((state.scene+3)%4);if(e.key==='Escape'){state.yaw=state.pitch=0;cancelCharge();gestures.reset();ritualFX.reset(state.scene);energy(.18)}};
canvas.onkeyup=e=>{if(e.key===' '&&spaceStart){e.preventDefault();releaseRelic(Math.max(.35,Math.min(1,(performance.now()-spaceStart)/1200)));cancelCharge()}};canvas.onblur=()=>{if(spaceStart)cancelCharge(true)};
document.addEventListener('mirror-answer',e=>{mirrorText=String(e.detail);mirrorPage=0;paintMirror(mirrorText);ritualFX.touch();energy(.8);state.impulse=.4});document.addEventListener('mirror-page',e=>paintMirror(mirrorText,e.detail));
document.addEventListener('relic-lore-action',e=>{const a=e.detail;energy(.95);state.impulse=.5;if(a.kind==='divine'){mechanics[1].direction=a.direction;mechanics[1].speed=a.direction*3.5;ritualFX.release(.8);if(!a.direction)toast('灵性受到干扰，无法判断')}if(a.kind==='unlock'){mechanics[2].target=1;mechanics[2].selected=2;ritualFX.release(.9)}if(a.kind==='read'){mechanics[3].pageTarget+=Math.PI;}});document.addEventListener('notebook-content',e=>paintBook(e.detail.title,e.detail.text));
// Camera frames stay on the device.
const cameraButton=$('#camera'), cameraBox=$('.cam-box'), cameraVideo=cameraBox.querySelector('video');
const cameraDevice=$('.camera-device'), cameraSelect=cameraDevice.querySelector('select');
let cameraRun=0,stream,detector,detectorPromise,handFrame=0,lastDetect=0,lastVideo=-1,gesture='',releaseHold=0;
let gestureFullscreen=false;
function stopCamera(keepImmersive=false){
 closeCardDetail();
 cameraRun++;state.camera=false;gesture="";state.charge=0;handSmooth=[];lastGestureKind="";
 gestures.reset();cancelAnimationFrame(handFrame);
 stream?.getTracks().forEach(track=>track.stop());stream=null;
 cameraVideo.srcObject=null;cameraBox.hidden=true;cameraDevice.hidden=true;
 cameraButton.textContent='连接摄像头并进入全屏';cameraButton.setAttribute('aria-pressed','false');cameraButton.disabled=false;
 document.dispatchEvent(new CustomEvent('fool-camera',{detail:false}));
 if(!keepImmersive){
  document.body.classList.remove('gesture-immersive');
  if(gestureFullscreen&&document.fullscreenElement){gestureFullscreen=false;document.exitFullscreen();}
  gestureFullscreen=false;
 }
}
async function loadHandDetector(){
 if(detector)return detector;
 detectorPromise ||= (async()=>{
  const {FilesetResolver,HandLandmarker}=await import('../assets/vision/vision_bundle.mjs');
  const wasm=await FilesetResolver.forVisionTasks('../assets/vision/wasm');
  return HandLandmarker.createFromOptions(wasm,{baseOptions:{modelAssetPath:'../assets/vision/hand_landmarker.task',delegate:'CPU'},runningMode:'VIDEO',numHands:2,minHandDetectionConfidence:.65,minHandPresenceConfidence:.6,minTrackingConfidence:.6});
 })();
 try{return detector=await detectorPromise}catch(error){detectorPromise=null;throw error}
}
async function startCamera(deviceId){
 const run=++cameraRun;let stage='camera';
 cameraButton.disabled=true;document.body.classList.add('gesture-immersive');
 handStatus.textContent='正在连接摄像头…';
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw Error('摄像头需在 localhost 或 HTTPS 页面使用');
  const videoOptions={width:{ideal:640},height:{ideal:480}};
  if(deviceId)videoOptions.deviceId={exact:deviceId};
  const incoming=await navigator.mediaDevices.getUserMedia({video:videoOptions,audio:false});
  if(run!==cameraRun){incoming.getTracks().forEach(track=>track.stop());return;}
  stream=incoming;cameraVideo.srcObject=stream;cameraBox.hidden=false;
  handStatus.textContent='摄像头已接通 · 等待画面…';
  await cameraVideo.play();
  if(run!==cameraRun)return;
  cameraBox.style.aspectRatio=cameraVideo.videoWidth+"/"+cameraVideo.videoHeight;
  const track=incoming.getVideoTracks()[0];
  track.addEventListener('ended',()=>{
   if(run!==cameraRun)return;
   stopCamera(true);
   handStatus.textContent='摄像头已断开 · 请重新连接';
   cameraButton.textContent='重试摄像头';
  });
  navigator.mediaDevices.enumerateDevices().then(devices=>{
   if(run!==cameraRun)return;
   const cameras=devices.filter(device=>device.kind==='videoinput');
   cameraSelect.replaceChildren(...cameras.map((device,index)=>new Option(device.label||('摄像头 '+(index+1)),device.deviceId)));
   cameraSelect.value=track.getSettings().deviceId;
   cameraDevice.hidden=cameras.length<2;
  }).catch(error=>console.warn('无法列出摄像头设备',error));
  stage='model';handStatus.textContent='摄像头画面已就绪 · 正在加载手部识别…';
  await loadHandDetector();
  if(run!==cameraRun)return;
  state.camera=true;lastVideo=-1;lastDetect=0;
  cameraButton.disabled=false;cameraButton.textContent='关闭手势';cameraButton.setAttribute('aria-pressed','true');
  handStatus.textContent='正在检查摄像头画面…';
  document.dispatchEvent(new CustomEvent('fool-camera',{detail:true}));
  handFrame=requestAnimationFrame(trackHands);
  prepareFool().then(avatar=>{if(run===cameraRun)avatar.setEnabled(true);}).catch(error=>console.warn('愚者立绘未能加载',error));
 }catch(error){
  if(run!==cameraRun)return;
  stopCamera(true);cameraButton.textContent='重试摄像头';
  console.warn('手势启动失败',error);
  const message=stage==='model'?'手部识别模型加载失败 · 请重试':error.name==='NotAllowedError'||error.name==='SecurityError'?'摄像头权限被拒绝 · 请检查浏览器权限':error.name==='NotReadableError'||error.name==='AbortError'?'摄像头无法读取画面 · 检查是否被其他程序占用':error.name==='NotFoundError'||error.name==='OverconstrainedError'?'所选摄像头不可用 · 请检查设备后重试':error.message||'摄像头启动失败 · 请重试';
  handStatus.textContent=message;toast(message);
 }
}
cameraButton.onclick=()=>{
 if(state.camera){stopCamera();return;}
 const started=startCamera();
 const run=cameraRun;
 if(!document.fullscreenElement&&document.documentElement.requestFullscreen){
  document.documentElement.requestFullscreen().then(()=>{
   if(run===cameraRun)gestureFullscreen=true;else document.exitFullscreen();
  }).catch(()=>{});
 }
 return started;
};
cameraSelect.onchange=()=>{
 const deviceId=cameraSelect.value;
 stopCamera(true);startCamera(deviceId);
};
document.querySelector('#gesture-exit').onclick=()=>stopCamera();
document.addEventListener('fullscreenchange',()=>{if(gestureFullscreen&&!document.fullscreenElement){gestureFullscreen=false;stopCamera();}});
const gestures=new RelicGestures();let gestureProgress=0,inspectCooldown=0,lastGestureKind='',handSmooth=[];
function inspectRelic(){
 if(paused||transition||performance.now()<inspectCooldown)return;inspectCooldown=performance.now()+1200;state.impulse=.4;ritualFX.touch();
 if(state.scene===1)mechanics[1].speed+=3.8;
 if(state.scene===2){const cards=mechanics[2];cards.selected=(cards.selected+1)%5;cards.preview=true;showCardDetail(cards.selected);}
 
 if(!document.dispatchEvent(new CustomEvent('chapter-inspect',{cancelable:true,detail:state.scene}))){energy(.85);return;}
 if(state.scene===0){energy(.85);mechanics[0].face.material.emissiveIntensity=.8;toast('镜面已唤醒。输入或说出问题，魔镜才会回答。')}
 else if(state.scene===1){toast('灵摆受到牵引，观察摆动与回稳。')}
 else if(state.scene===2){toast('已翻开'+CARD_NAMES[mechanics[2].selected])}
 else {const next=document.querySelector('.notebook-pager .forward');if(next&&!next.disabled)next.click();else{mechanics[3].pageTarget+=Math.PI;energy(.72);}}
}
const handStatus=document.createElement('div');handStatus.id='hand-status';handStatus.setAttribute('role','status');handStatus.textContent='正在连接摄像头…';ritualFX.hud.prepend(handStatus);
const inspectButton=document.createElement('button');inspectButton.type='button';inspectButton.id='relic-inspect';inspectButton.textContent='触发遗物回应';inspectButton.onclick=inspectRelic;ritualFX.hud.append(inspectButton);
function trackHands(now){if(!state.camera)return;handFrame=requestAnimationFrame(trackHands);if(paused)return;if(now-lastDetect<100||cameraVideo.currentTime===lastVideo||cameraVideo.readyState<2)return;lastDetect=now;lastVideo=cameraVideo.currentTime;
 try{const raw=detector.detectForVideo(cameraVideo,now).landmarks;if(raw.length!==handSmooth.length)handSmooth=[];const hands=raw.map((hand,hi)=>hand.map((point,pi)=>{const prev=handSmooth[hi]?.[pi];return prev?{...point,x:prev.x+(point.x-prev.x)*.7,y:prev.y+(point.y-prev.y)*.7}:point}));handSmooth=hands.map(hand=>hand.map(point=>({...point})));document.dispatchEvent(new CustomEvent('fool-tracking',{detail:{hands}}));const action=gestures.update(hands,now);gesture=action.kind;gestureProgress=action.progress||0;document.dispatchEvent(new CustomEvent('fool-gesture',{detail:{kind:action.kind,progress:action.progress||0,charge:action.charge||0}}));
  if(!hands.length)lastGestureKind='';
  if(state.scene===2&&hands.length){
   if(!action.stabilizing&&gesture==='palm'&&lastGestureKind!=='palm'){mechanics[2].preview=true;const next=(mechanics[2].selected+1)%5;mechanics[2].selected=next;energy(.72);toast('张掌抽牌 · '+CARD_NAMES[next])}
   if(!action.stabilizing&&gesture==='grab'&&lastGestureKind!=='grab'){const p=hands[0],nx=1-(p[4].x+p[8].x)/2,index=Math.max(0,Math.min(4,Math.round((nx-.5)/.18+2)));mechanics[2].selected=index;mechanics[2].preview=true;showCardDetail(index)}
  }
  if(!action.stabilizing)lastGestureKind=gesture;
  const cardScene=state.scene===2;
  const handText=hands.length?({'dual':'双手已识别 · 开合绘牌','grab':'捏合已识别 · 拿起单张并放大','charge':'握拳已识别 · 蓄能中','palm':'张掌已识别 · 抽一张绘牌 / 横扫切换','inspect':'食指已识别 · 放大当前绘牌','switch':'V 手势已识别 · 停留切换遗物'})[gesture]||'亵渎之牌 · 张掌抽牌，捏合放大':'已收到画面 · 未检测到手';
  const normalText=hands.length?({'dual':'双手已识别 · 开合牵引遗物','grab':'捏合已识别 · 移动旋转遗物','charge':'握拳已识别 · 蓄能中','palm':'张掌已识别 · 横扫切换','inspect':'食指已识别 · 停留触发回应','switch':'V 手势已识别 · 停留切换遗物'})[gesture]||'手部已识别 · 捏合旋转，握拳蓄能':'已收到画面 · 未检测到手';
  $('#hand-status').textContent=cardScene?handText:normalText;
 if(action.stabilizing)return;
 state.charge=action.charge||0;
 if(action.release){releaseRelic(action.release);releaseHold=now+4700;}
 else if(action.charge!==undefined)energy(.05);
 else if(action.energy!==undefined&&now>releaseHold)energy(action.energy);
 if(action.twist!==undefined)state.pitch=T.MathUtils.clamp(action.twist,-.55,.55);
 if(action.dx!==undefined){if(state.scene===1)mechanics[1].speed+=T.MathUtils.clamp(action.dx*2,-.4,.4);state.yaw+=action.dx;state.pitch=T.MathUtils.clamp(state.pitch+action.dy,-.65,.65)}
 if(action.switch)selectRelic((state.scene+action.switch+4)%4);
 if(action.inspect)inspectRelic();
 $('#status').textContent=gesture==='lost'?'手部离开画面，等待重新识别':({dual:'双手结界：距离控制展开，倾斜控制姿态',grab:'捏合拿牌，移动手指调整位置',inspect:'食指停留：翻开纸牌或触发回应',palm:'张掌抽牌，横扫切换藏品',swipe:'横扫已确认，正在切换',switch:'保持 V 手势确认切换',charge:'握拳蓄能，张掌释放'})[gesture]||'手势纸牌已连接';
 }catch(error){console.warn('手部识别中断',error);stopCamera(true);cameraButton.textContent='重试摄像头';handStatus.textContent='手部识别中断 · 请重新连接';toast(handStatus.textContent)}}

function syncStagePause(){paused=document.hidden||document.body.classList.contains('arrival-active');last=performance.now();canvas.dataset.stagePaused=String(paused);if(paused){cancelCharge(true);gestures.reset();gesture='';gestureProgress=0;}}
addEventListener('pagehide',event=>{stopCamera();cancelCharge(true);if(!event.persisted)renderer.dispose()});
addEventListener('pageshow',event=>{canvas.dataset.restoredFromCache=String(event.persisted);syncStagePause()});
document.addEventListener('visibilitychange',syncStagePause);
document.addEventListener('arrival-state',syncStagePause);
let fpsStart=performance.now(),frames=0;
function frame(now){requestAnimationFrame(frame);if(paused)return;const dt=Math.min(.05,(now-last)/1000);last=now;time+=reduce?0:dt;frames++;if(now-fpsStart>1200){canvas.dataset.fps=Math.round(frames*1000/(now-fpsStart));fpsStart=now;frames=0}
 const reveal=1;
 camera.position.z=T.MathUtils.lerp(14,Math.max(8,2.15/(Math.tan(19*Math.PI/180)*camera.aspect)),reveal);camera.position.y=T.MathUtils.lerp(1.5,.6,reveal);camera.lookAt(0,.25,0);
 for(const f of fogs){f.sp.position.x=f.x+Math.sin(time*.09+f.phase)*2+(f.sp.position.z>0?Math.sign(f.x||1)*reveal*7:0);f.sp.material.opacity=f.sp.position.z>0?.6*(1-reveal)+.025:.11;}
 dust.rotation.y=time*.012;palace.rotation.y=Math.sin(time*.03)*.015;
 if((drag&&!drag.moved)||spaceStart){state.charge=Math.max(0,Math.min(1,(now-(spaceStart||drag.start)-120)/1200));energy(.05)}
 state.energy+=(state.target-state.energy)*(1-Math.exp(-dt*5));state.impulse*=Math.exp(-dt*2.8);relicRoot.visible=true;relicRoot.position.y=.65+(reduce?0:Math.sin(time*.65)*.05);relicRoot.rotation.y=state.yaw;relicRoot.rotation.x=state.pitch;relicRoot.position.x=0;
 let morph=0;morphCloud.visible=!!transition&&!reduce;if(transition){transition.age+=dt;const p=Math.min(1,transition.age/1.2);morph=reduce?0:Math.sin(p*Math.PI);morphMaterial.uniforms.progress.value=p;relicRoot.position.y-=morph*.7;relicRoot.rotation.y+=morph*.7;if(p>.5&&!transition.changed){models[state.scene].visible=false;state.scene=transition.to;models[state.scene].visible=true;transition.changed=true;updateUI()}if(p>=1)transition=null}
 relicRoot.scale.set(1-morph*.68,1-morph*.55,1-morph*.68);morphCloud.scale.set(1/(1-morph*.68),1/(1-morph*.55),1/(1-morph*.68));
 const pend=mechanics[1];pend.speed+=(-pend.angle*5-pend.speed*1.7)*dt;pend.angle+=pend.speed*dt;pend.pivot.rotation.z=pend.angle+Math.sin(time*1.8)*state.energy*.16;pend.pivot.rotation.y=time*.12+Math.sin(time*.6)*state.energy*.25;
 const arc=mechanics[2];arc.flip+=(arc.target-arc.flip)*(1-Math.exp(-dt*4));arc.leaves.forEach((card,i)=>{card.position.x=(i-2)*(arc.preview?.96:.08+state.energy*.47);card.position.y=i===arc.selected?state.energy*.25:0;card.position.z=i===arc.selected?.28:-Math.abs(i-2)*.09;card.rotation.z=-(i-2)*state.energy*.17;const facing=arc.preview||i===arc.selected?Math.PI*(1-(arc.preview?1:arc.flip)):Math.PI;card.rotation.y=T.MathUtils.lerp(card.rotation.y,facing,reduce?1:1-Math.exp(-dt*6));});
 const b=mechanics[3];b.cover.rotation.y=-state.energy*2.65;b.pageTurn+=(b.pageTarget-b.pageTurn)*(1-Math.exp(-dt*3));b.sheetGroup.rotation.y=-Math.abs(Math.sin(b.pageTurn))*1.9;const verts=b.sheet.geometry.attributes.position;for(let i=0;i<verts.count;i++)verts.setZ(i,b.base[i*3+2]+Math.sin((b.base[i*3]+.72)*2)*Math.abs(Math.sin(b.pageTurn))*.25);verts.needsUpdate=true;b.sheet.geometry.computeVertexNormals();
 const m=mechanics[0];m.textMesh.material.opacity=.35+state.energy*.65;

 const feedback=ritualFX.update(dt,{charge:state.charge,energy:state.energy,impulse:state.impulse,kind:state.camera?gesture:'',kindProgress:gestureProgress,active:state.camera,scene:state.scene,switching:!!transition});
 const room=document.body.dataset.environment==='scene2'&&state.scene===0&&!document.body.classList.contains('gesture-immersive');
 const domain=relicForms.update(feedback,{index:state.scene,form:feedback.form,energy:state.energy,time,reduce,dt,room,portrait:camera.aspect<1});
 ritualFX.updateEffects(feedback,state.scene);
 canvas.closest('.artifact-pane').classList.toggle('domain-open',!!feedback.form);
 const bounds=domain.frame;const domainDistance=bounds?Math.max(bounds.size[1]/(2*Math.tan(19*Math.PI/180)),bounds.size[0]/(2*Math.tan(19*Math.PI/180)*camera.aspect))*1.12+bounds.size[2]*.5:10.2;
 const viewHeight = state.scene===1 ? 7.65 : 5.8;
 const viewWidth = state.scene===2&&(mechanics[2].preview||feedback.stage!=='idle') ? 5.6 : 3.65;
 const normalDistance=Math.max(viewHeight,viewWidth/camera.aspect)/(2*Math.tan(19*Math.PI/180));
 camera.position.z=T.MathUtils.lerp(normalDistance,domainDistance+(bounds?.center[2]||0),domain.amount);camera.position.y=.6+domain.amount*(state.scene===0?2.5:1.4);camera.lookAt(0,T.MathUtils.lerp(.65,.65+(bounds?.center[1]||0),domain.amount),domain.amount*(bounds?.center[2]||0));
 canvas.dataset.domainAmount=domain.amount.toFixed(2);canvas.dataset.domainObjects=String(domain.objects);
 if(feedback.finished)energy(.18);
 $('#awaken').disabled=!!transition||['open','hold','settle'].includes(feedback.stage);
 $('#energy-value').value=Math.round(state.energy*100)+'%';$('#phase').textContent=transition?'灰雾重构':ritualFX.hud.querySelector('strong').textContent;canvas.dataset.energy=state.energy.toFixed(2);canvas.dataset.yaw=state.yaw.toFixed(3);canvas.dataset.gesture=gesture;canvas.dataset.scene=String(state.scene);canvas.dataset.relicVisible=String(relicRoot.visible);canvas.dataset.stagePaused=String(paused);canvas.dataset.ritualPhase=feedback.stage;canvas.dataset.ritualForm=String(feedback.form);renderer.render(scene,camera);
}
requestAnimationFrame(frame);
addEventListener('resize',()=>{camera.aspect=$('#world').parentElement.clientWidth/$('#world').parentElement.clientHeight;camera.updateProjectionMatrix();renderer.setSize($('#world').parentElement.clientWidth,$('#world').parentElement.clientHeight)});
// Reuse the verified question/voice/12-chapter controls, leaving credentials on the server.
await import('../src/mirror-chat.js');await import('../src/lore-interactions.js');updateUI();

// The render viewport is the artifact cell, never the entire page.
function resizeStage(){const rect=canvas.parentElement.getBoundingClientRect();if(!rect.width||!rect.height)return;camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderer.setSize(rect.width,rect.height);}
new ResizeObserver(resizeStage).observe(canvas.parentElement);resizeStage();
const film=$('#background-film');film.muted=true;installSceneBackgrounds({film,reduce,toast});
const column=$('.control-column');const mirrorBox=$('.mirror-input:not(.relic-input)');if(mirrorBox)column.insertBefore(mirrorBox,$('#guide'));
const mic=$('.voice-small');if(mic)mic.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></svg>';

await import('./chapter-one.js');

await import('./soundscape.js');


await import('./ritual-shell.js?v=20261111-camera');
await import('./art-directions.js');
await import('./table-scene.js');


document.addEventListener('relic-card-preview',e=>{mechanics[2].preview=e.detail;if(e.detail)ritualFX.touch();energy(e.detail?.75:.18)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!cardDetail.hidden){closeCardDetail();return}cancelCharge(true);ritualFX.reset(state.scene);energy(.18)}});












