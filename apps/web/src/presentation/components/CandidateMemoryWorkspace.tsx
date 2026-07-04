import { Archive, Check, Edit3, Save, Shield, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import type { CandidateContextGateway } from "../../application/ports/candidateContextGateway";
import type {
  AIArtifact,
  ArtifactStatus,
  CandidateMemoryRecord,
  CandidateMemoryRecordCommand,
  CandidateProfileCommand
} from "../../domain/candidateContext";
import { artifactStatuses, memoryTypes } from "../../domain/candidateContext";
import { cn } from "../../lib/utils";
import { useCandidateContext } from "../useCandidateContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ErrorNotice } from "./ui/error-notice";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";

type CandidateMemoryWorkspaceProps = {
  gateway: CandidateContextGateway;
};

const emptyProfileCommand: CandidateProfileCommand = {
  targetRoles: "",
  preferredStack: "",
  compensationExpectations: "",
  locationPreferences: "",
  workConstraints: "",
  companyPreferences: "",
  writingTone: "",
  positioningSummary: ""
};

const emptyMemoryCommand: CandidateMemoryRecordCommand = {
  memoryType: "Approved fact",
  title: "",
  body: "",
  source: "",
  approved: true,
  sensitive: false,
  metadata: "{}"
};

// "Superseded" is only ever set via the dedicated supersede action below,
// which also records supersededBy - setting it through the raw status
// control would leave supersededBy unset.
const editableArtifactStatuses = artifactStatuses.filter(
  (status) => status !== "Superseded"
);

export function CandidateMemoryWorkspace({
  gateway
}: CandidateMemoryWorkspaceProps) {
  const context = useCandidateContext(gateway);
  const [profileForm, setProfileForm] =
    useState<CandidateProfileCommand>(emptyProfileCommand);
  const [memoryForm, setMemoryForm] =
    useState<CandidateMemoryRecordCommand>(emptyMemoryCommand);
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [supersessionTargets, setSupersessionTargets] = useState<
    Record<string, string>
  >({});
  const [artifactSupersessionTargets, setArtifactSupersessionTargets] =
    useState<Record<string, string>>({});
  const [artifactEdits, setArtifactEdits] = useState<Record<string, string>>({});
  const [commandError, setCommandError] = useState<string | null>(null);

  useEffect(() => {
    if (context.profile) {
      setProfileForm({
        targetRoles: context.profile.targetRoles,
        preferredStack: context.profile.preferredStack,
        compensationExpectations: context.profile.compensationExpectations,
        locationPreferences: context.profile.locationPreferences,
        workConstraints: context.profile.workConstraints,
        companyPreferences: context.profile.companyPreferences,
        writingTone: context.profile.writingTone,
        positioningSummary: context.profile.positioningSummary
      });
    }
  }, [context.profile]);

  useEffect(() => {
    setArtifactEdits((current) => {
      const next = { ...current };
      for (const artifact of context.artifacts) {
        if (!(artifact.id in next)) {
          next[artifact.id] = artifact.currentContent;
        }
      }
      return next;
    });
  }, [context.artifacts]);

  const memoryById = useMemo(
    () =>
      Object.fromEntries(
        context.memoryRecords.map((record) => [record.id, record])
      ),
    [context.memoryRecords]
  );

  const artifactById = useMemo(
    () =>
      Object.fromEntries(
        context.artifacts.map((artifact) => [artifact.id, artifact])
      ),
    [context.artifacts]
  );

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runCommand(() => context.updateProfile(profileForm));
  }

  async function saveMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runCommand(async () => {
      if (editingMemoryId) {
        await context.updateMemory(editingMemoryId, memoryForm);
      } else {
        await context.createMemory(memoryForm);
      }
      setEditingMemoryId(null);
      setMemoryForm(emptyMemoryCommand);
    });
  }

  function editMemory(record: CandidateMemoryRecord) {
    setEditingMemoryId(record.id);
    setMemoryForm({
      memoryType: record.memoryType,
      title: record.title,
      body: record.body,
      source: record.source,
      approved: record.approved,
      sensitive: record.sensitive,
      metadata: record.metadata
    });
  }

  function cancelMemoryEdit() {
    setEditingMemoryId(null);
    setMemoryForm(emptyMemoryCommand);
  }

  async function archiveMemory(id: string) {
    await runCommand(() => context.archiveMemory(id));
  }

  async function supersedeMemory(id: string) {
    const supersededBy = supersessionTargets[id];
    if (!supersededBy) return;
    await runCommand(() => context.supersedeMemory(id, supersededBy));
  }

  async function saveArtifactEdit(artifact: AIArtifact) {
    await runCommand(() =>
      context.editArtifact(artifact.id, artifactEdits[artifact.id] ?? "")
    );
  }

  async function updateArtifactStatus(artifact: AIArtifact, status: ArtifactStatus) {
    await runCommand(() => context.updateArtifactStatus(artifact.id, status));
  }

  async function supersedeArtifact(id: string) {
    const supersededBy = artifactSupersessionTargets[id];
    if (!supersededBy) return;
    await runCommand(() => context.supersedeArtifact(id, supersededBy));
  }

  async function runCommand(command: () => Promise<unknown>) {
    setCommandError(null);
    try {
      await command();
    } catch (error) {
      setCommandError(
        error instanceof Error ? error.message : "The change could not be saved."
      );
    }
  }

  if (context.isLoading) {
    return (
      <div
        role="status"
        className="border border-border bg-card px-4 py-6 text-sm text-muted-foreground"
      >
        Loading candidate context...
      </div>
    );
  }

  if (context.isError || !context.profile) {
    return (
      <ErrorNotice
        title="Candidate context could not load"
        message="Refresh the page or try again in a moment."
      />
    );
  }

  return (
    <div className="space-y-6" aria-label="Profile and memory workspace">
      {commandError ? (
        <ErrorNotice title="Candidate context update failed" message={commandError} />
      ) : null}

      <section className="border border-border bg-card p-4">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="m-0 text-xs uppercase tracking-widest text-muted-foreground">
              Candidate profile
            </p>
            <h2 className="m-0 text-lg font-bold text-foreground">
              Authoritative AI context
            </h2>
          </div>
          <Badge variant="secondary">Profile owner: default</Badge>
        </div>

        <form className="grid gap-4 lg:grid-cols-2" onSubmit={saveProfile}>
          <TextField
            label="Target roles"
            value={profileForm.targetRoles}
            onChange={(targetRoles) =>
              setProfileForm((current) => ({ ...current, targetRoles }))
            }
          />
          <TextField
            label="Preferred stack"
            value={profileForm.preferredStack}
            onChange={(preferredStack) =>
              setProfileForm((current) => ({ ...current, preferredStack }))
            }
          />
          <TextField
            label="Compensation expectations"
            value={profileForm.compensationExpectations}
            onChange={(compensationExpectations) =>
              setProfileForm((current) => ({
                ...current,
                compensationExpectations
              }))
            }
          />
          <TextField
            label="Location preferences"
            value={profileForm.locationPreferences}
            onChange={(locationPreferences) =>
              setProfileForm((current) => ({
                ...current,
                locationPreferences
              }))
            }
          />
          <TextAreaField
            label="Work constraints"
            value={profileForm.workConstraints}
            onChange={(workConstraints) =>
              setProfileForm((current) => ({ ...current, workConstraints }))
            }
          />
          <TextAreaField
            label="Company preferences"
            value={profileForm.companyPreferences}
            onChange={(companyPreferences) =>
              setProfileForm((current) => ({ ...current, companyPreferences }))
            }
          />
          <TextAreaField
            label="Writing tone"
            value={profileForm.writingTone}
            onChange={(writingTone) =>
              setProfileForm((current) => ({ ...current, writingTone }))
            }
          />
          <TextAreaField
            label="Positioning summary"
            value={profileForm.positioningSummary}
            onChange={(positioningSummary) =>
              setProfileForm((current) => ({ ...current, positioningSummary }))
            }
          />
          <div className="lg:col-span-2">
            <Button type="submit" disabled={context.updateProfileStatus === "pending"}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save profile
            </Button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_1fr]">
        <form className="border border-border bg-card p-4" onSubmit={saveMemory}>
          <div className="mb-4">
            <p className="m-0 text-xs uppercase tracking-widest text-muted-foreground">
              Structured memory
            </p>
            <h2 className="m-0 text-lg font-bold text-foreground">
              {editingMemoryId ? "Edit memory record" : "Create memory record"}
            </h2>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Type
              <Select
                className="mt-1"
                value={memoryForm.memoryType}
                onChange={(event) =>
                  setMemoryForm((current) => ({
                    ...current,
                    memoryType: event.target.value as CandidateMemoryRecordCommand["memoryType"]
                  }))
                }
              >
                {memoryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </label>
            <TextField
              label="Title"
              value={memoryForm.title}
              onChange={(title) =>
                setMemoryForm((current) => ({ ...current, title }))
              }
            />
            <TextAreaField
              label="Body"
              value={memoryForm.body}
              onChange={(body) =>
                setMemoryForm((current) => ({ ...current, body }))
              }
            />
            <TextField
              label="Source"
              value={memoryForm.source}
              onChange={(source) =>
                setMemoryForm((current) => ({ ...current, source }))
              }
            />
            <TextAreaField
              label="Metadata JSON"
              value={memoryForm.metadata}
              onChange={(metadata) =>
                setMemoryForm((current) => ({ ...current, metadata }))
              }
            />
            <div className="flex flex-wrap gap-4 text-sm text-foreground">
              <CheckboxField
                label="Approved"
                checked={memoryForm.approved}
                onChange={(approved) =>
                  setMemoryForm((current) => ({ ...current, approved }))
                }
              />
              <CheckboxField
                label="Sensitive"
                checked={memoryForm.sensitive}
                onChange={(sensitive) =>
                  setMemoryForm((current) => ({ ...current, sensitive }))
                }
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={
                  context.createMemoryStatus === "pending" ||
                  context.updateMemoryStatus === "pending"
                }
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                {editingMemoryId ? "Save memory" : "Create memory"}
              </Button>
              {editingMemoryId ? (
                <Button type="button" variant="outline" onClick={cancelMemoryEdit}>
                  <X className="h-4 w-4" aria-hidden="true" />
                  Cancel
                </Button>
              ) : null}
            </div>
          </div>
        </form>

        <div className="space-y-3">
          {context.memoryRecords.length === 0 ? (
            <div className="border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
              No candidate memory records yet.
            </div>
          ) : (
            context.memoryRecords.map((record) => (
              <article
                key={record.id}
                className={cn(
                  "border border-border bg-card p-4",
                  record.archivedAt || record.supersededBy ? "opacity-70" : ""
                )}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge variant="secondary">{record.memoryType}</Badge>
                      {record.approved ? (
                        <Badge>
                          <Check className="h-3 w-3" aria-hidden="true" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline">Unapproved</Badge>
                      )}
                      {record.sensitive ? (
                        <Badge variant="destructive">
                          <Shield className="h-3 w-3" aria-hidden="true" />
                          Sensitive
                        </Badge>
                      ) : null}
                      {record.archivedAt ? <Badge variant="outline">Archived</Badge> : null}
                      {record.supersededBy ? (
                        <Badge variant="outline">Superseded</Badge>
                      ) : null}
                    </div>
                    <h3 className="m-0 text-base font-bold text-foreground">
                      {record.title || "Untitled memory"}
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                      {record.body}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Source: {record.source || "Not set"}
                    </p>
                    {record.supersededBy ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Superseded by:{" "}
                        {memoryById[record.supersededBy]?.title ?? record.supersededBy}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => editMemory(record)}
                      disabled={!!record.archivedAt || !!record.supersededBy}
                    >
                      <Edit3 className="h-4 w-4" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => archiveMemory(record.id)}
                      disabled={!!record.archivedAt}
                    >
                      <Archive className="h-4 w-4" aria-hidden="true" />
                      Archive
                    </Button>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
                  <Select
                    aria-label={`Supersede ${record.title || record.id} with`}
                    value={supersessionTargets[record.id] ?? ""}
                    onChange={(event) =>
                      setSupersessionTargets((current) => ({
                        ...current,
                        [record.id]: event.target.value
                      }))
                    }
                  >
                    <option value="">Choose replacement memory</option>
                    {context.memoryRecords
                      .filter((candidate) => candidate.id !== record.id)
                      .map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.title || candidate.id}
                        </option>
                      ))}
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => supersedeMemory(record.id)}
                    disabled={!supersessionTargets[record.id]}
                  >
                    Mark superseded
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="border border-border bg-card p-4">
        <div className="mb-4">
          <p className="m-0 text-xs uppercase tracking-widest text-muted-foreground">
            AI artifacts
          </p>
          <h2 className="m-0 text-lg font-bold text-foreground">
            Profile-level generated outputs
          </h2>
        </div>
        {context.artifacts.length === 0 ? (
          <div className="border border-border bg-background px-4 py-6 text-sm text-muted-foreground">
            No profile artifacts have been saved yet.
          </div>
        ) : (
          <div className="space-y-3">
            {context.artifacts.map((artifact) => (
              <article key={artifact.id} className="border border-border bg-background p-4">
                <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Badge variant="secondary">{artifact.artifactType}</Badge>
                    <h3 className="m-0 mt-2 text-base font-bold text-foreground">
                      {artifact.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {artifact.provenance.providerName ?? "Unknown provider"}
                      {artifact.provenance.modelName
                        ? ` / ${artifact.provenance.modelName}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {artifact.sensitive ? (
                      <Badge variant="destructive">
                        <Shield className="h-3 w-3" aria-hidden="true" />
                        Sensitive
                      </Badge>
                    ) : null}
                    {artifact.status === "Superseded" ? (
                      <Badge variant="outline">Superseded</Badge>
                    ) : (
                      <Select
                        aria-label={`Status for ${artifact.title}`}
                        value={artifact.status}
                        onChange={(event) =>
                          updateArtifactStatus(
                            artifact,
                            event.target.value as ArtifactStatus
                          )
                        }
                      >
                        {editableArtifactStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Select>
                    )}
                  </div>
                </div>
                {artifact.supersededBy ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Superseded by:{" "}
                    {artifactById[artifact.supersededBy]?.title ?? artifact.supersededBy}
                  </p>
                ) : null}
                <Textarea
                  aria-label={`Edited content for ${artifact.title}`}
                  value={artifactEdits[artifact.id] ?? artifact.currentContent}
                  onChange={(event) =>
                    setArtifactEdits((current) => ({
                      ...current,
                      [artifact.id]: event.target.value
                    }))
                  }
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => saveArtifactEdit(artifact)}
                    disabled={context.editArtifactStatus === "pending"}
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Save artifact edit
                  </Button>
                  <Badge variant="outline">Current content shown</Badge>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
                  <Select
                    aria-label={`Supersede ${artifact.title || artifact.id} with`}
                    value={artifactSupersessionTargets[artifact.id] ?? ""}
                    onChange={(event) =>
                      setArtifactSupersessionTargets((current) => ({
                        ...current,
                        [artifact.id]: event.target.value
                      }))
                    }
                    disabled={artifact.status === "Superseded"}
                  >
                    <option value="">Choose replacement artifact</option>
                    {context.artifacts
                      .filter((candidate) => candidate.id !== artifact.id)
                      .map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.title || candidate.id}
                        </option>
                      ))}
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => supersedeArtifact(artifact.id)}
                    disabled={
                      artifact.status === "Superseded" ||
                      !artifactSupersessionTargets[artifact.id]
                    }
                  >
                    Mark superseded
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TextField({
  label,
  onChange,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <Input
        className="mt-1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextAreaField({
  label,
  onChange,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <Textarea
        className="mt-1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function CheckboxField({
  checked,
  label,
  onChange
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-primary"
      />
      {label}
    </label>
  );
}
