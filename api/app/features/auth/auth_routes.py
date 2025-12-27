from fastapi import APIRouter, status, Request
from fastapi.responses import JSONResponse
from app.features.auth.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
async def login(request: Request):
    """Login user and return token."""
    data = await request.json()
    username = data.get("username")
    password = data.get("password")
    
    client_host = request.client.host if request.client else None
    result = await AuthService.login_user(username, password, ip_address=client_host)
    
    # Extract token
    token = result.get("access_token")
    
    # Prepare response headers
    headers = {}
    message = "Login successful"
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    if result.get("password_change_required"):
        message = "Password change required"
    
    return JSONResponse(
        content={
            "success": True,
            "message": message,
            "access_token": token,
            "data": result
        },
        headers=headers
    )
