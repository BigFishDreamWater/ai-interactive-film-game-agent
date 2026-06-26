import type { RenPyProjectFile } from "@/lib/renpy-exporter";

export interface RenPyLintReport {
  ok: boolean;
  mode: "static" | "external";
  errors: string[];
}

const requiredFiles = ["game/script.rpy", "game/characters.rpy", "game/images.rpy", "game/options.rpy"];

/**
 * Runs an internal static lint over generated Ren'Py text files.
 */
export function runRenPyStaticLint(files: RenPyProjectFile[]): RenPyLintReport {
  const fileMap = new Map(files.map((file) => [file.path, file.content]));
  const errors: string[] = [];

  requiredFiles.forEach((path) => {
    if (!fileMap.has(path)) {
      errors.push(`Missing Ren'Py file: ${path}`);
    }
  });

  const script = fileMap.get("game/script.rpy") ?? "";
  const labels = collectLabels(script);
  const jumps = collectJumps(script);

  if (!labels.has("start")) {
    errors.push("Missing Ren'Py start label.");
  }

  jumps.forEach((label) => {
    if (!labels.has(label)) {
      errors.push(`Missing Ren'Py jump target: ${label}`);
    }
  });

  return {
    ok: errors.length === 0,
    mode: "static",
    errors
  };
}

/**
 * Collects labels declared in a Ren'Py script file.
 */
function collectLabels(script: string): Set<string> {
  const labels = new Set<string>();
  const labelPattern = /^\s*label\s+([a-zA-Z0-9_]+)\s*:/gm;
  let match = labelPattern.exec(script);

  while (match) {
    labels.add(match[1]);
    match = labelPattern.exec(script);
  }

  return labels;
}

/**
 * Collects jump targets referenced in a Ren'Py script file.
 */
function collectJumps(script: string): string[] {
  const jumps: string[] = [];
  const jumpPattern = /^\s*jump\s+([a-zA-Z0-9_]+)/gm;
  let match = jumpPattern.exec(script);

  while (match) {
    jumps.push(match[1]);
    match = jumpPattern.exec(script);
  }

  return jumps;
}
