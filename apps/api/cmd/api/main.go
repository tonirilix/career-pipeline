package main

import (
	"database/sql"
	"embed"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/google/uuid"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/tonirilix/career-pipeline/apps/api/graph"
	"github.com/tonirilix/career-pipeline/apps/api/graph/resolvers"
	"github.com/tonirilix/career-pipeline/apps/api/internal/application/usecases"
	"github.com/tonirilix/career-pipeline/apps/api/internal/infrastructure/persistence"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

//go:embed seed.sql
var seedSQL string

type wallClock struct{}

func (c *wallClock) Now() time.Time { return time.Now() }

type uuidGenerator struct{}

func (g *uuidGenerator) New() string { return uuid.NewString() }

func main() {
	migrateOnly := flag.Bool("migrate-only", false, "run migrations and exit")
	seedOnly := flag.Bool("seed-only", false, "seed the database and exit")
	flag.Parse()

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required, for example postgres://tracker:tracker@localhost:5432/tracker?sslmode=disable")
	}

	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		log.Fatalf("connect to PostgreSQL using DATABASE_URL: %v", err)
	}

	if err := runMigrations(db); err != nil {
		log.Fatalf("migrations: %v", err)
	}
	if *migrateOnly {
		log.Println("migrations complete")
		return
	}

	if *seedOnly && !isEmptyDB(db) {
		log.Println("seed skipped: database already contains job applications")
		return
	}

	if *seedOnly || isEmptyDB(db) {
		if err := seedDB(db); err != nil {
			log.Fatalf("seed: %v", err)
		}
		if *seedOnly {
			log.Println("seed complete")
			return
		}
	}

	// Wire up adapters
	appRepo := persistence.NewPostgreSQLJobApplicationRepository(db)
	interviewRepo := persistence.NewPostgreSQLInterviewRepository(db)
	followUpRepo := persistence.NewPostgreSQLFollowUpRepository(db)
	noteRepo := persistence.NewPostgreSQLNoteRepository(db)
	timelineRepo := persistence.NewPostgreSQLTimelineRepository(db)
	assembler := usecases.NewFullApplicationAssembler(followUpRepo, timelineRepo, interviewRepo, noteRepo)
	transactor := persistence.NewPostgreSQLTransactor(db)

	clock := &wallClock{}
	ids := &uuidGenerator{}

	// Wire up use cases
	createAppUC := usecases.NewCreateApplication(appRepo, timelineRepo, clock, ids)
	advanceStageUC := usecases.NewAdvanceStage(transactor, clock, ids)
	scheduleInterviewUC := usecases.NewScheduleInterview(transactor, clock, ids)
	recordOutcomeUC := usecases.NewRecordInterviewOutcome(transactor, clock, ids)
	addFollowUpUC := usecases.NewAddFollowUp(transactor, clock, ids)
	completeFollowUpUC := usecases.NewCompleteFollowUp(transactor, clock, ids)
	addNoteUC := usecases.NewAddNote(transactor, clock, ids)
	listApplicationsUC := usecases.NewListApplications(appRepo, assembler)

	// Wire up resolvers
	resolver := &resolvers.Resolver{
		CreateApplicationUC: createAppUC,
		AdvanceStageUC:      advanceStageUC,
		ScheduleInterviewUC: scheduleInterviewUC,
		RecordOutcomeUC:     recordOutcomeUC,
		AddFollowUpUC:       addFollowUpUC,
		CompleteFollowUpUC:  completeFollowUpUC,
		AddNoteUC:           addNoteUC,
		ListApplicationsUC:  listApplicationsUC,
	}

	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: resolver}))
	srv.AddTransport(transport.POST{})
	srv.Use(extension.Introspection{})

	mux := http.NewServeMux()
	mux.Handle("/graphql", srv)

	if envOrDefault("APP_ENV", "") == "development" {
		mux.Handle("/", playground.Handler("GraphQL Playground", "/graphql"))
		log.Println("GraphQL Playground available at http://localhost:" + port() + "/")
	}

	addr := ":" + port()
	log.Printf("Starting server on %s", addr)
	if err := http.ListenAndServe(addr, corsMiddleware(mux)); err != nil {
		log.Fatalf("server: %v", err)
	}
}

func runMigrations(db *sql.DB) error {
	source, err := iofs.New(migrationsFS, "migrations")
	if err != nil {
		return fmt.Errorf("migrations source: %w", err)
	}
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("migrations driver: %w", err)
	}
	m, err := migrate.NewWithInstance("iofs", source, "postgres", driver)
	if err != nil {
		return fmt.Errorf("migrate instance: %w", err)
	}
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return err
	}
	return nil
}

func isEmptyDB(db *sql.DB) bool {
	var count int
	_ = db.QueryRow("SELECT COUNT(*) FROM job_applications").Scan(&count)
	return count == 0
}

func seedDB(db *sql.DB) error {
	_, err := db.Exec(seedSQL)
	return err
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func port() string {
	return envOrDefault("PORT", "8080")
}

func envOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
