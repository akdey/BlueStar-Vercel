from fastapi import APIRouter, status, Query, Depends, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
from app.features.documents.document_schema import DocumentCreate, DocumentUpdate, DocumentType
from app.features.documents.document_service import DocumentService
from app.features.documents.document_entity import DocumentStatus
from app.features.users.user_entity import User, UserRole
from app.features.auth.auth_dependencies import get_current_active_user
from app.features.notifications.notification_service import NotificationService
from app.features.notifications.notification_schema import NotificationCreate
from app.core.telegram_utils import send_telegram_notification_background

router = APIRouter(prefix="/documents", tags=["Documents (Challans & Invoices)"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_document(
    doc_in: DocumentCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new Document (Challan, Invoice, Quotation).
    Includes line items.
    """
    # Enforce Draft on creation for non-admins? Or just allow "create" which usually implies Draft.
    # We will just track who created it.
    
    doc = await DocumentService.create_document(doc_in)
    
    # Notification Logic
    msg = f"New {doc.doc_type.value} draft {doc.doc_number} created by {current_user.username}"
    
    # 1. Internal Notification (to Admins or everyone? "to user" -> usually admins should know, or the user themselves?)
    # "When a new doc is draft, we can send a notification to user." -> Maybe back to the creator? Or to Approver?
    # Assuming valid workflow: Creator creates -> Admin gets notified.
    # So we send to Admins (user_id=None for global or filter). Let's make it Global/Admin for now (user_id=None).
    await NotificationService.create_notification(NotificationCreate(
        title="New Draft Document",
        message=msg,
        type="document_draft",
        user_id=None # Broadcast to admins/dashboard
    ))

    # 2. Telegram Notification (To all Admins)
    from app.features.users.user_repository import UserRepository
    admin_chat_ids = await UserRepository.get_admins_with_telegram()
    
    send_telegram_notification_background(
        f"📄 *New Draft Created*\n\nType: {doc.doc_type.value}\nNumber: `{doc.doc_number}`\nUser: {current_user.username}",
        chat_ids=admin_chat_ids
    )

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "success": True, 
            "message": f"{doc.doc_type.value.capitalize()} created successfully", 
            "data": doc.model_dump(mode='json')
        }
    )

@router.patch("/{doc_id}")
async def update_document(
    doc_id: int, 
    doc_update: DocumentUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update document status (e.g., move from 'draft' to 'issued').
    Transitioning out of 'draft' triggers financial and inventory updates.
    RBAC: Only ADMIN can change status to ISSUED/CONFIRMED.
    """
    # Check if status is being updated to something strictly "Draft -> Issued"
    # Actually, if any status change happens that is NOT Draft, we should check admin.
    if doc_update.status is not None and doc_update.status != DocumentStatus.DRAFT:
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Only Administrators can issue or finalize documents."
            )

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
