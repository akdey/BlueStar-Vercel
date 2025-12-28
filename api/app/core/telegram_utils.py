
import httpx
import asyncio
from app.core.logger import logger
from app.core.config import settings

# Make sure to add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to your .env or settings

class TelegramBot:
    """
    Simple Telegram Bot integration to send notifications.
    """
    BASE_URL = "https://api.telegram.org/bot"

    @staticmethod
    async def send_message(message: str, chat_id: str = None):
        token = getattr(settings, "TELEGRAM_BOT_TOKEN", None)
        # Use provided chat_id or fall back to global one
        target_chat_id = chat_id or getattr(settings, "TELEGRAM_CHAT_ID", None)

        if not token or not target_chat_id:
            logger.warning("Telegram Bot Token or Chat ID not configured. Skipping notification.")
            return

        url = f"{TelegramBot.BASE_URL}{token}/sendMessage"
        payload = {
            "chat_id": target_chat_id,
            "text": message,
            "parse_mode": "Markdown"
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload)
                if response.status_code != 200:
                    logger.error(f"Failed to send Telegram message to {target_chat_id}: {response.text}")
                else:
                    logger.info(f"Telegram notification sent to {target_chat_id} successfully.")
        except Exception as e:
            logger.error(f"Error sending Telegram notification: {str(e)}")

    @staticmethod
    async def send_message_with_keyboard(message: str, chat_id: str, keyboard: dict):
        """Send message with custom keyboard (e.g., contact request button)"""
        token = getattr(settings, "TELEGRAM_BOT_TOKEN", None)
        if not token:
            logger.warning("Telegram Bot Token not configured.")
            return

        url = f"{TelegramBot.BASE_URL}{token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message,
            "reply_markup": keyboard
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload)
                if response.status_code != 200:
                    logger.error(f"Failed to send Telegram message with keyboard: {response.text}")
        except Exception as e:
            logger.error(f"Error sending Telegram message with keyboard: {str(e)}")

    @staticmethod
    async def send_message_with_inline_buttons(message: str, chat_id: str, buttons: list):
        """Send message with inline buttons (for document actions)"""
        token = getattr(settings, "TELEGRAM_BOT_TOKEN", None)
        if not token:
            logger.warning("Telegram Bot Token not configured.")
            return

        url = f"{TelegramBot.BASE_URL}{token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "Markdown",
            "reply_markup": {
                "inline_keyboard": buttons
            }
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload)
                if response.status_code != 200:
                    logger.error(f"Failed to send Telegram message with inline buttons: {response.text}")
        except Exception as e:
            logger.error(f"Error sending Telegram message with inline buttons: {str(e)}")

    @staticmethod
    async def answer_callback(callback_id: str, text: str = None):
        """Answer callback query to remove loading state"""
        token = getattr(settings, "TELEGRAM_BOT_TOKEN", None)
        if not token:
            return

        url = f"{TelegramBot.BASE_URL}{token}/answerCallbackQuery"
        payload = {"callback_query_id": callback_id}
        if text:
            payload["text"] = text

        try:
            async with httpx.AsyncClient() as client:
                await client.post(url, json=payload)
        except Exception as e:
            logger.error(f"Error answering callback: {str(e)}")

# Helper/wrapper to fire and forget
def send_telegram_notification_background(message: str, chat_ids: list[str] = None, inline_buttons: list = None):
    # If explicit list, send to all. Else default global.
    if chat_ids:
        for cid in chat_ids:
            if inline_buttons:
                asyncio.create_task(TelegramBot.send_message_with_inline_buttons(message, chat_id=cid, buttons=inline_buttons))
            else:
                asyncio.create_task(TelegramBot.send_message(message, chat_id=cid))
    else:
        if inline_buttons:
            asyncio.create_task(TelegramBot.send_message_with_inline_buttons(message, chat_id=settings.TELEGRAM_CHAT_ID, buttons=inline_buttons))
        else:
            asyncio.create_task(TelegramBot.send_message(message))
