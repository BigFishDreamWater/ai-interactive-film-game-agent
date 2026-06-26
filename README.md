# AI Chat Reality

AI Chat Reality 是一个面向“AI 影视对话游戏制作”的 MVP。当前版本聚焦一条闭环：用户输入故事 brief，系统生成设计规格、角色卡、剧情图、授权素材计划、网页试玩版本，并可导出 Ren'Py 工程 zip。

第一屏现在就是可操作的 Noir Production Console：左侧填写 brief，中间是电影监视器式网页试玩，右侧是 Pi Agent 生成、Story Graph、素材队列和构建检查。

## 当前能力

- Project Brief：创建项目并保存 title、genre、style、brief。
- Demo A/B：一键填入两个示例 brief，便于快速跑通 MVP。
- Pi Agent Core Workflow：通过 `@earendil-works/pi-agent-core` 的 `AgentTool` 合约，一键生成设计、角色、剧情图和素材计划。
- DeepSeek Planner：未显式传入 steps 时，调用 DeepSeek OpenAI-compatible chat completions 规划生成顺序；无 key 或调用失败时自动 fallback 到 deterministic MVP 链路。
- Local Persistence：项目快照持久化到本地 JSON，默认路径为 `storage/projects.json`，可用 `PROJECT_STORE_PATH` 覆盖。
- Story Graph Panel：展示 scene、choice、ending 的节点和跳转关系。
- Asset Board：使用内置 CC0 示例素材，支持 Accept、Cancel、按同类型候选显式 Replace。
- Web Preview Player：在网页中分层显示背景、角色立绘、文本框、选项和变量状态。
- Browser Play Route：生成后可直接打开 `/play/{projectId}` 在网页里玩，不需要下载 Ren'Py 包。
- Build Check：检查剧情图、变量、必需素材、授权信息、public 素材文件和 Ren'Py 静态 lint。
- Ren'Py Export：导出 `game/*.rpy`、`game/images/*` 和 `game/LICENSES.md`。
- Noir UI：低光黑金控制台布局，桌面三栏，移动端单列。

## 快速开始

```bash
npm install
npm run dev
```

打开本地 Next.js 地址后，推荐按这个顺序体验：

1. 点击 `Demo A` 或 `Demo B`。
2. 点击 `Create Project`。
3. 点击 `Run Pi Agent` 一键生成完整试玩内容。
4. 点击 `Play in Browser` 进入网页可玩版本。
5. 回到工作台后，在右侧查看 Story Graph，或在 Asset Queue 里 Accept、Cancel、Replace 素材。
6. 点击 `Build Check`。
7. 如需 Ren'Py 工程，再点击 `Export Ren'Py` 下载 zip。

也可以用 `Generate Design`、`Generate Characters`、`Generate Story Graph`、`Generate Assets` 手动分步调试生成链路。

## DeepSeek 配置

在 `.env` 或 `.env.local` 中配置：

```bash
deepseek_api_key=your_deepseek_key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

说明：

- `deepseek_api_key` 是当前推荐的本地变量名。
- `DEEPSEEK_API_KEY` 也兼容，可作为备用变量名。
- `DEEPSEEK_MODEL` 默认是 `deepseek-v4-flash`。
- `DEEPSEEK_BASE_URL` 默认是 `https://api.deepseek.com`。
- 如果没有配置 key，系统会使用固定顺序 `design -> characters -> story -> assets`，MVP 仍可运行。

## 常用脚本

```bash
npm run lint
npm run check:comments
npm run test
npm run acceptance:mvp
npm run build
npm run verify
```

`npm run verify` 会依次执行 lint、函数/类注释检查、Vitest、MVP 验收脚本和 Next build。

## 项目结构

```text
src/app/                         Next.js 页面、API routes、Web Preview
src/domain/types.ts              核心领域类型
src/lib/agents.ts                MVP 规则生成器
src/lib/asset-planner.ts         素材规划、替换建议
src/lib/build-check.ts           静态构建检查
src/lib/deepseek-planner.ts      DeepSeek 生成步骤规划
src/lib/pi-agent-orchestrator.ts Pi Agent Core 工具链编排
src/lib/preview-runtime.ts       Web 试玩运行时
src/lib/project-repository.ts    本地 JSON 持久化
src/lib/project-store.ts         项目状态 facade
src/lib/renpy-exporter.ts        Ren'Py 文件和素材导出
src/lib/renpy-lint.ts            Ren'Py 静态 lint
src/data/asset-library.json      内置素材库清单
public/library/                  内置 CC0 SVG 示例素材
scripts/check-comments.ts        函数/类注释检查
scripts/mvp-acceptance.ts        MVP 端到端验收脚本
docs/mvp/                        MVP 开发与测试文档
docs/roadmaps/                   技术路线研究文档
docs/interview/                  游戏反坏项目面试参考
```

## Ren'Py 导出内容

导出的 zip 包含：

```text
game/
  script.rpy
  characters.rpy
  images.rpy
  options.rpy
  LICENSES.md
  images/
    backgrounds/
    characters/
    ui/
```

当前导出是 MVP 级工程文件生成。`Build Check` 会先做静态 lint；如果未来配置真实 `RENPY_EXECUTABLE`，可以继续扩展到外部 Ren'Py 工具链验证。

## 文档索引

- [MVP 文档索引](docs/mvp/index.md)
- [MVP 开发文档](docs/mvp/ai-cinematic-dialogue-game-mvp-dev-spec.md)
- [MVP 测试文档](docs/mvp/ai-cinematic-dialogue-game-mvp-test-plan.md)
- [AI 影视对话游戏 Agent 路线](docs/roadmaps/ai-cinematic-dialogue-game-agent.md)
- [游戏反作弊路线](docs/roadmaps/game-ai-anticheat.md)
- [乐狗游戏反坏项目参考](docs/interview/legou-call-of-dragons-anti-abuse-project.md)

## 当前限制

- 角色和剧情生成仍是 deterministic MVP 规则，DeepSeek 目前只负责步骤规划。
- 图片来自内置 CC0 SVG 示例素材，还没有接入 GPT Image、ComfyUI、LoRA 或角色一致性生成流程。
- 本地 JSON 存储适合 MVP，本地多人协作和线上部署仍需要数据库。
- Ren'Py 导出尚未接入真实多平台打包流程。
- 内容安全、版权审核、多人协作和发布平台不在当前 MVP 范围内。
