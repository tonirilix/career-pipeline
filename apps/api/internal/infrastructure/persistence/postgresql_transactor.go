package persistence

import (
	"database/sql"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
)

type PostgreSQLTransactor struct {
	db *sql.DB
}

func NewPostgreSQLTransactor(db *sql.DB) *PostgreSQLTransactor {
	return &PostgreSQLTransactor{db: db}
}

var _ ports.Transactor = (*PostgreSQLTransactor)(nil)

func (t *PostgreSQLTransactor) WithTransaction(fn func(repos ports.Repositories) error) error {
	tx, err := t.db.Begin()
	if err != nil {
		return err
	}

	repos := ports.Repositories{
		Applications: newPostgreSQLJobApplicationRepositoryWithExecutor(tx),
		Interviews:   newPostgreSQLInterviewRepositoryWithExecutor(tx),
		FollowUps:    newPostgreSQLFollowUpRepositoryWithExecutor(tx),
		Notes:        newPostgreSQLNoteRepositoryWithExecutor(tx),
		Timeline:     newPostgreSQLTimelineRepositoryWithExecutor(tx),
	}

	if err := fn(repos); err != nil {
		_ = tx.Rollback()
		return err
	}

	return tx.Commit()
}
