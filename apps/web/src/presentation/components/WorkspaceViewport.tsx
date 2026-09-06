import type { ReactNode } from "react";

import { SidebarInset } from "./ui/sidebar";

type WorkspaceViewportProps = {
  children: ReactNode;
  /**
   * An `InspectorPanel`, laid out as a sibling of the main region so it
   * displaces the content rather than covering it.
   */
  inspector?: ReactNode;
};

/**
 * The scrolling main region every workspace route renders into. Routes own this
 * rather than the shell because a route may also render siblings of it — the
 * pipeline's saved-views sidebar, or an inspector panel.
 */
export function WorkspaceViewport({ children, inspector }: WorkspaceViewportProps) {
  return (
    <SidebarInset>
      <div className="relative flex h-screen min-h-0">
        {/* `min-w-0` is what lets the main region narrow when the inspector
            opens. Without it a flex child refuses to shrink below its content
            width and pushes the list off-screen instead. */}
        <main className="flex min-w-0 flex-1 flex-col overflow-auto">
          {/* Mobile top bar */}
          <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 md:hidden">
            <span className="text-sm font-bold text-foreground">Career Pipeline</span>
          </div>
          {/* The bottom tab bar is fixed on mobile, so the scroll region ends
              above it rather than behind it. */}
          <div className="flex-1 overflow-auto px-4 pt-5 pb-24 md:px-6 md:py-6">
            <div className="mx-auto w-full max-w-[1240px]">{children}</div>
          </div>
        </main>

        {inspector}
      </div>
    </SidebarInset>
  );
}
