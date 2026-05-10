import { describe, expect, it, vi } from "vitest";

import type { JobApplicationGateway } from "./ports/jobApplicationGateway";
import {
  advanceApplicationStage,
  createSavedOpportunity,
  scheduleApplicationInterview
} from "./jobApplications";

describe("job application use cases", () => {
  it("rejects invalid saved opportunities before calling the gateway", async () => {
    const gateway: JobApplicationGateway = {
      listApplications: vi.fn(),
      createSavedOpportunity: vi.fn(),
      advanceApplicationStage: vi.fn(),
      scheduleInterview: vi.fn()
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
        timeline: []
      }),
      advanceApplicationStage: vi.fn(),
      scheduleInterview: vi.fn()
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
        ]
      }),
      scheduleInterview: vi.fn()
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
        ]
      })
    };

    const result = await scheduleApplicationInterview(gateway, {
      applicationId: "job-1",
      type: "Recruiter screen",
      scheduledAt: "2026-05-12T15:00:00.000Z",
      notes: "Ask about team shape",
      outcome: "Scheduled"
    });

    expect(gateway.scheduleInterview).toHaveBeenCalledWith({
      applicationId: "job-1",
      type: "Recruiter screen",
      scheduledAt: "2026-05-12T15:00:00.000Z",
      notes: "Ask about team shape",
      outcome: "Scheduled"
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
});
