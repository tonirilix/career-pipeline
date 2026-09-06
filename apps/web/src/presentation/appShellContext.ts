import { createContext, useContext } from "react";

import type { CandidateContextGateway } from "../application/ports/candidateContextGateway";
import type { RoleDiscoveryGateway } from "../application/ports/roleDiscoveryGateway";
import type { usePipelineWorkspace } from "./pipelineWorkspace";
import type { TodayProjection } from "./todayProjections";

export type PipelineWorkspace = ReturnType<typeof usePipelineWorkspace>;

/**
 * What the shell holds on behalf of every route.
 *
 * The pipeline workspace is created once, in the shell, because the global
 * navigation counts and the command palette both read it on routes that are not
 * Pipeline. Route components consume it rather than calling the hook again, so
 * there is one source of application data and one saved-view selection.
 */
export type AppShellValue = {
  candidateContextGateway: CandidateContextGateway;
  roleDiscoveryGateway: RoleDiscoveryGateway;
  workspace: PipelineWorkspace;
  /**
   * Derived once, in the shell, so the navigation counts and the Today screen
   * cannot disagree about how much needs doing.
   */
  today: TodayProjection;
  isTodayLoading: boolean;
  isOpportunityFormOpen: boolean;
  setIsOpportunityFormOpen: (isOpen: boolean) => void;
};

const AppShellContext = createContext<AppShellValue | null>(null);

export const AppShellProvider = AppShellContext.Provider;

export function useAppShell() {
  const value = useContext(AppShellContext);

  if (!value) {
    throw new Error("Workspace routes must be rendered inside the application shell.");
  }

  return value;
}
