# AI 影视对话游戏制作智能体 MVP 任务拆解

更新时间：2026-06-24

## 阶段 0：项目骨架

- 初始化 Web 项目。
- 接入 TypeScript、lint、formatter。
- 建立数据目录或数据库。
- 建立本地 `storage/`。
- 建立内置免费授权素材库目录。
- 建立文档里的 JSON schema。

验收：

- 本地服务可启动。
- 能读取素材库清单。
- 能创建空项目。

## 阶段 1：Project Brief 和项目数据

- 实现 Project Brief 页面。
- 实现 `POST /api/projects`。
- 保存 title、genre、style、brief。
- 实现项目详情页。

验收：

- 用户可以创建项目并回到详情页继续编辑。

## 阶段 2：Agent 生成设计、剧情、角色

- 接入 pi-mono Agent Orchestrator。
- 实现 Design Agent。
- 实现 Story Agent。
- 实现 Character Agent。
- 保存 `game_design_spec`、`story_graph`、`character_cards`。
- 实现 Story Graph 基础查看。
- 实现 Character Board 基础查看。

验收：

- Demo Brief A 可以生成 6-8 个场景、3 个角色、2 个结局。

## 阶段 3：素材库和 Asset Board

- 建立 `asset_library.json`。
- 支持背景、角色、UI 三类素材。
- 实现 Asset Planner Agent。
- 生成 `asset_manifest`。
- 实现 Asset Board。
- 实现 Accept、Cancel、Replace from Library。
- 记录 license metadata。

验收：

- 用户可以接受、取消、替换素材。
- 取消素材不会进入导出。

## 阶段 4：Web Preview Runtime

- 实现 visual novel renderer。
- 支持 background layer。
- 支持 character sprite layer。
- 支持 textbox layer。
- 支持 choice menu。
- 支持变量更新和跳转。
- 支持 restart。

验收：

- Demo Brief A 至少一条分支可完整试玩到结局。
- 同一人物立绘可在不同背景出现。

## 阶段 5：静态检查

- 检查 node id 唯一。
- 检查 choice target 存在。
- 检查变量定义。
- 检查 required asset accepted。
- 检查素材文件存在。
- 检查 license metadata。
- 输出错误列表和修复建议。

验收：

- 人为取消背景后检查失败，并定位场景和 asset id。

## 阶段 6：Ren'Py 导出

- 生成 `characters.rpy`。
- 生成 `images.rpy`。
- 生成 `script.rpy`。
- 复制 accepted assets。
- 生成 `LICENSES.md`。
- 打包 zip。

验收：

- 导出 zip 结构符合文档。
- 不引用 cancelled assets。
- `.rpy` 文件包含 label、scene、show、menu、jump。

## 阶段 7：QA Agent 和自动修复建议

- 实现 QA Agent 调用静态检查。
- 对缺图给出 Replace from Library 建议。
- 对断分支给出重连建议。
- 对 OOC 做轻量文本检查。

验收：

- Build Panel 能展示 QA 报告。
- 用户可以根据报告完成修复。

## 阶段 8：演示打磨

- 准备 Demo Brief A 和 B。
- 准备内置素材包。
- 准备 README 和录屏脚本。
- 跑完整测试计划。

验收：

- 能现场演示 10 分钟内从 brief 到 Web 试玩。
- 能导出 Ren'Py zip。

## 建议优先级

P0：

- Project Brief。
- Story/Character generation。
- Asset Board。
- Web Preview。
- Static Check。
- Ren'Py Export。

P1：

- Story Graph 可视化编辑。
- QA Agent 自动修复建议。
- 多套题材模板。
- 素材替换体验优化。

P2：

- 图片生成 API。
- 角色一致性 QC。
- TTS/语音。
- Ren'Py 真机打包。
- 创作者模板市场。

