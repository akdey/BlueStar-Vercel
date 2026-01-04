from typing import List
from app.features.notifications.notification_repository import NotificationRepository
from app.features.notifications.notification_schema import NotificationCreate, NotificationResponse

class NotificationService:
    @staticmethod
    async def create_notification(noti_data: NotificationCreate) -> NotificationResponse:
        created = await NotificationRepository.create(noti_data)
        return NotificationResponse.model_validate(created)

    @staticmethod
    async def get_user_notifications(user_id: int, skip: int = 0, limit: int = 50, unread_only: bool = False) -> List[NotificationResponse]:
        notis = await NotificationRepository.get_for_user(user_id, skip, limit, unread_only)
        return [NotificationResponse.model_validate(n) for n in notis]

    @staticmethod
    async def mark_read(noti_id: int):
        await NotificationRepository.mark_as_read(noti_id)
