from fastapi import HTTPException, status
from typing import Optional, List
from app.features.inventory.inventory_repository import InventoryRepository
from app.features.inventory.inventory_schema import (
    ItemCreate, ItemResponse, ItemUpdate, PriceOverrideCreate, PriceOverrideResponse
)
from app.features.inventory.inventory_entity import ItemType, Item
from app.core.id_generator import IDGenerator
from app.core.logger import logger

class InventoryService:
    @staticmethod
    async def create_item(item_in: ItemCreate) -> ItemResponse:
        # Handle Auto-generation of Code
        if not item_in.code:
            item_in.code = await IDGenerator.generate_code("I", Item)
            
        # Check code uniqueness
        if await InventoryRepository.get_item_by_code(item_in.code):
             raise HTTPException(status_code=400, detail=f"Item code '{item_in.code}' already exists")
        
        item = await InventoryRepository.create_item(item_in)
        return ItemResponse.model_validate(item)

    @staticmethod
    async def get_all_items(skip: int, limit: int, type: Optional[ItemType], search: Optional[str]):
        items = await InventoryRepository.get_all_items(skip, limit, type, search)
        return [ItemResponse.model_validate(i) for i in items]

    @staticmethod
    async def get_item(item_id: int) -> ItemResponse:
        item = await InventoryRepository.get_item_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return ItemResponse.model_validate(item)

    @staticmethod
    async def update_item(item_id: int, item_in: ItemUpdate) -> ItemResponse:
        item = await InventoryRepository.update_item(item_id, item_in)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return ItemResponse.model_validate(item)

    @staticmethod
    async def set_price_override(price_in: PriceOverrideCreate) -> PriceOverrideResponse:
        # Validate existence of item and party? Technically good practice, 
        # but FK constraint in DB will catch it. We save a read query by letting DB handle validity.
        try:
            rate = await InventoryRepository.set_customer_price(price_in)
            return PriceOverrideResponse.model_validate(rate)
        except Exception as e:
            # Usually IntegrityError
            logger.error(f"Failed to set price: {e}")
            raise HTTPException(status_code=400, detail="Invalid Item ID or Party ID")

    @staticmethod
    async def get_item_price_for_party(item_id: int, party_id: int, location: str = "default") -> float:
        """
        Determines the effective price:
        1. Check for specific override.
        2. If none, return Item Base Price.
        """
        override = await InventoryRepository.get_best_price(item_id, party_id, location)
        if override is not None:
            return override
        
        # Fallback to base price
        item = await InventoryRepository.get_item_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return item.base_price
