import { describe, expect, it } from "vitest";

import type { ApplicationStage } from "../domain/applicationStage";
import type {
  FollowUpReminder,
  Interview,
  JobApplication
} from "../domain/jobOpportunity";
import type { RoleRecord } from "../domain/roleDiscovery";
import { projectJobApplications } from "./jobApplicationProjections";
import { projectToday, type TodayItem } from "./todayProjections";

const NOW = new Date("2026-09-06T09:00:00.000Z").getTime();
const DAY = 24 * 60 * 60 * 1000;

function at(offsetDays: number) {
  return new Date(NOW + offsetDays * DAY).toISOString();
}

function createApplication(
  overrides: Partial<JobApplication> & Pick<JobApplication, "id">
): JobApplication {
  return {
    id: overrides.id,
    company: overrides.company ?? "Acme",
    roleTitle: overrides.roleTitle ?? "Frontend Engineer",
    postingUrl: "https://example.com/job",
    source: "LinkedIn",
    location: "",
    compensation: "",
    employmentType: "Full-time",
    stage: overrides.stage ?? "Applied",
    timeline: overrides.timeline ?? [
      {
        id: `${overrides.id}-created`,
        occurredAt: at(-9),
        description: "Saved opportunity"
      }
    ],
    interviews: overrides.interviews ?? [],
    followUps: overrides.followUps ?? [],
    notes: overrides.notes ?? []
  };
}

function createFollowUp(
  overrides: Partial<FollowUpReminder> & Pick<FollowUpReminder, "id" | "dueAt">
): FollowUpReminder {
  return {
    id: overrides.id,
    applicationId: overrides.applicationId ?? "app-1",
    dueAt: overrides.dueAt,
    note: overrides.note ?? "Check in with the recruiter",
    completedAt: overrides.completedAt ?? null
  };
}

function createInterview(
  overrides: Partial<Interview> & Pick<Interview, "id" | "scheduledAt">
): Interview {
  return {
    id: overrides.id,
    type: overrides.type ?? "Technical",
    scheduledAt: overrides.scheduledAt,
    notes: "",
    outcome: overrides.outcome ?? "Scheduled"
  };
}

function createRole(
  overrides: Partial<RoleRecord> & Pick<RoleRecord, "id">
): RoleRecord {
  return {
    id: overrides.id,
    searchTopicId: null,
    company: overrides.company ?? "Northwind",
    title: overrides.title ?? "Staff Engineer",
    postingUrl: "https://example.com/role",
    source: "",
    sourceKind: "Search result",
    providerSource: "",
    description: "",
    rawSourceText: "",
    location: "",
    remoteEligibility: "Unknown",
    employmentType: "Full-time",
    seniority: "Senior",
    compensation: "",
    stack: "",
    companyType: "Product",
    freshnessStatus: "Live",
    freshnessCheckedAt: null,
    decisionStatus: overrides.decisionStatus ?? "New",
    rejectionReason: "",
    promotedApplicationId: null,
    metadata: "",
    createdAt: overrides.createdAt ?? at(-2),
    updatedAt: at(-2)
  };
}

function applicationWithFollowUpDue(id: string, dueOffsetDays: number) {
  return createApplication({
    id,
    followUps: [
      createFollowUp({
        id: `${id}-reminder`,
        applicationId: id,
        dueAt: at(dueOffsetDays)
      })
    ]
  });
}

function ids(items: TodayItem[]) {
  return items.map((item) => item.id);
}

describe("projectToday grouping", () => {
  it("puts an overdue item in Now and marks it overdue", () => {
    const projection = projectToday({
      applications: [applicationWithFollowUpDue("app-1", -2)],
      now: NOW
    });

    expect(ids(projection.now)).toEqual(["follow-up:app-1-reminder"]);
    expect(projection.now[0].isOverdue).toBe(true);
  });

  it("puts an item due today in Now", () => {
    const projection = projectToday({
      applications: [applicationWithFollowUpDue("app-1", 0)],
      now: NOW
    });

    expect(ids(projection.now)).toEqual(["follow-up:app-1-reminder"]);
    expect(projection.now[0].isOverdue).toBe(false);
  });

  it("puts an item due in exactly three days in Now", () => {
    const projection = projectToday({
      applications: [applicationWithFollowUpDue("app-1", 3)],
      now: NOW
    });

    expect(ids(projection.now)).toEqual(["follow-up:app-1-reminder"]);
    expect(projection.thisWeek).toEqual([]);
  });

  it("puts an item due after three days but within the week in This week", () => {
    const projection = projectToday({
      applications: [applicationWithFollowUpDue("app-1", 4)],
      now: NOW
    });

    expect(projection.now).toEqual([]);
    expect(ids(projection.thisWeek)).toEqual(["follow-up:app-1-reminder"]);
  });

  it("puts an item due in exactly seven days in This week", () => {
    const projection = projectToday({
      applications: [applicationWithFollowUpDue("app-1", 7)],
      now: NOW
    });

    expect(ids(projection.thisWeek)).toEqual(["follow-up:app-1-reminder"]);
    expect(projection.waiting).toEqual([]);
  });

  it("puts an item due beyond the week in Waiting", () => {
    const projection = projectToday({
      applications: [applicationWithFollowUpDue("app-1", 9)],
      now: NOW
    });

    expect(projection.now).toEqual([]);
    expect(projection.thisWeek).toEqual([]);
    expect(ids(projection.waiting)).toEqual(["follow-up:app-1-reminder"]);
  });

  it("counts Now and This week as the actionable total, excluding Waiting", () => {
    const projection = projectToday({
      applications: [
        applicationWithFollowUpDue("app-1", -1),
        applicationWithFollowUpDue("app-2", 5),
        applicationWithFollowUpDue("app-3", 30)
      ],
      now: NOW
    });

    expect(projection.actionableCount).toBe(2);
    expect(projection.waiting).toHaveLength(1);
  });

  it("returns empty groups when there is nothing to derive", () => {
    const projection = projectToday({ applications: [], now: NOW });

    expect(projection).toEqual({
      now: [],
      thisWeek: [],
      waiting: [],
      actionableCount: 0
    });
  });
});

