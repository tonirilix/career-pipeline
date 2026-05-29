package config

import "fmt"

const (
	defaultPort = "8080"
)

type Flags struct {
	MigrateOnly bool
	SeedOnly    bool
}

type Config struct {
	DatabaseURL string
	Port        string
	AppEnv      string
	MigrateOnly bool
	SeedOnly    bool
}

func Load(getenv func(string) string, flags Flags) (Config, error) {
	cfg := Config{
		DatabaseURL: getenv("DATABASE_URL"),
		Port:        envOrDefault(getenv, "PORT", defaultPort),
		AppEnv:      getenv("APP_ENV"),
		MigrateOnly: flags.MigrateOnly,
		SeedOnly:    flags.SeedOnly,
	}

	if cfg.DatabaseURL == "" {
		return Config{}, fmt.Errorf("DATABASE_URL is required, for example postgres://tracker:tracker@localhost:5432/tracker?sslmode=disable")
	}

	return cfg, nil
}

func (c Config) Development() bool {
	return c.AppEnv == "development"
}

func (c Config) Address() string {
	return ":" + c.Port
}

func envOrDefault(getenv func(string) string, key string, fallback string) string {
	if value := getenv(key); value != "" {
		return value
	}
	return fallback
}
