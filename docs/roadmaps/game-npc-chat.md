# AI 游戏聊天 / NPC 对话技术路径

更新时间：2026-06-24

## 定位

目标是让 NPC 更像“活在世界里”的角色：会说话、记得玩家、理解当前场景、能推动任务，但不能越权改变游戏世界。LLM 应负责对话、意图、角色表现和动作提案；游戏端规则系统负责状态验证、动作执行、回滚和审计。

核心原则：

- LLM 不是世界状态权威。
- NPC 的知识来自角色卡、世界书、任务状态和检索，不允许随意编 lore。
- 所有游戏状态变更必须经过动作 DSL、权限校验和游戏端事务层。

## 代表论文

| 方向 | 论文 | 年份 | 价值 |
| --- | --- | ---: | --- |
| 社会模拟 | [Generative Agents: Interactive Simulacra of Human Behavior](https://arxiv.org/abs/2304.03442) | 2023 | 经典“记忆-反思-计划”NPC 小镇范式。 |
| 开放世界 agent | [Voyager: An Open-Ended Embodied Agent with Large Language Models](https://arxiv.org/abs/2305.16291) | 2023 | Minecraft 中的持续探索、技能库和自我提升。 |
| 游戏知识/记忆 | [Ghost in the Minecraft](https://arxiv.org/abs/2305.17144) | 2023 | 文本知识、记忆和任务分解在开放世界环境中的应用。 |
| 规则推理 | [SPRING: Studying the Paper and Reasoning to Play Games](https://arxiv.org/abs/2305.15486) | 2023 | 从规则文档中推理行动，适合世界规则 grounding。 |
| 多模态游戏 agent | [JARVIS-1](https://arxiv.org/abs/2311.05997) | 2023 | 记忆增强、多模态、多任务游戏 agent。 |
| 自我修正 | [Reflexion](https://arxiv.org/abs/2303.11366) | 2023 | 可用于 NPC 失败复盘和任务规划修正。 |
| 长期记忆 | [MemGPT](https://arxiv.org/abs/2310.08560) | 2023 | 长会话和长期角色记忆的基础架构参考。 |
| 角色训练 | [Character-LLM](https://arxiv.org/abs/2310.10158) | 2023 | 角色身份、经历、风格一致性的训练和评估。 |
| 角色评测 | [RoleLLM](https://arxiv.org/abs/2310.00746) | 2023/2024 | 可转成 NPC 人设一致性测试。 |
| 游戏综述 | [Large Language Models and Games: A Survey and Roadmap](https://arxiv.org/abs/2402.18659) | 2024 | 覆盖 LLM 在游戏设计、NPC、agent、内容生成中的路线图。 |
| 文本虚拟世界 | [CharacterBox](https://arxiv.org/abs/2412.05631) | 2024 | 文本虚拟世界里的角色扮演评估，更贴近 NPC 对话。 |
| NPC 规划 | [LLM Reasoner and Automated Planner: A new NPC approach](https://arxiv.org/abs/2501.10106) | 2025 | LLM + 自动规划器，适合“语言意图 -> 受约束动作”。 |
| 角色安全 | [The Rise of Darkness](https://arxiv.org/abs/2502.20757) | 2025 | 讨论角色扮演 agent 的安全-效用权衡。 |
| 有边界自治 | [Bounded Autonomy](https://arxiv.org/abs/2604.04703) | 2026 | 在线游戏 NPC 的关键原则：可以提案，不能越权。 |
| 环境感知 | [Empowering NPC Dialogue with Environmental Context Using LLMs and Panoramic Images](https://arxiv.org/abs/2604.19192) | 2026 | 用视觉/环境上下文增强 NPC 对话。 |

## 可参考开源项目和产品资料

| 类型 | 项目/资料 | 用法 |
| --- | --- | --- |
| 社会模拟 | [AI Town](https://github.com/a16z-infra/ai-town) | 多 NPC 社交和实时事件流原型。 |
| 论文代码 | [Generative Agents](https://github.com/joonspk-research/generative_agents) | Smallville 风格 agent 架构参考。 |
| Unity | [LLMUnity](https://github.com/undreamai/LLMUnity) | Unity 中接入本地或远程 LLM。 |
| Unreal | [llama-unreal](https://github.com/getnamo/llama-unreal) | UE5 + llama.cpp 本地推理实验。 |
| 角色系统 | [SillyTavern](https://github.com/SillyTavern/SillyTavern) | 角色卡、世界书、长期 RP 交互经验。 |
| 本地推理 | [Ollama](https://github.com/ollama/ollama), [llama.cpp](https://github.com/ggerganov/llama.cpp) | 低成本开发和离线 NPC 实验。 |
| 语音 | [whisper.cpp](https://github.com/ggerganov/whisper.cpp), [Kokoro-FastAPI](https://github.com/remsky/Kokoro-FastAPI) | 本地 STT/TTS 原型。 |
| 语音 NPC 产品 | [NVIDIA ACE](https://developer.nvidia.com/ace) | 数字人、语音、表情和低延迟 NPC 产品形态。 |
| 大厂实验 | [Ubisoft NEO NPC](https://www.ubisoft.com/en-us/company/careers/search/articles/ubisoft-neo-npcs-generative-ai-prototype-gdc-2024) | 生成式 NPC 的产品实验参考。 |
| 商业 SDK | [Convai Unreal Engine docs](https://docs.convai.com/api-docs/plugins-and-integrations/unreal-engine) | Unreal 语音 NPC SDK 的工程形态参考。 |

## MVP 路线：可控文本 NPC

目标：在一个小场景里跑通 1-3 个 NPC，可对话、懂角色、读取有限游戏状态，但不能直接改世界。

核心模块：

- Game Adapter：Unity/Unreal 事件接入，提供只读状态快照。
- Character Card：身份、背景、语气、禁忌知识、关系、任务。
- World/Lore Pack：世界观、地点、角色关系、任务资料。
- Context Builder：角色卡 + 当前场景 + 玩家状态 + 最近对话。
- Dialogue Brain：LLM 生成回复和动作意图。
- Action Gate：只允许输出枚举动作，如 `greet`、`give_hint`、`start_quest`。
- Game Authority：游戏端验证动作是否合法，再执行。
- Basic Memory：短期对话摘要 + 玩家偏好摘要。
- Safety Filter：内容安全、越权请求、prompt injection 基础拦截。

建议动作输出 schema：

```json
{
  "dialogue": "I heard you met Mira near the old gate.",
  "intent": "give_hint",
  "action": {
    "type": "reveal_lore_hint",
    "quest_id": "old_gate_001",
    "confidence": 0.82
  },
  "memory_updates": [
    {
      "type": "player_preference",
      "content": "prefers direct hints over riddles"
    }
  ]
}
```

## V1 路线：有记忆、有任务、有语音

目标：NPC 能记住玩家、参与任务链、用语音交互，并在受控边界内触发游戏动作。

新增能力：

- Long-term Memory：事件记忆、关系记忆、事实记忆分层存储。
- Lore RAG：世界观、任务、地点、物品、阵营知识检索。
- Planner：LLM 生成意图，GOAP/PDDL/行为树负责可执行计划。
- Transaction Layer：所有世界变更走事务 schema、权限校验和日志。
- Voice Pipeline：VAD -> STT -> LLM streaming -> TTS -> lip sync。
- Observability：记录 prompt、检索片段、动作提案、校验失败原因。
- Evaluation Harness：固定测试脚本回放，多模型 A/B。

## V2 路线：多 NPC 社会生态 / 在线游戏 bounded autonomy

目标：NPC 有日程、关系、群体行为和长期成长，但仍受世界规则约束。

新增能力：

- Multi-agent Simulation：NPC 日程、关系网络、事件传播。
- World Model：结构化世界状态、时间线、因果日志。
- Bounded Autonomy：LLM 只能在权限、区域、剧情阶段内行动。
- Perception：视觉/环境上下文，多模态识别玩家位置、物品、事件。
- Model Routing：本地小模型处理闲聊，大模型处理复杂剧情/规划。
- Authoring Tool：策划可编辑角色卡、世界书、动作 DSL、测试集。
- LiveOps Safety：线上审计、灰度、封禁策略、热修规则。

## 评估指标

体验与性能：

- 首 token 延迟：文本 < 1.5s，完整回复 < 4s。
- 语音轮次端到端延迟：目标 < 2.5-4s，支持流式打断。
- 玩家满意度：自然度、角色感、帮助度分开打分。

可控性：

- 动作合法率：目标 > 98%。
- 世界状态污染率：非法/不合剧情写入次数为 0。
- Lore 违背率：人工/自动评测目标 < 5%。

长期稳定：

- 记忆命中准确率：目标 > 85%。
- 100+ 轮角色不漂移。
- 多 NPC 同一事实冲突率。

运营成本：

- 每 1000 轮对话成本。
- 每分钟语音成本。
- 每 100 并发 NPC 的推理资源。

## 风险与防护

| 风险 | 表现 | 防护 |
| --- | --- | --- |
| 乱编 lore | NPC 编造地点、人物、任务奖励 | Lore RAG、事实白名单、未知则拒答或模糊化。 |
| 越权改变世界 | LLM 直接给物品、杀怪、改剧情 | LLM 只输出动作提案；游戏端事务校验。 |
| Prompt injection | 玩家诱导 NPC 忽略人设或泄露系统 prompt | 系统指令隔离、输入清洗、策略模型二次检查。 |
| 延迟 | 语音 NPC 回答慢、打断差 | 流式 STT/TTS、小模型路由、缓存常见回复。 |
| 成本 | 多 NPC 长对话昂贵 | 本地模型、摘要记忆、冷 NPC 降频、模型路由。 |
| 角色漂移 | 长聊后语气、人设、关系混乱 | 角色卡常驻、记忆分层、定期自检、评测回放。 |
| 多 NPC 冲突 | 不同 NPC 对同一事实说法冲突 | 世界状态单一事实源，事件总线广播，记忆可纠错。 |

## 首批实现建议

1. 先定义 `GameStateSnapshot`、`CharacterCard`、`ActionDSL` 三个 schema。
2. LLM 输出永远是“对话 + 动作提案”，不是直接改游戏状态。
3. 每个 NPC 先限制在 5-10 个可执行动作，避免无限开放。
4. 搭建离线脚本回放评测，先测 50 个固定场景再接入真实玩家。

