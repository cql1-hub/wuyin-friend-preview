const archive=document.querySelector('.control-column');
const note=document.createElement('aside');note.className='archive-marginalia';
note.innerHTML='<span>调查者手记</span><p>留下的记录，也许并不是全部。</p><small>先观察，再交叉核验。</small>';
const photo=document.createElement('figure');photo.className='case-negative';
photo.innerHTML='<div><img src="media/art-styles/empty-seat-lomo.png" alt="暗室中一张空椅，镜里浮现模糊的影子"></div><figcaption>空席与倒影 <span>氛围影像 · 同人演绎</span></figcaption>';
archive.querySelector('.chapter-bar').after(note);
const mirror=archive.querySelector('.mirror-input:not(.relic-input)');
(mirror.parentElement===archive?mirror:archive.querySelector('.chapter-panel')).after(photo);
