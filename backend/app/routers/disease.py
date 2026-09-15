import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models import DiseasePrediction, Farm, User
from app.schemas import DiseasePredictResponse
from app.ml.disease_classifier import disease_classifier
from app.utils.security import get_current_user

router = APIRouter(prefix="/disease", tags=["Crop Disease Detection"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024 # 10 MB

@router.post("/predict", response_model=DiseasePredictResponse)
async def predict_disease(
    file: UploadFile = File(...),
    farm_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{file.content_type}'. Please upload a JPEG, PNG, or WebP image."
        )
        
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{ext}'. Only .jpg, .jpeg, .png, and .webp are accepted."
        )
        
    # Read and check size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 10 MB limit. Please upload a compressed leaf photograph."
        )
        
    # Save file safely
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.DISEASE_UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(contents)
        
    # Run CV analysis
    try:
        analysis = disease_classifier.analyze_image(contents, filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Image processing failed: {str(e)}"
        )
        
    relative_url = f"/uploads/disease/{filename}"
    
    # Check farm association
    if farm_id:
        farm = db.query(Farm).filter(Farm.id == farm_id).first()
        if not farm or (farm.user_id != current_user.id and current_user.role != "admin"):
            farm_id = None
            
    record = DiseasePrediction(
        user_id=current_user.id,
        farm_id=farm_id,
        crop=analysis["crop"],
        image_path=relative_url,
        disease=analysis["disease"],
        confidence=analysis["confidence"],
        severity=analysis["severity"],
        recommendations=analysis["chemical_remedy"]
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    return DiseasePredictResponse(
        id=record.id,
        crop=analysis["crop"],
        disease=analysis["disease"],
        confidence=analysis["confidence"],
        severity=analysis["severity"],
        is_healthy=analysis["is_healthy"],
        symptoms=analysis["symptoms"],
        causes=analysis["causes"],
        organic_remedy=analysis["organic_remedy"],
        chemical_remedy=analysis["chemical_remedy"],
        preventive_tips=analysis["preventive_tips"],
        disclaimer=analysis["disclaimer"],
        image_url=relative_url,
        metrics=analysis["metrics"],
        created_at=record.created_at
    )

@router.get("/history")
def get_disease_history(
    farm_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(DiseasePrediction)
    if current_user.role != "admin":
        query = query.filter(DiseasePrediction.user_id == current_user.id)
    if farm_id:
        query = query.filter(DiseasePrediction.farm_id == farm_id)

        
    records = query.order_by(DiseasePrediction.created_at.desc()).limit(25).all()
    return [
        {
            "id": r.id,
            "farm_id": r.farm_id,
            "crop": r.crop,
            "disease": r.disease,
            "confidence": r.confidence,
            "severity": r.severity,
            "image_url": r.image_path,
            "recommendations": r.recommendations,
            "created_at": r.created_at
        }
        for r in records
    ]
