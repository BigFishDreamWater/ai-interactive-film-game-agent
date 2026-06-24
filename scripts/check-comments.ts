import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const sourceRoots = ["src", "scripts"];
const ignoredFiles = new Set(["scripts/check-comments.ts"]);
const functionPattern = /^\s*(export\s+)?(async\s+)?function\s+\w+|^\s*(export\s+)?class\s+\w+/;

/**
 * Recursively lists TypeScript source files that should pass comment checks.
 */
function listSourceFiles(root: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(root)) {
    const fullPath = join(root, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...listSourceFiles(fullPath));
      continue;
    }

    if ((fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) && !fullPath.endsWith(".test.ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Returns whether a function or class declaration has a nearby leading comment.
 */
function hasLeadingComment(lines: string[], index: number): boolean {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const line = lines[cursor].trim();

    if (!line) {
      continue;
    }

    return line.startsWith("/**") || line.startsWith("*") || line.startsWith("//");
  }

  return false;
}

/**
 * Finds uncommented function and class declarations in a single source file.
 */
function findMissingComments(filePath: string): string[] {
  if (ignoredFiles.has(filePath.replaceAll("\\", "/"))) {
    return [];
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  const failures: string[] = [];

  lines.forEach((line, index) => {
    if (functionPattern.test(line) && !hasLeadingComment(lines, index)) {
      failures.push(`${filePath}:${index + 1} missing function/class comment`);
    }
  });

  return failures;
}

const failures = sourceRoots.flatMap((root) => listSourceFiles(root)).flatMap(findMissingComments);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("All exported functions and classes have comments.");
