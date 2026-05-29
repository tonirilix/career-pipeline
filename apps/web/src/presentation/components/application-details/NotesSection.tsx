import { type FormEvent, useState } from "react";

import type { AddApplicationNoteCommand } from "../../../domain/applicationNote";
import type { ApplicationNote } from "../../../domain/jobOpportunity";
import { Textarea } from "../ui/textarea";
import { formatDate } from "./dateHelpers";
import { DetailsError, FormActions, SectionHeader } from "./primitives";
import type { DetailsActionState, DetailsCommandError } from "./types";

export function useNoteWorkflow({
  applicationId,
  onAddNote,
  onComplete
}: {
  applicationId: string;
  onAddNote: (command: AddApplicationNoteCommand) => Promise<boolean>;
  onComplete: () => void;
}) {
  const [noteBody, setNoteBody] = useState("");
  const [localError, setLocalError] = useState<DetailsCommandError | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    const didAdd = await onAddNote({ applicationId, body: noteBody });
    if (didAdd) {
      setNoteBody("");
      onComplete();
    }
  }

  return {
    handleSubmit,
    localError,
    noteBody,
    setNoteBody,
    clearLocalError: () => setLocalError(null)
  };
}

export function NotesSection({
  actionState,
  error,
  notes,
  noteBody,
  onAction,
  onCancel,
  onNoteBodyChange,
  onSubmit
}: {
  actionState: DetailsActionState;
  error: DetailsCommandError | null;
  notes: ApplicationNote[];
  noteBody: string;
  onAction: () => void;
  onCancel: () => void;
  onNoteBodyChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const isActive = actionState.kind === "active";
  const isPending = isActive && actionState.status === "pending";

  return (
    <section aria-label="Notes" className="grid gap-4">
      <SectionHeader
        actionLabel="Add note"
        canAct
        hideAction={isActive}
        title="Notes"
        onAction={onAction}
      />
      {error ? (
        <DetailsError error={error} title="Note was not added">
          Your note is still here. Edit it if needed, then try again.
        </DetailsError>
      ) : null}
      {isActive ? (
        <form className="grid gap-2" onSubmit={onSubmit}>
          <label className="grid gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Application note
            <Textarea
              className="min-h-[80px]"
              onChange={(e) => onNoteBodyChange(e.target.value)}
              placeholder="Add a note..."
              value={noteBody}
            />
          </label>
          <FormActions
            isPending={isPending}
            submitLabel="Add note"
            onCancel={onCancel}
          />
        </form>
      ) : null}
      <NoteList notes={notes} />
    </section>
  );
}

function NoteList({ notes }: { notes: ApplicationNote[] }) {
  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No notes yet</p>;
  }

  return (
    <ol aria-label="Application notes" className="list-none p-0 m-0 grid gap-2">
      {notes.map((note) => (
        <li key={note.id} className="border border-border px-3 py-2">
          <time
            className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1"
            dateTime={note.createdAt}
          >
            {formatDate(note.createdAt)}
          </time>
          <span className="text-sm text-foreground">{note.body}</span>
        </li>
      ))}
    </ol>
  );
}
