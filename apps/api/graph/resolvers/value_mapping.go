package resolvers

import (
	"fmt"

	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

func mapApplicationStageInput(value string) (domain.ApplicationStage, error) {
	switch value {
	case "Saved":
		return domain.StageSaved, nil
	case "Applied":
		return domain.StageApplied, nil
	case "Screening":
		return domain.StageScreening, nil
	case "Technical interview", "TechnicalInterview":
		return domain.StageTechnicalInterview, nil
	case "Onsite":
		return domain.StageOnsite, nil
	case "Offer":
		return domain.StageOffer, nil
	case "Rejected":
		return domain.StageRejected, nil
	case "Withdrawn":
		return domain.StageWithdrawn, nil
	default:
		return "", fmt.Errorf("unsupported application stage %q", value)
	}
}

func mapJobSourceInput(value string) (domain.JobSource, error) {
	switch value {
	case "LinkedIn":
		return domain.SourceLinkedIn, nil
	case "Referral":
		return domain.SourceReferral, nil
	case "Recruiter":
		return domain.SourceRecruiter, nil
	case "Company site", "CompanySite":
		return domain.SourceCompanySite, nil
	case "Other":
		return domain.SourceOther, nil
	default:
		return "", fmt.Errorf("unsupported job source %q", value)
	}
}

func mapEmploymentTypeInput(value string) (domain.EmploymentType, error) {
	switch value {
	case "Full-time", "FullTime":
		return domain.EmploymentFullTime, nil
	case "Contract":
		return domain.EmploymentContract, nil
	case "Part-time", "PartTime":
		return domain.EmploymentPartTime, nil
	case "Internship":
		return domain.EmploymentInternship, nil
	case "Other":
		return domain.EmploymentOther, nil
	default:
		return "", fmt.Errorf("unsupported employment type %q", value)
	}
}

func mapInterviewTypeInput(value string) (domain.InterviewType, error) {
	switch value {
	case "Recruiter screen", "RecruiterScreen":
		return domain.InterviewRecruiterScreen, nil
	case "Hiring manager", "HiringManager":
		return domain.InterviewHiringManager, nil
	case "Technical":
		return domain.InterviewTechnical, nil
	case "Onsite":
		return domain.InterviewOnsite, nil
	case "Other":
		return domain.InterviewOther, nil
	default:
		return "", fmt.Errorf("unsupported interview type %q", value)
	}
}

func mapInterviewOutcomeInput(value string) (domain.InterviewOutcome, error) {
	switch value {
	case "Scheduled":
		return domain.OutcomeScheduled, nil
	case "Passed":
		return domain.OutcomePassed, nil
	case "Rejected":
		return domain.OutcomeRejected, nil
	case "No decision", "NoDecision":
		return domain.OutcomeNoDecision, nil
	default:
		return "", fmt.Errorf("unsupported interview outcome %q", value)
	}
}
