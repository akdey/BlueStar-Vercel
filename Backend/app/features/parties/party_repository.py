from typing import Optional, List, Sequence
from sqlalchemy import select, update, delete, or_
from app.core.database import SessionLocal
from app.features.parties.party_entity import Party, PartyType
from app.features.parties.party_schema import PartyCreate, PartyUpdate
from app.core.logger import logger

class PartyRepository:
    @staticmethod
    async def create(party_in: PartyCreate) -> Party:
        async with SessionLocal() as db:
            try:
                db_party = Party(**party_in.model_dump())
                db.add(db_party)
                await db.commit()
                await db.refresh(db_party)
                logger.info(f"Party created: {db_party.name} ({db_party.code})")
                return db_party
            except Exception as e:
                logger.error(f"Error creating party {party_in.code}: {str(e)}")
                await db.rollback()
                raise

    @staticmethod
    async def get_by_id(party_id: int) -> Optional[Party]:
        async with SessionLocal() as db:
            result = await db.execute(select(Party).where(Party.id == party_id))
            return result.scalar_one_or_none()

    @staticmethod
    async def get_by_code(code: str) -> Optional[Party]:
        async with SessionLocal() as db:
            result = await db.execute(select(Party).where(Party.code == code))
            return result.scalar_one_or_none()

    @staticmethod
    async def get_all(skip: int = 0, limit: int = 100, party_type: Optional[PartyType] = None, search: Optional[str] = None) -> Sequence[Party]:
        async with SessionLocal() as db:
            query = select(Party)
            
            if party_type:
                # If asking for 'both', do we return only 'both' type? Or customers+suppliers? 
                # Usually 'Both' is a specific enum Type. If user wants all customers, they might want 'Customer' AND 'Both'.
                # Let's keep it simple: Exact match for now.
                query = query.where(Party.party_type == party_type)
            
            if search:
                # Case insensitive search on name, code, or phone
                search_term = f"%{search}%"
                query = query.where(
                    or_(
                        Party.name.ilike(search_term),
                        Party.code.ilike(search_term),
                        Party.phone.ilike(search_term)
                    )
                )
            
            query = query.offset(skip).limit(limit).order_by(Party.name)
            result = await db.execute(query)
            return result.scalars().all()

    @staticmethod
    async def update(party_id: int, party_in: PartyUpdate) -> Optional[Party]:
        async with SessionLocal() as db:
            try:
                result = await db.execute(select(Party).where(Party.id == party_id))
                db_party = result.scalar_one_or_none()
                if not db_party:
                    return None
                
                update_data = party_in.model_dump(exclude_unset=True)
                for field, value in update_data.items():
                    setattr(db_party, field, value)
                
                await db.commit()
                await db.refresh(db_party)
                logger.info(f"Party updated: {db_party.name} (ID: {party_id})")
                return db_party
            except Exception as e:
                logger.error(f"Error updating party {party_id}: {str(e)}")
                await db.rollback()
                raise

    @staticmethod
    async def delete(party_id: int) -> bool:
        async with SessionLocal() as db:
            try:
                result = await db.execute(delete(Party).where(Party.id == party_id))
                await db.commit()
                return result.rowcount > 0
            except Exception as e:
                logger.error(f"Error deleting party {party_id}: {str(e)}")
                await db.rollback()
                raise
