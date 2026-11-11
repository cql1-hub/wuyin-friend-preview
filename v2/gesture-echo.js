const panel=document.createElement('section');panel.className='gesture-echo';panel.setAttribute('aria-label','手势识别反馈');panel.innerHTML='<div class="echo-title">手势取景</div><label class="camera-device" hidden>摄像头 <select aria-label="切换摄像头"></select></label><canvas aria-label="识别到的手部动作"></canvas><strong>等待画面</strong><small>让手掌和手腕完整入镜</small>';document.body.append(panel);
const canvas=panel.querySelector('canvas'),ctx=canvas.getContext('2d'),title=panel.querySelector('strong'),hint=panel.querySelector('small');let hands=[];
const cameraBox=document.querySelector('.cam-box');
panel.querySelector('.echo-title').after(cameraBox);
cameraBox.append(canvas);
const labels={lost:['等待手掌','手掌和手腕完整入镜，避免逆光'],grab:['捏合牵引','保持捏合并移动，旋转遗物'],dual:['双手共鸣','双手开合控制展开'],charge:['握拳蓄能','保持握拳，再张掌释放'],palm:['张掌','横扫切换；纸牌可抽牌'],switch:['V 手势','保持片刻切换遗物'],inspect:['食指感应','保持食指稳定，触发回应'],open:['手部已识别','捏合牵引，握拳蓄能'],swipe:['横扫','切换遗物']};
function draw(){const d=Math.min(devicePixelRatio,2),w=canvas.clientWidth,h=canvas.clientHeight;if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=w*d;canvas.height=h*d}ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);
 for(const hand of hands){const p=hand.map(v=>[(1-v.x)*w,v.y*h]);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(223,200,145,.8)';ctx.lineWidth=2;for(const chain of [[0,1,2,3,4],[0,5,6,7,8],[5,9,10,11,12],[9,13,14,15,16],[13,17,18,19,20],[17,0]]){ctx.beginPath();chain.forEach((n,i)=>i?ctx.lineTo(...p[n]):ctx.moveTo(...p[n]));ctx.stroke()}for(const [x,y] of p){ctx.beginPath();ctx.arc(x,y,2.4,0,Math.PI*2);ctx.fillStyle='#f0dbad';ctx.fill()}}
}
document.addEventListener('fool-camera',e=>{panel.classList.toggle('active',e.detail);if(!e.detail){hands=[];title.textContent='等待画面';hint.textContent='让手掌和手腕完整入镜';draw()}});
document.addEventListener('fool-tracking',e=>{hands=e.detail.hands;draw()});
document.addEventListener('fool-gesture',e=>{const action=e.detail;const [name,description]=labels[action.kind]||labels.open;title.textContent=name;hint.textContent=description;panel.dataset.gesture=action.kind});
