import * as T from 'three';

export function createRelicParticles(parent, reduce, {mechanics}) {
 const mirror = mechanics[0].face;
 const silver = {clock: {value: 0}, strength: {value: 0}};
 mirror.material.onBeforeCompile = shader => {
  shader.uniforms.veinClock = silver.clock;
  shader.uniforms.veinStrength = silver.strength;
  shader.vertexShader = 'varying vec3 veinPoint;\n' + shader.vertexShader.replace(
   '#include <begin_vertex>', '#include <begin_vertex>\nveinPoint = position;'
  );
  shader.fragmentShader = `varying vec3 veinPoint;
   uniform float veinClock, veinStrength;
  ` + shader.fragmentShader.replace('#include <emissivemap_fragment>', `
   #include <emissivemap_fragment>
   vec2 p = veinPoint.xy / vec2(1.115, 1.545);
   float radius = length(p);
   float angle = atan(p.y,p.x);
   float growth = smoothstep(0., 1., veinStrength);
   float fork = sin(angle*8. + sin(radius*12.)*.65 + radius*3.);
   float branch = sin(angle*16. - radius*9. + sin(angle*5.));
   float veins = pow(max(0., fork), 24.) * .72 + pow(max(0., branch), 45.) * .23;
   float question = exp(-pow((radius - growth*.85)*8.,2.));
   float silvering = (veins + question*.34) * smoothstep(.02,.19,radius)
     * (1.-smoothstep(growth*.86,growth*.94+.06,radius));
   float drift = sin(p.x*4.+p.y*6.+sin(p.y*5.-p.x*2.+veinClock*.09)*.8);
   float smoke = smoothstep(-.3,.7,drift+sin(p.x*12.-p.y*9.)*.15);
   totalEmissiveRadiance += vec3(.023,.031,.041) * smoke;
   totalEmissiveRadiance += vec3(.77,.81,.87) * silvering * (growth*.92) * (.86+sin(veinClock*1.8-radius*4.)*.14);
  `);
 };

 const trailSize = 42;
 const history = Array.from({length: trailSize}, () => new T.Vector3());
 const trailGeo = new T.BufferGeometry();
 const positions = new T.BufferAttribute(new Float32Array(trailSize * 6), 3);
 const ages = new Float32Array(trailSize * 2);
 const indices = [];
 for (let i = 0; i < trailSize; i++) {
  ages[i * 2] = ages[i * 2 + 1] = 1 - i / (trailSize - 1);
  if (i < trailSize - 1) indices.push(i*2,i*2+1,i*2+2,i*2+1,i*2+3,i*2+2);
 }
 trailGeo.setAttribute('position', positions);
 trailGeo.setAttribute('weight', new T.BufferAttribute(ages, 1));
 trailGeo.setIndex(indices);
 const ribbon = new T.Mesh(trailGeo, new T.ShaderMaterial({
  transparent: true, side: T.DoubleSide, depthWrite: false,
  uniforms: {opacity: {value: 0}},
  vertexShader: 'attribute float weight; varying float vWeight; void main(){vWeight=weight; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: 'uniform float opacity; varying float vWeight; void main(){gl_FragColor=vec4(.87,.70,.38,opacity*vWeight*vWeight);}'
 }));
 ribbon.frustumCulled = false;
 parent.add(ribbon);
 const tip = new T.Vector3();
 let tracking = false, sampleTime = 0;

 const book = mechanics[3];
 const ink = {clock: {value: 0}, strength: {value: 0}};
 book.sheet.material.onBeforeCompile = shader => {
  shader.uniforms.inkClock = ink.clock;
  shader.uniforms.inkStrength = ink.strength;
  shader.vertexShader = 'varying vec2 inkPoint;\n' + shader.vertexShader.replace(
   '#include <begin_vertex>', '#include <begin_vertex>\ninkPoint = uv;'
  );
  shader.fragmentShader = `varying vec2 inkPoint;
   uniform float inkClock, inkStrength;
  ` + shader.fragmentShader.replace('#include <map_fragment>', `
   #include <map_fragment>
   vec2 p = inkPoint;
   float edge = sin(p.x*36.+p.y*17.)*.014 + sin(p.y*73.)*.011;
   float stain = 1.-smoothstep(.06,.26,length((p-vec2(.54,.54))*vec2(.8,1.5))+edge);
   float crawl = sin(p.x*42.+sin(p.y*19.)*2.+inkClock*.55);
   float line = 1.-smoothstep(.023,.08,abs(fract(p.y*22.+edge+crawl*.033)-.5));
   float scatter = pow(max(0.,sin(p.x*79.+p.y*127.)*cos(p.x*133.-p.y*61.)),6.);
   float bleed = clamp(stain*(.22+line*.78+scatter*.45),0.,1.) * inkStrength;
   diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.047,.032,.035), bleed);
  `);
 };
 function update(state, {index, time}) {
  const activity = Math.max(state.charge, state.unfold, state.inspect * .82);
  const clock = reduce ? 0 : time;
  silver.clock.value = clock;
  silver.strength.value = index === 0 ? .16 + activity * .84 : 0;
  ink.clock.value = clock;
  ink.strength.value = .38 + activity * .62;
  ribbon.visible = index === 1 && !reduce;
  if (ribbon.visible) {
   const pivot = mechanics[1].pivot;
   tip.set(0, -3.16, 0);
   parent.worldToLocal(pivot.localToWorld(tip));
   if (!tracking) {
    history.forEach(point => point.copy(tip));
    sampleTime = 0;
   }
   if (clock - sampleTime > .018) {
    history.unshift(history.pop().copy(tip));
    sampleTime = clock;
   }
   for (let i = 0; i < trailSize; i++) {
    const point = history[i], width = (1-i/trailSize)*(.018+activity*.055);
    positions.setXYZ(i*2, point.x, point.y-width, point.z);
    positions.setXYZ(i*2+1, point.x, point.y+width, point.z);
   }
   positions.needsUpdate = true;
   ribbon.material.uniforms.opacity.value = .26 + activity * .63;
  }
  tracking = ribbon.visible;
  
 }
 return {update};
}
