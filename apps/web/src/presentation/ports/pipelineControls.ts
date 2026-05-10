import type { ApplicationStage } from "../../domain/applicationStage";
import type { JobSource } from "../../domain/jobOpportunity";

export type PipelineSortOption =
  | "created"
  | "lastActivity"
  | "followUpDate";

export type PipelineControls = {
  stageFilter: ApplicationStage | "All";
  sourceFilter: JobSource | "All";
  searchTerm: string;
  sortBy: PipelineSortOption;
  setStageFilter(stageFilter: ApplicationStage | "All"): void;
  setSourceFilter(sourceFilter: JobSource | "All"): void;
  setSearchTerm(searchTerm: string): void;
  setSortBy(sortBy: PipelineSortOption): void;
};

export type UsePipelineControls = () => PipelineControls;

export const initialPipelineControls = {
  stageFilter: "All",
  sourceFilter: "All",
  searchTerm: "",
  sortBy: "created"
} satisfies Pick<
  PipelineControls,
  "stageFilter" | "sourceFilter" | "searchTerm" | "sortBy"
>;
