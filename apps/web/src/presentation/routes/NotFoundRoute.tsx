import { WorkspaceShell } from "../components/WorkspaceShell";
import { WorkspaceViewport } from "../components/WorkspaceViewport";

export function NotFoundRoute() {
  return (
    <WorkspaceViewport>
      <WorkspaceShell
        title="Workspace not found"
        description="Choose a workspace from global navigation."
      >
        <div
          role="status"
          className="border border-border bg-card px-4 py-6 text-sm text-foreground-secondary"
        >
          Workspace not found.
        </div>
      </WorkspaceShell>
    </WorkspaceViewport>
  );
}
