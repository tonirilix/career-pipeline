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

  it("keeps mutable mock backend state out of MSW handlers", () => {
    const violations = sourceFilesIn("infrastructure/msw").flatMap((filePath) => {
      const source = readFileSync(filePath, "utf8");

      return [
        /\blet\s+applications\b/,
        /\blet\s+next[A-Z]\w*Id\b/,
        /new Date\(\)\.toISOString\(\)/
      ]
        .filter((pattern) => pattern.test(source))
        .map((pattern) => `${relativeToSource(filePath)} matches ${pattern}`);
    });

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

  it("does not introduce Effect or AtomRpc for frontend async operations", () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json"), "utf8")
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const installedPackages = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    expect(Object.keys(installedPackages)).not.toEqual(
      expect.arrayContaining(["effect", "@effect/atom", "@effect/atom-react"])
    );
  });

  it("keeps Application Details section rendering in focused workspace modules", () => {
    const detailsModules = sourceFilesIn("presentation/components/application-details").map(
      (filePath) => relativeToSource(filePath)
    );

    expect(detailsModules).toEqual(
      expect.arrayContaining([
        `presentation${sep}components${sep}application-details${sep}OverviewSection.tsx`,
        `presentation${sep}components${sep}application-details${sep}NotesSection.tsx`,
        `presentation${sep}components${sep}application-details${sep}FollowUpsSection.tsx`,
        `presentation${sep}components${sep}application-details${sep}InterviewsSection.tsx`,
        `presentation${sep}components${sep}application-details${sep}TimelineSection.tsx`
      ])
    );
  });

  it("keeps ApplicationDetails as the details workspace coordinator", () => {
    const source = readFileSync(
      resolve(sourceRoot, "presentation/components/ApplicationDetails.tsx"),
      "utf8"
    );

    expect(source.split("\n").length).toBeLessThanOrEqual(250);
    expect(source).toContain("./application-details/NotesSection");
    expect(source).toContain("./application-details/FollowUpsSection");
    expect(source).toContain("./application-details/InterviewsSection");
  });

  it("keeps details workspace modules independent from adapters and query libraries", () => {
    const violations = findForbiddenReferences(
      sourceFilesIn("presentation/components/application-details"),
      [
        "@tanstack/react-query",
        "infrastructure",
        "useMutation",
        "useQuery",
        "useQueryClient"
      ]
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
