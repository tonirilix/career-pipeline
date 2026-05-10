import { describe, expect, it } from "vitest";

import type { JobApplication } from "./jobOpportunity";
import {
  classifyActiveFollowUps,
  completeFollowUpReminder,
  createFollowUpReminder,
  sortFollowUpsByDueDate
} from "./followUpReminder";

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
  followUps: []
};

describe("follow-up reminders", () => {
  it("creates a follow-up reminder after the latest interaction", () => {
    const result = createFollowUpReminder(
      application,
      {
        applicationId: "job-1",
        dueAt: "2026-05-11T12:00:00.000Z",
        note: "Send recruiter a thank-you note"
      },
      {
        reminderId: "follow-up-1",
        timelineEventId: "event-2",
        occurredAt: "2026-05-10T13:00:00.000Z"
      }
    );

    expect(result).toEqual({
      ok: true,
      application: {
        ...application,
        followUps: [
          {
            id: "follow-up-1",
            applicationId: "job-1",
            dueAt: "2026-05-11T12:00:00.000Z",
            note: "Send recruiter a thank-you note",
            completedAt: null
          }
        ],
        timeline: [
          ...application.timeline,
          {
            id: "event-2",
            occurredAt: "2026-05-10T13:00:00.000Z",
            description: "Created follow-up reminder"
          }
        ]
      }
    });
  });

  it("rejects a follow-up due at or before the latest interaction", () => {
    const result = createFollowUpReminder(
      application,
      {
        applicationId: "job-1",
        dueAt: "2026-05-10T12:00:00.000Z",
        note: "Send recruiter a thank-you note"
      },
      {
        reminderId: "follow-up-1",
        timelineEventId: "event-2",
        occurredAt: "2026-05-10T13:00:00.000Z"
      }
    );

    expect(result).toEqual({
      ok: false,
      failure: {
        message: "Follow-up due date must be after the latest interaction."
      }
    });
  });

  it("rejects a follow-up without a due date", () => {
    const result = createFollowUpReminder(
      application,
      {
        applicationId: "job-1",
        dueAt: "",
        note: "Send recruiter a thank-you note"
      },
      {
        reminderId: "follow-up-1",
        timelineEventId: "event-2",
        occurredAt: "2026-05-10T13:00:00.000Z"
      }
    );

    expect(result).toEqual({
      ok: false,
      failure: { message: "Follow-up due date is required." }
    });
  });

  it("classifies active follow-ups as upcoming or overdue", () => {
    const followUps = [
      {
        id: "follow-up-1",
        applicationId: "job-1",
        dueAt: "2026-05-10T10:00:00.000Z",
        note: "Overdue note",
        completedAt: null
      },
      {
        id: "follow-up-2",
        applicationId: "job-1",
        dueAt: "2026-05-11T10:00:00.000Z",
        note: "Upcoming note",
        completedAt: null
      },
      {
        id: "follow-up-3",
        applicationId: "job-1",
        dueAt: "2026-05-09T10:00:00.000Z",
        note: "Completed note",
        completedAt: "2026-05-09T11:00:00.000Z"
      }
    ];

    expect(
      classifyActiveFollowUps(followUps, "2026-05-10T12:00:00.000Z")
    ).toEqual({
      overdue: [followUps[0]],
      upcoming: [followUps[1]]
    });
  });

  it("marks a follow-up complete and appends a timeline event", () => {
    const result = completeFollowUpReminder(
      {
        ...application,
        followUps: [
          {
            id: "follow-up-1",
            applicationId: "job-1",
            dueAt: "2026-05-11T12:00:00.000Z",
            note: "Send recruiter a thank-you note",
            completedAt: null
          }
        ]
      },
      {
        applicationId: "job-1",
        reminderId: "follow-up-1"
      },
      {
        timelineEventId: "event-2",
        completedAt: "2026-05-10T13:00:00.000Z"
      }
    );

    expect(result).toEqual({
      ok: true,
      application: {
        ...application,
        followUps: [
          {
            id: "follow-up-1",
            applicationId: "job-1",
            dueAt: "2026-05-11T12:00:00.000Z",
            note: "Send recruiter a thank-you note",
            completedAt: "2026-05-10T13:00:00.000Z"
          }
        ],
        timeline: [
          ...application.timeline,
          {
            id: "event-2",
            occurredAt: "2026-05-10T13:00:00.000Z",
            description: "Completed follow-up reminder"
          }
        ]
      }
    });
  });

  it("sorts follow-ups by due date", () => {
    const later = {
      id: "follow-up-1",
      applicationId: "job-1",
      dueAt: "2026-05-12T12:00:00.000Z",
      note: "Later",
      completedAt: null
    };
    const earlier = {
      id: "follow-up-2",
      applicationId: "job-1",
      dueAt: "2026-05-11T12:00:00.000Z",
      note: "Earlier",
      completedAt: null
    };

    expect(sortFollowUpsByDueDate([later, earlier])).toEqual([earlier, later]);
  });
});
