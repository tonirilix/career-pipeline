package server

import (
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/tonirilix/career-pipeline/apps/api/graph"
	"github.com/tonirilix/career-pipeline/apps/api/graph/resolvers"
)

type Options struct {
	Development bool
}

func NewHandler(resolver *resolvers.Resolver, options Options) http.Handler {
	graphqlServer := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: resolver}))
	graphqlServer.AddTransport(transport.POST{})
	graphqlServer.Use(extension.Introspection{})

	mux := http.NewServeMux()
	mux.Handle("/graphql", graphqlServer)

	if options.Development {
		mux.Handle("/", playground.Handler("GraphQL Playground", "/graphql"))
	}

	return CORSMiddleware(mux)
}

func CORSMiddleware(next http.Handler) http.Handler {
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
