from fastapi import Request, HTTPException, status
from typing import Optional

async def get_current_user(request: Request) -> dict:
    """
    Dependency to get the current authenticated user from request state.
    The user is injected into request.state by AuthMiddleware.
    """
    if hasattr(request.state, "user"):
        return request.state.user
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated"
    )

async def get_admin_user(request: Request) -> dict:
    """
    Dependency to get the current user and verify they are an admin.
    """
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user

async def get_current_active_user(request: Request):
    """
    Get full User entity from DB based on ID in token.
    """
    user_payload = await get_current_user(request)
    user_id = user_payload.get("id")
    
    from app.features.users.user_repository import UserRepository
    user = await UserRepository.get_by_id(user_id)
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    if not user.active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    return user
