import {createRelicParticles} from './relic-effects.js';
import {RitualMotion,rituals,alternateSteps,domainHints} from './ritual-motion.mjs';
export function createRitualFeedback(scene,reduce,assets){
 const motion=new RitualMotion(),forms=[0,0,0,0];let sceneId=0,full=false,clock=0;
 const field=createRelicParticles(scene,reduce,assets);
 const hud=document.createElement('div');hud.className='ritual-hud';hud.innerHTML='<div class="ritual-readout"><strong>灵性待命</strong><span>选择形态，再牵引遗物</span><ol class="ritual-chain" aria-label="当前遗物动作链"></ol></div><a class="relic-source" href="media/relic-v3/SOURCES.md" target="_blank" rel="noopener">模型与牌面来源</a><label class="ritual-form">形态<select aria-label="形态"></select></label><progress max="1" value="0" aria-label="仪式进度"></progress><button type="button" data-effects-toggle aria-pressed="false">交互音效</button><button type="button" class="effect-demo">演绎此形态</button>';document.querySelector('footer').before(hud);
 const label=hud.querySelector('strong'),hint=hud.querySelector('span'),bar=hud.querySelector('progress'),select=hud.querySelector('select'),chain=hud.querySelector('ol');
 function setUI(){select.replaceChildren(...rituals[sceneId].forms.map((name,i)=>new Option(name,i)));select.value=forms[sceneId];chain.replaceChildren(...(forms[sceneId]?alternateSteps[sceneId]:rituals[sceneId].steps).map(text=>{const li=document.createElement('li');li.textContent=text;return li}));}
 function reset(index=sceneId){sceneId=index;motion.reset(index,forms[index]);full=false;setUI();}
 select.onchange=()=>{forms[sceneId]=+select.value;motion.reset(sceneId,forms[sceneId]);setUI();document.dispatchEvent(new CustomEvent('relic-form',{detail:{scene:sceneId,form:+select.value}}));};
 function tone(freq,duration){document.dispatchEvent(new CustomEvent('ritual-tone',{detail:{freq,duration}}))}
 function release(strength=1){const accepted=motion.release(strength);if(accepted){full=false;tone([260,190,330,145][sceneId],.6)}return accepted;}
 function update(dt,{charge,energy,kind,kindProgress,active,scene:index,switching=false}){
  if(index!==sceneId)reset(index);clock+=dt;const s=motion.update(dt,charge);s.form=forms[index];
  if(charge>.97&&!full){full=true;tone(650,.18)}if(charge<.05)full=false;
  const steps=s.form?alternateSteps[index]:rituals[index].steps,busy=s.stage!=='idle'&&s.stage!=='charge';bar.value=s.progress;label.textContent=s.stage==='charge'?steps[0]:busy?steps[s.step]:rituals[index].name+' · 待命';
  hint.textContent=s.stage==='charge'?'保持握拳或长按；张掌或松开后释放':busy?rituals[index].forms[s.form]+' · '+(s.stage==='settle'?'余韵正在归拢':'可捏合转动视角，释放结束后可再次演绎'):active?({grab:'捏合牵引 · 移动控制朝向',dual:'双手开合 · 改变当前结构展开程度',inspect:'食指停留 · 触发遗物内容',lost:'手已离开 · 蓄能取消',charge:'握拳开始汇聚'})[kind]||'握拳汇聚，张掌释放；V 停留切换':s.form?domainHints[index]+'；也可长按或拖动滑杆':'轻点查看内容 · 拖动旋转 · 长按汇聚后松开';
  [...chain.children].forEach((li,i)=>{li.classList.toggle('current',i===s.step);if(i===s.step)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current')});
  hud.dataset.phase=s.stage;hud.dataset.form=String(s.form);hud.querySelector('.effect-demo').disabled=busy||switching;select.disabled=busy||switching;
  return {...s,burst:s.unfold*s.power,charging:charge};
 }
 reset();return {update,release,reset,touch:()=>motion.touch(),hud,updateEffects:(state,index)=>field.update(state,{index,time:clock})};
}


