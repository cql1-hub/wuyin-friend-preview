const $ = selector => document.querySelector(selector);
const body = document.body;
const header = $('.header-actions');
const archive = $('.control-column');
const camera = $('#camera');
const tools = $('#tools-toggle');
const guide = $('#guide');
const toolbar = $('.shell-toolbar');
const hud = $('.ritual-hud');

body.classList.add('folio-ui', 'exhibition', 'tools-collapsed');
body.append($('.toast'));
archive.prepend($('.chapter-bar'));

const drawer = document.createElement('aside');
drawer.id = 'exhibition-drawer';
drawer.setAttribute('aria-label', '遗物档案与设置');
drawer.hidden = true;
drawer.innerHTML = `<div class="drawer-top">
 <nav aria-label="侧栏内容">
  <button type="button" data-drawer="catalog">遗物名录</button>
  <button type="button" data-drawer="archive">档案</button>
  <button type="button" data-drawer="settings">设置</button>
 </nav>
 <button type="button" class="drawer-close">收起</button>
</div>
<section class="drawer-catalog" aria-label="遗物名录"></section>
<section class="drawer-settings" aria-label="设置">
 <details open><summary>环境与声音</summary><div class="scene-settings"></div></details>
 <details class="gesture-settings"><summary>手势教学</summary>
  <ol class="gesture-lesson">
   <li><span class="lesson-hand" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><b>捏</b><p>拇指与食指捏合。移动手指，带动遗物转向。</p></li>
   <li><span class="lesson-hand" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><b>张</b><p>张掌横扫可切换遗物。握拳后原地张掌会释放。</p></li>
   <li><span class="lesson-hand" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><b>拳</b><p>握拳停留，等遗物完成蓄能。</p></li>
  </ol>
  <button type="button" class="lesson-next">演示下一步</button>
  <p class="lesson-caption" aria-live="polite"></p>
 </details>
 <details class="guide-settings"><summary>使用指南与快捷键</summary><div></div></details>
</section>`;
$('.experience').append(drawer);
const close = drawer.querySelector('.drawer-close');
const catalog = drawer.querySelector('.drawer-catalog');
const settings = drawer.querySelector('.drawer-settings');
const sceneSettings = drawer.querySelector('.scene-settings');
const lesson = drawer.querySelector('.gesture-settings');
const guideSettings = drawer.querySelector('.guide-settings');
const modeStory = archive.querySelector('[data-mode="story"]');
const modeFree = archive.querySelector('[data-mode="free"]');
const start = () => archive.querySelector('[data-action="start"]');
const sections = {catalog, archive, settings};
drawer.append(archive);
const catalogPreview = document.createElement('div');
catalogPreview.className = 'catalog-preview collection-index';
toolbar.querySelector('.glass-adjust').remove();
sceneSettings.append($('.scene-controls'), $('.audio-controls'), ...['film-toggle','arrival-replay','replay','fullscreen'].map(id => $('#' + id)));
guideSettings.querySelector('div').append(guide);
guide.hidden = false;
guide.innerHTML = `<p>轻点遗物查看回应，拖动旋转。长按或按住空格汇聚，松开释放。← / → 切换遗物，Esc 收起当前视图。</p>
<p>手势支持捏合拖动、张掌横扫、食指停留、握拳蓄能后张掌释放。双手开合可牵引遗物。</p>
<p>第二形态「灰雾镜庭」「命运星穹」「律令王庭」「失落书库」是同人场景。原著用法见各件遗物的展签。</p>`;
$('#help-toggle').remove();
archive.querySelector('.panel-heading').remove();
$('#object-description').hidden = true;

