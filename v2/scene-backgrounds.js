// Fan/original rooms only. Official world-scene layers are not fetched or shown.
export function installSceneBackgrounds({film,reduce,toast}) {
 const selector=document.querySelector('#scene-select');
 const host=document.querySelector('#world-scenery');
 const pause=document.querySelector('#film-toggle');
 const focus=document.querySelector('#scene-focus');
 const status=document.querySelector('#scene-status');
 const source=document.querySelector('#scene-source');
 if(source) source.hidden=true;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const allowed=new Set(['exhibition','mist']);
 let playing=!reduce,active='exhibition',request=0,current=null;
 function syncPlayback(){
  const visible=playing&&!document.hidden&&!document.body.classList.contains('arrival-active');
  for(const video of [film,...host.querySelectorAll('video')]){
   const selected=video===film?active==='mist':current?.contains(video);
   if(visible&&selected)video.play().catch(()=>{});else video.pause();
  }
  pause.textContent=playing?'暂停背景':'播放背景';
  pause.setAttribute('aria-pressed',String(playing));
 }
 pause.onclick=()=>{playing=!playing;syncPlayback()};
 film.addEventListener('ended',()=>{if(active==='mist'&&playing){film.currentTime=4.5;syncPlayback()}});
 film.addEventListener('error',()=>toast('背景视频暂不可用，已保留静态画面。'));
 document.addEventListener('visibilitychange',syncPlayback);
 document.addEventListener('arrival-state',syncPlayback);
 motion.addEventListener('change',event=>{if(event.matches){playing=false;syncPlayback()}});
 function setFocus(value){
  document.body.classList.toggle('scenery-only',value);
  document.querySelector('.glass-shell').inert=value;
  focus.textContent=value?'返回遗物':'只看场景';
  focus.setAttribute('aria-pressed',String(value));
 }
 focus.onclick=()=>setFocus(!document.body.classList.contains('scenery-only'));
 document.addEventListener('keydown',event=>{if(event.key==='Escape')setFocus(false)});
 async function select(id){
  const sequence=++request;
  if(!allowed.has(id))id='exhibition';
  selector.setAttribute('aria-busy','true');status.textContent='场景载入中…';
  try{
   if(sequence!==request)return;
   current?.classList.remove('visible');current=null;active=id;
   film.classList.toggle('film-hidden',id!=='mist');
   document.body.dataset.environment=id;
   document.body.classList.remove('official-scenery');
   selector.value=id;
   status.textContent=id==='exhibition'?'雾中陈列室':'灰雾散去 · 光束照入';
   if(source) source.hidden=true;
   try{localStorage.setItem('veil-exhibition-scene',id)}catch{}
   syncPlayback();
   document.documentElement.dataset.sceneReady=id;document.dispatchEvent(new CustomEvent('world-scene-ready',{detail:id}));
  }catch{
   if(sequence!==request)return;
   selector.value=active;status.textContent='场景暂不可用，已保留当前画面。';
  }finally{if(sequence===request)selector.removeAttribute('aria-busy')}
 }
 selector.onchange=()=>select(selector.value);
 document.querySelector('#replay').addEventListener('click',()=>{
  playing=true;film.currentTime=0;select('mist');
 });
 selector.disabled=false;
 let saved='exhibition';
 try{saved=localStorage.getItem('veil-exhibition-scene')||saved}catch{}
 select(allowed.has(saved)?saved:'exhibition');
}
