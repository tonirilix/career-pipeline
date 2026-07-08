import {
  applicationStages,
  type ApplicationStage
} from "../../domain/applicationStage";
import { jobSources, type JobSource } from "../../domain/jobOpportunity";
import type { PipelineSortOption } from "../ports/pipelineControls";
import { Input } from "./ui/input";
import { Select } from "./ui/select";

type PipelineControlsProps = {
  stageFilter: ApplicationStage | "All";
  sourceFilter: JobSource | "All";
  searchTerm: string;
  sortBy: PipelineSortOption;
  setStageFilter: (value: ApplicationStage | "All") => void;
  setSourceFilter: (value: JobSource | "All") => void;
  setSearchTerm: (value: string) => void;
  setSortBy: (value: PipelineSortOption) => void;
};

export function PipelineControls({
  stageFilter,
  sourceFilter,
  searchTerm,
  sortBy,
  setStageFilter,
  setSourceFilter,
  setSearchTerm,
  setSortBy
}: PipelineControlsProps) {
  return (
    <section
      aria-label="Pipeline controls"
      className="border border-border bg-card px-3 py-3"
    >
      <div className="grid items-end gap-2 md:grid-cols-[minmax(220px,1fr)_minmax(140px,180px)_minmax(140px,180px)_minmax(150px,190px)]">
        <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground md:order-1">
          Search applications
          <Input
            onChange={(e) => setSearchTerm(e.target.value)}
            type="search"
            value={searchTerm}
            placeholder="Company or role"
          />
        </label>
        <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground md:order-2">
          Stage
          <Select
            aria-label="Filter by stage"
            onChange={(e) =>
              setStageFilter(e.target.value as typeof stageFilter)
            }
            value={stageFilter}
          >
            <option value="All">All stages</option>
            {applicationStages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </Select>
        </label>
        <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground md:order-3">
          Channel
          <Select
            aria-label="Filter by source"
            onChange={(e) => setSourceFilter(e.target.value as JobSource | "All")}
            value={sourceFilter}
          >
            <option value="All">All sources</option>
            {jobSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </Select>
        </label>
        <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground md:order-4">
          Sort
          <Select
            aria-label="Sort applications"
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            value={sortBy}
          >
            <option value="created">Created order</option>
            <option value="lastActivity">Last activity</option>
            <option value="followUpDate">Follow-up date</option>
          </Select>
        </label>
      </div>
    </section>
  );
}
