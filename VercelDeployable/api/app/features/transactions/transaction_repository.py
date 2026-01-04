from typing import Optional, Sequence
from sqlalchemy import select
from app.core.database import SessionLocal
from app.features.transactions.transaction_entity import Transaction, TransactionType
from app.features.transactions.transaction_schema import TransactionCreate
from app.core.logger import logger
from datetime import datetime

class TransactionRepository:
    @staticmethod
    async def create(transaction_in: TransactionCreate, created_by: Optional[int] = None) -> Transaction:
        async with SessionLocal() as db:
            try:
                db_txn = Transaction(
                    **transaction_in.model_dump(),
                    created_by=created_by
                )
                if not db_txn.transaction_date:
                    db_txn.transaction_date = datetime.now()
                
                db.add(db_txn)
                await db.commit()
                await db.refresh(db_txn)
                logger.info(f"Transaction created: {db_txn.transaction_type} of {db_txn.amount} (ID: {db_txn.id})")
                return db_txn
            except Exception as e:
                logger.error(f"Error creating transaction: {str(e)}")
                await db.rollback()
                raise

    @staticmethod
    async def get_by_party(party_id: int, skip: int = 0, limit: int = 100) -> Sequence[Transaction]:
        async with SessionLocal() as db:
            result = await db.execute(
                select(Transaction)
                .where(Transaction.party_id == party_id)
                .order_by(Transaction.transaction_date.desc())
                .offset(skip).limit(limit)
            )
            return result.scalars().all()

    @staticmethod
    async def get_all(skip: int = 0, limit: int = 100) -> Sequence[Transaction]:
        async with SessionLocal() as db:
            result = await db.execute(select(Transaction).order_by(Transaction.transaction_date.desc()).offset(skip).limit(limit))
            return result.scalars().all()

    @staticmethod
    async def get_by_id(txn_id: int) -> Optional[Transaction]:
        async with SessionLocal() as db:
            result = await db.execute(select(Transaction).where(Transaction.id == txn_id))
            return result.scalar_one_or_none()
