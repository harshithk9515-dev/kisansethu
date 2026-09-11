# KisanSetu — Production Deployment Prep (Render + Vercel) — Zero Downtime
# Run from repository root: powershell -ExecutionPolicy Bypass -File deploy_prep.ps1
# Requires: git, node 18+, python 3.11, vercel CLI (optional), render CLI (optional)

$ErrorActionPreference = "Stop"

Write-Host "🌾 KisanSetu — Enterprise Deployment Prep" -ForegroundColor Green
Write-Host "   Backend: Render (FastAPI + Docker) | Frontend: Vercel (Vite + SPA)" -ForegroundColor Gray

# ─────────────────────────────────────────────────────────────────
# 0. Preflight — verify tools
# ─────────────────────────────────────────────────────────────────
function Assert-Command($cmd, $hint) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Missing: $cmd — $hint" -ForegroundColor Red
    exit 1
  }
}
Assert-Command git "Install from https://git-scm.com/download/win"
Assert-Command node "Install Node 18+ from https://nodejs.org"
Assert-Command python "Install Python 3.11 from https://python.org (add to PATH)"
Assert-Command npm "Install Node.js to get npm"

# Ensure we are at repo root (kisansetu/)
$repoRoot = Split-Path -Parent $PSScriptRoot
if (-not $repoRoot -or $repoRoot -eq "") { $repoRoot = Get-Location }
if (Test-Path "$PSScriptRoot\backend\main.py") { $repoRoot = $PSScriptRoot }
elseif (Test-Path "kisansetu\backend\main.py") { $repoRoot = (Get-Location).Path + "\kisansetu" }
else { $repoRoot = (Get-Location).Path }

Set-Location $repoRoot
Write-Host "→ Repo root: $repoRoot" -ForegroundColor Cyan

# ─────────────────────────────────────────────────────────────────
# 1. Git init (if needed) + stage + commit
# ─────────────────────────────────────────────────────────────────
if (-not (Test-Path ".git")) {
  Write-Host "`n→ Initializing git..." -ForegroundColor Yellow
  git init
  git branch -M main
} else {
  Write-Host "`n→ Git already initialized" -ForegroundColor Green
}

Write-Host "→ Staging all files..." -ForegroundColor Yellow
git add .

# Configure git identity if missing (local fallback)
$hasName = git config user.name 2>$null
$hasEmail = git config user.email 2>$null
if (-not $hasName) { git config user.name "KisanSetu Deployer" }
if (-not $hasEmail) { git config user.email "deploy@kisansetu.local" }

