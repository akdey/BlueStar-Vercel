from sqlalchemy import select, update
from app.core.database import SessionLocal
from app.features.notifications.notification_entity import Notification
from app.features.notifications.notification_schema import NotificationCreate
from typing import List, Optional

class NotificationRepository:
    @staticmethod
    async def create(noti_in: NotificationCreate) -> Notification:
        async with SessionLocal() as db:
            db_obj = Notification(
                user_id=noti_in.user_id,
                title=noti_in.title,
                message=noti_in.message,
                type=noti_in.type,
                link=noti_in.link
            )
            db.add(db_obj)
            await db.commit()
            await db.refresh(db_obj)
            return db_obj

    @staticmethod
    async def get_for_user(user_id: int, skip: int = 0, limit: int = 50, unread_only: bool = False) -> List[Notification]:
        async with SessionLocal() as db:
            query = select(Notification).where(
                (Notification.user_id == user_id) | (Notification.user_id == None)
            )
            if unread_only:
                query = query.where(Notification.is_read == False)
            
            query = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
            result = await db.execute(query)
            return result.scalars().all()

    @staticmethod
    async def mark_as_read(noti_id: int):
        async with SessionLocal() as db:
            await db.execute(
                update(Notification)
                .where(Notification.id == noti_id)
                .values(is_read=True)
            )
            await db.commit()
