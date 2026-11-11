import {SAVE_KEY,EVIDENCE,ENDINGS,initialState,restoreState,addEvidence,resolveVerdict,nextObjective,localAnswer,hintFor} from './chapter-one-state.mjs';

const $=s=>document.querySelector(s);
let state=initialState(),scene=0,verdictOpen=false,hintOpen=false,resetPending=false,message='',answer='',exchangeDone=false;
try{state=restoreState(localStorage.getItem(SAVE_KEY));}catch{}
const panel=document.createElement('section');panel.className='chapter-panel';panel.setAttribute('aria-label','第五位访客调查');
$('.control-column').prepend(panel);
const bar=document.createElement('section');bar.className='chapter-bar';bar.setAttribute('aria-label','探索模式');
bar.innerHTML='<div><h2>灰雾中的第五位访客</h2><p>一封来信。四件遗物。一条不该存在的记录。</p></div><div class="chapter-mode"><button type="button" data-mode="story">开始调查</button><button type="button" data-mode="free">自由档案</button></div>';
$('.glass-shell').before(bar);
const feedback=document.createElement('div');feedback.className='chapter-feedback';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
$('.workspace').after(feedback);
const notify=text=>{feedback.replaceChildren();const strong=document.createElement('strong');strong.textContent=text;feedback.append(strong);const span=document.createElement('span');span.textContent=state.mode==='story'?'调查进度仅保存在这台设备':'自由档案 · 保留调查存档';feedback.append(span);};
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch{notify('浏览器未允许保存；本次调查仍可继续。');}}
const dispatch=(name,detail)=>document.dispatchEvent(new CustomEvent(name,{detail}));
function select(index){dispatch('chapter-select-relic',index);}
function pulse(kind='discover'){dispatch('chapter-feedback',{kind,count:state.evidence.length,ending:state.ending});}
function collect(id){if(addEvidence(state,id)){save();notify('证物已收录：'+EVIDENCE[id].name);pulse();return true;}return false;}
function button(action,text,extra=''){return `<button type="button" data-action="${action}" ${extra}>${text}</button>`;}
function escape(text){const el=document.createElement('span');el.textContent=text;return el.innerHTML;}
function evidenceList(){return state.evidence.map(id=>`<li><strong>${EVIDENCE[id].name}</strong><span>${EVIDENCE[id].source}</span><p>${EVIDENCE[id].text}</p></li>`).join('');}
function bookText(){
 if(state.page===1)return state.insight?
 '封存人附记：\n钥语仍是「贝尔纳黛」。\n牌面记载的不是来客身份，而是让倒影留在映像中的办法。\n不要让登记替代你的见闻。':
 '封存人附记：\n钥语仍是「贝尔纳黛」。\n第五行的墨比其余字迹更深。纸张未破损，刮擦也无法去掉它。\n余下一席，请保持原样。';
 return state.insight?
 '22:00　四名来客入席，门已封闭。\n22:07　多出一道无主的倒影。\n\n底字上覆盖着另一行墨：\n「第五位访客到达，请于22:10为其开门。」\n两层笔迹，来自两种墨。':
 '22:00　四名来客入席，门已封闭。\n22:07　第五位访客到达，请于22:10为其开门。\n\n第五行的字迹略有重影。\n封存人的附记在下一页。';
}
function paintPage(){dispatch('notebook-content',{title:state.page?'封存人附记':'今夜的登记',text:bookText()});dispatch('relic-lore-action',{kind:'read',page:state.page,view:state.insight?1:0});}
function readBook(){collect('register');if(state.insight&&state.page===0)collect('overwritten');paintPage();}
function currentControls(){
 if(scene===0)return `<h3>封门后的见闻</h3><p>镜框边缘夹着一封信。镜中可以回答它亲眼所见的事。</p><div class="chapter-controls">${button('inspect',state.evidence.includes('letter')?'重看来信背面':'检查镜框与来信')}${button('witness','询问封门后的见闻')}</div><div class="case-question-slot"></div>${state.evidence.includes('letter')?'<div class="chapter-reading">四位来客，一席留给映像。\n封门后，不再接待来客。</div>':''}${answer?'<p class="chapter-answer">'+escape(answer)+'</p>':''}${state.evidence.includes('witness')&&!exchangeDone?'<p>镜中浮出反问：“你会相信亲眼所见，还是纸上的名字？”</p><div class="exchange-choice">'+button('exchange','我会交叉核验')+'</div><small>这次交换只记录在本机，不影响你能否获取证据。</small>':''}<small>下方可直接输入或语音询问本案。调查问答在本地运行。</small>`;
 if(scene===3)return `<h3>两层文字</h3><p>普通阅读看见表面记录。灵视揭示同一页被覆盖的字迹。</p><div class="chapter-controls">${button('ordinary','肉眼阅读',`aria-pressed="${!state.insight}"`)}${button('insight','开启灵视',`aria-pressed="${state.insight}"`)}</div><div class="chapter-reading ${state.insight?'insight':''}">${bookText()}</div><div class="chapter-controls">${button('page-back','来客登记',`aria-pressed="${state.page===0}"`)}${button('page-next','封存人附记',`aria-pressed="${state.page===1}"`)}</div>${button('read','收录此页线索')}<small>单击遗物或食指停留可检查当前页。蓄能后释放、握拳后张手或“唤醒遗物”可切换灵视。</small>`;
 if(scene===1)return `<h3>核验你的推断</h3><p>灵摆无法告诉你整个真相。先明确要核验的陈述。</p><form data-form="pendulum"><label for="case-statement">选择陈述<select id="case-statement"><option value="body">第五位访客拥有独立实体</option><option value="record">第五行的表面文字值得直接相信</option><option value="door">开门可以安全结束异常</option></select></label><button type="submit" class="chapter-primary">让灵摆核验</button></form><small>${state.evidence.includes('overwritten')&&state.evidence.includes('witness')?'已有两份独立证据，可以交叉核验。':'先取得笔记底字与魔镜见闻，避免让占卜代替调查。'} 结果仅为本案预设的剧情反馈。</small>`;
 return `<h3>牌背的封存方法</h3><p>知识被一句钥语封住。封存人的附记也许留着它。</p><form data-form="card"><label for="case-key">输入钥语<input id="case-key" type="text" maxlength="30" autocomplete="off" placeholder="从笔记附记寻找线索"></label><button type="submit" class="chapter-primary">揭示隐藏文字</button></form>${state.evidence.includes('seal')?'<div class="chapter-reading">封住被改写的第五行。\n保留映像之席。\n不必毁镜，不要开门。</div>':''}<small>此处封印与谜案为同人原创机制，不是原著能力条目。</small>`;
}
function verdict(){return `<div class="chapter-verdict"><h3>你如何解释第五位？</h3><p>选择你的判断，并把支持它的证物放入论证。</p><form data-form="verdict"><label for="case-identity">“第五位”是什么<select id="case-identity"><option value="guest">一位迟到的实体访客</option><option value="reflection">一道没有对应实体的倒影</option><option value="mirror">魔镜本身伪装的主人</option></select></label><label for="case-action">如何处理<select id="case-action"><option value="open">按照登记，为它开门</option><option value="seal">封住第五行，保留空席</option><option value="break">打碎魔镜，消除异常</option></select></label><fieldset style="border:0;padding:0;margin:15px 0"><legend>提交证据 · 可多选</legend>${state.evidence.map(id=>`<label class="proof-option"><input type="checkbox" name="proof" value="${id}"><span>${EVIDENCE[id].name}</span></label>`).join('')}</fieldset><button type="submit" class="chapter-primary">提交判断</button> ${button('back','返回调查')}</form></div>`;}
function render(){
 document.body.classList.toggle('story-mode',state.mode==='story');dispatch('chapter-mode',state.mode);panel.hidden=state.mode!=='story';feedback.hidden=state.mode!=='story';
 document.title=state.mode==='story'?'第五位访客 · 雾隐':'雾隐 · 遗物档案';
 $('.stage-caption span:last-child').textContent=state.mode==='story'?['点按检查 · 蓄能释放询问见闻','选择陈述 · 蓄能释放交叉核验','输入钥语 · 蓄能释放唤醒文字','点按检查 · 蓄能释放切换灵视'][scene]:'拖动旋转 · 按住蓄能 · 松开释放';
 bar.querySelectorAll('[data-mode]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode));if(b.dataset.mode==='story')b.textContent=state.started?'继续调查':'开始调查';});
 const mirror=$('.mirror-input:not(.relic-input)');if(mirror){panel.after(mirror);mirror.classList.toggle('chapter-question-hidden',state.mode==='story'&&(scene!==0||verdictOpen||Boolean(state.ending)));mirror.querySelector('input').placeholder=state.mode==='story'?'问魔镜：封门后看见了什么？':'向阿罗德斯提问……';mirror.querySelector('.exchange').hidden=state.mode==='story'||mirror.querySelector('.exchange').hidden;}
 dispatch('chapter-letter',state.started);
 if(!state.started){panel.innerHTML='<h3>你收到了一封来信</h3><p>桌前放着四件遗物。登记的末行留着一笔未干的墨。</p><blockquote class="case-letter"><span class="letter-seal" aria-hidden="true"></span><p>今夜有四位来客。</p><strong class="letter-line">不要相信第五个人留下的记录</strong><cite>署名的位置，只留下被水洇开的墨。</cite></blockquote><p>查清哪一条记录被改写，再决定是否为第五位开门。</p><div class="chapter-controls">'+button('start','开始调查','class="chapter-primary"')+'</div><small>鼠标、触屏即可完成全部调查；手势是另一种操作方式。随时离开，下次从存档继续。</small>';return;}
 const ending=state.ending?ENDINGS[state.ending]:null;
 panel.innerHTML=`<div class="chapter-objective"><div class="chapter-meta"><span>调查笔记</span><span>证物 ${state.evidence.length} / 6</span></div><progress max="6" value="${state.evidence.length}" aria-label="已收录证物"></progress><strong>${nextObjective(state)}</strong></div>${ending?`<section class="chapter-ending"><h3>${ending.title}</h3><p>${ending.text}</p><small>${ending.lesson}</small><div class="chapter-controls">${button('continue','继续调查')}${button('reconsider','重新论证')}</div></section>`:verdictOpen?verdict():currentControls()}<p class="chapter-message" role="status">${escape(message)}</p>${!verdictOpen&&!ending?`<div class="chapter-controls">${button('notebook','去安提哥努斯笔记')}${button('mirror','回到魔镜')}${button('judge','作出判断',`class="chapter-primary" ${state.evidence.includes('register')&&state.evidence.includes('witness')?'':'disabled'}`)}</div>`:''}<details ${verdictOpen?'open':''}><summary>证物册 · ${state.evidence.length} 件</summary>${state.evidence.length?'<ul class="evidence-list">'+evidenceList()+'</ul>':'<p>还没有收录证物。先检查镜框中的来信。</p>'}</details><details ${hintOpen?'open':''} class="hint-details"><summary>需要一点提示</summary><p>提示逐级展开，不会扣除调查进度。</p>${hintOpen?'<p class="chapter-hint">'+hintFor(state,state.hints)+'</p>':''}${button('hint',state.hints>=3?'重看当前提示':'展开第 '+(state.hints+1)+' 级提示','class="chapter-hint-button"')}</details><details ${resetPending?'open':''}><summary>存档与操作</summary><p>检查：食指稳定停留，或点击展签上的遗物操作。翻页、灵视和核验也都有明确按钮，不要求开启摄像头。</p><small>进度自动保存在当前浏览器。自由档案保留原有 AI 问答与 12 章遗物资料。</small>${button('reset',resetPending?'确认从头调查':'重新开始')} ${resetPending?button('cancel-reset','保留存档'):''}</details>`;
 const slot=panel.querySelector('.case-question-slot');if(slot&&mirror&&state.mode==='story')slot.append(mirror);
}

function inspect(){
 if(state.mode!=='story'||!state.started)return false;
 if(scene===0){collect('letter');message='信的背面写着另一条约定。已收入证物册。';dispatch('mirror-answer','四位来客。\n一席留给映像。\n封门后，不再接待来客。');}
 else if(scene===3){readBook();message=state.insight?'底字在灵视下清晰起来。':'已收录表面登记。试着换一种目光。';}
 else if(scene===1){message='先在侧栏选定陈述，再让灵摆核验。';}
 else {message='牌背的文字仍被钥语遮蔽。翻看笔记的封存人附记。';}
 render();return true;
}
panel.addEventListener('click',event=>{
 const action=event.target.closest('[data-action]')?.dataset.action;if(!action)return;
 message='';
 if(action==='start'){state.started=true;save();select(0);notify('调查开始：先检查镜框中的来信。');pulse('start');}
 if(action==='inspect'){inspect();return;}
 if(action==='notebook')select(3);
 if(action==='mirror')select(0);
 if(action==='ordinary'||action==='insight'){state.insight=action==='insight';save();paintPage();message=state.insight?'灵视已开启。检查这一页，收录被覆盖的文字。':'已回到肉眼阅读。';pulse('insight');}
 if(action==='page-back'||action==='page-next'){state.page=action==='page-next'?1:0;save();paintPage();}
 if(action==='read')readBook();
 if(action==='witness')askMirror('封门后，你看见了什么？');
 if(action==='exchange'){exchangeDone=true;message='“很好。不要把一个名字，当作一个人的证据。”';}
 if(action==='judge'){verdictOpen=true;}
 if(action==='back')verdictOpen=false;
 if(action==='continue'){state.ending=null;verdictOpen=false;save();}
 if(action==='reconsider'){state.ending=null;verdictOpen=true;save();}
 if(action==='hint'){state.hints=Math.min(3,state.hints+1);hintOpen=true;save();}
 if(action==='cancel-reset')resetPending=false;
 if(action==='reset'){if(!resetPending){resetPending=true;message='再次确认才会替换当前调查存档。';}else{state=initialState();verdictOpen=false;hintOpen=false;resetPending=false;answer='';exchangeDone=false;save();select(0);dispatch('mirror-answer','一封来信，等待拆开。');pulse('reset');notify('已开始一份新的调查记录。');}}
 render();
 if(action==='judge'||action==='reconsider')panel.querySelector('select')?.focus();
});
panel.addEventListener('submit',event=>{
 const form=event.target;if(!form.dataset.form)return;event.preventDefault();message='';
 if(form.dataset.form==='pendulum'){
  if(!state.evidence.includes('overwritten')||!state.evidence.includes('witness'))message='还缺少独立证据。先检查笔记底字，再向魔镜询问封门后的见闻。';
  else{dispatch('relic-lore-action',{kind:'divine',direction:-1});collect('pendulum');message='灵摆作否定回应。'+{body:'第五位不是拥有独立实体的来客。',record:'第五行被改写，不能照单全信。',door:'开门不是安全的处理方法。'}[form.querySelector('select').value];pulse('verify');}
 }
 if(form.dataset.form==='card'){
  if(form.querySelector('input').value.trim().replace(/\s/g,'')==='贝尔纳黛'){collect('seal');dispatch('relic-lore-action',{kind:'unlock'});message='牌背的封存方法已显现。';pulse('seal');}
  else message='钥语没有唤醒牌面。请检查安提哥努斯笔记的“封存人附记”；不需要猜测原著冷知识。';
 }
 if(form.dataset.form==='verdict'){
  const result=resolveVerdict(state,{identity:form.querySelector('#case-identity').value,action:form.querySelector('#case-action').value,proof:[...form.querySelectorAll('[name=proof]:checked')].map(x=>x.value)});
  if(result){state.ending=result;state.attempts++;verdictOpen=false;save();notify('调查结局：'+ENDINGS[result].title);pulse('ending');dispatch('mirror-answer',ENDINGS[result].title+'。\n'+ENDINGS[result].text);}
  else message='请先读登记，并取得魔镜见闻后再作判断。';
 }
 render();
});
function askMirror(question){
 const result=localAnswer(state,question);answer=result.text;if(result.id)collect(result.id);dispatch('mirror-answer',answer);message='见闻已映在镜面上。侧栏保留一份誊录，便于核对。';render();return answer;
}
document.addEventListener('mirror-question',event=>{
 if(state.mode!=='story')return;
 if(!state.started){event.preventDefault();event.detail.respond('请先拆开来信，再询问本案线索。');return;}
 event.preventDefault();event.detail.respond(askMirror(event.detail.question));
});
document.addEventListener('chapter-inspect',event=>{if(inspect())event.preventDefault();});
document.addEventListener('chapter-release',()=>{
 if(state.mode!=='story'||!state.started||state.ending||verdictOpen)return;
 if(scene===3){state.insight=!state.insight;save();paintPage();message=state.insight?'灵视已开启。再检查这一页，收录浮出的底字。':'已收起灵视，回到肉眼阅读。';render();}
 else if(scene===0){if(!state.evidence.includes('letter'))inspect();else askMirror('封门后，你看见了什么？');}
 else if(scene===1)panel.querySelector('[data-form=pendulum]')?.requestSubmit();
 else{const form=panel.querySelector('[data-form=card]');if(form?.querySelector('input').value.trim())form.requestSubmit();else{message='力量让牌面回应，但知识仍需要钥语。先读封存人的附记。';render();}}
});
document.addEventListener('chapter-relic-selected',event=>{scene=event.detail;message='';verdictOpen=false;render();if(state.mode==='story'&&state.started&&scene===3)paintPage();});
bar.addEventListener('click',event=>{
 const mode=event.target.closest('[data-mode]')?.dataset.mode;if(!mode)return;
 state.mode=mode;save();render();
 if(mode==='story'){notify(state.started?'调查已恢复：'+nextObjective(state):'来信仍在等你。');if(scene===3&&state.started)paintPage();}
 else{notify('自由档案');dispatch('mirror-answer','阿罗德斯在此。\n您想询问什么？');}
});
const currentName=$('.relic.active')?.getAttribute('aria-label');scene=['阿罗德斯','黄水晶灵摆','亵渎之牌','安提哥努斯笔记'].indexOf(currentName);if(scene<0)scene=0;
pulse('restore');render();notify(state.started?'存档已恢复：'+nextObjective(state):'有一封寄给你的异常来信。');
