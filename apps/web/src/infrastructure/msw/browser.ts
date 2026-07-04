import { setupWorker } from "msw/browser";

import { candidateContextHandlers } from "./candidateContextHandlers";
import { jobApplicationHandlers } from "./jobApplicationHandlers";

export const worker = setupWorker(
  ...jobApplicationHandlers,
  ...candidateContextHandlers
);
