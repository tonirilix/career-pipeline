import { describe, expect, it } from "vitest";

import type { JobApplication } from "./jobOpportunity";
import { recordInterviewOutcome, scheduleInterview } from "./interviewScheduling";

const appliedApplication: JobApplication = {
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
  interviews: [],
  followUps: [],
  notes: []
};

describe("interview scheduling", () => {
  it("schedules an interview for an applied application and appends a timeline event", () => {
    const result = scheduleInterview(
      appliedApplication,
      {
        applicationId: "job-1",
        type: "Recruiter screen",
        scheduledAt: "2026-05-12T15:00:00.000Z",
        notes: "Ask about team shape"
      },
      {
        interviewId: "interview-1",
        timelineEventId: "event-2",
        occurredAt: "2026-05-10T02:00:00.000Z"
      }
    );

    expect(result).toEqual({
      ok: true,
      application: {
        ...appliedApplication,
        interviews: [
          {
            id: "interview-1",
            type: "Recruiter screen",
            scheduledAt: "2026-05-12T15:00:00.000Z",
            notes: "Ask about team shape",
            outcome: "Scheduled"
          }
        ],
        timeline: [
          ...appliedApplication.timeline,
          {
            id: "event-2",
            occurredAt: "2026-05-10T02:00:00.000Z",
            description: "Scheduled Recruiter screen interview"
          }
        ]
      }
    });
  });

  it("rejects interviews for unsubmitted saved opportunities", () => {
    const result = scheduleInterview(
      { ...appliedApplication, stage: "Saved" },
      {
        applicationId: "job-1",
        type: "Recruiter screen",
        scheduledAt: "2026-05-12T15:00:00.000Z",
        notes: "Ask about team shape"
      },
      {
        interviewId: "interview-1",
        timelineEventId: "event-2",
        occurredAt: "2026-05-10T02:00:00.000Z"
      }
    );

    expect(result).toEqual({
      ok: false,
      failure: {
        message:
          "Interviews can only be scheduled for active applications before the offer stage."
      }
    });
  });

  it("rejects interviews for closed applications", () => {
    for (const stage of ["Rejected", "Withdrawn"] as const) {
      const result = scheduleInterview(
        { ...appliedApplication, stage },
        {
          applicationId: "job-1",
          type: "Recruiter screen",
          scheduledAt: "2026-05-12T15:00:00.000Z",
          notes: "Ask about team shape"
        },
        {
          interviewId: "interview-1",
          timelineEventId: "event-2",
          occurredAt: "2026-05-10T02:00:00.000Z"
        }
      );

      expect(result).toEqual({
        ok: false,
        failure: {
          message:
            "Interviews can only be scheduled for active applications before the offer stage."
        }
      });
    }
  });

  it("rejects interviews when the application id does not match", () => {
    const result = scheduleInterview(
      appliedApplication,
      {
        applicationId: "missing-job",
        type: "Recruiter screen",
        scheduledAt: "2026-05-12T15:00:00.000Z",
        notes: "Ask about team shape"
      },
      {
        interviewId: "interview-1",
        timelineEventId: "event-2",
        occurredAt: "2026-05-10T02:00:00.000Z"
      }
    );

    expect(result).toEqual({
      ok: false,
      failure: { message: "Application could not be found." }
    });
  });

  it("rejects interviews without a scheduled date", () => {
    const result = scheduleInterview(
      appliedApplication,
      {
        applicationId: "job-1",
        type: "Recruiter screen",
        scheduledAt: "",
        notes: "Ask about team shape"
      },
      {
        interviewId: "interview-1",
        timelineEventId: "event-2",
        occurredAt: "2026-05-10T02:00:00.000Z"
      }
    );

    expect(result).toEqual({
      ok: false,
      failure: { message: "Interview date and time is required." }
    });
  });

  it("records an outcome for an existing interview", () => {
    const result = recordInterviewOutcome(
      {
        ...appliedApplication,
        interviews: [
          {
            id: "interview-1",
            type: "Recruiter screen",
            scheduledAt: "2026-05-12T15:00:00.000Z",
            notes: "Ask about team shape",
            outcome: "Scheduled"
          }
        ]
      },
      {
        applicationId: "job-1",
        interviewId: "interview-1",
        outcome: "Passed"
      },
      {
        timelineEventId: "event-2",
        occurredAt: "2026-05-13T02:00:00.000Z"
      }
    );

    expect(result).toMatchObject({
      ok: true,
      application: {
        interviews: [{ id: "interview-1", outcome: "Passed" }],
        timeline: [
          ...appliedApplication.timeline,
          {
            id: "event-2",
            occurredAt: "2026-05-13T02:00:00.000Z",
            description: "Recorded interview outcome: Passed"
          }
        ]
      }
    });
  });
});
