import {createFoolAvatar} from './fool-avatar.js';
let avatarPromise,preview=false;
export function prepareFool(){
 if(!avatarPromise){
  const host=document.createElement('div');host.id='fool-veil';host.setAttribute('aria-hidden','true');document.body.prepend(host);
  avatarPromise=createFoolAvatar(host,{reduce:matchMedia('(prefers-reduced-motion: reduce)').matches});
 }
 return avatarPromise;
}
export async function showFoolPreview(){
 const avatar=await prepareFool();preview=!preview;document.body.classList.toggle('fool-preview',preview);avatar.setEnabled(preview);return preview;
}
document.addEventListener('fool-camera',()=>{preview=false;document.body.classList.remove('fool-preview');const button=document.querySelector('#avatar-preview');if(button)button.textContent='预览愚者姿态';});
document.addEventListener('keydown',event=>{
 if(event.key!=='Escape'||!document.body.classList.contains('fool-preview'))return;
 preview=false;document.body.classList.remove('fool-preview');avatarPromise?.then(avatar=>avatar.setEnabled(false));
 const button=document.querySelector('#avatar-preview');if(button){button.textContent='预览愚者姿态';button.setAttribute('aria-pressed','false');button.focus({preventScroll:true})}
});
