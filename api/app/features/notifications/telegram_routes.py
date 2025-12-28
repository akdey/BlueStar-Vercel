from fastapi import APIRouter, Request, status
from app.core.logger import logger
from app.core.config import settings
from app.core.telegram_utils import TelegramBot

router = APIRouter(prefix="/telegram", tags=["Telegram Webhook"])

@router.post("/webhook")
async def telegram_webhook(request: Request):
    """
    Handle incoming Telegram updates (messages, callback queries, etc.).
    """
    # Move repository import inside the function to avoid circular imports and scoping issues
    from app.features.users.user_repository import UserRepository
    
    try:
        data = await request.json()
        logger.info(f"Received Telegram Update: {data}")

        # Handle Callback Queries (Button Presses)
        if "callback_query" in data:
            callback = data["callback_query"]
            chat_id = callback.get("message", {}).get("chat", {}).get("id")
            callback_data = callback.get("data", "")
            callback_id = callback.get("id")
            
            # Answer callback to remove loading state
            await TelegramBot.answer_callback(callback_id)
            
            # Handle document approval actions
            if callback_data.startswith("approve_doc:"):
                doc_id = callback_data.split(":")[1]
                user_id = callback.get("from", {}).get("id")
                
                # Get user from chat_id
                user = await UserRepository.get_by_telegram_chat_id(str(user_id))
                
                if user and user.role.value == "ADMIN":
                    # Update document status
                    from app.features.documents.document_service import DocumentService
                    from app.features.documents.document_schema import DocumentUpdate
                    from app.features.documents.document_entity import DocumentStatus
                    
                    try:
                        await DocumentService.update_document(
                            int(doc_id),
                            DocumentUpdate(status=DocumentStatus.ISSUED)
                        )
                        await TelegramBot.send_message(
                            f"✅ Document #{doc_id} has been ISSUED by {user.username}",
                            chat_id=str(chat_id)
                        )
                        logger.info(f"Document {doc_id} issued via Telegram by {user.username}")
                    except Exception as e:
                        await TelegramBot.send_message(
                            f"❌ Error issuing document: {str(e)}",
                            chat_id=str(chat_id)
                        )
                else:
                    await TelegramBot.send_message(
                        "❌ Only admins can approve documents.",
                        chat_id=str(chat_id)
                    )
            
            elif callback_data.startswith("reject_doc:"):
                doc_id = callback_data.split(":")[1]
                await TelegramBot.send_message(
                    f"Document #{doc_id} action cancelled.",
                    chat_id=str(chat_id)
                )
            
            return {"status": "ok"}

        # Handle Messages
        if "message" in data:
            message = data["message"]
            chat_id = message.get("chat", {}).get("id")
            text = message.get("text", "")
            contact = message.get("contact")
            user_id = message.get("from", {}).get("id")
            
            # 1. Handle Contact Sharing (User Verification)
            if contact:
                phone_number = contact.get("phone_number", "")
                await TelegramBot.send_message(f"📩 Received contact ({phone_number}). Processing... ⏳", chat_id=str(chat_id))
                
                if phone_number:
                    # Comprehensive phone number normalization
                    raw_phone = phone_number.replace("+", "").replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
                    raw_phone = raw_phone.lstrip("0")
                    
                    if raw_phone.startswith("91") and len(raw_phone) > 10:
                        raw_phone = raw_phone[2:]
                    
                    logger.info(f"Telegram Linking Attempt: cleaned={raw_phone}, chat_id={chat_id}")
                    
                    try:
                        linked = await UserRepository.link_telegram_user(raw_phone, str(chat_id))
                        
                        if linked:
                            success_msg = (
                                "You are now connected with BlueStar Trading & Transport!\n\n"
                                "✅ *Account Linked Successfully*\n"
                                "• Admin notifications: ACTIVE\n"
                                "• Document approval: ENABLED\n\n"
                                "Thank you for connecting with us!"
                            )
                            await TelegramBot.send_message(success_msg, chat_id=str(chat_id))
                            return {"status": "ok"}
                        
                        # Try with country code if not found
                        alt_phone = "91" + raw_phone
                        linked = await UserRepository.link_telegram_user(alt_phone, str(chat_id))
                        if linked:
                            await TelegramBot.send_message("You are now connected with BlueStar Trading & Transport!\n\n✅ *Account Linked Successfully*", chat_id=str(chat_id))
                            return {"status": "ok"}

                        # Failed match
                        await TelegramBot.send_message(
                            f"❌ *Match Not Found*\n\n"
                            f"We couldn't find a user with phone number: `{raw_phone}`\n\n"
                            "Please check your profile on the website.", 
                            chat_id=str(chat_id)
                        )
                    except Exception as e:
                        logger.error(f"DB Error in linking: {str(e)}")
                        await TelegramBot.send_message(f"⚠️ *System Error*\nFailed to talk to database: {str(e)[:100]}", chat_id=str(chat_id))
                
                return {"status": "ok"}

            # 2. Handle Commands
            if text.startswith("/start"):
                welcome_text = (
                    "👋 Welcome to BlueStar Bot!\n\n"
                    "Share your contact using the button below to link your account."
                )
                keyboard = {
                    "keyboard": [[{"text": "📱 Share Contact", "request_contact": True}]],
                    "resize_keyboard": True, "one_time_keyboard": True
                }
                await TelegramBot.send_message_with_keyboard(welcome_text, chat_id=str(chat_id), keyboard=keyboard)
            
            elif text.startswith("/status"):
                try:
                    # Use function-level UserRepository
                    user = await UserRepository.get_by_telegram_chat_id(str(chat_id))
                    status_text = "🟢 *System Status*\n\n"
                    status_text += f"• Database: CONNECTED\n"
                    status_text += f"• Your Account: {'LINKED' if user else 'NOT LINKED'}\n"
                    if user:
                        status_text += f"• Role: {user.role.value}\n"
                    await TelegramBot.send_message(status_text, chat_id=str(chat_id))
                except Exception as e:
                    await TelegramBot.send_message(f"🔴 *System Status*\n\n• Database: ERROR ({str(e)[:50]})", chat_id=str(chat_id))
            
            elif text.startswith("/id"):
                await TelegramBot.send_message(f"Your Chat ID: `{chat_id}`", chat_id=str(chat_id))
            
            elif text.startswith("/enterprisechat"):
                # Link to enterprise chat
                user = await UserRepository.get_by_telegram_chat_id(str(chat_id))
                if user:
                    from app.features.users.user_helper import AuthHelper
                    from datetime import timedelta
                    chat_token = AuthHelper.create_access_token(
                        data={"sub": user.username, "id": user.id, "role": str(user.role.value)},
                        expires_delta=timedelta(hours=24)
                    )
                    chat_url = f"https://bluestar.akdey.vercel.app/chat?token={chat_token}"
                    await TelegramBot.send_message(
                        f"🔗 Enterprise Chat Access\n\nClick the link below to access:\n{chat_url}\n\nValid for 24 hours.",
                        chat_id=str(chat_id)
                    )
                else:
                    await TelegramBot.send_message("❌ Please link your account first using /start", chat_id=str(chat_id))

        return {"status": "ok"}

    except Exception as e:
        logger.error(f"Error handling telegram webhook: {str(e)}")
        # Return OK to prevent Telegram from retrying indefinitely on bad logic
        return {"status": "error", "detail": str(e)}
