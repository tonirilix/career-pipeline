import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { createServer } from "vite";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const server = await createServer({
  configFile: new URL("../vite.config.ts", import.meta.url).pathname,
  server: {
    host: "127.0.0.1",
    strictPort: false
  }
});

let browser;
let context;

try {
  await server.listen();
  const url = server.resolvedUrls?.local?.[0];

  if (!url) {
    throw new Error("Vite did not expose a local URL for accessibility checks.");
  }

  browser = await launchBrowser();
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: "networkidle" });
  await seedOpportunity(page);

  const axeResults = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  const axeViolations = axeResults.violations.filter((violation) =>
    ["minor", "moderate", "serious", "critical"].includes(violation.impact ?? "")
  );
  const contrastFailures = await collectContrastFailures(page);

  if (axeViolations.length > 0 || contrastFailures.length > 0) {
    reportFailures({ axeViolations, contrastFailures });
    process.exitCode = 1;
  } else {
    console.log("Accessibility guardrail passed.");
    console.log(`Axe checks: ${axeResults.passes.length} passing rules, 0 violations.`);
    console.log("Rendered contrast: all visible meaningful text meets WCAG AA.");
  }
} finally {
  await context?.close();
  await browser?.close();
  await server.close();
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    if (!String(error).includes("Executable doesn't exist")) {
      throw error;
    }

    return chromium.launch({ channel: "chrome", headless: true });
  }
}

async function seedOpportunity(page) {
  await page.getByRole("button", { name: "Add opportunity" }).click();
  await page.getByRole("textbox", { name: "Company", exact: true }).fill("Stripe");
  await page.getByRole("textbox", { name: "Role title", exact: true }).fill("Senior Engineer");
  await page.getByRole("textbox", { name: "Posting URL", exact: true }).fill("https://stripe.com/jobs/1");
  await page.getByRole("textbox", { name: "Location", exact: true }).fill("Remote");
  await page.getByRole("textbox", { name: "Compensation", exact: true }).fill("$180k-$220k");
  await page.getByRole("button", { name: "Save opportunity" }).click();
  await page.getByText("Senior Engineer").waitFor();
}

async function collectContrastFailures(page) {
  return page.evaluate(() => {
    function parseColor(value) {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const [r, g, b, alpha] = match[1].split(",").map((part) => part.trim());
      return {
        r: Number(r),
        g: Number(g),
        b: Number(b),
        a: alpha == null ? 1 : Number(alpha)
      };
    }

    function blend(foreground, background) {
      const a = foreground.a + background.a * (1 - foreground.a);

      if (a === 0) {
        return { r: 0, g: 0, b: 0, a: 0 };
      }

      return {
        r: Math.round((foreground.r * foreground.a + background.r * background.a * (1 - foreground.a)) / a),
        g: Math.round((foreground.g * foreground.a + background.g * background.a * (1 - foreground.a)) / a),
        b: Math.round((foreground.b * foreground.a + background.b * background.a * (1 - foreground.a)) / a),
        a
      };
    }

    function backgroundFor(element) {
      let background = { r: 12, g: 12, b: 12, a: 1 };
      const chain = [];

      for (let node = element; node && node.nodeType === Node.ELEMENT_NODE; node = node.parentElement) {
        chain.push(node);
      }

      for (const node of chain.reverse()) {
        const color = parseColor(getComputedStyle(node).backgroundColor);
        if (color && color.a > 0) {
          background = blend(color, background);
        }
      }

      return background;
    }

    function luminance(color) {
      function channel(value) {
        const normalized = value / 255;
        return normalized <= 0.03928
          ? normalized / 12.92
          : Math.pow((normalized + 0.055) / 1.055, 2.4);
      }

      return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
    }

    function contrastRatio(left, right) {
      const [lighter, darker] = [luminance(left), luminance(right)].sort((a, b) => b - a);
      return (lighter + 0.05) / (darker + 0.05);
    }

    function hex(color) {
      return `#${[color.r, color.g, color.b]
        .map((value) => Math.round(value).toString(16).padStart(2, "0"))
        .join("")}`;
    }

    function isHiddenFromUsers(element) {
      for (let node = element; node && node.nodeType === Node.ELEMENT_NODE; node = node.parentElement) {
        if (
          node.hidden ||
          node.hasAttribute("inert") ||
          node.getAttribute("aria-hidden") === "true"
        ) {
          return true;
        }
      }

      return false;
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const text = node.textContent?.trim().replace(/\s+/g, " ");
        if (!text) return NodeFilter.FILTER_REJECT;
        if (/^[^\w$]+$/.test(text)) return NodeFilter.FILTER_REJECT;

        const element = node.parentElement;
        if (!element || isHiddenFromUsers(element)) return NodeFilter.FILTER_REJECT;

        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          Number(style.opacity) === 0 ||
          rect.width === 0 ||
          rect.height === 0 ||
          rect.bottom <= 0 ||
          rect.right <= 0 ||
          rect.top >= window.innerHeight ||
          rect.left >= window.innerWidth
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const failures = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const element = node.parentElement;
      const style = getComputedStyle(element);
      const background = backgroundFor(element);
      const foreground = blend(parseColor(style.color), background);
      const fontSize = Number.parseFloat(style.fontSize);
      const fontWeight = Number.parseFloat(style.fontWeight) || 400;
      const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
      const requiredRatio = isLargeText ? 3 : 4.5;
      const measuredRatio = contrastRatio(foreground, background);

      if (measuredRatio < requiredRatio) {
        failures.push({
          text: node.textContent.trim().replace(/\s+/g, " ").slice(0, 80),
          selector: element.tagName.toLowerCase(),
          foreground: hex(foreground),
          background: hex(background),
          ratio: Math.round(measuredRatio * 100) / 100,
          requiredRatio,
          fontSize,
          fontWeight
        });
      }
    }

    return failures;
  });
}

function reportFailures({ axeViolations, contrastFailures }) {
  console.error("Accessibility guardrail failed.");

  if (axeViolations.length > 0) {
    console.error(`\nAxe violations (${axeViolations.length}):`);
    for (const violation of axeViolations) {
      console.error(`- ${violation.id} [${violation.impact}]: ${violation.help}`);
      for (const node of violation.nodes) {
        console.error(`  target: ${node.target.join(", ")}`);
        if (node.failureSummary) {
          console.error(`  ${node.failureSummary.replace(/\n/g, "\n  ")}`);
        }
      }
    }
  }

  if (contrastFailures.length > 0) {
    console.error(`\nRendered contrast failures (${contrastFailures.length}):`);
    for (const failure of contrastFailures) {
      console.error(
        `- "${failure.text}" ${failure.ratio}:1 ` +
          `(fg ${failure.foreground}, bg ${failure.background}, required ${failure.requiredRatio}:1)`
      );
    }
  }
}
