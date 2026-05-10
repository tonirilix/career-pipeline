import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

import {
  resetJobApplicationMockData,
  server
} from "./src/infrastructure/msw/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  server.resetHandlers();
  resetJobApplicationMockData();
});

afterAll(() => server.close());
