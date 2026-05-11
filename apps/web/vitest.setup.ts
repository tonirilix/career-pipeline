import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

import {
  resetJobApplicationMockData,
  server
} from "./src/infrastructure/msw/server";
import { resetZustandPipelineControlsStore } from "./src/infrastructure/zustand/pipelineControlsStore";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  server.resetHandlers();
  resetJobApplicationMockData();
  resetZustandPipelineControlsStore();
});

afterAll(() => server.close());
