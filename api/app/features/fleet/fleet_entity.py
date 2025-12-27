import enum
from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Date, func, Enum, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class VehicleType(str, enum.Enum):
    TRUCK = "truck"
    TANKER = "tanker"
    TRAILER = "trailer"
    OTHER = "other"

class VehicleStatus(str, enum.Enum):
    AVAILABLE = "available"
    ON_TRIP = "on_trip"
    MAINTENANCE = "maintenance"
    INACTIVE = "inactive"

class DriverStatus(str, enum.Enum):
    ACTIVE = "active"
    ON_TRIP = "on_trip"
    LEAVE = "leave"
    INACTIVE = "inactive"

class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    vehicle_number: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    vehicle_type: Mapped[VehicleType] = mapped_column(Enum(VehicleType), default=VehicleType.TRUCK)
    capacity_ton: Mapped[float] = mapped_column(Float, default=0.0)
    owner_name: Mapped[Optional[str]] = mapped_column(String(100))
    is_owned: Mapped[bool] = mapped_column(Boolean, default=True)
    
    rc_expiry: Mapped[Optional[date]] = mapped_column(Date)
    insurance_expiry: Mapped[Optional[date]] = mapped_column(Date)
    fitness_expiry: Mapped[Optional[date]] = mapped_column(Date)
    permit_expiry: Mapped[Optional[date]] = mapped_column(Date)
    
    current_status: Mapped[VehicleStatus] = mapped_column(Enum(VehicleStatus), default=VehicleStatus.AVAILABLE)
    notes: Mapped[Optional[str]] = mapped_column(String(500))
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

class Driver(Base):
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(String(255))
    license_number: Mapped[Optional[str]] = mapped_column(String(50))
    license_expiry: Mapped[Optional[date]] = mapped_column(Date)
    joining_date: Mapped[date] = mapped_column(Date, server_default=func.current_date())
    
    status: Mapped[DriverStatus] = mapped_column(Enum(DriverStatus), default=DriverStatus.ACTIVE)
    notes: Mapped[Optional[str]] = mapped_column(String(500))
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
