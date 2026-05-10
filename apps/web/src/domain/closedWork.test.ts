import { describe, expect, it } from "vitest";

import type { JobApplication } from "./jobOpportunity";
import {
  filterActionableFollowUpReminders,
  isActiveApplication,
  isClosedApplication
} from "./closedWork";
import { transitionApplicationStage } from "./stageTransition";

const baseApplication: JobApplication = {
  id: "job-1",
  company: "Linear",
  roleTitle: "Frontend Engineer",
  postingUrl: "https://linear.app/careers/frontend-engineer",
  source: "Referral",
  location: "Remote",
  compensation: "$160k-$190k",
  employmentType: "Full-time",
  stage: "Applied",
  timeline: [],
  interviews: []
};

describe("closed work", () => {
  it("treats rejected and withdrawn applications as closed work", () => {
    expect(isClosedApplication({ ...baseApplication, stage: "Rejected" })).toBe(
      true
    );
    expect(isClosedApplication({ ...baseApplication, stage: "Withdrawn" })).toBe(
      true
    );
    expect(isActiveApplication({ ...baseApplication, stage: "Applied" })).toBe(
      true
    );
    expect(isActiveApplication({ ...baseApplication, stage: "Rejected" })).toBe(
      false
    );
  });

  it("suppresses active reminders for closed applications", () => {
    const reminders = [
      {
        id: "reminder-1",
        applicationId: "active-job",
        dueAt: "2026-05-11T12:00:00.000Z",
        completedAt: null
      },
      {
        id: "reminder-2",
        applicationId: "rejected-job",
        dueAt: "2026-05-11T12:00:00.000Z",
        completedAt: null
      },
      {
        id: "reminder-3",
        applicationId: "withdrawn-job",
        dueAt: "2026-05-11T12:00:00.000Z",
        completedAt: null
      },
      {
        id: "reminder-4",
        applicationId: "active-job",
        dueAt: "2026-05-11T12:00:00.000Z",
        completedAt: "2026-05-10T12:00:00.000Z"
      }
    ];

    const actionable = filterActionableFollowUpReminders(
      [
        { ...baseApplication, id: "active-job", stage: "Applied" },
        { ...baseApplication, id: "rejected-job", stage: "Rejected" },
        { ...baseApplication, id: "withdrawn-job", stage: "Withdrawn" }
      ],
      reminders
    );

    expect(actionable).toEqual([reminders[0]]);
  });

  it("restores active work status when a closed application is reopened", () => {
    const result = transitionApplicationStage(
      { ...baseApplication, stage: "Withdrawn" },
      { applicationId: "job-1", toStage: "Applied" },
      {
        id: "event-1",
        occurredAt: "2026-05-10T12:00:00.000Z",
        description: "Moved from Withdrawn to Applied"
      }
    );

    expect(result).toMatchObject({
      ok: true,
      application: {
        stage: "Applied"
      }
    });

    if (result.ok) {
      expect(isActiveApplication(result.application)).toBe(true);
    }
  });
});
