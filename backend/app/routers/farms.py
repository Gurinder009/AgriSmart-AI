from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Farm, User, SoilData, SensorData
from app.schemas import FarmCreate, FarmUpdate, FarmResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/farms", tags=["Farm Management"])

@router.get("", response_model=List[FarmResponse])
def get_farms(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "admin":
        return db.query(Farm).all()
    return db.query(Farm).filter(Farm.user_id == current_user.id).all()

@router.post("", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
def create_farm(
    farm_in: FarmCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = Farm(
        user_id=current_user.id,
        farm_name=farm_in.farm_name,
        location=farm_in.location,
        latitude=farm_in.latitude,
        longitude=farm_in.longitude,
        area=farm_in.area,
        area_unit=farm_in.area_unit,
        soil_type=farm_in.soil_type,
        current_crop=farm_in.current_crop
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm

@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Farm).filter(Farm.id == farm_id)
    if current_user.role != "admin":
        query = query.filter(Farm.user_id == current_user.id)
    farm = query.first()
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found.")
    return farm

@router.put("/{farm_id}", response_model=FarmResponse)
def update_farm(
    farm_id: int,
    farm_in: FarmUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Farm).filter(Farm.id == farm_id)
    if current_user.role != "admin":
        query = query.filter(Farm.user_id == current_user.id)
    farm = query.first()
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found.")
        
    for field, value in farm_in.model_dump(exclude_unset=True).items():
        setattr(farm, field, value)
        
    db.commit()
    db.refresh(farm)
    return farm

@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farm(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Farm).filter(Farm.id == farm_id)
    if current_user.role != "admin":
        query = query.filter(Farm.user_id == current_user.id)
    farm = query.first()
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found.")
        
    db.delete(farm)
    db.commit()
    return None

@router.get("/{farm_id}/telemetry")
def get_farm_telemetry(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Farm).filter(Farm.id == farm_id)
    if current_user.role != "admin":
        query = query.filter(Farm.user_id == current_user.id)
    farm = query.first()
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found.")
        
    latest_soil = (
        db.query(SoilData)
        .filter(SoilData.farm_id == farm_id)
        .order_by(SoilData.recorded_at.desc())
        .first()
    )
    latest_sensor = (
        db.query(SensorData)
        .filter(SensorData.farm_id == farm_id)
        .order_by(SensorData.recorded_at.desc())
        .first()
    )
    
    return {
        "farm_id": farm.id,
        "farm_name": farm.farm_name,
        "location": farm.location,
        "current_crop": farm.current_crop,
        "soil_type": farm.soil_type,
        "latest_soil": {
            "nitrogen": latest_soil.nitrogen if latest_soil else 85.0,
            "phosphorus": latest_soil.phosphorus if latest_soil else 45.0,
            "potassium": latest_soil.potassium if latest_soil else 40.0,
            "ph": latest_soil.ph if latest_soil else 6.5,
            "moisture": latest_soil.moisture if latest_soil else 45.0,
            "health_score": latest_soil.health_score if latest_soil else 85.0,
            "recorded_at": latest_soil.recorded_at if latest_soil else None
        },
        "latest_sensor": {
            "sensor_id": latest_sensor.sensor_id if latest_sensor else "ESP32-NODE-01",
            "moisture": latest_sensor.moisture if latest_sensor else 45.0,
            "temperature": latest_sensor.temperature if latest_sensor else 24.5,
            "humidity": latest_sensor.humidity if latest_sensor else 65.0,
            "recorded_at": latest_sensor.recorded_at if latest_sensor else None
        }
    }
