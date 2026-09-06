import { lazy, Suspense } from "react";

import { useAppShell } from "../appShellContext";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { WorkspaceViewport } from "../components/WorkspaceViewport";

const CandidateMemoryWorkspace = lazy(() =>
  import("../components/CandidateMemoryWorkspace").then((module) => ({
    default: module.CandidateMemoryWorkspace
  }))
);

export function MemoryRoute() {
  const { candidateContextGateway } = useAppShell();

  return (
    <WorkspaceViewport>
      <WorkspaceShell
        title="Memory"
        description="Maintain candidate context, approved memory, and AI artifacts."
      >
        <Suspense fallback={null}>
          <CandidateMemoryWorkspace gateway={candidateContextGateway} />
        </Suspense>
      </WorkspaceShell>
    </WorkspaceViewport>
  );
}
