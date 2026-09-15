from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Farm, User
from app.schemas import WeatherResponse
from app.services.weather_service import weather_service
from app.utils.security import get_current_user

router = APIRouter(prefix="/weather", tags=["Weather Integration"])

@router.get("/current", response_model=WeatherResponse)
async def get_current_weather(
    farm_id: Optional[int] = Query(None, description="Optional Farm ID to use farm coordinates"),
    location: Optional[str] = Query(None, description="Optional city or region name"),
    lat: Optional[float] = Query(None, description="Optional latitude coordinate"),
    lon: Optional[float] = Query(None, description="Optional longitude coordinate"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_lat = lat
    target_lon = lon
    target_location = location or "Ludhiana, Punjab"
    
    if farm_id:
        farm = db.query(Farm).filter(Farm.id == farm_id).first()
        if farm:
            if farm.location:
                target_location = farm.location
            if target_lat is None and target_lon is None:
                target_lat = farm.latitude
                target_lon = farm.longitude
            
    return await weather_service.get_weather(
        location=target_location,
        lat=target_lat,
        lon=target_lon
    )

@router.get("/forecast", response_model=WeatherResponse)
async def get_forecast(
    farm_id: Optional[int] = Query(None, description="Optional Farm ID to use farm coordinates"),
    location: Optional[str] = Query(None, description="Optional city or region name"),
    lat: Optional[float] = Query(None, description="Optional latitude coordinate"),
    lon: Optional[float] = Query(None, description="Optional longitude coordinate"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await get_current_weather(
        farm_id=farm_id,
        location=location,
        lat=lat,
        lon=lon,
        current_user=current_user,
        db=db
    )
