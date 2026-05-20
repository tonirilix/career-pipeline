import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

import {
  resetJobApplicationMockData,
  server
} from "./src/infrastructure/msw/server";
import { resetZustandPipelineControlsStore } from "./src/infrastructure/zustand/pipelineControlsStore";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

beforeEach(() => {
  vi.setSystemTime(new Date("2026-05-10T12:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
  server.resetHandlers();
  resetJobApplicationMockData();
  resetZustandPipelineControlsStore();
});

afterAll(() => server.close());
