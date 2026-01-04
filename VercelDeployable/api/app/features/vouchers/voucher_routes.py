from fastapi import APIRouter, status, Query, Depends, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
from app.features.vouchers.voucher_schema import VoucherCreate, VoucherUpdate, VoucherType
from app.features.vouchers.voucher_service import VoucherService
from app.features.vouchers.voucher_entity import VoucherStatus
from app.features.users.user_entity import User, UserRole
from app.features.auth.auth_dependencies import get_current_active_user
from app.features.notifications.notification_service import NotificationService
from app.features.notifications.notification_schema import NotificationCreate
from app.core.telegram_utils import send_telegram_notification_background

router = APIRouter(prefix="/vouchers", tags=["Trade Vouchers (Challans & Invoices)"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_voucher(
    voucher_in: VoucherCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new Trade Voucher (Challan, Invoice, Quotation).
    """
    voucher = await VoucherService.create_voucher(voucher_in)
    
    # Notification Logic
    user_display = current_user.full_name or current_user.username
    msg = f"New {voucher.voucher_type.value} draft {voucher.voucher_number} created by {user_display}"
    
    await NotificationService.create_notification(NotificationCreate(
        title="New Draft Voucher",
        message=msg,
        type="voucher_draft",
        user_id=None
    ))

    # Telegram Notification (To all Admins)
    from app.features.users.user_repository import UserRepository
    from app.features.parties.party_repository import PartyRepository
    
    admin_chat_ids = await UserRepository.get_admins_with_telegram()
    party = await PartyRepository.get_by_id(voucher.party_id)
    party_name = party.name if party else "Unknown"
    
    # Build items summary
    items_table = ""
    if voucher.items:
        from app.features.inventory.inventory_repository import InventoryRepository
        items_table = "<b>📄 ITEMS SUMMARY</b>\n"
        items_table += "<code>"
        items_table += f"{'Item':<15} {'Qty':>4} {'Amount':>10}\n"
        items_table += "─" * 31 + "\n"
        for item in voucher.items:
            inv_item = await InventoryRepository.get_item_by_id(item.item_id)
            item_name = inv_item.name[:15] if inv_item else f"Item #{item.item_id}"[:15]
            items_table += f"{item_name:<15} {int(item.quantity):>4} {item.amount:>10.2f}\n"
        items_table += "</code>"
        items_table += "➖➖➖➖➖➖➖➖➖➖➖➖\n"

    html_message = (
        f"🏢 <b>BLUE STAR</b>\n"
        f"<i>Trading & Transport</i>\n\n"
        
        f"📦 <b>{voucher.voucher_type.value.upper()} #{voucher.voucher_number}</b>\n"
        f"━━━━━━━━━━━━━━━\n"
        
        f"👤 <b>BILLED TO:</b>\n"
        f"<b>{party_name}</b>\n"
        f"GSTIN: <code>{party.gstin if party and party.gstin else 'N/A'}</code>\n\n"
        
        f"📅 <b>DATE:</b> {voucher.voucher_date}\n"
        f"📍 <b>SUPPLY:</b> {voucher.place_of_supply or 'West Bengal'}\n"
        f"🚦 <b>STATUS:</b> <code>{voucher.status.upper()}</code>\n"
        f"━━━━━━━━━━━━━━━\n\n"
        
        f"{items_table}"
        
        f"💸 <b>FINANCIALS</b>\n"
        f"Subtotal: ₹{voucher.total_amount:,.2f}\n"
        f"Tax (GST): ₹{voucher.tax_amount:,.2f}\n"
        f"<b>Grand Total: ₹{voucher.grand_total:,.2f}</b>\n\n"
        
        f"✍️ <i>Created by {current_user.full_name or current_user.username}</i>\n"
        f"➖➖➖➖➖➖➖➖➖➖➖➖\n"
        f"⚠️ <b>Action Required:</b>"
    )
    
    inline_buttons = [
        [
            {"text": "✅ Approve & Issue", "callback_data": f"approve_doc:{voucher.id}"},
            {"text": "❌ Cancel", "callback_data": f"reject_doc:{voucher.id}"}
        ]
    ]

    send_telegram_notification_background(
        html_message,
        chat_ids=admin_chat_ids,
        inline_buttons=inline_buttons,
        parse_mode="HTML"
    )

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "success": True, 
            "message": f"Voucher {voucher.voucher_number} created successfully", 
            "data": voucher.model_dump(mode='json')
        }
    )

@router.patch("/{voucher_id}")
async def update_voucher(
    voucher_id: int, 
    voucher_update: VoucherUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update voucher status.
    Transitioning out of 'draft' triggers financial and inventory updates.
    """
    if voucher_update.status is not None and voucher_update.status != VoucherStatus.DRAFT:
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Only Administrators can issue or finalize vouchers."
            )
        # Record the Approver ID from the Auth Token
        voucher_update.approved_by_id = current_user.id

    voucher = await VoucherService.update_voucher(voucher_id, voucher_update)
    return JSONResponse(
        content={
            "success": True, 
            "message": "Voucher updated", 
            "data": voucher.model_dump(mode='json')
        }
    )

@router.get("/")
async def get_vouchers(
    skip: int = 0, 
    limit: int = 100, 
    type: Optional[VoucherType] = None
):
    """List all vouchers."""
    vouchers = await VoucherService.get_all_vouchers(skip, limit, type)
    return JSONResponse(
        content={
            "success": True,
            "message": f"Retrieved {len(vouchers)} vouchers",
            "data": [v.model_dump(mode='json') for v in vouchers],
            "pagination": {"skip": skip, "limit": limit, "count": len(vouchers)}
        }
    )

@router.get("/{voucher_id}")
async def get_voucher_detail(voucher_id: int):
    voucher = await VoucherService.get_voucher(voucher_id)
    return JSONResponse(
        content={
            "success": True, 
            "message": "Voucher retrieved", 
            "data": voucher.model_dump(mode='json')
        }
    )
