from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from typing import List
from app.features.users.user_schema import UserResponse, UserCreate, ChangePasswordRequest
from app.features.users.user_service import UserService
from app.features.auth.auth_service import AuthService
from app.core.config import settings

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate):
    """Register a new user with default password."""
    user = await AuthService.register_user(user_in, require_password_change=True)
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "success": True,
            "message": f"User registered successfully.",
            "data": user.model_dump(mode='json')
        }
    )

@router.get("/")
async def get_all_users(skip: int = 0, limit: int = 100):
    """Get all users with pagination."""
    users = await UserService.get_all_users(skip=skip, limit=limit)
    return JSONResponse(
        content={
            "success": True,
            "message": f"Retrieved {len(users)} users",
            "data": [user.model_dump(mode='json') for user in users],
            "pagination": {"skip": skip, "limit": limit, "count": len(users)}
        }
    )

@router.get("/{user_id}")
async def get_user_profile(user_id: int):
    """Get user profile by ID."""
    user = await UserService.get_user_by_id(user_id)
    return JSONResponse(
        content={
            "success": True,
            "message": "User retrieved successfully",
            "data": user.model_dump(mode='json')
        }
    )

@router.patch("/activate/{user_id}")
async def activate_user(user_id: int):
    """Activate user by ID."""
    user = await UserService.activate_user(user_id)
    return JSONResponse(
        content={
            "success": True,
            "message": f"User '{user.username}' activated successfully",
            "data": user.model_dump(mode='json')
        }
    )

@router.patch("/deactivate/{user_id}")
async def deactivate_user(user_id: int):
    """Deactivate user by ID."""
    user = await UserService.deactivate_user(user_id)
    return JSONResponse(
        content={
            "success": True,
            "message": f"User '{user.username}' deactivated successfully",
            "data": user.model_dump(mode='json')
        }
    )

@router.post("/change-password")
async def change_password(request: ChangePasswordRequest):
    """Change user password (for first-time login or password reset)."""
    result = await UserService.change_password(
        request.username,
        request.old_password,
        request.new_password
    )
    
    return JSONResponse(
        content={
            "success": True,
            "message": "Password changed successfully. Please login with your new password.",
            "data": result
        }
    )
