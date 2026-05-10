import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  createSavedOpportunity,
  listSavedOpportunities
} from "../application/jobApplications";
import type { JobApplicationGateway } from "../application/ports/jobApplicationGateway";
import { applicationStages } from "../domain/applicationStage";
import {
  type CreateSavedJobOpportunityCommand,
  type FieldError,
  employmentTypes,
  jobSources,
  type SavedJobOpportunity
} from "../domain/jobOpportunity";
import "./App.css";

type AppProps = {
  gateway: JobApplicationGateway;
};

export function App({ gateway }: AppProps) {
  const stableGateway = useMemo(() => gateway, [gateway]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [opportunities, setOpportunities] = useState<SavedJobOpportunity[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateSavedJobOpportunityCommand>({
    company: "",
    roleTitle: "",
    postingUrl: "",
    source: "LinkedIn",
    location: "",
    compensation: "",
    employmentType: "Full-time"
  });

  useEffect(() => {
    let isMounted = true;

    void listSavedOpportunities(stableGateway)
      .then((savedOpportunities) => {
        if (isMounted) {
          setOpportunities(savedOpportunities);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCommandError("Could not load saved opportunities.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [stableGateway]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors([]);
    setCommandError(null);

    try {
      const result = await createSavedOpportunity(stableGateway, form);

      if (!result.ok) {
        setFieldErrors(result.errors);
        return;
      }

      setOpportunities((current) => [...current, result.opportunity]);
      setIsFormOpen(false);
      setForm({
        company: "",
        roleTitle: "",
        postingUrl: "",
        source: "LinkedIn",
        location: "",
        compensation: "",
        employmentType: "Full-time"
      });
    } catch {
      setCommandError("Could not save the opportunity. Try again.");
    }
  }

  const savedOpportunities = opportunities.filter(
    (opportunity) => opportunity.stage === "Saved"
  );

  return (
    <main className="app-shell">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Pipeline workspace</p>
          <h1>Job Application Tracker</h1>
        </div>
        <button type="button" onClick={() => setIsFormOpen(true)}>
          Add opportunity
        </button>
      </header>

      {isFormOpen ? (
        <section aria-label="New saved opportunity" className="entry-panel">
          <form noValidate onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Company
                <input
                  name="company"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      company: event.target.value
                    }))
                  }
                  value={form.company}
                />
              </label>
              <label>
                Role title
                <input
                  name="roleTitle"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      roleTitle: event.target.value
                    }))
                  }
                  value={form.roleTitle}
                />
              </label>
              <label>
                Posting URL
                <input
                  name="postingUrl"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      postingUrl: event.target.value
                    }))
                  }
                  type="url"
                  value={form.postingUrl}
                />
              </label>
              <label>
                Source
                <select
                  name="source"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      source: event.target.value as CreateSavedJobOpportunityCommand["source"]
                    }))
                  }
                  value={form.source}
                >
                  {jobSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Location
                <input
                  name="location"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      location: event.target.value
                    }))
                  }
                  value={form.location}
                />
              </label>
              <label>
                Compensation
                <input
                  name="compensation"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      compensation: event.target.value
                    }))
                  }
                  value={form.compensation}
                />
              </label>
              <label>
                Employment type
                <select
                  name="employmentType"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      employmentType:
                        event.target.value as CreateSavedJobOpportunityCommand["employmentType"]
                    }))
                  }
                  value={form.employmentType}
                >
                  {employmentTypes.map((employmentType) => (
                    <option key={employmentType} value={employmentType}>
                      {employmentType}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {fieldErrors.length > 0 ? (
              <ul className="form-errors">
                {fieldErrors.map((error) => (
                  <li key={`${error.field}-${error.message}`}>
                    {error.message}
                  </li>
                ))}
              </ul>
            ) : null}

            {commandError ? (
              <p className="form-errors" role="alert">
                {commandError}
              </p>
            ) : null}

            <div className="form-actions">
              <button type="button" onClick={() => setIsFormOpen(false)}>
                Cancel
              </button>
              <button type="submit">Save opportunity</button>
            </div>
          </form>
        </section>
      ) : null}

      <section
        aria-label="Application pipeline"
        className="pipeline-board"
      >
        {applicationStages.map((stage) => (
          <article className="stage-column" key={stage}>
            <header>
              <h2>{stage}</h2>
              <span aria-label={`${stage} applications`}>
                {stage === "Saved" ? savedOpportunities.length : 0}
              </span>
            </header>
            {stage === "Saved" && savedOpportunities.length > 0 ? (
              <div className="opportunity-list">
                {savedOpportunities.map((opportunity) => (
                  <article className="opportunity-card" key={opportunity.id}>
                    <h3>{opportunity.company}</h3>
                    <p>{opportunity.roleTitle}</p>
                    <dl>
                      <div>
                        <dt>Source</dt>
                        <dd>{opportunity.source}</dd>
                      </div>
                      <div>
                        <dt>Location</dt>
                        <dd>{opportunity.location || "Not set"}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            ) : (
              <p>No applications yet</p>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
