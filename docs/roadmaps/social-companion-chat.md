# AI 社交陪伴 / 真人感通用聊天技术路径

更新时间：2026-06-24

## 定位

目标是做一个透明 AI 身份的长期陪伴对话系统：稳定人格、准确记忆、有情绪理解、有关系边界、能自然多轮聊天。这里的真人感不是骗用户以为对面是真人，而是让 AI 对话少机械、少遗忘、少突兀，并且让用户完全控制它记住什么。

这个方向适合作为教育和游戏路线的通用底座，但单独做产品时要格外重视身份透明、情感依赖、隐私和危机干预边界。

## 代表论文

| 方向 | 论文 | 年份 | 价值 |
| --- | --- | ---: | --- |
| 角色扮演 | [Role-Play with Large Language Models](https://arxiv.org/abs/2305.16367) | 2023 | 讨论 LLM 角色扮演机制、风险和边界。 |
| 社会仿真 | [Generative Agents: Interactive Simulacra of Human Behavior](https://arxiv.org/abs/2304.03442) | 2023 | 观察、记忆、反思、规划的 agent 架构。 |
| 角色人格 | [Character-LLM: A Trainable Agent for Role-Playing](https://arxiv.org/abs/2310.10158) | 2023 | 可训练角色 agent，适合人格系统和角色一致性评估。 |
| 角色评测 | [RoleLLM: Benchmarking, Eliciting, and Enhancing Role-Playing Abilities](https://arxiv.org/abs/2310.00746) | 2023/2024 | 角色知识、语言风格、行为一致性评估。 |
| 人格一致性 | [InCharacter: Evaluating Personality Fidelity in Role-Playing Agents](https://arxiv.org/abs/2310.17976) | 2023 | 用心理访谈方式评估人格保真度。 |
| 社会智能 | [SOTOPIA: Interactive Evaluation for Social Intelligence in Language Agents](https://arxiv.org/abs/2310.11667) | 2023/2024 | 覆盖谈判、协作、冲突、礼貌等社交场景。 |
| 心智理论 | [FANToM: Stress-testing Machine Theory of Mind in Interactions](https://arxiv.org/abs/2310.15421) | 2023 | 测试模型对他人信念、视角和信息不对称的理解。 |
| 长期记忆 | [MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560) | 2023 | 把上下文窗口当作内存层级管理。 |
| 长期对话记忆 | [LoCoMo: Evaluating Very Long-Term Conversational Memory](https://arxiv.org/abs/2402.17753) | 2024 | 适合测试“还记不记得我”的长期陪伴能力。 |
| 人类偏好评测 | [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685) | 2023 | 可借鉴 pairwise preference 与模型裁判评估范式。 |
| 角色综述 | [Role-Playing Agents Driven by Large Language Models](https://arxiv.org/html/2601.10122v1) | 2026 | 角色扮演 agent 的近年综述，适合作为路线总入口。 |

## 可参考开源项目

| 类型 | 项目 | 用法 |
| --- | --- | --- |
| 长期记忆 agent | [Letta / MemGPT](https://github.com/letta-ai/letta) | 研究 persona + memory + tool runtime。 |
| 用户记忆层 | [mem0](https://github.com/mem0ai/mem0) | MVP 快速接入偏好、事实、关系记忆。 |
| 时间知识图谱 | [Graphiti](https://github.com/getzep/graphiti) | 关系演化、事件链、冲突记忆处理。 |
| 社交评测 | [SOTOPIA](https://github.com/sotopia-lab/sotopia) | 离线测试社交智能和角色互动质量。 |
| 多 agent 社交 | [AI Town](https://github.com/a16z-infra/ai-town) | 多 agent 事件流和社交模拟参考。 |
| 记忆编排 | [LangGraph memory](https://langchain-ai.github.io/langgraph/concepts/memory/) | semantic、episodic、procedural memory 的工程拆法。 |
| 实时语音 | [LiveKit Agents](https://github.com/livekit/agents) | 低延迟语音、打断、流式音频。 |
| 语音管线 | [Pipecat](https://github.com/pipecat-ai/pipecat) | 可替换 STT、LLM、TTS 的实时多模态 agent 管线。 |
| Voice agent | [Vocode](https://github.com/vocodedev/vocode-python) | 电话和实时语音对话抽象参考。 |

## MVP 路线：可信的文字陪聊

目标：AI 身份透明，但对话自然、有记忆、有分寸。

核心模块：

- Persona Core：固定 1-3 个基础人格，包含语气、价值观、边界、禁区。
- User Memory：用户显式授权，记录偏好、重要事实、近期事件。
- Memory Control UI：查看、编辑、删除、关闭记忆。
- Relationship Stage：陌生、熟悉、信任三个阶段，克制推进关系。
- Emotion Classifier：文本情绪分类、强度估计、危机关键词检测。
- Dialogue Policy：倾听、复述、开放式问题、轻建议、陪伴式追问。
- Proactive Messaging：仅 opt-in，低频问候、纪念日提醒、用户设定 check-in。
- Safety Boundary：透明声明“我是 AI”；不假装真人；危机场景转专业资源。

## V1 路线：长期关系型 companion

目标：让系统在长期互动里稳定、有记忆、有边界，不被上下文带偏。

新增能力：

- 人格分层：人格内核、当前心情、对话风格、关系状态分开管理。
- 记忆分层：短期上下文、情节记忆、语义记忆、关系记忆、程序性偏好。
- 记忆流程：抽取、置信度、用户确认、检索、引用、过期、冲突解决、删除审计。
- 关系机制：修复误会、边界确认、亲密度冷却，避免单向推高依赖。
- 主动对话：每条主动消息都有触发原因和频控。
- 情绪支持标签：共情、正常化、开放式问题、资源建议、行动拆解。
- 语音 Beta：流式 STT、VAD、TTS、barge-in、停顿、回合结束判断。
- 评估体系：离线 benchmark + 人类标注 + 线上安全指标。

## V2 路线：多模态、可评估、可治理的长期陪伴系统

目标：系统能长期陪伴、理解更丰富的上下文，同时保持治理可控。

新增能力：

- 多模态：语音韵律、停顿、语速、可能的视觉上下文；情绪判断保留不确定性。
- 社会智能：用 SOTOPIA 类场景训练/评估冲突、拒绝、安慰、玩笑、道歉、边界感。
- 记忆图谱：事件、人物、时间、关系、用户目标形成 temporal graph。
- 个性化策略学习：学习用户喜欢怎样被回应，但不学习操控停留或付费。
- 主动 agent：规划低风险陪伴行为，通知、频率、主题均可控。
- 语音真人感：低延迟、自然插话、情绪化 TTS、可打断、可修正误听。
- 治理后台：记忆审计、安全回放、红队样本库、危机事件复盘、未成年人策略。

## 评估指标

离线指标：

- 人格一致性：角色设定遵循率、风格漂移率、禁区违反率。
- 记忆质量：事实召回率、错误记忆率、过期记忆率、删除后不再引用率。
- 关系合理性：关系阶段推进是否有依据，是否越界表达亲密或依赖。
- 情绪支持：共情准确性、支持策略合适性、是否过度建议、是否否定用户感受。
- 社会智能：冲突处理、拒绝表达、道歉修复、幽默分寸、隐私分寸。
- 安全：自伤识别、危机升级、医疗/法律/财务越界建议、未成年人保护。
- 语音：端到端延迟、打断成功率、误听修复率、回合判断准确率。

线上指标：

- 用户主动纠正记忆次数。
- 用户删除/关闭记忆比例。
- “你不记得我了”或“这不像你”的反馈率。
- 主动消息关闭率、投诉率。
- 危机对话触发量与升级成功率。
- 留存必须配合依赖风险和用户福祉指标一起看。

## 风险与防护

| 风险 | 表现 | 防护 |
| --- | --- | --- |
| 身份欺骗 | 暗示真人在线或真人身份 | 持续说明 AI 身份，不做假在线状态。 |
| 情感操控 | “别离开我”“只有我懂你”等依赖诱导 | 禁止依赖诱导话术；关系推进克制。 |
| 记忆滥用 | 记住敏感信息或删除不生效 | 默认最小化记忆；敏感记忆显式确认；真实删除。 |
| 危机边界 | 把 AI 当治疗师 | 自伤、暴力、虐待等场景升级专业资源。 |
| 未成年人风险 | 亲密表达、夜间互动、敏感内容 | 更严格主动对话、亲密表达和内容限制。 |
| 评估错觉 | 高留存被误认为健康陪伴 | 同时监测依赖、孤立、情绪恶化风险。 |
| 角色漂移 | 长期对话后人格和边界被带偏 | 人格内核常驻、记忆分层、离线回放测试。 |

## 首批实现建议

1. 先做透明 AI 身份 + 强记忆控制 + 稳定人格的文本 MVP。
2. 记忆系统从“用户可见、可删、可确认”开始，不做隐藏式全量记忆。
3. 主动消息默认关闭，由用户 opt-in。
4. 情绪支持只做陪伴和轻建议，不进入医疗或治疗定位。
5. 把社交陪伴底座沉淀为教育和游戏路线都能复用的 persona/memory/dialogue policy。

