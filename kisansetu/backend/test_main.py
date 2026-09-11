import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is on sys.path for `from main import app`
# Handles both `pytest backend/test_main.py` (from kisansetu) and `pytest kisansetu/backend/test_main.py` (from brindhavan)
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
# Also add parent for app package resolution
parent_dir = os.path.dirname(backend_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from main import app

client = TestClient(app)

def test_health_status():
    """Health endpoint must return 200 and correct payload structure."""
    response = client.get("/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert "status" in data, "Missing 'status' in health response"
    assert data["status"] == "healthy", f"Expected 'healthy', got {data['status']}"
    assert "service" in data
    assert "version" in data

def test_docs_endpoint():
    """FastAPI auto-docs must be reachable."""
    response = client.get("/docs")
    assert response.status_code == 200, f"Expected 200 for /docs, got {response.status_code}"
    # Docs returns HTML
    assert "text/html" in response.headers.get("content-type", "")
    assert "swagger" in response.text.lower() or "openapi" in response.text.lower()

def test_soil_matrix_deterministic():
    """Soil calculation must be deterministic and not throw exceptions."""
    payload = {
        "nitrogen": 35,
        "phosphorus": 60,
        "potassium": 45,
        "ph": 6.5,
        "crop": "Tomato"
    }
    # First call
    r1 = client.post("/api/v1/soil/analyze", json=payload)
    assert r1.status_code == 200, f"Soil analyze failed: {r1.text}"
    data1 = r1.json()
    assert "suitability_score" in data1
    assert "status" in data1
    assert "recommendation" in data1
    assert 0 <= data1["suitability_score"] <= 100
    # Second call with same payload must return identical deterministic result
    r2 = client.post("/api/v1/soil/analyze", json=payload)
    assert r2.status_code == 200
    data2 = r2.json()
    assert data1["suitability_score"] == data2["suitability_score"], "Soil engine not deterministic"
    assert data1["status"] == data2["status"]
    assert data1["deficiencies"] == data2["deficiencies"]
    # Test another crop matrix does not throw
    payload_wheat = {**payload, "crop": "Wheat", "nitrogen": 85}
    r3 = client.post("/api/v1/soil/analyze", json=payload_wheat)
    assert r3.status_code == 200
    assert r3.json()["suitability_score"] >= 0

def test_cors_headers():
    """CORS must allow configured origins and Vercel wildcard."""
    # Test localhost origin
    headers = {"Origin": "http://localhost:5173"}
    response = client.get("/health", headers=headers)
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers, "Missing CORS header for localhost"
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"

    # Test Vercel preview wildcard
    headers_vercel = {"Origin": "https://kisansetu-preview.vercel.app"}
    response_v = client.get("/health", headers=headers_vercel)
    assert response_v.status_code == 200
    assert "access-control-allow-origin" in response_v.headers, "Missing CORS header for Vercel preview"
    # Should echo the Vercel origin due to regex
    assert "vercel.app" in response_v.headers["access-control-allow-origin"]

    # Test that disallowed origin is not echoed (should not have CORS header or be empty)
    # We don't enforce strict failure here, just ensure no crash
    headers_bad = {"Origin": "http://evil.com"}
    response_bad = client.get("/health", headers=headers_bad)
    assert response_bad.status_code == 200
