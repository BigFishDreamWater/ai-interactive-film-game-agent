# P0 Noir Production Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete P0 product features and redesign the app as a noir film-production console.

**Architecture:** Keep existing Next.js route handlers and project-store facade. Add focused library modules for JSON persistence, DeepSeek planning, Ren'Py linting, story graph rendering, and asset candidates. Update the workspace UI to call those APIs and present them in the noir console layout.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library, `@earendil-works/pi-agent-core`, DeepSeek OpenAI-compatible chat completions via `fetch`, local JSON storage.

---

### Task 1: JSON Project Persistence

**Files:**
- Create: `src/lib/project-repository.ts`
- Modify: `src/lib/project-store.ts`
- Modify: `src/lib/__tests__/project-store.test.ts`
- Create: `src/lib/__tests__/project-repository.test.ts`

- [ ] **Step 1: Write failing repository tests**

Test that `saveProjectSnapshots()` writes snapshots and `loadProjectSnapshots()` reads them from `PROJECT_STORE_PATH`.

- [ ] **Step 2: Run red test**

Run: `npm test -- src/lib/__tests__/project-repository.test.ts`

Expected: FAIL because `project-repository` does not exist.

- [ ] **Step 3: Implement repository**

Create `loadProjectSnapshots`, `saveProjectSnapshots`, and `resolveProjectStorePath`. Store JSON in `storage/projects.json` by default.

- [ ] **Step 4: Wire project-store persistence**

Load repository snapshots when the store is first used. Persist after create, generation, agent workflow, asset accept/cancel/replace, and set assets.

- [ ] **Step 5: Run green tests**

Run: `npm test -- src/lib/__tests__/project-repository.test.ts src/lib/__tests__/project-store.test.ts`

Expected: PASS.

### Task 2: DeepSeek Planner

**Files:**
- Create: `src/lib/deepseek-planner.ts`
- Modify: `src/lib/pi-agent-orchestrator.ts`
- Modify: `src/lib/project-store.ts`
- Create: `src/lib/__tests__/deepseek-planner.test.ts`
- Modify: `src/lib/__tests__/pi-agent-orchestrator.test.ts`

- [ ] **Step 1: Write failing planner tests**

Cover JSON parsing, invalid step filtering, no-key fallback, and successful `fetch` call using `process.env.deepseek_api_key`.

- [ ] **Step 2: Run red test**

Run: `npm test -- src/lib/__tests__/deepseek-planner.test.ts`

Expected: FAIL because planner module does not exist.

- [ ] **Step 3: Implement planner module**

Default model: `deepseek-v4-flash`. Default base URL: `https://api.deepseek.com`. Accept `deepseek_api_key` and `DEEPSEEK_API_KEY`.

- [ ] **Step 4: Wire planner into orchestrator**

`runProjectGenerationAgent()` asks planner for steps when caller does not pass explicit steps. Result includes `plan`.

- [ ] **Step 5: Run green tests**

Run: `npm test -- src/lib/__tests__/deepseek-planner.test.ts src/lib/__tests__/pi-agent-orchestrator.test.ts src/lib/__tests__/project-store.test.ts`

Expected: PASS.

### Task 3: Ren'Py Lint

**Files:**
- Create: `src/lib/renpy-lint.ts`
- Create: `src/lib/__tests__/renpy-lint.test.ts`
- Modify: `src/lib/build-check.ts`
- Modify: `src/lib/__tests__/build-check.test.ts`
- Modify: `src/app/api/projects/[projectId]/build/check/route.ts`

- [ ] **Step 1: Write failing lint tests**

Generated Ren'Py files pass. A script with `jump missing_label` fails.

- [ ] **Step 2: Run red test**

Run: `npm test -- src/lib/__tests__/renpy-lint.test.ts`

Expected: FAIL because lint module does not exist.

- [ ] **Step 3: Implement static lint**

Check required generated files, `label start:`, generated labels, and jump targets.

- [ ] **Step 4: Wire into build check**

Build report includes `renpyLint` with `mode: "static"` or `mode: "external"` when `RENPY_EXECUTABLE` is configured.

- [ ] **Step 5: Run green tests**

Run: `npm test -- src/lib/__tests__/renpy-lint.test.ts src/lib/__tests__/build-check.test.ts`

Expected: PASS.

### Task 4: Workspace Product P0

**Files:**
- Create: `src/app/story-graph-panel.tsx`
- Create: `src/app/asset-replacement-select.tsx`
- Modify: `src/app/workspace-client.tsx`
- Modify: `src/app/__tests__/page.test.tsx`
- Modify: `src/lib/asset-library.ts`

- [ ] **Step 1: Write failing UI tests**

Cover Demo A/B filling, story graph panel rendering, selected replacement asset sent in replace request, planner trace shown after Run Pi Agent, and Play in Browser link.

- [ ] **Step 2: Run red test**

Run: `npm test -- src/app/__tests__/page.test.tsx`

Expected: FAIL because controls and panels do not exist.

- [ ] **Step 3: Implement graph and replacement components**

Graph panel renders story nodes and choices. Replacement select lists same-type built-in assets and passes `libraryAssetId`.

- [ ] **Step 4: Wire workspace client**

Add demo brief buttons, planner trace panel, Ren'Py lint status, story graph panel, and explicit asset replacement select.

- [ ] **Step 5: Run green tests**

Run: `npm test -- src/app/__tests__/page.test.tsx src/app/__tests__/play-page.test.tsx`

Expected: PASS.

### Task 5: Noir Production Console UI

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`
- Modify: `src/app/preview-player.tsx`
- Modify: `src/app/play/[projectId]/play-project-client.tsx`

- [ ] **Step 1: Write failing visual structure tests**

Check for production-console shell landmarks, monitor label, and play route cinematic shell.

- [ ] **Step 2: Run red test**

Run: `npm test -- src/app/__tests__/page.test.tsx src/app/__tests__/play-page.test.tsx src/app/__tests__/preview-player.test.tsx`

Expected: FAIL for missing layout labels/classes.

- [ ] **Step 3: Implement CSS and markup**

Use the A direction: low-light black/gold, central monitor preview, left brief console, right production stack. Keep mobile layout single-column and avoid overlapping text.

- [ ] **Step 4: Run green tests**

Run: `npm test -- src/app/__tests__/page.test.tsx src/app/__tests__/play-page.test.tsx src/app/__tests__/preview-player.test.tsx`

Expected: PASS.

### Task 6: Docs and Verification

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`

- [ ] **Step 1: Update docs**

Document DeepSeek env vars, local persistence, story graph visualization, Ren'Py lint, and demo brief buttons.

- [ ] **Step 2: Verify**

Run: `npm run verify`

Expected: lint, comment check, all tests, MVP acceptance, and Next build pass.

- [ ] **Step 3: Browser smoke check**

Open `http://localhost:3000`, run Demo A -> Create Project -> Run Pi Agent -> Play in Browser. Confirm no visible overlap at desktop width.