$status = git status --porcelain
if (-not $status) {
  Write-Host "→ Nothing to commit — working tree clean" -ForegroundColor Green
} else {
  Write-Host "→ Committing..." -ForegroundColor Yellow
  git commit -m "feat(production): enterprise deployment configurations for render & vercel

- backend/Dockerfile: python 3.11-slim, Pillow deps, non-root appuser, dynamic PORT
- backend/render.yaml: Blueprint (python runtime, pip install, uvicorn start, GEMINI_API_KEY secret, PYTHON 3.11)
- backend/main.py: CORS allow_origins + allow_origin_regex for FRONTEND_URL and https://*.vercel.app
- backend/app/core/config.py: FRONTEND_URL BaseSettings binding
- frontend/vercel.json: SPA rewrites (/api -> Render, /* -> /index.html) + asset caching
- frontend/src/services/api.js: VITE_BACKEND_URL dynamic base (fallback to /api/v1)
- frontend/.env.example: documents VITE_BACKEND_URL
- .gitignore: node_modules, .env, dist, __pycache__, venv
"
  if ($LASTEXITCODE -ne 0) { Write-Host "Commit failed — maybe nothing staged" -ForegroundColor Yellow }
  else { Write-Host "✓ Committed" -ForegroundColor Green }
}

Write-Host "`n→ Latest commits:" -ForegroundColor Cyan
git log --oneline -3

# ─────────────────────────────────────────────────────────────────
# 2. Production build validation (local, zero-downtime safety)
# ─────────────────────────────────────────────────────────────────
Write-Host "`n→ Validating backend (pip)..." -ForegroundColor Yellow
Push-Location backend
if (Test-Path "requirements.txt") {
  python -m pip install --quiet -r requirements.txt
  python -m py_compile main.py
  python -m py_compile app/models/schemas.py
  Write-Host "✓ Backend py_compile passed" -ForegroundColor Green
}
Pop-Location

Write-Host "`n→ Validating frontend (npm)..." -ForegroundColor Yellow
Push-Location frontend
npm install --silent | Out-Null
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "✗ Frontend build failed" -ForegroundColor Red; exit 1 }
Write-Host "✓ Frontend vite build passed" -ForegroundColor Green
Pop-Location

# ─────────────────────────────────────────────────────────────────
# 3. Step-by-step deployment instructions (copy-paste ready)
# ─────────────────────────────────────────────────────────────────
Write-Host @"

================================================================
🚀 NEXT STEPS — Link GitHub, Render, Vercel (copy-paste)
================================================================

1) CREATE GITHUB REPO & PUSH (run once):
   # Create empty repo at https://github.com/new (no README) → copy URL
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/kisansetu.git
   git push -u origin main
   # If remote exists:
   # git remote set-url origin https://github.com/<YOUR_GITHUB_USERNAME>/kisansetu.git
   # git push -u origin main

2) RENDER — Backend (Docker or Python):
   a) Go to https://dashboard.render.com → New → Blueprint → Connect GitHub repo
      - Select repo: YOUR_GITHUB_USERNAME/kisansetu
      - Render auto-detects kisansetu/backend/render.yaml
      - Confirm service: kisansetu-backend (region: singapore, plan: free)
   b) Set environment secrets (Dashboard → Service → Environment):
      - GEMINI_API_KEY = <your-google-gemini-key>  (Mark as secret, sync:false)
      - FRONTEND_URL   = https://YOUR_FRONTEND.vercel.app  (update after Vercel deploy)
      - PYTHON_VERSION = 3.11.0
   c) Alternative (no Blueprint):
      Render → New → Web Service → Connect repo
      - Root Directory: kisansetu/backend
      - Runtime: Docker (uses Dockerfile) OR Python
      - Build Command: pip install -r requirements.txt
      - Start Command: uvicorn main:app --host 0.0.0.0 --port `$PORT
      - Health Check: /health
      - Add same env vars above → Deploy
   d) Wait for `Live` → copy backend URL: https://kisansetu-backend.onrender.com
      Test: curl https://kisansetu-backend.onrender.com/health

3) VERCEL — Frontend (SPA):
   a) Install CLI (optional): npm i -g vercel
   b) Dashboard: https://vercel.com/new → Import Git Repository
      - Select YOUR_GITHUB_USERNAME/kisansetu
      - Framework Preset: Vite
      - Root Directory: kisansetu/frontend   (IMPORTANT)
      - Build Command: npm run build
      - Output Directory: dist
      - Install Command: npm install
   c) Environment Variables (Vercel → Project → Settings → Environment Variables):
      - VITE_BACKEND_URL = https://kisansetu-backend.onrender.com
        (no trailing slash, no /api — the code appends /api/v1)
      - Add for Production, Preview, Development
   d) Deploy → copy frontend URL: https://YOUR_FRONTEND.vercel.app
   e) Update Render FRONTEND_URL to the Vercel URL above → Redeploy backend (to allow CORS)
      Render → Environment → FRONTEND_URL → Save → Manual Deploy → Deploy latest commit

4) VERIFY ZERO-DOWNTIME:
   curl https://kisansetu-backend.onrender.com/health
   curl https://kisansetu-backend.onrender.com/api/v1/weather
   curl https://YOUR_FRONTEND.vercel.app/  # Should serve index.html (SPA)
   # In browser: Open frontend → DevTools Network → /api/v1/mandi/rates should 200 via Vercel rewrite
   # If CORS error: check Render logs → Settings → CORS allow_origin_regex covers https://*.vercel.app and FRONTEND_URL

5) ROLLBACK (if needed):
   Render → Deploys → Rollback to previous live deploy
   Vercel → Deployments → … → Instant Rollback

6) LOCAL PREVIEW OF PRODUCTION BUILD:
   cd kisansetu/frontend; npm run build; npm run preview  # http://localhost:4173
   cd kisansetu/backend; `$env:PORT=8000; python -m uvicorn main:app --host 0.0.0.0 --port 8000

================================================================
✅ Done — Enterprise deployment configs live in repo
   - backend/Dockerfile, backend/render.yaml, backend/main.py (CORS), backend/app/core/config.py
   - frontend/vercel.json, frontend/src/services/api.js, frontend/.env.example
   - .gitignore, deploy_prep.ps1
================================================================
"@ -ForegroundColor Gray

Write-Host "`n✨ Ready to push: git push -u origin main" -ForegroundColor Green
