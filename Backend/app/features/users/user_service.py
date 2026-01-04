from fastapi import HTTPException, status
from app.features.users.user_repository import UserRepository
from app.features.users.user_schema import UserResponse, UserUpdate
from app.features.users.user_helper import AuthHelper
from typing import List
from app.core.logger import logger

class UserService:
    @staticmethod
    async def get_all_users(skip: int = 0, limit: int = 100) -> List[UserResponse]:
        users = await UserRepository.get_multi(skip=skip, limit=limit)
        return [UserResponse.model_validate(user) for user in users]

    @staticmethod
    async def get_user_by_id(user_id: int) -> UserResponse:
        user = await UserRepository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserResponse.model_validate(user)
    
    @staticmethod
    async def activate_user(user_id: int) -> UserResponse:
        user = await UserRepository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        updated_user = await UserRepository.update(user_id, UserUpdate(active=True))
        return UserResponse.model_validate(updated_user)
    
    @staticmethod
    async def deactivate_user(user_id: int) -> UserResponse:
        user = await UserRepository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        updated_user = await UserRepository.update(user_id, UserUpdate(active=False))
        return UserResponse.model_validate(updated_user)

    @staticmethod
    async def change_password(username: str, old_password: str, new_password: str) -> dict:
        """Change user password and clear password_change_required flag."""
        user = await UserRepository.get_by_username(username)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify old password
        if not AuthHelper.verify_password(old_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        new_hashed_password = AuthHelper.hash_password(new_password)
        
        # Update password and clear password_change_required flag
        await UserRepository.update_password(user.id, new_hashed_password)
        
        logger.info(f"Password changed successfully for user: {username}")
        
        return {
            "username": user.username,
            "password_changed": True
        }
