# SkillTrace AI

**Vocational Education Outcome Tracking & Labor Analytics Platform**

SkillTrace AI is a full-stack platform that tracks the journey of vocational-education
(VET) candidates from enrollment through employment, and turns that data into
actionable labor-market insight for training partners, employers, and government.

- Government scheme owners get pipeline analytics, skill-gap heatmaps, ROI reporting,
  and on-demand exports.
- Training partners manage courses, enrollments, student outcomes, and placement curves.
- Employers post jobs, match candidates with ML-scored placement likelihood, and run a
  hiring pipeline from applied to hired.
- Candidates get skill-gap feedback, job matches, placement-likelihood predictions, and
  outcome tracking — with SMS/WhatsApp surveys driving outcome collection.

## Table of Contents

- [Highlights](#highlights)
- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Environment Variables](#environment-variables)
- [Testing, Linting & Type Checking](#testing-linting--type-checking)
- [Production & Deployment](#production--deployment)
- [API Overview](#api-overview)

## Highlights

- **Outcome tracking**: SMS/WhatsApp/email surveys dispatched after course completion;
  Twilio webhooks collect `3 months / 6 months / 12 months` employment outcomes.
- **Match scoring**: quantifies how well a candidate fits a job posting.
- **Placement prediction (ML)**: a scikit-learn pipeline trained on candidate features
  predicts probability-of-employment, exposed through `/api/v1/ml/*`.
- **Hiring pipeline**: formal `applied → shortlisted → interview → offered → hired`
  lifecycle enforced in a service layer, not the router.
- **Skill-gap analytics**: NLP extraction of skills from resumes/job descriptions,
  plus a geo-aware region heatmap for government.
- **Reporting & exports**: CSV / XLSX / PDF generation for ROI, skill gaps, outcomes,
  candidates, and applications.
- **Notifications**: templated multi-channel notifications with Celery delivery and a
  pure, testable rendering service.
- **Privacy-aware**: Aadhaar masked + hashed at rest; candidate records are
  maskable per government data-protection rules.

## Architecture

```
                    ┌──────────────────────────────┐
                    │        Next.js 14 (TS)       │
                    │   Gov / Partner / Employer / │
                    │        Candidate portals     │
                    └──────────────┬───────────────┘
                                   │  JSON (REST, JWT)
                    ┌──────────────▼───────────────┐
                    │      FastAPI  (async)        │
                    │   /api/v1/*  · SQLAlchemy 2  │
                    │   Alembic migrations         │
                    └───┬──────────────┬───────────┘
                        │              │
              ┌─────────▼─────┐  ┌─────▼──────────┐
              │  PostgreSQL 16 │  │  Redis 7      │
              └───────────────┘  └───┬───────────┘
                                     │ broker
                       ┌─────────────▼───────────┐
                       │  Celery worker + beat   │
                       │  jobs · scrapers · NLP  │
                       │  surveys · notifications│
                       └─────────────┬───────────┘
                                     │
                        ml/ placement_model.joblib
```

The frontend is a single Next.js app with four role-area dashboards
(`/gov`, `/partner`, `/employer`, `/candidate`) plus public pages
(`/`, `/auth`, `/survey/[id]`). It calls the API directly from the browser via
`NEXT_PUBLIC_API_URL`. Celery workers consume queues for job scraping, NLP skill
extraction, survey dispatch, and notification delivery.

## Repository Layout

```
backend/            FastAPI application
  app/
    api/v1/         routers (auth, candidates, employers, courses, skill-gap,
                    analytics, enrollments, outcomes, job-postings, surveys,
                    webhooks, matches, shortlist, ml, applications, reports,
                    notifications)
    core/           security (JWT/OTP, Aadhaar hashing), exceptions, masking
    models/         SQLAlchemy models (candidate, training partner, employer,
                    course, enrollment, outcome, job posting, application,
                    survey template/response, notification, shortlist, ...)
    schemas/        Pydantic request/response models
    services/       business logic: matching, skill-gap, application lifecycle,
                    reporting, notification, ml bridge, worker queue bridge
    integrations/   digilocker auth, twilio whatsapp/sms, msg91 sms
    database.py     async engine + session factory
    config.py       environment-driven settings (pydantic-settings)
    seeds.py        demo-data seeder (python -m app.seeds)
  alembic/          migrations (0001..0010)
  tests/            pytest suite (services + api)

workers/            Celery app + tasks
  tasks/            analytics_agg, job_scraper, nlp_pipeline,
                    notification_dispatch, survey_scheduler
  tests/            scrapers, skill extraction

ml/                 placement prediction model
  placement_model.py   sklearn StandardScaler + GradientBoosting pipeline
  scripts/train.py     retrain + persist (python -m ml.scripts.train)
  tests/test_placement_model.py
  models/              (gitignored) placement_model.joblib

frontend/           Next.js 14 app (TypeScript + Tailwind)
  src/
    app/            routes per role area (gov/, partner/, employer/, candidate/)
                    + public (/ , /auth, /survey/[id])
    components/     layout (Sidebar/TopBar), ui, motion
    lib/            api.ts (JWT client), hooks/useDashboard.ts, auth.ts,
                    theme.ts, utils.ts, types/index.ts

infra/  ·  Makefile  ·  docker-compose*.yml  ·  pyproject.toml  ·  .env.example
```

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Backend   | Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Alembic, Pydantic v2, structlog |
| Database  | PostgreSQL 16 (`asyncpg`) |
| Queue     | Celery 5 + Redis 7 (broker/backend), Flower monitor |
| Job data  | job scrapers (Indeed, Naukri), NLP skill extraction |
| ML        | scikit-learn, pandas, numpy, joblib |
| Frontend  | Next.js 14, React 18, TypeScript 5, Tailwind CSS, Recharts, react-leaflet, framer-motion, TanStack Query, axios |
| Messaging | Twilio (WhatsApp + SMS), MSG91 SMS, DigiLocker OAuth |
| Exports   | reportlab (PDF), openpyxl (XLSX) |
| Infra     | Docker Compose, Makefile |

## Core Features

### Government (`/gov`)
- Portal overview + scheme analytics (placement rate, trends, top skills).
- Skill-gap analytics with a region heatmap and alerts.
- Online/offline candidate records with privacy masking.
- Reporting & export center: ROI, skill-gaps, outcomes, candidates, applications
  → CSV / XLSX / PDF.

### Training Partner (`/partner`)
- Course management with seats, curriculum-gap analysis.
- Enrollments (list/detail), student outcome import & tracking.
- Candidate match support for placements.

### Employer (`/employer`)
- Job posting management, candidate search with match scores.
- Hiring pipeline board with status lifecycle.
- Interviews view, shortlisting, alerts, notifications.

### Candidate (`/candidate`)
- Profile, skills, verification (DigiLocker), progress timeline.
- Job matches with match/placement scores.
- Applications tracker, outcome journey, notifications.

### Platform-wide
- Survey dispatch & response collection (`/survey/[id]`).
- JWT + role-based access; OTP and DigiLocker auth flows.
- ML placement-likelihood per candidate (`/api/v1/ml/*`).

## Getting Started (Local Development)

### Prerequisites
- **Docker** (with Docker Compose v2) — the fastest, recommended path.
- **Node.js 20+** and **npm** (only if you want the frontend outside Docker).
- Python 3.12+ (optional — only for running backend tests outside Docker).

### 1. Clone & configure

```bash
git clone <your-repo-url> skilltrace && cd skilltrace
cp .env.example .env
```

The `.env.example` values are working dev defaults (Postgres password,
`SECRET_KEY`, etc.). You can run dev as-is; override any secret you like.

### 2. Start the stack (backend + workers + frontend)

```bash
make dev            # docker compose up --build -d
```

This boots `postgres`, `redis`, `backend` (FastAPI, hot-reload on :8000),
`worker`, `beat`, `flower` (:5555) and the Next.js dev frontend on :3000.
Or run `docker compose up --build -d` directly. First boot may take several
minutes (images download + build).

### 3. Migrate the database

```bash
make migrate        # docker compose exec backend alembic upgrade head
```

### 4. Seed demo data

```bash
make seed           # docker compose exec backend python -m app.seeds
```

Seeds a rich demo dataset **idempotently** (training partners, employers,
courses, candidates, enrollments, employment outcomes across 3/6/12-month
intervals, job postings, applications, matches, shortlists, scheme-analytics
rows, skills, survey templates, and users). The seeder matches every entity
against its natural key and only inserts missing rows, so `python -m app.seeds`
is safe to run any number of times — on a fresh DB it seeds everything, on an
existing DB it just tops up whatever is missing.

### 5. Use the app

- Frontend: http://localhost:3000
- API docs (Swagger): http://localhost:8000/docs
- Health: http://localhost:8000/health
- Flower (Celery monitor): http://localhost:5555

Login demo accounts from `/auth` (see `DEMO_ACCOUNTS` in
`frontend/src/lib/auth.ts`); the seeder prints credentials on first run.

### Frontend-only workflow (optional)

If you prefer running the frontend on the host:

```bash
cd frontend
npm install
npm run dev        # Next.js on :3000
```

`NEXT_PUBLIC_API_URL` defaults to `http://localhost:8000/api/v1` in
docker-compose; set it manually only if your backend is elsewhere.

### Local ML

In the dev compose stack the `ml/` package is **not** mounted into the backend,
so `/api/v1/ml/*` returns not-ready. To use the ML features locally, run the
prod-style overlay (which mounts `./ml` and trains/loads the model):

```bash
cp .env.example .env   # ensure DEBUG=true ENV=dev for ease, or set prod values
make prod-up
make prod-migrate
# model is auto-trained on first /api/v1/ml request, or manually:
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod \
  exec backend python -m ml.scripts.train
```

### Useful commands

| Task | Command |
|------|---------|
| View logs | `make logs` |
| Worker logs | `make logs-worker` |
| Create a migration | `make migrate-create msg="what changed"` |
| Run tests in the container | `make test` |
| Rebuild from scratch | `make db-down && make dev && make migrate && make seed` |
| Stop everything | `make down` |

## Environment Variables

Copy `.env.example` → `.env`. Key groups:

| Group | Variables | Notes |
|-------|-----------|-------|
| Database | `POSTGRES_HOST` `POSTGRES_PORT` `POSTGRES_USER` `POSTGRES_PASSWORD` `POSTGRES_DB` | Backend builds `postgresql+asyncpg://...` in `app/config.py` |
| Redis / Celery | `REDIS_HOST` `REDIS_PORT` `REDIS_DB` `CELERY_BROKER_URL` `CELERY_RESULT_BACKEND` | Broker URL `redis://redis:6379/0` |
| Backend | `SECRET_KEY` `ACCESS_TOKEN_EXPIRE_MINUTES` `BACKEND_URL` `DEBUG` `ENV` `CORS_ORIGINS` | `CORS_ORIGINS` is a CSV. In prod (`ENV=prod`, `DEBUG=false`) a placeholder `SECRET_KEY` fails fast at boot; Swagger/Redoc are hidden |
| Auth | `JWT_ALGORITHM` `DIGILOCKER_CLIENT_ID` `DIGILOCKER_CLIENT_SECRET` `DIGILOCKER_REDIRECT_URI` `DIGILOCKER_BASE_URL` | DigiLocker OAuth flow |
| Messaging | `TWILIO_ACCOUNT_SID` `TWILIO_AUTH_TOKEN` `TWILIO_WHATSAPP_NUMBER` `TWILIO_SMS_NUMBER` `TWILIO_WEBHOOK_SECRET` `MSG91_AUTH_KEY` `MSG91_SENDER_ID` | Twilio webhooks verify signatures when `TWILIO_WEBHOOK_SECRET` is set |
| Surveys | `SURVEY_CHANNEL_PREFERENCE` `SURVEY_SMS_FALLBACK` `SURVEY_RETRY_DAYS` `SURVEY_MAX_ATTEMPTS` `SURVEY_EXPIRY_DAYS` `PUBLIC_APP_BASE_URL` | Outcome-survey dispatch policy |
| Scrapers | `INDEED_PUBLISHER_ID` `JOB_SCRAPE_MAX_PER_SECTOR` | Naukri/Indeed scraping limits |
| Frontend | `NEXT_PUBLIC_API_URL` `NEXT_PUBLIC_APP_NAME` | URL is what the **browser** calls |

> `BACKEND_INTERNAL_URL` is deliberately NOT in `.env`; it is hardcoded to
> `http://backend:8000` in docker-compose.yml because it is baked into the
> Next.js standalone build at build time.

## Testing, Linting & Type Checking

Run from the repo root:

```bash
# Backend tests (service + API)
python -m pytest backend/tests -q -p no:cacheprovider

# Worker + ML tests
python -m pytest workers/tests ml/tests -q -p no:cacheprovider

# Full suite
python -m pytest backend/tests workers/tests ml/tests -q -p no:cacheprovider

# Backend import smoke check
$env:PYTHONPATH="$PWD\backend"; python -c "import app.main"

# Backend lint (F-class; the project intentionally keeps E712/T201 styles)
cd backend; python -m ruff check app/ --select F401,F811,F821

# Frontend type check (the canonical FE gate)
cd frontend; npx tsc --noEmit
```

> **Note:** `npm run build` fails on Windows hosts because the npm mirror serves a
> corrupt 0-byte `@next/swc-win32-x64-msvc` binary. That is an environment issue,
> not code — use `npx tsc --noEmit` on Windows. Linux container builds (used by
> `Dockerfile.prod`) work normally.

Tests marked `backend/tests/...` include pure-logic suites (matching, application
lifecycle, reporting byte-builders, notification rendering, ML service).

## Production & Deployment

### Option A — Self-hosted prod-style via Docker Compose

A hardened overlay (`docker-compose.prod.yml`, `frontend/Dockerfile.prod`)
runs everything behind loopback: backend without `--reload` (DEBUG off, Swagger
hidden), Postgres/Redis un-published, ML mount enabled, and a standalone
`frontend-prod` on :3001.

```bash
make prod-up          # explicit service list; dev frontend on :3000 is NOT exposed
make prod-migrate     # once after first boot (no auto-migration at startup)
```

### Option B — Render (backend) + Vercel (frontend), free tier

`render.Dockerfile` + `render.yaml` deploy the FastAPI backend and a free
PostgreSQL on [Render](https://render.com) (no credit card needed); the
frontend goes on a static/Vercel deployment pointing `NEXT_PUBLIC_API_URL` at
the Render service.

Free-tier caveats to know:
- No Redis / no Celery worker or beat → job scraping, survey dispatch, and
  notification delivery stay `queued` (never delivered). Notifications are
  still stored; delivery is a single Redis/Celery hop away once you add a paid
  worker.
- Free Postgres is auto-deleted 30 days after creation — you must refresh it.
- 512 MB RAM / 0.1 vCPU; service sleeps after 15 min idle (~1 min cold start);
  750 instance hours + 500 build minutes per month.
- `SEED_ON_START=true` in `render.yaml` seeds demo data on boot. The seeder is
  idempotent, so leaving the flag on is harmless (re-runs are no-ops) — but
  flipping it to `true` once and then to `false` after "Seed complete" log is
  still the cleanest deploy flow. After a free-Postgres expiry/refresh, simply
  flip the flag `true` again to reseed a brand-new database.
- Before deploying the frontend, replace `CORS_ORIGINS` in `render.yaml` with
  your real Vercel origin.

#### Keeping the free tier warm (uptime guidance)

These two platforms sleep on completely different clocks:

- **Vercel frontend**: never spins down from inactivity — the CDN and
  serverless functions stay available on the Hobby plan, so **do not** waste a
  cron job pinging it. Its limits are monthly bandwidth/function-count, not
  idle-related.
- **Render backend (free)**: sleeps after **15 minutes** without inbound
  traffic and takes ~1 minute to cold-start on the next request. Because the
  two are on separate hosts, pinging the Vercel URL keeps *nothing* warm — a
  keep-warm job must hit the backend, e.g.:

  ```
  https://skilltrace-api-6j5j.onrender.com/health   (any interval < 15 min)
  ```

  Use **cron-job.org** (free, 24/7, intervals down to 1 min) or **UptimeRobot**
  (free, 5-min checks); GitHub Actions schedules auto-disable after 60 days of
  repo inactivity, so they're a weak choice here.

  ⚠️ **Hour-budget caveat:** awake time consumes the workspace's
  **750 free instance-hours/month** (a 31-day month is ~744 h). Keeping one
  backend awake 24/7 uses nearly the whole allowance — which fits for a single
  service but means a *second* always-on free service will push you over the
  cap, and Render **suspends all free services in the workspace** until the
  month resets. Monitor the instance-hours in the Render dashboard over the
  month.

- **Free Postgres** expires 30 days after creation regardless of any pings;
  after a refresh, re-run the seeder (now safe to repeat) to rebuild demo data.

Both options keep the same API; `package.json` scripts and the worker/beat
services are only needed when you self-host.

## API Overview

All routes live under `/api/v1` (see `backend/app/main.py` for the registry).
A few notable surfaces:

| Area | Examples |
|------|----------|
| Auth | `POST /auth/login` · `POST /auth/otp/send` · `GET /auth/digilocker/...` |
| Candidates | `GET /candidates/me` · `/candidates/{id}` · verification |
| Training partners | `/training-partners/*` · `/courses/*` |
| Enrollments | `/enrollments/*` |
| Outcomes | `/outcomes/*` · `/outcomes/import` |
| Jobs & matches | `/job-postings/*` · `/matches/*` · `/shortlist/*` |
| ML | `GET /ml/health` · `GET /ml/placement/{id}` · `POST /ml/placement/score` |
| Reports | `GET /reports/available` · `GET /reports/snapshot` · `GET /reports/{type}.{csv\|xlsx\|pdf}` |
| Hiring pipeline | `POST /applications/` · `GET /applications/mine` · `PATCH /applications/{id}/status` |
| Notifications | `POST /notifications/send` · `GET /notifications/mine` · templates & stats |
| Surveys | `POST /surveys/dispatch` · responses · `GET /surveys/{token}` |
| Webhooks | `POST /webhooks/twilio/whatsapp` · `/webhooks/twilio/sms` |
| Analytics | `/analytics/dashboard` · `/analytics/skill-gaps` · `/analytics/scheme-roi` |

Open the interactive docs at `/docs` in dev for the full 60+ endpoints.

## License

Proprietary / all rights reserved — see your project owners.