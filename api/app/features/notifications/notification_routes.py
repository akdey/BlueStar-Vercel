from fastapi import APIRouter, Depends, status
from typing import List
from app.features.users.user_entity import User
from app.features.notifications.notification_service import NotificationService
from app.features.notifications.notification_schema import NotificationResponse, NotificationCreate
from app.features.auth.auth_dependencies import get_current_active_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationResponse])
async def get_my_notifications(
    skip: int = 0, 
    limit: int = 50, 
    unread_only: bool = False,
    current_user: User = Depends(get_current_active_user)
):
    return await NotificationService.get_user_notifications(current_user.id, skip, limit, unread_only)

@router.post("/{noti_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_notification_read(
        noti_id: int,
        current_user: User = Depends(get_current_active_user)
):
    # TODO: Verify ownership if needed, but for now simple
    await NotificationService.mark_read(noti_id)
