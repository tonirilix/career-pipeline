import { setupServer } from "msw/node";

import {
  candidateContextHandlers,
  resetCandidateContextMockData
} from "./candidateContextHandlers";
import {
  jobApplicationHandlers,
  resetJobApplicationMockData
} from "./jobApplicationHandlers";
import {
  resetRoleDiscoveryMockData,
  roleDiscoveryHandlers
} from "./roleDiscoveryHandlers";

export const server = setupServer(
  ...jobApplicationHandlers,
  ...candidateContextHandlers,
  ...roleDiscoveryHandlers
);

export {
  resetCandidateContextMockData,
  resetJobApplicationMockData,
  resetRoleDiscoveryMockData
};
