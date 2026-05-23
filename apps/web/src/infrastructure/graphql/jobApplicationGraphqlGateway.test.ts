import { afterEach, describe, expect, it, vi } from "vitest";

import { createJobApplicationGraphqlGateway } from "./jobApplicationGraphqlGateway";

describe("GraphQL job application gateway", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps transport application records into domain applications", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            applications: [
              {
                __typename: "JobApplication",
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
                    __typename: "TimelineEvent",
                    id: "event-1",
                    occurredAt: "2026-05-10T01:00:00.000Z",
                    description: "Moved from Saved to Applied"
                  }
                ],
                interviews: [
                  {
                    __typename: "Interview",
                    id: "interview-1",
                    type: "Recruiter screen",
                    scheduledAt: "2026-05-12T15:00:00.000Z",
                    notes: "Ask about team shape",
                    outcome: "Scheduled"
                  }
                ],
                followUps: [
                  {
                    __typename: "FollowUpReminder",
                    id: "follow-up-1",
                    applicationId: "job-1",
                    dueAt: "2026-05-13T15:00:00.000Z",
                    note: "Send a thank-you note",
                    completedAt: null
                  }
                ],
                notes: [
                  {
                    __typename: "ApplicationNote",
                    id: "note-1",
                    body: "Recruiter prefers email.",
                    createdAt: "2026-05-10T16:00:00.000Z"
                  }
                ]
              }
            ]
          }
        })
      )
    );

    const gateway = createJobApplicationGraphqlGateway("https://api.example.test/graphql");

    await expect(gateway.listApplications()).resolves.toEqual([
      {
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
            occurredAt: "2026-05-10T01:00:00.000Z",
            description: "Moved from Saved to Applied"
          }
        ],
        interviews: [
          {
            id: "interview-1",
            type: "Recruiter screen",
            scheduledAt: "2026-05-12T15:00:00.000Z",
            notes: "Ask about team shape",
            outcome: "Scheduled"
          }
        ],
        followUps: [
          {
            id: "follow-up-1",
            applicationId: "job-1",
            dueAt: "2026-05-13T15:00:00.000Z",
            note: "Send a thank-you note",
            completedAt: null
          }
        ],
        notes: [
          {
            id: "note-1",
            body: "Recruiter prefers email.",
            createdAt: "2026-05-10T16:00:00.000Z"
          }
        ]
      }
    ]);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.test/graphql",
      expect.objectContaining({
        method: "POST"
      })
    );
  });

  it("exposes backend domain failure messages through rejected gateway commands", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          errors: [{ message: "invalid stage transition" }]
        })
      )
    );

    const gateway = createJobApplicationGraphqlGateway("https://api.example.test/graphql");

    await expect(
      gateway.advanceApplicationStage({
        applicationId: "job-1",
        toStage: "Offer"
      })
    ).rejects.toThrow("invalid stage transition");
  });
});
