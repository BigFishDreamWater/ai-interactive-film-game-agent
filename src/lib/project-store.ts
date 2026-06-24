import type { AssetItem, CharacterCard, GameDesignSpec, Project, ProjectBrief, StoryGraph } from "@/domain/types";
import { generateCharacterCards, generateDesignSpec, generateStoryGraph } from "@/lib/agents";
import { createProjectFromBrief } from "@/lib/project-factory";

export interface ProjectSnapshot {
  project: Project;
  design?: GameDesignSpec;
  characters: CharacterCard[];
  storyGraph?: StoryGraph;
  assets: AssetItem[];
}

const projects = new Map<string, ProjectSnapshot>();

/**
 * Clears all in-memory project state for test isolation and demo resets.
 */
export function clearProjectStore(): void {
  projects.clear();
}

/**
 * Creates and stores a new draft project from a user brief.
 */
export function createProject(brief: ProjectBrief): Project {
  const project = createProjectFromBrief(brief);

  projects.set(project.id, {
    project,
    characters: [],
    assets: []
  });

  return project;
}

/**
 * Returns a stored project snapshot by project id.
 */
export function getProjectSnapshot(projectId: string): ProjectSnapshot | undefined {
  return projects.get(projectId);
}

/**
 * Generates and stores the deterministic MVP design spec for a project.
 */
export function generateProjectDesign(projectId: string): GameDesignSpec {
  const snapshot = requireProject(projectId);
  const design = generateDesignSpec(snapshot.project);

  snapshot.design = design;
  return design;
}

/**
 * Generates and stores the deterministic MVP character cards for a project.
 */
export function generateProjectCharacters(projectId: string): CharacterCard[] {
  const snapshot = requireProject(projectId);
  const design = snapshot.design ?? generateProjectDesign(projectId);
  const characters = generateCharacterCards(snapshot.project, design);

  snapshot.characters = characters;
  return characters;
}

/**
 * Generates and stores the deterministic MVP story graph for a project.
 */
export function generateProjectStory(projectId: string): StoryGraph {
  const snapshot = requireProject(projectId);
  const design = snapshot.design ?? generateProjectDesign(projectId);
  const characters = snapshot.characters.length > 0 ? snapshot.characters : generateProjectCharacters(projectId);
  const storyGraph = generateStoryGraph(snapshot.project, design, characters);

  snapshot.storyGraph = storyGraph;
  return storyGraph;
}

/**
 * Replaces the current project asset manifest in the in-memory store.
 */
export function setProjectAssets(projectId: string, assets: AssetItem[]): AssetItem[] {
  const snapshot = requireProject(projectId);

  snapshot.assets = assets;
  return snapshot.assets;
}

/**
 * Resolves a project snapshot or throws a clear error for missing projects.
 */
function requireProject(projectId: string): ProjectSnapshot {
  const snapshot = projects.get(projectId);

  if (!snapshot) {
    throw new Error(`Project not found: ${projectId}`);
  }

  return snapshot;
}
