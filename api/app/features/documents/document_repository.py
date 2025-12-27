from typing import Optional, Sequence
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import SessionLocal
from app.features.documents.document_entity import TradeDocument, DocumentItem, DocumentType
from app.features.documents.document_schema import DocumentCreate
from app.core.logger import logger

class DocumentRepository:
    @staticmethod
    async def create(doc_in: DocumentCreate) -> TradeDocument:
        async with SessionLocal() as db:
            try:
                # Create Header
                db_doc = TradeDocument(
                    doc_number=doc_in.doc_number,
                    doc_type=doc_in.doc_type,
                    doc_date=doc_in.doc_date,
                    party_id=doc_in.party_id,
                    vehicle_number=doc_in.vehicle_number,
                    driver_name=doc_in.driver_name,
                    place_of_supply=doc_in.place_of_supply,
                    total_amount=doc_in.total_amount,
                    tax_amount=doc_in.tax_amount,
                    grand_total=doc_in.grand_total,
                    status=doc_in.status,
                    notes=doc_in.notes
                )
                db.add(db_doc)
                await db.flush() # Get ID
                
                # Create Items
                for item_in in doc_in.items:
                    db_item = DocumentItem(
                        document_id=db_doc.id,
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
                    select(TradeDocument)
                    .options(selectinload(TradeDocument.items))
                    .where(TradeDocument.id == db_doc.id)
                )
                return result.scalar_one()
            except Exception as e:
                logger.error(f"Error creating document {doc_in.doc_number}: {str(e)}")
                await db.rollback()
                raise

    @staticmethod
    async def get_by_id(doc_id: int) -> Optional[TradeDocument]:
        async with SessionLocal() as db:
            result = await db.execute(
                select(TradeDocument)
                .options(selectinload(TradeDocument.items))
                .where(TradeDocument.id == doc_id)
            )
            return result.scalar_one_or_none()

    @staticmethod
    async def get_all(skip: int = 0, limit: int = 100, doc_type: Optional[DocumentType] = None) -> Sequence[TradeDocument]:
        async with SessionLocal() as db:
             query = select(TradeDocument).options(selectinload(TradeDocument.items)).order_by(TradeDocument.created_at.desc()).offset(skip).limit(limit)
             if doc_type:
                 query = query.where(TradeDocument.doc_type == doc_type)
             
             # Don't load items for list view for performance, or maybe yes?
             # Let's not load items in list view to be fast.
             result = await db.execute(query)
             return result.scalars().all()

    @staticmethod
    async def update(doc_id: int, status: Optional[str] = None, notes: Optional[str] = None) -> Optional[TradeDocument]:
        async with SessionLocal() as db:
            result = await db.execute(
                select(TradeDocument)
                .options(selectinload(TradeDocument.items))
                .where(TradeDocument.id == doc_id)
            )
            db_doc = result.scalar_one_or_none()
            if not db_doc:
                return None
            
            if status:
                db_doc.status = status
            if notes:
                db_doc.notes = notes
                
            await db.commit()
            
            # Re-fetch with items to avoid DetachedInstanceError when accessed outside session
            final_result = await db.execute(
                select(TradeDocument)
                .options(selectinload(TradeDocument.items))
                .where(TradeDocument.id == doc_id)
            )
            return final_result.scalar_one()
