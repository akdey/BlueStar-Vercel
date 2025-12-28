import os
from typing import List
from pydantic import ConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "BlueStar Trading & Transport"
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 20
    DATABASE_URL: str = ""
    MAX_LOGIN_ATTEMPTS: int = 3
    LOGIN_LOCKOUT_MINUTES: int = 15
    DEFAULT_PASSWORD: str = "ChangeMe@123"
    GOOGLE_API_KEY: str = ""
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""
    
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
        "/docs", 
        "/redoc", 
        "/openapi.json", 
        "/api/auth/login",
        "/api/users/change-password",
        "/api/telegram/webhook"
    ]
    
    ENV: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
