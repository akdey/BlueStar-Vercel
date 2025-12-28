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
            
            # Handle voucher approval actions
            if callback_data.startswith("approve_doc:"): # Keeping the same callback ID to avoid breaking pending notifications
                doc_id_str = callback_data.split(":")[1]
                user_id = callback.get("from", {}).get("id") # Use person who clicked
                
                # Get user (admin) by their private chat_id/user_id
                user = await UserRepository.get_by_telegram_chat_id(str(user_id))
                
                # Role values are lowercase in UserRole enum ('admin', 'manager')
                if user and user.role.value.lower() in ["admin", "manager"]:
                    # Update voucher status
                    from app.features.vouchers.voucher_service import VoucherService
                    from app.features.vouchers.voucher_schema import VoucherUpdate
                    from app.features.vouchers.voucher_entity import VoucherStatus
                    
                    try:
                        voucher = await VoucherService.update_voucher(
                            int(doc_id_str),
                            VoucherUpdate(status=VoucherStatus.ISSUED)
                        )
                        await TelegramBot.send_message(
                            f"✅ <b>Voucher {voucher.voucher_number} Issued</b>\n\n"
                            f"Action performed by: <b>{user.username}</b>\n"
                            f"Status updated to: <code>ISSUED</code>",
                            chat_id=str(chat_id),
                            parse_mode="HTML"
                        )
                        logger.info(f"Voucher {voucher.voucher_number} issued via Telegram by {user.username}")
                    except Exception as e:
                        await TelegramBot.send_message(
                            f"❌ <b>Error issuing voucher:</b>\n{str(e)}",
                            chat_id=str(chat_id),
                            parse_mode="HTML"
                        )
                else:
                    role_found = user.role.value if user else "None"
                    await TelegramBot.send_message(
                        f"❌ <b>Access Denied</b>\n"
                        f"Only admins or managers can approve vouchers.\n\n"
                        f"<b>Your ID:</b> <code>{user_id}</code>\n"
                        f"<b>System Role:</b> <code>{role_found}</code>",
                        chat_id=str(chat_id),
                        parse_mode="HTML"
                    )
            
            elif callback_data.startswith("reject_doc:"):
                doc_id = callback_data.split(":")[1]
                await TelegramBot.send_message(
                    f"🛑 <b>Action Cancelled</b>\nTrade Voucher #{doc_id} was not modified.",
                    chat_id=str(chat_id),
                    parse_mode="HTML"
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
                                "• Trade Voucher approval: ENABLED\n\n"
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
                    "👋 <b>Welcome to BlueStar Bot!</b>\n\n"
                    "Please share your contact using the button below to link your account and receive notifications."
                )
                keyboard = {
                    "keyboard": [[{"text": "📱 Share Contact", "request_contact": True}]],
                    "resize_keyboard": True, "one_time_keyboard": True
                }
                await TelegramBot.send_message_with_keyboard(welcome_text, chat_id=str(chat_id), keyboard=keyboard, parse_mode="HTML")
            
            elif text.startswith("/status"):
                try:
                    # Use function-level UserRepository
                    user = await UserRepository.get_by_telegram_chat_id(str(chat_id))
                    status_text = "🟢 <b>System Status</b>\n\n"
                    status_text += f"• <b>Database:</b> CONNECTED\n"
                    status_text += f"• <b>Your Account:</b> {'LINKED ✅' if user else 'NOT LINKED ❌'}\n"
                    if user:
                        status_text += f"• <b>Role:</b> <code>{user.role.value.upper()}</code>\n"
                    await TelegramBot.send_message(status_text, chat_id=str(chat_id), parse_mode="HTML")
                except Exception as e:
                    await TelegramBot.send_message(f"🔴 <b>System Status</b>\n\n• <b>Database:</b> ERROR (<code>{str(e)[:50]}</code>)", chat_id=str(chat_id), parse_mode="HTML")
            
            elif text.startswith("/id"):
                await TelegramBot.send_message(f"🆔 <b>Your Chat ID:</b> <code>{chat_id}</code>", chat_id=str(chat_id), parse_mode="HTML")
            
            elif text.startswith("/search"):
                search_term = text.split(" ", 1)[1] if " " in text else ""
                if not search_term:
                    await TelegramBot.send_message("🔍 <b>Search Party</b>\nUsage: <code>/search &lt;name/code&gt;</code>", chat_id=str(chat_id), parse_mode="HTML")
                else:
                    from app.features.parties.party_repository import PartyRepository
                    parties = await PartyRepository.get_all(search=search_term, limit=10)
                    if not parties:
                        await TelegramBot.send_message(f"❌ No parties found matching '<code>{search_term}</code>'", chat_id=str(chat_id), parse_mode="HTML")
                    else:
                        resp = f"🔍 <b>Results for '{search_term}':</b>\n\n"
                        for p in parties:
                            resp += f"• {p.name} (<code>{p.code}</code>)\n"
                        resp += "\n<i>Use /ledger &lt;code&gt; to see balance.</i>"
                        await TelegramBot.send_message(resp, chat_id=str(chat_id), parse_mode="HTML")

            elif text.startswith("/ledger"):
                search_term = text.split(" ", 1)[1] if " " in text else ""
                if not search_term:
                    await TelegramBot.send_message("📒 <b>Party Ledger</b>\nUsage: <code>/ledger &lt;name/code&gt;</code>", chat_id=str(chat_id), parse_mode="HTML")
                else:
                    from app.features.parties.party_repository import PartyRepository
                    from app.features.transactions.transaction_repository import TransactionRepository
                    
                    # 1. Find Party
                    parties = await PartyRepository.get_all(search=search_term, limit=5)
                    if not parties:
                        await TelegramBot.send_message(f"❌ Party '<code>{search_term}</code>' not found.", chat_id=str(chat_id), parse_mode="HTML")
                    elif len(parties) > 1 and not any(p.code.lower() == search_term.lower() for p in parties):
                        resp = f"❓ <b>Multiple matches found:</b>\n\n"
                        for p in parties:
                            resp += f"• {p.name} (<code>{p.code}</code>)\n"
                        resp += "\n<i>Please use the exact code.</i>"
                        await TelegramBot.send_message(resp, chat_id=str(chat_id), parse_mode="HTML")
                    else:
                        # Exact match or single result
                        party = parties[0]
                        if len(parties) > 1:
                            for p in parties:
                                if p.code.lower() == search_term.lower():
                                    party = p
                                    break
                        
                        # 2. Get Transactions
                        txns = await TransactionRepository.get_by_party(party.id, limit=5)
                        
                        # 3. Build Response
                        bal_color = "🟢" if party.current_balance >= 0 else "🔴"
                        resp = f"📒 <b>LEDGER: {party.name}</b>\n"
                        resp += f"Code: <code>{party.code}</code>\n"
                        resp += f"━━━━━━━━━━━━━━━\n"
                        resp += f"{bal_color} <b>Current Balance: ₹{party.current_balance:,.2f}</b>\n"
                        resp += f"━━━━━━━━━━━━━━━\n\n"
                        
                        if not txns:
                            resp += "<i>No recent transactions found.</i>"
                        else:
                            resp += "<b>Last 5 Transactions:</b>\n"
                            resp += "<code>"
                            resp += f"{'Date':<10} {'Type':<8} {'Amt':>10}\n"
                            resp += "─" * 30 + "\n"
                            for t in txns:
                                date_str = t.transaction_date.strftime('%d/%m')
                                t_type = t.transaction_type.value[:8].capitalize()
                                resp += f"{date_str:<10} {t_type:<8} {t.amount:>10.0f}\n"
                            resp += "</code>"
                        
                        await TelegramBot.send_message(resp, chat_id=str(chat_id), parse_mode="HTML")

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
                    # Using the actual Vercel URL provided by the user
                    chat_url = f"https://bluestar.akdey.vercel.app/chat?token={chat_token}"
                    await TelegramBot.send_message(
                        f"🔗 <b>Enterprise Chat Access</b>\n\n"
                        f"Click the link below to access the enterprise chat interface:\n\n"
                        f"<a href='{chat_url}'>Launch BlueStar Chat</a>\n\n"
                        f"<i>Token is valid for 24 hours.</i>",
                        chat_id=str(chat_id),
                        parse_mode="HTML"
                    )
                else:
                    await TelegramBot.send_message("❌ <b>Account Not Linked</b>\nPlease use /start to link your account first.", chat_id=str(chat_id), parse_mode="HTML")

        return {"status": "ok"}

    except Exception as e:
        logger.error(f"Error handling telegram webhook: {str(e)}")
        # Return OK to prevent Telegram from retrying indefinitely on bad logic
        return {"status": "error", "detail": str(e)}
