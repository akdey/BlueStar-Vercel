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
    
    # Company Info (for Vouchers/Bills)
    COMPANY_NAME: str = "BLUE STAR TRADING & CO."
    COMPANY_ADDRESS: str = "Srirampur, Ratulia, Paschim Medinipur, West Bengal, 721139"
    COMPANY_PHONE: str = "+91 7001031322"
    COMPANY_EMAIL: str = "bluestartradingandco@gmail.com"
    COMPANY_GSTIN: str = "19XXXXX0000X1Z5"
    COMPANY_WEBSITE: str = "www.bluestar-trading.com"
    
    # SMTP Settings (Gmail)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "" # To be provided in env
    SMTP_PASSWORD: str = "" # To be provided in env (App Password)
    EMAIL_FROM: str = "BlueStar Trading & Transport <noreply@bluestar.com>"
    
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
