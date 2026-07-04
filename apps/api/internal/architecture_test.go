package internal_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestDomainDoesNotImportRuntimeCompositionConcerns(t *testing.T) {
	violations := forbiddenImports(t, "domain", []string{
		"database/sql",
		"net/http",
		"github.com/99designs/gqlgen",
		"github.com/openai",
		"github.com/anthropics",
		"github.com/anthropics/anthropic-sdk-go",
		"google.golang.org/genai",
		"github.com/golang-migrate",
		"internal/bootstrap",
		"internal/composition",
		"internal/config",
		"internal/infrastructure",
		"internal/server",
	})

	if len(violations) > 0 {
		t.Fatalf("domain imports runtime concerns: %v", violations)
	}
}

func TestApplicationDoesNotImportRuntimeCompositionConcerns(t *testing.T) {
	violations := forbiddenImports(t, "application", []string{
		"database/sql",
		"net/http",
		"github.com/99designs/gqlgen",
		"github.com/openai",
		"github.com/anthropics",
		"github.com/anthropics/anthropic-sdk-go",
		"google.golang.org/genai",
		"github.com/golang-migrate",
		"internal/bootstrap",
		"internal/composition",
		"internal/config",
		"internal/infrastructure",
		"internal/server",
	})

	if len(violations) > 0 {
		t.Fatalf("application imports runtime concerns: %v", violations)
	}
}

func TestRuntimeWiringStaysInCompositionModule(t *testing.T) {
	violations := referencesOutsideAllowedFiles(t, "..", []string{
		"persistence.NewPostgreSQL",
		"usecases.NewCreateApplication",
		"usecases.NewAdvanceStage",
		"usecases.NewScheduleInterview",
		"usecases.NewRecordInterviewOutcome",
		"usecases.NewAddFollowUp",
		"usecases.NewCompleteFollowUp",
		"usecases.NewAddNote",
		"usecases.NewListApplications",
		"usecases.NewGetCandidateProfile",
		"usecases.NewUpdateCandidateProfile",
		"usecases.NewCandidateMemory",
		"usecases.NewGetCandidateGroundingContext",
		"usecases.NewAIArtifacts",
		"&resolvers.Resolver",
	}, map[string]bool{
		filepath.Join("internal", "composition", "composition.go"): true,
	})

	if len(violations) > 0 {
		t.Fatalf("runtime wiring escaped composition module: %v", violations)
	}
}

func forbiddenImports(t *testing.T, root string, forbidden []string) []string {
	t.Helper()

	var violations []string
	for _, file := range goSourceFiles(t, root) {
		source := readFile(t, file)
		imports := importBlock(source)
		for _, term := range forbidden {
			if strings.Contains(imports, term) {
				violations = append(violations, relativeInternalPath(t, file)+" imports "+term)
			}
		}
	}
	return violations
}

func referencesOutsideAllowedFiles(
	t *testing.T,
	root string,
	references []string,
	allowed map[string]bool,
) []string {
	t.Helper()

	var violations []string
	for _, file := range goSourceFiles(t, root) {
		relative := relativeInternalPath(t, file)
		if allowed[relative] {
			continue
		}
		source := readFile(t, file)
		for _, reference := range references {
			if strings.Contains(source, reference) {
				violations = append(violations, relative+" references "+reference)
			}
		}
	}
	return violations
}

func goSourceFiles(t *testing.T, root string) []string {
	t.Helper()

	var files []string
	err := filepath.WalkDir(root, func(path string, entry os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() {
			return nil
		}
		if strings.HasSuffix(path, ".go") && !strings.HasSuffix(path, "_test.go") {
			files = append(files, path)
		}
		return nil
	})
	if err != nil {
		t.Fatalf("walk %s: %v", root, err)
	}
	return files
}

func readFile(t *testing.T, path string) string {
	t.Helper()

	source, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read %s: %v", path, err)
	}
	return string(source)
}

func importBlock(source string) string {
	importIndex := strings.Index(source, "import")
	if importIndex == -1 {
		return ""
	}
	remaining := source[importIndex:]
	if strings.HasPrefix(remaining, "import (") {
		end := strings.Index(remaining, ")\n")
		if end == -1 {
			return remaining
		}
		return remaining[:end]
	}
	end := strings.Index(remaining, "\n")
	if end == -1 {
		return remaining
	}
	return remaining[:end]
}

func relativeInternalPath(t *testing.T, path string) string {
	t.Helper()

	relative, err := filepath.Rel("..", path)
	if err != nil {
		t.Fatalf("relative path for %s: %v", path, err)
	}
	return relative
}
