import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Briefcase, Database, Plus, Search } from "lucide-react";

import type { ApplicationStage } from "../../domain/applicationStage";
import type { JobSource } from "../../domain/jobOpportunity";
import type { PipelineSortOption } from "../ports/pipelineControls";
import { pipelineSavedViews, type PipelineSavedView } from "../pipelineSavedViews";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  useCommandFilter
} from "./ui/command";

type CommandAction = {
  label: string;
  group: "Navigation" | "Create" | "Pipeline";
  keywords?: string[];
  icon?: typeof Briefcase;
  run: () => void;
};

type AppCommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenOpportunityForm: () => void;
  onSelectPipelineView: (view: PipelineSavedView) => void;
  onClearPipelineFilters: () => void;
  setPipelineSortBy: (value: PipelineSortOption) => void;
  setPipelineStageFilter: (value: ApplicationStage | "All") => void;
  setPipelineSourceFilter: (value: JobSource | "All") => void;
};

export function AppCommandPalette({
  isOpen,
  onClose,
  onOpenOpportunityForm,
  onSelectPipelineView,
  onClearPipelineFilters,
  setPipelineSortBy,
  setPipelineStageFilter,
  setPipelineSourceFilter
}: AppCommandPaletteProps) {
  const navigate = useNavigate();

  function closeAfter(action: () => void) {
    action();
    onClose();
  }

  const commands = useMemo<CommandAction[]>(
    () => [
      {
        label: "Go to Pipeline",
        group: "Navigation",
        icon: Briefcase,
        run: () => closeAfter(() => void navigate({ to: "/pipeline" }))
      },
      {
        label: "Go to Memory",
        group: "Navigation",
        icon: Database,
        run: () => closeAfter(() => void navigate({ to: "/memory" }))
      },
      {
        label: "Go to Roles",
        group: "Navigation",
        icon: Search,
        run: () => closeAfter(() => void navigate({ to: "/roles" }))
      },
      {
        label: "Add opportunity",
        group: "Create",
        icon: Plus,
        keywords: ["new", "create", "pipeline"],
        run: () =>
          closeAfter(() => {
            void navigate({ to: "/pipeline" });
            onOpenOpportunityForm();
          })
      },
      ...pipelineSavedViews.map((view) => ({
        label: `Show ${view.label}`,
        group: "Pipeline" as const,
        keywords: ["view", view.description],
        run: () =>
          closeAfter(() => {
            void navigate({ to: "/pipeline" });
            onSelectPipelineView(view.id);
          })
      })),
      {
        label: "Filter stage: Applied",
        group: "Pipeline",
        keywords: ["stage", "application"],
        run: () =>
          closeAfter(() => {
            void navigate({ to: "/pipeline" });
            setPipelineStageFilter("Applied");
          })
      },
      {
        label: "Filter source: Referral",
        group: "Pipeline",
        keywords: ["source", "channel"],
        run: () =>
          closeAfter(() => {
            void navigate({ to: "/pipeline" });
            setPipelineSourceFilter("Referral");
          })
      },
      {
        label: "Sort by follow-up date",
        group: "Pipeline",
        keywords: ["sort", "date"],
        run: () =>
          closeAfter(() => {
            void navigate({ to: "/pipeline" });
            setPipelineSortBy("followUpDate");
          })
      },
      {
        label: "Clear Pipeline filters",
        group: "Pipeline",
        keywords: ["reset", "clear"],
        run: () =>
          closeAfter(() => {
            void navigate({ to: "/pipeline" });
            onClearPipelineFilters();
          })
      }
    ],
    [
      navigate,
      onClearPipelineFilters,
      onOpenOpportunityForm,
      onSelectPipelineView,
      setPipelineSortBy,
      setPipelineSourceFilter,
      setPipelineStageFilter
    ]
  );
  const { filteredItems, query, setQuery } = useCommandFilter(commands);
  const groups = ["Navigation", "Create", "Pipeline"] as const;

  return (
    <CommandDialog isOpen={isOpen} onClose={onClose}>
      <Command onEscape={onClose}>
        <CommandInput
          aria-label="Search commands"
          placeholder="Search or run a command..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <CommandList>
          {filteredItems.length === 0 ? (
            <CommandEmpty>No commands found.</CommandEmpty>
          ) : null}
          {groups.map((group, index) => {
            const groupItems = filteredItems.filter((item) => item.group === group);
            if (groupItems.length === 0) return null;

            return (
              <div key={group}>
                {index > 0 ? <CommandSeparator /> : null}
                <CommandGroup heading={group}>
                  {groupItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <CommandItem key={item.label} onClick={item.run}>
                        {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
                        {item.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </div>
            );
          })}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
