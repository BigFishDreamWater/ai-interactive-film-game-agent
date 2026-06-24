# AI 影视对话游戏制作智能体 MVP 测试文档

更新时间：2026-06-24

## 测试目标

验证 MVP 是否真正跑通“创建项目、生成剧情、选择素材、网页试玩、Ren'Py 导出”的闭环，并确保素材授权、取消/替换、静态检查和基础用户体验可用。

## 测试范围

覆盖：

- Project Brief。
- Agent 生成设计、剧情、角色、素材计划。
- Asset Board 接受、取消、替换。
- 免费授权素材记录。
- Web Preview Player。
- Ren'Py 导出。
- 静态检查和错误提示。

不覆盖：

- 云端图片生成 API。
- 大规模并发。
- 支付和权限。
- 真实 Ren'Py 多平台打包。
- 高级内容安全审核。

## 测试数据

### Demo Brief A：悬疑

```text
标题：雨夜咖啡馆
题材：悬疑
风格：黑色电影、轻度动漫
一句话：玩家是实习记者，在雨夜咖啡馆和一名女侦探对话，找出受害者最后见过的人。
时长：10 分钟
结局：找出真凶 / 错过关键线索
```

### Demo Brief B：恋爱

```text
标题：夏日社团
题材：恋爱
风格：校园、轻松
一句话：玩家加入电影社，通过三次对话决定是否和社长一起完成毕业短片。
时长：10 分钟
结局：共同完成短片 / 错过约定
```

## 核心测试用例

### T01 创建项目

步骤：

1. 打开 Project Brief。
2. 输入 Demo Brief A。
3. 点击 Create Project。

期望：

- 项目创建成功。
- 进入生成流程。
- 项目标题、题材、风格保存正确。

### T02 生成设计规格

步骤：

1. 点击 Generate Design。
2. 查看生成结果。

期望：

- 生成 3-5 个角色规划。
- 生成 6-8 个场景规划。
- 生成 2 个结局规划。
- 内容边界与 brief 一致。

### T03 生成剧情图

步骤：

1. 点击 Generate Story Graph。
2. 打开 Story Graph。

期望：

- 有 start node。
- 有至少 6 个 scene node。
- 有至少 2 个 ending node。
- 每个 choice 的 next_node_id 存在。
- 至少一个变量会被 choice 修改。

### T04 生成角色卡

步骤：

1. 点击 Generate Characters。
2. 查看 Character Board。

期望：

- 至少 3 个角色。
- 每个角色包含 name、role、public_profile、speech_style。
- 每个角色有 required_expressions。

### T05 生成素材计划

步骤：

1. 点击 Generate Assets。
2. 查看 Asset Board。

期望：

- 每个场景有 background asset。
- 每个角色有 default sprite。
- 每个资源有 license metadata。
- 资源状态默认为 suggested 或 accepted。

### T06 接受素材

步骤：

1. 选择一个背景资源。
2. 点击 Accept。

期望：

- 状态变为 accepted。
- Web Preview 可使用该资源。
- 导出时包含该资源。

### T07 取消素材

步骤：

1. 选择一个角色表情资源。
2. 点击 Cancel。

期望：

- 状态变为 cancelled 或 missing。
- Web Preview 对该资源显示缺失提示或 fallback。
- Ren'Py 导出不引用 cancelled 资源。
- Build Check 报告缺失资源。

### T08 替换素材

步骤：

1. 对 T07 中 missing 资源点击 Replace from Library。
2. 选择另一个免费授权素材。
3. 点击 Accept。

期望：

- 状态变为 accepted。
- 预览图更新。
- license metadata 更新。
- Build Check 不再报告该资源缺失。

### T09 Web 试玩

步骤：

1. 打开 Preview Player。
2. 从开头开始试玩。
3. 选择一条分支直到结局。

期望：

- 背景显示正确。
- 人物立绘显示在背景之上。
- 文本框显示在底部。
- choice 点击后变量更新。
- 能到达一个 ending。

### T10 同一立绘跨背景

步骤：

1. 找到同一个角色出现在两个场景的剧情。
2. 分别进入两个场景。

期望：

- 同一个角色立绘可以出现在不同背景。
- 背景切换不影响角色资源引用。

### T11 静态检查通过

步骤：

1. 所有必需素材 accepted。
2. 点击 Build Check。

期望：

- 检查通过。
- 无 missing asset。
- 无 missing label。
- 无 undefined variable。
- license manifest 完整。

### T12 静态检查失败提示

步骤：

1. 人为取消一个必需背景。
2. 点击 Build Check。

期望：

- 检查失败。
- 错误信息指出缺失 asset id 和引用场景。
- 提供 Replace from Library 入口。

### T13 Ren'Py 导出

步骤：

1. 确保 Build Check 通过。
2. 点击 Export Ren'Py。
3. 下载 zip。
4. 解压查看文件结构。

期望：

- 包含 `game/script.rpy`。
- 包含 `game/characters.rpy`。
- 包含 `game/images.rpy`。
- 包含 `game/images/*`。
- 包含 `game/LICENSES.md`。

### T14 Ren'Py 脚本结构

步骤：

1. 打开导出的 `.rpy` 文件。

期望：

- `characters.rpy` 有 `define`。
- `images.rpy` 有 `image bg` 和 `image character`。
- `script.rpy` 有 `label start`。
- choice 使用 `menu`。
- 分支使用 `jump`。

### T15 License manifest

步骤：

1. 打开导出的 `LICENSES.md`。

期望：

- 每个导出素材都有记录。
- 记录包含 license、author、source。
- 需要署名的素材在文件中明确列出。

## 探索性测试

- 极短 brief：只输入一句“做一个校园恋爱故事”。
- 复杂 brief：包含 6 个角色和 5 个结局。
- 用户取消全部背景。
- 用户只接受角色不接受背景。
- 用户修改角色名后重新生成对白。
- 用户编辑 story node 后重新导出。

## 回归测试清单

每次改动后至少跑：

- T01 创建项目。
- T03 生成剧情图。
- T05 生成素材计划。
- T09 Web 试玩。
- T11 静态检查通过。
- T13 Ren'Py 导出。

## 验收门槛

MVP 发布前：

- 核心测试 T01-T15 全部通过。
- Demo Brief A 可从创建到导出完整跑通。
- Demo Brief B 可从创建到 Web 试玩完整跑通。
- 静态检查能发现缺图和断分支。
- 导出包不包含 cancelled asset。
- License manifest 覆盖所有导出素材。

