import { setupWorker } from "msw/browser";

import { candidateContextHandlers } from "./candidateContextHandlers";
import { jobApplicationHandlers } from "./jobApplicationHandlers";
import { roleDiscoveryHandlers } from "./roleDiscoveryHandlers";

export const worker = setupWorker(
  ...jobApplicationHandlers,
  ...candidateContextHandlers,
  ...roleDiscoveryHandlers
);
