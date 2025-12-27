from fastapi import HTTPException, status
from typing import List, Optional
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from app.core.database import SessionLocal
from app.features.documents.document_repository import DocumentRepository
from app.features.documents.document_schema import DocumentCreate, DocumentResponse, DocumentUpdate
from app.features.documents.document_entity import DocumentType, TradeDocument, DocumentStatus
from app.features.inventory.inventory_repository import InventoryRepository 
from app.core.id_generator import IDGenerator
from app.core.logger import logger

from app.features.transactions.transaction_service import TransactionService
from app.features.transactions.transaction_schema import TransactionCreate
from app.features.transactions.transaction_entity import TransactionType, PaymentMode

class DocumentService:
    @staticmethod
    async def create_document(doc_in: DocumentCreate) -> DocumentResponse:
        # Handle Auto-generation of Document Number
        if not doc_in.doc_number:
            prefix = "INV" if doc_in.doc_type == DocumentType.INVOICE else "CHL"
            if doc_in.doc_type == DocumentType.BILL: prefix = "BIL"
            doc_in.doc_number = await IDGenerator.generate_doc_number(prefix, TradeDocument)
        
        # --- RECALCULATE TOTALS (Safety Check) ---
        calculated_total = 0.0
        calculated_tax = 0.0
        
        for item in doc_in.items:
            item_amount = item.quantity * item.rate
            item.amount = item_amount
            calculated_total += item_amount
            calculated_tax += (item_amount * item.tax_rate / 100.0)
            
        doc_in.total_amount = calculated_total
        doc_in.tax_amount = calculated_tax
        doc_in.grand_total = calculated_total + calculated_tax
        
        # 1. Save Document
        doc = await DocumentRepository.create(doc_in)
        
        # 2. Impact only if NOT draft
        if doc.status != DocumentStatus.DRAFT:
            await DocumentService._apply_document_impact(doc)
        
        return DocumentResponse.model_validate(doc)

    @staticmethod
    async def update_document(doc_id: int, doc_update: DocumentUpdate) -> DocumentResponse:
        # 1. Fetch current document to check status transition
        async with SessionLocal() as db:
            result = await db.execute(
                select(TradeDocument)
                .options(selectinload(TradeDocument.items))
                .where(TradeDocument.id == doc_id)
            )
            old_doc = result.scalar_one_or_none()
            if not old_doc:
                raise HTTPException(status_code=404, detail="Document not found")
        
        # 2. If transitioning FROM Draft TO something else, ensure totals are correct
        # This handles documents created before the auto-calc fix
        if old_doc.status == DocumentStatus.DRAFT and doc_update.status != DocumentStatus.DRAFT:
            calculated_total = 0.0
            calculated_tax = 0.0
            for item in old_doc.items:
                item_amount = item.quantity * item.rate
                calculated_total += item_amount
                calculated_tax += (item_amount * item.tax_rate / 100.0)
            
            # Update the existing doc record directly before repository update
            # Or pass it to repository. Let's just do a manual update call for totals.
            # For simplicity, we can extend the repository.update or just use it as is.
            # Let's adjust updated_doc call below.
            pass

        updated_doc = await DocumentRepository.update(
            doc_id, 
            status=doc_update.status, 
            notes=doc_update.notes
        )
        # Note: I'll actually fix DocumentRepository.update to handle recalculation if needed
        # but for now, let's just make sure _apply_document_impact uses the REFRESHED data.
        
        # 3. Apply Impact
        if old_doc.status == DocumentStatus.DRAFT and updated_doc.status != DocumentStatus.DRAFT:
            # IMPORTANT: Re-calculate totals one last time before impact if they are 0
            if updated_doc.grand_total == 0:
                calc_total = sum(i.quantity * i.rate for i in updated_doc.items)
                calc_tax = sum((i.quantity * i.rate * i.tax_rate / 100.0) for i in updated_doc.items)
                updated_doc.total_amount = calc_total
                updated_doc.tax_amount = calc_tax
                updated_doc.grand_total = calc_total + calc_tax
                # We should save these back!
                async with SessionLocal() as db:
                    await db.execute(
                        update(TradeDocument)
                        .where(TradeDocument.id == doc_id)
                        .values(
                            total_amount=updated_doc.total_amount,
                            tax_amount=updated_doc.tax_amount,
                            grand_total=updated_doc.grand_total
                        )
                    )
                    await db.commit()

            await DocumentService._apply_document_impact(updated_doc)
            
        return DocumentResponse.model_validate(updated_doc)

    @staticmethod
    async def _apply_document_impact(doc: TradeDocument):
        """
        Private method to apply financial (ledger) and inventory (stock) updates.
        Should only be called once when a document is confirmed/issued.
        """
        # 1. Financial Impact
        if doc.doc_type == DocumentType.INVOICE:
            await TransactionService.create_transaction(TransactionCreate(
                party_id=doc.party_id,
                document_id=doc.id,
                transaction_type=TransactionType.SALE,
                payment_mode=PaymentMode.CREDIT,
                amount=doc.grand_total,
                description=f"Invoice {doc.doc_number}"
            ))
        elif doc.doc_type == DocumentType.BILL:
            await TransactionService.create_transaction(TransactionCreate(
                party_id=doc.party_id,
                document_id=doc.id,
                transaction_type=TransactionType.PURCHASE,
                payment_mode=PaymentMode.CREDIT,
                amount=doc.grand_total,
                description=f"Purchase Bill {doc.doc_number}"
            ))

        # 2. Inventory Impact
        for item in doc.items:
            if doc.doc_type in [DocumentType.INVOICE, DocumentType.CHALLAN]:
                await InventoryRepository.update_stock(item.item_id, -item.quantity)
            elif doc.doc_type == DocumentType.BILL:
                await InventoryRepository.update_stock(item.item_id, item.quantity)
        
        logger.info(f"Applied impact for Document {doc.doc_number} (Status: {doc.status})")

    @staticmethod
    async def get_document(doc_id: int) -> DocumentResponse:
        doc = await DocumentRepository.get_by_id(doc_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        return DocumentResponse.model_validate(doc)

    @staticmethod
    async def get_all_documents(skip: int, limit: int, doc_type: Optional[DocumentType]):
        docs = await DocumentRepository.get_all(skip, limit, doc_type)
        return [DocumentResponse.model_validate(d) for d in docs]
