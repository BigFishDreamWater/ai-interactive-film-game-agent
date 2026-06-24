# AI 影视对话游戏制作智能体技术路径

更新时间：2026-06-24

## 定位

本方向不是通用游戏制作智能体，也不是“让 AI 帮用户写 Unity/Unreal 任意游戏”。它的垂类目标是：让用户快速开发出自己的 AI 影视对话游戏，形态更接近互动影视、视觉小说、角色扮演聊天、分支叙事和剧情向对话游戏。

核心价值：

- 用户输入世界观、角色、题材、剧情目标。
- 系统生成可玩的剧情结构、场景、角色对白、选择分支、关系变量和结局。
- 运行时角色可以用 LLM 生成自然对话，但必须受剧情图、角色设定和安全策略约束。
- 输出可以是 Web playable、Ren'Py/Godot/Unity 原型，或可嵌入 App 的互动剧本。

一句话产品：

> 面向影视对话游戏的 AI 创作智能体：从故事设定到可玩原型，自动生成剧情图、角色卡、对白、选择分支、素材脚本和运行时对话逻辑。

## 产品边界

不做：

- 通用 3D 游戏制作。
- 实时动作游戏 AI。
- 自动生成复杂物理、战斗、关卡编辑器。
- 无约束 AI 聊天室。

专注做：

- 互动影视。
- 视觉小说。
- AI 角色恋爱/悬疑/职场/校园/奇幻对话游戏。
- 类剧本杀/推理对话。
- 角色陪伴 + 剧情推进。
- UGC 用户快速生成自己的互动故事。

## 成熟产品参考

