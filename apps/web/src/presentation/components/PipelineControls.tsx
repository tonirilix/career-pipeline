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
      className="px-4 py-3 border-b border-border"
    >
      <div className="grid items-end gap-3 grid-cols-1">
        <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
          Filter by stage
          <Select
            name="stageFilter"
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
        <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
          Filter by source
          <Select
            name="sourceFilter"
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
        <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
          Search applications
          <Input
            autoComplete="off"
            name="applicationSearch"
            onChange={(e) => setSearchTerm(e.target.value)}
            type="search"
            value={searchTerm}
            placeholder="Company or role…"
          />
        </label>
        <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
          Sort applications
          <Select
            name="applicationSort"
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
