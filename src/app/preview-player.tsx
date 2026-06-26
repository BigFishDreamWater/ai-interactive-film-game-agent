"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { AssetItem, CharacterCard, StoryGraph } from "@/domain/types";
import { applyChoice, createPreviewState, getCurrentNode, type PreviewState } from "@/lib/preview-runtime";

interface PreviewPlayerProps {
  assets: AssetItem[];
  characters: CharacterCard[];
  storyGraph?: StoryGraph;
}

interface PreviewSession {
  graphKey: string;
  state: PreviewState;
}

/**
 * Renders a Cineverse-styled visual novel preview with dark atmospheric staging.
 */
export function PreviewPlayer({ assets, characters, storyGraph }: PreviewPlayerProps) {
  const graphKey = useMemo(() => (storyGraph ? createGraphKey(storyGraph) : undefined), [storyGraph]);
  const [session, setSession] = useState<PreviewSession>();
  const state = useMemo(() => {
    if (!storyGraph || !graphKey) {
      return undefined;
    }

    return session?.graphKey === graphKey ? session.state : createPreviewState(storyGraph);
  }, [graphKey, session, storyGraph]);

  if (!storyGraph || !state || !graphKey) {
    return (
      <section className="preview-player film-monitor" aria-label="Scene Monitor">
        <div className="monitor-chrome">
          <div>
            <p className="monitor-kicker">Scene Monitor</p>
            <strong>Waiting for scene graph</strong>
          </div>
          <span className="monitor-light">IDLE</span>
        </div>
        <div className="preview-empty">
          <button type="button" className="play-button-circle" aria-label="Generate scene preview">
            ▶
          </button>
          <p className="preview-hint-text">生成场景中的对话流程图…</p>
        </div>
      </section>
    );
  }

  const node = getCurrentNode(storyGraph, state);
  const background = assets.find((asset) => asset.assetId === node.backgroundAssetId && asset.status === "accepted");
  const activeCharacters = characters.filter((character) => node.characters.includes(character.id));

  /**
   * Applies a selected preview choice and advances the local preview state.
   */
  function choose(choiceId: string) {
    if (!storyGraph || !state || !graphKey) {
      return;
    }

    setSession({ graphKey, state: applyChoice(storyGraph, state, choiceId) });
  }

  return (
    <section className="preview-player film-monitor" aria-label="Scene Monitor">
      <div className="monitor-chrome">
        <div>
          <p className="monitor-kicker">Scene Monitor</p>
          <strong>{node.title}</strong>
        </div>
        <span className="monitor-light monitor-live">LIVE</span>
      </div>
      <div className="preview-stage">
        {background ? (
          <Image
            fill
            unoptimized
            className="preview-background-image"
            src={background.previewUrl}
            alt={background.title}
            sizes="(max-width: 720px) 100vw, 760px"
          />
        ) : (
          <div className="preview-background">缺少背景</div>
        )}
        <div className="preview-characters">
          {activeCharacters.map((character) => {
            const sprite = resolveCharacterSprite(character, assets);

            return sprite ? (
              <Image
                unoptimized
                className="preview-sprite-image"
                src={sprite.previewUrl}
                alt={character.name}
                width={180}
                height={320}
                key={character.id}
              />
            ) : (
              <div className="preview-sprite" key={character.id}>
                {character.name}
              </div>
            );
          })}
        </div>
        <div className="preview-textbox">
          <strong>{node.title}</strong>
          {node.beats.map((beat) => (
            <p key={`${node.id}-${beat.speaker}-${beat.text}`}>
              <span>{resolveSpeakerName(beat.speaker, characters)}：</span>
              {beat.text}
            </p>
          ))}
        </div>
      </div>
      <div className="choice-list" aria-label="Scene choices">
        {node.choices.length === 0 ? (
          <button type="button" onClick={() => setSession({ graphKey, state: createPreviewState(storyGraph) })}>
            重新开始
          </button>
        ) : (
          node.choices.map((choice) => (
            <button type="button" key={choice.id} onClick={() => choose(choice.id)}>
              {choice.text}
            </button>
          ))
        )}
      </div>
      <pre className="variables-preview" aria-label="Preview variables">
        {JSON.stringify(state.variables, null, 2)}
      </pre>
    </section>
  );
}

/**
 * Builds a stable preview session key for resetting local progress when the generated graph changes.
 */
function createGraphKey(storyGraph: StoryGraph): string {
  return [storyGraph.projectId, storyGraph.startNodeId, storyGraph.nodes.map((node) => node.id).join("|")].join(":");
}

/**
 * Resolves the accepted default sprite for a character in the preview asset manifest.
 */
function resolveCharacterSprite(character: CharacterCard, assets: AssetItem[]): AssetItem | undefined {
  return assets.find((asset) => asset.assetId === character.defaultAssetId && asset.status === "accepted");
}

/**
 * Resolves a story beat speaker id into a readable display name.
 */
function resolveSpeakerName(speakerId: string, characters: CharacterCard[]): string {
  if (speakerId === "player") {
    return "玩家";
  }

  return characters.find((character) => character.id === speakerId)?.name ?? speakerId;
}
