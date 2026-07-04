import { graphql, HttpResponse } from "msw";

import type {
  ArtifactStatus,
  CandidateMemoryRecordCommand,
  CandidateProfileCommand
} from "../../domain/candidateContext";
import { candidateContextMockBackend } from "../mockBackend/candidateContextMockBackend";

export const candidateContextHandlers = [
  graphql.query("GetCandidateProfile", () => {
    return HttpResponse.json({
      data: {
        candidateProfile: candidateContextMockBackend.getCandidateProfile()
      }
    });
  }),

  graphql.mutation("UpdateCandidateProfile", ({ variables }) => {
    const { input } = variables as { input: CandidateProfileCommand };
    return HttpResponse.json({
      data: {
        updateCandidateProfile:
          candidateContextMockBackend.updateCandidateProfile(input)
      }
    });
  }),

  graphql.query("ListCandidateMemoryRecords", () => {
    return HttpResponse.json({
      data: {
        candidateMemoryRecords:
          candidateContextMockBackend.listCandidateMemoryRecords()
      }
    });
  }),

  graphql.mutation("CreateCandidateMemoryRecord", ({ variables }) => {
    const { input } = variables as { input: CandidateMemoryRecordCommand };
    return HttpResponse.json({
      data: {
        createCandidateMemoryRecord:
          candidateContextMockBackend.createCandidateMemoryRecord(input)
      }
    });
  }),

  graphql.mutation("UpdateCandidateMemoryRecord", ({ variables }) => {
    const { input } = variables as {
      input: CandidateMemoryRecordCommand & { id: string };
    };
    return HttpResponse.json({
      data: {
        updateCandidateMemoryRecord:
          candidateContextMockBackend.updateCandidateMemoryRecord(input)
      }
    });
  }),

  graphql.mutation("ArchiveCandidateMemoryRecord", ({ variables }) => {
    const { id } = variables as { id: string };
    return HttpResponse.json({
      data: {
        archiveCandidateMemoryRecord:
          candidateContextMockBackend.archiveCandidateMemoryRecord(id)
      }
    });
  }),

  graphql.mutation("SupersedeCandidateMemoryRecord", ({ variables }) => {
    const { id, supersededBy } = variables as {
      id: string;
      supersededBy: string;
    };
    return HttpResponse.json({
      data: {
        supersedeCandidateMemoryRecord:
          candidateContextMockBackend.supersedeCandidateMemoryRecord(
            id,
            supersededBy
          )
      }
    });
  }),

  graphql.query("GetCandidateGroundingContext", () => {
    return HttpResponse.json({
      data: {
        candidateGroundingContext:
          candidateContextMockBackend.getCandidateGroundingContext()
      }
    });
  }),

  graphql.query("ListAIArtifacts", ({ variables }) => {
    const { ownerType, ownerId } = variables as {
      ownerType: string;
      ownerId: string;
    };
    return HttpResponse.json({
      data: {
        aiArtifacts: candidateContextMockBackend.listAIArtifacts(
          ownerType,
          ownerId
        )
      }
    });
  }),

  graphql.mutation("CreateAIArtifact", ({ variables }) => {
    const { input } = variables as {
      input: Parameters<typeof candidateContextMockBackend.createAIArtifact>[0];
    };
    return HttpResponse.json({
      data: {
        createAIArtifact: candidateContextMockBackend.createAIArtifact(input)
      }
    });
  }),

  graphql.mutation("EditAIArtifact", ({ variables }) => {
    const { id, userEditedContent } = variables as {
      id: string;
      userEditedContent: string | null;
    };
    return HttpResponse.json({
      data: {
        editAIArtifact: candidateContextMockBackend.editAIArtifact(
          id,
          userEditedContent
        )
      }
    });
  }),

  graphql.mutation("UpdateAIArtifactStatus", ({ variables }) => {
    const { id, status } = variables as { id: string; status: ArtifactStatus };
    return HttpResponse.json({
      data: {
        updateAIArtifactStatus:
          candidateContextMockBackend.updateAIArtifactStatus(id, status)
      }
    });
  }),

  graphql.mutation("SupersedeAIArtifact", ({ variables }) => {
    const { id, supersededBy } = variables as {
      id: string;
      supersededBy: string;
    };
    return HttpResponse.json({
      data: {
        supersedeAIArtifact: candidateContextMockBackend.supersedeAIArtifact(
          id,
          supersededBy
        )
      }
    });
  })
];

export function resetCandidateContextMockData() {
  candidateContextMockBackend.reset();
}
