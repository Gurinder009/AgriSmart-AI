import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import FertilizerRecommendation, Farm, User
from app.schemas import FertilizerRequest, FertilizerResponse
from app.services.fertilizer_service import fertilizer_service
from app.utils.security import get_current_user

router = APIRouter(prefix="/fertilizer", tags=["Fertilizer Intelligence"])

@router.post("/recommend", response_model=FertilizerResponse)
def recommend_fertilizer(
    data: FertilizerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.farm_id:
        farm = db.query(Farm).filter(Farm.id == data.farm_id).first()
        if not farm or (farm.user_id != current_user.id and current_user.role != "admin"):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found or unauthorized.")
            
    recommendation = fertilizer_service.recommend(data)
    
    # Save fertilizer recommendation under current user
    record = FertilizerRecommendation(
        user_id=current_user.id,
        farm_id=data.farm_id,
        crop=data.crop,
        soil_values=json.dumps({
            "n": data.nitrogen, "p": data.phosphorus,
            "k": data.potassium, "ph": data.ph,
            "farm_area": data.farm_area, "area_unit": data.area_unit
        }),
        recommendation=json.dumps([f.model_dump() for f in recommendation.fertilizer_schedule]),
        deficiency="; ".join(recommendation.deficiencies)
    )
    db.add(record)
    db.commit()
    db.refresh(record)
        
    return recommendation

@router.get("/history")
def get_fertilizer_history(
    farm_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(FertilizerRecommendation)
    if current_user.role != "admin":
        query = query.filter(FertilizerRecommendation.user_id == current_user.id)
    if farm_id:
        query = query.filter(FertilizerRecommendation.farm_id == farm_id)
        
    records = query.order_by(FertilizerRecommendation.created_at.desc()).limit(20).all()
    results = []
    for r in records:
        try:
            soil_vals = json.loads(r.soil_values)
        except Exception:
            soil_vals = {}
        try:
            recs = json.loads(r.recommendation)
        except Exception:
            recs = []
        results.append({
            "id": r.id,
            "farm_id": r.farm_id,
            "crop": r.crop,
            "soil_values": soil_vals,
            "recommendation": recs,
            "deficiency": r.deficiency,
            "created_at": r.created_at
        })
    return results

