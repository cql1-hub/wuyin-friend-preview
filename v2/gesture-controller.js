// Pure input interpreter: no DOM, camera or rendering dependencies.
export class RelicGestures {
 constructor(){this.reset()}
 reset(){this.kind='';this.candidate='';this.since=0;this.candidateSince=0;this.latched=false;this.charge=0;this.samples=[];this.cooldown=0;this.grab=null;this.anchor=null;this.progress=0;this.pinched=false;}
 changeRelic(){const heldV=this.kind==='switch',cooldown=this.cooldown;this.reset();this.cooldown=cooldown;if(heldV){this.kind=this.candidate='switch';this.latched=true;}}
 update(hands,now){
  if(!hands.length||hands.some(h=>h.length<21||h.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))){const cooldown=this.cooldown;this.reset();this.cooldown=cooldown;return {kind:'lost',progress:0}}
  const p=hands[0],distance=(a,b)=>Math.hypot(p[a].x-p[b].x,p[a].y-p[b].y),palm=Math.max(.045,Math.hypot(p[5].x-p[17].x,p[5].y-p[17].y));
  const fingers=[8,12,16,20].map((tip,i)=>distance(tip,0)>distance([6,10,14,18][i],0)*1.08);
  const pinchRatio=distance(4,8)/palm;
  const pinched=this.pinched?pinchRatio<.5:pinchRatio<.38;
  this.pinched=pinched;
  const kind=hands.length===2?'dual':fingers.every(v=>!v)?'charge':pinched?'grab':fingers.filter(Boolean).length<=1&&!fingers[0]?'charge':fingers[0]&&fingers[1]&&!fingers[2]&&!fingers[3]?'switch':fingers[0]&&!fingers[1]&&!fingers[2]&&!fingers[3]?'inspect':fingers.filter(Boolean).length>=3?'palm':'open';
  if(this.candidate!==kind){this.candidate=kind;this.candidateSince=now}
  if(kind!==this.kind&&now-this.candidateSince<190)return {kind:this.kind,progress:this.progress,stabilizing:true};
  let release=0;if(kind!==this.kind){if(this.kind==='charge'&&(kind==='palm'||kind==='open')&&this.charge>.2){release=this.charge;this.cooldown=Math.max(this.cooldown,now+1000)}this.kind=kind;this.since=now;this.latched=false;this.samples=[];this.grab=null;this.anchor=null;this.charge=0;}
  const out={kind,progress:0,release};
  if(kind==='dual'){const palms=hands.map(h=>h[9]).sort((a,b)=>a.x-b.x),[a,b]=palms;out.energy=Math.max(0,Math.min(1,(Math.hypot(a.x-b.x,a.y-b.y)-.12)/.55));out.twist=Math.atan2(b.y-a.y,b.x-a.x);out.progress=out.energy;}
  else if(kind==='charge'){out.charge=Math.min(1,(now-this.since)/1200);this.charge=out.charge;out.progress=out.charge;}
  else if(kind==='switch'){out.progress=Math.min(1,(now-this.since)/800);if(out.progress===1&&!this.latched&&now>this.cooldown){out.switch=1;this.latched=true;this.cooldown=now+1200}}
  else if(kind==='grab'){const center={x:(p[4].x+p[8].x)/2,y:(p[4].y+p[8].y)/2};if(this.grab){out.dx=(this.grab.x-center.x)*6;out.dy=(center.y-this.grab.y)*3}this.grab=center;out.progress=1;}
  else if(kind==='inspect'){const tip=p[8];if(!this.anchor||Math.hypot(tip.x-this.anchor.x,tip.y-this.anchor.y)>.065){this.anchor={x:tip.x,y:tip.y};this.since=now;this.latched=false}out.progress=Math.min(1,(now-this.since)/1100);if(out.progress===1&&!this.latched){out.inspect=true;this.latched=true}}
  else if(kind==='palm'){this.samples.push({x:p[9].x,time:now});this.samples=this.samples.filter(s=>now-s.time<550);const first=this.samples[0];if(!release&&first&&Math.abs(p[9].x-first.x)>.22&&now>this.cooldown){out.switch=p[9].x<first.x?1:-1;this.cooldown=now+1400;this.samples=[];out.kind='swipe'}}
  else out.energy=Math.max(0,Math.min(1,(distance(4,8)/palm-.12)/.95));
  this.progress=out.progress;return out;
 }
}
