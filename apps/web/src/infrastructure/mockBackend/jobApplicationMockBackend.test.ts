import { afterEach, describe, expect, it, vi } from "vitest";

import { JobApplicationMockBackend } from "./jobApplicationMockBackend";

afterEach(() => {
  vi.useRealTimers();
});

describe("JobApplicationMockBackend", () => {
  it("creates applications with generated ids, timestamps, and initial timeline", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-10T12:00:00.000Z"));
    const backend = new JobApplicationMockBackend();

    const application = backend.createSavedOpportunity({
      company: "Linear",
      roleTitle: "Frontend Engineer",
      postingUrl: "https://linear.app/careers/frontend-engineer",
      source: "Referral",
      location: "Remote",
      compensation: "$160k-$190k",
      employmentType: "Full-time"
    });

    expect(application).toMatchObject({
      id: "1",
      company: "Linear",
      stage: "Saved",
      timeline: [
        {
          id: "1",
          occurredAt: "2026-05-10T12:00:00.000Z",
          description: "Saved opportunity"
        }
      ]
    });
    expect(backend.listApplications()).toEqual([application]);
  });

  it("executes stage, interview, follow-up, completion, and note workflows", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-10T12:00:00.000Z"));
    const backend = new JobApplicationMockBackend();
    const saved = backend.createSavedOpportunity({
      company: "Linear",
      roleTitle: "Frontend Engineer",
      postingUrl: "https://linear.app/careers/frontend-engineer",
      source: "Referral",
      location: "Remote",
      compensation: "$160k-$190k",
      employmentType: "Full-time"
    });

    const applied = backend.advanceApplicationStage({
      applicationId: saved.id,
      toStage: "Applied"
    });
    const withInterview = backend.scheduleInterview({
      applicationId: saved.id,
      type: "Recruiter screen",
      scheduledAt: "2026-05-12T15:00:00.000Z",
      notes: "Ask about team shape"
    });
    const withOutcome = backend.recordInterviewOutcome({
      applicationId: saved.id,
      interviewId: withInterview.interviews[0].id,
      outcome: "Passed"
    });
    const withFollowUp = backend.createFollowUpReminder({
      applicationId: saved.id,
      dueAt: "2026-05-13T12:00:00.000Z",
      note: "Send thank-you"
    });
    const completed = backend.completeFollowUpReminder({
      applicationId: saved.id,
      reminderId: withFollowUp.followUps[0].id
    });
    const withNote = backend.addApplicationNote({
      applicationId: saved.id,
      body: "Recruiter was helpful."
    });

    expect(applied.stage).toBe("Applied");
    expect(withInterview.interviews[0]).toMatchObject({ id: "1", outcome: "Scheduled" });
    expect(withOutcome.interviews[0]).toMatchObject({ id: "1", outcome: "Passed" });
    expect(withFollowUp.followUps[0]).toMatchObject({ id: "1" });
    expect(completed.followUps[0].completedAt).toBe("2026-05-10T12:00:00.000Z");
    expect(withNote.notes[0]).toMatchObject({ id: "1", body: "Recruiter was helpful." });
    expect(withNote.timeline).toHaveLength(7);
  });

  it("raises domain workflow failures as errors", () => {
    const backend = new JobApplicationMockBackend();
    const saved = backend.createSavedOpportunity({
      company: "Linear",
      roleTitle: "Frontend Engineer",
      postingUrl: "https://linear.app/careers/frontend-engineer",
      source: "Referral",
      location: "Remote",
      compensation: "$160k-$190k",
      employmentType: "Full-time"
    });

    expect(() =>
      backend.advanceApplicationStage({
        applicationId: saved.id,
        toStage: "Offer"
      })
    ).toThrow("Cannot move an application from Saved to Offer.");
  });
});
