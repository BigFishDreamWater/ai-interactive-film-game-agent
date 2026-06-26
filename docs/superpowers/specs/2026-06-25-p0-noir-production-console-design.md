# P0 Noir Production Console Design

## Goal

Ship the remaining P0 items for the AI cinematic dialogue game creator and redesign the MVP into a noir, film-production console that feels immersive enough for a portfolio demo.

## Scope

This design covers:

- Local project persistence across server restarts.
- DeepSeek V4 Flash planner mode using `.env` key `deepseek_api_key`, with `DEEPSEEK_API_KEY` also accepted.
- Story graph visualization in the workspace.
- Explicit asset replacement choices in the asset board.
- Ren'Py lint validation before export.
- Demo Brief A/B one-click filling.
- A noir production-console UI redesign for the workspace and browser-play route.

Out of scope for this pass:

- Image generation APIs.
- Multi-user accounts or cloud storage.
- A general-purpose game creation agent.
- Full Ren'Py platform packaging.

## Architecture

The app remains a Next.js MVP with server-side route handlers and an in-memory project store facade. Persistence is added behind that facade through a JSON repository at `storage/projects.json`, so route handlers keep calling the same project-store API. This keeps the MVP small while making refresh and restart behavior realistic enough for demos.

The Pi Agent workflow gains a planner layer. The planner asks DeepSeek V4 Flash for a JSON plan of tool names and rationale, then executes the existing Pi Agent Core tools in that order. If DeepSeek is unavailable or returns invalid output, the workflow falls back to the deterministic P0 order and records the fallback reason in `plannerTrace`.

The frontend keeps one main workspace route but changes the presentation. It becomes a film-production console: left control column, central monitor preview, right production stack. The browser-play route gets the same low-light cinematic styling but removes editor-only controls.

## DeepSeek Planner

Environment variables:

- `deepseek_api_key`: primary key name requested by the user.
- `DEEPSEEK_API_KEY`: compatible uppercase fallback.
- `DEEPSEEK_MODEL`: optional override, default `deepseek-v4-flash`.
- `DEEPSEEK_BASE_URL`: optional override, default `https://api.deepseek.com`.

Planner contract:

```ts
interface AgentPlan {
  provider: "deepseek" | "fallback";
  model: string;
  steps: ProjectGenerationStep[];
  rationale: string;
  rawText?: string;
  error?: string;
}
```

The prompt asks for JSON only:

```json
{
  "steps": ["design", "characters", "story", "assets"],
  "rationale": "Short explanation."
}
```

Allowed step values are `design`, `characters`, `story`, and `assets`. The executor deduplicates invalid repeated steps and ensures dependencies are filled by existing generation safeguards.

## Persistence

`src/lib/project-repository.ts` owns disk IO. It exports:

- `loadProjectSnapshots(): ProjectSnapshot[]`
- `saveProjectSnapshots(snapshots: ProjectSnapshot[]): void`

The repository creates `storage/` when needed and writes a formatted JSON file. Project store calls `persistProjects()` after every mutating operation. Tests isolate storage by setting `PROJECT_STORE_PATH` to a temporary test file.

## Story Graph Visualization

The workspace shows a compact graph panel:

- Scene nodes as numbered timeline blocks.
- Ending nodes as distinct terminal blocks.
- Choice edges listed under each node as `choice text -> target title`.
- Missing targets visually marked if build check has found issues.

This is intentionally DOM/CSS based, not canvas. It is easier to test, accessible, and sufficient for the MVP.

## Asset Replacement Board

Each asset card includes a select menu of same-type built-in library assets. Choosing an option calls the existing replace endpoint with `libraryAssetId`. This keeps replacement explicit and easy to demo.

The card still supports Accept and Cancel. Replacement changes only the chosen asset metadata and file path, preserving the project asset id so story references remain stable.

## Ren'Py Lint

`src/lib/renpy-lint.ts` adds an internal static lint over generated Ren'Py files:

- Required files exist: `script.rpy`, `characters.rpy`, `images.rpy`, `options.rpy`.
- `label start:` exists.
- Every `jump <label>` points to a generated label.
- Image definitions referenced by generated scenes exist.

If `RENPY_EXECUTABLE` is configured, this P0 pass calls the actual Ren'Py toolchain against a temporary exported project. If it is not configured, the UI and build check report the internal lint result clearly as "static lint".

## Demo Briefs

Two brief buttons live near the brief form:

- Demo A: Rainy noir cafe mystery.
- Demo B: Academy memory-room fantasy mystery.

Clicking a demo fills title, genre, style, and brief without calling the server. The user can edit before creating the project.

## Noir UI Direction

The chosen direction is "Noir Production Console":

- Dark low-light stage background.
- Warm gold as primary action color.
- Muted red for risk/error states.
- Cool cyan only for technical trace accents.
- Central preview should read as a film monitor, not a dashboard card.
- Cards stay at 8px radius or less where repeated; large preview surfaces can use 10px only where existing composition needs it.
- No decorative gradient orbs. Lighting comes from panels, image surfaces, and subtle radial stage glows tied to the preview.

First viewport:

- The app identity is visible immediately.
- The main usable workspace is visible immediately.
- The next content band is hinted below the fold on both mobile and desktop.

## Testing

Required tests:

- Repository saves and reloads snapshots.
- Project store persists create, generation, asset replacement, and agent workflow outputs.
- DeepSeek planner parses valid JSON, filters invalid steps, and falls back when no API key or bad response.
- Generate-all route stores planner trace.
- Workspace test covers demo brief filling, Run Pi Agent, Play in Browser link, story graph panel, and explicit asset replacement.
- Ren'Py static lint passes generated projects and fails missing labels.
- Existing MVP acceptance continues to pass.

## Success Criteria

- `npm run verify` passes.
- Restarting the dev server does not lose projects stored in `storage/projects.json`.
- Clicking `Run Pi Agent` uses DeepSeek V4 Flash when `.env` provides `deepseek_api_key`, and records a readable fallback trace otherwise.
- The workspace visually feels like a cinematic production console rather than a plain admin form.
