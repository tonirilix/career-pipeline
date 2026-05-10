import { setupWorker } from "msw/browser";

import { jobApplicationHandlers } from "./jobApplicationHandlers";

export const worker = setupWorker(...jobApplicationHandlers);
