import { create } from "zustand";

import {
  initialPipelineControls,
  type PipelineControls
} from "../../presentation/ports/pipelineControls";

type PipelineControlsState = PipelineControls & {
  reset(): void;
};

export const useZustandPipelineControlsStore = create<PipelineControlsState>(
  (set) => ({
    ...initialPipelineControls,
    setStageFilter: (stageFilter) => set({ stageFilter }),
    setSourceFilter: (sourceFilter) => set({ sourceFilter }),
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setSortBy: (sortBy) => set({ sortBy }),
    reset: () => set(initialPipelineControls)
  })
);

export function resetZustandPipelineControlsStore() {
  useZustandPipelineControlsStore.getState().reset();
}
