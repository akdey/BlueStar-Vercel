from fastapi import APIRouter, status, Query
from fastapi.responses import JSONResponse
from typing import Optional
from app.features.parties.party_schema import PartyCreate, PartyUpdate, PartyResponse, PartyType
from app.features.parties.party_service import PartyService

router = APIRouter(prefix="/parties", tags=["Parties (Customers/Suppliers)"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_party(party_in: PartyCreate):
    """Create a new Customer, Supplier, or Carrier."""
    party = await PartyService.create_party(party_in)
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "success": True, 
            "message": f"{party.party_type.value.capitalize()} created successfully", 
            "data": party.model_dump(mode='json')
        }
    )

@router.get("/")
async def get_parties(
    skip: int = 0, 
    limit: int = 100, 
    type: Optional[PartyType] = None, 
    search: Optional[str] = None
):
    """
    Get list of parties. 
    Filter by 'type' (customer, supplier, carrier).
    Search by name, code, phone.
    """
    parties = await PartyService.get_all_parties(skip=skip, limit=limit, type=type, search=search)
    return JSONResponse(
        content={
            "success": True,
            "message": f"Retrieved {len(parties)} records",
            "data": [p.model_dump(mode='json') for p in parties],
            "pagination": {"skip": skip, "limit": limit, "count": len(parties)}
        }
    )

@router.get("/{party_id}")
async def get_party(party_id: int):
    party = await PartyService.get_party(party_id)
    return JSONResponse(
        content={
            "success": True,
            "message": "Record retrieved",
            "data": party.model_dump(mode='json')
        }
    )

@router.patch("/{party_id}")
async def update_party(party_id: int, party_in: PartyUpdate):
    party = await PartyService.update_party(party_id, party_in)
    return JSONResponse(
        content={
            "success": True,
            "message": "Record updated successfully",
            "data": party.model_dump(mode='json')
        }
    )

@router.delete("/{party_id}")
async def delete_party(party_id: int):
    await PartyService.delete_party(party_id)
    return JSONResponse(
        content={
            "success": True,
            "message": "Record deleted successfully",
            "data": None
        }
    )
