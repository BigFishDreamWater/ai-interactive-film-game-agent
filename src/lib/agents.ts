import type { CharacterCard, GameDesignSpec, Project, StoryGraph, StoryNode } from "@/domain/types";

/**
 * Generates a deterministic MVP design spec from the saved project brief.
 */
export function generateDesignSpec(project: Project): GameDesignSpec {
  const isMystery = project.genre.toLowerCase().includes("mystery") || project.brief.includes("侦探");

  return {
    projectId: project.id,
    genre: project.genre,
    sceneCount: isMystery ? 6 : 6,
    characterCount: 3,
    endingCount: 2,
    contentBoundary: "全年龄，可包含轻度悬疑和紧张氛围，不包含血腥描写。"
  };
}

/**
 * Generates the fixed MVP character set used by the first playable demo.
 */
export function generateCharacterCards(project: Project, design: GameDesignSpec): CharacterCard[] {
  const characters: CharacterCard[] = [
    {
      id: "char_lina",
      projectId: project.id,
      name: "Lina",
      role: "detective",
      publicProfile: "冷静、敏锐、习惯用问题试探别人。",
      privateMotivation: "她想查清导师留下的最后一条线索。",
      speechStyle: "短句、克制、带一点怀疑。",
      requiredExpressions: ["neutral", "suspicious", "soft"],
      defaultAssetId: "char_lina_neutral"
    },
    {
      id: "char_moss",
      projectId: project.id,
      name: "Moss",
      role: "barista",
      publicProfile: "咖啡馆店员，表面随和但记忆力很好。",
      privateMotivation: "他害怕卷入案件，却知道受害者最后坐过的位置。",
      speechStyle: "口语化、紧张时会重复关键词。",
      requiredExpressions: ["neutral", "nervous"],
      defaultAssetId: "char_moss_neutral"
    },
    {
      id: "char_iris",
      projectId: project.id,
      name: "Iris",
      role: "editor",
      publicProfile: "玩家的上司，催促玩家尽快拿到独家线索。",
      privateMotivation: "她希望报道抢先发布，但不想让玩家冒险。",
      speechStyle: "直接、节奏快、带职业压力。",
      requiredExpressions: ["neutral", "concerned"],
      defaultAssetId: "char_iris_neutral"
    }
  ];

  return characters.slice(0, design.characterCount);
}

/**
 * Generates a connected story graph with six scenes and two reachable endings.
 */
