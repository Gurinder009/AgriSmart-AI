from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SoilData, Farm, User
from app.schemas import SoilAnalysisRequest, SoilAnalysisResponse
from app.services.soil_service import soil_service
from app.utils.security import get_current_user

router = APIRouter(prefix="/soil", tags=["Soil Analysis"])

@router.post("/analyze", response_model=SoilAnalysisResponse)
def analyze_soil(
    data: SoilAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.farm_id:
        farm = db.query(Farm).filter(Farm.id == data.farm_id).first()
        if not farm or (farm.user_id != current_user.id and current_user.role != "admin"):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found or unauthorized.")
            
    analysis = soil_service.analyze(data)
    
    # Save soil analysis record under current user
    record = SoilData(
        user_id=current_user.id,
        farm_id=data.farm_id,
        nitrogen=data.nitrogen,
        phosphorus=data.phosphorus,
        potassium=data.potassium,
        ph=data.ph,
        moisture=data.moisture,
        temperature=data.temperature,
        health_score=analysis.health_score
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    analysis.id = record.id
        
    return analysis

@router.get("/history")
def get_soil_history(
    farm_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(SoilData)
    if current_user.role != "admin":
        query = query.filter(SoilData.user_id == current_user.id)
    if farm_id:
        query = query.filter(SoilData.farm_id == farm_id)

        
    records = query.order_by(SoilData.recorded_at.desc()).limit(30).all()
    return [
        {
            "id": r.id,
            "farm_id": r.farm_id,
            "nitrogen": r.nitrogen,
            "phosphorus": r.phosphorus,
            "potassium": r.potassium,
            "ph": r.ph,
            "moisture": r.moisture,
            "temperature": r.temperature,
            "health_score": r.health_score,
            "recorded_at": r.recorded_at
        }
        for r in records
    ]
