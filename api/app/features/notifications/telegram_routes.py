from fastapi import APIRouter, Request, status
from app.core.logger import logger
from app.core.config import settings
from app.features.users.user_repository import UserRepository
from app.core.telegram_utils import TelegramBot
import httpx

router = APIRouter(prefix="/telegram", tags=["Telegram Webhook"])

@router.post("/webhook")
async def telegram_webhook(request: Request):
    """
    Handle incoming Telegram updates (messages, callback queries, etc.).
    """
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
                from app.features.users.user_repository import UserRepository
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
                phone_number = contact.get("phone_number")
                if phone_number:
                    # Comprehensive phone number normalization
                    # Remove: +, spaces, dashes, country code (91)
                    raw_phone = phone_number.replace("+", "").replace(" ", "").replace("-", "")
                    
                    # Remove country code 91 if present at the start
                    if raw_phone.startswith("91") and len(raw_phone) > 10:
                        raw_phone = raw_phone[2:]  # Remove first 2 digits (91)
                    
                    logger.info(f"Attempting to link Telegram: original={phone_number}, normalized={raw_phone}, chat_id={chat_id}")
                    
                    # Try linking with normalized number
                    linked = await UserRepository.link_telegram_user(raw_phone, str(chat_id))
                    
                    if linked:
                        await TelegramBot.send_message(
                            "🎉 *Success!*\n\n"
                            "You are now connected with BlueStar Trading & Transport!\n\n"
                            "✅ Your account has been linked\n"
                            "✅ You will receive admin notifications here\n"
                            "✅ You can approve documents directly from Telegram\n\n"
                            "Use /enterprisechat to access the web chat interface.",
                            chat_id=str(chat_id)
                        )
                        logger.info(f"✅ Telegram account linked successfully: phone={raw_phone}, chat_id={chat_id}")
                    else:
                        # Try alternative formats
                        alternatives = []
                        
                        # Try with country code
                        if not phone_number.startswith("91"):
                            alternatives.append("91" + raw_phone)
                        
                        # Try original without modifications
                        alternatives.append(phone_number.replace("+", "").replace(" ", "").replace("-", ""))
                        
                        # Try each alternative
                        for alt_phone in alternatives:
                            linked = await UserRepository.link_telegram_user(alt_phone, str(chat_id))
                            if linked:
                                await TelegramBot.send_message(
                                    "🎉 *Success!*\n\n"
                                    "You are now connected with BlueStar Trading & Transport!\n\n"
                                    "✅ Your account has been linked\n"
                                    "✅ You will receive admin notifications here\n"
                                    "✅ You can approve documents directly from Telegram\n\n"
                                    "Use /enterprisechat to access the web chat interface.",
                                    chat_id=str(chat_id)
                                )
                                logger.info(f"✅ Telegram account linked with alternative format: phone={alt_phone}, chat_id={chat_id}")
                                return {"status": "ok"}
                        
                        # If all attempts failed
                        await TelegramBot.send_message(
                            f"❌ *Account Not Found*\n\n"
                            f"Could not find a user with phone number:\n"
                            f"`{phone_number}` (tried: {raw_phone})\n\n"
                            f"Please ensure:\n"
                            f"• Your phone number is registered in the system\n"
                            f"• The number matches exactly (including country code)\n\n"
                            f"Contact your administrator for assistance.",
                            chat_id=str(chat_id)
                        )
                        logger.warning(f"❌ Failed to link Telegram account: phone={phone_number}, normalized={raw_phone}, chat_id={chat_id}")
                
                return {"status": "ok"}

            # 2. Handle Commands
            if text.startswith("/start"):
                # Send message with contact request button
                welcome_text = (
                    "👋 Welcome to BlueStar System Bot!\n\n"
                    "To receive admin notifications and interact with documents, "
                    "please share your contact using the button below."
                )
                
                # Send with keyboard markup
                keyboard = {
                    "keyboard": [[{
                        "text": "📱 Share Contact",
                        "request_contact": True
                    }]],
                    "resize_keyboard": True,
                    "one_time_keyboard": True
                }
                
                await TelegramBot.send_message_with_keyboard(
                    welcome_text,
                    chat_id=str(chat_id),
                    keyboard=keyboard
                )
            
            elif text.startswith("/id"):
                await TelegramBot.send_message(
                    f"Your Chat ID: `{chat_id}`\nYour User ID: `{user_id}`",
                    chat_id=str(chat_id)
                )
            
            elif text.startswith("/enterprisechat"):
                # Link to enterprise chat
                user = await UserRepository.get_by_telegram_chat_id(str(chat_id))
                if user:
                    # Generate a session token or link
                    from app.features.users.user_helper import AuthHelper
                    from datetime import timedelta
                    
                    # Create a special token for enterprise chat access
                    chat_token = AuthHelper.create_access_token(
                        data={"sub": user.username, "id": user.id, "role": str(user.role.value)},
                        expires_delta=timedelta(hours=24)
                    )
                    
                    # In production, you'd have a proper web URL
                    chat_url = f"https://your-domain.com/chat?token={chat_token}"
                    
                    await TelegramBot.send_message(
                        f"🔗 Enterprise Chat Access\n\n"
                        f"Click the link below to access the enterprise chat:\n"
                        f"{chat_url}\n\n"
                        f"This link is valid for 24 hours.",
                        chat_id=str(chat_id)
                    )
                else:
                    await TelegramBot.send_message(
                        "❌ Please link your account first using /start",
                        chat_id=str(chat_id)
                    )

        return {"status": "ok"}

    except Exception as e:
        logger.error(f"Error handling telegram webhook: {str(e)}")
        # Return OK to prevent Telegram from retrying indefinitely on bad logic
        return {"status": "error", "detail": str(e)}
