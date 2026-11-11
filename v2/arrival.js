const root = document.querySelector('#arrival');
const page = document.querySelector('.experience');
const enter = root.querySelector('#arrival-enter');
const skip = root.querySelector('#arrival-skip');
const videos = root.querySelectorAll('video');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let restoreFocus, departure;
document.documentElement.dataset.arrivalReady = 'true';

function signal(active) {
 document.dispatchEvent(new CustomEvent('arrival-state', {detail: active}));
}
function close() {
 clearTimeout(departure);
 root.hidden = true;
 page.inert = false;
 videos.forEach(video => video.pause());
 document.body.classList.remove('arrival-active');
 document.documentElement.classList.remove('entry-pending');
 signal(false);
 (restoreFocus?.offsetParent ? restoreFocus : document.querySelector('#object-name')).focus({preventScroll: true});
}
function open() {
 restoreFocus = document.activeElement;
 root.hidden = false;
 root.dataset.phase = 'ready';
 page.inert = true;
 document.body.classList.add('arrival-active');
 enter.disabled = false;
 enter.textContent = '进入灰雾';
 if (!reducedMotion.matches) videos.forEach(video => video.play().catch(() => {}));
 signal(true);
 enter.focus({preventScroll: true});
}
enter.onclick = () => {
 enter.disabled = true;
 enter.textContent = '雾正在散开';
 if (reducedMotion.matches) {
  close();
  return;
 }
 root.dataset.phase = 'departing';
 document.documentElement.classList.remove('entry-pending');
 document.body.classList.remove('arrival-active');
 signal(false);
 departure = setTimeout(close, 950);
 skip.focus({preventScroll: true});
};
skip.onclick = close;
document.querySelector('#arrival-replay').onclick = open;
document.addEventListener('keydown', event => {
 if (root.hidden) return;
 if (event.key === 'Escape') {
  event.preventDefault();
  event.stopImmediatePropagation();
  close();
 }
 if (event.key === 'Tab') {
  event.preventDefault();
  (enter.disabled || document.activeElement === enter ? skip : enter).focus();
 }
}, true);
open();
