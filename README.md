<div align="center">

# 🎓 AI Study Companion

### A learning workspace that remembers what you study, measures what you understand, and tells you what to do next.

_Full-Stack AI Engineer challenge submission · Product Requirements v3.0_

[![CI](https://github.com/yasaswini-123/ai-study-companion/actions/workflows/ci.yml/badge.svg)](https://github.com/yasaswini-123/ai-study-companion/actions/workflows/ci.yml)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-ef4444)](https://tanstack.com/start)
[![React 19](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

## Submission at a glance

| Deliverable                | Where                                                                      |
| -------------------------- | -------------------------------------------------------------------------- |
| Working application        | _Live URL: add link_                                                       |
| Demo video                 | _Add link_                                                                 |
| Public repository          | <https://github.com/yasaswini-123/ai-study-companion>                      |
| Architecture documentation | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)                               |
| AI usage documentation     | [docs/AI_USAGE.md](docs/AI_USAGE.md)                                       |
| Development prompts        | [docs/prompts/](docs/prompts/)                                             |
| Evaluation approach        | [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md#evaluation-approach) |
| Known limitations          | [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md)                     |
| Future improvements        | [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md#roadmap)             |

> [!IMPORTANT]
> **Honest scope statement.** This submission delivers the complete learning loop as a **clickable,
> state-driven frontend prototype**. The backend layer (auth, database, LLM, PDF pipeline, job queue,
> observability) is **simulated in the browser**, not built. Every simulated piece is labelled in
> [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) together with the plan to make it real.

## Table of contents

1. [The idea](#1-the-idea)
2. [Design principles](#2-design-principles)
3. [The connected learning loop](#3-the-connected-learning-loop)
4. [Reviewer's 5-minute tour](#4-reviewers-5-minute-tour)
5. [Requirements traceability](#5-requirements-traceability)
6. [Tech stack and how it's used](#6-tech-stack-and-how-its-used)
7. [Project folder structure](#7-project-folder-structure)
8. [Engineering decisions and trade-offs](#8-engineering-decisions-and-trade-offs)
9. [Testing and evaluation](#9-testing-and-evaluation)
10. [AI usage disclosure](#10-ai-usage-disclosure)
11. [Getting started](#11-getting-started)

---

## 1. The idea

Most AI study tools are chat windows: they answer, then forget you. Learning needs a loop, where
material feeds explanation, explanation feeds practice, practice feeds measurement, and measurement feeds
what you study next.

AI Study Companion organises learning as **Spaces** (a broad area, e.g. _Machine Learning_) containing
**Projects** (a focused goal, e.g. _ML Fundamentals_). Each Project has its own materials, Tutor
conversations, quizzes, concept mastery and activity, isolated from every other Project.

The product continuously answers three questions:

| Question                       | How the product answers it                                               |
| ------------------------------ | ------------------------------------------------------------------------ |
| **What am I learning?**        | Spaces, Projects, learning goals, uploaded materials, extracted concepts |
| **How well am I learning it?** | Quiz and open-ended results turned into per-concept mastery              |
| **What should I do next?**     | Growth trends, weak-concept grouping and a recommendation card           |

## 2. Design principles

These come from the requirements and shaped every screen. Each row says how the prototype expresses the
principle and how far that goes today.

| Principle                   | How it shows up                                                                                           | Today                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Context first**           | Every Tutor, Quiz, Mastery, Growth and Analytics view is scoped to the current Project.                   | UI-level scoping by `projectId`; not a security boundary yet.         |
| **Evidence over guessing**  | Tutor answers carry a source (material, page, excerpt). A dedicated _evidence insufficient_ state exists. | Citations are pre-set; the state is triggered by a keyword blocklist. |
| **Persistent but relevant** | A Learning Context area keeps goals, strengths and weaknesses instead of raw chat history.                | Lives on the Settings page; not fed to a model.                       |
| **Asynchronous by design**  | Uploads show Queued → Processing → Ready / Failed with retry; a Background Jobs view exists.              | Timer-driven simulation, no real queue.                               |
| **Observable AI**           | Admin views for AI requests, latency, tokens, cost, evaluation scores and system health.                  | Static sample data.                                                   |
| **Safe AI interaction**     | Server entry adds error handling and CSRF protection for server functions.                                | No model or tool-calling exists yet, so this is groundwork.           |

## 3. The connected learning loop

The product is designed so that no screen is an island. This is what actually happens in the code when a
learner answers a quiz question (`src/backend/lib/store.ts`):

```text
Answer a question
   │
   ├─▶ updateConceptMastery()  concept mastery ± delta, appended to that concept's history,
   │                           trend set to improving / attention, project mastery re-averaged
   │        │
   │        ├─▶ Mastery page   plots the concept's history over time
   │        └─▶ Growth page    groups concepts as Improving / Stable / Needs attention
   │
   ├─▶ recordQuestionAnswer()  feeds question counts on the Analytics pages
   ├─▶ activity event          appears in the Activity timeline and the dashboards
   │
Finish the quiz
   └─▶ completeQuizSession()   saves the session, recalculates project progress,
                               logs an "assessment completed" event
```

Recommendation cards are currently seeded rather than generated from this state. Closing that last link
is the first item on the [roadmap](docs/KNOWN_LIMITATIONS.md#roadmap).

## 4. Reviewer's 5-minute tour

| Step | Do this                                                         | What to notice                                                       |
| ---- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1    | Sign up with any name and email.                                | Simulated auth; lands on the Home dashboard (progress, next action). |
| 2    | Create a **Space**, then a **Project** with a learning goal.    | Isolated workspace with its own tabs.                                |
| 3    | **Materials** → upload a PDF.                                   | Pipeline stages with progress; retry on failure.                     |
| 4    | **Knowledge** → search the processed material.                  | Extracted concepts and page-level sections.                          |
| 5    | **AI Tutor** → ask about a concept in your material.            | Answer with a clickable source citation.                             |
| 6    | Ask _"What's Tesla's stock price?"_                             | The **evidence-insufficient** state instead of a made-up answer.     |
| 7    | **Quiz** → answer a multiple-choice and an open-ended question. | Explanation, rubric feedback (covered vs missing concepts).          |
| 8    | **Mastery** and **Growth**                                      | The answers you just gave moved the concept's mastery and trend.     |
| 9    | **Analytics** and **Activity**                                  | Your actions appear as events and counts.                            |
| 10   | `/admin`                                                        | Users, AI usage, evaluation, jobs and system health (sample data).   |

Use the **Demo Mode / Live (0% baseline)** switch to move between a populated workspace and a clean slate.

## 5. Requirements traceability

Condensed view of the PRD's "Must Have" list. **UI** = the experience is built and works, but the data or
intelligence behind it is simulated. The full breakdown, with reasons, is in
[docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md#requirements-coverage).

| Requirement                                          | Where to see it                                       | Status                                        |
| ---------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------- |
| Authentication                                       | `/login`, `/signup`                                   | UI (any credentials accepted)                 |
| Spaces and Projects                                  | `/app/spaces`, project pages                          | Works, stored in the browser                  |
| PDF materials + processing states                    | Project → Materials                                   | UI (no file parsing)                          |
| AI Tutor, citations, insufficient-evidence           | Project → AI Tutor                                    | UI (rule-based answers)                       |
| Adaptive Quiz + open-ended assessment                | Project → Quiz                                        | UI (random selection, heuristic grading)      |
| Concept mastery, Growth                              | Project → Mastery / Growth                            | Works client-side (fixed deltas)              |
| Recommendations                                      | Home and project overview                             | UI (seeded)                                   |
| Project + global analytics, Activity                 | Analytics, Activity                                   | Works client-side                             |
| Admin Dashboard                                      | `/admin`                                              | UI (sample data)                              |
| Persistent learning context                          | Settings                                              | UI                                            |
| Project-level data isolation                         | Everywhere                                            | UI-level only                                 |
| Structured AI interaction, observability, evaluation | Admin views                                           | Not implemented (sample dashboards)           |
| Testing                                              | n/a                                                   | Not implemented (CI = typecheck, lint, build) |
| Public repo, architecture docs                       | See [Submission at a glance](#submission-at-a-glance) | Done                                          |

## 6. Tech stack and how it's used

| Technology                                         | Role                 | How it's used here                                                                                                                     |
| -------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **[TanStack Start](https://tanstack.com/start)**   | Full-stack framework | Server-renders every page. `src/backend/server.ts` normalises errors; `start.ts` registers error-handling and CSRF middleware.         |
| **[TanStack Router](https://tanstack.com/router)** | Routing              | File-based routes in `src/frontend/routes/` with nested layouts for `/app` and `/app/projects/:projectId`.                             |
| **TanStack Query**                                 | Data layer           | `QueryClient` is wired into the router and root provider, ready for real API calls. The UI currently reads the local store.            |
| **React 19 + TypeScript (strict)**                 | UI and type safety   | Fully typed screens; `typecheck` must pass in CI.                                                                                      |
| **Reactive store** (`useSyncExternalStore`)        | State management     | `src/backend/lib/store.ts` holds all learning state and persists it to `localStorage`.                                                 |
| **Tailwind CSS 4**                                 | Styling              | Utility classes plus `oklch` design tokens with light/dark variants in `src/frontend/styles.css`.                                      |
| **shadcn/ui + Radix UI**                           | Components           | Accessible primitives (button, input, dialog, sheet, popover, command palette, toasts) composed into app widgets in `components/app/`. |
| **Recharts**                                       | Charts               | Four reusable charts (trend, multi-line, grouped bar, horizontal bar) used by Growth, Analytics and Admin.                             |
| **cmdk**                                           | Global search        | Command-palette search dialog in the app shell.                                                                                        |
| **Sonner**                                         | Feedback             | Toasts for uploads, answers, mastery updates.                                                                                          |
| **Vite 8 + Nitro**                                 | Build and server     | Bundles the client and server; Nitro packages the SSR server for production.                                                           |
| **ESLint, Prettier, Bun, GitHub Actions**          | Quality gates        | `typecheck`, `lint` and `build` run on every push and pull request; `bun.lock` pins dependencies.                                      |

## 7. Project folder structure

```text
ai-study-companion/
├── .github/workflows/ci.yml        # CI: typecheck + lint + build
├── docs/
│   ├── ARCHITECTURE.md            # current + target architecture, decisions
│   ├── AI_USAGE.md                # AI used to build vs. AI used by the product
│   ├── KNOWN_LIMITATIONS.md       # coverage, limitations, roadmap, evaluation plan
│   └── prompts/                   # development prompts
├── public/                        # static assets
├── src/
│   ├── backend/                   # server entry + application data layer
│   │   ├── server.ts              #   SSR entry with error normalisation
│   │   ├── start.ts               #   error + CSRF middleware
│   │   └── lib/
│   │       ├── store.ts           #   reactive store: every action + localStorage persistence
│   │       ├── demo-data.ts       #   seed spaces, projects, quiz questions, analytics, admin data
│   │       ├── diagram-generator.ts
│   │       └── error-*.ts, utils.ts
│   ├── frontend/
│   │   ├── router.tsx             #   router + QueryClient
│   │   ├── styles.css             #   Tailwind + design tokens
│   │   ├── components/
│   │   │   ├── app/               #   shell (sidebar, search), charts, blocks, primitives
│   │   │   └── ui/                #   shadcn/ui primitives
│   │   └── routes/                #   file-based routes
│   │       ├── index.tsx, login.tsx, signup.tsx
│   │       ├── app.tsx, app.index.tsx                 # app layout + home
│   │       ├── app.spaces.*.tsx                       # spaces list + dashboard
│   │       ├── app.projects.$projectId.tsx            # project layout (header + tabs)
│   │       ├── app.projects.$projectId.*.tsx          # overview, materials, knowledge, tutor,
│   │       │                                          #   quiz, mastery, growth, analytics
│   │       ├── app.analytics.tsx, app.activity.tsx    # global analytics + activity
│   │       ├── app.settings.tsx, app.help.tsx
│   │       └── admin.tsx                              # admin dashboard (6 sections)
│   └── routeTree.gen.ts           # generated by TanStack Router
├── .env.example                   # reserved config for a future backend
└── vite.config.ts, tsconfig.json, eslint.config.js, package.json, bun.lock
```

## 8. Engineering decisions and trade-offs

| Decision                                     | Why                                                                                                                                                             | What was simplified                                    | Next step                                                   |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| **Design the whole loop before the backend** | The PRD's success criterion is a user completing the loop without losing context; that is easiest to validate end-to-end first.                                 | Backend behaviour is simulated.                        | Replace store actions with authenticated API calls.         |
| **One reactive store behind named actions**  | Every action (`uploadMaterial`, `sendTutorMessage`, `completeQuizSession`…) maps to a future API endpoint, so swapping the implementation doesn't touch the UI. | State is a single JSON blob in `localStorage`.         | Server state via TanStack Query (already wired) + Postgres. |
| **TanStack Start with SSR**                  | Type-safe routing and server functions ready for a real API.                                                                                                    | Only the SSR shell runs server-side.                   | Move actions into server functions with auth checks.        |
| **Explicit evidence-insufficient UI state**  | Treats "I don't know" as a first-class outcome, which the PRD calls a core evaluation requirement.                                                              | Trigger is a keyword blocklist, not a retrieval score. | Relevance threshold over retrieved chunks (RAG).            |
| **Demo / Live (0%) data modes**              | Reviewers can see a populated product immediately or start clean.                                                                                               | Demo data is hard-coded.                               | Seed script against a database.                             |

Target architecture (Postgres, pgvector retrieval, job queue and workers, an LLM provider abstraction with
observability) is diagrammed in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#3-target-architecture-not-yet-built).

## 9. Testing and evaluation

- **Automated today:** GitHub Actions runs strict TypeScript checking, ESLint (0 errors) and a production build on every push and pull request.
- **Not yet built:** unit, integration and end-to-end tests; AI evaluation. This is the largest gap against the PRD.
- **Planned evaluation approach** (details in [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md#evaluation-approach)):
  Tutor groundedness and refusal cases, retrieval hit-rate on labelled question→chunk pairs, grading
  score-band checks and schema-validity rate for assessments, and rule-based checks that recommendations
  target the learner's weakest concepts.

## 10. AI usage disclosure

AI-assisted development tools were used to scaffold and iterate on the interface. The tools, the prompts
used, and a clear separation between **AI used to build the product** and **AI used inside the product** are in
[docs/AI_USAGE.md](docs/AI_USAGE.md). At runtime the application currently makes **no LLM calls**; the Tutor,
quiz grading and recommendations are rule-based simulations.

## 11. Getting started

**Prerequisites:** Node.js `^20.19.0` or `>=22.12.0`, and [Bun](https://bun.sh) (recommended) or npm.

```sh
git clone https://github.com/yasaswini-123/ai-study-companion.git
cd ai-study-companion
bun install        # or: npm install
bun run dev        # or: npm run dev
```

Open the URL Vite prints (usually <http://localhost:5173>). No environment variables are required.

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `bun run dev`       | Dev server with hot reload                     |
| `bun run build`     | Production build (SSR + client) into `.output` |
| `bun run preview`   | Preview the production build                   |
| `bun run typecheck` | TypeScript check                               |
| `bun run lint`      | ESLint (includes Prettier rules)               |
| `bun run format`    | Format with Prettier                           |

---

<div align="center">

Built with [TanStack](https://tanstack.com), [shadcn/ui](https://ui.shadcn.com) and [Recharts](https://recharts.org).

</div>
