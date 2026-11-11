const scene=document.createElement('section');scene.className='table-assembly';scene.setAttribute('aria-label','灰雾之上的长桌');
scene.innerHTML=`<div class="fog-eye" aria-hidden="true"></div><div class="table-illustration"><img src="media/long-table/grey-table.png" alt="" draggable="false">
 <button class="table-point empty-seat" type="button" data-action="seat"><span>空席</span></button>
 <button class="table-point world-seat" type="button" data-action="world"><span>扣着的牌</span></button>
 <button class="table-point diary-page" type="button" data-action="diary"><span>罗塞尔日记</span></button>
 <button class="table-point newspaper" type="button" data-action="news"><img src="media/long-table/newspaper.png" alt=""><span>贝克兰德日报</span></button>
 <div class="table-cards" aria-label="桌上的塔罗牌"></div>
 </div><div class="identity-objects" role="group" aria-label="愚者的五个身份"></div><p class="table-message" role="status" aria-live="polite">触碰空席、面具或桌上的牌与纸页。</p>`;
document.body.append(scene);
const identities=['克莱恩·莫雷蒂','夏洛克·莫里亚蒂','格尔曼·斯帕罗','道恩·唐泰斯','梅林·赫尔墨斯'];
const identityGroup=scene.querySelector('.identity-objects');
identities.forEach((name,index)=>{const button=document.createElement('button');button.type='button';button.className='identity-object';button.dataset.action='identity';button.dataset.index=index;button.setAttribute('aria-label',name);button.setAttribute('aria-pressed','false');button.title=name;button.style.setProperty('--identity-position',`${index*25}%`);identityGroup.append(button)});
const cards=['正义','倒吊人','太阳','魔术师','月亮','隐者','星星'];
const locations=[[51,43,-15],[59,43,8],[65,37,-21],[72,36,6],[78,32,-9],[84,30,11],[89,26,-6]];
const cardGroup=scene.querySelector('.table-cards');
cards.forEach((name,index)=>{const button=document.createElement('button');button.type='button';button.className='table-tarot';button.dataset.action='card';button.dataset.index=index;button.setAttribute('aria-label',name+'牌');button.title=name;const [x,y,angle]=locations[index];button.style.left=x+'%';button.style.top=y+'%';button.style.setProperty('--card-position',`${index*100/6}%`);button.style.setProperty('--angle',`${angle}deg`);button.innerHTML='<span aria-hidden="true"></span>';cardGroup.append(button)});
const diary=['灰雾之上，空席仍在。','没有到场的人，不该留下影子。','记录可以改写，见闻需要核对。'];
const headlines=['东区雾霾','码头工人失踪','值夜者招聘'];let diaryIndex=0,newsIndex=0;
const message=scene.querySelector('.table-message');
scene.addEventListener('click',event=>{
 const button=event.target.closest('button[data-action]');if(!button)return;
 const {action,index}=button.dataset;
 if(action==='seat')message.textContent='你迟到了。';
 if(action==='world')message.textContent='这个位置有人。';
 if(action==='diary'){message.textContent='罗塞尔日记 · 解码 '+(diaryIndex+1)+'/3：'+diary[diaryIndex];diaryIndex=(diaryIndex+1)%diary.length;}
 if(action==='news'){message.textContent='贝克兰德日报 · '+headlines[newsIndex];newsIndex=(newsIndex+1)%headlines.length;}
 if(action==='card')message.textContent='桌上的牌 · '+cards[Number(index)];
 if(action==='identity'){identityGroup.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));message.textContent='现在是'+identities[Number(index)]+'。记住，你只是在扮演。';}
});
