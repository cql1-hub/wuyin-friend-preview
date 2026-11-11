import {createNotebook} from './notebook-model.js';
import {rebuildPendulum,rebuildCard} from './relic-details.js';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createRelicDomains} from './relic-domains.js';
const TAU=Math.PI*2;
function normalize(object,height,rotation=0){
 const frame=new T.Group();object.rotation.y=rotation;object.updateMatrixWorld(true);const box=new T.Box3().setFromObject(object),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());object.position.sub(center);frame.add(object);frame.scale.setScalar(height/size.y);frame.userData.unitScale=height/size.y;return frame;
}
function silverMaterial(mat){const m=mat.clone();m.metalness=.88;m.envMapIntensity=1.05;m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb = vec3(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722))) * vec3(.89,.95,1.0);');};return m;}
export async function createRelicForms(models,mechanics){
 const loader=new GLTFLoader(),load=name=>loader.loadAsync('media/models/'+name);
 const [mirrorAsset,bookAsset,chairAsset,shelfAsset,doorAsset]=await Promise.all([loader.loadAsync('media/relic-v3/arrodes.glb'),load('book_encyclopedia_set_01/book_encyclopedia_set_01.gltf'),load('throne.glb'),load('wooden_bookshelf_worn/wooden_bookshelf_worn.gltf'),load('large_castle_door/large_castle_door.gltf')]);
 for(const asset of [mirrorAsset,bookAsset,chairAsset,shelfAsset,doorAsset])asset.scene.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material]){m.envMapIntensity=.9;for(const key of ['map','normalMap','roughnessMap','metalnessMap'])if(m[key])m[key].anisotropy=4;}}});
 chairAsset.scene.traverse(o=>{if(o.isMesh&&o.material.name==='throne_body_pbr'){const m=o.material.clone();m.metalness=.38;m.roughness=.46;m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n float lum=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));float velvet=smoothstep(.05,.20,diffuseColor.r-diffuseColor.g);diffuseColor.rgb=mix(lum*vec3(.55,.66,.78),lum*vec3(.055,.10,.17),velvet);');};o.material=m;}});
 bookAsset.scene.traverse(o=>{if(o.isMesh&&o.material.name.includes('cover')){o.material.color.setHex(0x9b8a72);o.material.metalness=0;o.material.roughness=.9;}});
 // Separate silver shell, chasing, mounted black stones, reflective disk and rear hardware.
 mirrorAsset.scene.traverse(o=>{if(o.isMesh&&o.material.name==='Scanned carved silver ornament')o.material=silverMaterial(o.material);});
 const glass=mirrorAsset.scene.getObjectByName('mirror_face');
 glass.material=new T.MeshPhysicalMaterial({color:0x53545a,metalness:.80,roughness:.32,clearcoat:.08,emissive:0x20232b,emissiveIntensity:.01,envMapIntensity:.13});
 const mirrorBody=normalize(mirrorAsset.scene,4.05);models[0].children.forEach(c=>c.visible=false);models[0].add(mirrorBody);const mirrorText=mechanics[0].textMesh;mirrorText.visible=true;mirrorText.position.set(0,-.14,.205);mechanics[0].face=glass;
 const contact = new T.Mesh(new T.PlaneGeometry(3.3,1.5),new T.ShaderMaterial({
  transparent:true,depthWrite:false,
  vertexShader:'varying vec2 point;void main(){point=(uv-.5)*2.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec2 point;void main(){float shadow=exp(-dot(point,point)*5.)*(1.-smoothstep(.75,1.,length(point)));gl_FragColor=vec4(.07,.05,.045,shadow*.65);}'
 }));
 contact.rotation.x=-1.24;contact.position.set(0,-1.3,.24);contact.visible=false;models[0].add(contact);
 const roomTint=new T.Color(0x685750),neutralTint=new T.Color(0x53545a);
 const pivot=mechanics[1].pivot;
 const precisionCrystal=rebuildPendulum(pivot);
 // Printed paper stock, independent front/back surfaces and physical rounded corners.
 const illustrations=await Promise.all(['law','order','black-emperor-art','distortion','majesty'].map(name=>new T.TextureLoader().loadAsync('media/relic-v3/'+name+'.webp')));mechanics[2].leaves.forEach((leaf,i)=>rebuildCard(leaf.children.find(o=>o.isMesh),illustrations[i].image,i));illustrations.forEach(t=>t.dispose());
 // A bound notebook with separate boards, spine, paper edge, clasp and hinge.
 let scannedCover,scannedPaper;bookAsset.scene.traverse(o=>{if(o.isMesh){if(o.material.name.includes('cover'))scannedCover=o.material;else scannedPaper=o.material;}});
 const coverArt=await new T.TextureLoader().loadAsync('media/relic-v3/antigonus-cover.webp');coverArt.colorSpace=T.SRGBColorSpace;const notebook=createNotebook(scannedCover,scannedPaper,coverArt),bookBody=notebook.body,coverHinge=notebook.hinge;
 models[3].children.forEach(o=>o.visible=false);models[3].add(bookBody);
 const sheet=mechanics[3].sheetGroup;sheet.visible=true;models[3].add(sheet);sheet.position.set(-.77,0,.19);
 const domains=createRelicDomains(models,{mirror:mirrorBody,book:bookBody,gem:precisionCrystal,paper:mechanics[3].sheet.material,cards:mechanics[2].leaves,chair:chairAsset.scene,shelf:shelfAsset.scene,door:doorAsset.scene});
 const morphs=[0,0,0,0];
 function update(s,{index,form,energy,time,reduce,dt,room,portrait}){
  const u=reduce?(s.age>=0?1:0):s.unfold,charge=s.charge,clock=reduce?0:time,target=form?Math.max(0,(energy-.18)*.58,u,charge*.28):0;morphs[index]+=(target-morphs[index])*(reduce?1:1-Math.exp(-dt*5));const morph=morphs[index];
  if(index===0){const roomScale=room?.64:1,offset=room?(portrait?-1.08:-.50):0;contact.visible=room&&morph<.12;contact.position.y=-1.3+offset;glass.material.color.copy(room?roomTint:neutralTint);mirrorBody.scale.setScalar(roomScale*mirrorBody.userData.unitScale*(1-morph*.24));mirrorText.scale.setScalar(roomScale);mirrorBody.position.set(0,morph*.65+offset,morph*.33+u*.1-charge*.08);mirrorText.material.opacity=(.4+energy*.6)*(1-charge*.6);mirrorText.position.set(0,(-.14+morph*.77)*roomScale+offset,(.205+morph*.33+u*.1)*roomScale);glass.material.emissiveIntensity=.01+u*.04+charge*.05+morph*.08;}
  if(index===1){const p=mechanics[1].pivot,direction=mechanics[1].direction;models[1].scale.setScalar(T.MathUtils.lerp(1.5,1,morph));if(u>.001){p.rotation.z+=direction===0?Math.sin(s.age*9)*u*.018:Math.sin(Math.max(s.age,0)*3.8*direction)*u*.48;p.rotation.x=direction===0?0:Math.cos(clock*3.8*direction)*u*.24;}else p.rotation.x=0;
  }
  if(index===2){const arc=mechanics[2];arc.leaves.forEach((card,i)=>{const delay=.8+i*.13,spread=s.age<0?0:Math.min(1,Math.max(0,(s.age-delay)/.55))*Math.min(1,s.remaining/1.1),slots=[[-1.35,.55],[1.35,.55],[0,1.1],[-1.35,-1.25],[1.35,-1.25]];card.scale.setScalar(1-morph*.12);if(!form&&s.age>=0){const separate=T.MathUtils.smoothstep(s.age,0,.65);card.position.x=(i-2)*(.18+separate*.92);card.rotation.z=(i-2)*-.035*separate;}if(charge>0){card.position.x*=1-charge*.9;card.position.y-=charge*.15;}if(form&&morph>.01){card.position.x=T.MathUtils.lerp(card.position.x,slots[i][0],morph);card.position.y=T.MathUtils.lerp(card.position.y,slots[i][1],morph);card.position.z=.4+i*.03;card.rotation.z*=1-morph;}if(spread>0){card.rotation.y=T.MathUtils.lerp(Math.PI,TAU,spread);card.position.z+=u*(i===arc.selected?.26:.08);}if(i===2){const face=card.children[0];const selected=arc.selected===2&&(arc.preview||spread>.45||arc.flip>.45);face.userData.gold.value=Number(selected);face.userData.edgeLight.visible=selected;}});}
  if(index===3){const b=mechanics[3];bookBody.clasp.rotation.y=Math.min(1,energy/.24)*1.65;coverHinge.rotation.y=-(form?1.4+energy*.25:Math.max(0,(energy-.22)/.7)*2.35+u*.4);bookBody.rotation.x=-morph*.25;bookBody.position.y=-morph*.35;bookBody.scale.setScalar(bookBody.userData.unitScale*(1-morph*.15));sheet.visible=energy>.3||u>.1;sheet.position.y=-.04-morph*.20;sheet.rotation.x=-morph*.18;
  }
  return domains.update(s,{index,form,energy,time,reduce,dt});
 }
 return {update};
}







