from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from app.features.transactions.transaction_entity import TransactionType, PaymentMode, TransactionStatus

class TransactionBase(BaseModel):
    party_id: Optional[int] = None
    document_id: Optional[int] = None
    transaction_type: TransactionType
    payment_mode: PaymentMode = PaymentMode.CASH
    amount: float = Field(..., gt=0)
    
    reference_number: Optional[str] = None
    description: Optional[str] = None
    description_internal: Optional[str] = None
    transaction_date: Optional[datetime] = None
    status: TransactionStatus = TransactionStatus.COMPLETED

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime
    created_by: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)
