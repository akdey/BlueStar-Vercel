from pydantic import BaseModel, EmailStr, HttpUrl, Field, ConfigDict
from datetime import datetime
from typing import Optional
from app.features.parties.party_entity import PartyType, PartyStatus

class PartyBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    party_type: PartyType
    
    # Optional fields with basic validation
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, pattern=r"^\d{10}$")
    mobile: Optional[str] = Field(None, pattern=r"^\d{10}$")
    whatsapp: Optional[str] = None
    
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    pincode: Optional[str] = None
    
    gstin: Optional[str] = Field(None, max_length=20, pattern=r"^[0-9A-Z]{15}$") # Basic GST format check
    pan_no: Optional[str] = Field(None, max_length=10) # Basic PAN check could be added
    
    credit_limit: float = 0.0
    payment_terms_days: int = 0
    
    status: PartyStatus = PartyStatus.ACTIVE
    notes: Optional[str] = None
    website: Optional[str] = None

class PartyCreate(PartyBase):
    code: Optional[str] = Field(None, max_length=50) # Auto-generated if None or empty
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Acme Traders Pvt Ltd",
                "code": "CUST-001",
                "party_type": "customer",
                "email": "contact@acme.com",
                "phone": "+919876543210",
                "city": "Mumbai",
                "gstin": "27ABCDE1234F1Z5",
                "credit_limit": 50000.0,
                "payment_terms_days": 30
            }
        }

class PartyUpdate(BaseModel):
    name: Optional[str] = None
    party_type: Optional[PartyType] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, pattern=r"^\d{10}$")
    mobile: Optional[str] = Field(None, pattern=r"^\d{10}$")
    whatsapp: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    gstin: Optional[str] = None
    pan_no: Optional[str] = None
    credit_limit: Optional[float] = None
    payment_terms_days: Optional[int] = None
    status: Optional[PartyStatus] = None
    notes: Optional[str] = None
    website: Optional[str] = None
    current_balance: Optional[float] = None

class PartyResponse(PartyBase):
    id: int
    code: str
    current_balance: float
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
