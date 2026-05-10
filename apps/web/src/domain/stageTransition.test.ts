import { describe, expect, it } from "vitest";

import type { JobApplication } from "./jobOpportunity";
import { transitionApplicationStage } from "./stageTransition";

const savedApplication: JobApplication = {
  id: "job-1",
  company: "Linear",
  roleTitle: "Frontend Engineer",
  postingUrl: "https://linear.app/careers/frontend-engineer",
  source: "Referral",
  location: "Remote",
  compensation: "$160k-$190k",
  employmentType: "Full-time",
  stage: "Saved",
  timeline: [
    {
      id: "event-1",
      occurredAt: "2026-05-10T01:00:00.000Z",
      description: "Saved opportunity"
    }
  ],
  interviews: [],
  followUps: []
};

describe("application stage transitions", () => {
  it("moves a saved application to applied and appends a timeline event", () => {
    const result = transitionApplicationStage(
      savedApplication,
      { applicationId: "job-1", toStage: "Applied" },
      {
        id: "event-2",
        occurredAt: "2026-05-10T02:00:00.000Z",
        description: "Moved from Saved to Applied"
      }
    );

    expect(result).toEqual({
      ok: true,
      application: {
        ...savedApplication,
        stage: "Applied",
        timeline: [
          ...savedApplication.timeline,
          {
            id: "event-2",
            occurredAt: "2026-05-10T02:00:00.000Z",
            description: "Moved from Saved to Applied"
          }
        ]
      }
    });
  });

  it("rejects invalid transitions without changing timeline history", () => {
    const result = transitionApplicationStage(
      savedApplication,
      { applicationId: "job-1", toStage: "Offer" },
      {
        id: "event-2",
        occurredAt: "2026-05-10T02:00:00.000Z",
        description: "Moved from Saved to Offer"
      }
    );

    expect(result).toEqual({
      ok: false,
      failure: {
        message: "Cannot move an application from Saved to Offer."
      }
    });
  });

  it("allows closed applications to reopen explicitly", () => {
    const result = transitionApplicationStage(
      { ...savedApplication, stage: "Rejected" },
      { applicationId: "job-1", toStage: "Applied" },
      {
        id: "event-2",
        occurredAt: "2026-05-10T02:00:00.000Z",
        description: "Moved from Rejected to Applied"
      }
    );

    expect(result).toMatchObject({
      ok: true,
      application: {
        stage: "Applied"
      }
    });
  });
});
