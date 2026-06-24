# AI 影视对话游戏制作智能体 MVP 开发文档

更新时间：2026-06-24

## 目标

MVP 目标是跑通“网页可视化创作台 + Agent 生成剧情/资源计划 + 免费授权素材确认 + Web 试玩 + Ren'Py 导出”的完整闭环。

本阶段不追求自动生成高质量商业美术，也不做通用游戏制作智能体。MVP 要证明：用户可以从一句故事想法出发，在网页中看到剧情、角色、素材、对白和试玩效果，并导出一个可运行的 Ren'Py 视觉小说工程。

## MVP 成功标准

用户在 10-20 分钟内可以完成：

1. 创建项目并输入故事 brief。
2. Agent 生成 3 个角色、6-8 个场景、2 个结局。
3. 系统生成 asset manifest，并从免费授权素材库匹配背景、人物立绘和 UI。
4. 用户在网页中接受、取消或替换素材。
5. 系统生成 Web 试玩版本。
6. 用户试玩至少 1 条完整分支。
7. 系统导出 Ren'Py 工程，包含 `.rpy` 脚本、图片资源和 license manifest。
8. 本地 Ren'Py lint 或静态检查通过，无缺图、缺 label、未定义变量。

## 非目标

MVP 不做：

- 云端图片生成 API。
- ComfyUI/LoRA/角色一致性训练。
- 复杂动画、配音、Live2D。
- 多人协作编辑。
- 用户付费、发布平台、素材市场。
- 完整 Ren'Py GUI 主题编辑器。
- 无约束运行时 LLM 聊天。

## 技术选型

推荐栈：

- Web 前端：Next.js + React + TypeScript。
- 后端 API：Node.js / TypeScript。
- Agent runtime：pi-mono / Pi Agent Harness。
- 数据库：Postgres，MVP 可用 SQLite 替代。
- 队列：BullMQ + Redis，MVP 可先用数据库状态轮询。
- 对象存储：本地 `storage/`，后续替换 S3/R2/OSS。
- Web 试玩：自研轻量 visual novel runtime。
- Ren'Py 导出：生成标准 `game/*.rpy` 和 `game/images/*`。
- 素材：免费授权素材库，优先 CC0/Public Domain 或可商用素材包。

## 系统架构

```text
Browser UI
  -> Product API
  -> pi-mono Agent Orchestrator
      -> Design Agent
      -> Story Agent
      -> Character Agent
      -> Asset Planner Agent
      -> RenPy Builder Agent
      -> QA Agent
  -> Project DB
  -> Asset Library
  -> Local Object Storage
  -> Web Preview Runtime
  -> RenPy Exporter
```

## 页面设计

### 1. Project Brief

用户输入：

- 标题。
- 题材：悬疑、恋爱、职场、奇幻。
- 故事一句话。
- 时长：短，默认 10-15 分钟。
- 风格：现代、古风、赛博、校园、黑色电影等。
- 内容边界：全年龄、轻度悬疑、无血腥等。

输出：

- 项目创建。
- Agent 生成初版设计规格。

### 2. Story Graph

展示：

- 场景节点。
- 选择分支。
- 结局节点。
- 变量：trust、affection、clue、ending_flag。

MVP 操作：

- 查看节点。
- 编辑场景标题和目标。
- 重新生成单个节点对白。
- 标记场景通过/需要修改。

### 3. Character Board

展示：

- 角色名。
- 角色简介。
- 说话风格。
- 秘密/动机。
- 使用的立绘。
- 表情列表。

MVP 操作：

- 接受角色。
- 修改角色名和一句话设定。
- 更换立绘素材。

### 4. Asset Board

展示每个资源卡片：

- 资源 id。
- 类型：background、character_sprite、expression、ui。
- 预览图。
- 来源和 license。
- 状态：draft、suggested、accepted、cancelled、missing。

MVP 操作：

- Accept。
- Cancel。
- Replace from Library。
- View License。

MVP 不做图片生成 Retry，只做从素材库替换。后续接图片 API 时再加 Retry。

### 5. Preview Player

功能：

- Web 中试玩剧情。
- 背景、人物立绘、文本框分层显示。
- 支持选择分支。
- 显示当前变量。
- 支持重开。

### 6. Build Panel

功能：

- 生成 Ren'Py 工程。
- 下载 zip。
- 显示静态检查结果。
- 显示素材授权清单。

## Agent 设计

### Design Agent

输入：project brief。

输出：`game_design_spec`。

职责：

- 确定题材模板。
- 确定角色数量、场景数量、结局数量。
- 确定内容边界。

### Story Agent

输入：`game_design_spec`。

输出：`story_graph`。

职责：

- 生成场景节点。
- 生成选择分支。
- 生成结局条件。
- 生成每个场景目标。

### Character Agent

输入：`game_design_spec` 和 `story_graph`。

输出：`character_cards`。

职责：

- 生成角色卡。
- 生成说话风格。
- 指定需要的表情。

### Asset Planner Agent

输入：`story_graph` 和 `character_cards`。

输出：`asset_manifest`。

职责：

- 列出背景、人物、表情、UI。
- 从免费授权素材库匹配资源。
- 记录 license metadata。

### RenPy Builder Agent

输入：`story_graph`、`character_cards`、accepted assets。

输出：Ren'Py 工程文件。

职责：

- 生成 `script.rpy`。
- 生成 `characters.rpy`。
- 生成 `images.rpy`。
- 复制 accepted assets。
- 生成 `LICENSES.md`。

