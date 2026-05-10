import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

import {
  resetJobApplicationMockData,
  server
} from "./src/infrastructure/msw/server";
import { resetPipelineControls } from "./src/presentation/pipelineControlsStore";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  server.resetHandlers();
  resetJobApplicationMockData();
  resetPipelineControls();
});

afterAll(() => server.close());
