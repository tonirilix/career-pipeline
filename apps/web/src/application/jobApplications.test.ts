import { describe, expect, it, vi } from "vitest";

import type { JobApplicationGateway } from "./ports/jobApplicationGateway";
import {
  addNoteToApplication,
  advanceApplicationStage,
  completeApplicationFollowUpReminder,
  createApplicationFollowUpReminder,
  createSavedOpportunity,
  recordApplicationInterviewOutcome,
  scheduleApplicationInterview
} from "./jobApplications";

describe("job application use cases", () => {
  it("rejects invalid saved opportunities before calling the gateway", async () => {
    const gateway: JobApplicationGateway = {
      listApplications: vi.fn(),
      createSavedOpportunity: vi.fn(),
      advanceApplicationStage: vi.fn(),
      scheduleInterview: vi.fn(),
      recordInterviewOutcome: vi.fn(),
      createFollowUpReminder: vi.fn(),
      completeFollowUpReminder: vi.fn(),
      addApplicationNote: vi.fn()
    };

    const result = await createSavedOpportunity(gateway, {
      company: "",
      roleTitle: "",
      postingUrl: "not-a-url",
      source: "LinkedIn",
      location: "Remote",
      compensation: "$160k-$190k",
      employmentType: "Full-time"
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        { field: "company", message: "Company is required" },
        { field: "roleTitle", message: "Role title is required" },
        { field: "postingUrl", message: "Posting URL must be a valid URL" }
      ]
    });
    expect(gateway.createSavedOpportunity).not.toHaveBeenCalled();
  });

  it("sends valid saved opportunities through the gateway port", async () => {
    const gateway: JobApplicationGateway = {
      listApplications: vi.fn(),
      createSavedOpportunity: vi.fn().mockResolvedValue({
        id: "job-1",
        company: "Linear",
        roleTitle: "Frontend Engineer",
        postingUrl: "https://linear.app/careers/frontend-engineer",
        source: "Referral",
        location: "Remote",
        compensation: "$160k-$190k",
        employmentType: "Full-time",
        stage: "Saved",
        timeline: [],
        interviews: [],
        followUps: [],
        notes: []
      }),
      advanceApplicationStage: vi.fn(),
      scheduleInterview: vi.fn(),
      recordInterviewOutcome: vi.fn(),
      createFollowUpReminder: vi.fn(),
      completeFollowUpReminder: vi.fn(),
      addApplicationNote: vi.fn()
    };

    const result = await createSavedOpportunity(gateway, {
      company: " Linear ",
      roleTitle: " Frontend Engineer ",
      postingUrl: " https://linear.app/careers/frontend-engineer ",
      source: "Referral",
      location: " Remote ",
      compensation: " $160k-$190k ",
      employmentType: "Full-time"
    });

    expect(gateway.createSavedOpportunity).toHaveBeenCalledWith({
      company: "Linear",
      roleTitle: "Frontend Engineer",
      postingUrl: "https://linear.app/careers/frontend-engineer",
      source: "Referral",
      location: "Remote",
      compensation: "$160k-$190k",
      employmentType: "Full-time"
    });
    expect(result).toMatchObject({
      ok: true,
      opportunity: {
        id: "job-1",
        company: "Linear",
        stage: "Saved"
      }
    });
  });

  it("advances applications through the gateway port", async () => {
    const gateway: JobApplicationGateway = {
      listApplications: vi.fn(),
      createSavedOpportunity: vi.fn(),
      advanceApplicationStage: vi.fn().mockResolvedValue({
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
      }),
      scheduleInterview: vi.fn(),
      recordInterviewOutcome: vi.fn(),
      createFollowUpReminder: vi.fn(),
      completeFollowUpReminder: vi.fn(),
      addApplicationNote: vi.fn()
    };

    const result = await advanceApplicationStage(gateway, {
      applicationId: "job-1",
      toStage: "Applied"
    });

    expect(gateway.advanceApplicationStage).toHaveBeenCalledWith({
      applicationId: "job-1",
      toStage: "Applied"
    });
    expect(result).toMatchObject({
      ok: true,
      application: {
        id: "job-1",
        stage: "Applied"
      }
    });
  });

  it("schedules interviews through the gateway port", async () => {
    const gateway: JobApplicationGateway = {
      listApplications: vi.fn(),
      createSavedOpportunity: vi.fn(),
      advanceApplicationStage: vi.fn(),
      recordInterviewOutcome: vi.fn(),
      scheduleInterview: vi.fn().mockResolvedValue({
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
            description: "Scheduled Recruiter screen interview"
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
        followUps: [],
        notes: []
      }),
      createFollowUpReminder: vi.fn(),
      completeFollowUpReminder: vi.fn(),
      addApplicationNote: vi.fn()
    };

    const result = await scheduleApplicationInterview(gateway, {
      applicationId: "job-1",
      type: "Recruiter screen",
      scheduledAt: "2026-05-12T15:00:00.000Z",
      notes: "Ask about team shape"
    });

    expect(gateway.scheduleInterview).toHaveBeenCalledWith({
      applicationId: "job-1",
      type: "Recruiter screen",
      scheduledAt: "2026-05-12T15:00:00.000Z",
      notes: "Ask about team shape"
    });
    expect(result).toMatchObject({
      ok: true,
      application: {
        id: "job-1",
        interviews: [
          {
            type: "Recruiter screen",
            outcome: "Scheduled"
          }
        ]
      }
    });
  });

  it("records interview outcomes through the gateway port", async () => {
    const gateway: JobApplicationGateway = {
      listApplications: vi.fn(),
      createSavedOpportunity: vi.fn(),
      advanceApplicationStage: vi.fn(),
      scheduleInterview: vi.fn(),
      recordInterviewOutcome: vi.fn().mockResolvedValue({
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
            occurredAt: "2026-05-13T01:00:00.000Z",
            description: "Recorded interview outcome: Passed"
          }
        ],
        interviews: [
          {
            id: "interview-1",
            type: "Recruiter screen",
            scheduledAt: "2026-05-12T15:00:00.000Z",
            notes: "Ask about team shape",
            outcome: "Passed"
          }
        ],
        followUps: [],
        notes: []
      }),
      createFollowUpReminder: vi.fn(),
      completeFollowUpReminder: vi.fn(),
      addApplicationNote: vi.fn()
    };

    const result = await recordApplicationInterviewOutcome(gateway, {
      applicationId: "job-1",
      interviewId: "interview-1",
      outcome: "Passed"
    });

    expect(gateway.recordInterviewOutcome).toHaveBeenCalledWith({
      applicationId: "job-1",
      interviewId: "interview-1",
      outcome: "Passed"
    });
    expect(result).toMatchObject({
      ok: true,
      application: {
        id: "job-1",
        interviews: [
          {
            id: "interview-1",
            outcome: "Passed"
          }
        ]
      }
    });
  });

  it("creates follow-up reminders through the gateway port", async () => {
    const gateway: JobApplicationGateway = {
      listApplications: vi.fn(),
      createSavedOpportunity: vi.fn(),
      advanceApplicationStage: vi.fn(),
      scheduleInterview: vi.fn(),
      recordInterviewOutcome: vi.fn(),
      createFollowUpReminder: vi.fn().mockResolvedValue({
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
            occurredAt: "2026-05-10T13:00:00.000Z",
            description: "Created follow-up reminder"
          }
        ],
        interviews: [],
        followUps: [
          {
            id: "follow-up-1",
            applicationId: "job-1",
            dueAt: "2026-05-11T12:00:00.000Z",
            note: "Send recruiter a thank-you note",
            completedAt: null
          }
        ],
        notes: []
      }),
      completeFollowUpReminder: vi.fn(),
      addApplicationNote: vi.fn()
    };

    const result = await createApplicationFollowUpReminder(gateway, {
      applicationId: "job-1",
      dueAt: "2026-05-11T12:00:00.000Z",
      note: "Send recruiter a thank-you note"
    });

    expect(gateway.createFollowUpReminder).toHaveBeenCalledWith({
      applicationId: "job-1",
      dueAt: "2026-05-11T12:00:00.000Z",
      note: "Send recruiter a thank-you note"
    });
    expect(result).toMatchObject({
      ok: true,
      application: {
        id: "job-1",
        followUps: [
          {
            dueAt: "2026-05-11T12:00:00.000Z",
            completedAt: null
          }
        ]
      }
    });
  });

  it("completes follow-up reminders through the gateway port", async () => {
    const gateway: JobApplicationGateway = {
      listApplications: vi.fn(),
      createSavedOpportunity: vi.fn(),
      advanceApplicationStage: vi.fn(),
      scheduleInterview: vi.fn(),
      recordInterviewOutcome: vi.fn(),
      createFollowUpReminder: vi.fn(),
      completeFollowUpReminder: vi.fn().mockResolvedValue({
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
            occurredAt: "2026-05-10T13:00:00.000Z",
            description: "Completed follow-up reminder"
          }
        ],
        interviews: [],
        followUps: [
          {
            id: "follow-up-1",
            applicationId: "job-1",
            dueAt: "2026-05-11T12:00:00.000Z",
            note: "Send recruiter a thank-you note",
            completedAt: "2026-05-10T13:00:00.000Z"
          }
        ],
        notes: []
      }),
      addApplicationNote: vi.fn()
    };

    const result = await completeApplicationFollowUpReminder(gateway, {
      applicationId: "job-1",
      reminderId: "follow-up-1"
    });

    expect(gateway.completeFollowUpReminder).toHaveBeenCalledWith({
      applicationId: "job-1",
      reminderId: "follow-up-1"
    });
    expect(result).toMatchObject({
      ok: true,
      application: {
        id: "job-1",
        followUps: [
          {
            id: "follow-up-1",
            completedAt: "2026-05-10T13:00:00.000Z"
          }
        ]
      }
    });
  });

  it("adds application notes through the gateway port", async () => {
    const gateway: JobApplicationGateway = {
      listApplications: vi.fn(),
      createSavedOpportunity: vi.fn(),
      advanceApplicationStage: vi.fn(),
      scheduleInterview: vi.fn(),
      recordInterviewOutcome: vi.fn(),
      createFollowUpReminder: vi.fn(),
      completeFollowUpReminder: vi.fn(),
      addApplicationNote: vi.fn().mockResolvedValue({
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
            occurredAt: "2026-05-10T13:00:00.000Z",
            description: "Added note"
          }
        ],
        interviews: [],
        followUps: [],
        notes: [
          {
            id: "note-1",
            body: "Recruiter mentioned the team is expanding.",
            createdAt: "2026-05-10T13:00:00.000Z"
          }
        ]
      })
    };

    const result = await addNoteToApplication(gateway, {
      applicationId: "job-1",
      body: "Recruiter mentioned the team is expanding."
    });

    expect(gateway.addApplicationNote).toHaveBeenCalledWith({
      applicationId: "job-1",
      body: "Recruiter mentioned the team is expanding."
    });
    expect(result).toMatchObject({
      ok: true,
      application: {
        id: "job-1",
        notes: [
          {
            body: "Recruiter mentioned the team is expanding."
          }
        ]
      }
    });
  });
});
