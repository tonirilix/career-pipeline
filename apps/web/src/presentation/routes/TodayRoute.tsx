import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import type { ApplicationStage } from "../../domain/applicationStage";
import { useAppShell } from "../appShellContext";
import { hasModifier, isTypingTarget } from "../keyboard";
import { TodayGroup } from "../components/today/TodayGroup";
import { TodayHeader } from "../components/today/TodayHeader";
import { TodayInspectorBody } from "../components/today/TodayInspectorBody";
import { TodayRow } from "../components/today/TodayRow";
import {
  TodayEmptyState,
  TodayLoadingState
} from "../components/today/TodayStates";
import { WorkspaceViewport } from "../components/WorkspaceViewport";
import { InspectorPanel } from "../components/ui/inspector-panel";
import type { TodayItem } from "../todayProjections";

export function TodayRoute() {
  const { workspace, today, isTodayLoading } = useAppShell();
  const navigate = useNavigate();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [isWaitingExpanded, setIsWaitingExpanded] = useState(false);

  const actionableItems = useMemo(
    () => [...today.now, ...today.thisWeek],
    [today.now, today.thisWeek]
  );

  // Selection runs across Now and This week as one sequence. Waiting rows join
  // it only once the section is expanded.
  const navigableItems = useMemo(
    () => (isWaitingExpanded ? [...actionableItems, ...today.waiting] : actionableItems),
    [actionableItems, isWaitingExpanded, today.waiting]
  );

  const openItem =
    [...actionableItems, ...today.waiting].find((item) => item.id === openItemId) ??
    null;

  // The inspector animates itself out, so it needs its subject for one frame
  // longer than the selection holds it.
  const closingItemRef = useRef<TodayItem | null>(null);
  if (openItem) closingItemRef.current = openItem;
  const inspectorItem = openItem ?? closingItemRef.current;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (hasModifier(event) || isTypingTarget(event.target)) return;
      if (navigableItems.length === 0) return;

      if (event.key === "j" || event.key === "k") {
        event.preventDefault();
        setSelectedItemId((current) =>
          stepSelection(navigableItems, current, event.key === "j" ? 1 : -1)
        );
        return;
      }

      if (event.key !== "Enter") return;

      // Enter acts on the selection, not on whatever happens to hold focus —
      // except where focus is on a control that owns Enter itself.
      if (isInteractiveTarget(event.target)) return;
      if (!selectedItemId) return;

      event.preventDefault();
      setOpenItemId(selectedItemId);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigableItems, selectedItemId]);

  function goToPipeline(stage?: ApplicationStage) {
    if (stage) workspace.setStageFilter(stage);
    void navigate({ to: "/pipeline" });
  }

  function openApplication(applicationId: string) {
    workspace.viewDetails(applicationId);
    void navigate({ to: "/pipeline" });
  }

  function primaryAction(item: TodayItem) {
    switch (item.type) {
      case "Follow-up":
        return {
          label: "Complete",
          isPending: !!item.followUpId
            && workspace.completingFollowUpReminderIds.has(item.followUpId),
          run: () => {
            if (!item.applicationId || !item.followUpId) return;
            void workspace.completeFollowUp({
              applicationId: item.applicationId,
              reminderId: item.followUpId
            });
          }
        };
      case "Approval":
        return {
          label: "Mark applied",
          isPending: !!item.applicationId
            && workspace.changingStageApplicationIds.has(item.applicationId),
          run: () => {
            const application = workspace.applications.find(
              (candidate) => candidate.id === item.applicationId
            );
            if (!application) return;
            void workspace.changeStage(application, "Applied");
          }
        };
      case "Triage":
        return {
          label: "Review role",
          isPending: false,
          run: () => void navigate({ to: "/roles" })
        };
      default:
        return {
          label: "Open application",
          isPending: false,
          run: () => {
            if (!item.applicationId) return;
            openApplication(item.applicationId);
          }
        };
    }
  }

  function renderRows(items: TodayItem[]) {
    return items.map((item) => {
      const action = primaryAction(item);

      return (
        <TodayRow
          key={item.id}
          item={item}
          isSelected={selectedItemId === item.id}
          isOpen={openItemId === item.id}
          isActionPending={action.isPending}
          actionLabel={action.label}
          onOpen={() => {
            setSelectedItemId(item.id);
            setOpenItemId(item.id);
          }}
          onAction={action.run}
        />
      );
    });
  }

  const hasActionableItems = actionableItems.length > 0;

  return (
    <WorkspaceViewport
      inspector={
        inspectorItem ? (
          <InspectorPanel
            isOpen={!!openItem}
            onClose={() => setOpenItemId(null)}
            title={`${inspectorItem.company} — ${inspectorItem.roleTitle}`}
            type={inspectorItem.type}
            stage={inspectorItem.stage}
          >
            <TodayInspectorBody
              item={inspectorItem}
              onOpenApplication={openApplication}
            />
          </InspectorPanel>
        ) : null
      }
    >
      {/* A container context: the inspector narrows this region, and the rows
          and stage strip have to reflow inside it rather than overflow. */}
      <section className="@container space-y-5" aria-labelledby="workspace-title">
        <TodayHeader
          date={new Date()}
          nowCount={today.now.length}
          thisWeekCount={today.thisWeek.length}
          stageCounts={workspace.stageCounts}
          onSelectStage={goToPipeline}
        />

        {isTodayLoading ? (
          <TodayLoadingState />
        ) : (
          <div className="grid gap-4">
            {hasActionableItems ? (
              <>
                {today.now.length > 0 ? (
                  <TodayGroup
                    label="Now"
                    hint="Overdue, or due within three days"
                    count={today.now.length}
                  >
                    {renderRows(today.now)}
                  </TodayGroup>
                ) : null}

                {today.thisWeek.length > 0 ? (
                  <TodayGroup
                    label="This week"
                    hint="Due later this week, or awaiting your review"
                    count={today.thisWeek.length}
                  >
                    {renderRows(today.thisWeek)}
                  </TodayGroup>
                ) : null}
              </>
            ) : (
              <TodayEmptyState onGoToPipeline={() => goToPipeline()} />
            )}

            {today.waiting.length > 0 ? (
              <section aria-label="Waiting" className="border border-border bg-card">
                <h3 className="m-0">
                  <button
                    type="button"
                    aria-expanded={isWaitingExpanded}
                    onClick={() => setIsWaitingExpanded((expanded) => !expanded)}
                    className="flex min-h-11 w-full flex-wrap items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span aria-hidden="true" className="text-xs text-muted-foreground">
                      {isWaitingExpanded ? "▼" : "▶"}
                    </span>
                    <span className="text-xs font-bold meta-label tracking-widest text-muted-foreground">
                      Waiting
                    </span>
                    <span className="text-xs font-bold tabular-nums text-foreground">
                      {today.waiting.length}
                    </span>
                    <span className="text-xs text-foreground-secondary">
                      Nothing to do until a reply or a date arrives
                    </span>
                  </button>
                </h3>
                {isWaitingExpanded ? (
                  <ol
                    aria-label="Waiting items"
                    className="m-0 list-none border-t border-border p-0"
                  >
                    {renderRows(today.waiting)}
                  </ol>
                ) : null}
              </section>
            ) : null}
          </div>
        )}
      </section>
    </WorkspaceViewport>
  );
}

function stepSelection(items: TodayItem[], currentId: string | null, step: number) {
  const currentIndex = items.findIndex((item) => item.id === currentId);

  if (currentIndex === -1) {
    return items[step > 0 ? 0 : items.length - 1].id;
  }

  const nextIndex = Math.min(
    Math.max(currentIndex + step, 0),
    items.length - 1
  );

  return items[nextIndex].id;
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return !!target.closest("button, a, input, select, textarea, [role='button']");
}
