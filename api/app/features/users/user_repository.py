from typing import Optional, List, Sequence
from sqlalchemy import select, update, delete
from app.features.users.user_entity import User
from app.features.users.user_schema import UserCreate, UserUpdate
from app.core.logger import logger
from app.core.database import SessionLocal

class UserRepository:
    @staticmethod
    async def create(user_in: UserCreate, hashed_password: str, require_password_change: bool = True) -> User:
        async with SessionLocal() as db:
            try:
                db_user = User(
                    username=user_in.username,
                    email=user_in.email,
                    hashed_password=hashed_password,
                    full_name=user_in.full_name,
                    phone_number=user_in.phone_number,
                    role=user_in.role,
                    active=user_in.active,
                    password_change_required=require_password_change,
                    two_factor_enabled=user_in.two_factor_enabled,
                    two_factor_required=user_in.two_factor_required
                )
                db.add(db_user)
                await db.commit()
                await db.refresh(db_user)
                logger.info(f"User created: {db_user.username} (ID: {db_user.id})")
                return db_user
            except Exception as e:
                logger.error(f"Error creating user: {str(e)}")
                await db.rollback()
                raise

    @staticmethod
    async def get_by_id(user_id: int) -> Optional[User]:
        async with SessionLocal() as db:
            try:
                result = await db.execute(select(User).where(User.id == user_id))
                user = result.scalar_one_or_none()
                if not user:
                    logger.debug(f"User with ID {user_id} not found")
                return user
            except Exception as e:
                logger.error(f"Error fetching user by ID {user_id}: {str(e)}")
                raise

    @staticmethod
    async def get_by_username(username: str) -> Optional[User]:
        async with SessionLocal() as db:
            try:
                result = await db.execute(select(User).where(User.username == username))
                user = result.scalar_one_or_none()
                if not user:
                    logger.debug(f"User with username '{username}' not found")
                return user
            except Exception as e:
                logger.error(f"Error fetching user by username '{username}': {str(e)}")
                raise

    @staticmethod
    async def get_by_email(email: str) -> Optional[User]:
        async with SessionLocal() as db:
            try:
                result = await db.execute(select(User).where(User.email == email))
                user = result.scalar_one_or_none()
                if not user:
                    logger.debug(f"User with email '{email}' not found")
                return user
            except Exception as e:
                logger.error(f"Error fetching user by email '{email}': {str(e)}")
                raise

    @staticmethod
    async def get_multi(skip: int = 0, limit: int = 100) -> Sequence[User]:
        async with SessionLocal() as db:
            try:
                result = await db.execute(select(User).offset(skip).limit(limit))
                users = result.scalars().all()
                logger.debug(f"Retrieved {len(users)} users (skip={skip}, limit={limit})")
                return users
            except Exception as e:
                logger.error(f"Error fetching multiple users: {str(e)}")
                raise

    @staticmethod
    async def update(user_id: int, user_in: UserUpdate) -> Optional[User]:
        async with SessionLocal() as db:
            try:
                result = await db.execute(select(User).where(User.id == user_id))
                db_user = result.scalar_one_or_none()
                if not db_user:
                    return None
                
                user_data = user_in.model_dump(exclude_unset=True)
                for field in user_data:
                    setattr(db_user, field, user_data[field])
                
                await db.commit()
                await db.refresh(db_user)
                logger.info(f"User updated: {db_user.username} (ID: {db_user.id})")
                return db_user
            except Exception as e:
                logger.error(f"Error updating user {user_id}: {str(e)}")
                await db.rollback()
                raise

    @staticmethod
    async def delete(user_id: int) -> bool:
        async with SessionLocal() as db:
            try:
                result = await db.execute(delete(User).where(User.id == user_id))
                await db.commit()
                success = result.rowcount > 0
                if success:
                    logger.info(f"User deleted: ID {user_id}")
                else:
                    logger.warning(f"Attempted to delete non-existent user: ID {user_id}")
                return success
            except Exception as e:
                logger.error(f"Error deleting user {user_id}: {str(e)}")
                await db.rollback()
                raise

    @staticmethod
    async def update_last_login(user_id: int, ip_address: Optional[str] = None) -> None:
        async with SessionLocal() as db:
            try:
                from datetime import datetime
                await db.execute(
                    update(User)
                    .where(User.id == user_id)
                    .values(last_login=datetime.now(), last_ip=ip_address)
                )
                await db.commit()
                logger.info(f"Updated last login for user ID {user_id} from IP {ip_address}")
            except Exception as e:
                logger.error(f"Error updating last login for user {user_id}: {str(e)}")
                await db.rollback()
                raise

    @staticmethod
    async def update_password(user_id: int, new_hashed_password: str):
        """Update user password and clear password_change_required flag."""
        async with SessionLocal() as db:
            try:
                result = await db.execute(select(User).where(User.id == user_id))
                user = result.scalar_one_or_none()
                if user:
                    user.hashed_password = new_hashed_password
                    user.password_change_required = False
                    await db.commit()
                    logger.info(f"Password updated for user ID {user_id}")
            except Exception as e:
                logger.error(f"Error updating password: {str(e)}")
                await db.rollback()
                raise

    @staticmethod
    async def increment_failed_login(user_id: int) -> int:
        async with SessionLocal() as db:
            try:
                result = await db.execute(select(User).where(User.id == user_id))
                user = result.scalar_one_or_none()
                if not user:
                    return 0
                
                user.failed_login_attempts += 1
                await db.commit()
                await db.refresh(user)
                return user.failed_login_attempts
            except Exception as e:
                logger.error(f"Error incrementing failed attempts for user {user_id}: {str(e)}")
                await db.rollback()
                raise

    @staticmethod
    async def reset_failed_login(user_id: int) -> None:
        async with SessionLocal() as db:
            try:
                await db.execute(
                    update(User)
                    .where(User.id == user_id)
                    .values(failed_login_attempts=0, lockout_until=None)
                )
                await db.commit()
            except Exception as e:
                logger.error(f"Error resetting failed attempts for user {user_id}: {str(e)}")
                await db.rollback()
                raise

    @staticmethod
    async def lockout_user(user_id: int, lockout_until) -> None:
        async with SessionLocal() as db:
            try:
                await db.execute(
                    update(User)
                    .where(User.id == user_id)
                    .values(lockout_until=lockout_until)
                )
                await db.commit()
                logger.warning(f"User ID {user_id} locked out until {lockout_until}")
            except Exception as e:
                logger.error(f"Error locking out user {user_id}: {str(e)}")
                await db.rollback()
                raise
    @staticmethod
    async def get_admins_with_telegram() -> List[str]:
        """Fetch all chat IDs for admins who have a telegram_chat_id set."""
        async with SessionLocal() as db:
            from app.features.users.user_entity import UserRole
            try:
                # Assuming UserRole.ADMIN is the role to notify
                result = await db.execute(
                    select(User.telegram_chat_id)
                    .where(User.role == UserRole.ADMIN, User.telegram_chat_id.is_not(None))
                )
                chat_ids = result.scalars().all()
                return [cid for cid in chat_ids if cid] # Filter out any empty strings if they slipped in
            except Exception as e:
                logger.error(f"Error fetching admin telegram IDs: {str(e)}")
                return []
    
    @staticmethod
    async def link_telegram_user(phone_number: str, chat_id: str) -> bool:
        """Link a telegram chat_id to a user found by phone number."""
        async with SessionLocal() as db:
            try:
                # Standardize phone number? Assuming exact match for now or basic strip
                # User.phone_number usually stored as is.
                # Let's try to match partial or exact. 
                # For safety, exact match on the stored phone field.
                result = await db.execute(select(User).where(User.phone_number == phone_number))
                user = result.scalar_one_or_none()
                if not user:
                    return False
                
                user.telegram_chat_id = chat_id
                await db.commit()
                logger.info(f"Linked Telegram Chat ID {chat_id} to User {user.username}")
                return True
            except Exception as e:
                logger.error(f"Error linking telegram user: {str(e)}")
                return False
    
    @staticmethod
    async def get_by_telegram_chat_id(chat_id: str):
        """Get user by their Telegram chat ID."""
        async with SessionLocal() as db:
            try:
                result = await db.execute(select(User).where(User.telegram_chat_id == chat_id))
                return result.scalar_one_or_none()
            except Exception as e:
                logger.error(f"Error fetching user by telegram chat ID: {str(e)}")
                return None
