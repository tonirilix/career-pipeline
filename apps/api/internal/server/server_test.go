package server

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/tonirilix/career-pipeline/apps/api/graph/resolvers"
)

func TestNewHandlerMountsGraphQLEndpoint(t *testing.T) {
	handler := NewHandler(&resolvers.Resolver{}, Options{})
	request := httptest.NewRequest(http.MethodPost, "/graphql", strings.NewReader(`{}`))
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code == http.StatusNotFound {
		t.Fatal("expected /graphql to be mounted")
	}
}

func TestNewHandlerMountsPlaygroundInDevelopment(t *testing.T) {
	handler := NewHandler(&resolvers.Resolver{}, Options{Development: true})
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected playground status 200, got %d", recorder.Code)
	}
	if !strings.Contains(recorder.Body.String(), "GraphQL Playground") {
		t.Fatal("expected GraphQL Playground response")
	}
}

func TestNewHandlerDoesNotMountPlaygroundOutsideDevelopment(t *testing.T) {
	handler := NewHandler(&resolvers.Resolver{}, Options{})
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("expected root route 404 outside development, got %d", recorder.Code)
	}
}

func TestCORSMiddlewareHandlesOptions(t *testing.T) {
	handler := NewHandler(&resolvers.Resolver{}, Options{})
	request := httptest.NewRequest(http.MethodOptions, "/graphql", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("expected OPTIONS status 204, got %d", recorder.Code)
	}
	if recorder.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Fatal("expected CORS origin header")
	}
	if recorder.Header().Get("Access-Control-Allow-Methods") != "POST, GET, OPTIONS" {
		t.Fatal("expected CORS methods header")
	}
}
