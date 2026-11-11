export const rituals = [
 {name:'镜中叩问',forms:['涟漪显影','灰雾镜庭 · 二创领域'],steps:['镜面凝息','银纹显影','镜中回应','涟漪归镜']},
 {name:'灵摆问卜',forms:['往复裁决','命运星穹 · 二创领域'],steps:['提链聚焦','摆锤出弦','轨迹成谶','垂链回稳']},
 {name:'亵渎之牌',forms:['逐张翻面','律令王庭 · 二创领域'],steps:['叠牌蓄势','逐张翻面','律令列阵','归牌封存']},
 {name:'禁书开封',forms:['浮页解读','失落书库 · 二创领域'],steps:['书扣松动','书封开启','残页浮现','墨迹归卷']}
];
export const alternateSteps=[['灰雾聚庭','镜座升起','主位叩问','诸座归雾'],['星位聚拢','天轴旋开','命运巡轨','群星归位'],['律令降临','王庭拔起','威严敕令','王庭隐没'],['墨迹离卷','书库展开','残篇巡游','历史归卷']];
const timing=[[.85,2.65,4.1],[.65,3.55,5.25],[1.4,3.1,4.65],[1.15,3.6,5.1]];
const domainTiming=[[1.65,5.6,8.1],[1.5,6,8.8],[2.2,5.8,8.5],[2,6.4,9.3]];
export const domainHints=['握拳聚雾，张掌唤醒主位；双手拉开镜座','握拳聚星，张掌转动天轴；双手开合星穹','握拳敛律，张掌升起王庭；双手牵动敕令','握拳聚墨，张掌展开书库；双手拉开书架'];
export class RitualMotion {
 constructor(){this.reset(0)}
 reset(scene=this.scene,form=0){this.scene=scene;this.form=form;this.age=-1;this.strength=0;this.inspect=0;}
 release(strength=1){if(this.age>=0)return false;this.age=0;this.strength=Math.min(1,Math.max(.25,strength));return true;}
 touch(){this.inspect=1;}
 update(dt,charge=0){
  this.inspect=Math.max(0,this.inspect-dt*1.3);
  const [open,hold,end]=(this.form?domainTiming:timing)[this.scene];let finished=false;
  if(this.age>=0){this.age+=Math.min(.1,Math.max(0,dt));if(this.age>=end){this.age=-1;finished=true;}}
  const t=this.age,opening=t<0?0:Math.min(1,t/open),closing=t<hold?1:Math.max(0,1-(t-hold)/(end-hold));
  const unfold=(1-Math.pow(1-opening,3))*closing;
  const stage=t<0?(charge>.015?'charge':'idle'):t<open?'open':t<hold?'hold':'settle';
  const step=stage==='charge'?0:stage==='open'?1:stage==='hold'?2:stage==='settle'?3:-1;
  return {stage,step,age:t,unfold,power:this.strength,charge,inspect:this.inspect,remaining:t<0?0:end-t,finished,progress:t<0?charge:t/end};
 }
}
