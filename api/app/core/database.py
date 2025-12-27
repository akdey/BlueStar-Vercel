from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL)

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    pass

async def init_db():
    async with engine.begin() as conn:
        # Import all entities here so they are registered with Base.metadata
        from app.features.users.user_entity import User
        from app.features.parties.party_entity import Party
        from app.features.transactions.transaction_entity import Transaction
        from app.features.inventory.inventory_entity import Item, CustomerItemRate
        from app.features.documents.document_entity import TradeDocument, DocumentItem
        from app.features.fleet.fleet_entity import Vehicle, Driver
        from app.features.trips.trip_entity import Trip, TripExpense
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
