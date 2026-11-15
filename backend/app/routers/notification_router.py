from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Notification, User
from app.schemas import NotificationResponse, UnreadNotificationCount
from app.security import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=list[NotificationResponse])
def get_notifications(
    unread_only: bool = False,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(Notification).filter(Notification.user_id == user.id)
    if unread_only:
        query = query.filter(Notification.is_read.is_(False))
    return query.order_by(Notification.created_at.desc(), Notification.id.desc()).offset(offset).limit(limit).all()


@router.get("/unread-count", response_model=UnreadNotificationCount)
def unread_count(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return {"unread_count": db.query(Notification).filter(
        Notification.user_id == user.id, Notification.is_read.is_(False)
    ).count()}


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(notification_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    notification = db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == user.id
    ).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(notification)
    return notification