describe("projectToday item types", () => {
  it("derives a Follow-up from an incomplete reminder", () => {
    const projection = projectToday({
      applications: [applicationWithFollowUpDue("app-1", -1)],
      now: NOW
    });

    expect(projection.now[0]).toMatchObject({
      type: "Follow-up",
      action: "Follow up",
      company: "Acme",
      roleTitle: "Frontend Engineer",
      stage: "Applied",
      followUpId: "app-1-reminder"
    });
  });

  it("omits a completed reminder", () => {
    const application = createApplication({
      id: "app-1",
      followUps: [
        createFollowUp({
          id: "done",
          dueAt: at(-1),
          completedAt: at(-1)
        })
      ]
    });

    const projection = projectToday({ applications: [application], now: NOW });

    expect(projection.actionableCount).toBe(0);
  });

  it("omits reminders on closed applications", () => {
    const application = createApplication({
      id: "app-1",
      stage: "Rejected",
      followUps: [createFollowUp({ id: "reminder", dueAt: at(-1) })]
    });

    const projection = projectToday({ applications: [application], now: NOW });

    expect(projection.actionableCount).toBe(0);
  });

  it("derives a Prep item from a future interview and none from a past one", () => {
    const application = createApplication({
      id: "app-1",
      stage: "Screening",
      interviews: [
        createInterview({ id: "future", scheduledAt: at(2) }),
        createInterview({ id: "past", scheduledAt: at(-2) })
      ]
    });

    const projection = projectToday({ applications: [application], now: NOW });

    expect(ids(projection.now)).toEqual(["prep:future"]);
    expect(projection.now[0]).toMatchObject({
      type: "Prep",
      action: "Prepare for Technical",
      interviewId: "future",
      isOverdue: false
    });
  });

  it("derives an Approval from a Saved application", () => {
    const projection = projectToday({
      applications: [createApplication({ id: "app-1", stage: "Saved" })],
      now: NOW
    });

    expect(ids(projection.thisWeek)).toEqual(["approval:app-1"]);
    expect(projection.thisWeek[0]).toMatchObject({
      type: "Approval",
      action: "Submit application",
      dueAt: null
    });
  });

  it("derives an Offer from an Offer-stage application", () => {
    const projection = projectToday({
      applications: [createApplication({ id: "app-1", stage: "Offer" })],
      now: NOW
    });

    expect(ids(projection.thisWeek)).toEqual(["offer:app-1"]);
    expect(projection.thisWeek[0]).toMatchObject({
      type: "Offer",
      action: "Decide on offer",
      dueAt: null
    });
  });

  it("derives a Triage from an undecided role only", () => {
    const projection = projectToday({
      applications: [],
      roles: [
        createRole({ id: "role-1" }),
        createRole({ id: "role-2", decisionStatus: "Rejected" })
      ],
      now: NOW
    });

    expect(ids(projection.thisWeek)).toEqual(["triage:role-1"]);
    expect(projection.thisWeek[0]).toMatchObject({
      type: "Triage",
      action: "Triage role",
      company: "Northwind",
      roleTitle: "Staff Engineer",
      stage: null,
      dueAt: null
    });
  });
});

