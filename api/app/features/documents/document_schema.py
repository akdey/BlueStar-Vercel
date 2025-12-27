from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime
from typing import Optional, List
from app.features.documents.document_entity import DocumentType, DocumentStatus

class DocumentItemBase(BaseModel):
    item_id: int
    quantity: float = Field(..., gt=0)
    rate: float = Field(..., ge=0)
    tax_rate: float = 0.0
    amount: float = 0.0 # Can be calculated, but good to receive explicit usually
    description: Optional[str] = None

class DocumentItemCreate(DocumentItemBase):
    pass

class DocumentItemResponse(DocumentItemBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class DocumentBase(BaseModel):
    doc_number: Optional[str] = Field(None) # Auto-generated if None or empty
    doc_type: DocumentType = DocumentType.CHALLAN
    doc_date: date
    party_id: int
    
    vehicle_number: Optional[str] = None
    driver_name: Optional[str] = None
    place_of_supply: Optional[str] = None
    
    total_amount: float = 0.0
    tax_amount: float = 0.0
    grand_total: float = 0.0
    
    status: DocumentStatus = DocumentStatus.DRAFT
    notes: Optional[str] = None

class DocumentCreate(DocumentBase):
    items: List[DocumentItemCreate]

class DocumentUpdate(BaseModel):
    status: Optional[DocumentStatus] = None
    notes: Optional[str] = None
    # Usually we don't allow partial updates of items via a simple PATCH. 
    # Document editing is complex (re-calculating stock).
    # For now, let's allow status updates (like ISSUING a draft).

class DocumentResponse(DocumentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    items: List[DocumentItemResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
