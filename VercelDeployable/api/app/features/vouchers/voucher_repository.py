from typing import Optional, Sequence
from sqlalchemy import select
from sqlalchemy.orm import selectinload, joinedload
from app.core.database import SessionLocal
from app.features.vouchers.voucher_entity import TradeVoucher, VoucherItem, VoucherType
from app.features.vouchers.voucher_schema import VoucherCreate
from app.core.logger import logger

class VoucherRepository:
    @staticmethod
    async def create(voucher_in: VoucherCreate) -> TradeVoucher:
        async with SessionLocal() as db:
            try:
                # Create Header
                db_voucher = TradeVoucher(
                    voucher_number=voucher_in.voucher_number,
                    voucher_type=voucher_in.voucher_type,
                    voucher_date=voucher_in.voucher_date,
                    party_id=voucher_in.party_id,
                    vehicle_number=voucher_in.vehicle_number,
                    driver_name=voucher_in.driver_name,
                    place_of_supply=voucher_in.place_of_supply,
                    total_amount=voucher_in.total_amount,
                    tax_amount=voucher_in.tax_amount,
                    grand_total=voucher_in.grand_total,
                    status=voucher_in.status,
                    approved_by_id=voucher_in.approved_by_id,
                    notes=voucher_in.notes
                )
                db.add(db_voucher)
                await db.flush() # Get ID
                
                # Create Items
                for item_in in voucher_in.items:
                    db_item = VoucherItem(
                        voucher_id=db_voucher.id,
                        item_id=item_in.item_id,
                        quantity=item_in.quantity,
                        rate=item_in.rate,
                        tax_rate=item_in.tax_rate,
                        amount=item_in.amount,
                        description=item_in.description
                    )
                    db.add(db_item)
                
                await db.commit()
                # Reload with items
                result = await db.execute(
                    select(TradeVoucher)
                    .options(selectinload(TradeVoucher.items), joinedload(TradeVoucher.approver))
                    .where(TradeVoucher.id == db_voucher.id)
                )
                return result.scalar_one()
            except Exception as e:
                logger.error(f"Error creating voucher {voucher_in.voucher_number}: {str(e)}")
                await db.rollback()
                raise

    @staticmethod
    async def get_by_id(voucher_id: int) -> Optional[TradeVoucher]:
        async with SessionLocal() as db:
            result = await db.execute(
                select(TradeVoucher)
                .options(selectinload(TradeVoucher.items), joinedload(TradeVoucher.approver))
                .where(TradeVoucher.id == voucher_id)
            )
            return result.scalar_one_or_none()

    @staticmethod
    async def get_all(skip: int = 0, limit: int = 100, voucher_type: Optional[VoucherType] = None) -> Sequence[TradeVoucher]:
        async with SessionLocal() as db:
             query = select(TradeVoucher).options(selectinload(TradeVoucher.items), joinedload(TradeVoucher.approver)).order_by(TradeVoucher.created_at.desc()).offset(skip).limit(limit)
             if voucher_type:
                 query = query.where(TradeVoucher.voucher_type == voucher_type)
             
             result = await db.execute(query)
             return result.scalars().all()

    @staticmethod
    async def update(voucher_id: int, status: Optional[str] = None, notes: Optional[str] = None, approved_by_id: Optional[int] = None) -> Optional[TradeVoucher]:
        async with SessionLocal() as db:
            result = await db.execute(
                select(TradeVoucher)
                .options(selectinload(TradeVoucher.items))
                .where(TradeVoucher.id == voucher_id)
            )
            db_voucher = result.scalar_one_or_none()
            if not db_voucher:
                return None
            
            if status:
                db_voucher.status = status
            if notes:
                db_voucher.notes = notes
            if approved_by_id:
                db_voucher.approved_by_id = approved_by_id
                
            await db.commit()
            
            # Re-fetch with items and approver
            final_result = await db.execute(
                select(TradeVoucher)
                .options(selectinload(TradeVoucher.items), joinedload(TradeVoucher.approver))
                .where(TradeVoucher.id == voucher_id)
            )
            return final_result.scalar_one()