| 类型 | 产品 | 价值 |
| --- | --- | --- |
| AI NPC | [Inworld](https://www.inworld.ai/) | AI 角色、NPC 行为、游戏引擎集成，偏成熟商业化。 |
| AI NPC | [Convai](https://www.convai.com/) | Unity/Unreal AI 角色、语音 NPC、场景感知，适合游戏集成参考。 |
| 互动叙事 AI | [Charisma.ai](https://charisma.ai/) | 面向互动故事、角色对白和剧情编排，最接近影视对话方向。 |
| AI 故事游戏 | [AI Dungeon](https://aidungeon.com/) | 早期 AI 文字冒险代表，说明无限生成叙事的吸引力和失控风险。 |
| AI 叙事世界 | [Hidden Door](https://www.hiddendoor.co/) | AI 互动叙事和 IP 世界探索参考。 |
| AI 游戏生成 | [Rosebud AI](https://www.rosebud.ai/) | 用自然语言生成/修改游戏原型，适合看 UGC 工作流。 |
| AI 素材 | [Scenario](https://www.scenario.com/) | 游戏美术资产生成和风格一致性，可接入素材管线。 |
| AI 创作助手 | [Unity Muse](https://unity.com/products/muse) | 游戏开发 AI 助手，偏通用，但可参考素材/动画/脚本工作流。 |
| AI 游戏平台 | [Roblox Assistant](https://create.roblox.com/docs/assistant) | UGC 平台里的 AI 创作助手，可参考自然语言到玩法编辑。 |
| 游戏 QA AI | [modl.ai](https://modl.ai/) | 偏测试和 bots，不是叙事产品，但可参考自动 playtest。 |

## 开源框架和可复用组件

### 叙事与对话框架

| 框架 | 链接 | 用法 |
| --- | --- | --- |
| Ren'Py | [renpy.org](https://www.renpy.org/) | 视觉小说最成熟开源引擎，适合 MVP 导出可玩作品。 |
| Ink | [inkle/ink](https://github.com/inkle/ink) | 分支叙事脚本语言，适合生成剧情图和变量逻辑。 |
| Yarn Spinner | [Yarn Spinner](https://www.yarnspinner.dev/) | Unity/Godot 常用对话脚本系统，适合游戏化对话树。 |
| Twine | [twinery.org](https://twinery.org/) | 低门槛互动文本/分支故事创作工具。 |
| Narrat | [Narrat](https://github.com/liana-p/narrat) | 开源 narrative RPG engine，可做网页叙事游戏。 |
| Godot Dialogue Manager | [GitHub](https://github.com/nathanhoad/godot_dialogue_manager) | Godot 对话系统，适合轻量游戏原型。 |

### AI 角色与智能体

| 框架 | 链接 | 用法 |
| --- | --- | --- |
| AI Town | [GitHub](https://github.com/a16z-infra/ai-town) | 多角色社交模拟，适合参考事件流和角色记忆。 |
| Generative Agents | [GitHub](https://github.com/joonspk-research/generative_agents) | 观察、记忆、反思、计划的角色架构参考。 |
| LLMUnity | [GitHub](https://github.com/undreamai/LLMUnity) | Unity 内接入本地/远程 LLM，适合 AI 角色原型。 |
| Letta | [GitHub](https://github.com/letta-ai/letta) | 长期记忆 agent，适合角色持续记忆。 |
| mem0 | [GitHub](https://github.com/mem0ai/mem0) | 应用级记忆层，适合用户偏好和角色关系。 |
| SOTOPIA | [GitHub](https://github.com/sotopia-lab/sotopia) | 社交智能评估，可测试角色冲突、协作、礼貌和目标达成。 |

### 语音、头像和实时交互

| 框架 | 链接 | 用法 |
| --- | --- | --- |
| LiveKit Agents | [GitHub](https://github.com/livekit/agents) | 实时语音 agent、打断、流式音频。 |
| Pipecat | [GitHub](https://github.com/pipecat-ai/pipecat) | 可替换 STT/LLM/TTS 的实时多模态 pipeline。 |
| Vocode | [GitHub](https://github.com/vocodedev/vocode-python) | 语音 agent 抽象参考。 |
| Rive | [rive.app](https://rive.app/) | 2D 动画角色表情/状态机，可做轻量角色表现。 |

## 为什么要做垂类，而不是通用游戏制作智能体

通用游戏制作智能体很容易失败，因为它同时要理解引擎、代码、美术、玩法、物理、UI、关卡、多人网络和发布流程。影视对话游戏更适合作为垂类切入：

- 玩法空间可控：核心是剧情、选择、关系、变量和对话。
- 生成结果可评估：剧情是否闭环、角色是否一致、分支是否可达。
- 用户上手快：不需要懂引擎和代码。
- AI 优势明显：角色对白、剧情扩写、设定补全、分支生成正是 LLM 擅长的。
- 商业形态清晰：UGC 互动故事、付费角色包、IP 剧情、恋爱/悬疑/职场细分题材。

## 目标用户

| 用户 | 需求 |
| --- | --- |
| 普通创作者 | 输入设定和角色，快速生成可玩的互动剧情。 |
| 短剧/网文作者 | 把已有故事改成互动影视对话游戏。 |
| 乙女/恋爱游戏创作者 | 快速生成角色线、好感度、分支结局。 |
| 剧本杀/推理作者 | 生成线索、对话、嫌疑人动机、推理路径。 |
| 教育/培训团队 | 做情景对话训练，如销售、面试、客服、语言学习。 |

## 核心工作流

```text
idea prompt
  -> world bible generator
  -> character card generator
  -> plot graph planner
  -> scene beat generator
  -> dialogue and choice generator
  -> variable/relationship system
  -> asset prompt generator
  -> playable export
  -> playtest and repair agent
```

用户视角：

1. 输入故事类型：悬疑、恋爱、职场、奇幻、校园等。
2. 输入核心设定：世界观、主角、目标、冲突、时长。
3. AI 生成角色卡、剧情大纲、章节和关键分支。
4. 用户选择风格和素材形态：文字、立绘、背景、语音。
5. AI 生成可玩原型。
6. 用户试玩，AI 自动发现死分支、人物 OOC、剧情矛盾。
7. 一键发布或导出。

## 系统架构

```text
Authoring UI
  -> Design Agent
  -> Story Graph Service
  -> Character Bible Service
  -> Dialogue Generator
  -> Runtime Director
  -> Memory and State Store
  -> Asset Pipeline
  -> Playtest Agent
  -> Exporter
```

模块说明：

- Design Agent：理解用户意图，确定题材、时长、玩法模板。
- World Bible Service：生成并维护世界观、规则、地点、势力、时间线。
- Character Bible Service：角色身份、动机、关系、说话风格、秘密。
- Story Graph Service：章节、场景、选择、变量、结局、可达性。
- Dialogue Generator：按 scene beat 生成对白，不自由乱跑。
- Runtime Director：运行时控制节奏、目标、冲突、分支推进。
- Memory and State Store：好感度、信任、线索、已知事实、玩家选择。
- Asset Pipeline：生成背景/立绘/配音/音乐提示词和素材引用。
- Playtest Agent：自动试玩，检查死分支、矛盾、OOC、内容风险。
- Exporter：导出 Web、Ren'Py、Godot 或 Unity 原型。

## 核心 Agent 框架：pi-mono

核心 agent runtime 可以基于 [pi-mono / Pi Agent Harness](https://github.com/badlogic/pi-mono)。它适合放在后端 Agent Orchestrator 层，负责多 agent 编排、工具调用、状态管理和模型 provider 抽象。

推荐定位：

```text
Web UI
  -> Product API
  -> pi-mono Agent Orchestrator
      -> Story Agent
      -> Character Agent
      -> Asset Director Agent
      -> Ren'Py Builder Agent
      -> Playtest Agent
      -> LLM Provider Adapter
      -> Tool Registry
  -> Job Queue / DB / Object Storage / Preview Runtime
```

pi-mono 适合负责：

- agent 生命周期：创建、运行、暂停、恢复、记录 trace。
- LLM provider 抽象：统一调用不同模型服务。
- tool registry：注册故事图读写、资源计划、图片任务、Ren'Py 构建等工具。
- state management：维护 agent 工作状态和中间产物。
- CLI/后台任务：适合离线生成、批量修复和 playtest。
- 可嵌入/RPC：让网页后端调用 agent 能力。

不建议让 pi-mono 直接负责：

- Web 前端 UI。
- 图片二进制存储。
- 生成队列和取消语义。
- Ren'Py runtime 本身。
- 支付、权限、用户系统。

这些应该由产品后端、队列、对象存储和预览运行时分别承担。

### 工具设计

把每个可执行能力封装成 pi-mono tool：

| Tool | 作用 |
| --- | --- |
| `story_graph.create` | 根据 brief 生成剧情图。 |
| `story_graph.update_node` | 修改场景、选择、结局。 |
| `character.create` | 生成角色卡。 |
| `character.lock_reference` | 锁定角色标准图。 |
| `asset.plan` | 生成 asset manifest。 |
| `asset.enqueue_generation` | 把图片任务放进外部 job queue。 |
| `asset.accept_candidate` | 接受候选图并锁定。 |
| `renpy.generate_script` | 根据 story graph 生成 `.rpy`。 |
| `renpy.lint` | 调用 Ren'Py lint 或自定义静态检查。 |
| `playtest.run` | 自动遍历剧情分支并报告问题。 |
| `project.export` | 导出 Web/Ren'Py 包。 |

工具调用要保持“可审计”和“可回滚”：

- 每次工具调用记录输入、输出、模型、时间、用户确认状态。
- 修改项目状态的工具要写 operation log。
- 用户 locked 的资源不能被 agent 自动覆盖。
- 生成图片这类长任务只返回 job id，结果由队列异步写回。

### Agent 拆分

| Agent | 责任 | 主要工具 |
| --- | --- | --- |
| Design Agent | 把用户想法转成可执行创作规格 | `story_graph.create`, `character.create` |
| Story Agent | 管理剧情图、分支、结局和变量 | `story_graph.update_node`, `playtest.run` |
| Character Agent | 管理角色卡、关系、秘密和语气 | `character.create`, `character.lock_reference` |
| Asset Director Agent | 规划背景、立绘、CG 和 prompt | `asset.plan`, `asset.enqueue_generation` |
| Ren'Py Builder Agent | 生成 `.rpy` 和资源声明 | `renpy.generate_script`, `renpy.lint` |
| QA Agent | 检查死分支、缺图、OOC 和内容风险 | `playtest.run`, `story_graph.update_node` |

### 与网页任务队列的关系

pi-mono 不应该阻塞等待图片生成。推荐模式：

```text
Asset Director Agent
  -> calls asset.enqueue_generation
  -> returns job_id
  -> Web UI subscribes to job updates
  -> user accepts/retries/cancels
  -> accepted asset updates project state
  -> Ren'Py Builder Agent reads only accepted assets
```

这样用户可以在网页上看到生成图、取消、重试和锁定，同时 agent 不会被长时间图片任务卡住。

## Runtime 对话策略

影视对话游戏不适合让 LLM 无约束聊天。推荐“剧情图 + 受控生成”：

```text
current scene
  + character card
  + player choice
  + relationship variables
  + allowed facts
  + scene objective
  -> constrained LLM dialogue
  -> verifier checks lore, tone, safety, branch target
  -> state update
```

关键约束：

- 每个场景有明确目标：透露线索、制造冲突、提升好感、触发选择。
- 每个角色有秘密、动机、语气和不可说信息。
- LLM 只能在当前场景允许的事实范围内发挥。
- 关键剧情节点用确定性变量控制，不靠 LLM 自由决定。
- LLM 输出要经过 verifier，检查 OOC、剧透、跑题、内容安全。

## 数据结构设计

### Character Card

```json
{
  "id": "char_lina",
  "name": "Lina",
  "role": "detective",
  "public_profile": "calm, sharp, restrained",
  "private_motivation": "find out who betrayed her mentor",
  "speech_style": "short sentences, precise questions",
  "relationship_to_player": "suspicious but curious",
  "secrets": ["knows the victim's last message"],
  "boundaries": ["never reveals the last message before scene_04"]
}
```

### Scene Node

```json
{
  "id": "scene_03_cafe",
  "objective": "player earns Lina's partial trust",
  "location": "rainy cafe",
  "characters": ["player", "char_lina"],
  "required_facts": ["victim visited the cafe"],
  "hidden_facts": ["Lina saw the suspect"],
  "choices": [
    {"id": "ask_directly", "effect": {"trust_lina": -1}},
    {"id": "share_clue", "effect": {"trust_lina": 2}}
  ],
  "next": ["scene_04_alley", "scene_04_library"]
}
```

### Runtime State

```json
{
  "player_known_facts": ["victim visited the cafe"],
  "relationship": {"char_lina": {"trust": 3, "affection": 0}},
  "flags": {"found_ticket_stub": true},
  "current_scene": "scene_03_cafe"
}
```

## MVP 路线

目标：让用户从一句设定生成一个 10-15 分钟可玩的互动对话原型。

MVP 能力：

- 题材模板：悬疑、恋爱、职场、奇幻 4 类。
- 角色卡生成：3-5 个角色。
- 剧情图生成：8-12 个场景，2-3 个结局。
- 对白生成：按场景目标生成对白和选择。
- 简单变量：好感、信任、线索、结局条件。
- Web playable：不用先接 Unity。
- 自动检查：死分支、缺失变量、角色 OOC、内容安全。

推荐技术栈：

- 前端：React/Next.js。
- 叙事 DSL：自定义 JSON graph 或 Ink/Yarn 风格。
- 运行时：TypeScript state machine。
- LLM：用于生成和运行时对白。
- 记忆：Postgres + JSONB，或轻量 KV。
- 导出：Web playable，后续再导 Ren'Py。

## V1 路线

目标：从原型生成器升级为创作者工具。

新增能力：

- 可视化剧情图编辑器。
- 角色关系图和秘密管理。
- 素材生成管线：背景、立绘、表情、音乐、音效、TTS。
- Playtest Agent：自动试玩所有分支，生成修复建议。
- 多语言版本。
- 运行时角色记忆：玩家选择影响后续语气和分支。
- 模板市场：恋爱、悬疑、面试训练、销售训练等。
- 导出 Ren'Py/Godot/Unity。

## V2 路线

目标：形成垂类 UGC 平台。

新增能力：

- 多角色导演智能体：控制节奏、冲突、伏笔和反转。
- 多模态互动：语音输入、角色 TTS、2D 动画表情、短视频片段。
- IP/版权检查：防止直接生成受保护角色和素材。
- 创作者数据看板：完播率、选择分布、角色热度、付费点。
- 协作创作：多人共写世界观、角色线和章节。
- 安全治理：成人内容、未成年人、情感依赖、仇恨骚扰、版权风险。
- 发布平台：作品库、角色包、付费章节、社区评论。

## 评估指标

生成质量：

- 剧情闭环率。
- 分支可达率。
- 角色一致性。
- 场景目标达成率。
- 伏笔回收率。
- 对白自然度。

用户创作效率：

- 从 idea 到 playable 的时间。
- 用户手动修改次数。
- Playtest 自动修复采纳率。
- 导出成功率。

运行体验：

- 玩家完播率。
- 关键选择点击率。
- 重玩率。
- 角色喜爱度。
- 平均响应延迟。

安全与合规：

- 内容违规率。
- 版权/IP 命中率。
- 未成年人风险样本命中率。
- 用户举报率。

## 风险与防护

| 风险 | 表现 | 防护 |
| --- | --- | --- |
| 剧情失控 | LLM 跑题、提前剧透、改变结局 | 剧情图约束、allowed facts、verifier。 |
| 角色漂移 | 角色语气和动机不一致 | 角色卡常驻、OOC 检查、角色语料 few-shot。 |
| 死分支 | 选择后无可达结局 | Playtest Agent 遍历分支。 |
| 内容安全 | 色情、暴力、仇恨、未成年人风险 | 内容分级、模板限制、审核模型。 |
| 版权/IP | 生成近似知名角色或素材 | IP 检查、风格改写、素材来源记录。 |
| 成本过高 | 运行时每句都调用大模型 | 关键节点缓存、离线生成对白、运行时只补动态反应。 |
| 同质化 | 所有故事像同一套模板 | 题材模板细分、创作者控制点、风格参考库。 |

## 面试或项目包装

可以这样描述：

> 设计一个垂类 AI 游戏制作智能体，面向互动影视/视觉小说/角色对话游戏，从用户输入的故事设定自动生成世界观、角色卡、剧情图、分支变量、对白和可玩 Web 原型。系统采用“剧情图约束 + LLM 受控生成 + 角色记忆 + 自动 playtest”的架构，解决通用游戏制作智能体范围过大、生成不可控的问题。

技术亮点：

- 用结构化 Story Graph 控制剧情，而不是让 LLM 自由编。
- 用 Character Bible 和 allowed facts 约束角色对白。
- 用 Playtest Agent 自动检查死分支、OOC 和剧情矛盾。
- 支持导出 Web/Ren'Py/Godot，先垂类闭环再扩展。
- 大模型同时用于创作期和运行期，但关键状态由确定性变量控制。

## 推荐先做的 Demo

Demo 名称：

> 10 分钟生成一部可玩的 AI 悬疑对话短剧

流程：

1. 用户输入：“一个雨夜咖啡馆谋杀案，玩家是实习记者，需要从三名嫌疑人的对话中找出真相。”
2. AI 生成 4 个角色、8 个场景、3 个结局。
3. AI 生成角色立绘/背景提示词和对白。
4. 用户点“试玩”，进入 Web 互动对话。
5. 玩家选择会改变信任、线索和结局。
6. Playtest Agent 给出“死分支/OOC/剧情矛盾”报告。

## Ren'Py 与 Agent 的结合方式

Ren'Py 适合做 MVP，因为它把视觉小说拆成很清晰的工程结构：

```text
renpy-project/
  game/
    script.rpy
    characters.rpy
    screens.rpy
    images/
      bg/
      characters/
      cg/
      ui/
    audio/
```

Agent 要做的不是“操作整个游戏引擎”，而是把用户创意编译成 Ren'Py 可运行工程。

### 推荐 Agent 分工

| Agent | 输入 | 输出 |
| --- | --- | --- |
| Product Agent | 用户的一句话创意、题材、时长、受众 | 游戏定位、核心循环、结局数量、内容边界 |
| Story Agent | 游戏定位、世界观 | 章节、场景、剧情图、关键选择、结局条件 |
| Character Agent | 世界观、剧情需求 | 角色卡、语气、秘密、关系变量、表情需求 |
| Screenplay Agent | 场景目标、角色卡、变量 | Ren'Py 对白、choice menu、jump/label、变量更新 |
| Asset Director Agent | 场景和角色需求 | 图片清单、风格规范、生成 prompt、尺寸规格 |
| Image Pipeline Agent | 图片清单和 prompt | 背景、角色立绘、表情、CG、UI 图片文件 |
| Ren'Py Builder Agent | 剧本、资源路径、配置 | `.rpy` 文件、资源声明、可运行项目 |
| Playtest Agent | Ren'Py 工程 | lint 结果、死分支、缺图、变量错误、剧情矛盾报告 |

### 编译流程

```text
user idea
  -> game design spec
  -> story graph JSON
  -> character cards
  -> asset manifest
  -> image generation
  -> Ren'Py .rpy generation
  -> renpy lint/build
  -> playtest repair loop
```

关键点：

- 剧情结构先落成 JSON graph，再生成 `.rpy`，不要直接让 LLM 写长脚本。
- 所有角色、场景、图片都有稳定 id，避免脚本和素材对不上。
- agent 每次生成脚本后必须跑 Ren'Py lint，自动修复 missing label、missing image、变量未定义等问题。
- 运行时动态对话可以保留，但主线剧情、结局和关键变量应由确定性脚本控制。

### Ren'Py 脚本生成示例

```renpy
define l = Character("Lina", color="#8fb8ff")
define p = Character("[player_name]", color="#ffffff")

default trust_lina = 0
default found_ticket_stub = False

image bg cafe_rain = "images/bg/cafe_rain.png"
image lina neutral = "images/characters/lina_neutral.png"
image lina suspicious = "images/characters/lina_suspicious.png"

label start:
    scene bg cafe_rain
    show lina suspicious at center

    l "You came alone. That was either brave or foolish."
    p "I just want to know why the victim came here last night."

    menu:
        "Show her the ticket stub.":
            $ trust_lina += 2
            $ found_ticket_stub = True
            jump cafe_share_clue
        "Ask her directly what she knows.":
            $ trust_lina -= 1
            jump cafe_push_too_hard

label cafe_share_clue:
    show lina neutral
    l "Fine. Maybe you are not wasting my time."
    jump alley_scene

label cafe_push_too_hard:
    l "You journalists always confuse pressure with insight."
    jump library_scene
```

## 图片生成怎么做

Ren'Py 需要的是最终图片文件，不关心图片从哪里来。Agent 系统通常会把图片拆成四类：

| 图片类型 | 用途 | 常见规格 |
| --- | --- | --- |
| Background | 场景背景，如咖啡馆、街道、房间 | 1920x1080 或 16:9 |
| Character Sprite | 角色立绘，通常透明背景 | 1024x1536、PNG、透明背景 |
| Expression Variant | 同一角色的表情差分 | neutral、happy、angry、sad、suspicious |
| CG/Event Image | 关键剧情插图 | 16:9 或 4:3 |
| UI Asset | 按钮、边框、图标、标题 | 根据 UI 设计 |

图片生成不是 Ren'Py 内置能力，需要外部资源来源。常见三种方案：

### 方案 A：MVP 用占位图或素材库

最快。

- 使用开源/商用授权素材包。
- Agent 只负责挑选素材和绑定路径。
- 适合先验证剧情和编辑器流程。

优点：便宜、稳定、版权清晰。
缺点：不够个性化。

### 方案 B：调用云端图片生成 API

最适合产品化原型。

可选类型：

- OpenAI Images、Stability AI、Replicate/FLUX、Leonardo、Scenario、Runware 等。
- Midjourney 适合人工创作流，但产品化 API 和自动化要谨慎评估。
- Scenario 更偏游戏美术风格一致性和资产管线。

Agent 负责：

- 生成 prompt。
- 指定角色一致性参考。
- 调用 API。
- 保存图片。
- 记录 seed、model、prompt、source、license。
- 把图片路径写进 Ren'Py。

优点：接入快，效果好。
缺点：成本、延迟、风格一致性和版权要管。

### 方案 C：本地生成管线

适合成本敏感或需要风格控制。

常见组合：

- ComfyUI + SDXL/FLUX。
- LoRA 做角色/画风一致性。
- ControlNet/IP-Adapter 做姿势、构图和角色参考。
- rembg 或分割模型处理透明背景。

优点：成本可控、可定制。
缺点：部署复杂，需要 GPU 和美术 pipeline 调参。

## 图片资源清单设计

Agent 不应只生成 prompt，而要维护 asset manifest。

```json
{
  "asset_id": "char_lina_suspicious",
  "type": "character_sprite",
  "character_id": "char_lina",
  "expression": "suspicious",
  "style": "cinematic anime noir",
  "size": "1024x1536",
  "transparent_background": true,
  "prompt": "A calm female detective, blue trench coat, suspicious expression...",
  "negative_prompt": "extra fingers, blurry, watermark, text",
  "model": "image-api-or-local-workflow",
  "seed": 184229,
  "file_path": "game/images/characters/lina_suspicious.png",
  "status": "generated"
}
```

好处：

- Ren'Py 脚本可以稳定引用 `file_path`。
- 缺图时 Playtest Agent 能自动发现。
- 同一角色的多个表情能复用风格、seed、参考图。
- 后续能做版权审计、素材替换和重生成。

## 角色一致性怎么保证

AI 影视对话游戏最容易出问题的是角色每张图都不像同一个人。

推荐策略：

1. 先生成 character sheet：正面、半身、表情、服装设定。
2. 后续表情和 CG 都使用同一参考图。
3. 云 API 场景下使用 image reference / style reference 能力。
4. 本地场景下使用 LoRA、IP-Adapter、ControlNet。
5. 每个角色固定色彩、发型、服装关键词。
6. 生成后做人脸/角色一致性检查，不合格自动重试。

## 使用 GPT Image 2 保持人物一致性

用 `gpt-image-2` 这类图像 API 时，不要把每张角色图都当成独立 text-to-image 任务。独立生成最容易漂移。更稳的方式是“先建立角色标准图，再用编辑/参考图生成变体”。

### 推荐流程

```text
1. Character Agent 生成角色设定
2. Image Agent 生成 character sheet
3. 人工或模型选择 canonical portrait
4. 后续所有表情/动作/CG 都以 canonical portrait 作为参考图
5. 用 image edit / reference input 生成变体
6. 自动一致性评分
7. 不合格重试或进入人工挑选
8. 写入 asset manifest 和 Ren'Py image 声明
```

### 关键策略

| 策略 | 作用 |
| --- | --- |
| 先生成 character sheet | 把脸、发型、服装、色彩、身形固定下来。 |
| 后续只做 edit，不重新 text-to-image | 让模型围绕参考图改表情、姿势、场景。 |
| 一次生成多个表情 contact sheet | 同一张图里生成 neutral/happy/angry/sad/suspicious，再裁切，通常比多次单独生成更一致。 |
| prompt 明确“只改变表情” | 避免换脸、换衣服、换年龄。 |
| 资源清单记录参考图 | 每个 sprite 都知道基于哪张 canonical image 生成。 |
| 自动 QC | 用视觉模型/embedding 检查脸、发型、服装、主色是否一致。 |

### Prompt 模板

生成角色标准图：

```text
Create a character design sheet for a Ren'Py visual novel.
Character: Lina, a calm female detective in her late 20s.
Fixed traits: short black bob hair, pale blue trench coat, sharp gray eyes,
reserved expression, cinematic noir anime style.
Output: front-facing half-body portrait, neutral expression, clean line art,
transparent background, no text, no watermark.
```

基于参考图生成表情变体：

```text
Using the provided reference portrait, create the same character as a Ren'Py
transparent PNG sprite. Preserve her face shape, hair style, hair color,
eye color, outfit, body proportions, and art style exactly.

Only change her expression to: suspicious.
Do not change age, clothing, hairstyle, camera angle, or identity.
Transparent background, half-body, centered composition, no text, no watermark.
```

生成剧情 CG：

```text
Using the provided character reference, create a cinematic 16:9 event CG.
The same detective Lina sits in a rainy cafe at night, looking suspiciously
at the player across the table. Preserve her identity, hairstyle, coat, eye
color, and noir anime style. Dramatic lighting, no text, no watermark.
```

### API 接入形态

工程上建议把图片生成封装成一个 `ImageProvider`，不要把业务逻辑写死在某个供应商 API 里。

伪代码：

```python
result = image_provider.edit(
    model="gpt-image-2",
    reference_images=[
        "assets/refs/lina_canonical.png",
        "assets/refs/noir_style_sheet.png"
    ],
    prompt=prompt,
    size="1024x1536",
    background="transparent",
    output_format="png",
    quality="high"
)
```

如果接口支持保真参数，生成角色变体时应选择高保真输入模式。官方 `gpt-image-2` 文档中图像模型支持图像输入/输出，图片编辑 API 支持输入图像并返回生成图像；具体参数以当前 OpenAI API 文档为准。

### 自动一致性评分

每张生成图都应过一层 QC，不要直接进游戏。

检查项：

- Face similarity：和 canonical portrait 的脸部/角色 embedding 相似度。
- Outfit consistency：服装颜色、关键元素是否一致。
- Hair consistency：发型、发色是否一致。
- Style consistency：是否仍是同一画风。
- Transparency check：角色 sprite 是否真的透明背景。
- Ren'Py fit check：尺寸、裁切、站位是否适合对话框。

低于阈值时：

```text
retry with stricter prompt
  -> retry with same reference plus failed image as negative explanation
  -> send to manual selection
```

### 什么时候需要本地 LoRA/ComfyUI

如果需求是少量角色、少量表情，GPT Image 2 + 参考图编辑通常足够。

如果需求是：

- 同一角色几十上百张图。
- 多套衣服但脸必须稳定。
- 商业级美术管线。
- 需要固定姿势、构图、镜头。
- 对成本和批量生成很敏感。

那可以考虑本地 ComfyUI/FLUX/SDXL + LoRA/IP-Adapter/ControlNet。它更复杂，但角色一致性和批量成本更可控。

### 结论

不能只靠一句 prompt 保证人物一致性。更可靠的做法是：

```text
canonical character sheet
  + reference-image editing
  + asset manifest
  + automatic QC
  + retry/manual review
```

图像 API 负责生成位图，agent 负责管理角色设定、参考图、prompt、文件路径、质量检查和 Ren'Py 绑定。

## 网页可视化 Agent 工作台

这个产品不应该让 agent 在后台一次性生成所有图片和脚本。更好的体验是：agent 先生成计划，用户在网页里逐步确认。尤其是图片资源，必须让用户看到预览，并能取消、重试、修改 prompt、锁定参考图。

### 核心界面

| 页面 | 作用 |
| --- | --- |
| Project Brief | 用户输入题材、时长、角色数量、画风、目标平台。 |
| Story Graph | 展示章节、场景、选择分支、结局，可编辑节点。 |
| Character Board | 展示角色卡、标准图、表情列表、关系变量。 |
| Asset Board | 展示所有背景、立绘、CG、UI 图片的生成状态。 |
| Generation Queue | 实时显示生成队列、进度、失败、取消、重试。 |
| Preview Player | 在浏览器中试玩 Ren'Py-like 原型或 Web runtime。 |
| Build Panel | 导出 Web/Ren'Py/Godot，显示 lint/build 错误。 |

### 图片生成的人机协作流程

```text
agent proposes asset manifest
  -> user reviews planned assets
  -> user starts generation batch
  -> each asset becomes a job card
  -> image provider generates candidates
  -> UI shows preview grid
  -> user accepts / retries / edits prompt / cancels
  -> accepted asset is locked
  -> Ren'Py script references only locked assets
```

资源卡片建议包含：

- asset id。
- 类型：background、character sprite、expression、CG、UI。
- 当前 prompt。
- reference image。
- 生成状态。
- 候选图列表。
- 使用到的模型和参数。
- 操作按钮：Accept、Retry、Edit Prompt、Cancel、Use as Reference、Delete。

### 任务状态机

```text
draft
  -> queued
  -> generating
  -> preview_ready
  -> accepted
  -> locked

generating -> cancel_requested -> cancelled
preview_ready -> retry_requested -> queued
preview_ready -> rejected
failed -> retry_requested -> queued
```

状态含义：

- draft：agent 只是规划了这个资源，还没开始生成。
- queued：用户确认后进入队列。
- generating：图片服务正在生成。
- preview_ready：候选图已返回，等待用户选择。
- accepted：用户选中某一张候选图。
- locked：资源被脚本引用，不再自动覆盖。
- cancelled：用户取消，结果不入库、不写入脚本。
- failed：生成失败，可重试或改 prompt。

### 取消机制

取消要分两层：

1. 产品层取消：用户点击 Cancel 后，任务标记为 `cancel_requested`，即使远端 API 后来返回结果，也丢弃，不进入 asset manifest。
2. 执行层取消：如果使用本地 ComfyUI/队列 worker，可以尝试终止当前任务或移除排队任务。

注意：云端图片 API 请求一旦发出，通常不应假设一定能真正停止远端计算。产品上要保证的是：

- 用户界面立即停止等待。
- 取消后的结果不展示或标记为 discarded。
- 不覆盖已接受资源。
- 不写入 Ren'Py 脚本。
- 后台日志能追踪这个任务为何被取消。

### Retry 设计

Retry 不应该只是“再来一次”。建议提供三种重试：

| Retry 类型 | 用途 |
| --- | --- |
| Same Prompt Retry | prompt 不变，重新抽样，适合小瑕疵。 |
| Guided Retry | 用户选择问题标签：不像本人、手崩、背景错、风格错、表情错。 |
| Prompt Edit Retry | 用户直接改 prompt，再生成。 |

Guided Retry 可以把用户反馈转成 prompt patch：

```json
{
  "asset_id": "char_lina_suspicious",
  "retry_reason": "identity_drift",
  "prompt_patch": "Preserve the exact same face shape, hairstyle, coat, eye color, and age as the reference portrait. Only change the expression."
}
```

### Web 技术架构

```text
Next.js / React UI
  -> API server
  -> Agent Orchestrator
  -> Job Queue
  -> Image Provider
  -> Object Storage
  -> Project DB
  -> Preview Runtime
```

推荐组件：

- 前端：React/Next.js，图片卡片和剧情图编辑器。
- 实时状态：SSE 或 WebSocket。
- 队列：BullMQ、Celery、Temporal、Cloud Tasks 任选其一。
- 存储：S3/R2/OSS/本地 MinIO。
- 数据库：Postgres，JSONB 存 story graph 和 asset manifest。
- 预览：Web runtime 先跑，Ren'Py 导出作为后续能力。

### API 设计草案

```http
POST /projects
POST /projects/:id/story/plan
POST /projects/:id/assets/plan
POST /projects/:id/assets/:assetId/generate
POST /projects/:id/jobs/:jobId/cancel
POST /projects/:id/assets/:assetId/retry
POST /projects/:id/assets/:assetId/accept
POST /projects/:id/assets/:assetId/lock
GET  /projects/:id/jobs/stream
GET  /projects/:id/preview
POST /projects/:id/export/renpy
```

### 数据模型草案

```json
{
  "job_id": "job_123",
  "project_id": "proj_001",
  "asset_id": "char_lina_suspicious",
  "status": "preview_ready",
  "provider": "gpt-image-2",
  "prompt": "Using the reference portrait...",
  "reference_asset_ids": ["char_lina_canonical"],
  "candidates": [
    {
      "candidate_id": "cand_01",
      "url": "s3://project-assets/lina_suspicious_01.png",
      "qc_score": 0.87
    }
  ],
  "selected_candidate_id": null,
  "created_at": "2026-06-24T10:30:00Z"
}
```

### Agent 操作原则

- agent 可以建议，不应直接覆盖用户锁定的图片。
- agent 生成大批资源前要先给用户看 asset plan。
- 用户接受的图片进入 locked 状态，后续脚本只引用 locked assets。
- agent 自动修复脚本时，如果发现缺图，应创建 draft asset，而不是随便替换成已有图。
- 所有 prompt、模型、参考图和用户选择都要保留，方便回滚和复现。

## 最小可行图片管线

MVP 不要一开始追求全自动高质量美术。推荐这样做：

```text
1. Agent 生成 asset manifest
2. 背景先用图片 API 生成
3. 角色先生成 1 张立绘 + 3 个表情
4. 自动裁切/透明化/压缩
5. 写入 Ren'Py image 声明
6. renpy lint 检查缺图
7. 人工可替换图片
```

初期每个 Demo 控制在：

- 4-8 张背景。
- 3-5 个角色。
- 每个角色 3-5 个表情。
- 2-4 张关键 CG。

这样成本、质量和可控性都比较好。
