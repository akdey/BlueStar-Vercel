import sys
import os
sys.path.append(os.path.dirname(os.path.realpath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import init_db
from app.core.logger import setup_logging, logger
from app.core.config import settings
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.features.auth.auth_routes import router as auth_router
from app.features.users.user_routes import router as user_router
from app.features.parties.party_routes import router as party_router
from app.features.transactions.transaction_routes import router as txn_router
from app.features.inventory.inventory_routes import router as inventory_router
from app.features.documents.document_routes import router as document_router
from app.features.fleet.fleet_routes import router as fleet_router
from app.features.trips.trip_routes import router as trip_router
from app.features.dashboard.dashboard_routes import router as dashboard_router
from app.features.chat.chat_routes import router as chat_router
from app.features.notifications.notification_routes import router as notification_router
from app.features.notifications.telegram_routes import router as telegram_router
from app.core.exceptions import (
    http_exception_handler,
    validation_exception_handler,
    global_exception_handler
)
from app.features.middleware.auth_middleware import AuthMiddleware

# Setup logging configuration
setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend for BlueStar Trading & Transport System",
    version="0.1.0"
)

# Register Exception Handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Add Middleware
# CORS Middleware (Must be added before other middleware usually, but FastAPI handles it well)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
    expose_headers=settings.CORS_EXPOSE_HEADERS,
)
app.add_middleware(AuthMiddleware)

@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up...")
    await init_db()
    logger.info("Database initialized.")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutting down...")

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

# Register Routers
app.include_router(auth_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(party_router, prefix="/api")
app.include_router(txn_router, prefix="/api")
app.include_router(inventory_router, prefix="/api")
app.include_router(document_router, prefix="/api")
app.include_router(fleet_router, prefix="/api")
app.include_router(trip_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(notification_router, prefix="/api")
app.include_router(telegram_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False, reload_dirs=["."], reload_excludes=["logs", "logs/*", "*.log", "*.db", "trading_system.db", "*.db-journal", "*.db-wal", ".git", "__pycache__"])