describe("projectToday due indicators and rationale", () => {
  it("leaves the due indicator empty for Approval, Offer, and Triage", () => {
    const projection = projectToday({
      applications: [
        createApplication({ id: "saved", stage: "Saved" }),
        createApplication({ id: "offer", stage: "Offer" })
      ],
      roles: [createRole({ id: "role-1" })],
      now: NOW
    });

    for (const item of projection.thisWeek) {
      expect(item.dueAt).toBeNull();
      expect(item.isOverdue).toBe(false);
    }
  });

  it("does not put elapsed time in the due indicator of a dateless item", () => {
    const projection = projectToday({
      applications: [createApplication({ id: "offer", stage: "Offer" })],
      now: NOW
    });

    expect(projection.thisWeek[0].dueAt).toBeNull();
    expect(projection.thisWeek[0].rationale).toContain("last activity 9 days ago");
  });

  it("states computed facts in the rationale of an overdue follow-up", () => {
    const projection = projectToday({
      applications: [applicationWithFollowUpDue("app-1", -3)],
      now: NOW
    });

    expect(projection.now[0].rationale).toBe(
      "Follow-up was due 3 days ago; last activity 9 days ago."
    );
  });

  it("states computed facts in the rationale of an upcoming follow-up", () => {
    const projection = projectToday({
      applications: [applicationWithFollowUpDue("app-1", 1)],
      now: NOW
    });

    expect(projection.now[0].rationale).toBe(
      "Follow-up due tomorrow; last activity 9 days ago."
    );
  });

  it("states when a Saved application was saved and that it is unsubmitted", () => {
    const projection = projectToday({
      applications: [createApplication({ id: "app-1", stage: "Saved" })],
      now: NOW
    });

    expect(projection.thisWeek[0].rationale).toBe(
      "Saved 9 days ago; not submitted yet."
    );
  });
});

describe("projectToday ordering", () => {
  it("orders dated items by due proximity, soonest first", () => {
    const projection = projectToday({
      applications: [
        applicationWithFollowUpDue("app-late", 3),
        applicationWithFollowUpDue("app-early", -2),
        applicationWithFollowUpDue("app-middle", 1)
      ],
      now: NOW
    });

    expect(ids(projection.now)).toEqual([
      "follow-up:app-early-reminder",
      "follow-up:app-middle-reminder",
      "follow-up:app-late-reminder"
    ]);
  });

  it("orders every dated item before every dateless item in a group", () => {
    const projection = projectToday({
      applications: [
        createApplication({ id: "saved", stage: "Saved" }),
        applicationWithFollowUpDue("app-1", 5),
        createApplication({ id: "offer", stage: "Offer" }),
        applicationWithFollowUpDue("app-2", 6)
      ],
      now: NOW
    });

    const dated = projection.thisWeek.filter((item) => item.dueAt !== null);
    const dateless = projection.thisWeek.filter((item) => item.dueAt === null);

    expect(projection.thisWeek).toEqual([...dated, ...dateless]);
    expect(dated).toHaveLength(2);
    expect(dateless).toHaveLength(2);
  });
});

describe("projectToday is independent of pipeline controls", () => {
  const applications = [
    applicationWithFollowUpDue("app-1", -1),
    createApplication({
      id: "app-2",
      company: "Globex",
      stage: "Saved",
      source: "Referral"
    }),
    createApplication({ id: "app-3", company: "Initech", stage: "Offer" })
  ];

  const unfiltered = projectToday({ applications, now: NOW });

  const controlSets = [
    {
      label: "a search term",
      controls: {
        searchTerm: "globex",
        stageFilter: "All" as const,
        sourceFilter: "All" as const,
        sortBy: "created" as const
      }
    },
    {
      label: "a stage filter",
      controls: {
        searchTerm: "",
        stageFilter: "Offer" as ApplicationStage,
        sourceFilter: "All" as const,
        sortBy: "created" as const
      }
    },
    {
      label: "a source filter",
      controls: {
        searchTerm: "",
        stageFilter: "All" as const,
        sourceFilter: "Referral" as const,
        sortBy: "created" as const
      }
    },
    {
      label: "a sort option",
      controls: {
        searchTerm: "",
        stageFilter: "All" as const,
        sourceFilter: "All" as const,
        sortBy: "followUpDate" as const
      }
    }
  ];

  for (const { label, controls } of controlSets) {
    it(`derives the same items with ${label} applied`, () => {
      const pipeline = projectJobApplications({
        applications,
        controls,
        now: NOW,
        selectedApplicationId: null
      });

      // The control genuinely narrows Pipeline...
      expect(pipeline.visibleApplications.length).toBeLessThanOrEqual(
        applications.length
      );

      // ...and leaves Today untouched, because Today reads the raw list.
      expect(projectToday({ applications, now: NOW })).toEqual(unfiltered);
    });
  }

  it("derives the same items regardless of the selected saved view", () => {
    for (const savedView of ["all", "needs-attention", "offers", "closed"] as const) {
      const pipeline = projectJobApplications({
        applications,
        controls: {
          searchTerm: "",
          stageFilter: "All",
          sourceFilter: "All",
          sortBy: "created"
        },
        now: NOW,
        savedView,
        selectedApplicationId: null
      });

      expect(pipeline.visibleApplications.length).toBeLessThanOrEqual(
        applications.length
      );
      expect(projectToday({ applications, now: NOW })).toEqual(unfiltered);
    }
  });
});
