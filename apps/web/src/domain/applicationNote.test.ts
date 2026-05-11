import { describe, expect, it } from "vitest";

import type { JobApplication } from "./jobOpportunity";
import { addApplicationNote } from "./applicationNote";

const application: JobApplication = {
  id: "job-1",
  company: "Linear",
  roleTitle: "Frontend Engineer",
  postingUrl: "https://linear.app/careers/frontend-engineer",
  source: "Referral",
  location: "Remote",
  compensation: "$160k-$190k",
  employmentType: "Full-time",
  stage: "Applied",
  timeline: [
    {
      id: "event-1",
      occurredAt: "2026-05-10T12:00:00.000Z",
      description: "Moved from Saved to Applied"
    }
  ],
  interviews: [],
  followUps: [],
  notes: []
};

describe("application notes", () => {
  it("adds a freeform note and appends a timeline event", () => {
    const result = addApplicationNote(
      application,
      {
        applicationId: "job-1",
        body: "Recruiter mentioned the team is expanding."
      },
      {
        noteId: "note-1",
        timelineEventId: "event-2",
        occurredAt: "2026-05-10T13:00:00.000Z"
      }
    );

    expect(result).toEqual({
      ok: true,
      application: {
        ...application,
        notes: [
          {
            id: "note-1",
            body: "Recruiter mentioned the team is expanding.",
            createdAt: "2026-05-10T13:00:00.000Z"
          }
        ],
        timeline: [
          ...application.timeline,
          {
            id: "event-2",
            occurredAt: "2026-05-10T13:00:00.000Z",
            description: "Added note"
          }
        ]
      }
    });
  });
});
