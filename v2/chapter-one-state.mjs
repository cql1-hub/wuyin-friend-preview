// Original fan mystery. Critical facts never depend on a remote language model.
export const SAVE_KEY='veil-fifth-visitor-v1';
export const EVIDENCE={
 letter:{name:'空席的约定',source:'来信背面',text:'四位来客，一席留给映像。封门后，不再接待来客。'},
 register:{name:'第五行登记',source:'笔记 · 肉眼',text:'22:00，四名来客入席，门已封闭。22:07，第五位访客到达，请于22:10为其开门。'},
 overwritten:{name:'被覆盖的原句',source:'笔记 · 灵视',text:'“第五位访客到达”覆盖了原句“多出一道无主的倒影”。两行字出自同一处，却不是同一种墨。'},
 witness:{name:'四人，五道倒影',source:'魔镜见闻',text:'封门后，无人进入。镜中只有四张来客的面孔，却多出一道没有对应实体的倒影。'},
 pendulum:{name:'否定的摆动',source:'灵摆 · 交叉核验',text:'针对“第五位访客拥有独立实体”的陈述，灵摆作否定回应。它只能辅助核验，不能代替记录与见闻。'},
 seal:{name:'保留空席的封印',source:'亵渎之牌 · 隐藏文字',text:'封住被改写的第五行，保留映像之席。毁镜只会破坏观测，开门则会让倒影获得离开的路径。'}
};
export const ENDINGS={
 lost:{title:'门外多了一道脚步',text:'你依据第五行打开了门。门外没有来客，身后却多了一道脚步。那条记录要的从来不是入场，而是一次离开的机会。',lesson:'登记不等于事实。重新比对笔记的底字与魔镜见闻。'},
 broken:{title:'失去见证的房间',text:'银镜碎裂，房间安静下来。你毁掉了见证者，却没有消除被改写的第五行。空椅仍朝着门。',lesson:'先区分异常的来源与观察异常的媒介。'},
 uncertain:{title:'暂时的静默',text:'你封住第五行，敲门声停了。但你的归因或提交的证据不足，仍无法解释为什么会有第五条记录。',lesson:'要同时说明“原句被改写”与“没有第五个实体来客”。可继续调查后重新提交。'},
 solved:{title:'没有第五位来客',text:'两份独立记录终于吻合：被写成访客的，是一道没有主人的倒影。第五行被封住，空椅缓缓转回桌前。你阻止了它借开门离开。',lesson:'主要矛盾已解开。灵摆与牌面仍藏着更完整的封印办法。'},
 complete:{title:'空席仍为映像保留',text:'你用笔记与魔镜确认事实，以灵摆交叉核验，再按牌面的方式封住第五行。你没有毁镜，也没有撤去空席。第五道倒影回到它该在的位置，灰雾之上只余四个人的呼吸。',lesson:'完整调查达成。所有关键证物都进入了你的论证。'}
};
export function initialState(){return {version:1,started:false,evidence:[],hints:0,ending:null,attempts:0,mode:'story',insight:false,page:0};}
export function restoreState(raw){
 try{const s=typeof raw==='string'?JSON.parse(raw):raw;if(!s||s.version!==1)return initialState();
 const evidence=[...new Set((Array.isArray(s.evidence)?s.evidence:[]).filter(k=>Object.hasOwn(EVIDENCE,k)))];
 return {...initialState(),started:s.started===true,evidence:s.started===true?evidence:[],hints:Math.max(0,Math.min(3,Number.isInteger(s.hints)?s.hints:0)),ending:Object.hasOwn(ENDINGS,s.ending)?s.ending:null,attempts:Math.max(0,Number.isInteger(s.attempts)?s.attempts:0),mode:s.mode==='free'?'free':'story',insight:s.insight===true,page:s.page===1?1:0};
 }catch{return initialState();}
}
export function addEvidence(s,id){if(!s.started||!Object.hasOwn(EVIDENCE,id)||s.evidence.includes(id))return false;s.evidence.push(id);return true;}
export function resolveVerdict(s,{identity,action,proof=[]}){
 if(!s.started||!s.evidence.includes('register')||!s.evidence.includes('witness'))return null;
 if(action==='open')return 'lost';if(action==='break')return 'broken';
 if(action!=='seal'||identity!=='reflection')return 'uncertain';
 const submitted=new Set(proof.filter(id=>s.evidence.includes(id)));
 if(!submitted.has('overwritten')||!submitted.has('witness'))return 'uncertain';
 return ['letter','pendulum','seal'].every(id=>submitted.has(id))?'complete':'solved';
}
export function nextObjective(s){
 if(!s.started)return '拆开来信，接受调查。';
 if(s.ending==='complete')return '完整调查已完成。你可以重读证物，或重新开始。';
 if(!s.evidence.includes('letter'))return '检查银镜边缘，找出来信背面的约定。';
 if(!s.evidence.includes('register'))return '翻开安提哥努斯笔记，阅读今夜的来客登记。';
 if(!s.evidence.includes('overwritten'))return '同一页，用另一种目光再读一次。';
 if(!s.evidence.includes('witness'))return '向魔镜询问封门后的见闻。';
 if(s.ending)return '可继续补全证物，再作一次判断。';
 return '你已有判断的依据。也可以用灵摆与牌面继续核验。';
}
export function localAnswer(s,question){
 if(!s.started)return {text:'信还没有拆开。请先接受今夜的调查。'};
 const q=String(question).trim();
 if(/见到|看见|几人|几位|人数|来客|访客|封门|倒影|第五|发生/.test(q))return {id:'witness',text:'我亲眼所见：22:00封门后，无人进入。四位来客，五道倒影。多出的那一道，没有对应的实体。至于谁改了笔记——我的镜面没有照到执笔者，不能替你作证。'};
 if(/笔记|记录|改写|墨|登记/.test(q))return {text:s.evidence.includes('overwritten')?'你已找到底字。将“无主的倒影”与我的见闻放在一起，再判断第五行能否作为开门的理由。':'我只能证明自己见到的事。请先读登记，再用灵视检查同一行的底字。'};
 if(/密文|钥|口令|贝尔/.test(q))return {text:'我不会代你翻完笔记。封存人的附记或许保留了钥语。'};
 if(/封印|怎么|怎么办|开门|毁|破坏/.test(q))return {text:'在作决定前，请区分记录、见闻和推断。封存的具体方法，不在我的见闻之中；或许可以读一读牌的背面。'};
 return {text:'今夜我只就这桩调查作证。你可以问：“封门后，你看见了什么？” 若要聊原著或其他问题，请切换到自由档案；那里的问答会使用 DeepSeek。'};
}
export function hintFor(s,level){
 const explicit=nextObjective(s);
 return [
 '别急着相信“第五位”这个称呼。先把纸上写的，与遗物亲眼见到的分开。',
 !s.evidence.includes('overwritten')?'安提哥努斯笔记的同一页有两层文字。切换到灵视，检查第五行。':!s.evidence.includes('witness')?'回到阿罗德斯，问它封门后看见了什么。':'“被覆盖的原句”和魔镜见闻，是两份互相独立的证据。',
 explicit==='你已有判断的依据。也可以用灵摆与牌面继续核验。'?'核心判断：第五位是无主倒影。选择封住第五行，并提交“被覆盖的原句”与“四人，五道倒影”。完整结局还需来信、灵摆与牌面的证据。':explicit
 ][Math.min(2,Math.max(0,level-1))];
}
