package usecases_test

import (
	"errors"
	"fmt"
	"time"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/application/ports"
	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

// fakeClock always returns the fixed time.
type fakeClock struct{ t time.Time }

func (c *fakeClock) Now() time.Time { return c.t }

// fakeIDs returns sequential IDs.
type fakeIDs struct{ n int }

func (g *fakeIDs) New() string {
	g.n++
	return fmt.Sprintf("id-%d", g.n)
}

// fakeAppRepo is an in-memory JobApplicationRepository.
type fakeAppRepo struct {
	apps map[string]*domain.JobApplication
}

func newFakeAppRepo() *fakeAppRepo { return &fakeAppRepo{apps: map[string]*domain.JobApplication{}} }

func (r *fakeAppRepo) Save(app *domain.JobApplication) error {
	r.apps[app.ID] = app
	return nil
}
func (r *fakeAppRepo) FindByID(id string) (*domain.JobApplication, error) {
	app, ok := r.apps[id]
	if !ok {
		return nil, domain.ErrApplicationNotFound
	}
	return app, nil
}
func (r *fakeAppRepo) List(filter ports.ListApplicationsFilter) ([]*domain.JobApplication, error) {
	var out []*domain.JobApplication
	for _, app := range r.apps {
		out = append(out, app)
	}
	return out, nil
}
func (r *fakeAppRepo) UpdateStage(id string, stage domain.ApplicationStage) error {
	app, ok := r.apps[id]
	if !ok {
		return domain.ErrApplicationNotFound
	}
	app.Stage = stage
	return nil
}

func (r *fakeAppRepo) clone() *fakeAppRepo {
	clone := newFakeAppRepo()
	for id, app := range r.apps {
		copied := *app
		clone.apps[id] = &copied
	}
	return clone
}

func (r *fakeAppRepo) restore(snapshot *fakeAppRepo) {
	r.apps = snapshot.apps
}

// fakeTimelineRepo is an in-memory TimelineRepository.
type fakeTimelineRepo struct {
	events  map[string][]*domain.TimelineEvent
	saveErr error
}

func newFakeTimelineRepo() *fakeTimelineRepo {
	return &fakeTimelineRepo{events: map[string][]*domain.TimelineEvent{}}
}
func (r *fakeTimelineRepo) Save(applicationID string, event *domain.TimelineEvent) error {
	if r.saveErr != nil {
		return r.saveErr
	}
	r.events[applicationID] = append(r.events[applicationID], event)
	return nil
}
func (r *fakeTimelineRepo) ListByApplication(applicationID string) ([]*domain.TimelineEvent, error) {
	return r.events[applicationID], nil
}

func (r *fakeTimelineRepo) clone() *fakeTimelineRepo {
	clone := newFakeTimelineRepo()
	clone.saveErr = r.saveErr
	for id, events := range r.events {
		clone.events[id] = cloneTimelineEvents(events)
	}
	return clone
}

func (r *fakeTimelineRepo) restore(snapshot *fakeTimelineRepo) {
	r.events = snapshot.events
	r.saveErr = snapshot.saveErr
}

// fakeInterviewRepo is an in-memory InterviewRepository.
type fakeInterviewRepo struct {
	interviews map[string]*domain.Interview
	byApp      map[string][]string
}

func newFakeInterviewRepo() *fakeInterviewRepo {
	return &fakeInterviewRepo{
		interviews: map[string]*domain.Interview{},
		byApp:      map[string][]string{},
	}
}
func (r *fakeInterviewRepo) Save(applicationID string, iv *domain.Interview) error {
	r.interviews[iv.ID] = iv
	r.byApp[applicationID] = append(r.byApp[applicationID], iv.ID)
	return nil
}
func (r *fakeInterviewRepo) FindByID(id string) (*domain.Interview, error) {
	iv, ok := r.interviews[id]
	if !ok {
		return nil, domain.ErrInterviewNotFound
	}
	return iv, nil
}
func (r *fakeInterviewRepo) UpdateOutcome(id string, outcome domain.InterviewOutcome) error {
	iv, ok := r.interviews[id]
	if !ok {
		return domain.ErrInterviewNotFound
	}
	iv.Outcome = outcome
	return nil
}
func (r *fakeInterviewRepo) ListByApplication(applicationID string) ([]*domain.Interview, error) {
	var out []*domain.Interview
	for _, id := range r.byApp[applicationID] {
		out = append(out, r.interviews[id])
	}
	return out, nil
}

func (r *fakeInterviewRepo) clone() *fakeInterviewRepo {
	clone := newFakeInterviewRepo()
	for id, interview := range r.interviews {
		copied := *interview
		clone.interviews[id] = &copied
	}
	for appID, ids := range r.byApp {
		clone.byApp[appID] = append([]string(nil), ids...)
	}
	return clone
}

func (r *fakeInterviewRepo) restore(snapshot *fakeInterviewRepo) {
	r.interviews = snapshot.interviews
	r.byApp = snapshot.byApp
}

// fakeFollowUpRepo is an in-memory FollowUpRepository.
type fakeFollowUpRepo struct {
	followUps     map[string]*domain.FollowUpReminder
	byApp         map[string][]string
	deactivateErr error
}

func newFakeFollowUpRepo() *fakeFollowUpRepo {
	return &fakeFollowUpRepo{
		followUps: map[string]*domain.FollowUpReminder{},
		byApp:     map[string][]string{},
	}
}
func (r *fakeFollowUpRepo) Save(fu *domain.FollowUpReminder) error {
	r.followUps[fu.ID] = fu
	r.byApp[fu.ApplicationID] = append(r.byApp[fu.ApplicationID], fu.ID)
	return nil
}
func (r *fakeFollowUpRepo) FindByID(id string) (*domain.FollowUpReminder, error) {
	fu, ok := r.followUps[id]
	if !ok {
		return nil, domain.ErrFollowUpNotFound
	}
	return fu, nil
}
func (r *fakeFollowUpRepo) UpdateCompleted(id string, completedAt time.Time) error {
	fu, ok := r.followUps[id]
	if !ok {
		return domain.ErrFollowUpNotFound
	}
	fu.CompletedAt = &completedAt
	return nil
}
func (r *fakeFollowUpRepo) ListByApplication(applicationID string) ([]*domain.FollowUpReminder, error) {
	var out []*domain.FollowUpReminder
	for _, id := range r.byApp[applicationID] {
		out = append(out, r.followUps[id])
	}
	return out, nil
}
func (r *fakeFollowUpRepo) ListUpcoming(now time.Time) ([]*domain.FollowUpReminder, error) {
	var out []*domain.FollowUpReminder
	for _, fu := range r.followUps {
		if fu.CompletedAt == nil && fu.DueAt.After(now) {
			out = append(out, fu)
		}
	}
	return out, nil
}
func (r *fakeFollowUpRepo) ListOverdue(now time.Time) ([]*domain.FollowUpReminder, error) {
	var out []*domain.FollowUpReminder
	for _, fu := range r.followUps {
		if fu.CompletedAt == nil && fu.DueAt.Before(now) {
			out = append(out, fu)
		}
	}
	return out, nil
}
func (r *fakeFollowUpRepo) DeactivateByApplication(applicationID string, completedAt time.Time) error {
	if r.deactivateErr != nil {
		return r.deactivateErr
	}
	for _, id := range r.byApp[applicationID] {
		fu := r.followUps[id]
		if fu.CompletedAt == nil {
			fu.CompletedAt = &completedAt
		}
	}
	return nil
}

func (r *fakeFollowUpRepo) clone() *fakeFollowUpRepo {
	clone := newFakeFollowUpRepo()
	clone.deactivateErr = r.deactivateErr
	for id, followUp := range r.followUps {
		copied := *followUp
		if followUp.CompletedAt != nil {
			completedAt := *followUp.CompletedAt
			copied.CompletedAt = &completedAt
		}
		clone.followUps[id] = &copied
	}
	for appID, ids := range r.byApp {
		clone.byApp[appID] = append([]string(nil), ids...)
	}
	return clone
}

func (r *fakeFollowUpRepo) restore(snapshot *fakeFollowUpRepo) {
	r.followUps = snapshot.followUps
	r.byApp = snapshot.byApp
	r.deactivateErr = snapshot.deactivateErr
}

// fakeNoteRepo is an in-memory NoteRepository.
type fakeNoteRepo struct {
	notes map[string]*domain.ApplicationNote
	byApp map[string][]string
}

func newFakeNoteRepo() *fakeNoteRepo {
	return &fakeNoteRepo{
		notes: map[string]*domain.ApplicationNote{},
		byApp: map[string][]string{},
	}
}
func (r *fakeNoteRepo) Save(applicationID string, note *domain.ApplicationNote) error {
	r.notes[note.ID] = note
	r.byApp[applicationID] = append(r.byApp[applicationID], note.ID)
	return nil
}
func (r *fakeNoteRepo) ListByApplication(applicationID string) ([]*domain.ApplicationNote, error) {
	var out []*domain.ApplicationNote
	for _, id := range r.byApp[applicationID] {
		out = append(out, r.notes[id])
	}
	return out, nil
}

func (r *fakeNoteRepo) clone() *fakeNoteRepo {
	clone := newFakeNoteRepo()
	for id, note := range r.notes {
		copied := *note
		clone.notes[id] = &copied
	}
	for appID, ids := range r.byApp {
		clone.byApp[appID] = append([]string(nil), ids...)
	}
	return clone
}

func (r *fakeNoteRepo) restore(snapshot *fakeNoteRepo) {
	r.notes = snapshot.notes
	r.byApp = snapshot.byApp
}

type fakeTransactor struct {
	apps       *fakeAppRepo
	followUps  *fakeFollowUpRepo
	timeline   *fakeTimelineRepo
	interviews *fakeInterviewRepo
	notes      *fakeNoteRepo
}

func newFakeTransactor(
	apps *fakeAppRepo,
	followUps *fakeFollowUpRepo,
	timeline *fakeTimelineRepo,
	interviews *fakeInterviewRepo,
	notes *fakeNoteRepo,
) *fakeTransactor {
	return &fakeTransactor{
		apps:       apps,
		followUps:  followUps,
		timeline:   timeline,
		interviews: interviews,
		notes:      notes,
	}
}

func (t *fakeTransactor) WithTransaction(fn func(repos ports.Repositories) error) error {
	appsSnapshot := t.apps.clone()
	followUpsSnapshot := t.followUps.clone()
	timelineSnapshot := t.timeline.clone()
	interviewsSnapshot := t.interviews.clone()
	notesSnapshot := t.notes.clone()

	err := fn(ports.Repositories{
		Applications: t.apps,
		Interviews:   t.interviews,
		FollowUps:    t.followUps,
		Notes:        t.notes,
		Timeline:     t.timeline,
	})
	if err != nil {
		t.apps.restore(appsSnapshot)
		t.followUps.restore(followUpsSnapshot)
		t.timeline.restore(timelineSnapshot)
		t.interviews.restore(interviewsSnapshot)
		t.notes.restore(notesSnapshot)
	}
	return err
}

func cloneTimelineEvents(events []*domain.TimelineEvent) []*domain.TimelineEvent {
	out := make([]*domain.TimelineEvent, len(events))
	for i, event := range events {
		copied := *event
		out[i] = &copied
	}
	return out
}

// errNotFound is used to distinguish not-found from other errors.
var errNotFound = errors.New("not found")
