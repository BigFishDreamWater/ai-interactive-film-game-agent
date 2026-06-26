import type { StoryGraph } from "@/domain/types";

interface StoryGraphPanelProps {
  storyGraph?: StoryGraph;
}

/**
 * Renders a compact DOM-based story graph for scene, choice, and ending inspection.
 */
export function StoryGraphPanel({ storyGraph }: StoryGraphPanelProps) {
  if (!storyGraph) {
    return (
      <section className="story-graph-panel" aria-label="Story Graph">
        <h2>Story Graph</h2>
        <p className="muted">Run the agent to inspect scenes, choices, and endings.</p>
      </section>
    );
  }

  const titlesById = new Map(storyGraph.nodes.map((node) => [node.id, node.title]));

  return (
    <section className="story-graph-panel" aria-label="Story Graph">
      <h2>Story Graph</h2>
      <div className="story-node-list">
        {storyGraph.nodes.map((node, index) => (
          <article className={`story-node story-node-${node.type}`} key={node.id}>
            <span className="story-node-index">{index + 1}</span>
            <div>
              <strong>{node.title}</strong>
              <small>{node.type}</small>
              {node.choices.length > 0 ? (
                <ul>
                  {node.choices.map((choice) => (
                    <li key={choice.id}>
                      {choice.text} -&gt; {titlesById.get(choice.nextNodeId) ?? choice.nextNodeId}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Terminal node</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
