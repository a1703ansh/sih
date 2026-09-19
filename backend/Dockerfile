FROM python:3.12-slim

WORKDIR /app

# No build toolchain needed: every pinned wheel ships prebuilt for cp312 manylinux.
COPY requirements.txt ./
RUN --mount=type=cache,target=/root/.cache/pip pip install --timeout 120 --retries 20 --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
