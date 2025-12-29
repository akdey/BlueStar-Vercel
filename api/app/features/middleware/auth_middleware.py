import re
from datetime import datetime, timezone, timedelta
from fastapi import Request, status, Response, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.features.users.user_helper import AuthHelper
from app.core.config import settings
from app.core.role_mapping import ROLE_MAPPING
from app.core.logger import logger

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 0. Allow OPTIONS requests (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)

        # 1. Check if route is public
        path = request.url.path
        
        # Explicit bypass for Telegram webhooks to avoid any matching issues
        if path.startswith("/api/telegram"):
            return await call_next(request)
            
        # Bypass auth for Live Tracking Stream (SSE)
        if "tracking-stream" in path:
            return await call_next(request)
            
        # Check for other public routes
        is_public = False
        for route in settings.PUBLIC_ROUTES:
            if path == route or path.startswith(route + "/"):
                is_public = True
                break
        
        if is_public:
            return await call_next(request)

        # 2. Extract Token
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return self._error_response("Missing or invalid authentication token")

        token = auth_header.split(" ")[1]
        
        # 3. Decode Token
        payload = AuthHelper.decode_token(token)
        if not payload:
            return self._error_response("Invalid or expired token", status_code=status.HTTP_401_UNAUTHORIZED)

        # 4. Extract User Role & ID
        user_role = payload.get("role")
        user_id = payload.get("id")
        
        if not user_role:
             return self._error_response("Token missing role information", status_code=status.HTTP_403_FORBIDDEN)

        # 5. Validate Role Access
        method = request.method
        route_key = f"{method}:{path}"
        
        # Check against permission mapping
        # We search for the first regex match in our mapping
        # This implies order in ROLE_MAPPING doesn't strictly matter for dictionary, 
        # but specificity does.
        
        allowed_roles = None
        for pattern, roles in ROLE_MAPPING.items():
            if re.match(pattern, route_key):
                allowed_roles = roles
                break
        
        # If a rule exists and user lacks role -> Block
        if allowed_roles and user_role not in allowed_roles:
            logger.warning(f"Access Denied for user {user_id} ({user_role}) to {method} {path}")
            return self._error_response(
                f"Access denied. Role '{user_role}' required for this resource.", 
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        # 6. Inject user into request state for easy access in views
        request.state.user = payload
        
        response = await call_next(request)
        
        # 7. Sliding Session (Auto-Refresh)
        # Verify if token is close to expiry and needs refresh
        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            exp_time = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
            now = datetime.now(timezone.utc)
            time_left = exp_time - now
            
            # If less than 50% of session time remains, issue new token
            refresh_threshold = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES / 2)
            
            if time_left < refresh_threshold:
                # Create new token with fresh expiry
                # Remove 'exp' from payload so create_access_token sets a new one
                new_payload = payload.copy()
                if "exp" in new_payload:
                    del new_payload["exp"]
                
                new_token = AuthHelper.create_access_token(new_payload)
                
                # Append to response header
                response.headers["Authorization"] = f"Bearer {new_token}"
                logger.debug(f"Token refreshed for user {user_id}")

        return response

    def _error_response(self, message: str, status_code: int = status.HTTP_401_UNAUTHORIZED):
        return JSONResponse(
            status_code=status_code,
            content={
                "success": False,
                "message": message,
                "data": None
            }
        )
