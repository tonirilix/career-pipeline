package domain

import (
	"encoding/json"
	"time"
)

const ActiveCandidateProfileID = "default"

type CandidateProfile struct {
	ID                       string
	TargetRoles              string
	PreferredStack           string
	CompensationExpectations string
	LocationPreferences      string
	WorkConstraints          string
	CompanyPreferences       string
	WritingTone              string
	PositioningSummary       string
	CreatedAt                time.Time
	UpdatedAt                time.Time
}

type MemoryType string

const (
	MemoryApprovedFact     MemoryType = "Approved fact"
	MemorySkill            MemoryType = "Skill"
	MemoryWeakArea         MemoryType = "Weak area"
	MemoryPreference       MemoryType = "Preference"
	MemoryInterviewStory   MemoryType = "Interview story"
	MemoryCompensation     MemoryType = "Compensation"
	MemoryRedFlag          MemoryType = "Red flag"
	MemoryRecruiterContext MemoryType = "Recruiter context"
	MemoryProcessLesson    MemoryType = "Process lesson"
	MemoryOther            MemoryType = "Other"
)

type CandidateMemoryRecord struct {
	ID           string
	MemoryType   MemoryType
	Title        string
	Body         string
	Source       string
	Approved     bool
	Sensitive    bool
	ArchivedAt   *time.Time
	SupersededBy *string
	Metadata     json.RawMessage
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func (r CandidateMemoryRecord) Current() bool {
	return r.ArchivedAt == nil && r.SupersededBy == nil
}

func ValidateMemoryType(memoryType MemoryType) error {
	switch memoryType {
	case MemoryApprovedFact, MemorySkill, MemoryWeakArea, MemoryPreference,
		MemoryInterviewStory, MemoryCompensation, MemoryRedFlag,
		MemoryRecruiterContext, MemoryProcessLesson, MemoryOther:
		return nil
	default:
		return ErrInvalidMemoryType
	}
}

type CandidateGroundingContext struct {
	Profile *CandidateProfile
	Memory  []CandidateMemoryRecord
}

type ArtifactType string

const (
	ArtifactFitAnalysis      ArtifactType = "Fit analysis"
	ArtifactApplicationDraft ArtifactType = "Application draft"
	ArtifactRecruiterMessage ArtifactType = "Recruiter message"
	ArtifactInterviewPrep    ArtifactType = "Interview prep"
	ArtifactOfferAnalysis    ArtifactType = "Offer analysis"
	ArtifactDecisionNote     ArtifactType = "Decision note"
	ArtifactOther            ArtifactType = "Other"
)

type ArtifactStatus string

const (
	ArtifactDraft      ArtifactStatus = "Draft"
	ArtifactApproved   ArtifactStatus = "Approved"
	ArtifactRejected   ArtifactStatus = "Rejected"
	ArtifactSuperseded ArtifactStatus = "Superseded"
)

func ValidateArtifactStatus(status ArtifactStatus) error {
	switch status {
	case ArtifactDraft, ArtifactApproved, ArtifactRejected, ArtifactSuperseded:
		return nil
	default:
		return ErrInvalidArtifactStatus
	}
}

func ValidateArtifactType(artifactType ArtifactType) error {
	switch artifactType {
	case ArtifactFitAnalysis, ArtifactApplicationDraft, ArtifactRecruiterMessage,
		ArtifactInterviewPrep, ArtifactOfferAnalysis, ArtifactDecisionNote, ArtifactOther:
		return nil
	default:
		return ErrInvalidArtifactType
	}
}

// OwnerReference.Type is intentionally an open string, not a closed enum, so
// future owner kinds don't require a domain-level change. The known kinds
// used across this codebase are named here so every caller agrees on the
// exact literal instead of each picking its own casing.
const (
	OwnerTypeCandidateProfile = "CandidateProfile"
	OwnerTypeApplication      = "Application"
)

type OwnerReference struct {
	Type string
	ID   string
}

type ArtifactProvenance struct {
	ProviderName  *string
	ModelName     *string
	PromptID      *string
	UsageMetadata json.RawMessage
	RawProviderID *string
}

type AIArtifact struct {
	ID                string
	ArtifactType      ArtifactType
	Owner             OwnerReference
	Title             string
	SourceInputs      json.RawMessage
	GeneratedContent  string
	UserEditedContent *string
	Status            ArtifactStatus
	Sensitive         bool
	SupersededBy      *string
	Provenance        ArtifactProvenance
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

func (a AIArtifact) CurrentContent() string {
	if a.UserEditedContent != nil {
		return *a.UserEditedContent
	}
	return a.GeneratedContent
}
