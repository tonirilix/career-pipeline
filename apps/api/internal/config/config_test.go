package config

import (
	"strings"
	"testing"
)

func TestLoadRequiresDatabaseURL(t *testing.T) {
	_, err := Load(env(map[string]string{}), Flags{})
	if err == nil {
		t.Fatal("expected missing DATABASE_URL error")
	}
	if !strings.Contains(err.Error(), "DATABASE_URL is required") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestLoadDefaultsPortAndAppEnv(t *testing.T) {
	cfg, err := Load(env(map[string]string{
		"DATABASE_URL": "postgres://tracker",
	}), Flags{})
	if err != nil {
		t.Fatalf("Load: %v", err)
	}

	if cfg.Port != "8080" {
		t.Fatalf("expected default port 8080, got %q", cfg.Port)
	}
	if cfg.AppEnv != "" {
		t.Fatalf("expected empty app env, got %q", cfg.AppEnv)
	}
	if cfg.Development() {
		t.Fatal("expected non-development config by default")
	}
}

func TestLoadUsesExplicitPort(t *testing.T) {
	cfg, err := Load(env(map[string]string{
		"DATABASE_URL": "postgres://tracker",
		"PORT":         "9090",
	}), Flags{})
	if err != nil {
		t.Fatalf("Load: %v", err)
	}

	if cfg.Port != "9090" {
		t.Fatalf("expected explicit port 9090, got %q", cfg.Port)
	}
	if cfg.Address() != ":9090" {
		t.Fatalf("expected address :9090, got %q", cfg.Address())
	}
}

func TestLoadDetectsDevelopmentModeAndFlags(t *testing.T) {
	cfg, err := Load(env(map[string]string{
		"DATABASE_URL": "postgres://tracker",
		"APP_ENV":      "development",
	}), Flags{MigrateOnly: true, SeedOnly: true})
	if err != nil {
		t.Fatalf("Load: %v", err)
	}

	if !cfg.Development() {
		t.Fatal("expected development mode")
	}
	if !cfg.MigrateOnly || !cfg.SeedOnly {
		t.Fatalf("expected command flags to be copied into config: %+v", cfg)
	}
}

func env(values map[string]string) func(string) string {
	return func(key string) string {
		return values[key]
	}
}
