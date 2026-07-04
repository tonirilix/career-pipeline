import { setupServer } from "msw/node";

import {
  candidateContextHandlers,
  resetCandidateContextMockData
} from "./candidateContextHandlers";
import {
  jobApplicationHandlers,
  resetJobApplicationMockData
} from "./jobApplicationHandlers";

export const server = setupServer(
  ...jobApplicationHandlers,
  ...candidateContextHandlers
);

export { resetCandidateContextMockData, resetJobApplicationMockData };
