# KisanSetu Backend — Production Dockerfile (Render / Railway / Docker)
# Lean Python 3.11-slim with Pillow system deps, non-root user, dynamic $PORT
FROM python:3.11-slim

# Prevent Python from writing pyc files and buffer stdout
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# System deps for Pillow (jpeg, zlib, freetype) + curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg62-turbo-dev \
    zlib1g-dev \
    libfreetype6-dev \
    liblcms2-dev \
    libopenjp2-7-dev \
    libtiff6 \
    libwebp-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifest first for Docker layer caching
COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code (backend context is kisansetu/backend)
COPY . .

# Create non-root user for production security
RUN useradd -m -u 1001 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Render injects $PORT (default 10000); fallback 8000 for local
EXPOSE 8000

# Healthcheck hits FastAPI /health (allow 40s startup)
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Dynamic port binding — Render sets $PORT
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --log-level info"]
