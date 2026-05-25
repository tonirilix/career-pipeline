import type { Page } from "@playwright/test";

export type ContrastFailure = {
  text: string;
  selector: string;
  foreground: string;
  background: string;
  ratio: number;
  requiredRatio: number;
  fontSize: number;
  fontWeight: number;
};

export type ContrastOptions = {
  text?: string;
};

export async function collectContrastFailures(
  page: Page,
  options: ContrastOptions = {}
) {
  return page.evaluate(({ text }) => {
    type Rgba = { r: number; g: number; b: number; a: number };
    type Failure = {
      text: string;
      selector: string;
      foreground: string;
      background: string;
      ratio: number;
      requiredRatio: number;
      fontSize: number;
      fontWeight: number;
    };

    function parseColor(value: string): Rgba {
      const rgb = value.match(/rgba?\(([^)]+)\)/);

      if (rgb) {
        const [r, g, b, alpha] = rgb[1]
          .split(",")
          .map((part) => part.trim());

        return {
          r: Number(r),
          g: Number(g),
          b: Number(b),
          a: alpha == null ? 1 : Number(alpha)
        };
      }

      const oklab = value.match(
        /oklab\(\s*([+-]?\d*\.?\d+%?)\s+([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)(?:\s*\/\s*([+-]?\d*\.?\d+%?))?\s*\)/
      );

      if (oklab) {
        const l = parseCssNumber(oklab[1], 1);
        const a = Number(oklab[2]);
        const b = Number(oklab[3]);
        const alpha = oklab[4] == null ? 1 : parseCssNumber(oklab[4], 1);

        return { ...oklabToSrgb(l, a, b), a: alpha };
      }

      throw new Error(`Unsupported computed color: ${value}`);
    }

    function parseCssNumber(value: string, percentScale: number) {
      return value.endsWith("%")
        ? (Number(value.slice(0, -1)) / 100) * percentScale
        : Number(value);
    }

    function oklabToSrgb(l: number, a: number, b: number) {
      const lPrime = l + 0.3963377774 * a + 0.2158037573 * b;
      const mPrime = l - 0.1055613458 * a - 0.0638541728 * b;
      const sPrime = l - 0.0894841775 * a - 1.291485548 * b;

      const lCubed = lPrime ** 3;
      const mCubed = mPrime ** 3;
      const sCubed = sPrime ** 3;

      return {
        r: linearSrgbToByte(
          4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed
        ),
        g: linearSrgbToByte(
          -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed
        ),
        b: linearSrgbToByte(
          -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed
        )
      };
    }

    function linearSrgbToByte(value: number) {
      const clamped = Math.min(1, Math.max(0, value));
      const encoded =
        clamped <= 0.0031308
          ? 12.92 * clamped
          : 1.055 * clamped ** (1 / 2.4) - 0.055;

      return encoded * 255;
    }

    function blend(foreground: Rgba, background: Rgba): Rgba {
      const a = foreground.a + background.a * (1 - foreground.a);

      if (a === 0) {
        return { r: 0, g: 0, b: 0, a: 0 };
      }

      return {
        r:
          (foreground.r * foreground.a +
            background.r * background.a * (1 - foreground.a)) /
          a,
        g:
          (foreground.g * foreground.a +
            background.g * background.a * (1 - foreground.a)) /
          a,
        b:
          (foreground.b * foreground.a +
            background.b * background.a * (1 - foreground.a)) /
          a,
        a
      };
    }

    function effectiveBackgroundFor(element: Element): Rgba {
      let background = { r: 12, g: 12, b: 12, a: 1 };
      const ancestry: Element[] = [];

      for (
        let node: Element | null = element;
        node && node.nodeType === Node.ELEMENT_NODE;
        node = node.parentElement
      ) {
        ancestry.push(node);
      }

      for (const node of ancestry.reverse()) {
        const color = parseColor(getComputedStyle(node).backgroundColor);

        if (color.a > 0) {
          background = blend(color, background);
        }
      }

      return background;
    }

    function luminance(color: Rgba) {
      function channel(value: number) {
        const normalized = value / 255;

        return normalized <= 0.03928
          ? normalized / 12.92
          : Math.pow((normalized + 0.055) / 1.055, 2.4);
      }

      return (
        0.2126 * channel(color.r) +
        0.7152 * channel(color.g) +
        0.0722 * channel(color.b)
      );
    }

    function contrastRatio(left: Rgba, right: Rgba) {
      const [lighter, darker] = [luminance(left), luminance(right)].sort(
        (a, b) => b - a
      );

      return (lighter + 0.05) / (darker + 0.05);
    }

    function hex(color: Rgba) {
      return `#${[color.r, color.g, color.b]
        .map((value) => Math.round(value).toString(16).padStart(2, "0"))
        .join("")}`;
    }

    function isHiddenFromUsers(element: Element) {
      for (
        let node: Element | null = element;
        node && node.nodeType === Node.ELEMENT_NODE;
        node = node.parentElement
      ) {
        if (
          node.hasAttribute("hidden") ||
          node.hasAttribute("inert") ||
          node.getAttribute("aria-hidden") === "true"
        ) {
          return true;
        }
      }

      return false;
    }

    function acceptsTextNode(node: Node) {
      const value = node.textContent?.trim().replace(/\s+/g, " ");

      if (!value) return NodeFilter.FILTER_REJECT;
      if (text && value !== text) return NodeFilter.FILTER_REJECT;
      if (/^[^\w$]+$/.test(value)) return NodeFilter.FILTER_REJECT;

      const element = node.parentElement;

      if (!element || isHiddenFromUsers(element)) {
        return NodeFilter.FILTER_REJECT;
      }

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

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      { acceptNode: acceptsTextNode }
    );
    const failures: Failure[] = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const element = node.parentElement;

      if (!element) continue;

      const style = getComputedStyle(element);
      const background = effectiveBackgroundFor(element);
      const foreground = blend(parseColor(style.color), background);
      const fontSize = Number.parseFloat(style.fontSize);
      const fontWeight = Number.parseFloat(style.fontWeight) || 400;
      const isLargeText =
        fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
      const requiredRatio = isLargeText ? 3 : 4.5;
      const measuredRatio = contrastRatio(foreground, background);

      if (measuredRatio < requiredRatio) {
        failures.push({
          text: node.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ?? "",
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
  }, options) satisfies Promise<ContrastFailure[]>;
}

export function formatContrastFailures(failures: ContrastFailure[]) {
  if (failures.length === 0) return "";

  return failures
    .map(
      (failure) =>
        `"${failure.text}" ${failure.ratio}:1 ` +
        `(fg ${failure.foreground}, bg ${failure.background}, ` +
        `required ${failure.requiredRatio}:1, ` +
        `${failure.fontSize}px/${failure.fontWeight})`
    )
    .join("\n");
}
