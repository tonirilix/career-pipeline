package bootstrap

import (
	"database/sql"
	"embed"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

//go:embed seed.sql
var seedSQL string

type Options struct {
	MigrateOnly bool
	SeedOnly    bool
}

type Decision struct {
	ContinueServing bool
	Message         string
}

type Store interface {
	RunMigrations() error
	IsEmpty() (bool, error)
	Seed() error
}

type PostgreSQLStore struct {
	db *sql.DB
}

func OpenPostgreSQL(databaseURL string) (*sql.DB, error) {
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("connect to PostgreSQL using DATABASE_URL: %w", err)
	}
	return db, nil
}

func NewPostgreSQLStore(db *sql.DB) *PostgreSQLStore {
	return &PostgreSQLStore{db: db}
}

func (s *PostgreSQLStore) RunMigrations() error {
	source, err := iofs.New(migrationsFS, "migrations")
	if err != nil {
		return fmt.Errorf("migrations source: %w", err)
	}
	driver, err := postgres.WithInstance(s.db, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("migrations driver: %w", err)
	}
	m, err := migrate.NewWithInstance("iofs", source, "postgres", driver)
	if err != nil {
		return fmt.Errorf("migrate instance: %w", err)
	}
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return err
	}
	return nil
}

func (s *PostgreSQLStore) IsEmpty() (bool, error) {
	var count int
	if err := s.db.QueryRow("SELECT COUNT(*) FROM job_applications").Scan(&count); err != nil {
		return false, err
	}
	return count == 0, nil
}

func (s *PostgreSQLStore) Seed() error {
	_, err := s.db.Exec(seedSQL)
	return err
}

func Prepare(store Store, options Options) (Decision, error) {
	if err := store.RunMigrations(); err != nil {
		return Decision{}, fmt.Errorf("migrations: %w", err)
	}
	if options.MigrateOnly {
		return Decision{Message: "migrations complete"}, nil
	}

	empty, err := store.IsEmpty()
	if err != nil {
		return Decision{}, fmt.Errorf("check empty database: %w", err)
	}

	if options.SeedOnly && !empty {
		return Decision{Message: "seed skipped: database already contains job applications"}, nil
	}

	if options.SeedOnly || empty {
		if err := store.Seed(); err != nil {
			return Decision{}, fmt.Errorf("seed: %w", err)
		}
		if options.SeedOnly {
			return Decision{Message: "seed complete"}, nil
		}
	}

	return Decision{ContinueServing: true}, nil
}
