import { lazy, Suspense } from "react";

import { useAppShell } from "../appShellContext";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { WorkspaceViewport } from "../components/WorkspaceViewport";

const RoleDiscoveryWorkspace = lazy(() =>
  import("../components/RoleDiscoveryWorkspace").then((module) => ({
    default: module.RoleDiscoveryWorkspace
  }))
);

export function RolesRoute() {
  const { roleDiscoveryGateway } = useAppShell();

  return (
    <WorkspaceViewport>
      <WorkspaceShell
        title="Roles"
        description="Capture role opportunities, search topics, and promotion decisions."
      >
        <Suspense fallback={null}>
          <RoleDiscoveryWorkspace gateway={roleDiscoveryGateway} />
        </Suspense>
      </WorkspaceShell>
    </WorkspaceViewport>
  );
}
