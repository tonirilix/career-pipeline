import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = resolve(process.cwd(), "src");

describe("frontend architecture boundaries", () => {
  it("keeps domain rules independent from framework, adapter, and browser APIs", () => {
    const violations = findForbiddenReferences(sourceFilesIn("domain"), [
      "react",
      "zustand",
      "graphql",
      "msw",
      "fetch",
      "window",
      "document",
      "localStorage",
      "sessionStorage",
      "navigator",
      "generated"
    ]);

    expect(violations).toEqual([]);
  });

  it("keeps application use cases dependent on domain rules and ports", () => {
    const violations = sourceFilesIn("application").flatMap((filePath) => {
      const imports = importsFrom(filePath);

      return imports
        .filter(
          (specifier) =>
            isRelative(specifier) &&
            !specifier.startsWith("../domain/") &&
            !specifier.startsWith("./ports/") &&
            !specifier.startsWith("../../domain/")
        )
        .map((specifier) => `${relativeToSource(filePath)} imports ${specifier}`);
    });

    expect(violations).toEqual([]);
    expect(
      findForbiddenReferences(sourceFilesIn("application"), [
        "react",
        "zustand",
        "graphql",
        "msw",
        "fetch",
        "window",
        "document",
        "localStorage",
        "sessionStorage",
        "navigator",
        "generated"
      ])
    ).toEqual([]);
  });

  it("keeps MSW as a network-level mock backend adapter", () => {
    const violations = sourceFilesIn(".").flatMap((filePath) =>
      importsFrom(filePath)
        .filter((specifier) => specifier === "msw" || specifier.startsWith("msw/"))
        .filter(() => !relativeToSource(filePath).startsWith(`infrastructure${sep}msw${sep}`))
        .map((specifier) => `${relativeToSource(filePath)} imports ${specifier}`)
    );

    expect(violations).toEqual([]);
  });

  it("keeps Zustand focused on presentation control state", () => {
    const violations = sourceFilesIn("infrastructure/zustand").flatMap((filePath) =>
      importsFrom(filePath)
        .filter((specifier) => isRelative(specifier))
        .filter((specifier) => !specifier.startsWith("../../presentation/ports/"))
        .map((specifier) => `${relativeToSource(filePath)} imports ${specifier}`)
    );

    expect(violations).toEqual([]);
  });
});

function sourceFilesIn(directory: string) {
  return walk(resolve(sourceRoot, directory)).filter(
    (filePath) =>
      (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) &&
      !filePath.endsWith(".test.ts") &&
      !filePath.endsWith(".test.tsx") &&
      !filePath.endsWith("vite-env.d.ts")
  );
}

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const entryPath = resolve(directory, entry);

    if (statSync(entryPath).isDirectory()) {
      return walk(entryPath);
    }

    return [entryPath];
  });
}

function importsFrom(filePath: string) {
  return [...readFileSync(filePath, "utf8").matchAll(/from\s+["']([^"']+)["']/g)].map(
    ([, specifier]) => specifier
  );
}

function findForbiddenReferences(filePaths: string[], forbiddenTerms: string[]) {
  return filePaths.flatMap((filePath) => {
    const source = readFileSync(filePath, "utf8");

    return forbiddenTerms
      .filter((term) => source.includes(term))
      .map((term) => `${relativeToSource(filePath)} references ${term}`);
  });
}

function isRelative(specifier: string) {
  return specifier.startsWith(".");
}

function relativeToSource(filePath: string) {
  return relative(sourceRoot, filePath);
}
