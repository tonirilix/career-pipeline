package domain_test

import (
	"errors"
	"testing"

	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

func TestValidateStageTransition(t *testing.T) {
	valid := []struct {
		from domain.ApplicationStage
		to   domain.ApplicationStage
	}{
		{domain.StageSaved, domain.StageApplied},
		{domain.StageSaved, domain.StageWithdrawn},
		{domain.StageApplied, domain.StageScreening},
		{domain.StageApplied, domain.StageRejected},
		{domain.StageApplied, domain.StageWithdrawn},
		{domain.StageScreening, domain.StageTechnicalInterview},
		{domain.StageTechnicalInterview, domain.StageOnsite},
		{domain.StageOnsite, domain.StageOffer},
		{domain.StageRejected, domain.StageApplied},
		{domain.StageWithdrawn, domain.StageApplied},
	}
	for _, c := range valid {
		if err := domain.ValidateStageTransition(c.from, c.to); err != nil {
			t.Errorf("expected valid transition %s→%s, got error: %v", c.from, c.to, err)
		}
	}

	invalid := []struct {
		from domain.ApplicationStage
		to   domain.ApplicationStage
	}{
		{domain.StageSaved, domain.StageOffer},
		{domain.StageSaved, domain.StageRejected},
		{domain.StageApplied, domain.StageOffer},
		{domain.StageOffer, domain.StageApplied},
	}
	for _, c := range invalid {
		err := domain.ValidateStageTransition(c.from, c.to)
		if err == nil {
			t.Errorf("expected invalid transition %s→%s to error, got nil", c.from, c.to)
		}
		if !errors.Is(err, domain.ErrInvalidStageTransition) {
			t.Errorf("expected ErrInvalidStageTransition for %s→%s, got: %v", c.from, c.to, err)
		}
	}
}

func TestIsClosedStage(t *testing.T) {
	closed := []domain.ApplicationStage{domain.StageRejected, domain.StageWithdrawn}
	for _, s := range closed {
		if !domain.IsClosedStage(s) {
			t.Errorf("expected %s to be closed", s)
		}
	}

	open := []domain.ApplicationStage{
		domain.StageSaved, domain.StageApplied, domain.StageScreening,
		domain.StageTechnicalInterview, domain.StageOnsite, domain.StageOffer,
	}
	for _, s := range open {
		if domain.IsClosedStage(s) {
			t.Errorf("expected %s to be open", s)
		}
	}
}

func TestApplicationIntakeErrorsAreRecognizableAndDistinct(t *testing.T) {
	if !errors.Is(domain.ErrCompanyRequired, domain.ErrCompanyRequired) {
		t.Fatal("expected ErrCompanyRequired to be recognizable")
	}
	if !errors.Is(domain.ErrRoleTitleRequired, domain.ErrRoleTitleRequired) {
		t.Fatal("expected ErrRoleTitleRequired to be recognizable")
	}
	if errors.Is(domain.ErrCompanyRequired, domain.ErrNoteBodyEmpty) {
		t.Fatal("expected company error to be distinct from note body error")
	}
	if errors.Is(domain.ErrRoleTitleRequired, domain.ErrNoteBodyEmpty) {
		t.Fatal("expected role title error to be distinct from note body error")
	}
}
