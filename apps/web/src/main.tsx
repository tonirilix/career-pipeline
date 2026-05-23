import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

import { createJobApplicationGraphqlGateway } from "./infrastructure/graphql/jobApplicationGraphqlGateway";
import { createWebQueryClient } from "./infrastructure/query/queryClient";
import { useZustandPipelineControlsStore } from "./infrastructure/zustand/pipelineControlsStore";
import { App } from "./presentation/App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

async function enableMockBackend() {
  if (import.meta.env.MODE !== "production") {
    const { worker } = await import("./infrastructure/msw/browser");

    await worker.start({
      onUnhandledRequest: "bypass"
    });
  }
}

void enableMockBackend().then(() => {
  const gateway = createJobApplicationGraphqlGateway();
  const queryClient = createWebQueryClient();

  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App
          gateway={gateway}
          usePipelineControls={useZustandPipelineControlsStore}
        />
      </QueryClientProvider>
    </StrictMode>
  );
});
