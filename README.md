# react-hexagonal-architecture

A toy for practicing hexagonal architecture across a React frontend and a Go backend.

## Workspaces

| Path | Description |
|---|---|
| `apps/web` | React + Vite frontend |
| `apps/api` | Go GraphQL backend |

## Architecture

The system has two deployment units that share only the GraphQL schema as a contract.

### Frontend (`apps/web`)

Ports point inward as interfaces; adapters sit outside and implement them. `main.tsx` wires the concrete adapters into React at startup.

```mermaid
flowchart LR
  User[User action]

  subgraph Presentation
    App[React App]
    ControlsPort[PipelineControls port]
  end

  subgraph Application
    UseCases[Job application use cases]
    GatewayPort[JobApplicationGateway port]
  end

  subgraph Domain
    DomainRules[Pure domain rules]
    DomainTypes[Domain types]
  end

  subgraph Infrastructure
    GraphqlGateway[GraphQL gateway adapter]
    Zustand[Zustand pipeline controls adapter]
  end

  User --> App
  App --> UseCases
  UseCases --> DomainRules
  UseCases --> GatewayPort
  GatewayPort -. implemented by .-> GraphqlGateway
  GraphqlGateway -->|POST /graphql| GoBackend[(Go backend)]
  GraphqlGateway -->|maps DTOs to domain| UseCases
  UseCases --> App
  App --> ControlsPort
  ControlsPort -. implemented by .-> Zustand
  Zustand --> App
  DomainRules --> DomainTypes
  GatewayPort --> DomainTypes
  GraphqlGateway --> DomainTypes
```

### Backend (`apps/api`)

Follows the same hexagonal architecture: domain → application (use cases + ports) → infrastructure (SQLite adapters) → GraphQL adapter (gqlgen resolvers).

```mermaid
flowchart LR
  GQL[GraphQL request]

  subgraph GraphQL["GraphQL Adapter (gqlgen)"]
    Resolver[Resolvers]
  end

  subgraph Application
    UseCases[Use cases]
    Ports[Repository ports]
  end

  subgraph Domain
    DomainRules[Stage transitions, validation]
    DomainTypes[JobApplication, Interview, etc.]
  end

  subgraph Infrastructure
    SQLite[SQLite repository adapters]
    DB[(tracker.db)]
  end

  GQL --> Resolver
  Resolver -->|command / query| UseCases
  UseCases --> DomainRules
  UseCases --> Ports
  Ports -. implemented by .-> SQLite
  SQLite --> DB
  Resolver -->|maps domain → DTO| GQL
```

### Dependency direction (both layers)

```mermaid
flowchart TB
  Domain[Domain]
  Application[Application: use cases + ports]
  Infrastructure[Infrastructure: adapters]
  Presentation[Presentation / GraphQL adapter]

  Presentation --> Application
  Application --> Domain
  Infrastructure --> Application
  Infrastructure --> Domain
  Application -. defines .-> Port[Port interface]
  Infrastructure -. implements .-> Port
```

## Development

### Prerequisites

- Node.js 20+
- Go 1.22+

### Install dependencies

```sh
npm install
```

### Run frontend only (MSW mock backend)

MSW intercepts all GraphQL requests in-process. No Go server needed.

```sh
npm run dev --workspace apps/web
```

### Run frontend against the real Go backend

Start the Go server first:

```sh
cd apps/api
go run ./cmd/api
```

Then start the frontend in production mode (MSW disabled):

```sh
npm run dev:api --workspace apps/web
```

The frontend defaults to `http://localhost:8080/graphql`. Override with `VITE_API_URL` in `.env.local` if your backend runs elsewhere.

### MSW toggle

| Script | `MODE` | MSW | Backend |
|---|---|---|---|
| `npm run dev` | `development` | starts | mock (in-process) |
| `npm run dev:api` | `production` | skipped | Go server on :8080 |

MSW is controlled by `import.meta.env.MODE !== 'production'` in `apps/web/src/main.tsx`. It is not tied to `VITE_API_URL`.

### Run tests

```sh
# Frontend
npm test --workspace apps/web

# Backend
cd apps/api && go test ./...
```

### Build the Go binary

```sh
cd apps/api
go build -o api ./cmd/api
./api
```

See [`apps/api/README.md`](apps/api/README.md) for full backend documentation.
