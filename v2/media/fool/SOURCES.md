# 灰雾中的愚者

当前化身使用内置 ImageGen 根据用户提供的愚者参考图生成的透明半身插画 `klein-portrait-v2.png`，并叠加 Canvas 仪式光环、星光与手部关键点效果。生成提示：黑色维多利亚高礼帽、暗色卷发和层叠礼服、阴影中的面孔、古金饰物、透明背景，半身正面，手部留给交互层。它是非官方同人演绎，不是 3D 模型。

手部关键点来自本地 MediaPipe 识别，真人摄像头画面不显示。插画的身体保持固定，识别到的手以屏幕前景的程序绘制手套和袖口叠加，不能进行真实的全身动作捕捉。旧 Blender 模型保留在本目录，仅供历史参考，不由当前化身加载；旧模型的解剖基础来自 [MakeHuman base.obj](https://github.com/makehumancommunity/makehuman/blob/master/makehuman/data/3dobjs/base.obj)，源文件声明 CC0。

