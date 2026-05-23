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