const cameraExit = document.createElement('button');
cameraExit.id = 'avatar-preview';
cameraExit.type = 'button';
cameraExit.textContent = '收起愚者姿态';
cameraExit.setAttribute('aria-pressed', 'false');
header.prepend(cameraExit, camera);
const preview = document.createElement('button');
preview.type = 'button';
preview.textContent = '预览愚者姿态';
sceneSettings.append(preview);
preview.onclick = () => cameraExit.click();
cameraExit.onclick = async () => {
 const {showFoolPreview} = await import('./gesture-avatar.js');
 const active = await showFoolPreview();
 cameraExit.textContent = active ? '收起愚者姿态' : '预览愚者姿态';
 cameraExit.setAttribute('aria-pressed', String(active));
 if (active) {
  closeDrawer(false);
  cameraExit.focus({preventScroll: true});
 } else tools.focus({preventScroll: true});
};
const immerse = document.createElement('button');
immerse.type = 'button';
immerse.textContent = '沉浸观赏';
sceneSettings.append(immerse);
immerse.onclick = async () => {
 const {prepareFool} = await import('./gesture-avatar.js');
 const avatar = await prepareFool();
 body.classList.add('gesture-immersive');
 avatar.setEnabled(true);
 closeDrawer(false);
 $('#hand-status').textContent = '拖动旋转 · 长按汇聚，松开释放';
 $('#gesture-exit').focus({preventScroll: true});
};
const backgroundOnly = $('#scene-focus');
const sceneryExit = document.createElement('button');
sceneryExit.type = 'button';
sceneryExit.id = 'scenery-exit';
sceneryExit.textContent = '返回遗物';
header.append(sceneryExit);
backgroundOnly.addEventListener('click', () => {
 if (body.classList.contains('scenery-only')) {
  closeDrawer(false);
  sceneryExit.focus({preventScroll: true});
 }
});
sceneryExit.onclick = () => {backgroundOnly.click();tools.focus({preventScroll: true});};

tools.textContent = '档案与设置';
tools.setAttribute('aria-controls', drawer.id);
tools.setAttribute('aria-expanded', 'false');
let opener = tools;
let section = 'archive';
function openDrawer(name, trigger, reading = false) {
 if (drawer.hidden) opener = trigger;
 section = name;
 drawer.hidden = false;
 drawer.dataset.section = name;
 (name === 'catalog' ? catalog : catalogPreview).prepend(toolbar);
 body.classList.toggle('reading-letter', reading);
 catalogPreview.hidden = name === 'catalog';
 body.classList.toggle('tools-collapsed', name !== 'archive');
 for (const [key, panel] of Object.entries(sections)) panel.hidden = key !== name;
 drawer.querySelectorAll('[data-drawer]').forEach(button => {
  button.setAttribute('aria-pressed', String(button.dataset.drawer === name));
 });
 tools.setAttribute('aria-expanded', 'true');
 catalogButton.setAttribute('aria-expanded', String(name === 'catalog'));
 close.focus({preventScroll: true});
}
function closeDrawer(restore = true) {
 drawer.hidden = true;
 catalogPreview.hidden = false;
 catalogPreview.prepend(toolbar);
 body.classList.remove('reading-letter');
 delete drawer.dataset.unsealing;
 body.classList.add('tools-collapsed');
 tools.setAttribute('aria-expanded', 'false');
 catalogButton.setAttribute('aria-expanded', 'false');
 if (restore) opener.focus({preventScroll: true});
}
tools.onclick = () => drawer.hidden ? openDrawer(section, tools) : closeDrawer();
close.onclick = () => closeDrawer();
drawer.querySelectorAll('[data-drawer]').forEach(button => {
 button.onclick = () => openDrawer(button.dataset.drawer, tools);
});

const title = document.createElement('section');
title.className = 'case-introduction';
title.innerHTML = `<h2>今夜，多了一位访客</h2>
 <section class="relic-context" aria-label="当前遗物展签">
  <h3></h3><p class="source-note"></p><p class="case-note"></p>
  <button type="button" class="exhibit-action"></button>
 </section>`;
$('.workspace').prepend(title);
const path = document.createElement('div');
path.className = 'case-path';
path.innerHTML = '<button class="case-begin metal-inscription" type="button">拆开来信</button><button class="case-free" type="button">自由探索</button>';
$('.workspace').append(path, catalogPreview);
const catalogButton = document.createElement('button');
catalogButton.type = 'button';
catalogButton.className = 'catalog-handle';
catalogButton.textContent = '遗物名录';
catalogButton.setAttribute('aria-controls', drawer.id);
catalogButton.setAttribute('aria-expanded', 'false');
catalogPreview.append(toolbar, catalogButton);
catalogButton.onclick = () => openDrawer('catalog', catalogButton);
catalog.addEventListener('click', event => {
 if (event.target.closest('.relic')) closeDrawer();
});
const masthead = document.createElement('p');
masthead.className = 'masthead-note';
masthead.textContent = '灰雾之上 · 遗物档案';
$('header').insertBefore(masthead, header);
const action = $('.exhibit-action');
action.onclick = () => {
 openDrawer('archive', action);
 $('#relic-action').click();
};
const mainPath = $('.case-begin');
mainPath.onclick = () => {
 modeStory.click();
 const unopened = start();
 if (unopened && $('.relic.active').getAttribute('aria-label') !== '阿罗德斯') $('.relic').click();
 openDrawer('archive', mainPath, Boolean(unopened));
 if (unopened) {
  drawer.dataset.unsealing = 'true';
  drawer.scrollTop = 0;
  unopened.focus({preventScroll: true});
 }
};
$('.case-free').onclick = () => {
 modeFree.click();
 if (!drawer.hidden) closeDrawer(false);
 $('#world').focus({preventScroll: true});
};

