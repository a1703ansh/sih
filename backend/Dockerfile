FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN grep -v '^xgboost==' requirements.txt > requirements-docker.txt \
    && echo 'xgboost==2.0.3' >> requirements-docker.txt
RUN --mount=type=cache,target=/root/.cache/pip pip install --timeout 120 --retries 20 --extra-index-url https://download.pytorch.org/whl/cpu -r requirements-docker.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
