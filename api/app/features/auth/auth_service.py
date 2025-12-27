from fastapi import HTTPException, status
from app.features.users.user_repository import UserRepository
from app.features.users.user_schema import UserCreate, UserResponse
from app.features.users.user_helper import AuthHelper
from app.core.logger import logger

class AuthService:
    @staticmethod
    async def register_user(user_in: UserCreate, password: str = None, require_password_change: bool = False) -> UserResponse:
        from app.core.config import settings
        # Check if user already exists
        if await UserRepository.get_by_username(user_in.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        if await UserRepository.get_by_email(user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password and create user
        final_password = password or settings.DEFAULT_PASSWORD
        hashed_password = AuthHelper.hash_password(final_password)
        new_user = await UserRepository.create(user_in, hashed_password, require_password_change)
        return UserResponse.model_validate(new_user)

    @staticmethod
    async def login_user(username: str, password: str, ip_address: str = None) -> dict:
        from datetime import datetime, timedelta, timezone
        from app.core.config import settings

        user = await UserRepository.get_by_username(username)
        # 1. User not found -> Don't reveal account existence, generic error
        if not user:
             # Use a random delay or hash dummy password to prevent timing attacks, 
             # but here we just return error.
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )

        # 2. Check Lockout - using timezone-aware usage
        if user.lockout_until:
            # Add timezone info to now() if lockout_until is timezone aware
            # Assuming DB stores aware datetimes or UTC
            now = datetime.now(timezone.utc) if user.lockout_until.tzinfo else datetime.now()
            
            if user.lockout_until > now:
                 wait_minutes = int((user.lockout_until - now).total_seconds() / 60)
                 raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Account locked. Try again in {wait_minutes + 1} minutes."
                )
            else:
                 # Lockout expired, perform reset inside login flow or here
                 # We rely on successful login to reset, or reset explicitly
                 pass

        # 3. Verify Password
        if not AuthHelper.verify_password(password, user.hashed_password):
            logger.warning(f"Failed login attempt for username: {username}")
            
            # Increment failed attempts
            attempts = await UserRepository.increment_failed_login(user.id)
            
            if attempts >= settings.MAX_LOGIN_ATTEMPTS:
                lockout_time = datetime.now(timezone.utc) + timedelta(minutes=settings.LOGIN_LOCKOUT_MINUTES)
                # Remove timezone info if your DB is naive, but recommneded usage is aware
                if not user.created_at.tzinfo: # minimal check to match db style
                     lockout_time = lockout_time.replace(tzinfo=None)
                
                await UserRepository.lockout_user(user.id, lockout_time)
                logger.warning(f"User {username} exceeded max login attempts. Locked out.")
                
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Account locked due to too many failed attempts. Try again in {settings.LOGIN_LOCKOUT_MINUTES} minutes."
                )

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )
        
        # 4. Check active status
        if not user.active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated"
            )
        
        # 5. Success - Reset failures and update login info
        await UserRepository.reset_failed_login(user.id)
        await UserRepository.update_last_login(user.id, ip_address=ip_address)
        
        # Generate token
        access_token = AuthHelper.create_access_token(
            data={"sub": user.username, "id": user.id, "role": str(user.role.value if hasattr(user.role, 'value') else user.role)}
        )
        
        # 5.5 Check if password change is required
        if user.password_change_required:
            logger.info(f"Login successful for {username} but password change required.")
            return {
                "password_change_required": True,
                "message": "Password change required",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "role": user.role
                }
            }
        
        logger.info(f"Token generated for user {user.username}: {access_token[:10]}...")
        
        return {
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "full_name": user.full_name
            }
        }
