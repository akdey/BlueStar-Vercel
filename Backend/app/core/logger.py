import logging
import logging.config
import sys
import os
from pathlib import Path

# Get environment flags
ENV = os.environ.get("ENV", "development")
print("ENV",ENV)
# Vercel sets the 'VERCEL' env var automatically to '1'
IS_VERCEL = ENV == "VERCEL" or os.environ.get("VERCEL") == "1"

# 1. Define active handlers dynamically
# On Vercel, we ONLY use 'console'. Locally, we use both.
active_handlers = ["console"]
LOGGING_HANDLERS = {
    "console": {
        "class": "logging.StreamHandler",
        "formatter": "default",
        "stream": sys.stdout,
    }
}

# 2. Only add File Logging if we are NOT on Vercel
if not IS_VERCEL:
    LOGS_DIR = Path("logs")
    try:
        LOGS_DIR.mkdir(exist_ok=True)
        active_handlers.append("file")
        LOGGING_HANDLERS["file"] = {
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "detailed",
            "filename": LOGS_DIR / "app.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
            "encoding": "utf-8",
        }
    except OSError:
        # Fallback in case a local environment also has restricted permissions
        print("Warning: Could not create logs directory. Falling back to console logging.")

# 3. Final Logging Configuration
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        "detailed": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": LOGGING_HANDLERS,
    "loggers": {
        "": {  # Root logger
            "handlers": active_handlers,
            "level": "INFO",
            "propagate": True,
        },
        "app": {  # Application logger
            "handlers": active_handlers,
            "level": "DEBUG",
            "propagate": False,
        },
        "sqlalchemy.engine": {
            "level": "WARNING",
            "handlers": active_handlers,
            "propagate": False,
        },
    },
}

def setup_logging():
    """Initializes the logging system based on the environment."""
    logging.config.dictConfig(LOGGING_CONFIG)

# Singleton logger instance for the app
logger = logging.getLogger("app")