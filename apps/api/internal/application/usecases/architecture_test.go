package usecases_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func sourceFilesWithReference(t *testing.T, reference string, allowedFiles ...string) []string {
	t.Helper()
	allowed := map[string]bool{}
	for _, file := range allowedFiles {
		allowed[file] = true
	}

	files, err := filepath.Glob("*.go")
	if err != nil {
		t.Fatalf("glob source files: %v", err)
	}

	var violations []string
	for _, file := range files {
		if strings.HasSuffix(file, "_test.go") || allowed[file] {
			continue
		}
		source, err := os.ReadFile(file)
		if err != nil {
			t.Fatalf("read %s: %v", file, err)
		}
		if strings.Contains(string(source), reference) {
			violations = append(violations, file)
		}
	}

	return violations
}

func TestCreateApplicationUsesTransactionSeam(t *testing.T) {
	source, err := os.ReadFile("create_application.go")
	if err != nil {
		t.Fatalf("read create_application.go: %v", err)
	}
	text := string(source)

	if !strings.Contains(text, "ports.Transactor") {
		t.Fatal("CreateApplication must depend on the transaction port")
	}
	if !strings.Contains(text, "WithTransaction") {
		t.Fatal("CreateApplication must execute persistence through the transaction seam")
	}
	if strings.Contains(text, "ports.JobApplicationRepository") || strings.Contains(text, "ports.TimelineRepository") {
		t.Fatal("CreateApplication must not depend directly on write repositories")
	}
}
