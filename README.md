# react-hexagonal-architecture

A toy for practicing about hexagonal architecture

## Architecture Data Flow

Ports point inward as interfaces, adapters sit outside and implement them, and
runtime data flows through the concrete adapter that `main.tsx` wires into
React.

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
    MSW[MSW GraphQL handlers]
    MockState[Mock backend state]
  end

  User --> App

  App --> UseCases
  UseCases --> DomainRules
  UseCases --> GatewayPort

  GatewayPort -. implemented by .-> GraphqlGateway
  GraphqlGateway -->|fetch /graphql| MSW
  MSW --> MockState
  MSW --> DomainRules
  MSW -->|GraphQL DTO response| GraphqlGateway
  GraphqlGateway -->|maps DTOs to domain objects| UseCases
  UseCases --> App

  App --> ControlsPort
  ControlsPort -. implemented by .-> Zustand
  Zustand --> App

  DomainRules --> DomainTypes
  GatewayPort --> DomainTypes
  GraphqlGateway --> DomainTypes
```

The dependency direction is different from the runtime call direction:

```mermaid
flowchart TB
  Domain[Domain: business rules, plain TypeScript]
  Application[Application: use cases + ports]
  Infrastructure[Infrastructure: GraphQL, MSW, Zustand]
  Presentation[Presentation: React UI]

  Presentation --> Application
  Application --> Domain
  Infrastructure --> Application
  Infrastructure --> Domain

  Application -. defines .-> Port[Port interface]
  Infrastructure -. implements .-> Port
```

For example, marking an application as applied travels through the app like
this:

```mermaid
sequenceDiagram
  participant User
  participant App as React App
  participant UseCase as advanceApplicationStage()
  participant Port as JobApplicationGateway port
  participant Gql as GraphQL gateway adapter
  participant MSW as MSW handler
  participant Domain as transitionApplicationStage()
  participant State as Mock applications state

  User->>App: Click "Mark as applied"
  App->>UseCase: advanceApplicationStage(gateway, command)
  UseCase->>Port: gateway.advanceApplicationStage(command)
  Port->>Gql: concrete adapter handles call
  Gql->>MSW: POST /graphql mutation
  MSW->>State: Find application
  MSW->>Domain: Validate transition and create updated application
  Domain-->>MSW: Result
  MSW->>State: Save updated application
  MSW-->>Gql: GraphQL DTO response
  Gql-->>UseCase: mapped domain JobApplication
  UseCase-->>App: success result
  App-->>User: Updated board
```

The application layer knows only the `JobApplicationGateway` port, not GraphQL
or MSW. That is what lets the mock backend be replaced later without changing
the use cases.

## Development

Install dependencies from the repo root:

```sh
npm install
```

Run the test suite:

```sh
npm test
```

Start the frontend app:

```sh
npm run dev --workspace apps/web
```
