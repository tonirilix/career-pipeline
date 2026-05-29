import { describe, expect, it } from "vitest";

import type { JobApplication } from "../domain/jobOpportunity";
import {
  type JobApplicationProjectionControls,
  projectJobApplications
} from "./jobApplicationProjections";

const now = new Date("2026-05-10T12:00:00.000Z").getTime();

const defaultControls: JobApplicationProjectionControls = {
  stageFilter: "All",
  sourceFilter: "All",
  searchTerm: "",
  sortBy: "created"
};

function createApplication(
  application: Partial<JobApplication> &
    Pick<JobApplication, "id" | "company" | "roleTitle">
): JobApplication {
  return {
    id: application.id,
    company: application.company,
    roleTitle: application.roleTitle,
    postingUrl: application.postingUrl ?? "https://example.com/job",
    source: application.source ?? "LinkedIn",
    location: application.location ?? "",
    compensation: application.compensation ?? "",
    employmentType: application.employmentType ?? "Full-time",
    stage: application.stage ?? "Saved",
    timeline: application.timeline ?? [
      {
        id: `${application.id}-saved`,
        occurredAt: "2026-05-01T09:00:00.000Z",
        description: "Saved opportunity"
      }
    ],
    interviews: application.interviews ?? [],
    followUps: application.followUps ?? [],
    notes: application.notes ?? []
  };
}

function project({
  applications,
  controls = {},
  selectedApplicationId = null
}: {
  applications: JobApplication[];
  controls?: Partial<JobApplicationProjectionControls>;
  selectedApplicationId?: string | null;
}) {
  return projectJobApplications({
    applications,
    controls: { ...defaultControls, ...controls },
    now,
    selectedApplicationId
  });
}

