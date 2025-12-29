from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from app.core.database import SessionLocal
from app.features.vouchers.voucher_repository import VoucherRepository
from app.features.vouchers.voucher_schema import VoucherCreate, VoucherResponse, VoucherUpdate
from app.features.vouchers.voucher_entity import VoucherType, TradeVoucher, VoucherStatus
from app.features.inventory.inventory_repository import InventoryRepository 
from app.core.id_generator import IDGenerator
from app.core.logger import logger

from app.features.transactions.transaction_service import TransactionService
from app.features.transactions.transaction_schema import TransactionCreate
from app.features.transactions.transaction_entity import TransactionType, PaymentMode
from app.features.vouchers.voucher_email_service import VoucherEmailService
from app.features.parties.party_repository import PartyRepository
import asyncio

class VoucherService:
    @staticmethod
    async def create_voucher(voucher_in: VoucherCreate) -> VoucherResponse:
        # Handle Auto-generation of Voucher Number
        if not voucher_in.voucher_number:
            if voucher_in.voucher_type == VoucherType.INVOICE:
                prefix = "INV"
            elif voucher_in.voucher_type == VoucherType.QUOTATION:
                prefix = "QTN"
            elif voucher_in.voucher_type == VoucherType.BILL:
                prefix = "BIL"
            else:
                prefix = "CHL" # For Challan
            
            voucher_in.voucher_number = await IDGenerator.generate_transaction_id(prefix, TradeVoucher)
        
        # --- RECALCULATE TOTALS ---
        calculated_total = 0.0
        calculated_tax = 0.0
        
        for item in voucher_in.items:
            item_amount = round(item.quantity * item.rate, 2)
            item.amount = item_amount
            calculated_total += item_amount
            item_tax = round(item_amount * item.tax_rate / 100.0, 2)
            calculated_tax += item_tax
            
        voucher_in.total_amount = round(calculated_total, 2)
        voucher_in.tax_amount = round(calculated_tax, 2)
        voucher_in.grand_total = round(calculated_total + calculated_tax, 2)
        
        # 1. Save Voucher
        voucher = await VoucherRepository.create(voucher_in)
        
        # 2. Impact only if NOT draft
        if voucher.status != VoucherStatus.DRAFT:
            await VoucherService._apply_voucher_impact(voucher)
        
        return VoucherResponse.model_validate(voucher)

    @staticmethod
    async def update_voucher(voucher_id: int, voucher_update: VoucherUpdate) -> VoucherResponse:
        # 1. Fetch current voucher to check status transition
        async with SessionLocal() as db:
            result = await db.execute(
                select(TradeVoucher)
                .options(selectinload(TradeVoucher.items))
                .where(TradeVoucher.id == voucher_id)
            )
            old_voucher = result.scalar_one_or_none()
            if not old_voucher:
                raise HTTPException(status_code=404, detail="Voucher not found")
        
        updated_voucher = await VoucherRepository.update(
            voucher_id, 
            status=voucher_update.status, 
            notes=voucher_update.notes,
            approved_by_id=voucher_update.approved_by_id
        )
        
        # 3. Apply Impact
        if old_voucher.status == VoucherStatus.DRAFT and updated_voucher.status != VoucherStatus.DRAFT:
            # IMPORTANT: Re-calculate totals if they are 0
            if updated_voucher.grand_total == 0:
                calc_total = sum(round(i.quantity * i.rate, 2) for i in updated_voucher.items)
                calc_tax = sum(round((round(i.quantity * i.rate, 2) * i.tax_rate / 100.0), 2) for i in updated_voucher.items)
                updated_voucher.total_amount = round(calc_total, 2)
                updated_voucher.tax_amount = round(calc_tax, 2)
                updated_voucher.grand_total = round(calc_total + calc_tax, 2)
                async with SessionLocal() as db:
                    await db.execute(
                        update(TradeVoucher)
                        .where(TradeVoucher.id == voucher_id)
                        .values(
                            total_amount=updated_voucher.total_amount,
                            tax_amount=updated_voucher.tax_amount,
                            grand_total=updated_voucher.grand_total
                        )
                    )
                    await db.commit()

            await VoucherService._apply_voucher_impact(updated_voucher)
            
        return VoucherResponse.model_validate(updated_voucher)

    @staticmethod
    async def _apply_voucher_impact(voucher: TradeVoucher):
        """
        Apply financial (ledger) and inventory (stock) updates.
        """
        # 1. Financial Impact
        if voucher.voucher_type == VoucherType.INVOICE:
            await TransactionService.create_transaction(TransactionCreate(
                party_id=voucher.party_id,
                voucher_id=voucher.id,
                transaction_type=TransactionType.SALE,
                payment_mode=PaymentMode.CREDIT,
                amount=voucher.grand_total,
                description=f"Invoice {voucher.voucher_number}"
            ))
        elif voucher.voucher_type == VoucherType.BILL:
            await TransactionService.create_transaction(TransactionCreate(
                party_id=voucher.party_id,
                voucher_id=voucher.id,
                transaction_type=TransactionType.PURCHASE,
                payment_mode=PaymentMode.CREDIT,
                amount=voucher.grand_total,
                description=f"Purchase Bill {voucher.voucher_number}"
            ))

        # 2. Inventory Impact
        for item in voucher.items:
            if voucher.voucher_type in [VoucherType.INVOICE, VoucherType.CHALLAN]:
                await InventoryRepository.update_stock(item.item_id, -item.quantity)
            elif voucher.voucher_type == VoucherType.BILL:
                await InventoryRepository.update_stock(item.item_id, item.quantity)
        
        logger.info(f"Applied impact for Voucher {voucher.voucher_number} (Status: {voucher.status})")

        # 3. Email Notification (for Invoice, Challan, and Quotation)
        if voucher.voucher_type in [VoucherType.INVOICE, VoucherType.CHALLAN, VoucherType.QUOTATION]:
            # Fetch party for email address
            party = await PartyRepository.get_by_id(voucher.party_id)
            if party and party.email:
                # Send email in background to not block the response
                asyncio.create_task(VoucherEmailService.send_voucher_email(voucher, party, voucher.approved_by_name))
                logger.info(f"Background email task created for {party.email}")

    @staticmethod
    async def get_voucher(voucher_id: int) -> VoucherResponse:
        voucher = await VoucherRepository.get_by_id(voucher_id)
        if not voucher:
            raise HTTPException(status_code=404, detail="Voucher not found")
        return VoucherResponse.model_validate(voucher)

    @staticmethod
    async def get_all_vouchers(skip: int, limit: int, voucher_type: Optional[VoucherType]):
        vouchers = await VoucherRepository.get_all(skip, limit, voucher_type)
        return [VoucherResponse.model_validate(v) for v in vouchers]
