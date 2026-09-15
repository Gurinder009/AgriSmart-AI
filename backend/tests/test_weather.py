import os
import sys
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import httpx

# Ensure backend directory is in path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.config import settings
from app.database import SessionLocal, Base, engine
from app.utils.seed_data import seed_database
from app.services.weather_service import weather_service

# Ensure tables and seed data exist
Base.metadata.create_all(bind=engine)
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

client = TestClient(app)

def get_auth_token():
    resp = client.post("/api/auth/login", json={
        "email": "demo@agrismart.local",
        "password": "Demo@12345"
    })
    return resp.json()["access_token"]

# Sample valid OpenWeatherMap current response
MOCK_OPENWEATHER_CURRENT = {
    "coord": {"lon": 75.8573, "lat": 30.9010},
    "weather": [
        {"id": 800, "main": "Clear", "description": "clear sky", "icon": "01d"}
    ],
    "base": "stations",
    "main": {
        "temp": 31.4,
        "feels_like": 32.8,
        "temp_min": 30.2,
        "temp_max": 32.5,
        "pressure": 1012,
        "humidity": 48
    },
    "visibility": 10000,
    "wind": {"speed": 4.1, "deg": 120},
    "clouds": {"all": 15},
    "dt": 1726387200,
    "sys": {"type": 1, "id": 9165, "country": "IN", "sunrise": 1726360000, "sunset": 1726405000},
    "timezone": 19800,
    "id": 1264733,
    "name": "Ludhiana",
    "cod": 200
}

# Sample valid OpenWeatherMap 5-day / 3-hour forecast response
MOCK_OPENWEATHER_FORECAST = {
    "cod": "200",
    "message": 0,
    "cnt": 40,
    "list": [
        {
            "dt": 1726390800,
            "main": {"temp": 32.0, "temp_min": 29.5, "temp_max": 33.1, "pressure": 1012, "humidity": 46},
            "weather": [{"id": 800, "main": "Clear", "description": "clear sky", "icon": "01d"}],
            "clouds": {"all": 10},
            "wind": {"speed": 3.6},
            "pop": 0.05,
            "dt_txt": "2026-09-16 12:00:00"
        },
        {
            "dt": 1726477200,
            "main": {"temp": 28.5, "temp_min": 24.0, "temp_max": 30.0, "pressure": 1010, "humidity": 68},
            "weather": [{"id": 500, "main": "Rain", "description": "light rain", "icon": "10d"}],
            "clouds": {"all": 75},
            "wind": {"speed": 5.2},
            "pop": 0.65,
            "dt_txt": "2026-09-17 12:00:00"
        },
        {
            "dt": 1726563600,
            "main": {"temp": 30.0, "temp_min": 25.0, "temp_max": 31.5, "pressure": 1011, "humidity": 55},
            "weather": [{"id": 802, "main": "Clouds", "description": "scattered clouds", "icon": "03d"}],
            "clouds": {"all": 40},
            "wind": {"speed": 4.0},
            "pop": 0.15,
            "dt_txt": "2026-09-18 12:00:00"
        }
    ],
    "city": {
        "id": 1264733,
        "name": "Ludhiana",
        "coord": {"lat": 30.9010, "lon": 75.8573},
        "country": "IN",
        "population": 1545366,
        "timezone": 19800
    }
}

# =========================================================================
# CASE 1: WEATHER_API_KEY="" -> Simulation/Fallback Engine
# =========================================================================

