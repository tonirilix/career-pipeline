# AI Career OS Roadmap

## Purpose

This document captures the agreed direction for evolving Career Pipeline from a job application tracker into an AI-assisted job-search operating system.

The exploratory source material lives in `drafts/ai-project-v1/`. Those drafts are intentionally broad. This document is the shorter working agreement future OpenSpec proposals should use as guidance.

## Product Direction

Career Pipeline should become a workflow-first job-search operating system with AI embedded into each step.

The product should not become primarily a chatbot. Chat can exist as a copilot layer for ambiguity, judgment, nuanced wording, tradeoff discussion, and one-off questions. The main interface should stay stateful and workflow-oriented: role discovery, triage, application packets, pipeline tracking, interview prep, recruiter communication, and offer decision support.

The guiding product promise:

> Help a serious job seeker find, rank, apply to, track, prepare for, and decide between opportunities without losing context.

## Product Principles

- Structured workflows over chat-first UX.
- Human approval by default. Do not auto-apply or auto-send messages without explicit user approval.
- Truthfulness over optimization. Never invent experience or overstate skills.
- Persistent context is the moat.
- Quality over volume.
- Every recommendation should explain why.
- AI outputs should become durable artifacts, not disposable chat replies.
- Privacy-first by design. Resumes, contracts, recruiter messages, salary expectations, and personal notes are sensitive.

## Architecture Agreements

- Evolve this repository first rather than starting from scratch.
- Keep the existing React, Go, GraphQL, and PostgreSQL foundation unless a later proposal proves it is constraining the product.
- Treat the current application tracker as the process/CRM center of the larger product.
- Add structured memory before vector memory.
- Design memory records and AI artifacts so they can be indexed for vector retrieval later.
- Prefer `pgvector` for near-term vector memory because it keeps embeddings near PostgreSQL domain records.
- Prefer a Go/PostgreSQL job queue such as River before BullMQ unless the worker layer becomes intentionally TypeScript-first.
- Keep AI providers behind backend ports so OpenAI, Anthropic, Gemini, or local providers can be swapped later.

## Near-Term Product Shape

The first meaningful product loop should be:

```text
Candidate Profile
      |
      v
Search Topics / Role Intake
      |
      v
Role Results
      |
      v
AI Fit Ranking
      |
      v
Triage Queue
      |
      v
Application Packet
      |
      v
Tracked Application
```

This loop keeps job discovery close to the first AI scope while avoiding heavy automation too early.

## Near-Term Scope

- Candidate profile and structured memory.
- AI artifact persistence.
- Manual and semi-automated role discovery/intake.
- Role fit analysis and triage.
- Application packet generation.
- Scoped AI assistant panel inside role/application workflows.
- Vector memory retrieval after artifacts and memory records exist.
- Background jobs after AI/search workflows become long-running or retry-prone.

## Icebox

These ideas remain valuable, but should not shape the first implementation unless explicitly promoted by a later proposal.

- Full autonomous daily job scout.
- Heavy scraping across the whole web.
- LinkedIn automation.
- Browser extension.
- Gmail and calendar integrations.
- Full global chat assistant.
- Long-lived conversational memory.
- Agentic autonomous workflows.
- Mock interview mode.
- Multi-resume strategy.
- Local-first desktop/private vault replatform.
- Multi-user coaching or B2B dashboards.

## Source Drafts

- `drafts/ai-project-v1/how-i-used-the-chat.md`
- `drafts/ai-project-v1/job_search_ai_product_map.md`
- `drafts/ai-project-v1/general-ux-ideas.md`

## Related Planning

See `docs/product/ai-career-os-proposal-sequence.md` for the intended proposal order and scope briefs.