export function generateStoryGraph(project: Project, _design: GameDesignSpec, characters: CharacterCard[]): StoryGraph {
  const lina = characters.find((character) => character.id === "char_lina") ?? characters[0];
  const nodes: StoryNode[] = [
    {
      id: "scene_01_cafe",
      type: "scene",
      title: "雨夜咖啡馆",
      backgroundAssetId: "bg_cafe_rain",
      characters: [lina.id],
      objective: "让玩家见到 Lina，并得到第一条票根线索。",
      beats: [
        { speaker: lina.id, text: "你一个人来？这不是勇敢，就是太急了。" },
        { speaker: "player", text: "我只想知道受害者昨晚为什么来这里。" }
      ],
      choices: [
        {
          id: "show_ticket",
          text: "拿出票根给她看。",
          effects: [
            { var: "trust_lina", op: "+=", value: 2 },
            { var: "found_ticket_stub", op: "set", value: true }
          ],
          nextNodeId: "scene_02_counter"
        },
        {
          id: "press_directly",
          text: "直接追问她知道什么。",
          effects: [{ var: "trust_lina", op: "-=", value: 1 }],
          nextNodeId: "scene_03_library"
        }
      ]
    },
    {
      id: "scene_02_counter",
      type: "scene",
      title: "吧台后的杯痕",
      backgroundAssetId: "bg_cafe_rain",
      characters: [lina.id, "char_moss"],
      objective: "通过店员 Moss 得到座位和杯痕线索。",
      beats: [
        { speaker: "char_moss", text: "昨晚那个人坐在靠窗的位置，杯子没喝完。" },
        { speaker: lina.id, text: "杯口的痕迹不像普通客人留下的。" }
      ],
      choices: [
        {
          id: "inspect_cup",
          text: "检查杯子和座位。",
          effects: [{ var: "clue_count", op: "+=", value: 1 }],
          nextNodeId: "scene_04_alley"
        }
      ]
    },
    {
      id: "scene_03_library",
      type: "scene",
      title: "旧报纸阅览室",
      backgroundAssetId: "bg_library_evening",
      characters: [lina.id],
      objective: "给低信任路线补一条调查线索。",
      beats: [
        { speaker: lina.id, text: "你问得太急了，但旧报纸会比我诚实。" },
        { speaker: "player", text: "受害者三年前也出现在同一家咖啡馆报道里。" }
      ],
      choices: [
        {
          id: "compare_article",
          text: "比对旧报道里的照片。",
          effects: [{ var: "clue_count", op: "+=", value: 1 }],
          nextNodeId: "scene_04_alley"
        }
      ]
    },
    {
      id: "scene_04_alley",
      type: "scene",
      title: "后巷的伞",
      backgroundAssetId: "bg_alley_night",
      characters: [lina.id],
      objective: "发现嫌疑人留下的伞，并决定是否相信 Lina。",
      beats: [
        { speaker: lina.id, text: "这把伞不是店里的。有人在雨停前就离开了。" },
        { speaker: "player", text: "如果他离开得这么早，为什么监控没有拍到？" }
      ],
      choices: [
        {
          id: "trust_lina",
          text: "相信 Lina 的判断。",
          effects: [{ var: "trust_lina", op: "+=", value: 1 }],
          nextNodeId: "scene_05_editor_call"
        },
        {
          id: "doubt_lina",
          text: "怀疑 Lina 隐瞒了什么。",
          effects: [{ var: "trust_lina", op: "-=", value: 1 }],
          nextNodeId: "scene_05_editor_call"
        }
      ]
    },
    {
      id: "scene_05_editor_call",
      type: "scene",
      title: "编辑来电",
      backgroundAssetId: "bg_library_evening",
      characters: ["char_iris"],
      objective: "用上司电话制造结局前压力。",
      beats: [
        { speaker: "char_iris", text: "你只有十分钟。要么拿到真相，要么把稿子撤回来。" },
        { speaker: "player", text: "我还差最后一个证据。" }
      ],
      choices: [
        {
          id: "return_to_cafe",
          text: "回到咖啡馆复盘所有线索。",
          effects: [],
          nextNodeId: "scene_06_reveal"
        }
      ]
    },
    {
      id: "scene_06_reveal",
      type: "scene",
      title: "最后的空座位",
      backgroundAssetId: "bg_cafe_rain",
      characters: [lina.id, "char_moss"],
      objective: "根据线索数量导向好结局或坏结局。",
      beats: [
        { speaker: lina.id, text: "真正的最后目击者，不是坐在桌前的人。" },
        { speaker: "player", text: "是倒映在窗上的那个人。" }
      ],
      choices: [
        {
          id: "name_suspect",
          text: "指出真凶。",
          effects: [],
          nextNodeId: "ending_truth"
        },
        {
          id: "publish_early",
          text: "先发布不完整报道。",
          effects: [],
          nextNodeId: "ending_missed"
        }
      ]
    },
    {
      id: "ending_truth",
      type: "ending",
      title: "找出真相",
      characters: [lina.id],
      objective: "玩家用完整线索找出真凶。",
      beats: [{ speaker: lina.id, text: "你没有抢新闻，你救了一个还没被看见的人。" }],
      choices: []
    },
    {
      id: "ending_missed",
      type: "ending",
      title: "错过关键线索",
      characters: ["char_iris"],
      objective: "玩家因证据不足错失真相。",
      beats: [{ speaker: "char_iris", text: "稿子发出去了，但真相没有。" }],
      choices: []
    }
  ];

  return {
    projectId: project.id,
    startNodeId: "scene_01_cafe",
    variables: [
      { name: "trust_lina", type: "number", default: 0 },
      { name: "clue_count", type: "number", default: 0 },
      { name: "found_ticket_stub", type: "boolean", default: false }
    ],
    nodes
  };
}
