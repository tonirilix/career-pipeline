import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import {
  collectContrastFailures,
  formatContrastFailures
} from "./support/contrast";
import { seedSavedOpportunity } from "./support/seed";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("accessibility guardrails", () => {
  test("rendered application has no WCAG A/AA axe violations", async ({
    page
  }) => {
    await page.goto("/");
    await seedSavedOpportunity(page);

    const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
    const violations = results.violations.filter((violation) =>
      violation.impact === "serious" || violation.impact === "critical"
    );

    expect(violations, formatAxeViolations(violations)).toEqual([]);
  });

  test("visible meaningful text meets WCAG AA contrast", async ({ page }) => {
    await page.goto("/");
    await seedSavedOpportunity(page);

    const failures = await collectContrastFailures(page);

    expect(failures, formatContrastFailures(failures)).toEqual([]);
  });

  test("sample muted role title passes WCAG AA contrast", async ({ page }) => {
    await page.goto("/");
    await seedSavedOpportunity(page);

    const roleTitle = await collectContrastFailures(page, {
      text: "Senior Engineer"
    });

    expect(roleTitle, formatContrastFailures(roleTitle)).toEqual([]);
  });
});

type AxeViolation = Awaited<
  ReturnType<InstanceType<typeof AxeBuilder>["analyze"]>
>["violations"][number];

function formatAxeViolations(violations: AxeViolation[]) {
  if (violations.length === 0) return "";

  return violations
    .map((violation) => {
      const targets = violation.nodes
        .map((node) => `  target: ${node.target.join(", ")}`)
        .join("\n");

      return [
        `${violation.id} [${violation.impact}]: ${violation.help}`,
        targets
      ].join("\n");
    })
    .join("\n\n");
}
