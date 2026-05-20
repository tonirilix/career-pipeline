import { type FormEvent } from "react";

import {
  employmentTypes,
  type CreateSavedJobOpportunityCommand,
  type FieldError,
  jobSources
} from "../../domain/jobOpportunity";
import { Button } from "./ui/button";
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
  return (
    <section
      aria-label="New saved opportunity"
      className="mb-5 border border-border overflow-hidden"
    >
      <div className="border-b border-border px-5 py-3">
        <h2 className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest m-0">
          New opportunity
        </h2>
      </div>

      <form noValidate onSubmit={onSubmit} className="p-5">
        <div className="grid gap-4 grid-cols-[repeat(4,minmax(180px,1fr))]">
          <label className="grid gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
            Company
            <Input
              name="company"
              placeholder="e.g. Acme Corp"
              onChange={(e) => onChange({ ...form, company: e.target.value })}
              value={form.company}
            />
          </label>
          <label className="grid gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
            Role title
            <Input
              name="roleTitle"
              placeholder="e.g. Senior Engineer"
              onChange={(e) => onChange({ ...form, roleTitle: e.target.value })}
              value={form.roleTitle}
            />
          </label>
          <label className="grid gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
            Posting URL
            <Input
              name="postingUrl"
              onChange={(e) => onChange({ ...form, postingUrl: e.target.value })}
              type="url"
              placeholder="https://…"
              value={form.postingUrl}
            />
          </label>
          <label className="grid gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
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
          <label className="grid gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
            Location
            <Input
              name="location"
              placeholder="e.g. Remote, NYC"
              onChange={(e) => onChange({ ...form, location: e.target.value })}
              value={form.location}
            />
          </label>
          <label className="grid gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
            Compensation
            <Input
              name="compensation"
              placeholder="e.g. $120k–$150k"
              onChange={(e) => onChange({ ...form, compensation: e.target.value })}
              value={form.compensation}
            />
          </label>
          <label className="grid gap-1 text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">
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
          <ul className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-destructive space-y-1">
            {fieldErrors.map((error) => (
              <li key={`${error.field}-${error.message}`}>{error.message}</li>
            ))}
          </ul>
        ) : null}

        {commandError ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {commandError}
          </p>
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