describe("projectJobApplications", () => {
  it("derives active application count and per-stage counts", () => {
    const projection = project({
      applications: [
        createApplication({
          id: "linear",
          company: "Linear",
          roleTitle: "Frontend Engineer",
          stage: "Applied"
        }),
        createApplication({
          id: "acme",
          company: "Acme",
          roleTitle: "Platform Engineer",
          stage: "Applied"
        }),
        createApplication({
          id: "rejected",
          company: "Rejected Co",
          roleTitle: "Backend Engineer",
          stage: "Rejected"
        })
      ]
    });

    expect(projection.activeApplicationCount).toBe(2);
    expect(projection.stageCounts.find(({ stage }) => stage === "Applied")).toEqual({
      stage: "Applied",
      count: 2
    });
    expect(projection.stageCounts.find(({ stage }) => stage === "Rejected")).toEqual({
      stage: "Rejected",
      count: 1
    });
  });

  it("applies stage, source, search, and combined filters", () => {
    const applications = [
      createApplication({
        id: "linear",
        company: "Linear",
        roleTitle: "Frontend Engineer",
        source: "LinkedIn",
        stage: "Applied"
      }),
      createApplication({
        id: "acme",
        company: "Acme",
        roleTitle: "Platform Engineer",
        source: "Referral",
        stage: "Screening"
      }),
      createApplication({
        id: "orbit",
        company: "Orbit",
        roleTitle: "Product Engineer",
        source: "Referral",
        stage: "Applied"
      })
    ];

    expect(
      project({ applications, controls: { stageFilter: "Applied" } })
        .visibleApplications.map(({ company }) => company)
    ).toEqual(["Linear", "Orbit"]);
    expect(
      project({ applications, controls: { sourceFilter: "Referral" } })
        .visibleApplications.map(({ company }) => company)
    ).toEqual(["Acme", "Orbit"]);
    expect(
      project({ applications, controls: { searchTerm: "platform" } })
        .visibleApplications.map(({ company }) => company)
    ).toEqual(["Acme"]);
    expect(
      project({
        applications,
        controls: {
          searchTerm: " engineer ",
          sourceFilter: "Referral",
          stageFilter: "Applied"
        }
      }).visibleApplications.map(({ company }) => company)
    ).toEqual(["Orbit"]);
  });

  it("sorts by created order, last activity, and active follow-up date", () => {
    const oldActivity = createApplication({
      id: "old",
      company: "Old Activity",
      roleTitle: "Engineer",
      timeline: [
        {
          id: "old-event",
          occurredAt: "2026-05-01T09:00:00.000Z",
          description: "Saved"
        }
      ],
      followUps: [
        {
          id: "old-follow-up",
          applicationId: "old",
          dueAt: "2026-05-12T09:00:00.000Z",
          note: "Later",
          completedAt: null
        }
      ]
    });
    const recentActivity = createApplication({
      id: "recent",
      company: "Recent Activity",
      roleTitle: "Engineer",
      timeline: [
        {
          id: "recent-event",
          occurredAt: "2026-05-09T09:00:00.000Z",
          description: "Applied"
        }
      ],
      followUps: [
        {
          id: "recent-follow-up",
          applicationId: "recent",
          dueAt: "2026-05-11T09:00:00.000Z",
          note: "Sooner",
          completedAt: null
        }
      ]
    });
    const noFollowUp = createApplication({
      id: "none",
      company: "No Follow Up",
      roleTitle: "Engineer",
      timeline: [
        {
          id: "invalid-event",
          occurredAt: "not-a-date",
          description: "Invalid date"
        }
      ],
      followUps: [
        {
          id: "completed-follow-up",
          applicationId: "none",
          dueAt: "2026-05-10T09:00:00.000Z",
          note: "Completed",
          completedAt: "2026-05-09T09:00:00.000Z"
        }
      ]
    });
    const applications = [oldActivity, recentActivity, noFollowUp];

    expect(
      project({ applications, controls: { sortBy: "created" } })
        .visibleApplications.map(({ company }) => company)
    ).toEqual(["Old Activity", "Recent Activity", "No Follow Up"]);
    expect(
      project({ applications, controls: { sortBy: "lastActivity" } })
        .visibleApplications.map(({ company }) => company)
    ).toEqual(["Recent Activity", "Old Activity", "No Follow Up"]);
    expect(
      project({ applications, controls: { sortBy: "followUpDate" } })
        .visibleApplications.map(({ company }) => company)
    ).toEqual(["Recent Activity", "Old Activity", "No Follow Up"]);
  });

  it("groups selected application and follow-up work using explicit time input", () => {
    const linear = createApplication({
      id: "linear",
      company: "Linear",
      roleTitle: "Frontend Engineer",
      stage: "Applied",
      followUps: [
        {
          id: "upcoming",
          applicationId: "linear",
          dueAt: "2026-05-11T12:00:00.000Z",
          note: "Upcoming",
          completedAt: null
        },
        {
          id: "completed",
          applicationId: "linear",
          dueAt: "2026-05-09T12:00:00.000Z",
          note: "Completed",
          completedAt: "2026-05-09T13:00:00.000Z"
        }
      ]
    });
    const acme = createApplication({
      id: "acme",
      company: "Acme",
      roleTitle: "Platform Engineer",
      stage: "Screening",
      followUps: [
        {
          id: "overdue",
          applicationId: "acme",
          dueAt: "2026-05-09T12:00:00.000Z",
          note: "Overdue",
          completedAt: null
        },
        {
          id: "invalid",
          applicationId: "acme",
          dueAt: "not-a-date",
          note: "Invalid date",
          completedAt: null
        }
      ]
    });
    const rejected = createApplication({
      id: "rejected",
      company: "Rejected Co",
      roleTitle: "Engineer",
      stage: "Rejected",
      followUps: [
        {
          id: "closed-overdue",
          applicationId: "rejected",
          dueAt: "2026-05-09T12:00:00.000Z",
          note: "Closed",
          completedAt: null
        }
      ]
    });

    const projection = project({
      applications: [linear, acme, rejected],
      selectedApplicationId: "acme"
    });

    expect(projection.selectedApplication).toBe(acme);
    expect(
      projection.overdueFollowUpItems.map(({ application, followUp }) => [
        application.company,
        followUp.id
      ])
    ).toEqual([["Acme", "overdue"]]);
    expect(
      projection.upcomingFollowUpItems.map(({ application, followUp }) => [
        application.company,
        followUp.id
      ])
    ).toEqual([["Linear", "upcoming"]]);
  });
});
