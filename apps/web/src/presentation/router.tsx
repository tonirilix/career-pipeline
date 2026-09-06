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
import { MemoryRoute } from "./routes/MemoryRoute";
import { NotFoundRoute } from "./routes/NotFoundRoute";
import { PipelineRoute } from "./routes/PipelineRoute";
import { RolesRoute } from "./routes/RolesRoute";
import { TodayRoute } from "./routes/TodayRoute";
import type { UsePipelineControls } from "./ports/pipelineControls";

type AppRouterContext = {
  candidateContextGateway: CandidateContextGateway;
  gateway: JobApplicationGateway;
  roleDiscoveryGateway: RoleDiscoveryGateway;
  usePipelineControls: UsePipelineControls;
};

const rootRoute = createRootRouteWithContext<AppRouterContext>()({
  component: RootRoute,
  notFoundComponent: NotFoundRoute
});

// The entry point is the derived action queue, not the data view. `/pipeline`
// is unchanged, so existing links and bookmarks still resolve to the board.
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: TodayRoute
});

const todayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/today",
  component: TodayRoute
});

const pipelineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pipeline",
  component: PipelineRoute
});

const memoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/memory",
  component: MemoryRoute
});

const rolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/roles",
  component: RolesRoute
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  todayRoute,
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
