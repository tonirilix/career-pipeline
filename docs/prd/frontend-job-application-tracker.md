# PRD: Frontend Job Application Tracker

## Problem Statement

Tracking job applications across job boards, recruiters, interviews, follow-ups, notes, resume versions, and outcomes is currently messy. The user wants a React application they can actually use while learning hexagonal architecture. The application must make job search progress easier to see and manage, while also demonstrating how React, Zustand, GraphQL, MSW, and Effect can be decoupled from domain rules and use cases.

## Solution

Build a frontend-first job application tracker with a hexagonal architecture. The first implementation will run without a real backend. The React app will use a GraphQL gateway adapter, and MSW GraphQL handlers will intercept those operations to simulate a backend. Domain rules and use cases will remain independent from React, Zustand, GraphQL, MSW, and browser APIs.

The user will be able to save job opportunities, track applications by stage, manage follow-ups, record interviews, add notes, inspect a timeline, filter the pipeline, and use the app as a practical job search tool. The architecture will preserve clear boundaries so that the MSW mock backend can later be replaced with a real GraphQL backend without rewriting domain or presentation code.

## User Stories

1. As a job seeker, I want to save a job opportunity, so that I can track roles before I apply.
2. As a job seeker, I want to record the company name, so that I know where each opportunity belongs.
3. As a job seeker, I want to record the role title, so that I can distinguish similar applications.
4. As a job seeker, I want to record the job posting URL, so that I can return to the original listing.
5. As a job seeker, I want to record the job source, so that I know whether a lead came from LinkedIn, a referral, a recruiter, or another source.
6. As a job seeker, I want to record location details, so that I can compare remote, hybrid, and onsite opportunities.
7. As a job seeker, I want to record compensation details, so that I can compare opportunities against my expectations.
8. As a job seeker, I want to record employment type, so that I can separate full-time, contract, and other opportunities.
9. As a job seeker, I want to mark an opportunity as applied, so that it moves from saved roles into my active pipeline.
10. As a job seeker, I want to see applications grouped by stage, so that I understand my pipeline at a glance.
11. As a job seeker, I want application stages to include saved, applied, screening, technical interview, onsite, offer, rejected, and withdrawn, so that the tracker matches a realistic hiring process.
12. As a job seeker, I want to advance an application to a new stage, so that the tracker reflects my latest progress.
13. As a job seeker, I want invalid stage transitions to be rejected, so that the application history remains coherent.
14. As a job seeker, I want stage changes to create timeline events, so that I can reconstruct the history of an application.
15. As a job seeker, I want to withdraw an application, so that I can stop tracking roles I no longer want.
16. As a job seeker, I want to mark an application as rejected, so that closed opportunities no longer appear as active work.
17. As a job seeker, I want rejected and withdrawn applications to stop showing active reminders, so that my follow-up list stays relevant.
18. As a job seeker, I want to reopen a closed application explicitly, so that accidental or exceptional changes are intentional.
19. As a job seeker, I want to schedule an interview, so that upcoming interview commitments are visible.
20. As a job seeker, I want interview scheduling to require an application that has been applied to, so that interviews cannot exist for unsubmitted opportunities.
21. As a job seeker, I want to record interview type, so that I can distinguish recruiter screens, technical rounds, hiring manager conversations, and onsite interviews.
22. As a job seeker, I want to record interview date and time, so that I can prepare and avoid conflicts.
23. As a job seeker, I want to record interview notes, so that I remember what was discussed.
24. As a job seeker, I want to record interview outcome, so that I know what happened after each round.
25. As a job seeker, I want interview activity to appear in the timeline, so that all major application events are in one place.
26. As a job seeker, I want to create follow-up reminders, so that I know when to contact recruiters or hiring teams.
27. As a job seeker, I want follow-up reminders to require a due date after the latest interaction, so that reminders are meaningful.
28. As a job seeker, I want to mark a follow-up reminder as complete, so that finished tasks do not remain active.
29. As a job seeker, I want to see upcoming follow-ups, so that I can decide what to do next.
30. As a job seeker, I want overdue follow-ups to be visible, so that I can recover from missed reminders.
31. As a job seeker, I want to add freeform notes, so that I can capture recruiter details, prep thoughts, and decision criteria.
32. As a job seeker, I want notes to appear in application details, so that context is available when I open an application.
33. As a job seeker, I want important events to be listed chronologically, so that I can understand the full application story.
34. As a job seeker, I want to filter applications by stage, so that I can focus on one part of the pipeline.
35. As a job seeker, I want to filter applications by source, so that I can evaluate which sourcing channels are working.
36. As a job seeker, I want to search by company or role title, so that I can quickly find an application.
37. As a job seeker, I want to sort applications by last activity, so that stale applications are easy to notice.
38. As a job seeker, I want to sort applications by follow-up date, so that urgent work rises to the top.
39. As a job seeker, I want to select an application and inspect its details, so that I can work without losing pipeline context.
40. As a job seeker, I want form validation errors to be understandable, so that I can correct invalid data quickly.
41. As a job seeker, I want loading and failure states around commands, so that I know whether an action succeeded.
42. As a job seeker, I want optimistic updates only where they can be safely rolled back, so that the UI feels responsive without hiding failures.
43. As a learner, I want the domain model to be plain TypeScript, so that business rules are easy to inspect and test.
44. As a learner, I want use cases to be independent of React, Zustand, GraphQL, and MSW, so that I can see the hexagonal architecture boundary clearly.
45. As a learner, I want a repository or gateway port between use cases and data access, so that the data source can be swapped.
46. As a learner, I want a GraphQL adapter that implements the application port, so that GraphQL is an infrastructure detail.
47. As a learner, I want MSW to mock GraphQL network operations, so that the frontend behaves as if a backend exists.
48. As a learner, I want Zustand to manage UI state rather than business rules, so that state management remains decoupled from the domain.
49. As a learner, I want Effect used intentionally for use case execution, dependency wiring, and typed failures, so that I learn it without letting it dominate the whole design.
50. As a learner, I want adapters to be replaceable in tests, so that I can prove the architecture is not coupled to a specific technology.

