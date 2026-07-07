package rolesearch

import (
	"context"
	"fmt"
	"strings"

	"github.com/tonirilix/career-pipeline/apps/api/internal/application/ports"
	"github.com/tonirilix/career-pipeline/apps/api/internal/domain"
)

type StaticProvider struct{}

var _ ports.RoleSearchProvider = (*StaticProvider)(nil)

func NewStaticProvider() *StaticProvider {
	return &StaticProvider{}
}

func (p *StaticProvider) Search(ctx context.Context, request domain.RoleSearchRequest) ([]domain.RoleSearchProviderResult, error) {
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}

	limit := request.MaxRoles
	if limit <= 0 || limit > 3 {
		limit = 3
	}
	title := firstCSV(request.Topic.TargetTitles)
	if title == "" {
		title = "Software Engineer"
	}
	stack := firstCSV(request.Topic.PreferredStack)
	if stack == "" {
		stack = "Go, React"
	}
	location := request.Topic.Location
	if location == "" {
		location = "Remote"
	}

	companies := []string{"Northstar Labs", "SignalWorks", "Atlas Product Group"}
	results := make([]domain.RoleSearchProviderResult, 0, limit)
	for i := 0; i < limit; i++ {
		company := companies[i%len(companies)]
		results = append(results, domain.RoleSearchProviderResult{
			Company:           company,
			Title:             title,
			PostingURL:        fmt.Sprintf("https://example.com/jobs/%s-%d", slug(company), i+1),
			Source:            string(domain.SourceOther),
			ProviderSource:    "Static role search provider",
			Description:       fmt.Sprintf("%s role using %s in %s.", title, stack, location),
			RawSourceText:     fmt.Sprintf("Generated local search candidate for topic %q.", request.Topic.Name),
			Location:          location,
			RemoteEligibility: domain.RoleRemoteUnknown,
			EmploymentType:    request.Topic.EmploymentType,
			Seniority:         request.Topic.Seniority,
			Compensation:      request.Topic.Compensation,
			Stack:             stack,
			CompanyType:       request.Topic.CompanyType,
			FreshnessStatus:   domain.RoleFreshnessUnknown,
		})
	}
	return results, nil
}

func firstCSV(value string) string {
	parts := strings.Split(value, ",")
	if len(parts) == 0 {
		return strings.TrimSpace(value)
	}
	return strings.TrimSpace(parts[0])
}

func slug(value string) string {
	value = strings.ToLower(value)
	value = strings.ReplaceAll(value, " ", "-")
	return value
}
