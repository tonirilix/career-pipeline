package usecases

import (
	"strings"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

type AddNoteCommand struct {
	ApplicationID string
	Body          string
}

type AddNote struct {
	tx    ports.Transactor
	clock ports.Clock
	ids   ports.IDGenerator
}

func NewAddNote(tx ports.Transactor, clock ports.Clock, ids ports.IDGenerator) *AddNote {
	return &AddNote{tx: tx, clock: clock, ids: ids}
}

func (uc *AddNote) Execute(cmd AddNoteCommand) (*domain.JobApplication, error) {
	if strings.TrimSpace(cmd.Body) == "" {
		return nil, domain.ErrNoteBodyEmpty
	}

	var result *domain.JobApplication
	err := uc.tx.WithTransaction(func(repos ports.Repositories) error {
		app, err := repos.Applications.FindByID(cmd.ApplicationID)
		if err != nil {
			return err
		}

		now := uc.clock.Now()
		note := &domain.ApplicationNote{
			ID:        uc.ids.New(),
			Body:      cmd.Body,
			CreatedAt: now,
		}
		if err := repos.Notes.Save(app.ID, note); err != nil {
			return err
		}

		event := &domain.TimelineEvent{
			ID:          uc.ids.New(),
			OccurredAt:  now,
			Description: "Added note",
		}
		if err := repos.Timeline.Save(app.ID, event); err != nil {
			return err
		}

		loaded, err := NewFullApplicationAssembler(repos.FollowUps, repos.Timeline, repos.Interviews, repos.Notes).Load(app)
		if err != nil {
			return err
		}
		result = loaded
		return nil
	})
	return result, err
}
