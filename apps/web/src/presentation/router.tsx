import {
  createRootRouteWithContext,
  createRoute,
  createRouter
} from "@tanstack/react-router";
import type { RouterHistory } from "@tanstack/history";

import type { CandidateContextGateway } from "../application/ports/candidateContextGateway";
import type { JobApplicationGateway } from "../application/ports/jobApplicationGateway";
import type { RoleDiscoveryGateway } from "../application/ports/roleDiscoveryGateway";
import { useZustandPipelineControlsStore } from "../infrastructure/zustand/pipelineControlsStore";
import { App } from "./App";
import type { UsePipelineControls } from "./ports/pipelineControls";

type AppRouterContext = {
  candidateContextGateway: CandidateContextGateway;
  gateway: JobApplicationGateway;
  roleDiscoveryGateway: RoleDiscoveryGateway;
  usePipelineControls: UsePipelineControls;
};

const rootRoute = createRootRouteWithContext<AppRouterContext>()({
  component: RootRoute
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/"
});

const pipelineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pipeline"
});

const memoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/memory"
});

const rolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/roles"
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  pipelineRoute,
  memoryRoute,
  rolesRoute
]);

function RootRoute() {
  const context = rootRoute.useRouteContext();

  return <App {...context} />;
}

type CreateAppRouterOptions = {
  context: Omit<AppRouterContext, "usePipelineControls"> &
    Partial<Pick<AppRouterContext, "usePipelineControls">>;
  history?: RouterHistory;
};

export function createAppRouter({ context, history }: CreateAppRouterOptions) {
  return createRouter({
    routeTree,
    history,
    context: {
      ...context,
      usePipelineControls:
        context.usePipelineControls ?? useZustandPipelineControlsStore
    }
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter;
  }
}
