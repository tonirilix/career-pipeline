package bootstrap

import (
	"errors"
	"testing"
)

func TestPrepareMigrateOnlyExitsAfterMigrations(t *testing.T) {
	store := &fakeStore{empty: true}

	decision, err := Prepare(store, Options{MigrateOnly: true})
	if err != nil {
		t.Fatalf("Prepare: %v", err)
	}

	if decision.ContinueServing {
		t.Fatal("expected migrate-only to stop before serving")
	}
	if decision.Message != "migrations complete" {
		t.Fatalf("unexpected decision message %q", decision.Message)
	}
	if !store.migrated || store.checkedEmpty || store.seeded {
		t.Fatalf("unexpected store calls: %+v", store)
	}
}

func TestPrepareSeedOnlySkipsNonEmptyDatabase(t *testing.T) {
	store := &fakeStore{empty: false}

	decision, err := Prepare(store, Options{SeedOnly: true})
	if err != nil {
		t.Fatalf("Prepare: %v", err)
	}

	if decision.ContinueServing {
		t.Fatal("expected seed-only to stop before serving")
	}
	if decision.Message != "seed skipped: database already contains job applications" {
		t.Fatalf("unexpected decision message %q", decision.Message)
	}
	if !store.migrated || !store.checkedEmpty || store.seeded {
		t.Fatalf("unexpected store calls: %+v", store)
	}
}

func TestPrepareSeedOnlySeedsEmptyDatabase(t *testing.T) {
	store := &fakeStore{empty: true}

	decision, err := Prepare(store, Options{SeedOnly: true})
	if err != nil {
		t.Fatalf("Prepare: %v", err)
	}

	if decision.ContinueServing {
		t.Fatal("expected seed-only to stop before serving")
	}
	if decision.Message != "seed complete" {
		t.Fatalf("unexpected decision message %q", decision.Message)
	}
	if !store.migrated || !store.checkedEmpty || !store.seeded {
		t.Fatalf("unexpected store calls: %+v", store)
	}
}

func TestPrepareNormalStartupSeedsOnlyWhenEmpty(t *testing.T) {
	tests := []struct {
		name       string
		empty      bool
		wantSeeded bool
	}{
		{name: "empty", empty: true, wantSeeded: true},
		{name: "non-empty", empty: false, wantSeeded: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			store := &fakeStore{empty: tt.empty}

			decision, err := Prepare(store, Options{})
			if err != nil {
				t.Fatalf("Prepare: %v", err)
			}

			if !decision.ContinueServing {
				t.Fatal("expected normal startup to continue serving")
			}
			if store.seeded != tt.wantSeeded {
				t.Fatalf("expected seeded=%v, got %v", tt.wantSeeded, store.seeded)
			}
		})
	}
}

func TestPrepareReturnsErrors(t *testing.T) {
	migrationErr := errors.New("migration failed")
	_, err := Prepare(&fakeStore{migrationErr: migrationErr}, Options{})
	if !errors.Is(err, migrationErr) {
		t.Fatalf("expected migration error, got %v", err)
	}

	emptyErr := errors.New("count failed")
	_, err = Prepare(&fakeStore{emptyErr: emptyErr}, Options{})
	if !errors.Is(err, emptyErr) {
		t.Fatalf("expected empty check error, got %v", err)
	}

	seedErr := errors.New("seed failed")
	_, err = Prepare(&fakeStore{empty: true, seedErr: seedErr}, Options{})
	if !errors.Is(err, seedErr) {
		t.Fatalf("expected seed error, got %v", err)
	}
}

type fakeStore struct {
	empty        bool
	migrated     bool
	checkedEmpty bool
	seeded       bool
	migrationErr error
	emptyErr     error
	seedErr      error
}

func (s *fakeStore) RunMigrations() error {
	s.migrated = true
	return s.migrationErr
}

func (s *fakeStore) IsEmpty() (bool, error) {
	s.checkedEmpty = true
	return s.empty, s.emptyErr
}

func (s *fakeStore) Seed() error {
	s.seeded = true
	return s.seedErr
}
