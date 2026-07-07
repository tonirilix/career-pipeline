package domain

import (
	"encoding/json"
	"time"
)

type RoleSourceKind string

const (
	RoleSourceSearchResult      RoleSourceKind = "Search result"
	RoleSourceManualURL         RoleSourceKind = "Manual URL"
	RoleSourcePastedDescription RoleSourceKind = "Pasted description"
	RoleSourceRecruiter         RoleSourceKind = "Recruiter"
	RoleSourceOther             RoleSourceKind = "Other"
)

type RoleDecisionStatus string

const (
	RoleDecisionNew          RoleDecisionStatus = "New"
	RoleDecisionSaved        RoleDecisionStatus = "Saved"
	RoleDecisionRejected     RoleDecisionStatus = "Rejected"
	RoleDecisionRevisitLater RoleDecisionStatus = "Revisit later"
	RoleDecisionPromoted     RoleDecisionStatus = "Promoted"
)

type RoleFreshnessStatus string

const (
	RoleFreshnessUnknown RoleFreshnessStatus = "Unknown"
	RoleFreshnessLive    RoleFreshnessStatus = "Live"
	RoleFreshnessClosed  RoleFreshnessStatus = "Closed"
)

type RoleRemoteEligibility string

const (
	RoleRemoteUnknown           RoleRemoteEligibility = "Unknown"
	RoleRemoteRemote            RoleRemoteEligibility = "Remote"
	RoleRemoteHybrid            RoleRemoteEligibility = "Hybrid"
	RoleRemoteOnsite            RoleRemoteEligibility = "Onsite"
	RoleRemoteCountryRestricted RoleRemoteEligibility = "Country restricted"
)

type RoleSeniority string

const (
	RoleSeniorityUnknown   RoleSeniority = "Unknown"
	RoleSeniorityJunior    RoleSeniority = "Junior"
	RoleSeniorityMid       RoleSeniority = "Mid"
	RoleSenioritySenior    RoleSeniority = "Senior"
	RoleSeniorityLead      RoleSeniority = "Lead"
	RoleSeniorityStaff     RoleSeniority = "Staff"
	RoleSeniorityPrincipal RoleSeniority = "Principal"
	RoleSeniorityManager   RoleSeniority = "Manager"
)

type RoleCompanyType string

const (
	RoleCompanyUnknown     RoleCompanyType = "Unknown"
	RoleCompanyProduct     RoleCompanyType = "Product"
	RoleCompanyConsultancy RoleCompanyType = "Consultancy"
	RoleCompanyAgency      RoleCompanyType = "Agency"
	RoleCompanyStartup     RoleCompanyType = "Startup"
	RoleCompanyEnterprise  RoleCompanyType = "Enterprise"
	RoleCompanyOther       RoleCompanyType = "Other"
)

type RoleRejectionReason string

const (
	RoleRejectionNone              RoleRejectionReason = ""
	RoleRejectionWrongLocation     RoleRejectionReason = "Wrong location"
	RoleRejectionWrongStack        RoleRejectionReason = "Wrong stack"
	RoleRejectionLowCompensation   RoleRejectionReason = "Low compensation"
	RoleRejectionSeniorityMismatch RoleRejectionReason = "Seniority mismatch"
	RoleRejectionConsultancy       RoleRejectionReason = "Consultancy"
	RoleRejectionDuplicate         RoleRejectionReason = "Duplicate"
	RoleRejectionClosed            RoleRejectionReason = "Closed"
	RoleRejectionOther             RoleRejectionReason = "Other"
)

type RoleSearchTopic struct {
	ID               string
	Name             string
	TargetTitles     string
	PreferredStack   string
	Location         string
	RemotePreference string
	EmploymentType   EmploymentType
	CompanyType      RoleCompanyType
	Compensation     string
	Seniority        RoleSeniority
	Notes            string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

type RoleRecord struct {
	ID                    string
	SearchTopicID         *string
	Company               string
	Title                 string
	PostingURL            string
	Source                string
	SourceKind            RoleSourceKind
	ProviderSource        string
	Description           string
	RawSourceText         string
	Location              string
	RemoteEligibility     RoleRemoteEligibility
	EmploymentType        EmploymentType
	Seniority             RoleSeniority
	Compensation          string
	Stack                 string
	CompanyType           RoleCompanyType
	FreshnessStatus       RoleFreshnessStatus
	FreshnessCheckedAt    *time.Time
	DecisionStatus        RoleDecisionStatus
	RejectionReason       RoleRejectionReason
	PromotedApplicationID *string
	Metadata              json.RawMessage
	CreatedAt             time.Time
	UpdatedAt             time.Time
}

type RoleSearchRequest struct {
	Topic    RoleSearchTopic
	MaxRoles int
}

type RoleSearchProviderResult struct {
	Company            string
	Title              string
	PostingURL         string
	Source             string
	ProviderSource     string
	Description        string
	RawSourceText      string
	Location           string
	RemoteEligibility  RoleRemoteEligibility
	EmploymentType     EmploymentType
	Seniority          RoleSeniority
	Compensation       string
	Stack              string
	CompanyType        RoleCompanyType
	FreshnessStatus    RoleFreshnessStatus
	FreshnessCheckedAt *time.Time
	Metadata           json.RawMessage
}

type ImportedRoleSummary struct {
	RoleID     string
	Company    string
	Title      string
	PostingURL string
}

type SkippedRoleSummary struct {
	Company    string
	Title      string
	PostingURL string
	Reason     string
}

type RoleSearchRunResult struct {
	TopicID       string
	ImportedCount int
	SkippedCount  int
	Imported      []ImportedRoleSummary
	Skipped       []SkippedRoleSummary
}

func ValidateRoleDecisionStatus(status RoleDecisionStatus) error {
	switch status {
	case RoleDecisionNew, RoleDecisionSaved, RoleDecisionRejected, RoleDecisionRevisitLater, RoleDecisionPromoted:
		return nil
	default:
		return ErrInvalidRoleDecisionStatus
	}
}

func ValidateRoleFreshnessStatus(status RoleFreshnessStatus) error {
	switch status {
	case RoleFreshnessUnknown, RoleFreshnessLive, RoleFreshnessClosed:
		return nil
	default:
		return ErrInvalidRoleFreshnessStatus
	}
}
