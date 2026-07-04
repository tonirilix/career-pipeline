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
