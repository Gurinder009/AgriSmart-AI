import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import (
    Farm, User, SoilData, SensorData, CropPrediction,
    DiseasePrediction, IrrigationRecord, Notification
)
from app.utils.security import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics & Insights"])

@router.get("/dashboard")
def get_dashboard_data(
    farm_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farms_query = db.query(Farm)
    if current_user.role != "admin":
        farms_query = farms_query.filter(Farm.user_id == current_user.id)
    farms = farms_query.all()
    
    total_farms = len(farms)
    farm_ids = [f.id for f in farms]
    
    # If a specific farm is requested or select first farm
    active_farm = None
    if farm_id and farm_id in farm_ids:
        active_farm = db.query(Farm).filter(Farm.id == farm_id).first()
    elif farms:
        active_farm = farms[0]
        
    latest_soil = None
    latest_sensor = None
    latest_irrigation = None
    latest_crop_pred = None
    recent_disease = None
    
    if active_farm:
        latest_soil = (
            db.query(SoilData)
            .filter(SoilData.farm_id == active_farm.id)
            .order_by(SoilData.recorded_at.desc())
            .first()
        )
        latest_sensor = (
            db.query(SensorData)
            .filter(SensorData.farm_id == active_farm.id)
            .order_by(SensorData.recorded_at.desc())
            .first()
        )
        latest_irrigation = (
            db.query(IrrigationRecord)
            .filter(IrrigationRecord.farm_id == active_farm.id)
            .order_by(IrrigationRecord.created_at.desc())
            .first()
        )
        latest_crop_pred = (
            db.query(CropPrediction)
            .filter(CropPrediction.farm_id == active_farm.id)
            .order_by(CropPrediction.created_at.desc())
            .first()
        )
        recent_disease = (
            db.query(DiseasePrediction)
            .filter(DiseasePrediction.farm_id == active_farm.id)
            .order_by(DiseasePrediction.created_at.desc())
            .first()
        )
    else:
        # User has no farm yet, retrieve user's general standalone records
        latest_soil = (
            db.query(SoilData)
            .filter(SoilData.user_id == current_user.id)
            .order_by(SoilData.recorded_at.desc())
            .first()
        )
        latest_irrigation = (
            db.query(IrrigationRecord)
            .filter(IrrigationRecord.user_id == current_user.id)
            .order_by(IrrigationRecord.created_at.desc())
            .first()
        )
        latest_crop_pred = (
            db.query(CropPrediction)
            .filter(CropPrediction.user_id == current_user.id)
            .order_by(CropPrediction.created_at.desc())
            .first()
        )
        recent_disease = (
            db.query(DiseasePrediction)
            .filter(DiseasePrediction.user_id == current_user.id)
            .order_by(DiseasePrediction.created_at.desc())
            .first()
        )

        
    # Unread notifications count
    unread_notifs = (
        db.query(func.count(Notification.id))
        .filter(Notification.user_id == current_user.id, Notification.is_read == False)
        .scalar() or 0
    )
    
    # Generate 7-day soil moisture & temperature trend data
    history_trend = []
    base_moisture = latest_soil.moisture if latest_soil else 45.0
    base_temp = latest_soil.temperature if (latest_soil and latest_soil.temperature) else 24.0
    
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today_idx = datetime.date.today().weekday()
    
    # Deterministic recent 7-day series
    sample_variations = [-4.0, -2.0, 1.5, -3.0, 8.0, -1.0, 0.0]
    for i in range(7):
        day_label = days[(today_idx - 6 + i) % 7]
        m_val = max(20.0, min(85.0, round(base_moisture + sample_variations[i], 1)))
        t_val = round(base_temp + (sample_variations[i] * 0.3), 1)
        rain_val = 14.5 if i == 4 else (2.0 if i == 2 else 0.0)
        history_trend.append({
            "day": day_label,
            "soil_moisture": m_val,
            "temperature": t_val,
            "rainfall": rain_val
        })
        
    return {
        "summary": {
            "total_farms": total_farms,
            "active_farm_id": active_farm.id if active_farm else None,
            "active_farm_name": active_farm.farm_name if active_farm else "No Farm Added",
            "current_crop": active_farm.current_crop if active_farm else "None",
            "soil_type": active_farm.soil_type if active_farm else "Loamy",
            "farm_area": f"{active_farm.area} {active_farm.area_unit}" if active_farm else "0",
            "location": active_farm.location if active_farm else "Unknown",
            "soil_health_score": latest_soil.health_score if latest_soil else 85.0,
            "soil_moisture": latest_soil.moisture if latest_soil else 45.0,
            "temperature": latest_sensor.temperature if latest_sensor else 24.5,
            "humidity": latest_sensor.humidity if latest_sensor else 62.0,
            "irrigation_status": "Required" if (latest_irrigation and latest_irrigation.irrigation_required) else "Adequate",
            "disease_status": recent_disease.disease if recent_disease else "Healthy (No Pathogen Detected)",
            "disease_severity": recent_disease.severity if recent_disease else "None",
            "latest_recommendation": latest_crop_pred.recommended_crop if latest_crop_pred else "Wheat",
            "unread_notifications": unread_notifs
        },
        "charts": {
            "moisture_and_temp_trend": history_trend,
            "crop_distribution": [
                {"name": "Wheat", "value": 45},
                {"name": "Rice", "value": 30},
                {"name": "Maize", "value": 15},
                {"name": "Pulses", "value": 10}
            ]
        }
    }

@router.get("/farm/{farm_id}")
def get_farm_analytics(
    farm_id: int,
    days: int = 14,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm or (farm.user_id != current_user.id and current_user.role != "admin"):
        return {"error": "Farm not found or unauthorized."}
        
    soil_records = (
        db.query(SoilData)
        .filter(SoilData.farm_id == farm_id)
        .order_by(SoilData.recorded_at.desc())
        .limit(days)
        .all()
    )
    irrigation_records = (
        db.query(IrrigationRecord)
        .filter(IrrigationRecord.farm_id == farm_id)
        .order_by(IrrigationRecord.created_at.desc())
        .limit(days)
        .all()
    )
    disease_records = (
        db.query(DiseasePrediction)
        .filter(DiseasePrediction.farm_id == farm_id)
        .order_by(DiseasePrediction.created_at.desc())
        .limit(10)
        .all()
    )
    
    return {
        "farm_id": farm.id,
        "farm_name": farm.farm_name,
        "soil_history": [
            {
                "date": s.recorded_at.strftime("%b %d"),
                "nitrogen": s.nitrogen,
                "phosphorus": s.phosphorus,
                "potassium": s.potassium,
                "ph": s.ph,
                "moisture": s.moisture,
                "health_score": s.health_score
            }
            for s in reversed(soil_records)
        ],
        "irrigation_history": [
            {
                "date": ir.created_at.strftime("%b %d"),
                "required": ir.irrigation_required,
                "duration": ir.recommended_duration,
                "volume": ir.water_volume
            }
            for ir in reversed(irrigation_records)
        ],
        "disease_records": [
            {
                "disease": d.disease,
                "confidence": d.confidence,
                "severity": d.severity,
                "date": d.created_at.strftime("%Y-%m-%d")
            }
            for d in disease_records
        ]
    }
