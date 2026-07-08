import type { ApplicationStage } from "../../domain/applicationStage";
import type { JobSource } from "../../domain/jobOpportunity";
import type { PipelineSortOption } from "../ports/pipelineControls";
import { PipelineControls } from "./PipelineControls";
import { Button } from "./ui/button";

type PipelineViewOptionsProps = {
  isOpen: boolean;
  onToggle: () => void;
  onClearFilters: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  setSortBy: (value: PipelineSortOption) => void;
  setSourceFilter: (value: JobSource | "All") => void;
  setStageFilter: (value: ApplicationStage | "All") => void;
  sortBy: PipelineSortOption;
  sourceFilter: JobSource | "All";
  stageFilter: ApplicationStage | "All";
};

export function PipelineViewOptions({
  isOpen,
  onToggle,
  onClearFilters,
  searchTerm,
  setSearchTerm,
  setSortBy,
  setSourceFilter,
  setStageFilter,
  sortBy,
  sourceFilter,
  stageFilter
}: PipelineViewOptionsProps) {
  const activeFilters = [
    searchTerm.trim() ? `Search: ${searchTerm.trim()}` : null,
    stageFilter !== "All" ? `Stage: ${stageFilter}` : null,
    sourceFilter !== "All" ? `Source: ${sourceFilter}` : null,
    sortBy !== "created" ? `Sort: ${sortLabel(sortBy)}` : null
  ].filter(Boolean);

  return (
    <section aria-label="Pipeline view options" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="bg-transparent hover:bg-muted"
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          View options
        </Button>
        {activeFilters.map((filter) => (
          <span
            key={filter}
            className="border border-border bg-card px-2 py-1 text-xs font-semibold text-muted-foreground"
          >
            {filter}
          </span>
        ))}
        {activeFilters.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            className="bg-transparent hover:bg-muted"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        ) : null}
      </div>

      {isOpen ? (
        <PipelineControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setSortBy={setSortBy}
          setSourceFilter={setSourceFilter}
          setStageFilter={setStageFilter}
          sortBy={sortBy}
          sourceFilter={sourceFilter}
          stageFilter={stageFilter}
        />
      ) : null}
    </section>
  );
}

function sortLabel(sortBy: PipelineSortOption) {
  if (sortBy === "lastActivity") return "Last activity";
  if (sortBy === "followUpDate") return "Follow-up date";
  return "Created order";
}
