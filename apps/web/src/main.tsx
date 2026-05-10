import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { createJobApplicationGraphqlGateway } from "./infrastructure/graphql/jobApplicationGraphqlGateway";
import { App } from "./presentation/App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

async function enableMockBackend() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./infrastructure/msw/browser");

    await worker.start({
      onUnhandledRequest: "bypass"
    });
  }
}

void enableMockBackend().then(() => {
  const gateway = createJobApplicationGraphqlGateway();

  createRoot(rootElement).render(
    <StrictMode>
      <App gateway={gateway} />
    </StrictMode>
  );
});
