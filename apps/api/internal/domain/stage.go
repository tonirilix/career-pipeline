package domain

import "errors"

type ApplicationStage string

const (
	StageSaved               ApplicationStage = "Saved"
	StageApplied             ApplicationStage = "Applied"
	StageScreening           ApplicationStage = "Screening"
	StageTechnicalInterview  ApplicationStage = "Technical interview"
	StageOnsite              ApplicationStage = "Onsite"
	StageOffer               ApplicationStage = "Offer"
	StageRejected            ApplicationStage = "Rejected"
	StageWithdrawn           ApplicationStage = "Withdrawn"
)

var allowedTransitions = map[ApplicationStage][]ApplicationStage{
	StageSaved:              {StageApplied, StageWithdrawn},
	StageApplied:            {StageScreening, StageRejected, StageWithdrawn},
	StageScreening:          {StageTechnicalInterview, StageRejected, StageWithdrawn},
	StageTechnicalInterview: {StageOnsite, StageRejected, StageWithdrawn},
	StageOnsite:             {StageOffer, StageRejected, StageWithdrawn},
	StageOffer:              {StageRejected, StageWithdrawn},
	StageRejected:           {StageApplied},
	StageWithdrawn:          {StageApplied},
}

func ValidateStageTransition(from, to ApplicationStage) error {
	targets, ok := allowedTransitions[from]
	if !ok {
		return ErrInvalidStageTransition
	}
	for _, t := range targets {
		if t == to {
			return nil
		}
	}
	return ErrInvalidStageTransition
}

func IsClosedStage(stage ApplicationStage) bool {
	return stage == StageRejected || stage == StageWithdrawn
}

var ErrInvalidStageTransition = errors.New("invalid stage transition")
