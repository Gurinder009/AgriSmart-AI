from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import IrrigationRecord, Farm, User
from app.schemas import IrrigationRequest, IrrigationResponse
from app.services.irrigation_service import irrigation_service
from app.services.weather_service import weather_service
from app.utils.security import get_current_user

router = APIRouter(prefix="/irrigation", tags=["Smart Irrigation"])

@router.post("/recommend", response_model=IrrigationResponse)
async def recommend_irrigation(
    data: IrrigationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    weather_source = None
    weather_summary = None

    if data.farm_id:
        farm = db.query(Farm).filter(Farm.id == data.farm_id).first()
        if not farm or (farm.user_id != current_user.id and current_user.role != "admin"):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found or unauthorized.")
            
        if data.auto_weather_sync:
            w_res = await weather_service.get_weather(
                location=farm.location,
                lat=farm.latitude,
                lon=farm.longitude
            )
            data.temperature = w_res.current.temperature
            data.humidity = w_res.current.humidity
            data.rainfall_probability = w_res.current.rain_probability
            data.recent_rainfall = w_res.current.rainfall
            weather_source = w_res.data_source
            weather_summary = {
                "location": w_res.current.location,
                "temperature": w_res.current.temperature,
                "humidity": w_res.current.humidity,
                "rainfall_probability": w_res.current.rain_probability,
                "rainfall": w_res.current.rainfall,
                "condition": w_res.current.condition,
                "clouds": w_res.current.clouds,
                "data_source": w_res.data_source
            }

    recommendation = irrigation_service.recommend(
        data,
        weather_source=weather_source,
        weather_summary=weather_summary
    )
    
    # Save irrigation record under current user
    record = IrrigationRecord(
        user_id=current_user.id,
        farm_id=data.farm_id,
        soil_moisture=data.soil_moisture,
        temperature=data.temperature,
        humidity=data.humidity,
        rainfall_probability=data.rainfall_probability,
        crop=data.crop,
        irrigation_required=recommendation.irrigation_required,
        recommended_duration=recommendation.recommended_duration,
        water_volume=recommendation.water_volume,
        reason=recommendation.reason
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    recommendation.id = record.id
        
    return recommendation

@router.get("/history")
def get_irrigation_history(
    farm_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(IrrigationRecord)
    if current_user.role != "admin":
        query = query.filter(IrrigationRecord.user_id == current_user.id)
    if farm_id:
        query = query.filter(IrrigationRecord.farm_id == farm_id)

        
    records = query.order_by(IrrigationRecord.created_at.desc()).limit(20).all()
    return [
        {
            "id": r.id,
            "farm_id": r.farm_id,
            "crop": r.crop,
            "soil_moisture": r.soil_moisture,
            "temperature": r.temperature,
            "humidity": r.humidity,
            "rainfall_probability": r.rainfall_probability,
            "irrigation_required": r.irrigation_required,
            "recommended_duration": r.recommended_duration,
            "water_volume": r.water_volume,
            "reason": r.reason,
            "created_at": r.created_at
        }
        for r in records
    ]
