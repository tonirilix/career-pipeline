import {
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Send,
  XCircle
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import type { RoleDiscoveryGateway } from "../../application/ports/roleDiscoveryGateway";
import { employmentTypes } from "../../domain/jobOpportunity";
import type {
  RoleCompanyType,
  RoleDecisionStatus,
  RoleRecord,
  RoleRecordCommand,
  RoleRejectionReason,
  RoleSearchTopicCommand
} from "../../domain/roleDiscovery";
import {
  roleCompanyTypes,
  roleFreshnessStatuses,
  roleRejectionReasons,
  roleRemoteEligibilities,
  roleSeniorities,
} from "../../domain/roleDiscovery";
import { useRoleDiscovery } from "../useRoleDiscovery";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ErrorNotice } from "./ui/error-notice";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";

type RoleDiscoveryWorkspaceProps = {
  gateway: RoleDiscoveryGateway;
};

const emptyTopic: RoleSearchTopicCommand = {
  name: "",
  targetTitles: "",
  preferredStack: "",
  location: "",
  remotePreference: "Remote",
  employmentType: "Full-time",
  companyType: "Product",
  compensation: "",
  seniority: "Senior",
  notes: ""
};

const emptyRole: RoleRecordCommand = {
  searchTopicId: null,
  company: "",
  title: "",
  postingUrl: "",
  source: "Other",
  sourceKind: "Manual URL",
  providerSource: "",
  description: "",
  rawSourceText: "",
  location: "",
  remoteEligibility: "Unknown",
  employmentType: "Full-time",
  seniority: "Unknown",
  compensation: "",
  stack: "",
  companyType: "Unknown",
  freshnessStatus: "Unknown",
  metadata: "{}"
};

const rolesPerPage = 5;

