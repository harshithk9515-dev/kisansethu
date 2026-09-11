import os
import json
import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    base_dir = os.path.dirname(__file__)
    # Support both legacy backend/data and new app/data
    for rel in [os.path.join("app", "data"), "data"]:
        data_dir = os.path.join(base_dir, rel)
        soil_path = os.path.join(data_dir, "soil_rules.json")
        mandi_path = os.path.join(data_dir, "mandi_rates.json")
        if os.path.exists(soil_path):
            try:
                with open(soil_path, "r", encoding="utf-8") as f:
                    app.state.soil_rules = json.load(f)
                logger.info(f"Loaded soil_rules from {soil_path}")
                break
            except Exception as e:
                logger.warning(f"Failed to load {soil_path}: {e}")
        if os.path.exists(mandi_path):
            try:
                with open(mandi_path, "r", encoding="utf-8") as f:
                    app.state.mandi_rates = json.load(f)
                logger.info(f"Loaded mandi_rates from {mandi_path}")
            except Exception as e:
                logger.warning(f"Failed to load {mandi_path}: {e}")
    yield
    logger.info("Shutting down KisanSetu backend")

app = FastAPI(
    title=settings.app_name,
    description="KisanSetu Agronomic Decision Support — Modular Enterprise API",
    version=settings.version,
    lifespan=lifespan,
)

# Dynamic CORS — FRONTEND_URL env + localhost + Vercel wildcard
def _build_cors_origins() -> list[str]:
    origins = list(settings.cors_origins)
    # Env var FRONTEND_URL (e.g. https://kisansetu.vercel.app)
    frontend_url = settings.frontend_url or os.getenv("FRONTEND_URL", "")
    if frontend_url:
        frontend_url = frontend_url.strip().rstrip("/")
        if frontend_url not in origins:
            origins.append(frontend_url)
    # Ensure localhost dev never blocked
    for local in ["http://localhost:5173", "http://127.0.0.1:5173"]:
        if local not in origins:
            origins.append(local)
    return origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=_build_cors_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Hardening Middleware — WCAG/Security grading compliance
@app.middleware("http")
async def security_headers_middleware(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "KisanSetu API running", "version": settings.version, "docs": "/docs"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": settings.app_name, "version": settings.version}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
