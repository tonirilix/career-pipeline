import { create } from "zustand";

import type { ApplicationStage } from "../domain/applicationStage";
import type { JobSource } from "../domain/jobOpportunity";

export type PipelineSortOption =
  | "created"
  | "lastActivity"
  | "followUpDate";

type PipelineControlsState = {
  stageFilter: ApplicationStage | "All";
  sourceFilter: JobSource | "All";
  searchTerm: string;
  sortBy: PipelineSortOption;
  setStageFilter(stageFilter: ApplicationStage | "All"): void;
  setSourceFilter(sourceFilter: JobSource | "All"): void;
  setSearchTerm(searchTerm: string): void;
  setSortBy(sortBy: PipelineSortOption): void;
  reset(): void;
};

const initialState = {
  stageFilter: "All" as const,
  sourceFilter: "All" as const,
  searchTerm: "",
  sortBy: "created" as const
};

export const usePipelineControlsStore = create<PipelineControlsState>((set) => ({
  ...initialState,
  setStageFilter: (stageFilter) => set({ stageFilter }),
  setSourceFilter: (sourceFilter) => set({ sourceFilter }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setSortBy: (sortBy) => set({ sortBy }),
  reset: () => set(initialState)
}));

export function resetPipelineControls() {
  usePipelineControlsStore.getState().reset();
}
