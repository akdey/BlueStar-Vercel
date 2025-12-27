import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, func, Enum, Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class TransactionType(str, enum.Enum):
    SALE = "sale"
    PURCHASE = "purchase"
    PAYMENT_IN = "payment_in"
    PAYMENT_OUT = "payment_out"
    CONTRA = "contra"
    EXPENSE = "expense"

class PaymentMode(str, enum.Enum):
    CASH = "cash"
    BANK_TRANSFER = "bank_transfer"
    CHEQUE = "cheque"
    CREDIT = "credit"
    UPI = "upi"

class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    party_id: Mapped[Optional[int]] = mapped_column(ForeignKey("parties.id"), index=True)
    document_id: Mapped[Optional[int]] = mapped_column(ForeignKey("trade_documents.id"), index=True)
    
    transaction_type: Mapped[TransactionType] = mapped_column(Enum(TransactionType), index=True, nullable=False)
    payment_mode: Mapped[PaymentMode] = mapped_column(Enum(PaymentMode), default=PaymentMode.CASH)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    
    reference_number: Mapped[Optional[str]] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(String(500))
    description_internal: Mapped[Optional[str]] = mapped_column(String(500))
    
    transaction_date: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    status: Mapped[TransactionStatus] = mapped_column(Enum(TransactionStatus), default=TransactionStatus.COMPLETED)
    
    created_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return f"<Transaction {self.transaction_type} {self.amount}>"
