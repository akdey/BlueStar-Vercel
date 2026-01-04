import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, func, Enum, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class PartyType(str, enum.Enum):
    CUSTOMER = "customer"
    SUPPLIER = "supplier"
    BOTH = "both"

class PartyStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    BLOCKED = "blocked"

class Party(Base):
    __tablename__ = "parties"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    party_type: Mapped[PartyType] = mapped_column(Enum(PartyType), nullable=False)
    
    contact_person: Mapped[Optional[str]] = mapped_column(String(100))
    email: Mapped[Optional[str]] = mapped_column(String(100))
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    mobile: Mapped[Optional[str]] = mapped_column(String(20))
    whatsapp: Mapped[Optional[str]] = mapped_column(String(20))
    
    address_line_1: Mapped[Optional[str]] = mapped_column(String(255))
    address_line_2: Mapped[Optional[str]] = mapped_column(String(255))
    city: Mapped[Optional[str]] = mapped_column(String(100))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    country: Mapped[Optional[str]] = mapped_column(String(100), default="India")
    pincode: Mapped[Optional[str]] = mapped_column(String(20))
    
    gstin: Mapped[Optional[str]] = mapped_column(String(20))
    pan_no: Mapped[Optional[str]] = mapped_column(String(20))
    
    credit_limit: Mapped[float] = mapped_column(Float, default=0.0)
    payment_terms_days: Mapped[int] = mapped_column(default=0)
    current_balance: Mapped[float] = mapped_column(Float, default=0.0)
    
    status: Mapped[PartyStatus] = mapped_column(Enum(PartyStatus), default=PartyStatus.ACTIVE)
    notes: Mapped[Optional[str]] = mapped_column(String(500))
    website: Mapped[Optional[str]] = mapped_column(String(255))
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<Party {self.name} ({self.code})>"
