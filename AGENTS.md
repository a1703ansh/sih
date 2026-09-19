# SkillTrace AI — Development Guide

Vocational education outcome tracking & labor analytics platform.

## Repo layout
- `backend/` — Python 3.12+ · FastAPI · SQLAlchemy 2.0 (async) · Alembic
- `frontend/` — Next.js 14 · TypeScript · Tailwind
- `workers/` — Celery + Redis · NLP extraction · job scrapers
- `ml/` — ML models
- `infra/` · `docs/` · `.github/`

## Commands
- Backend import / app check:
  `$env:PYTHONPATH="C:\aaditya\Opencode-project\SIH26135\backend"; python -c "import app.main"`
- Backend lint (F-class only; full `ruff check` is noisy by design):
  `python -m ruff check app/ --select F401,F811,F821`  (run from `backend/`, use `python -m ruff`, not the `ruff` cmdlet)
- Tests (run from repo root):
  `python -m pytest backend/tests workers/tests -q -p no:cacheprovider`
- Frontend type check (canonical gate):
  `npx tsc --noEmit`  (run from `frontend/`)

## Environment notes (do not "fix")
- **Frontend `npm run build` fails by design** due to a corrupt 0-byte SWC binary
  (`@next/swc-win32-x64-msvc`) served by the npm mirror. This is an environment issue,
  NOT code. Use `npx tsc --noEmit` as the frontend gate instead.
- `eslint` is pinned to `^8.57.0` (eslint-config-next@14.2.x requires eslint ^8).
- `optionalDependencies` includes `"@next/swc-win32-x64-msvc": "npm:null@*"` as a
  deliberate workaround — leave it.
- Test runner config in `pyproject.toml` (repo root) pulls `--cov`, so tests require
  `pytest-cov`.
- E712 SQLAlchemy styles (`== True`) and T201 `print` statements are intentionally kept.

## ML (Sprint 6)
- `ml/placement_model.py` — sklearn pipeline (StandardScaler + GradientBoosting)
  predicting P(employed). Trains on synthetic-but-realistic seed data
  (`train()`), persists via joblib to `ml/models/placement_model.joblib`.
- Train (from repo root): `python -m ml.scripts.train`
- Model deps: `scikit-learn`, `joblib`, `pandas`, `numpy` (all installed).
- Backend bridge: `backend/app/services/ml_service.py` (`model_ready`,
  `score_features`, `features_for_candidate`). Router in
  `backend/app/api/v1/ml.py`: `GET /ml/health`, `GET /ml/placement/{id}`,
  `POST /ml/placement/score`. Service imports the `ml` package by inserting the
  repo root (NOT `ml/`) on `sys.path` — `ml` package must be importable.
- Version the model: retrain and re-save after schema/feature changes.

## Conventions
- Backend: SQLAlchemy async, `require_role(...)` dependency guards, routers registered
  in `backend/app/main.py` under `/api/v1/...`.
- **Route ordering**: define static paths (`/stats/summary`) BEFORE parameterized
  catchall paths (`/{candidate_id}`); FastAPI matches in definition order and this
  prevents UUID-parse shadowing.
- Frontend: `"use client"` pages compose `Sidebar` + `TopBar`; data hooks live in
  `frontend/src/lib/hooks/useDashboard.ts`; types in `frontend/src/lib/types/index.ts`;
  `frontend/src/lib/api.ts` attaches the JWT and redirects on 401.
- Keep the project's intentional ruff style (E712/T201) — do not "clean up" it.

## Hiring Pipeline (Sprint 7)
- `JobApplication` model (`backend/app/models/job_application.py`) + enum
  `application_status`: `applied → shortlisted → interview → offered → hired`,
  with `rejected` allowed from any non-terminal stage; `hired`/`rejected` are
  terminal. Enforce via `backend/app/services/application_service.py`
  (`can_transition`, `funnel_counts`) — do NOT transition inline in the router
  or DB without the guard.
- Router `backend/app/api/v1/applications.py` under `/api/v1/applications`:
  `POST /` (candidate applies, snapshots match score), `GET /mine`,
  `GET /job/{id}`, `GET /pipeline/{id}`, `PATCH /{id}/status`. The status PATCH
  returns 400 on an invalid transition.
- JWT `sub` is the **User.id** (not candidate/employer id). Resolve the current
  candidate via `User.candidate_id` and employer via `User.employer_id`; the
  existing `/candidates/me` treating `sub` as candidate id is a known inconsistency.
- Migration `backend/alembic/versions/0003_job_applications.py` (chains 0003→0002).

