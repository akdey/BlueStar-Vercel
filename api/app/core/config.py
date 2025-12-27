import os
from typing import List
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "BlueStar Trading & Transport"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 20
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    MAX_LOGIN_ATTEMPTS: int = 3
    LOGIN_LOCKOUT_MINUTES: int = 15
    DEFAULT_PASSWORD: str = "ChangeMe@123"
    
    # CORS Settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://localhost:8000"
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]
    CORS_EXPOSE_HEADERS: List[str] = ["Authorization"]
    
    PUBLIC_ROUTES: list[str] = [
        "api/docs", 
        "api/redoc", 
        "api/openapi.json", 
        "api/auth/login"
    ]
    
    ENV: str = "development"

    model_config = ConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