def test_case_1_fallback_when_api_key_empty(monkeypatch):
    """When WEATHER_API_KEY is empty, AgriSmart uses simulation/fallback engine."""
    monkeypatch.setenv("WEATHER_API_KEY", "")
    
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    resp = client.get("/api/weather/current", params={"location": "Ludhiana, Punjab"}, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    
    assert data["data_source"] == "Simulation/Fallback"
    assert data["current"]["data_source"] == "Simulation/Fallback"
    assert "temperature" in data["current"]
    assert "humidity" in data["current"]
    assert "wind_speed" in data["current"]
    assert "rain_probability" in data["current"]
    assert "clouds" in data["current"]
    assert "pressure" in data["current"]
    assert len(data["forecast"]) >= 5
    assert len(data["agricultural_advisory"]) > 10
    assert "WEATHER_API_KEY is not configured" in (data["fallback_reason"] or "")

def test_case_1_forecast_fallback(monkeypatch):
    """Forecast endpoint also defaults to Simulation/Fallback when key is empty."""
    monkeypatch.setenv("WEATHER_API_KEY", "")
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    resp = client.get("/api/weather/forecast", params={"farm_id": 1}, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["data_source"] == "Simulation/Fallback"
    assert len(data["forecast"]) >= 5

# =========================================================================
# CASE 2: WEATHER_API_KEY="valid_key" -> OpenWeatherMap Real-Time API
# =========================================================================

def test_case_2_real_weather_when_api_key_present(monkeypatch):
    """When WEATHER_API_KEY is present and API succeeds, data source is OpenWeatherMap."""
    monkeypatch.setenv("WEATHER_API_KEY", "mock_valid_openweathermap_key_987654")
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Mock httpx.AsyncClient.get responses
    async def mock_async_get(self, url, params=None, **kwargs):
        mock_resp = MagicMock()
        if "weather" in url:
            mock_resp.status_code = 200
            mock_resp.json = MagicMock(return_value=MOCK_OPENWEATHER_CURRENT)
            mock_resp.raise_for_status = MagicMock()
            return mock_resp
        elif "forecast" in url:
            mock_resp.status_code = 200
            mock_resp.json = MagicMock(return_value=MOCK_OPENWEATHER_FORECAST)
            mock_resp.raise_for_status = MagicMock()
            return mock_resp
        raise ValueError(f"Unexpected url: {url}")

    with patch("httpx.AsyncClient.get", new=mock_async_get):
        resp = client.get("/api/weather/current", params={"farm_id": 1}, headers=headers)
        assert resp.status_code == 200
        data = resp.json()

        assert data["data_source"] == "OpenWeatherMap"
        assert data["current"]["data_source"] == "OpenWeatherMap"
        assert data["current"]["temperature"] == 31.4
        assert data["current"]["feels_like"] == 32.8
        assert data["current"]["humidity"] == 48.0
        assert data["current"]["clouds"] == 15
        assert data["current"]["pressure"] == 1012.0
        assert data["current"]["condition"] == "Clear"
        assert data["fallback_reason"] is None
        assert len(data["forecast"]) >= 3

# =========================================================================
# ERROR HANDLING TESTS: 401, 429, 404, Timeout, Network Error
# =========================================================================

def test_error_handling_invalid_api_key_401(monkeypatch):
    """HTTP 401 Unauthorized falls back safely with informative reason."""
    monkeypatch.setenv("WEATHER_API_KEY", "invalid_expired_key")
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    async def mock_async_401(self, url, params=None, **kwargs):
        req = httpx.Request("GET", url)
        resp = httpx.Response(401, request=req, json={"cod": 401, "message": "Invalid API key."})
        raise httpx.HTTPStatusError("401 Unauthorized", request=req, response=resp)

    with patch("httpx.AsyncClient.get", new=mock_async_401):
        resp = client.get("/api/weather/current", params={"location": "Amritsar"}, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["data_source"] == "Simulation/Fallback"
        assert "invalid or not activated" in data["fallback_reason"]

def test_error_handling_rate_limit_429(monkeypatch):
    """HTTP 429 Rate Limit falls back safely with informative reason."""
    monkeypatch.setenv("WEATHER_API_KEY", "rate_limited_key")
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    async def mock_async_429(self, url, params=None, **kwargs):
        req = httpx.Request("GET", url)
        resp = httpx.Response(429, request=req, json={"cod": 429, "message": "Account limit exceeded."})
        raise httpx.HTTPStatusError("429 Too Many Requests", request=req, response=resp)

    with patch("httpx.AsyncClient.get", new=mock_async_429):
        resp = client.get("/api/weather/current", params={"location": "Patiala"}, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["data_source"] == "Simulation/Fallback"
        assert "rate limit exceeded" in data["fallback_reason"]

def test_error_handling_timeout(monkeypatch):
    """Network timeout gracefully triggers fallback."""
    monkeypatch.setenv("WEATHER_API_KEY", "some_key")
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    async def mock_async_timeout(self, url, params=None, **kwargs):
        req = httpx.Request("GET", url)
        raise httpx.TimeoutException("Connection timed out", request=req)

    with patch("httpx.AsyncClient.get", new=mock_async_timeout):
        resp = client.get("/api/weather/current", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["data_source"] == "Simulation/Fallback"
        assert "timed out" in data["fallback_reason"]

def test_error_handling_invalid_coordinates(monkeypatch):
    """Out-of-bound coordinates are caught and don't cause crashes."""
    monkeypatch.setenv("WEATHER_API_KEY", "")
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Invalid latitude 999.0
    resp = client.get("/api/weather/current", params={"lat": 999.0, "lon": 75.0}, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["data_source"] == "Simulation/Fallback"

# =========================================================================
# SMART IRRIGATION INTEGRATION WITH REAL WEATHER
# =========================================================================

def test_smart_irrigation_with_real_weather_sync(monkeypatch):
    """Smart irrigation module receives and uses real weather telemetry."""
    monkeypatch.setenv("WEATHER_API_KEY", "mock_key_irrigation")
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    async def mock_async_get(self, url, params=None, **kwargs):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.raise_for_status = MagicMock()
        if "weather" in url:
            mock_resp.json = MagicMock(return_value=MOCK_OPENWEATHER_CURRENT)
            return mock_resp
        elif "forecast" in url:
            mock_resp.json = MagicMock(return_value=MOCK_OPENWEATHER_FORECAST)
            return mock_resp

    with patch("httpx.AsyncClient.get", new=mock_async_get):
        payload = {
            "farm_id": 1,
            "soil_moisture": 30.0,
            "temperature": 0.0, # Will be auto-synced
            "humidity": 0.0,    # Will be auto-synced
            "rainfall_probability": 0.0,
            "crop": "Wheat",
            "auto_weather_sync": True
        }
        resp = client.post("/api/irrigation/recommend", json=payload, headers=headers)
        assert resp.status_code == 200
        data = resp.json()

        assert data["irrigation_required"] is True
        assert data["weather_source"] == "OpenWeatherMap"
        assert data["weather_summary"] is not None
        assert data["weather_summary"]["temperature"] == 31.4
        assert data["weather_summary"]["humidity"] == 48.0
        assert data["weather_summary"]["data_source"] == "OpenWeatherMap"
