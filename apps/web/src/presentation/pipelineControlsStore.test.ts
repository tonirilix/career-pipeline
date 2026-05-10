import { beforeEach, describe, expect, it } from "vitest";

import {
  resetPipelineControls,
  usePipelineControlsStore
} from "./pipelineControlsStore";

describe("pipeline controls store", () => {
  beforeEach(() => {
    resetPipelineControls();
  });

  it("stores pipeline control selections independently of filtering rules", () => {
    const store = usePipelineControlsStore.getState();

    store.setStageFilter("Applied");
    store.setSourceFilter("Referral");
    store.setSearchTerm("frontend");
    store.setSortBy("lastActivity");

    expect(usePipelineControlsStore.getState()).toMatchObject({
      stageFilter: "Applied",
      sourceFilter: "Referral",
      searchTerm: "frontend",
      sortBy: "lastActivity"
    });
  });

  it("resets pipeline control selections to their defaults", () => {
    const store = usePipelineControlsStore.getState();

    store.setStageFilter("Offer");
    store.setSourceFilter("Recruiter");
    store.setSearchTerm("manager");
    store.setSortBy("followUpDate");

    resetPipelineControls();

    expect(usePipelineControlsStore.getState()).toMatchObject({
      stageFilter: "All",
      sourceFilter: "All",
      searchTerm: "",
      sortBy: "created"
    });
  });
});