const faces = document.createElement('button');
faces.id = 'card-art-view';
faces.type = 'button';
faces.textContent = '翻开牌面';
faces.hidden = true;
hud.append(faces);
faces.onclick = () => {
 const active = faces.getAttribute('aria-pressed') !== 'true';
 faces.setAttribute('aria-pressed', String(active));
 faces.textContent = active ? '翻回牌背' : '翻开牌面';
 document.dispatchEvent(new CustomEvent('relic-card-preview', {detail: active}));
};
const gestureHint = document.createElement('p');
gestureHint.className = 'exhibition-gesture-hint';
const energy = $('footer label');
hud.append(energy, gestureHint);
const gesturesButton = document.createElement('button');
gesturesButton.type = 'button';
gesturesButton.className = 'gestures-open';
gesturesButton.textContent = '手势教学';
hud.insertBefore(gesturesButton, gestureHint);
gesturesButton.onclick = () => {
 openDrawer('settings', gesturesButton);
 lesson.open = true;
 lesson.scrollIntoView({block: 'nearest'});
 lesson.querySelector('summary').focus({preventScroll: true});
};
const frames = [...lesson.querySelectorAll('li')];
const next = lesson.querySelector('.lesson-next');
let step = 0;
const confirm = document.createElement('button');
confirm.type = 'button';
confirm.textContent = '连接摄像头并进入全屏';
confirm.hidden = true;
lesson.append(confirm);
function showStep() {
 frames.forEach((frame, index) => frame.classList.toggle('active', index === step));
 lesson.querySelector('.lesson-caption').textContent = frames[step].querySelector('p').textContent;
 next.textContent = step === 2 ? '重看手势' : '演示下一步';
}
next.onclick = () => {
 step = (step + 1) % frames.length;
 showStep();
 if (step === 2) confirm.hidden = false;
};
confirm.onclick = () => {
 closeDrawer(false);
 camera.click();
 $('#gesture-exit').focus({preventScroll: true});
};
showStep();

const notes = [
 ['银镜的见闻','原著中，阿罗德斯在回答问题后，也会向提问者提出问题。','镜框夹着一封信。可以向镜中询问封门后的见闻。','凝视、询问'],
 ['灵摆的方向','占卜家以灵摆占问，在摆动的方向中解读回应。','先提出一条可核验的陈述，再比较灵摆和证物。','牵引方向'],
 ['牌背的封存','罗塞尔制作的亵渎之牌封存着途径知识。黑皇帝是其中一张牌的牌面。','封存人的附记可能解释这张牌为何留在这里。','张掌抽牌、翻牌、捏合拿起'],
 ['被覆盖的墨迹','安提哥努斯笔记记载着与家族有关的危险知识，曾在廷根出现。','同一页登记叠着两种墨，翻页后再看底字。','翻页、解封']
];
function updateExhibit(index) {
 const [heading, source, note, hint] = notes[index];
 $('.relic-context h3').textContent = heading;
 $('.relic-context .source-note').textContent = source;
 $('.relic-context .case-note').textContent = note;
 action.textContent = ['向阿罗德斯提问','让灵摆核验','检查亵渎之牌','阅读安提哥努斯笔记'][index];
 gestureHint.textContent = '捏合牵引 · 张掌切换 · 握拳蓄能　/　' + hint;
 faces.hidden = index !== 2;
}
updateExhibit([...document.querySelectorAll('.relic')].findIndex(button => button.classList.contains('active')));
document.addEventListener('chapter-relic-selected', event => updateExhibit(event.detail));
document.addEventListener('chapter-letter', event => {
 if (event.detail) body.classList.remove('reading-letter');
 mainPath.textContent = event.detail ? '继续调查' : '拆开来信';
});
mainPath.textContent = start() ? '拆开来信' : '继续调查';
drawer.addEventListener('animationend', event => {
 if (event.animationName === 'break-seal') delete drawer.dataset.unsealing;
});
document.addEventListener('keydown', event => {
 if (event.key !== 'Escape' || !$('#card-detail').hidden) return;
 if (!drawer.hidden) closeDrawer();
 else if (body.classList.contains('gesture-immersive')) {
  $('#gesture-exit').click();
  gesturesButton.focus({preventScroll: true});
 }
});
