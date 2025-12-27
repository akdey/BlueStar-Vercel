from fastapi import APIRouter, status, Query
from fastapi.responses import JSONResponse
from typing import Optional
from app.features.documents.document_schema import DocumentCreate, DocumentUpdate, DocumentType
from app.features.documents.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents (Challans & Invoices)"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_document(doc_in: DocumentCreate):
    """
    Create a new Document (Challan, Invoice, Quotation).
    Includes line items.
    """
    doc = await DocumentService.create_document(doc_in)
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "success": True, 
            "message": f"{doc.doc_type.value.capitalize()} created successfully", 
            "data": doc.model_dump(mode='json')
        }
    )

@router.patch("/{doc_id}")
async def update_document(doc_id: int, doc_update: DocumentUpdate):
    """
    Update document status (e.g., move from 'draft' to 'issued').
    Transitioning out of 'draft' triggers financial and inventory updates.
    """
    doc = await DocumentService.update_document(doc_id, doc_update)
    return JSONResponse(
        content={
            "success": True, 
            "message": "Document updated", 
            "data": doc.model_dump(mode='json')
        }
    )

@router.get("/")
async def get_documents(
    skip: int = 0, 
    limit: int = 100, 
    type: Optional[DocumentType] = None
):
    """List all documents."""
    docs = await DocumentService.get_all_documents(skip, limit, type)
    return JSONResponse(
        content={
            "success": True,
            "message": f"Retrieved {len(docs)} documents",
            "data": [d.model_dump(mode='json') for d in docs],
            "pagination": {"skip": skip, "limit": limit, "count": len(docs)}
        }
    )

@router.get("/{doc_id}")
async def get_document_detail(doc_id: int):
    doc = await DocumentService.get_document(doc_id)
    return JSONResponse(
        content={
            "success": True, 
            "message": "Document retrieved", 
            "data": doc.model_dump(mode='json')
        }
    )
