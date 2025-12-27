import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, func, Enum, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class ItemType(str, enum.Enum):
    GOODS = "goods"
    SERVICE = "service"

class ItemCategory(str, enum.Enum):
    CEMENT = "cement"
    DIESEL = "diesel"
    TRANSPORT = "transport"
    OTHER = "other"

class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    item_type: Mapped[ItemType] = mapped_column(Enum(ItemType), default=ItemType.GOODS)
    category: Mapped[ItemCategory] = mapped_column(Enum(ItemCategory), default=ItemCategory.OTHER)
    
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    hsn_code: Mapped[Optional[str]] = mapped_column(String(20))
    tax_rate: Mapped[float] = mapped_column(Float, default=0.0)
    base_price: Mapped[float] = mapped_column(Float, default=0.0)
    
    current_stock: Mapped[float] = mapped_column(Float, default=0.0)
    min_stock_level: Mapped[float] = mapped_column(Float, default=0.0)
    
    description: Mapped[Optional[str]] = mapped_column(String(500))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

class CustomerItemRate(Base):
    __tablename__ = "customer_item_rates"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"), nullable=False)
    party_id: Mapped[int] = mapped_column(ForeignKey("parties.id"), nullable=False)
    location: Mapped[str] = mapped_column(String(100), default="default")
    rate: Mapped[float] = mapped_column(Float, nullable=False)
    
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