### QA Agent

输入：项目当前状态。

输出：检查报告。

职责：

- 检查缺图。
- 检查缺 label。
- 检查未定义变量。
- 检查不可达结局。
- 检查角色对白是否明显 OOC。

## 数据模型

### Project

```json
{
  "id": "proj_001",
  "title": "Rain Cafe Mystery",
  "genre": "mystery",
  "style": "cinematic noir anime",
  "status": "draft",
  "created_at": "2026-06-24T10:00:00Z"
}
```

### StoryGraph

```json
{
  "project_id": "proj_001",
  "variables": [
    {"name": "trust_lina", "type": "number", "default": 0},
    {"name": "found_ticket_stub", "type": "boolean", "default": false}
  ],
  "nodes": [
    {
      "id": "scene_01_cafe",
      "type": "scene",
      "title": "Rainy Cafe",
      "background_asset_id": "bg_cafe_rain",
      "characters": ["char_lina"],
      "objective": "introduce Lina and the victim clue",
      "beats": [
        {"speaker": "char_lina", "text": "You came alone. Brave, or careless."}
      ],
      "choices": [
        {
          "id": "show_ticket",
          "text": "Show her the ticket stub.",
          "effects": [{"var": "trust_lina", "op": "+=", "value": 2}],
          "next_node_id": "scene_02_alley"
        }
      ]
    }
  ]
}
```

### CharacterCard

```json
{
  "id": "char_lina",
  "project_id": "proj_001",
  "name": "Lina",
  "role": "detective",
  "public_profile": "calm, sharp, restrained",
  "private_motivation": "find her mentor's betrayer",
  "speech_style": "short, precise, skeptical",
  "required_expressions": ["neutral", "suspicious", "soft"]
}
```

### AssetManifest

```json
{
  "asset_id": "bg_cafe_rain",
  "project_id": "proj_001",
  "type": "background",
  "status": "accepted",
  "file_path": "game/images/bg/cafe_rain.png",
  "preview_url": "/storage/proj_001/bg_cafe_rain.png",
  "source": {
    "kind": "library",
    "name": "example-cc0-pack",
    "author": "Asset Author",
    "license": "CC0",
    "source_url": "https://example.com/asset"
  }
}
```

## 免费授权素材库策略

MVP 素材优先级：

1. 内置小型 CC0/Public Domain 示例素材包。
2. 可商用免费素材包，保留作者和 license。
3. 用户自己上传素材，要求用户确认拥有使用权。

必须记录：

- asset source。
- license。
- author。
- source URL。
- 是否需要署名。
- 是否可商用。
- 是否可修改。

MVP 内置素材建议：

- 背景：8-12 张。
- 角色：6-8 个半身立绘。
- 表情：每个角色 2-3 个。
- UI：默认文本框、按钮、标题背景。

## API 草案

```http
POST /api/projects
GET  /api/projects/:projectId
POST /api/projects/:projectId/generate/design
POST /api/projects/:projectId/generate/story
POST /api/projects/:projectId/generate/characters
POST /api/projects/:projectId/generate/assets

GET  /api/projects/:projectId/story
PATCH /api/projects/:projectId/story/nodes/:nodeId

GET  /api/projects/:projectId/assets
POST /api/projects/:projectId/assets/:assetId/accept
POST /api/projects/:projectId/assets/:assetId/cancel
POST /api/projects/:projectId/assets/:assetId/replace

GET  /api/projects/:projectId/preview
POST /api/projects/:projectId/build/check
POST /api/projects/:projectId/export/renpy
```

## Ren'Py 导出结构

```text
exports/proj_001/
  game/
    script.rpy
    characters.rpy
    images.rpy
    options.rpy
    LICENSES.md
    images/
      bg/
      characters/
      ui/
```

生成规则：

- `characters.rpy` 定义 `Character()`。
- `images.rpy` 定义背景和人物图片。
- `script.rpy` 定义 label、scene、show、menu、jump。
- `LICENSES.md` 记录素材授权。
- 只导出 accepted assets。
- cancelled/missing assets 不应写入 Ren'Py 脚本。

## Web 试玩 Runtime

MVP 可以不直接嵌入 Ren'Py，而是用同一份 `story_graph` 在 Web 中渲染：

- 当前节点决定背景。
- 当前 beat 决定 speaker 和 text。
- 当前角色决定立绘。
- choices 更新变量并跳转。
- ending node 显示结局。

这样可以快速预览，导出时再转 Ren'Py。

## 静态检查

Build Panel 至少检查：

- 所有 node id 唯一。
- 所有 choice next_node_id 存在。
- 至少一个 start node。
- 至少一个 ending node。
- 所有 background_asset_id 已 accepted。
- 所有角色默认立绘已 accepted。
- 所有变量有 default。
- Ren'Py label 名合法。
- 素材文件存在。
- license manifest 完整。

## 验收标准

MVP 验收必须满足：

- 从 brief 到 Web 试玩的端到端流程可跑通。
- 用户可以取消某个素材，系统标记 missing，不写入导出脚本。
- 用户可以从素材库替换 missing 素材。
- Web 试玩中人物、背景、文本框分层显示。
- 同一人物立绘可出现在至少 2 个不同背景。
- 导出的 Ren'Py 工程包含脚本、图片和 license 文件。
- 静态检查对缺图、缺分支、未定义变量给出明确错误。

