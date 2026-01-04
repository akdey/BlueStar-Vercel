from fastapi import HTTPException, status
from typing import List, Optional
from app.features.parties.party_entity import PartyType, Party
from app.features.parties.party_repository import PartyRepository
from app.features.parties.party_schema import PartyCreate, PartyUpdate, PartyResponse
from app.core.id_generator import IDGenerator

class PartyService:
    @staticmethod
    async def create_party(party_in: PartyCreate) -> PartyResponse:
        # 1. Handle Auto-generation of Code
        if not party_in.code:
            party_in.code = await IDGenerator.generate_code("P", Party)
        
        # 2. Check uniqueness of Code
        if await PartyRepository.get_by_code(party_in.code):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Party code '{party_in.code}' already exists."
            )
        
        # 2. Check Uniqueness of GSTIN (if provided)
        # We need a custom query for this in repo if strictly needed, or we catch IntegrityError. 
        # But 'code' check is explicit. For GSTIN, let's rely on DB constraint or add check if critical.
        # Let's trust Repo exception logging for unique constraint violations for now to keep it fast.
        
        new_party = await PartyRepository.create(party_in)
        return PartyResponse.model_validate(new_party)

    @staticmethod
    async def get_all_parties(skip: int = 0, limit: int = 100, type: Optional[PartyType] = None, search: Optional[str] = None):
        parties = await PartyRepository.get_all(skip=skip, limit=limit, party_type=type, search=search)
        return [PartyResponse.model_validate(p) for p in parties]

    @staticmethod
    async def get_party(party_id: int) -> PartyResponse:
        party = await PartyRepository.get_by_id(party_id)
        if not party:
            raise HTTPException(status_code=404, detail="Party not found")
        return PartyResponse.model_validate(party)

    @staticmethod
    async def update_party(party_id: int, party_in: PartyUpdate) -> PartyResponse:
        # If code is being updated, check uniqueness?
        # PartyUpdate schema allows code update? No, I didn't include 'code' in PartyUpdate. Good. Codes shouldn't change easily.
        
        updated_party = await PartyRepository.update(party_id, party_in)
        if not updated_party:
            raise HTTPException(status_code=404, detail="Party not found")
        return PartyResponse.model_validate(updated_party)

    @staticmethod
    async def delete_party(party_id: int):
        success = await PartyRepository.delete(party_id)
        if not success:
            raise HTTPException(status_code=404, detail="Party not found")
        return {"success": True, "message": "Party deleted successfully"}
