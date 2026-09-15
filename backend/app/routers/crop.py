import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CropPrediction, Farm, User
from app.schemas import CropRecommendRequest, CropRecommendResponse
from app.ml.crop_recommender import crop_recommender
from app.utils.security import get_current_user

router = APIRouter(prefix="/crop", tags=["Crop Recommendation AI"])

@router.post("/recommend", response_model=CropRecommendResponse)
def recommend_crop(
    req: CropRecommendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify farm ownership if farm_id is provided
    if req.farm_id:
        farm = db.query(Farm).filter(Farm.id == req.farm_id).first()
        if not farm or (farm.user_id != current_user.id and current_user.role != "admin"):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found or unauthorized.")
            
    prediction_result = crop_recommender.predict(
        n=req.nitrogen,
        p=req.phosphorus,
        k=req.potassium,
        temp=req.temperature,
        humidity=req.humidity,
        ph=req.ph,
        rainfall=req.rainfall
    )
    
    # Save record to database
    record = CropPrediction(
        user_id=current_user.id,
        farm_id=req.farm_id,
        nitrogen=req.nitrogen,
        phosphorus=req.phosphorus,
        potassium=req.potassium,
        ph=req.ph,
        temperature=req.temperature,
        humidity=req.humidity,
        rainfall=req.rainfall,
        recommended_crop=prediction_result["recommended_crop"],
        confidence=prediction_result["confidence"],
        alternative_crops=json.dumps(prediction_result["alternatives"]),
        explanation=prediction_result["explanation"]
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    return CropRecommendResponse(
        id=record.id,
        recommended_crop=prediction_result["recommended_crop"],
        confidence=prediction_result["confidence"],
        alternatives=prediction_result["alternatives"],
        crop_info=prediction_result["crop_info"],
        explanation=prediction_result["explanation"],
        recorded_at=record.created_at
    )

@router.get("/history")
def get_crop_history(
    farm_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(CropPrediction)
    if current_user.role != "admin":
        query = query.filter(CropPrediction.user_id == current_user.id)
    if farm_id:
        query = query.filter(CropPrediction.farm_id == farm_id)

        
    records = query.order_by(CropPrediction.created_at.desc()).limit(20).all()
    results = []
    for r in records:
        alternatives = []
        if r.alternative_crops:
            try:
                alternatives = json.loads(r.alternative_crops)
            except Exception:
                alternatives = []
        results.append({
            "id": r.id,
            "farm_id": r.farm_id,
            "recommended_crop": r.recommended_crop,
            "confidence": r.confidence,
            "nitrogen": r.nitrogen,
            "phosphorus": r.phosphorus,
            "potassium": r.potassium,
            "ph": r.ph,
            "temperature": r.temperature,
            "humidity": r.humidity,
            "rainfall": r.rainfall,
            "explanation": r.explanation,
            "alternatives": alternatives,
            "created_at": r.created_at
        })
    return results
