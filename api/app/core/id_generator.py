import random
import string
from sqlalchemy import select, func
from app.core.database import SessionLocal

class IDGenerator:
    @staticmethod
    async def generate_code(prefix: str, entity_class) -> str:
        """Generates a sequential code like P-001, P-002, etc."""
        async with SessionLocal() as db:
            # Count records to get next number
            query = select(func.count()).select_from(entity_class)
            result = await db.execute(query)
            count = result.scalar()
            
            # Use count + 1 and pad with zeros
            return f"{prefix}-{str(count + 1).zfill(3)}"

    @staticmethod
    async def generate_doc_number(prefix: str, entity_class) -> str:
        """Generates a document number like INV-2023-001."""
        from datetime import datetime
        year = datetime.now().year
        
        async with SessionLocal() as db:
            query = select(func.count()).select_from(entity_class)
            result = await db.execute(query)
            count = result.scalar()
            
            return f"{prefix}-{year}-{str(count + 1).zfill(4)}"
