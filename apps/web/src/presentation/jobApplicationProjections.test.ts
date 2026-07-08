import { describe, expect, it } from "vitest";

import type { JobApplication } from "../domain/jobOpportunity";
import {
  type JobApplicationProjectionControls,
  projectJobApplications
} from "./jobApplicationProjections";
import type { PipelineSavedView } from "./pipelineSavedViews";

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
  savedView,
  selectedApplicationId = null
}: {
  applications: JobApplication[];
  controls?: Partial<JobApplicationProjectionControls>;
  savedView?: PipelineSavedView;
  selectedApplicationId?: string | null;
}) {
  return projectJobApplications({
    applications,
    controls: { ...defaultControls, ...controls },
    now,
    savedView,
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

  it("applies each pipeline saved view to visible applications and counts", () => {
    const applications = [
      createApplication({
        id: "saved",
        company: "Saved Co",
        roleTitle: "Frontend Engineer",
        stage: "Saved"
      }),
      createApplication({
        id: "screening",
        company: "Screening Co",
        roleTitle: "Platform Engineer",
        stage: "Screening"
      }),
      createApplication({
        id: "technical",
        company: "Technical Co",
        roleTitle: "Product Engineer",
        stage: "Technical interview",
        followUps: [
          {
            id: "technical-follow-up",
            applicationId: "technical",
            dueAt: "2026-05-11T09:00:00.000Z",
            note: "Send architecture notes",
            completedAt: null
          }
        ]
      }),
      createApplication({
        id: "offer",
        company: "Offer Co",
        roleTitle: "Staff Engineer",
        stage: "Offer"
      }),
      createApplication({
        id: "rejected",
        company: "Rejected Co",
        roleTitle: "Backend Engineer",
        stage: "Rejected"
      }),
      createApplication({
        id: "withdrawn",
        company: "Withdrawn Co",
        roleTitle: "Design Engineer",
        stage: "Withdrawn"
      })
    ];

    expect(
      project({ applications, savedView: "needs-attention" })
        .visibleApplications.map(({ company }) => company)
    ).toEqual(["Technical Co"]);
    expect(
      project({ applications, savedView: "active" })
        .visibleApplications.map(({ company }) => company)
    ).toEqual(["Saved Co", "Screening Co", "Technical Co", "Offer Co"]);
    expect(
      project({ applications, savedView: "interviewing" })
        .visibleApplications.map(({ company }) => company)
    ).toEqual(["Screening Co", "Technical Co"]);
    expect(
      project({ applications, savedView: "offers" })
        .visibleApplications.map(({ company }) => company)
    ).toEqual(["Offer Co"]);
    expect(
      project({ applications, savedView: "closed" })
        .visibleApplications.map(({ company }) => company)
    ).toEqual(["Rejected Co", "Withdrawn Co"]);
    expect(
      project({ applications, savedView: "all" })
        .visibleApplications.map(({ company }) => company)
    ).toEqual([
      "Saved Co",
      "Screening Co",
      "Technical Co",
      "Offer Co",
      "Rejected Co",
      "Withdrawn Co"
    ]);
    expect(project({ applications }).savedViewCounts).toEqual({
      "needs-attention": 1,
      active: 4,
      interviewing: 2,
      offers: 1,
      closed: 2,
      all: 6
    });
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
