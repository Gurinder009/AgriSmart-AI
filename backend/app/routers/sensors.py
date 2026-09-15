import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SensorData, Farm, Notification, User
from app.schemas import SensorIngestRequest, SensorIngestResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/sensors", tags=["IoT Sensors"])

@router.post("/data", response_model=SensorIngestResponse, status_code=status.HTTP_201_CREATED)
def ingest_sensor_data(
    payload: SensorIngestRequest,
    db: Session = Depends(get_db)
):
    # Verify farm exists
    farm = db.query(Farm).filter(Farm.id == payload.farm_id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farm ID {payload.farm_id} does not exist."
        )
        
    record_time = payload.timestamp or datetime.datetime.utcnow()
    
    sensor_record = SensorData(
        farm_id=payload.farm_id,
        sensor_id=payload.sensor_id,
        moisture=payload.moisture,
        temperature=payload.temperature,
        humidity=payload.humidity,
        ph=payload.ph,
        recorded_at=record_time
    )
    db.add(sensor_record)
    
    # Automated threshold alert checking for smart farm notifications
    if payload.moisture < 28.0:
        alert = Notification(
            user_id=farm.user_id,
            title="Critical Soil Moisture Alert",
            message=f"Sensor {payload.sensor_id} on farm '{farm.farm_name}' detected moisture at {payload.moisture}%. Immediate irrigation is recommended.",
            category="irrigation",
            severity="alert",
            is_read=False
        )
        db.add(alert)
    elif payload.temperature > 38.0:
        alert = Notification(
            user_id=farm.user_id,
            title="Extreme Heat Warning",
            message=f"High temperature ({payload.temperature}°C) recorded at '{farm.farm_name}'. Monitor crops for heat stress.",
            category="weather",
            severity="warning",
            is_read=False
        )
        db.add(alert)
        
    db.commit()
    db.refresh(sensor_record)
    
    return SensorIngestResponse(
        status="success",
        message="Telemetry packet processed and logged.",
        sensor_id=payload.sensor_id,
        farm_id=payload.farm_id,
        recorded_at=sensor_record.recorded_at
    )

@router.get("/latest/{farm_id}")
def get_latest_sensor_data(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm or (farm.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found or unauthorized.")
        
    records = (
        db.query(SensorData)
        .filter(SensorData.farm_id == farm_id)
        .order_by(SensorData.recorded_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": r.id,
            "sensor_id": r.sensor_id,
            "farm_id": r.farm_id,
            "moisture": r.moisture,
            "temperature": r.temperature,
            "humidity": r.humidity,
            "ph": r.ph,
            "recorded_at": r.recorded_at
        }
        for r in records
    ]

@router.get("/user-feed")
def get_user_sensor_feed(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    farm_ids = [f.id for f in farms]
    if not farm_ids:
        return []
        
    records = (
        db.query(SensorData)
        .filter(SensorData.farm_id.in_(farm_ids))
        .order_by(SensorData.recorded_at.desc())
        .limit(30)
        .all()
    )
    return [
        {
            "id": r.id,
            "sensor_id": r.sensor_id,
            "farm_id": r.farm_id,
            "moisture": r.moisture,
            "temperature": r.temperature,
            "humidity": r.humidity,
            "ph": r.ph,
            "recorded_at": r.recorded_at
        }
        for r in records
    ]