export function RoleDiscoveryWorkspace({ gateway }: RoleDiscoveryWorkspaceProps) {
  const discovery = useRoleDiscovery(gateway);
  const [topicForm, setTopicForm] = useState<RoleSearchTopicCommand>(emptyTopic);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [isRefiningSearch, setIsRefiningSearch] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [roleEdit, setRoleEdit] = useState<RoleRecordCommand>(emptyRole);
  const [rejectReasons, setRejectReasons] = useState<
    Record<string, RoleRejectionReason>
  >({});
  const [rolePage, setRolePage] = useState(0);
  const [commandError, setCommandError] = useState<string | null>(null);

  const selectedRole = useMemo(
    () => discovery.roles.find((role) => role.id === selectedRoleId) ?? null,
    [discovery.roles, selectedRoleId]
  );

  const canSearch = topicForm.targetTitles.trim().length > 0;
  const totalRolePages = Math.max(
    1,
    Math.ceil(discovery.roles.length / rolesPerPage)
  );
  const visibleRoles = discovery.roles.slice(
    rolePage * rolesPerPage,
    rolePage * rolesPerPage + rolesPerPage
  );

  useEffect(() => {
    if (!selectedTopicId && discovery.topics[0]) {
      setSelectedTopicId(discovery.topics[0].id);
    }
  }, [discovery.topics, selectedTopicId]);

  useEffect(() => {
    const selectedTopic = discovery.topics.find(
      (topic) => topic.id === selectedTopicId
    );
    if (!selectedTopic) return;

    setTopicForm({
      name: selectedTopic.name,
      targetTitles: selectedTopic.targetTitles,
      preferredStack: selectedTopic.preferredStack,
      location: selectedTopic.location,
      remotePreference: selectedTopic.remotePreference,
      employmentType: selectedTopic.employmentType,
      companyType: selectedTopic.companyType,
      compensation: selectedTopic.compensation,
      seniority: selectedTopic.seniority,
      notes: selectedTopic.notes
    });
  }, [discovery.topics, selectedTopicId]);

  useEffect(() => {
    if (selectedRole) {
      setRoleEdit(roleCommandFromRecord(selectedRole));
    }
  }, [selectedRole]);

  useEffect(() => {
    setRolePage((current) => Math.min(current, totalRolePages - 1));
  }, [totalRolePages]);

  async function saveSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runCommand(saveCurrentSearch);
  }

  async function runSearch() {
    if (!canSearch) return;

    await runCommand(async () => {
      const topicId = await saveCurrentSearch();
      await discovery.runSearch(topicId, 3);
    });
  }

  async function saveCurrentSearch() {
    const command = normalizedTopic(topicForm);
    if (selectedTopicId) {
      const topic = await discovery.updateTopic(selectedTopicId, command);
      return topic.id;
    }

    const topic = await discovery.createTopic(command);
    setSelectedTopicId(topic.id);
    return topic.id;
  }

  async function saveRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRole) return;
    await runCommand(() => discovery.updateRole(selectedRole.id, roleEdit));
  }

  async function setDecision(
    role: RoleRecord,
    status: RoleDecisionStatus,
    rejectionReason?: RoleRejectionReason
  ) {
    await runCommand(() =>
      discovery.updateDecision(role.id, status, rejectionReason)
    );
  }

  async function promote(role: RoleRecord) {
    await runCommand(() => discovery.promoteRole(role.id));
  }

  async function markLive(role: RoleRecord) {
    await runCommand(() =>
      discovery.updateFreshness(role.id, "Live", new Date().toISOString())
    );
  }

  async function runCommand(command: () => Promise<unknown>) {
    setCommandError(null);
    try {
      await command();
    } catch (error) {
      setCommandError(
        error instanceof Error ? error.message : "Role discovery command failed."
      );
    }
  }

  if (discovery.isLoading) {
    return (
      <div
        role="status"
        className="border border-border bg-card px-4 py-6 text-sm text-muted-foreground"
      >
        Loading role discovery...
      </div>
    );
  }

  if (discovery.isError) {
    return (
      <ErrorNotice
        title="Role discovery could not load"
        message="Refresh the page or try again in a moment."
      />
    );
  }

  return (
    <div className="space-y-5" aria-label="Role discovery workspace">
      {commandError ? (
        <ErrorNotice title="Role discovery command failed" message={commandError} />
      ) : null}

      <section className="border border-border bg-card p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="m-0 text-xs uppercase tracking-widest text-muted-foreground">
              Role search
            </p>
            <h2 className="m-0 text-xl font-bold text-foreground">
              Find possible jobs
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {discovery.topics.length ? (
              <Select
                aria-label="Saved search"
                className="h-10 w-56"
                value={selectedTopicId}
                onChange={(event) => setSelectedTopicId(event.target.value)}
              >
                {discovery.topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </Select>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedTopicId("");
                setTopicForm(emptyTopic);
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New search
            </Button>
          </div>
        </div>

        <form className="space-y-3" onSubmit={saveSearch}>
          <label className="block text-sm font-medium text-foreground">
            What should the app look for?
            <Input
              className="mt-1 h-12 text-base"
              placeholder="Senior React roles, remote, product companies"
              value={topicForm.targetTitles}
              onChange={(event) =>
                setTopicForm((current) => ({
                  ...current,
                  targetTitles: event.target.value,
                  name: current.name || event.target.value
                }))
              }
            />
          </label>

          <div className="grid gap-3 md:grid-cols-4">
            <TextField
              label="Stack"
              placeholder="Go, React"
              value={topicForm.preferredStack}
              onChange={(preferredStack) =>
                setTopicForm((current) => ({ ...current, preferredStack }))
              }
            />
            <TextField
              label="Location"
              placeholder="Remote, Mexico, US"
              value={topicForm.location}
              onChange={(location) =>
                setTopicForm((current) => ({ ...current, location }))
              }
            />
            <SelectField
              label="Seniority"
              value={topicForm.seniority}
              options={roleSeniorities}
              onChange={(seniority) =>
                setTopicForm((current) => ({ ...current, seniority }))
              }
            />
            <SelectField
              label="Company"
              value={topicForm.companyType}
              options={roleCompanyTypes}
              onChange={(companyType) =>
                setTopicForm((current) => ({ ...current, companyType }))
              }
            />
          </div>

          <details
            className="border border-border bg-background px-3 py-2"
            open={isRefiningSearch}
            onToggle={(event) =>
              setIsRefiningSearch(event.currentTarget.open)
            }
          >
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              Refine search
            </summary>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <TextField
                label="Search name"
                value={topicForm.name}
                onChange={(name) =>
                  setTopicForm((current) => ({ ...current, name }))
                }
              />
              <TextField
                label="Work arrangement"
                value={topicForm.remotePreference}
                onChange={(remotePreference) =>
                  setTopicForm((current) => ({ ...current, remotePreference }))
                }
              />
              <SelectField
                label="Employment"
                value={topicForm.employmentType}
                options={employmentTypes}
                onChange={(employmentType) =>
                  setTopicForm((current) => ({ ...current, employmentType }))
                }
              />
              <TextField
                label="Compensation"
                value={topicForm.compensation}
                onChange={(compensation) =>
                  setTopicForm((current) => ({ ...current, compensation }))
                }
              />
              <label className="block text-sm font-medium text-foreground md:col-span-2">
                Notes
                <Textarea
                  className="mt-1 min-h-20"
                  value={topicForm.notes}
                  onChange={(event) =>
                    setTopicForm((current) => ({
                      ...current,
                      notes: event.target.value
                    }))
                  }
                />
              </label>
            </div>
          </details>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              disabled={!canSearch || discovery.runSearchStatus === "pending"}
              onClick={runSearch}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Run search
            </Button>
            <Button
              type="submit"
              variant="outline"
              disabled={!canSearch || discovery.updateTopicStatus === "pending"}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Save search
            </Button>
            {discovery.lastSearchResult ? (
              <div className="flex flex-wrap gap-2 pl-0 sm:pl-2">
                <Badge variant="secondary">
                  Imported {discovery.lastSearchResult.importedCount}
                </Badge>
                <Badge variant="outline">
                  Skipped {discovery.lastSearchResult.skippedCount}
                </Badge>
              </div>
            ) : null}
          </div>
        </form>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-4">
          <div className="border border-border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="m-0 text-xs uppercase tracking-widest text-muted-foreground">
                  Role inbox
                </p>
                <h2 className="m-0 text-base font-bold text-foreground">
                  {discovery.roles.length} roles found
                </h2>
              </div>
              <RolePagination
                currentPage={rolePage}
                pageCount={totalRolePages}
                totalCount={discovery.roles.length}
                onPrevious={() => setRolePage((current) => Math.max(0, current - 1))}
                onNext={() =>
                  setRolePage((current) =>
                    Math.min(totalRolePages - 1, current + 1)
                  )
                }
              />
            </div>
          </div>

          {discovery.roles.length === 0 ? (
            <div className="border border-border bg-card px-4 py-8 text-sm text-muted-foreground">
              No roles yet. Run a search to import possible jobs.
            </div>
          ) : (
            <div className="grid gap-2">
              {visibleRoles.map((role) => (
                <RoleRow
                  key={role.id}
                  role={role}
                  rejectionReason={rejectReasons[role.id] ?? "Other"}
                  selected={selectedRoleId === role.id}
                  onSelect={() => setSelectedRoleId(role.id)}
                  onRejectionReasonChange={(reason) =>
                    setRejectReasons((current) => ({
                      ...current,
                      [role.id]: reason
                    }))
                  }
                  onDecision={(status, reason) =>
                    setDecision(role, status, reason)
                  }
                  onPromote={() => promote(role)}
                />
              ))}
            </div>
          )}
        </div>

        <RoleInspector
          role={selectedRole}
          form={roleEdit}
          saveStatus={discovery.updateRoleStatus}
          onChange={setRoleEdit}
          onClose={() => setSelectedRoleId(null)}
          onMarkLive={selectedRole ? () => markLive(selectedRole) : undefined}
          onSave={saveRole}
        />
      </section>
    </div>
  );
}

function RolePagination({
  currentPage,
  pageCount,
  totalCount,
  onPrevious,
  onNext
}: {
  currentPage: number;
  pageCount: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const firstItem = totalCount === 0 ? 0 : currentPage * rolesPerPage + 1;
  const lastItem = Math.min(totalCount, (currentPage + 1) * rolesPerPage);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {firstItem}-{lastItem} of {totalCount}
      </span>
      <Button
        type="button"
        variant="outline"
        disabled={currentPage === 0}
        onClick={onPrevious}
      >
        Back
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={currentPage >= pageCount - 1}
        onClick={onNext}
      >
        Next
      </Button>
    </div>
  );
}

function RoleRow({
  role,
  rejectionReason,
  selected,
  onSelect,
  onRejectionReasonChange,
  onDecision,
  onPromote
}: {
  role: RoleRecord;
  rejectionReason: RoleRejectionReason;
  selected: boolean;
  onSelect: () => void;
  onRejectionReasonChange: (reason: RoleRejectionReason) => void;
  onDecision: (
    status: RoleDecisionStatus,
    rejectionReason?: RoleRejectionReason
  ) => void;
  onPromote: () => void;
}) {
  return (
    <article
      className={`border bg-card p-4 ${
        selected ? "border-primary" : "border-border"
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <button type="button" className="min-w-0 text-left" onClick={onSelect}>
          <h3 className="m-0 text-base font-bold text-foreground">
            {role.company} · {role.title}
          </h3>
          <p className="m-0 mt-1 text-sm text-muted-foreground">
            {compactRoleMeta(role)}
          </p>
          <p className="m-0 mt-1 text-sm text-muted-foreground">
            {role.stack || "Stack unknown"}
            {role.compensation ? ` · ${role.compensation}` : ""}
          </p>
        </button>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Badge variant="secondary">{role.decisionStatus}</Badge>
          <Badge variant="outline">{role.freshnessStatus}</Badge>
          <Badge variant="outline">{role.sourceKind}</Badge>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => onDecision("Saved")}>
          <Bookmark className="h-4 w-4" aria-hidden="true" />
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onDecision("Revisit later")}
        >
          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
          Revisit
        </Button>
        <Select
          aria-label={`Reject reason for ${role.company}`}
          className="h-10 w-44"
          value={rejectionReason}
          onChange={(event) =>
            onRejectionReasonChange(event.target.value as RoleRejectionReason)
          }
        >
          {roleRejectionReasons
            .filter((reason) => reason !== "")
            .map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
        </Select>
        <Button
          type="button"
          variant="outline"
          onClick={() => onDecision("Rejected", rejectionReason)}
        >
          <XCircle className="h-4 w-4" aria-hidden="true" />
          Reject
        </Button>
        {role.promotedApplicationId ? (
          <Button
            type="button"
            disabled
            title={`Promoted to application ${role.promotedApplicationId}`}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Promoted
          </Button>
        ) : (
          <Button type="button" onClick={onPromote}>
            <Send className="h-4 w-4" aria-hidden="true" />
            Promote
          </Button>
        )}
        {role.postingUrl ? (
          <a
            className="inline-flex min-h-10 items-center gap-2 border border-border px-3 text-sm text-foreground hover:bg-muted"
            href={role.postingUrl}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Open
          </a>
        ) : null}
      </div>
    </article>
  );
}

function RoleInspector({
  role,
  form,
  saveStatus,
  onChange,
  onClose,
  onMarkLive,
  onSave
}: {
  role: RoleRecord | null;
  form: RoleRecordCommand;
  saveStatus: string;
  onChange: (form: RoleRecordCommand) => void;
  onClose: () => void;
  onMarkLive?: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (!role) {
    return (
      <aside className="border border-border bg-card p-4">
        <p className="m-0 text-xs uppercase tracking-widest text-muted-foreground">
          Inspector
        </p>
        <h2 className="m-0 mt-1 text-base font-bold text-foreground">
          Select a role
        </h2>
        <p className="m-0 mt-2 text-sm text-muted-foreground">
          Open a role when you need to edit metadata, check the raw source, or
          mark freshness.
        </p>
      </aside>
    );
  }

  return (
    <aside className="border border-border bg-card p-4">
      <form className="space-y-4" onSubmit={onSave}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="m-0 text-xs uppercase tracking-widest text-muted-foreground">
              Inspector
            </p>
            <h2 className="m-0 mt-1 text-base font-bold text-foreground">
              {role.company}
            </h2>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="space-y-3">
          <TextField
            label="Company"
            value={form.company}
            onChange={(company) => onChange({ ...form, company })}
          />
          <TextField
            label="Title"
            value={form.title}
            onChange={(title) => onChange({ ...form, title })}
          />
          <TextField
            label="Posting URL"
            value={form.postingUrl}
            onChange={(postingUrl) => onChange({ ...form, postingUrl })}
          />
          <TextAreaField
            label="Notes"
            value={form.description}
            onChange={(description) => onChange({ ...form, description })}
          />
        </div>

        <details className="border border-border bg-background px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium text-foreground">
            Details
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <TextField
              label="Location"
              value={form.location}
              onChange={(location) => onChange({ ...form, location })}
            />
            <TextField
              label="Stack"
              value={form.stack}
              onChange={(stack) => onChange({ ...form, stack })}
            />
            <TextField
              label="Compensation"
              value={form.compensation}
              onChange={(compensation) => onChange({ ...form, compensation })}
            />
            <SelectField
              label="Remote"
              value={form.remoteEligibility}
              options={roleRemoteEligibilities}
              onChange={(remoteEligibility) =>
                onChange({ ...form, remoteEligibility })
              }
            />
            <SelectField
              label="Employment"
              value={form.employmentType}
              options={employmentTypes}
              onChange={(employmentType) =>
                onChange({ ...form, employmentType })
              }
            />
            <SelectField
              label="Seniority"
              value={form.seniority}
              options={roleSeniorities}
              onChange={(seniority) => onChange({ ...form, seniority })}
            />
            <SelectField
              label="Company type"
              value={form.companyType}
              options={roleCompanyTypes}
              onChange={(companyType) => onChange({ ...form, companyType })}
            />
            <SelectField
              label="Freshness"
              value={form.freshnessStatus}
              options={roleFreshnessStatuses}
              onChange={(freshnessStatus) =>
                onChange({ ...form, freshnessStatus })
              }
            />
          </div>
        </details>

        <details className="border border-border bg-background px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium text-foreground">
            Source text
          </summary>
          <Textarea
            className="mt-3 min-h-32"
            readOnly
            value={role.rawSourceText || role.description}
          />
        </details>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saveStatus === "pending"}>
            <Save className="h-4 w-4" aria-hidden="true" />
            Save role
          </Button>
          <Button type="button" variant="outline" onClick={onMarkLive}>
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Mark live
          </Button>
        </div>
      </form>
    </aside>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <Input
        className="mt-1"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <Textarea
        className="mt-1 min-h-24"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T | "";
  options: readonly (T | "")[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <Select
        className="mt-1"
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option || "any"} value={option}>
            {option || "Any"}
          </option>
        ))}
      </Select>
    </label>
  );
}

function normalizedTopic(topic: RoleSearchTopicCommand): RoleSearchTopicCommand {
  const targetTitles = topic.targetTitles.trim();
  return {
    ...topic,
    name: topic.name.trim() || targetTitles,
    targetTitles
  };
}

function compactRoleMeta(role: RoleRecord) {
  return [
    role.location || "Location unknown",
    role.remoteEligibility,
    role.employmentType,
    role.seniority
  ]
    .filter(Boolean)
    .join(" · ");
}

function roleCommandFromRecord(role: RoleRecord): RoleRecordCommand {
  return {
    searchTopicId: role.searchTopicId,
    company: role.company,
    title: role.title,
    postingUrl: role.postingUrl,
    source: role.source,
    sourceKind: role.sourceKind,
    providerSource: role.providerSource,
    description: role.description,
    rawSourceText: role.rawSourceText,
    location: role.location,
    remoteEligibility: role.remoteEligibility,
    employmentType: role.employmentType,
    seniority: role.seniority,
    compensation: role.compensation,
    stack: role.stack,
    companyType: role.companyType as RoleCompanyType,
    freshnessStatus: role.freshnessStatus,
    metadata: role.metadata
  };
}
