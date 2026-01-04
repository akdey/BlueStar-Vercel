import random
import string
from sqlalchemy import select, func
from app.core.database import SessionLocal

class IDGenerator:


    @staticmethod
    async def generate_transaction_id(prefix: str, entity_class, date_field="created_at") -> str:
        """
        Generates a smart ID like T-20240130-001.
        Reset counts daily using the `date_field` column.
        """
        from datetime import datetime
        from sqlalchemy import cast, Date
        
        today = datetime.now().date()
        date_str = today.strftime("%Y%m%d")
        
        async with SessionLocal() as db:
            # Count records created TODAY
            # We assume the entity has a field named by `date_field` (default: created_at)
            column = getattr(entity_class, date_field)
            
            query = (
                select(func.count())
                .select_from(entity_class)
                .where(cast(column, Date) == today)
            )
            result = await db.execute(query)
            count = result.scalar()
            
            # Sequence is count + 1
            sequence = str(count + 1).zfill(3)
            
            return f"{prefix}-{date_str}-{sequence}"
