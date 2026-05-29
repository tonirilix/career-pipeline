package main

import (
	"flag"
	"log"
	"net/http"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/tonirilix/career-pipeline/apps/api/internal/bootstrap"
	"github.com/tonirilix/career-pipeline/apps/api/internal/composition"
	"github.com/tonirilix/career-pipeline/apps/api/internal/config"
	"github.com/tonirilix/career-pipeline/apps/api/internal/server"
)

func main() {
	migrateOnly := flag.Bool("migrate-only", false, "run migrations and exit")
	seedOnly := flag.Bool("seed-only", false, "seed the database and exit")
	flag.Parse()

	cfg, err := config.Load(os.Getenv, config.Flags{
		MigrateOnly: *migrateOnly,
		SeedOnly:    *seedOnly,
	})
	if err != nil {
		log.Fatal(err)
	}

	db, err := bootstrap.OpenPostgreSQL(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	decision, err := bootstrap.Prepare(bootstrap.NewPostgreSQLStore(db), bootstrap.Options{
		MigrateOnly: cfg.MigrateOnly,
		SeedOnly:    cfg.SeedOnly,
	})
	if err != nil {
		log.Fatal(err)
	}
	if !decision.ContinueServing {
		log.Println(decision.Message)
		return
	}

	if cfg.Development() {
		log.Println("GraphQL Playground available at http://localhost:" + cfg.Port + "/")
	}

	handler := server.NewHandler(composition.NewResolver(db), server.Options{
		Development: cfg.Development(),
	})

	log.Printf("Starting server on %s", cfg.Address())
	if err := http.ListenAndServe(cfg.Address(), handler); err != nil {
		log.Fatalf("server: %v", err)
	}
}
