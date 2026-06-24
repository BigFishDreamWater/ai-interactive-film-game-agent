export type AssetType = "background" | "character_sprite" | "expression" | "ui";

export type AssetStatus = "draft" | "suggested" | "accepted" | "cancelled" | "missing";

export type StoryNodeType = "start" | "scene" | "ending";

export interface ProjectBrief {
  title: string;
  genre: string;
  style: string;
  brief: string;
}

export interface Project {
  id: string;
  title: string;
  genre: string;
  style: string;
  brief: string;
  status: "draft" | "ready" | "exported";
  createdAt: string;
}

export interface StoryVariable {
  name: string;
  type: "number" | "boolean" | "string";
  default: number | boolean | string;
}

export interface ChoiceEffect {
  var: string;
  op: "+=" | "-=" | "set";
  value: number | boolean | string;
}

export interface StoryChoice {
  id: string;
  text: string;
  effects: ChoiceEffect[];
  nextNodeId: string;
}

export interface StoryBeat {
  speaker: string;
  text: string;
}

export interface StoryNode {
  id: string;
  type: StoryNodeType;
  title: string;
  backgroundAssetId?: string;
  characters: string[];
  objective: string;
  beats: StoryBeat[];
  choices: StoryChoice[];
}

export interface StoryGraph {
  projectId: string;
  startNodeId: string;
  variables: StoryVariable[];
  nodes: StoryNode[];
}

export interface CharacterCard {
  id: string;
  projectId: string;
  name: string;
  role: string;
  publicProfile: string;
  privateMotivation: string;
  speechStyle: string;
  requiredExpressions: string[];
  defaultAssetId?: string;
}

export interface AssetSource {
  kind: "library" | "upload";
  name: string;
  author: string;
  license: string;
  sourceUrl: string;
  commercialUse: boolean;
  attributionRequired: boolean;
}

export interface AssetItem {
  assetId: string;
  projectId?: string;
  type: AssetType;
  status: AssetStatus;
  title: string;
  filePath: string;
  previewUrl: string;
  source: AssetSource;
  tags: string[];
  characterId?: string;
  expression?: string;
}

export interface GameDesignSpec {
  projectId: string;
  genre: string;
  sceneCount: number;
  characterCount: number;
  endingCount: number;
  contentBoundary: string;
}
