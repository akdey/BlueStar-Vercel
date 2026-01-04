from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime
from typing import Optional
from app.features.fleet.fleet_entity import VehicleType, VehicleStatus, DriverStatus

# --- Vehicle ---

class VehicleBase(BaseModel):
    vehicle_number: str = Field(..., min_length=4, max_length=20)
    vehicle_type: VehicleType = VehicleType.TRUCK
    capacity_ton: float = 0.0
    owner_name: Optional[str] = None
    is_owned: bool = True
    
    rc_expiry: Optional[date] = None
    insurance_expiry: Optional[date] = None
    fitness_expiry: Optional[date] = None
    permit_expiry: Optional[date] = None
    
    current_status: VehicleStatus = VehicleStatus.AVAILABLE
    notes: Optional[str] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    vehicle_type: Optional[VehicleType] = None
    capacity_ton: Optional[float] = None
    owner_name: Optional[str] = None
    rc_expiry: Optional[date] = None
    insurance_expiry: Optional[date] = None
    current_status: Optional[VehicleStatus] = None

class VehicleResponse(VehicleBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Driver ---

class DriverBase(BaseModel):
    name: str = Field(..., min_length=2)
    phone: str = Field(..., pattern=r"^\d{10}$")
    address: Optional[str] = None
    license_number: Optional[str] = None
    license_expiry: Optional[date] = None
    status: DriverStatus = DriverStatus.ACTIVE
    notes: Optional[str] = None

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = Field(None, pattern=r"^\d{10}$")
    address: Optional[str] = None
    license_number: Optional[str] = None
    license_expiry: Optional[date] = None
    status: Optional[DriverStatus] = None

class DriverResponse(DriverBase):
    id: int
    joining_date: date
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
