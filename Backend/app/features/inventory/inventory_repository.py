from typing import Optional, Sequence, List
from sqlalchemy import select, delete, update
from app.core.database import SessionLocal
from app.features.inventory.inventory_entity import Item, CustomerItemRate, ItemType
from app.features.inventory.inventory_schema import ItemCreate, ItemUpdate, PriceOverrideCreate
from app.core.logger import logger

class InventoryRepository:
    # --- Item Operations ---
    @staticmethod
    async def create_item(item_in: ItemCreate) -> Item:
        async with SessionLocal() as db:
            try:
                db_item = Item(**item_in.model_dump())
                db.add(db_item)
                await db.commit()
                await db.refresh(db_item)
                logger.info(f"Item created: {db_item.name} ({db_item.code})")
                return db_item
            except Exception as e:
                logger.error(f"Error creating item: {str(e)}")
                await db.rollback()
                raise

    @staticmethod
    async def get_item_by_code(code: str) -> Optional[Item]:
        async with SessionLocal() as db:
            result = await db.execute(select(Item).where(Item.code == code))
            return result.scalar_one_or_none()

    @staticmethod
    async def get_item_by_id(item_id: int) -> Optional[Item]:
        async with SessionLocal() as db:
            result = await db.execute(select(Item).where(Item.id == item_id))
            return result.scalar_one_or_none()

    @staticmethod
    async def get_all_items(skip: int = 0, limit: int = 100, item_type: Optional[ItemType] = None, search: Optional[str] = None) -> Sequence[Item]:
        async with SessionLocal() as db:
            query = select(Item)
            if item_type:
                query = query.where(Item.item_type == item_type)
            if search:
                query = query.where(Item.name.ilike(f"%{search}%"))
            
            result = await db.execute(query.offset(skip).limit(limit).order_by(Item.name))
            return result.scalars().all()
    
    @staticmethod
    async def update_item(item_id: int, item_in: ItemUpdate) -> Optional[Item]:
        async with SessionLocal() as db:
            try:
                result = await db.execute(select(Item).where(Item.id == item_id))
                db_item = result.scalar_one_or_none()
                if not db_item:
                    return None
                
                update_data = item_in.model_dump(exclude_unset=True)
                for field, value in update_data.items():
                    setattr(db_item, field, value)
                
                await db.commit()
                await db.refresh(db_item)
                return db_item
            except Exception as e:
                logger.error(f"Error updating item {item_id}: {str(e)}")
                await db.rollback()
                raise

    # --- Pricing Operations ---
    
    @staticmethod
    async def set_customer_price(price_in: PriceOverrideCreate) -> CustomerItemRate:
        async with SessionLocal() as db:
            try:
                # Check for existing record to define Upsert behavior
                # (PostgreSQL has on_conflict_do_update, but for generic SQLAlch async we can do check-then-act)
                stmt = select(CustomerItemRate).where(
                    CustomerItemRate.item_id == price_in.item_id,
                    CustomerItemRate.party_id == price_in.party_id,
                    CustomerItemRate.location == price_in.location
                )
                result = await db.execute(stmt)
                existing = result.scalar_one_or_none()
                
                if existing:
                    existing.rate = price_in.rate
                    await db.commit()
                    await db.refresh(existing)
                    return existing
                else:
                    new_rate = CustomerItemRate(**price_in.model_dump())
                    db.add(new_rate)
                    await db.commit()
                    await db.refresh(new_rate)
                    return new_rate
            except Exception as e:
                logger.error(f"Error setting price override: {str(e)}")
                await db.rollback()
                raise

    @staticmethod
    async def get_best_price(item_id: int, party_id: int, location: Optional[str] = 'default') -> Optional[float]:
        """
        Fetch customer specific price. Use 'default' location if specific location not found?
        Or exact match only. Let's try exact match first.
        """
        async with SessionLocal() as db:
            stmt = select(CustomerItemRate).where(
                CustomerItemRate.item_id == item_id,
                CustomerItemRate.party_id == party_id,
                CustomerItemRate.location == location
            )
            result = await db.execute(stmt)
            record = result.scalar_one_or_none()
            if record:
                return record.rate
            return None

    @staticmethod
    async def update_stock(item_id: int, quantity: float):
        """
        Update item stock level. Positive quantity increases stock, negative decreases.
        """
        async with SessionLocal() as db:
            try:
                # Use update statement for atomic increment/decrement
                stmt = (
                    update(Item)
                    .where(Item.id == item_id)
                    .values(current_stock=Item.current_stock + quantity)
                )
                await db.execute(stmt)
                await db.commit()
                logger.debug(f"Updated item {item_id} stock by {quantity}")
            except Exception as e:
                logger.error(f"Error updating stock for item {item_id}: {str(e)}")
                await db.rollback()
                raise