## Implementation Decisions

- Build the frontend first as the initial implementation.
- Use a workspace-style repository layout organized around deployable applications.
- Place the frontend implementation under an `apps/web` application.
- Keep the future backend under an `apps/api` application, but do not implement it during this frontend milestone.
- Let `apps/web` own the first implementation of domain rules and application use cases because MSW is acting as the backend substitute.
- Avoid introducing shared packages at the start; add shared packages later only when a stable cross-app contract exists.
- Use React and TypeScript for the user interface.
- Use a hexagonal architecture with domain, application, infrastructure, and presentation boundaries.
- Treat the domain model as a deep module with a small public interface and meaningful internal rules.
- Model job applications, companies, interviews, follow-up reminders, timeline events, notes, offers, and application stages.
- Keep domain rules free of React hooks, Zustand stores, GraphQL documents, MSW handlers, browser APIs, and generated API types.
- Implement application use cases as orchestration modules that depend on ports rather than concrete adapters.
- Define a job application gateway port for loading, searching, saving, and updating application data.
- Define supporting ports for time and ID generation so tests can be deterministic.
- Implement an in-memory adapter only if it helps bootstrap domain and use case behavior before GraphQL is introduced.
- Implement a GraphQL gateway adapter that translates application commands into GraphQL operations.
- Implement MSW GraphQL handlers as the first backend substitute.
- Store mock backend data behind the MSW layer, not directly in React components.
- Use Zustand for UI and interaction state, including selected application, filters, sorting, modal state, command status, and possibly a client-side read model.
- Do not put application stage transition rules or follow-up rules inside Zustand actions.
- Use presentation hooks or controllers to connect React components to use cases.
- Map GraphQL inputs and responses into application commands and domain-friendly data shapes.
- Treat GraphQL types as transport DTOs, not domain entities.
- Treat MSW as a network-level mock, not as the application architecture.
- Use Effect in the application layer for typed errors, dependency access, and asynchronous workflows.
- Avoid using Effect inside every React component.
- Expose domain failures as user-facing validation or command errors through presentation-level mapping.
- Represent the main experience as an application board grouped by stage rather than a marketing landing page.
- Include application detail views for timeline, notes, interviews, follow-ups, and core job information.
- Include follow-up-focused views or panels so the user can act on upcoming work.
- Keep the UI practical, dense enough for repeated use, and focused on managing the job search.
- Design the frontend so a real GraphQL backend can replace MSW later without changing domain rules or use case interfaces.

## Testing Decisions

- Good tests should verify external behavior through public interfaces, not internal implementation details.
- Domain tests should cover valid and invalid stage transitions, rejected and withdrawn behavior, interview scheduling constraints, follow-up reminder constraints, and timeline creation.
- Use case tests should verify orchestration behavior with fake ports for repository or gateway, clock, and ID generation.
- Adapter tests should verify that the GraphQL gateway sends the expected operations and maps responses and failures correctly.
- MSW integration tests should verify that the UI can perform realistic workflows against intercepted GraphQL operations.
- Zustand tests should be limited to UI state behavior such as filters, selection, sorting, and command status.
- Presentation tests should focus on user-observable behavior, such as creating an application, moving stages, scheduling an interview, and completing a follow-up.
- Error handling tests should verify that domain and application failures become clear UI messages.
- No prior tests exist in the current repository because the codebase currently contains only a README and license.

## Out of Scope

- A production backend implementation.
- Authentication and multiple user accounts.
- Real email, calendar, or notification integrations.
- Resume parsing or AI-generated application content.
- Browser extensions for importing job postings.
- Mobile-native application work.
- Offline-first sync conflict handling.
- Analytics dashboards beyond basic pipeline visibility.
- Deployment infrastructure.

## Further Notes

- The first milestone should prove the architecture with domain and use case tests before adding unnecessary infrastructure.
- The second milestone should add the GraphQL adapter and MSW handlers so the frontend speaks real GraphQL while remaining backend-free.
- The future backend PRD defines the eventual authoritative server, but it should not block frontend implementation.
- The key learning constraint is that Zustand, GraphQL, MSW, and Effect must remain replaceable technologies around the domain and use cases.
