from pydantic import BaseModel, Field, ConfigDict
from sys import maxsize
from datetime import datetime
from typing import Optional
from app.features.inventory.inventory_entity import ItemType, ItemCategory

# --- Item Schemas ---

class ItemBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    code: Optional[str] = Field(None, max_length=50) # SKU, auto-gen if None or empty
    item_type: ItemType = ItemType.GOODS
    category: ItemCategory = ItemCategory.OTHER
    
    unit: str = Field(..., min_length=1, max_length=20) # e.g. "KG", "LTR"
    hsn_code: Optional[str] = None
    tax_rate: float = Field(0.0, ge=0.0)
    
    base_price: float = Field(0.0, ge=0.0)
    
    # Stock
    current_stock: float = 0.0
    min_stock_level: float = 0.0
    
    description: Optional[str] = None
    active: bool = True

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    # Code is usually immutable or requires special handling
    item_type: Optional[ItemType] = None
    category: Optional[ItemCategory] = None
    unit: Optional[str] = None
    hsn_code: Optional[str] = None
    tax_rate: Optional[float] = None
    base_price: Optional[float] = None
    current_stock: Optional[float] = None
    min_stock_level: Optional[float] = None
    description: Optional[str] = None
    active: Optional[bool] = None

class ItemResponse(ItemBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# --- Pricing Schemas ---

class PriceOverrideBase(BaseModel):
    item_id: int
    party_id: int
    rate: float = Field(..., gt=0)
    location: Optional[str] = 'default' # For simpler uniqueness if none provided

class PriceOverrideCreate(PriceOverrideBase):
    pass

class PriceOverrideResponse(PriceOverrideBase):
    id: int
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
