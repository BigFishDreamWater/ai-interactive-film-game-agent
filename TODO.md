# TODO

这个列表按“能不能让 MVP 更像真实产品、也更适合作为面试项目展示”排序。

## Done

- [x] 建立 Next.js + React + TypeScript MVP 工程。
- [x] 创建 Project Brief 页面和 `POST /api/projects`。
- [x] 实现设计、角色、剧情图、素材计划的 MVP 规则生成器。
- [x] 加入内置 CC0 SVG 素材包和 license metadata。
- [x] 实现 Asset Board 的 Accept、Cancel、Replace。
- [x] 增加同类型素材替换下拉框，用户可以明确选择替换素材。
- [x] 实现 Web Preview Player，支持背景、立绘、文本框、分支和变量状态。
- [x] 修复 Preview Player 在剧情图异步到达后不激活的问题。
- [x] 实现 Story Graph 可视化面板，展示 scene、choice、ending 连接关系。
- [x] 实现 Build Check，覆盖缺素材、断分支、重复 node id、未定义变量、缺文件和 Ren'Py 静态 lint。
- [x] 实现 Ren'Py zip 导出，包含 `.rpy`、`game/images/*` 和 `LICENSES.md`。
- [x] 加入 `scripts/mvp-acceptance.ts`，覆盖 MVP 端到端验收。
- [x] 加入函数/类注释检查脚本。
- [x] 接入 `@earendil-works/pi-agent-core`，把规则生成器包装成可观测的 Pi Agent Tool workflow。
- [x] 增加 `Run Pi Agent` 一键生成入口和 `/play/{projectId}` 网页可玩入口。
- [x] 增加 Demo Brief A/B 一键填充。
- [x] 增加本地 JSON 项目持久化，默认写入 `storage/projects.json`，支持 `PROJECT_STORE_PATH`。
- [x] 接入 DeepSeek planner，支持 `.env` 中的 `deepseek_api_key`，默认模型 `deepseek-v4-flash`。
- [x] 增加 Noir Production Console UI：左 brief、中 monitor、右 production stack。
- [x] 更新 README，说明 DeepSeek、持久化、Story Graph、Ren'Py lint、Demo A/B 和 Noir UI。
- [x] 优化故事设计多 agent 模式：Writer（DeepSeek 真生成）→ Critic（LLM + 规则双审）→ Reviser 迭代修订，确定性模板兜底，子 agent trace 透传到 UI。

## Next, P0

- [ ] 用浏览器完整烟测：Demo A -> Create Project -> Run Pi Agent -> Play in Browser -> Build Check。
- [ ] 给 `.env.example` 增加 DeepSeek 和 PROJECT_STORE_PATH 示例。
- [ ] 在构建检查 API 中透传完整 project 信息，减少 fallback 行为。

## Next, P1

- [ ] 接入图片生成 API，优先做“人物一致性”和“背景风格一致性”的最小闭环。
- [ ] 为 GPT Image / image-to-image 流程设计资源重试、取消、保留历史版本的 UI。
- [ ] 增加角色卡编辑，支持修改姓名、口癖、动机和禁区。
- [ ] 增加单节点剧情重新生成，避免用户每次都重跑整张 story graph。
- [ ] 增加 QA Agent 报告，把 Build Check 错误转成更具体的修复建议。
- [ ] 增加素材上传入口，并要求用户确认授权类型、作者和来源链接。

## Next, P2

- [ ] 支持更多题材模板，例如恋爱、校园、职场、奇幻、悬疑。
- [ ] 支持多结局条件表达式，而不只是通过 choice 直接 jump。
- [ ] 支持 Ren'Py UI 主题导出，包括 textbox、按钮、标题页和菜单。
- [ ] 增加 TTS/语音占位接口，为后续 AI 影视对话游戏做准备。
- [ ] 增加内容安全检查，覆盖低龄、暴力、版权和敏感内容。
- [ ] 增加创作者项目导入/导出 JSON，便于版本管理和分享。

## Interview / Portfolio Follow-up

- [ ] 把 MVP 录制成 3 分钟 demo：brief 到试玩，再到 Ren'Py zip。
- [ ] 写一页项目复盘，说明为什么先做规则 Agent，再替换成 LLM/图片生成 Agent。
- [ ] 把乐狗游戏《万龙觉醒》反坏项目文档整理成简历项目 STAR 版本。
- [ ] 准备“大模型算法工程师”面试讲稿：游戏反坏、LLM 风控、AI 游戏制作三条线各 3 分钟。
