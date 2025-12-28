from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime
from typing import Optional, List
from app.features.vouchers.voucher_entity import VoucherType, VoucherStatus

class VoucherItemBase(BaseModel):
    item_id: int
    quantity: float = Field(..., gt=0)
    rate: float = Field(..., ge=0)
    tax_rate: float = 0.0
    amount: float = 0.0
    description: Optional[str] = None

class VoucherItemCreate(VoucherItemBase):
    pass

class VoucherItemResponse(VoucherItemBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class VoucherBase(BaseModel):
    voucher_number: Optional[str] = Field(None)
    voucher_type: VoucherType = VoucherType.CHALLAN
    voucher_date: date
    party_id: int
    
    vehicle_number: Optional[str] = None
    driver_name: Optional[str] = None
    place_of_supply: Optional[str] = None
    
    total_amount: float = 0.0
    tax_amount: float = 0.0
    grand_total: float = 0.0
    
    status: VoucherStatus = VoucherStatus.DRAFT
    notes: Optional[str] = None

class VoucherCreate(VoucherBase):
    items: List[VoucherItemCreate]

class VoucherUpdate(BaseModel):
    status: Optional[VoucherStatus] = None
    notes: Optional[str] = None

class VoucherResponse(VoucherBase):
    id: int
    created_at: datetime
    updated_at: datetime
    items: List[VoucherItemResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