## Reporting & Exports (Sprint 8)
- Router `backend/app/api/v1/reports.py` under `/api/v1/reports`:
  `GET /available` (catalog), `GET /snapshot` (on-demand analytics JSON), and the
  parameterized `GET /{report_type}.{fmt}` where `fmt ∈ {csv, xlsx, pdf}` and
  `report_type` is whitelisted via `reporting_service.is_reportable`. Static
  paths (`/available`, `/snapshot`) are declared BEFORE `/{report_type}.{fmt}`.
- All byte-building lives in the pure, DB-agnostic
  `backend/app/services/reporting_service.py` (`to_csv`, `to_xlsx`, `to_pdf`,
  `report_columns`, `REPORT_LABELS`). The router only queries and converts rows
  via `_row_to_dict`; keep any new report pure-testable there.
- Export deps installed: `reportlab` (PDF), `openpyxl` (XLSX). Test the builders
  in `backend/tests/services/test_reporting.py` (no DB needed).
- Frontend export center: `frontend/src/app/gov/reports/page.tsx`, download
  helper `downloadReport` in `frontend/src/lib/hooks/useDashboard.ts` (axios
  `responseType: "blob"` + content-disposition filename).

## Notifications (Sprint 9)
- Models `backend/app/models/notification.py` (`Notification`,
  `NotificationTemplate`) + migration `0004_notifications.py` (chains 0004→0003).
- Router `backend/app/api/v1/notifications.py` under `/api/v1/notifications`:
  `POST /send` (queue, renders named template), `GET /mine` (candidate),
  `GET /templates` + `POST /templates` (admin), `GET /stats` (delivery
  analytics), `PATCH /{id}/read`. Static paths declared before `/{id}/read`.
- Pure logic in `backend/app/services/notification_service.py`
  (`render_template`, `build_application_status_variables`,
  `APPLICATION_STATUS_NOTIFICATIONS`, `DEFAULT_TEMPLATES`, `dispatch_via_service`).
- Delivery is enqueued to Celery via `backend/app/services/worker_queue.py`
  (`enqueue_delivery`) → `workers/tasks/notification_dispatch.py`
  (`deliver_notification`). The bridge swallows broker errors so the API stays
  up; unsent rows remain `queued`.
- Auto-notifications: the hiring-pipeline status PATCH
  (`applications.py` → `_queue_status_notification`) creates a `Notification`
  row for shortlisted/interview/offered/hired/rejected and enqueues delivery.
- Frontend: `frontend/src/app/candidate/notifications/page.tsx` + hooks
  `useMyNotifications`, `useNotificationStats`, `markNotificationRead`,
  `sendNotification` in `useDashboard.ts`.

## Deployment (post-Sprint-11 hardening)
- Dev stays: `docker compose up --build -d` (`make dev`). Hot-reload, DEBUG on, Swagger visible.
- Prod-style on a VM: `docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d --build`
  (added as `make prod-up`).
  - backend: no `--reload`, DEBUG=false, Swagger/Redoc hidden, and fail-fast if the placeholder
    `SECRET_KEY` is still set (`config.get_settings` guard). CORS origins from `CORS_ORIGINS` (CSV).
  - `./ml` is volume-mounted onto backend so the placement model is loadable; `/api/v1/ml/*`
    returns real scores (model trained via `python -m ml.scripts.train`).
  - postgres/redis are NOT published to the host.
  - `frontend-prod` (port 3001): standalone Next build (`output: "standalone"` in next.config.js,
    `frontend/Dockerfile.prod`) — slim ~460 MB image; the Linux-container `next build` works
    (only the Windows-host SWC binary is corrupt — keep that note above). Its runtime stage must copy `.next/standalone` -> /app AND `.next/static` -> /app/.next/static; copying only `.next` 404s every /_next/static asset and serves an unstyled page.
- Frontend API wiring:
  - `NEXT_PUBLIC_API_URL` (build arg + runtime env on both frontends) is the URL the
    BROWSER calls - set it to the public backend URL on a remote host.
  - `BACKEND_INTERNAL_URL` is the in-Docker origin for the Next.js server-side `/api`
    rewrite; hardcoded to `http://backend:8000` in docker-compose.yml because it is baked
    into `.next/routes-manifest.json` at build time (`frontend-prod`). Never point it at a
    localhost value from `.env` - that silently breaks the production frontend.
- `make prod-up` starts an explicit service list (postgres redis backend worker beat flower
  frontend-prod), so the dev `next dev` server on :3000 is not exposed. Run `make prod-migrate`
  once after first boot (there is no auto-migration at startup).



