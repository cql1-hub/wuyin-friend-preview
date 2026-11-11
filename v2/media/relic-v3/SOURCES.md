# 雾隐：遗物、领域与印刷美术

本版依据用户认可的铜版蚀刻牌面统一审美，保留原世界背景。角色与模型均为非官方同人演绎，不作为官方动画资产申报。

## 新建资产

- 阿罗德斯：新建椭圆银框、实际截面、背板、吊环、铆钉、双侧镶座、黑色弧面宝石。基础色、金属度、粗糙度与法线贴图区分磨亮表面和氧化凹部。顶部雕花取自 James Ray Cock 的 [Poly Haven Ornate Mirror 01](https://polyhaven.com/a/ornate_mirror_01)，CC0，保留其雕刻 UV 和法线并转为旧银色。其余网格及材质图由项目脚本生成。源文件在 E:/blander/relic-source/arrodes.blend。
- 灵摆：新建握持环、32 个交错链节、连接环、金属冠、细小凸点、四枚镶爪、十二边多层切割晶体。依据 [GIA 黄水晶资料](https://my.gia.edu/citrine)采用约 1.548 折射率，实时透射只近似真实宝石的光学表现。第二形态使用同一晶体几何与材质。
- 五张牌：均有单独插画，原 PNG 保留，网页加载 768×1152 WebP。中央黑皇帝为同人形象，另外四张为律令、秩序、扭曲、威严残像，不作为四张独立的原著亵渎之牌。牌体有圆角、薄纸边、独立正反材质，印刷面不作为金属处理。
- 家族笔记：重建独立封面、封底、书脊、层叠纸边、扣带、护角与铆钉；先解扣再打开封面，纸页仍使用原阅读内容。皮革和纸张的扫描材质来自 John Malcolm 的 [Poly Haven Book Encyclopedia Set 01](https://polyhaven.com/a/book_encyclopedia_set_01)，CC0；按新网格重新映射。新封面为双狼与闭门图案的同人家族纹样，非官方家族徽章。

## 生成插画与提示词

黑皇帝牌面、四张残像牌面和笔记封面均使用内置 ImageGen 生成。四张残像和新笔记封面的完整提示词在 [generated-art-prompts.json](generated-art-prompts.json)；黑皇帝早期提示说明在 black-emperor-art.prompt.txt。原始 PNG 是归档资产，WebP 仅进行缩放与编码，没有改画面内容。

## 第二形态

四个领域组合了新版遗物与原有的王座、雕像、书架、城门等素材；这些素材的来源和署名见 [原模型素材说明](../models/SOURCES.md)。各领域保留原有场景构图，并融入新版镜子、晶体、牌面与笔记。

## 特效

镜面涟漪和雾、琥珀电弧和摆动光迹、曲面蔷薇花瓣和牌影、墨流与浮页均为本项目几何或着色器效果。位置来自真实部件的变换，开启深度检测。雷电、花瓣和领域扩展属于同人交互设计，不代表原著新增能力。

真实材质参考：[Met 银、木、玻璃制镜具](https://www.metmuseum.org/art/collection/search/210013)、[Blender Principled](https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/principled.html)、[Three.js 物理材质](https://threejs.org/docs/pages/MeshPhysicalMaterial.html)。参考其结构和材质规律，未将博物馆照片直接用作贴图。

角色解剖、骨骼和识别模型的来源见 [愚者化身说明](../fool/SOURCES.md)。原世界背景、音频和手势库仍保留原项目署名。

