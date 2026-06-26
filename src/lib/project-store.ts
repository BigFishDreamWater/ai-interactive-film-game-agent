import type { AssetItem, CharacterCard, GameDesignSpec, Project, ProjectBrief, StoryGraph } from "@/domain/types";
import { generateCharacterCards, generateDesignSpec, generateStoryGraph } from "@/lib/agents";
import { planProjectAssets, replaceAssetFromLibrary, suggestReplacementLibraryAssetId } from "@/lib/asset-planner";
import { runProjectGenerationAgent, type PiAgentTraceEvent } from "@/lib/pi-agent-orchestrator";
import { createProjectFromBrief } from "@/lib/project-factory";
import { loadProjectSnapshots, saveProjectSnapshots } from "@/lib/project-repository";
import type { AgentPlan } from "@/lib/deepseek-planner";
import type { StoryAgentResult } from "@/lib/story-agent";

export interface ProjectSnapshot {
  project: Project;
  design?: GameDesignSpec;
  characters: CharacterCard[];
  storyGraph?: StoryGraph;
  assets: AssetItem[];
  plannerTrace?: AgentPlan;
  agentTrace?: PiAgentTraceEvent[];
  storyAgent?: StoryAgentResult;
}

const projects = new Map<string, ProjectSnapshot>();
let storeHydrated = false;

/**
 * Clears all in-memory project state for test isolation and demo resets.
 */
export function clearProjectStore(): void {
  projects.clear();
  storeHydrated = false;
}

/**
 * Creates and stores a new draft project from a user brief.
 */
export function createProject(brief: ProjectBrief): Project {
  ensureProjectStoreHydrated();
  const project = createProjectFromBrief(brief);

  projects.set(project.id, {
    project,
    characters: [],
    assets: []
  });
  persistProjectStore();

  return project;
}

/**
 * Returns a stored project snapshot by project id.
 */
export function getProjectSnapshot(projectId: string): ProjectSnapshot | undefined {
  ensureProjectStoreHydrated();
  return projects.get(projectId);
}

/**
 * Generates and stores the deterministic MVP design spec for a project.
 */
export function generateProjectDesign(projectId: string): GameDesignSpec {
  ensureProjectStoreHydrated();
  const snapshot = requireProject(projectId);
  const design = generateDesignSpec(snapshot.project);

  snapshot.design = design;
  persistProjectStore();
  return design;
}

/**
 * Generates and stores the deterministic MVP character cards for a project.
 */
export function generateProjectCharacters(projectId: string): CharacterCard[] {
  ensureProjectStoreHydrated();
  const snapshot = requireProject(projectId);
  const design = snapshot.design ?? generateProjectDesign(projectId);
  const characters = generateCharacterCards(snapshot.project, design);

  snapshot.characters = characters;
  persistProjectStore();
  return characters;
}

/**
 * Generates and stores the deterministic MVP story graph for a project.
 */
export function generateProjectStory(projectId: string): StoryGraph {
  ensureProjectStoreHydrated();
  const snapshot = requireProject(projectId);
  const design = snapshot.design ?? generateProjectDesign(projectId);
  const characters = snapshot.characters.length > 0 ? snapshot.characters : generateProjectCharacters(projectId);
  const storyGraph = generateStoryGraph(snapshot.project, design, characters);

  snapshot.storyGraph = storyGraph;
  persistProjectStore();
  return storyGraph;
}

/**
 * Replaces the current project asset manifest in the in-memory store.
 */
export function setProjectAssets(projectId: string, assets: AssetItem[]): AssetItem[] {
  ensureProjectStoreHydrated();
  const snapshot = requireProject(projectId);

  snapshot.assets = assets;
  persistProjectStore();
  return snapshot.assets;
}

/**
 * Generates and stores the accepted MVP asset manifest for a project.
 */
