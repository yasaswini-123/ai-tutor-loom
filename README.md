<div align="center">

# 🎓 AI Study Companion

**An AI-powered learning workspace that understands what you're learning, measures how well you're learning it, and recommends what to do next.**

[![CI](https://github.com/yasaswini-123/ai-study-companion/actions/workflows/ci.yml/badge.svg)](https://github.com/yasaswini-123/ai-study-companion/actions/workflows/ci.yml)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-ef4444)](https://tanstack.com/start)
[![React 19](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev)

</div>

> [!IMPORTANT]
> **Project status: frontend prototype with a simulated backend.**
> The complete learning loop is designed and clickable end-to-end, but there is **no real server,
> database, authentication, LLM or PDF pipeline yet**. All state lives in the browser
> (`localStorage`), and the Tutor, quiz grading, mastery and admin metrics are deterministic
> simulations over demo data. See [Known limitations](docs/KNOWN_LIMITATIONS.md) for the item-by-item breakdown.

## Table of contents

- [About the project](#about-the-project)
- [Features](#features)
- [Application screens](#application-screens)
- [Tech stack and how it's used](#tech-stack-and-how-its-used)
- [Project folder structure](#project-folder-structure)
- [How it works](#how-it-works)
- [Getting started](#getting-started)
- [Try the demo flow](#try-the-demo-flow)
- [Deployment](#deployment)
- [Documentation](#documentation) · [Roadmap](#roadmap)

## About the project

**AI Study Companion** is a learning workspace, not a chatbot. Most AI study tools answer questions and
forget you. This project is built around one idea: learning works when every step feeds the next.

A learner creates a **Space** (a broad area such as _Machine Learning_) and a **Project** (a focused goal such as
_ML Fundamentals_), uploads study material, learns with an **AI Tutor** that answers from that material
and cites its sources, then proves understanding with **adaptive quizzes**. The results update
**concept mastery**, which drives **growth analysis** and a **recommended next action**, and the
loop starts again.

```text
Space → Project → Materials → Knowledge → AI Tutor (grounded + cited)
      → Adaptive Quiz → Assessment → Mastery → Growth → Recommendation → Continue learning
```

The product continuously answers three questions:

| Question                       | Answered by                                                     |
| ------------------------------ | --------------------------------------------------------------- |
| **What am I learning?**        | Spaces, Projects, learning goals, materials, extracted concepts |
| **How well am I learning it?** | Quiz results, open-ended assessments, per-concept mastery       |
| **What should I do next?**     | Growth trends, weak concepts and a recommendation card          |

What sets it apart is the combination of **context + evidence + assessment + mastery + growth +
recommendation**: each Project keeps its own isolated context, the Tutor is designed to say _"I don't have enough
evidence"_ rather than invent an answer, and an Admin Dashboard gives a platform-level view of usage, AI
quality and background jobs.

## Features

| Area                     | What you get                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Spaces & Projects**    | Broad learning areas containing focused projects, each with isolated materials, conversations and mastery.         |
| **Materials**            | Drag-and-drop upload (PDF and images) with a visible pipeline: Queued → Processing → Ready / Failed, plus retry.   |
| **Knowledge**            | Extracted concepts and page-level sources per document, with search.                                               |
| **AI Tutor**             | Project-scoped chat with source citations and an explicit "insufficient evidence" state.                           |
| **Adaptive Quiz**        | Multiple-choice and open-ended questions with explanations and rubric-style feedback (covered / missing concepts). |
| **Mastery & Growth**     | Per-concept mastery estimates, trend charts, and Improving / Stable / Needs-attention grouping.                    |
| **Recommendations**      | A "what should I do next?" card on the home and project dashboards.                                                |
| **Analytics & Activity** | Project and global analytics, a filterable activity timeline, global search (command palette) and notifications.   |
| **Admin Dashboard**      | Users, AI usage/observability, AI quality & evaluation, background jobs and system health.                         |
| **Demo / Live toggle**   | Switch between a fully populated **Demo Mode** and a **Live (0% baseline)** mode that starts empty.                |

> Everything above is implemented at the UI and client-state level. What is simulated versus real is listed in [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md).

## Application screens

| URL                                   | Screen                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| `/`                                   | Landing page                                                                    |
| `/login`, `/signup`                   | Authentication screens (simulated)                                              |
| `/app`                                | Home: continue learning, progress, areas needing attention, next action         |
| `/app/spaces`, `/app/spaces/:spaceId` | Spaces list and Space dashboard                                                 |
| `/app/projects/:projectId`            | Project overview (progress, key concepts, recent activity, recommendation)      |
| `…/materials`                         | Upload and processing status of documents                                       |
| `…/knowledge`                         | Extracted concepts and searchable document sections                             |
| `…/tutor`                             | AI Tutor chat with citations and the evidence-insufficient state                |
| `…/quiz`                              | Adaptive quiz: multiple-choice and open-ended assessment                        |
| `…/mastery`, `…/growth`               | Concept mastery and growth over time                                            |
| `…/analytics`                         | Project analytics                                                               |
| `/app/analytics`, `/app/activity`     | Global analytics and the activity timeline                                      |
| `/app/settings`, `/app/help`          | Settings and help                                                               |
| `/admin`                              | Admin: overview, users, AI usage, AI evaluation, background jobs, system health |

## Tech stack and how it's used

| Technology                                         | Role                 | How it's used in this project                                                                                                                                       |
| -------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[TanStack Start](https://tanstack.com/start)**   | Full-stack framework | Server-side renders every page. The SSR entry (`src/backend/server.ts`) normalises errors, and `start.ts` registers error-handling and CSRF middleware.             |
| **[TanStack Router](https://tanstack.com/router)** | Routing              | File-based routes in `src/frontend/routes/` (nested layouts for `/app` and `/app/projects/:projectId`). `src/routeTree.gen.ts` is generated.                        |
| **TanStack Query**                                 | Data-fetching layer  | The `QueryClient` is wired into the router and root provider, ready for real API calls. Today the UI reads from the local store instead.                            |
| **React 19 + TypeScript (strict)**                 | UI and type safety   | All screens and components are typed; `bun run typecheck` must pass in CI.                                                                                          |
| **Reactive store** (`useSyncExternalStore`)        | State management     | `src/backend/lib/store.ts` holds spaces, projects, materials, tutor messages, quiz sessions, mastery and activity, and persists them to `localStorage`.             |
| **Tailwind CSS 4**                                 | Styling              | Utility classes plus design tokens (colors in `oklch`, light and dark variants) defined in `src/frontend/styles.css`.                                               |
| **shadcn/ui + Radix UI**                           | Component library    | 46 accessible primitives in `src/frontend/components/ui/` (dialogs, tabs, selects, sidebar, command palette…). App-level widgets in `components/app/` compose them. |
| **Recharts**                                       | Data visualisation   | Four reusable charts in `components/app/charts.tsx`: trend line, multi-line, grouped bar and horizontal bar. Used by growth, analytics and admin pages.             |
| **cmdk** (via shadcn `Command`)                    | Global search        | Powers the search dialog in the app shell.                                                                                                                          |
| **Sonner**                                         | Notifications        | Toast feedback for uploads, quiz answers, mastery updates and simulated auth actions.                                                                               |
| **Lucide**                                         | Icons                | Icon set used across the shell, dashboards and status badges.                                                                                                       |
| **Vite 8 + Nitro**                                 | Build and server     | Vite bundles the client and server. Nitro packages the SSR server (Cloudflare Workers by default; Vercel/Netlify via `NITRO_PRESET`).                               |
| **ESLint 9 + Prettier**                            | Code quality         | `bun run lint` (includes Prettier rules) and `bun run format`.                                                                                                      |
| **GitHub Actions + Bun**                           | CI                   | `.github/workflows/ci.yml` runs typecheck, lint and build on every push and pull request; `bun.lock` pins dependencies.                                             |

> **Installed but not yet used by app code:** `zod`, `react-hook-form` and `date-fns` are dependencies (Zod and
> React Hook Form are intended for validating forms and AI output once a real backend exists).

## Project folder structure

```text
ai-study-companion/
├── .github/
│   └── workflows/ci.yml            # CI: typecheck + lint + build
├── docs/
│   ├── ARCHITECTURE.md            # current + target architecture, engineering decisions
│   ├── AI_USAGE.md                # AI used to build vs. AI used by the product
│   ├── KNOWN_LIMITATIONS.md       # limitations, requirements coverage, roadmap
│   └── prompts/                   # development prompts
├── public/                        # static assets (favicon, robots.txt)
├── src/
│   ├── backend/                   # server entry + application data layer
│   │   ├── server.ts              #   SSR entry; turns swallowed server errors into an error page
│   │   ├── start.ts               #   TanStack Start instance: error + CSRF middleware
│   │   └── lib/
│   │       ├── store.ts           #   reactive app store: all actions + localStorage persistence
│   │       ├── demo-data.ts       #   seed spaces, projects, concepts, quiz questions, analytics, admin data
│   │       ├── diagram-generator.ts #  sample diagrams for uploaded images
│   │       ├── error-capture.ts   #   error capture/formatting helpers
│   │       ├── error-reporting.ts #   error reporting
│   │       ├── error-page.ts      #   HTML fallback error page
│   │       └── utils.ts           #   class-name helper (cn)
│   ├── frontend/
│   │   ├── router.tsx             #   router + QueryClient setup
│   │   ├── styles.css             #   Tailwind + design tokens (light/dark)
│   │   ├── hooks/                 #   shared hooks (e.g. use-mobile)
│   │   ├── components/
│   │   │   ├── app/               #   shell (sidebar/topbar/search), charts, blocks, primitives
│   │   │   └── ui/                #   shadcn/ui components (46 files)
│   │   └── routes/                #   file-based routes
│   │       ├── __root.tsx         #     document shell, providers, toaster
│   │       ├── index.tsx          #     landing page
│   │       ├── login.tsx, signup.tsx
│   │       ├── app.tsx            #     authenticated app layout
│   │       ├── app.index.tsx      #     home dashboard
│   │       ├── app.spaces.*.tsx   #     spaces list + space dashboard
│   │       ├── app.projects.$projectId.tsx          # project layout (header + tabs)
│   │       ├── app.projects.$projectId.*.tsx        # index, materials, knowledge, tutor,
│   │       │                                        #   quiz, mastery, growth, analytics
│   │       ├── app.analytics.tsx, app.activity.tsx  # global analytics and activity
│   │       ├── app.settings.tsx, app.help.tsx
│   │       └── admin.tsx          #     admin dashboard (6 sections)
│   └── routeTree.gen.ts           # generated by TanStack Router (do not edit)
├── .env.example                   # reserved config for a future backend (none needed today)
├── bun.lock                       # dependency lockfile
├── eslint.config.js, .prettierrc  # lint + formatting rules
├── tsconfig.json                  # strict TypeScript config, `@/` path alias
├── vite.config.ts                 # Vite + TanStack Start + Nitro configuration
└── package.json                   # scripts and dependencies
```

> `src/backend/` currently contains the SSR entry **and** a client-side data store. It is named for where a real
> backend would live; the store is not a server.

## How it works

```text
 Browser (React 19 UI)                                  Server (Nitro)
 ┌────────────────────────────────────────────┐        ┌─────────────────────────────┐
 │ Routes (TanStack Router)                    │  HTML  │ TanStack Start SSR          │
 │   └─ components (shadcn/ui, Recharts)       │◀───────│  + error & CSRF middleware  │
 │        ▲  read/subscribe    │ call actions  │        └─────────────────────────────┘
 │        │                    ▼               │
 │   studyStore  ◀── seed ── demo-data.ts       │
 │        │ persist                             │
 │        ▼                                     │
 │   localStorage                               │
 └────────────────────────────────────────────┘
```

1. **Pages render on the server** for a fast first paint, then hydrate in the browser.
2. **Screens read from `studyStore`** and call its actions (`createSpace`, `createProject`, `uploadMaterial`,
   `sendTutorMessage`, `completeQuizSession`, `updateConceptMastery`, …). Every change is saved to `localStorage`.
3. **The learning loop is connected through that store:** an answered quiz question updates concept mastery,
   which changes the growth charts, activity timeline and project progress.
4. **Simulated pipelines:** document processing advances through its stages on timers, the Tutor answers from
   keyword rules with pre-set citations, and open-ended answers are graded by a heuristic. These are the parts
   a real backend and LLM would replace (see the [roadmap](docs/KNOWN_LIMITATIONS.md#roadmap)).

For diagrams and the reasoning behind each decision, read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Getting started

### Prerequisites

- **Node.js** `^20.19.0` or `>=22.12.0` (required by Vite 8)
- **[Bun](https://bun.sh)** (recommended; the committed lockfile is `bun.lock`) or npm

### Run locally

```sh
git clone https://github.com/yasaswini-123/ai-study-companion.git
cd ai-study-companion

bun install        # or: npm install
bun run dev        # or: npm run dev
```

Open the URL Vite prints (usually <http://localhost:5173>). No environment variables are required.

### Scripts

| Command                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `bun run dev`          | Start the dev server with hot reload           |
| `bun run build`        | Production build (SSR + client) into `.output` |
| `bun run preview`      | Preview the production build                   |
| `bun run typecheck`    | TypeScript check (`tsc --noEmit`)              |
| `bun run lint`         | ESLint (includes Prettier rules)               |
| `bun run format`       | Format everything with Prettier                |
| `bun run format:check` | Verify formatting without writing              |

## Try the demo flow

1. **Sign up** (any name and email; authentication is simulated). You land on the Home dashboard.
2. Create a **Space**, then a **Project** with a learning goal.
3. **Upload a PDF** on the Materials tab and watch it move through the processing pipeline.
4. Open the **AI Tutor**, ask about your material, and follow the source citation.
5. Ask _"What's Tesla's stock price?"_ to see the **evidence-insufficient** state (currently triggered by a keyword blocklist; see limitations).
6. Start the **Adaptive Quiz** and answer a multiple-choice and an open-ended question.
7. Check **Mastery**, **Growth**, **Analytics** and the recommended next step.
8. Open the **Admin Dashboard** at `/admin` for the platform-level view.

Use the **Demo Mode / Live (0% baseline)** switch in the sidebar or project header to toggle between pre-populated sample data and a clean slate.

## Deployment

The app builds with Nitro and defaults to a Cloudflare Workers target. Set the `NITRO_PRESET` environment variable to target another host.

**Vercel** (simplest with GitHub): import the repository at <https://vercel.com>, set **Framework Preset** to `Other`,
add the environment variable `NITRO_PRESET=vercel`, and deploy. Build command: `bun run build`.

**Cloudflare Workers:**

```sh
bun run build
npx wrangler login
npx wrangler deploy
```

**Netlify:** set `NITRO_PRESET=netlify` and use `bun run build` as the build command.

No other environment variables or database are needed for the current prototype.

## Documentation

| Document                                               | Contents                                                         |
| ------------------------------------------------------ | ---------------------------------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)           | Current architecture, target architecture, engineering decisions |
| [docs/AI_USAGE.md](docs/AI_USAGE.md)                   | AI used to build the product vs. AI used inside the product      |
| [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) | Requirements coverage, limitations, roadmap, evaluation plan     |
| [docs/prompts/](docs/prompts/)                         | Development prompts                                              |

## Roadmap

The highest-value next steps are a real backend (auth, Postgres, per-user data isolation), a background PDF
pipeline with retrieval, and a genuine LLM layer for the Tutor and grading, plus tests and evaluation.
The full prioritised list is in [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md#roadmap).

## Acknowledgements

Built with [TanStack](https://tanstack.com), [shadcn/ui](https://ui.shadcn.com) and [Recharts](https://recharts.org).
