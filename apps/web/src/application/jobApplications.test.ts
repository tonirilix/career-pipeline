import { describe, expect, it, vi } from "vitest";

import type { JobApplicationGateway } from "./ports/jobApplicationGateway";
import { createSavedOpportunity } from "./jobApplications";

describe("job application use cases", () => {
  it("rejects invalid saved opportunities before calling the gateway", async () => {
    const gateway: JobApplicationGateway = {
      listSavedOpportunities: vi.fn(),
      createSavedOpportunity: vi.fn()
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
      listSavedOpportunities: vi.fn(),
      createSavedOpportunity: vi.fn().mockResolvedValue({
        id: "job-1",
        company: "Linear",
        roleTitle: "Frontend Engineer",
        postingUrl: "https://linear.app/careers/frontend-engineer",
        source: "Referral",
        location: "Remote",
        compensation: "$160k-$190k",
        employmentType: "Full-time",
        stage: "Saved"
      })
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
});
