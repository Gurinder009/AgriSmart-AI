import datetime
import json
from sqlalchemy.orm import Session
from app.models import (
    User, Farm, SoilData, CropPrediction, DiseasePrediction,
    IrrigationRecord, FertilizerRecommendation, WeatherRecord,
    Notification, SensorData
)
from app.utils.security import get_password_hash

def seed_database(db: Session):
    # Check if demo farmer already exists
    existing_demo = db.query(User).filter(User.email == "demo@agrismart.local").first()
    if existing_demo:
        return
        
    print("[Seed] Initializing AgriSmart AI database with demo accounts & sample telemetry...")
    
    # 1. Create Users
    farmer = User(
        name="Gurinderpal Singh",
        email="demo@agrismart.local",
        phone="+91 98765 43210",
        password_hash=get_password_hash("Demo@12345"),
        role="farmer",
        preferred_language="en",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=30)
    )
    db.add(farmer)
    
    admin = User(
        name="AgriSmart System Administrator",
        email="admin@agrismart.local",
        phone="+91 98765 00000",
        password_hash=get_password_hash("Admin@12345"),
        role="admin",
        preferred_language="en",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=60)
    )
    db.add(admin)
    db.commit()
    db.refresh(farmer)
    
    # 2. Create Farms
    farm1 = Farm(
        user_id=farmer.id,
        farm_name="Green Valley Organic Farm",
        location="Ludhiana, Punjab, India",
        latitude=30.9010,
        longitude=75.8573,
        area=5.5,
        area_unit="acres",
        soil_type="Loamy",
        current_crop="Wheat",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=25)
    )
    farm2 = Farm(
        user_id=farmer.id,
        farm_name="Punjab Golden Fields",
        location="Jalandhar, Punjab, India",
        latitude=31.3260,
        longitude=75.5762,
        area=12.0,
        area_unit="acres",
        soil_type="Alluvial",
        current_crop="Rice",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=20)
    )
    db.add_all([farm1, farm2])
    db.commit()
    db.refresh(farm1)
    db.refresh(farm2)
    
    # 3. Create Soil Data Records
    soil1 = SoilData(
        user_id=farmer.id,
        farm_id=farm1.id,
        nitrogen=92.0,
        phosphorus=44.0,
        potassium=46.0,
        ph=6.7,
        moisture=42.5,
        temperature=22.4,
        humidity=62.0,
        health_score=88.5,
        recorded_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
    )
    soil2 = SoilData(
        user_id=farmer.id,
        farm_id=farm2.id,
        nitrogen=78.0,
        phosphorus=52.0,
        potassium=38.0,
        ph=6.4,
        moisture=68.0,
        temperature=26.0,
        humidity=79.0,
        health_score=92.0,
        recorded_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )
    db.add_all([soil1, soil2])
    
    # 4. Create Crop Predictions
    cp1 = CropPrediction(
        user_id=farmer.id,
        farm_id=farm1.id,
        nitrogen=95.0,
        phosphorus=45.0,
        potassium=42.0,
        ph=6.5,
        temperature=21.5,
        humidity=58.0,
        rainfall=75.0,
        recommended_crop="wheat",
        confidence=94.2,
        alternative_crops=json.dumps([{"crop": "chickpea", "confidence": 3.8}, {"crop": "lentil", "confidence": 1.5}]),
        explanation="Given your soil profile and cool climate, Wheat exhibits optimal agronomic compatibility.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=10)
    )
    cp2 = CropPrediction(
        user_id=farmer.id,
        farm_id=farm2.id,
        nitrogen=80.0,
        phosphorus=48.0,
        potassium=40.0,
        ph=6.4,
        temperature=25.0,
        humidity=82.0,
        rainfall=230.0,
        recommended_crop="rice",
        confidence=96.1,
        alternative_crops=json.dumps([{"crop": "jute", "confidence": 2.5}, {"crop": "banana", "confidence": 1.1}]),
        explanation="High seasonal rainfall and loamy alluvial soil provide ideal conditions for Rice cultivation.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=8)
    )
    db.add_all([cp1, cp2])
    
    # 5. Create Disease Predictions
    dp1 = DiseasePrediction(
        user_id=farmer.id,
        farm_id=farm1.id,
        crop="Wheat",
        image_path="/uploads/sample_leaves/rust_leaf.jpg",
        disease="Brown Leaf Rust (Puccinia triticina)",
        confidence=92.4,
        severity="Moderate",
        recommendations="Foliar spray of Propiconazole 25% EC @ 1ml/L at first appearance. Avoid excessive nitrogen.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=4)
    )
    dp2 = DiseasePrediction(
        user_id=farmer.id,
        farm_id=farm2.id,
        crop="Tomato",
        image_path="/uploads/sample_leaves/blight_leaf.jpg",
        disease="Early Blight (Alternaria solani)",
        confidence=94.0,
        severity="Moderate",
        recommendations="Spray Mancozeb 75% WP @ 2.5g/L. Prune lower foliage to enhance canopy ventilation.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
    )
    db.add_all([dp1, dp2])
    
    # 6. Create Irrigation Records
    ir1 = IrrigationRecord(
        user_id=farmer.id,
        farm_id=farm1.id,
        soil_moisture=38.0,
        temperature=23.5,
        humidity=55.0,
        rainfall_probability=10.0,
        crop="Wheat",
        irrigation_required=True,
        recommended_duration="45 minutes",
        water_volume="3200 Liters",
        reason="Soil moisture dropped below 40%. Rain probability is minimal.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
    )
    db.add(ir1)
    
    # 7. Create Fertilizer Recommendations
    fr1 = FertilizerRecommendation(
        user_id=farmer.id,
        farm_id=farm1.id,
        crop="Wheat",
        soil_values=json.dumps({"n": 92, "p": 44, "k": 46, "ph": 6.7}),
        recommendation="Apply 35kg Urea in 2 split doses, 20kg DAP basal, and 15kg MOP.",
        deficiency="Slight Nitrogen deficit for high-yield dwarf wheat.",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=12)
    )
    db.add(fr1)

    
    # 8. Create Notifications
    notifs = [
        Notification(
            user_id=farmer.id,
            title="Optimal Irrigation Window Today",
            message="Soil moisture in Green Valley Farm is at 42%. Morning irrigation (06:00 AM) recommended.",
            category="irrigation",
            severity="info",
            is_read=False,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=5)
        ),
        Notification(
            user_id=farmer.id,
            title="Weather Advisory: Dry Spell Ahead",
            message="Clear skies and low humidity forecast for the next 4 days. Suitable for intercultural weeding.",
            category="weather",
            severity="info",
            is_read=False,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=14)
        ),
        Notification(
            user_id=farmer.id,
            title="Disease Alert: Brown Rust Spotted",
            message="Scan #W-104 detected early rust pustules. Review chemical and organic management guidance.",
            category="disease",
            severity="warning",
            is_read=True,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=4)
        ),
        Notification(
            user_id=farmer.id,
            title="Soil Health Card Updated",
            message="Overall soil fertility index is 88.5/100 (Good Agricultural Condition).",
            category="soil",
            severity="success",
            is_read=True,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=7)
        )
    ]
    db.add_all(notifs)
    
    # 9. Create Simulated Sensor Data
    sensors = [
        SensorData(
            farm_id=farm1.id,
            sensor_id="ESP32-NODE-01",
            moisture=42.5,
            temperature=22.8,
            humidity=61.5,
            ph=6.7,
            recorded_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=15)
        ),
        SensorData(
            farm_id=farm2.id,
            sensor_id="ESP32-NODE-02",
            moisture=67.8,
            temperature=25.6,
            humidity=78.2,
            ph=6.4,
            recorded_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=10)
        )
    ]
    db.add_all(sensors)
    
    db.commit()
    print("[Seed] Seed data successfully populated!")
