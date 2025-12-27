import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, func, Enum, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class TripStatus(str, enum.Enum):
    PLANNED = "planned"
    IN_TRANSIT = "in_transit"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TripType(str, enum.Enum):
    OWN_FLEET = "own_fleet"
    MARKET_TRUCK = "market_truck"

class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    trip_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    
    start_date: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    source_location: Mapped[str] = mapped_column(String(100))
    destination_location: Mapped[str] = mapped_column(String(100))
    
    # Direct Delivery Support (linking back to parties)
    supplier_party_id: Mapped[Optional[int]] = mapped_column(ForeignKey("parties.id"))
    customer_party_id: Mapped[Optional[int]] = mapped_column(ForeignKey("parties.id"))
    
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.id"), nullable=False)
    
    start_km: Mapped[Optional[float]] = mapped_column(Float)
    end_km: Mapped[Optional[float]] = mapped_column(Float)
    
    # Financials
    freight_income: Mapped[float] = mapped_column(Float, default=0.0)
    market_truck_cost: Mapped[float] = mapped_column(Float, default=0.0)
    driver_allowance: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Expenses Aggregated
    diesel_expense: Mapped[float] = mapped_column(Float, default=0.0)
    toll_expense: Mapped[float] = mapped_column(Float, default=0.0)
    other_expense: Mapped[float] = mapped_column(Float, default=0.0)
    
    status: Mapped[TripStatus] = mapped_column(Enum(TripStatus), default=TripStatus.PLANNED)
    notes: Mapped[Optional[str]] = mapped_column(String(500))
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    expenses: Mapped[list["TripExpense"]] = relationship("TripExpense", back_populates="trip", cascade="all, delete-orphan")

class TripExpense(Base):
    __tablename__ = "trip_expenses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=False)
    
    expense_type: Mapped[str] = mapped_column(String(50)) # "Diesel", "Toll", "Driver Allowance"
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    date: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationship
    trip: Mapped["Trip"] = relationship("Trip", back_populates="expenses")
