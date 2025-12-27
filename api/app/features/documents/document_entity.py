import enum
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Date, func, Enum, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class DocumentType(str, enum.Enum):
    CHALLAN = "challan"
    INVOICE = "invoice"
    BILL = "bill"
    QUOTATION = "quotation"

class DocumentStatus(str, enum.Enum):
    DRAFT = "draft"
    ISSUED = "issued"
    CANCELLED = "cancelled"

class TradeDocument(Base):
    __tablename__ = "trade_documents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    doc_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    doc_type: Mapped[DocumentType] = mapped_column(Enum(DocumentType), default=DocumentType.CHALLAN)
    doc_date: Mapped[date] = mapped_column(Date, nullable=False)
    
    party_id: Mapped[int] = mapped_column(ForeignKey("parties.id"), nullable=False)
    trip_id: Mapped[Optional[int]] = mapped_column(ForeignKey("trips.id"))
    
    vehicle_number: Mapped[Optional[str]] = mapped_column(String(20))
    driver_name: Mapped[Optional[str]] = mapped_column(String(100))
    place_of_supply: Mapped[Optional[str]] = mapped_column(String(150))
    
    total_amount: Mapped[float] = mapped_column(Float, default=0.0)
    tax_amount: Mapped[float] = mapped_column(Float, default=0.0)
    grand_total: Mapped[float] = mapped_column(Float, default=0.0)
    
    status: Mapped[DocumentStatus] = mapped_column(Enum(DocumentStatus), default=DocumentStatus.DRAFT)
    notes: Mapped[Optional[str]] = mapped_column(String(500))
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationship to items
    items: Mapped[List["DocumentItem"]] = relationship("DocumentItem", back_populates="document", cascade="all, delete-orphan")

class DocumentItem(Base):
    __tablename__ = "document_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("trade_documents.id"), nullable=False)
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"), nullable=False)
    
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    rate: Mapped[float] = mapped_column(Float, nullable=False)
    tax_rate: Mapped[float] = mapped_column(Float, default=0.0)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    
    document: Mapped["TradeDocument"] = relationship("TradeDocument", back_populates="items")
