import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.database import SessionLocal, Base, engine
from app.utils.seed_data import seed_database

# Ensure tables and seed data exist for test execution
Base.metadata.create_all(bind=engine)
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

client = TestClient(app)

def test_health_check():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "service" in data

def test_demo_login():
    resp = client.post("/api/auth/login", json={
        "email": "demo@agrismart.local",
        "password": "Demo@12345"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@agrismart.local"

def test_crop_recommendation():
    # Login first
    login_resp = client.post("/api/auth/login", json={
        "email": "demo@agrismart.local",
        "password": "Demo@12345"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "nitrogen": 90.0,
        "phosphorus": 42.0,
        "potassium": 43.0,
        "temperature": 25.0,
        "humidity": 80.0,
        "ph": 6.5,
        "rainfall": 200.0
    }
    resp = client.post("/api/crop/recommend", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "recommended_crop" in data
    assert data["confidence"] > 0
    assert "explanation" in data

def test_soil_analysis():
    login_resp = client.post("/api/auth/login", json={
        "email": "demo@agrismart.local",
        "password": "Demo@12345"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "nitrogen": 85.0,
        "phosphorus": 45.0,
        "potassium": 40.0,
        "ph": 6.6,
        "moisture": 50.0
    }
    resp = client.post("/api/soil/analyze", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["health_score"] > 0
    assert "parameters" in data
    assert "Nitrogen" in data["parameters"]

def test_irrigation_recommendation():
    login_resp = client.post("/api/auth/login", json={
        "email": "demo@agrismart.local",
        "password": "Demo@12345"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "soil_moisture": 25.0, # Critically dry
        "temperature": 32.0,
        "humidity": 45.0,
        "crop": "Wheat",
        "rainfall_probability": 5.0
    }
    resp = client.post("/api/irrigation/recommend", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["irrigation_required"] is True
    assert "recommended_duration" in data

def test_ai_chat():
    login_resp = client.post("/api/auth/login", json={
        "email": "demo@agrismart.local",
        "password": "Demo@12345"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    resp = client.post("/api/chat", json={
        "question": "My wheat leaves are turning yellow. What should I do?",
        "language": "en"
    }, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "answer" in data
    assert len(data["answer"]) > 20

def test_disease_prediction():
    login_resp = client.post("/api/auth/login", json={
        "email": "demo@agrismart.local",
        "password": "Demo@12345"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    sample_path = os.path.join(os.path.dirname(backend_dir), "uploads", "sample_leaves", "blight_leaf.jpg")
    with open(sample_path, "rb") as f:
        files = {"file": ("blight_leaf.jpg", f, "image/jpeg")}
        resp = client.post("/api/disease/predict", files=files, headers=headers)
        
    assert resp.status_code == 200
    data = resp.json()
    assert "disease" in data
    assert data["confidence"] > 0
    assert "chemical_remedy" in data
    assert "disclaimer" in data

def test_sensor_ingestion():
    payload = {
        "sensor_id": "ESP32-TEST-NODE",
        "farm_id": 1,
        "moisture": 45.0,
        "temperature": 26.5,
        "humidity": 65.0,
        "ph": 6.8
    }
    resp = client.post("/api/sensors/data", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "success"
