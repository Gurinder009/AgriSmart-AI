import os
import sys
import pytest
from fastapi.testclient import TestClient

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.database import SessionLocal, Base, engine

Base.metadata.create_all(bind=engine)
client = TestClient(app)

import uuid

def test_registration_validation_and_flow():
    uid = uuid.uuid4().hex[:8]
    # 1. Password mismatch
    mismatch_payload = {
        "full_name": "Test User",
        "email": f"mismatch_{uid}@example.com",
        "password": "Password@123",
        "confirm_password": "Password@456"
    }
    r = client.post("/api/auth/register", json=mismatch_payload)
    assert r.status_code == 400
    assert "match" in r.json()["detail"].lower()

    # 2. Invalid email format
    invalid_email_payload = {
        "full_name": "Test User",
        "email": "not-an-email",
        "password": "Password@123",
        "confirm_password": "Password@123"
    }
    r = client.post("/api/auth/register", json=invalid_email_payload)
    assert r.status_code == 422

    # 3. Successful registration
    test_email = f"farmer_alpha_{uid}@example.com"
    valid_payload = {
        "full_name": "Farmer Alpha",
        "email": test_email,
        "password": "SecurePassword@123",
        "confirm_password": "SecurePassword@123"
    }
    r = client.post("/api/auth/register", json=valid_payload)
    assert r.status_code == 201
    resp_data = r.json()
    assert resp_data["user"]["email"] == test_email
    assert "success" in resp_data["message"].lower()

    # 4. Duplicate registration rejected
    r_dup = client.post("/api/auth/register", json=valid_payload)
    assert r_dup.status_code == 400
    assert "already exists" in r_dup.json()["detail"].lower()


def test_user_isolation_and_privacy():
    uid = uuid.uuid4().hex[:8]
    alpha_email = f"farmer_alpha_{uid}@example.com"
    beta_email = f"farmer_beta_{uid}@example.com"

    # Register Farmer Alpha
    client.post("/api/auth/register", json={
        "full_name": "Farmer Alpha",
        "email": alpha_email,
        "password": "SecurePassword@123",
        "confirm_password": "SecurePassword@123"
    })

    # Register Farmer Beta
    client.post("/api/auth/register", json={
        "full_name": "Farmer Beta",
        "email": beta_email,
        "password": "SecurePassword@123",
        "confirm_password": "SecurePassword@123"
    })

    # Log in Alpha
    alpha_login = client.post("/api/auth/login", json={
        "email": alpha_email,
        "password": "SecurePassword@123"
    })
    assert alpha_login.status_code == 200
    alpha_token = alpha_login.json()["access_token"]
    alpha_headers = {"Authorization": f"Bearer {alpha_token}"}

    # Log in Beta
    beta_login = client.post("/api/auth/login", json={
        "email": beta_email,
        "password": "SecurePassword@123"
    })
    assert beta_login.status_code == 200
    beta_token = beta_login.json()["access_token"]
    beta_headers = {"Authorization": f"Bearer {beta_token}"}

    # Verify /auth/me
    me_resp = client.get("/api/auth/me", headers=alpha_headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == alpha_email

    # Farmer Alpha creates a crop recommendation
    crop_resp = client.post("/api/crop/recommend", json={
        "nitrogen": 80.0,
        "phosphorus": 40.0,
        "potassium": 40.0,
        "temperature": 25.0,
        "humidity": 75.0,
        "ph": 6.5,
        "rainfall": 150.0
    }, headers=alpha_headers)
    assert crop_resp.status_code == 200

    # Farmer Alpha creates a soil analysis
    soil_resp = client.post("/api/soil/analyze", json={
        "nitrogen": 75.0,
        "phosphorus": 35.0,
        "potassium": 45.0,
        "ph": 6.8,
        "moisture": 45.0
    }, headers=alpha_headers)
    assert soil_resp.status_code == 200

    # Farmer Alpha creates a fertilizer recommendation
    fert_resp = client.post("/api/fertilizer/recommend", json={
        "crop": "Wheat",
        "soil_type": "Loamy",
        "nitrogen": 40.0,
        "phosphorus": 20.0,
        "potassium": 20.0,
        "ph": 6.5,
        "farm_area": 2.0
    }, headers=alpha_headers)
    assert fert_resp.status_code == 200

    # Farmer Alpha checks their history
    alpha_crops = client.get("/api/crop/history", headers=alpha_headers).json()
    alpha_soils = client.get("/api/soil/history", headers=alpha_headers).json()
    alpha_ferts = client.get("/api/fertilizer/history", headers=alpha_headers).json()
    assert len(alpha_crops) >= 1
    assert len(alpha_soils) >= 1
    assert len(alpha_ferts) >= 1

    # STRICT ISOLATION CHECK: Farmer Beta checks history - MUST BE EMPTY!
    beta_crops = client.get("/api/crop/history", headers=beta_headers).json()
    beta_soils = client.get("/api/soil/history", headers=beta_headers).json()
    beta_ferts = client.get("/api/fertilizer/history", headers=beta_headers).json()
    assert len(beta_crops) == 0, f"Privacy violation! Beta saw Alpha's crops: {beta_crops}"
    assert len(beta_soils) == 0, f"Privacy violation! Beta saw Alpha's soils: {beta_soils}"
    assert len(beta_ferts) == 0, f"Privacy violation! Beta saw Alpha's fertilizers: {beta_ferts}"


def test_admin_authorization_restrictions():
    # Login as normal user (Demo Farmer)
    farmer_login = client.post("/api/auth/login", json={
        "email": "demo@agrismart.local",
        "password": "Demo@12345"
    })
    assert farmer_login.status_code == 200
    farmer_token = farmer_login.json()["access_token"]
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}

    # Normal user should be rejected from admin endpoints
    r = client.get("/api/admin/statistics", headers=farmer_headers)
    assert r.status_code == 403

    # Admin login
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@agrismart.local",
        "password": "Admin@12345"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin accesses stats
    r_admin = client.get("/api/admin/statistics", headers=admin_headers)
    assert r_admin.status_code == 200
    data = r_admin.json()
    assert "total_users" in data
    assert "total_farms" in data
