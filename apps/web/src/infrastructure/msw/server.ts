import { setupServer } from "msw/node";

import {
  jobApplicationHandlers,
  resetJobApplicationMockData
} from "./jobApplicationHandlers";

export const server = setupServer(...jobApplicationHandlers);

export { resetJobApplicationMockData };
