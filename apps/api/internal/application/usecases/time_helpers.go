package usecases

import (
	"fmt"
	"time"

	"github.com/tonirilix/react-hexagonal-architecture/apps/api/internal/domain"
)

var timeFormats = []string{
	time.RFC3339,
	"2006-01-02T15:04",
	"2006-01-02T15:04:05",
	"2006-01-02",
}

func latestEventTime(events []*domain.TimelineEvent) *time.Time {
	var latest *time.Time
	for _, e := range events {
		t := e.OccurredAt
		if latest == nil || t.After(*latest) {
			latest = &t
		}
	}
	return latest
}

func parseTime(s string) (time.Time, error) {
	for _, format := range timeFormats {
		if t, err := time.Parse(format, s); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("cannot parse time %q", s)
}
