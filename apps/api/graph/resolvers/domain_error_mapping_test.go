package resolvers

import (
	"testing"

	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

func TestMapDomainErrorMapsApplicationIntakeErrors(t *testing.T) {
	tests := []struct {
		name string
		err  error
		want string
	}{
		{
			name: "company required",
			err:  domain.ErrCompanyRequired,
			want: "company is required",
		},
		{
			name: "role title required",
			err:  domain.ErrRoleTitleRequired,
			want: "role title is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := mapDomainError(tt.err)
			if got == nil || got.Error() != tt.want {
				t.Fatalf("expected %q, got %v", tt.want, got)
			}
		})
	}
}
