from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ChatHistory, User
from app.schemas import ChatMessageRequest, ChatMessageResponse
from app.services.chat_service import chat_service
from app.utils.security import get_current_user

router = APIRouter(prefix="/chat", tags=["AI Agriculture Assistant"])

@router.post("", response_model=ChatMessageResponse)
async def send_chat_message(
    req: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lang = req.language or current_user.preferred_language or "en"
    ai_resp = await chat_service.get_response(req.question, lang)
    
    # Save conversation turn
    record = ChatHistory(
        user_id=current_user.id,
        question=req.question,
        answer=ai_resp["answer"],
        language=lang
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    return ChatMessageResponse(
        id=record.id,
        question=record.question,
        answer=record.answer,
        language=record.language,
        created_at=record.created_at,
        disclaimer=ai_resp["disclaimer"]
    )

@router.get("/history")
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.created_at.asc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": r.id,
            "question": r.question,
            "answer": r.answer,
            "language": r.language,
            "created_at": r.created_at
        }
        for r in records
    ]

@router.delete("/clear", status_code=status.HTTP_204_NO_CONTENT)
def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).delete()
    db.commit()
    return None
