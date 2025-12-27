from pydantic import BaseModel, EmailStr, ConfigDict, Field
from datetime import datetime
from typing import Optional
from app.features.users.user_entity import UserRole

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = Field(None, pattern=r"^\d{10}$")
    role: UserRole = UserRole.USER
    active: bool = True
    two_factor_enabled: bool = False
    two_factor_required: bool = False

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = Field(None, pattern=r"^\d{10}$")
    password: Optional[str] = None
    role: Optional[UserRole] = None
    active: Optional[bool] = None
    two_factor_enabled: Optional[bool] = None
    two_factor_required: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChangePasswordRequest(BaseModel):
    username: str
    old_password: str
    new_password: str
