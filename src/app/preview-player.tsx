"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { AssetItem, CharacterCard, StoryGraph } from "@/domain/types";
import { applyChoice, createPreviewState, getCurrentNode } from "@/lib/preview-runtime";

interface PreviewPlayerProps {
  assets: AssetItem[];
  characters: CharacterCard[];
  storyGraph?: StoryGraph;
}

/**
 * Renders a lightweight visual novel preview from the current story graph.
 */
export function PreviewPlayer({ assets, characters, storyGraph }: PreviewPlayerProps) {
  const initialState = useMemo(() => (storyGraph ? createPreviewState(storyGraph) : undefined), [storyGraph]);
  const [state, setState] = useState(initialState);

  if (!storyGraph || !state) {
    return <div className="preview-empty">生成剧情图后可以在这里试玩。</div>;
  }

  const node = getCurrentNode(storyGraph, state);
  const background = assets.find((asset) => asset.assetId === node.backgroundAssetId && asset.status === "accepted");
  const activeCharacters = characters.filter((character) => node.characters.includes(character.id));

  /**
   * Applies a selected preview choice and advances the local preview state.
   */
  function choose(choiceId: string) {
    if (!storyGraph || !state) {
      return;
    }

    setState(applyChoice(storyGraph, state, choiceId));
  }

  return (
    <div className="preview-player">
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
      <div className="choice-list">
        {node.choices.length === 0 ? (
          <button type="button" onClick={() => setState(createPreviewState(storyGraph))}>
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
      <pre className="variables-preview">{JSON.stringify(state.variables, null, 2)}</pre>
    </div>
  );
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
