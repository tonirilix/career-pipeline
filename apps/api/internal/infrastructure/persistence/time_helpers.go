package persistence

import "time"

var storedTimeFormats = []string{
	time.RFC3339,
	"2006-01-02T15:04:05Z07:00",
	"2006-01-02 15:04:05",
	"2006-01-02T15:04:05",
}

func parseStoredTime(s string) (time.Time, error) {
	for _, format := range storedTimeFormats {
		if t, err := time.Parse(format, s); err == nil {
			return t, nil
		}
	}
	return time.Time{}, nil
}