export function generateProjectAssets(projectId: string): AssetItem[] {
  ensureProjectStoreHydrated();
  const snapshot = requireProject(projectId);
  const storyGraph = snapshot.storyGraph ?? generateProjectStory(projectId);
  const characters = snapshot.characters.length > 0 ? snapshot.characters : generateProjectCharacters(projectId);
  const assets = planProjectAssets(storyGraph, characters);

  snapshot.assets = assets;
  persistProjectStore();
  return snapshot.assets;
}

/**
 * Runs the Pi-compatible agent workflow and stores every generated artifact plus trace events.
 */
export async function runProjectAgentWorkflow(projectId: string): Promise<ProjectSnapshot> {
  ensureProjectStoreHydrated();
  const snapshot = requireProject(projectId);
  const result = await runProjectGenerationAgent({ project: snapshot.project });

  snapshot.design = result.design;
  snapshot.characters = result.characters;
  snapshot.storyGraph = result.storyGraph;
  snapshot.assets = result.assets;
  snapshot.plannerTrace = result.plan;
  snapshot.agentTrace = result.trace;
  snapshot.storyAgent = result.storyAgent;
  persistProjectStore();
  return snapshot;
}

/**
 * Marks a project asset as accepted so it can be used by preview and export.
 */
export function acceptProjectAsset(projectId: string, assetId: string): AssetItem {
  ensureProjectStoreHydrated();
  const asset = requireProjectAsset(projectId, assetId);

  asset.status = "accepted";
  persistProjectStore();
  return asset;
}

/**
 * Marks a project asset as cancelled so export and checks can exclude it.
 */
export function cancelProjectAsset(projectId: string, assetId: string): AssetItem {
  ensureProjectStoreHydrated();
  const asset = requireProjectAsset(projectId, assetId);

  asset.status = "cancelled";
  persistProjectStore();
  return asset;
}

/**
 * Replaces one project asset with metadata and file paths from a library asset.
 */
export function replaceProjectAsset(projectId: string, assetId: string, libraryAssetId?: string): AssetItem {
  ensureProjectStoreHydrated();
  const snapshot = requireProject(projectId);
  const index = snapshot.assets.findIndex((asset) => asset.assetId === assetId);

  if (index < 0) {
    throw new Error(`Project asset not found: ${assetId}`);
  }

  const resolvedLibraryAssetId = libraryAssetId || suggestReplacementLibraryAssetId(snapshot.assets[index]);

  if (!resolvedLibraryAssetId) {
    throw new Error(`Replacement asset not found for: ${assetId}`);
  }

  const replacement = replaceAssetFromLibrary(snapshot.assets[index], resolvedLibraryAssetId);
  snapshot.assets[index] = replacement;
  persistProjectStore();
  return replacement;
}

/**
 * Loads project snapshots from disk once per process and hydrates the in-memory cache.
 */
function ensureProjectStoreHydrated(): void {
  if (storeHydrated) {
    return;
  }

  projects.clear();
  loadProjectSnapshots().forEach((snapshot) => {
    projects.set(snapshot.project.id, snapshot);
  });
  storeHydrated = true;
}

/**
 * Persists the full in-memory project cache to the local repository.
 */
function persistProjectStore(): void {
  saveProjectSnapshots(Array.from(projects.values()));
}

/**
 * Resolves a project snapshot or throws a clear error for missing projects.
 */
function requireProject(projectId: string): ProjectSnapshot {
  ensureProjectStoreHydrated();
  const snapshot = projects.get(projectId);

  if (!snapshot) {
    throw new Error(`Project not found: ${projectId}`);
  }

  return snapshot;
}

/**
 * Resolves one project asset or throws a clear error for missing assets.
 */
function requireProjectAsset(projectId: string, assetId: string): AssetItem {
  ensureProjectStoreHydrated();
  const snapshot = requireProject(projectId);
  const asset = snapshot.assets.find((candidate) => candidate.assetId === assetId);

  if (!asset) {
    throw new Error(`Project asset not found: ${assetId}`);
  }

  return asset;
}
