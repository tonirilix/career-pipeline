import { type FormEvent } from "react";

import {
  employmentTypes,
  type CreateSavedJobOpportunityCommand,
  type FieldError,
  jobSources
} from "../../domain/jobOpportunity";
import { Button } from "./ui/button";
import { ErrorNotice } from "./ui/error-notice";
import { Input } from "./ui/input";
import { Select } from "./ui/select";

type OpportunityFormProps = {
  form: CreateSavedJobOpportunityCommand;
  fieldErrors: FieldError[];
  commandError: string | null;
  onChange: (updated: CreateSavedJobOpportunityCommand) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function OpportunityForm({
  form,
  fieldErrors,
  commandError,
  onChange,
  onSubmit,
  onCancel
}: OpportunityFormProps) {
  const errorsByField = new Map(
    fieldErrors.map((error) => [error.field, error.message])
  );

  return (
    <section
      aria-label="New saved opportunity"
      className="mb-5 overflow-hidden"
    >
      <div className="border-b border-border px-5 py-3">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest m-0">
          New opportunity
        </h2>
      </div>

      <form noValidate onSubmit={onSubmit} className="p-5">
        <div className="grid gap-4 grid-cols-2">
          <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Company
            <Input
              aria-describedby={errorsByField.has("company") ? "company-error" : undefined}
              aria-invalid={errorsByField.has("company") ? true : undefined}
              className={errorsByField.has("company") ? "border-destructive focus-visible:ring-destructive" : undefined}
              name="company"
              placeholder="e.g. Acme Corp"
              onChange={(e) => onChange({ ...form, company: e.target.value })}
              value={form.company}
            />
            {errorsByField.has("company") ? (
              <span id="company-error" className="text-xs normal-case text-destructive">
                {errorsByField.get("company")}
              </span>
            ) : null}
          </label>
          <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Role title
            <Input
              aria-describedby={errorsByField.has("roleTitle") ? "role-title-error" : undefined}
              aria-invalid={errorsByField.has("roleTitle") ? true : undefined}
              className={errorsByField.has("roleTitle") ? "border-destructive focus-visible:ring-destructive" : undefined}
              name="roleTitle"
              placeholder="e.g. Senior Engineer"
              onChange={(e) => onChange({ ...form, roleTitle: e.target.value })}
              value={form.roleTitle}
            />
            {errorsByField.has("roleTitle") ? (
              <span id="role-title-error" className="text-xs normal-case text-destructive">
                {errorsByField.get("roleTitle")}
              </span>
            ) : null}
          </label>
          <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Posting URL
            <Input
              aria-describedby={errorsByField.has("postingUrl") ? "posting-url-error" : undefined}
              aria-invalid={errorsByField.has("postingUrl") ? true : undefined}
              className={errorsByField.has("postingUrl") ? "border-destructive focus-visible:ring-destructive" : undefined}
              name="postingUrl"
              onChange={(e) => onChange({ ...form, postingUrl: e.target.value })}
              type="url"
              placeholder="https://…"
              value={form.postingUrl}
            />
            {errorsByField.has("postingUrl") ? (
              <span id="posting-url-error" className="text-xs normal-case text-destructive">
                {errorsByField.get("postingUrl")}
              </span>
            ) : null}
          </label>
          <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Source
            <Select
              name="source"
              onChange={(e) =>
                onChange({
                  ...form,
                  source: e.target.value as CreateSavedJobOpportunityCommand["source"]
                })
              }
              value={form.source}
            >
              {jobSources.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </Select>
          </label>
          <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Location
            <Input
              name="location"
              placeholder="e.g. Remote, NYC"
              onChange={(e) => onChange({ ...form, location: e.target.value })}
              value={form.location}
            />
          </label>
          <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Compensation
            <Input
              name="compensation"
              placeholder="e.g. $120k–$150k"
              onChange={(e) => onChange({ ...form, compensation: e.target.value })}
              value={form.compensation}
            />
          </label>
          <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Employment type
            <Select
              name="employmentType"
              onChange={(e) =>
                onChange({
                  ...form,
                  employmentType:
                    e.target.value as CreateSavedJobOpportunityCommand["employmentType"]
                })
              }
              value={form.employmentType}
            >
              {employmentTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </label>
        </div>

        {fieldErrors.length > 0 ? (
          <ErrorNotice
            className="mt-4"
            message="Fix the fields marked in red, then save again."
            title={`Check ${fieldErrors.length} ${
              fieldErrors.length === 1 ? "field" : "fields"
            }`}
          >
            <ul className="m-0 mt-2 space-y-1 pl-4 text-sm text-foreground">
              {fieldErrors.map((error) => (
                <li key={`${error.field}-${error.message}`}>{error.message}</li>
              ))}
            </ul>
          </ErrorNotice>
        ) : null}

        {commandError ? (
          <ErrorNotice
            className="mt-4"
            message={commandError}
            title="Opportunity was not saved"
          />
        ) : null}

        <div className="mt-5 flex gap-2.5 justify-end border-t border-border pt-4">
          <Button type="button" variant="outline" className="rounded-none bg-transparent hover:bg-muted" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="rounded-none">Save opportunity</Button>
        </div>
      </form>
    </section>
  );
}
