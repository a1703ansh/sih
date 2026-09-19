# Render deployment image (build context = repo root, unlike backend/Dockerfile
# whose context is ./backend). Keeps the canonical container layout intact:
#   backend/ -> /app   (so `app.main`, `alembic`, alembic.ini all resolve)
#   ml/       -> /ml   (ml_service.py computes repo-root "/", inserts it on
#                       sys.path, and imports `ml.placement_model` -> /ml.
#                       Mirrors docker-compose.prod.yml's `./ml:/ml` mount.)
# workers/ is intentionally NOT copied: inside the API process the Celery
# bridge (app/services/worker_queue.py) is designed to swallow the missing
# `workers` import, and Render free has no worker plan anyway.
#
# Build: docker build -f render.Dockerfile -t skilltrace-render .

FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --timeout 120 --retries 20 -r /app/requirements.txt

COPY backend/ /app/
COPY ml/ /ml/

EXPOSE 8000

# Render routes to the port in $PORT (default 10000); bind it, fallback 8000.
# Run migrations before serving (Render free instances have no shell to do it
# manually). SEED_ON_START="true" seeds demo data on a single boot.
CMD ["sh", "-c", "alembic upgrade head && if [ \"$SEED_ON_START\" = \"true\" ]; then python -m app.seeds; fi && exec uvicorn app.main:app --host 0.0.0.0 --port \"${PORT:-8000}\""]