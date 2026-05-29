package usecases

import (
	"context"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

type ListUpcomingFollowUps struct {
	followUps ports.FollowUpRepository
	clock     ports.Clock
}

func NewListUpcomingFollowUps(followUps ports.FollowUpRepository, clock ports.Clock) *ListUpcomingFollowUps {
	return &ListUpcomingFollowUps{followUps: followUps, clock: clock}
}

func (uc *ListUpcomingFollowUps) Execute(ctx context.Context) ([]*domain.FollowUpReminder, error) {
	return uc.followUps.ListUpcoming(ctx, uc.clock.Now())
}

type ListOverdueFollowUps struct {
	followUps ports.FollowUpRepository
	clock     ports.Clock
}

func NewListOverdueFollowUps(followUps ports.FollowUpRepository, clock ports.Clock) *ListOverdueFollowUps {
	return &ListOverdueFollowUps{followUps: followUps, clock: clock}
}

func (uc *ListOverdueFollowUps) Execute(ctx context.Context) ([]*domain.FollowUpReminder, error) {
	return uc.followUps.ListOverdue(ctx, uc.clock.Now())
}
