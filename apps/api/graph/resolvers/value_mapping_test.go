package resolvers

import (
	"testing"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

func TestGraphQLValueMapping(t *testing.T) {
	stageCases := map[string]domain.ApplicationStage{
		"Saved":               domain.StageSaved,
		"Applied":             domain.StageApplied,
		"Screening":           domain.StageScreening,
		"Technical interview": domain.StageTechnicalInterview,
		"TechnicalInterview":  domain.StageTechnicalInterview,
		"Onsite":              domain.StageOnsite,
		"Offer":               domain.StageOffer,
		"Rejected":            domain.StageRejected,
		"Withdrawn":           domain.StageWithdrawn,
	}
	for input, want := range stageCases {
		got, err := mapApplicationStageInput(input)
		if err != nil || got != want {
			t.Fatalf("stage %q: expected %q, got %q (err: %v)", input, want, got, err)
		}
	}

	sourceCases := map[string]domain.JobSource{
		"LinkedIn":     domain.SourceLinkedIn,
		"Referral":     domain.SourceReferral,
		"Recruiter":    domain.SourceRecruiter,
		"Company site": domain.SourceCompanySite,
		"CompanySite":  domain.SourceCompanySite,
		"Other":        domain.SourceOther,
	}
	for input, want := range sourceCases {
		got, err := mapJobSourceInput(input)
		if err != nil || got != want {
			t.Fatalf("source %q: expected %q, got %q (err: %v)", input, want, got, err)
		}
	}

	employmentCases := map[string]domain.EmploymentType{
		"Full-time":  domain.EmploymentFullTime,
		"FullTime":   domain.EmploymentFullTime,
		"Contract":   domain.EmploymentContract,
		"Part-time":  domain.EmploymentPartTime,
		"PartTime":   domain.EmploymentPartTime,
		"Internship": domain.EmploymentInternship,
		"Other":      domain.EmploymentOther,
	}
	for input, want := range employmentCases {
		got, err := mapEmploymentTypeInput(input)
		if err != nil || got != want {
			t.Fatalf("employment %q: expected %q, got %q (err: %v)", input, want, got, err)
		}
	}

	interviewTypeCases := map[string]domain.InterviewType{
		"Recruiter screen": domain.InterviewRecruiterScreen,
		"RecruiterScreen":  domain.InterviewRecruiterScreen,
		"Hiring manager":   domain.InterviewHiringManager,
		"HiringManager":    domain.InterviewHiringManager,
		"Technical":        domain.InterviewTechnical,
		"Onsite":           domain.InterviewOnsite,
		"Other":            domain.InterviewOther,
	}
	for input, want := range interviewTypeCases {
		got, err := mapInterviewTypeInput(input)
		if err != nil || got != want {
			t.Fatalf("interview type %q: expected %q, got %q (err: %v)", input, want, got, err)
		}
	}

	outcomeCases := map[string]domain.InterviewOutcome{
		"Scheduled":   domain.OutcomeScheduled,
		"Passed":      domain.OutcomePassed,
		"Rejected":    domain.OutcomeRejected,
		"No decision": domain.OutcomeNoDecision,
		"NoDecision":  domain.OutcomeNoDecision,
	}
	for input, want := range outcomeCases {
		got, err := mapInterviewOutcomeInput(input)
		if err != nil || got != want {
			t.Fatalf("interview outcome %q: expected %q, got %q (err: %v)", input, want, got, err)
		}
	}
}

func TestGraphQLValueMappingRejectsUnsupportedValues(t *testing.T) {
	if _, err := mapApplicationStageInput("Archived"); err == nil {
		t.Fatal("expected unsupported stage to error")
	}
	if _, err := mapJobSourceInput("Email"); err == nil {
		t.Fatal("expected unsupported source to error")
	}
	if _, err := mapEmploymentTypeInput("Freelance"); err == nil {
		t.Fatal("expected unsupported employment type to error")
	}
	if _, err := mapInterviewTypeInput("Panel"); err == nil {
		t.Fatal("expected unsupported interview type to error")
	}
	if _, err := mapInterviewOutcomeInput("Maybe"); err == nil {
		t.Fatal("expected unsupported interview outcome to error")
	}
}
