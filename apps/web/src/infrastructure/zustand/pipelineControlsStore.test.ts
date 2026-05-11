import { beforeEach, describe, expect, it } from "vitest";

import {
  resetZustandPipelineControlsStore,
  useZustandPipelineControlsStore
} from "./pipelineControlsStore";

describe("Zustand pipeline controls store", () => {
  beforeEach(() => {
    resetZustandPipelineControlsStore();
  });

  it("adapts pipeline control selections to the presentation control port", () => {
    const store = useZustandPipelineControlsStore.getState();

    store.setStageFilter("Applied");
    store.setSourceFilter("Referral");
    store.setSearchTerm("frontend");
    store.setSortBy("lastActivity");

    expect(useZustandPipelineControlsStore.getState()).toMatchObject({
      stageFilter: "Applied",
      sourceFilter: "Referral",
      searchTerm: "frontend",
      sortBy: "lastActivity"
    });
  });

  it("resets pipeline control selections to their defaults", () => {
    const store = useZustandPipelineControlsStore.getState();

    store.setStageFilter("Offer");
    store.setSourceFilter("Recruiter");
    store.setSearchTerm("manager");
    store.setSortBy("followUpDate");

    resetZustandPipelineControlsStore();

    expect(useZustandPipelineControlsStore.getState()).toMatchObject({
      stageFilter: "All",
      sourceFilter: "All",
      searchTerm: "",
      sortBy: "created"
    });
  });
});
