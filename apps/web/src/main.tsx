import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

import { createCandidateContextGraphqlGateway } from "./infrastructure/graphql/candidateContextGraphqlGateway";
import { createJobApplicationGraphqlGateway } from "./infrastructure/graphql/jobApplicationGraphqlGateway";
import { createRoleDiscoveryGraphqlGateway } from "./infrastructure/graphql/roleDiscoveryGraphqlGateway";
import { createWebQueryClient } from "./infrastructure/query/queryClient";
import { createAppRouter } from "./presentation/router";
import { RouterProvider } from "@tanstack/react-router";

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
  const candidateContextGateway = createCandidateContextGraphqlGateway();
  const roleDiscoveryGateway = createRoleDiscoveryGraphqlGateway();
  const queryClient = createWebQueryClient();
  const router = createAppRouter({
    context: {
      candidateContextGateway,
      gateway,
      roleDiscoveryGateway
    }
  });

  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  );
});
