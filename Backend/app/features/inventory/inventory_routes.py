from fastapi import APIRouter, status, Query
from fastapi.responses import JSONResponse
from typing import Optional
from app.features.inventory.inventory_schema import ItemCreate, ItemUpdate, PriceOverrideCreate, ItemType
from app.features.inventory.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory (Items & Pricing)"])

# --- Items ---

@router.post("/items", status_code=status.HTTP_201_CREATED)
async def create_item(item_in: ItemCreate):
    """Create a new Product or Service (Item)."""
    item = await InventoryService.create_item(item_in)
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "success": True, 
            "message": "Item created successfully", 
            "data": item.model_dump(mode='json')
        }
    )

@router.get("/items")
async def get_items(
    skip: int = 0, 
    limit: int = 100, 
    type: Optional[ItemType] = None, 
    search: Optional[str] = None
):
    """List all items with filters."""
    items = await InventoryService.get_all_items(skip, limit, type, search)
    return JSONResponse(
        content={
            "success": True,
            "message": f"Retrieved {len(items)} items",
            "data": [i.model_dump(mode='json') for i in items],
            "pagination": {"skip": skip, "limit": limit, "count": len(items)}
        }
    )

@router.get("/items/{item_id}")
async def get_item_detail(item_id: int):
    item = await InventoryService.get_item(item_id)
    return JSONResponse(
        content={"success": True, "message": "Item retrieved", "data": item.model_dump(mode='json')}
    )

@router.patch("/items/{item_id}")
async def update_item(item_id: int, item_in: ItemUpdate):
    item = await InventoryService.update_item(item_id, item_in)
    return JSONResponse(
        content={"success": True, "message": "Item updated", "data": item.model_dump(mode='json')}
    )

# --- Pricing ---

@router.post("/pricing/override")
async def set_specific_price(price_in: PriceOverrideCreate):
    """
    Set a special price for a specific Customer + Item combination.
    Location can be used for 'Route' specific pricing (e.g. Mumbai-Pune).
    """
    rate = await InventoryService.set_price_override(price_in)
    return JSONResponse(
        content={
            "success": True, 
            "message": "Price override set successfully", 
            "data": rate.model_dump(mode='json')
        }
    )

@router.get("/pricing/calculate")
async def get_effective_price(item_id: int, party_id: int, location: str = "default"):
    """
    Get the effective price for a customer for an item.
    Checks Override Table -> Falls back to Item Base Price.
    """
    price = await InventoryService.get_item_price_for_party(item_id, party_id, location)
    return JSONResponse(
        content={
            "success": True,
            "message": "Price calculated",
            "data": {"item_id": item_id, "party_id": party_id, "effective_price": price}
        }
    )
