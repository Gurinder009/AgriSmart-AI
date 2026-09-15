from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import (
    User, Farm, CropPrediction, DiseasePrediction,
    IrrigationRecord, SensorData
)
from app.schemas import AdminStatsResponse
from app.utils.security import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["Platform Administration"])

@router.get("/statistics", response_model=AdminStatsResponse)
def get_admin_statistics(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_farmers = db.query(func.count(User.id)).filter(User.role == "farmer").scalar() or 0
    total_farms = db.query(func.count(Farm.id)).scalar() or 0
    total_crop_preds = db.query(func.count(CropPrediction.id)).scalar() or 0
    total_disease_scans = db.query(func.count(DiseasePrediction.id)).scalar() or 0
    total_irrigation_evals = db.query(func.count(IrrigationRecord.id)).scalar() or 0
    active_sensors = db.query(func.count(func.distinct(SensorData.sensor_id))).scalar() or 0
    
    return AdminStatsResponse(
        total_users=total_users,
        total_farmers=total_farmers,
        total_farms=total_farms,
        total_crop_predictions=total_crop_preds,
        total_disease_scans=total_disease_scans,
        total_irrigation_evals=total_irrigation_evals,
        active_sensors=active_sensors,
        system_status="All Subsystems Operational (Healthy)"
    )

@router.get("/users")
def get_admin_users(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    results = []
    for u in users:
        farm_count = db.query(func.count(Farm.id)).filter(Farm.user_id == u.id).scalar() or 0
        results.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "preferred_language": u.preferred_language,
            "farm_count": farm_count,
            "created_at": u.created_at
        })
    return results

@router.get("/farms")
def get_admin_farms(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    farms = db.query(Farm).join(User, Farm.user_id == User.id).order_by(Farm.created_at.desc()).all()
    return [
        {
            "id": f.id,
            "farm_name": f.farm_name,
            "owner_name": f.owner.name if f.owner else "Unknown",
            "owner_email": f.owner.email if f.owner else "Unknown",
            "location": f.location,
            "area": f"{f.area} {f.area_unit}",
            "soil_type": f.soil_type,
            "current_crop": f.current_crop,
            "created_at": f.created_at
        }
        for f in farms
    ]

@router.get("/predictions")
def get_admin_predictions(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    crop_preds = db.query(CropPrediction).order_by(CropPrediction.created_at.desc()).limit(20).all()
    disease_preds = db.query(DiseasePrediction).order_by(DiseasePrediction.created_at.desc()).limit(20).all()
    
    return {
        "crop_predictions": [
            {
                "id": cp.id,
                "farm_id": cp.farm_id,
                "recommended_crop": cp.recommended_crop,
                "confidence": cp.confidence,
                "rainfall": cp.rainfall,
                "created_at": cp.created_at
            }
            for cp in crop_preds
        ],
        "disease_predictions": [
            {
                "id": dp.id,
                "farm_id": dp.farm_id,
                "crop": dp.crop,
                "disease": dp.disease,
                "confidence": dp.confidence,
                "severity": dp.severity,
                "created_at": dp.created_at
            }
            for dp in disease_preds
        ]
    }
