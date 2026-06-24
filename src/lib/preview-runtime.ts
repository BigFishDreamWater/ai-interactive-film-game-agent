import type { StoryChoice, StoryGraph, StoryNode } from "@/domain/types";

export interface PreviewState {
  currentNodeId: string;
  variables: Record<string, number | boolean | string>;
}

/**
 * Creates the initial web preview state from a story graph.
 */
export function createPreviewState(graph: StoryGraph): PreviewState {
  return {
    currentNodeId: graph.startNodeId,
    variables: Object.fromEntries(graph.variables.map((variable) => [variable.name, variable.default]))
  };
}

/**
 * Returns the story node currently selected by the preview state.
 */
export function getCurrentNode(graph: StoryGraph, state: PreviewState): StoryNode {
  const node = graph.nodes.find((candidate) => candidate.id === state.currentNodeId);

  if (!node) {
    throw new Error(`Story node not found: ${state.currentNodeId}`);
  }

  return node;
}

/**
 * Applies a selected choice to preview variables and advances to the next node.
 */
export function applyChoice(graph: StoryGraph, state: PreviewState, choiceId: string): PreviewState {
  const node = getCurrentNode(graph, state);
  const choice = findChoice(node.choices, choiceId);
  const variables = { ...state.variables };

  choice.effects.forEach((effect) => {
    const current = variables[effect.var];

    if (effect.op === "+=" && typeof current === "number" && typeof effect.value === "number") {
      variables[effect.var] = current + effect.value;
      return;
    }

    if (effect.op === "-=" && typeof current === "number" && typeof effect.value === "number") {
      variables[effect.var] = current - effect.value;
      return;
    }

    variables[effect.var] = effect.value;
  });

  return {
    currentNodeId: choice.nextNodeId,
    variables
  };
}

/**
 * Finds a choice by id or raises a clear preview runtime error.
 */
function findChoice(choices: StoryChoice[], choiceId: string): StoryChoice {
  const choice = choices.find((candidate) => candidate.id === choiceId);

  if (!choice) {
    throw new Error(`Choice not found: ${choiceId}`);
  }

  return choice;
}
