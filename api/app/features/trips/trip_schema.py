from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.features.trips.trip_entity import TripStatus, TripType

# --- Trip Expense Schema ---
class TripExpenseBase(BaseModel):
    expense_type: str = Field(..., min_length=2) # "Toll", "Diesel"
    amount: float = Field(..., gt=0)
    description: Optional[str] = None
    date: Optional[datetime] = None

class TripExpenseCreate(TripExpenseBase):
    pass

class TripExpenseResponse(TripExpenseBase):
    id: int
    trip_id: int
    model_config = ConfigDict(from_attributes=True)

# --- Trip Schema ---

class TripBase(BaseModel):
    start_date: Optional[datetime] = None
    source_location: str
    destination_location: str
    
    # Direct Delivery Support
    supplier_party_id: Optional[int] = None
    customer_party_id: Optional[int] = None
    
    vehicle_id: int
    driver_id: int
    
    start_km: Optional[float] = None
    
    # Financials Estimates
    freight_income: float = 0.0
    market_truck_cost: float = 0.0
    driver_allowance: float = 0.0
    
    status: TripStatus = TripStatus.PLANNED
    notes: Optional[str] = None

class TripCreate(TripBase):
    trip_number: Optional[str] = Field(None) # Auto-generated if None or empty
    pass

class TripUpdate(BaseModel):
    end_date: Optional[datetime] = None
    source_location: Optional[str] = None
    destination_location: Optional[str] = None
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    start_km: Optional[float] = None
    end_km: Optional[float] = None
    
    freight_income: Optional[float] = None
    market_truck_cost: Optional[float] = None
    driver_allowance: Optional[float] = None
    
    status: Optional[TripStatus] = None
    notes: Optional[str] = None

class TripResponse(TripBase):
    id: int
    trip_number: str
    end_date: Optional[datetime]
    end_km: Optional[float]
    
    # Computed financials
    diesel_expense: float
    toll_expense: float
    other_expense: float
    total_expense: float = 0.0 # Will be computed in service/logic 
    net_profit: float = 0.0    # Will be computed
    
    # Individual Expenses
    expenses: List[TripExpenseResponse] = []
    
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
