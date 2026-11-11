const $=s=>document.querySelector(s),musicButton=$('#music-toggle'),volume=$('#sound-volume');
const music=new Audio('media/audio/grey-mist-theme.mp3');music.id='ambience-track';music.hidden=true;music.setAttribute('aria-hidden','true');music.loop=true;music.preload='none';document.body.append(music);
const samples={page:'page',chime:'chime',seal:'seal'};
let musicOn=false,effectsOn=false,context=null,lastEffect=0;
const active=new Set();
function level(){return +volume.value/100}
function syncMusic(){
 const duck=document.body.classList.contains('arrival-active')||$('.voice-small')?.classList.contains('listening');
 music.volume=Math.min(1,level()*(duck?.4:1));
 if(musicOn&&!document.hidden)music.play().catch(()=>{musicOn=false;musicButton.setAttribute('aria-pressed','false');musicButton.textContent='播放音乐'});else music.pause();
}
musicButton.onclick=()=>{musicOn=!musicOn;musicButton.setAttribute('aria-pressed',String(musicOn));musicButton.textContent=musicOn?'暂停音乐':'播放音乐';syncMusic()};
document.querySelectorAll('[data-effects-toggle]').forEach(button=>button.onclick=()=>{
 effectsOn=!effectsOn;document.querySelectorAll('[data-effects-toggle]').forEach(b=>b.setAttribute('aria-pressed',String(effectsOn)));
 if(effectsOn){context ||= new AudioContext();context.resume().catch(()=>{});effect('chime');}
 else{active.forEach(a=>a.pause());active.clear();}
});
function effect(name){
 if(!effectsOn||document.hidden||performance.now()-lastEffect<250)return;
 lastEffect=performance.now();
 if(active.size>=2){const old=active.values().next().value;old.pause();active.delete(old);}
 const a=new Audio('media/audio/'+samples[name]+'.mp3');a.volume=Math.min(.45,level()*(name==='seal'?.65:1));active.add(a);
 a.addEventListener('ended',()=>active.delete(a),{once:true});a.addEventListener('error',()=>active.delete(a),{once:true});a.play().catch(()=>active.delete(a));
}
document.addEventListener('ritual-tone',event=>{
 if(!effectsOn||document.hidden||!context)return;
 const {freq,duration}=event.detail,now=context.currentTime,osc=context.createOscillator(),gain=context.createGain();
 osc.frequency.setValueAtTime(freq,now);osc.frequency.exponentialRampToValueAtTime(freq*.6,now+duration);
 gain.gain.setValueAtTime(Math.max(.0001,level()*.12),now);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
 osc.connect(gain).connect(context.destination);osc.start();osc.stop(now+duration);
});
document.addEventListener('relic-lore-action',event=>{const kind=event.detail?.kind;if(kind==='read')effect('page');if(kind==='unlock')effect('seal');if(kind==='divine')effect('chime')});
document.addEventListener('chapter-feedback',event=>{const kind=event.detail?.kind;if(kind==='discover'||kind==='verify')effect('chime');if(kind==='seal'||kind==='ending')effect('seal')});
document.addEventListener('click',event=>{const b=event.target.closest('button');if(b&&['上一页','下一页'].includes(b.textContent.trim()))effect('page')});
volume.oninput=()=>{syncMusic();$('#sound-level').value=volume.value+'%';try{localStorage.setItem('veil-sound-volume',volume.value)}catch{}};
try{const saved=localStorage.getItem('veil-sound-volume');if(saved!==null&&+saved>=0&&+saved<=50)volume.value=saved}catch{}
$('#sound-level').value=volume.value+'%';
document.addEventListener('arrival-state',syncMusic);
document.addEventListener('visibilitychange',()=>{if(document.hidden){active.forEach(a=>a.pause());active.clear();context?.suspend()}else if(effectsOn)context?.resume().catch(()=>{});syncMusic()});
const mic=$('.voice-small');if(mic)new MutationObserver(syncMusic).observe(mic,{attributes:true,attributeFilter:['class']});
music.addEventListener('error',()=>{musicOn=false;musicButton.setAttribute('aria-pressed','false');musicButton.textContent='音乐暂不可用'});
addEventListener('pagehide',event=>{music.pause();active.forEach(a=>a.pause());active.clear();if(event.persisted)context?.suspend();else context?.close()});
addEventListener('pageshow',event=>{if(event.persisted){if(effectsOn)context?.resume().catch(()=>{});syncMusic()}});
