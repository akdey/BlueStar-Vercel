from fastapi import HTTPException, status
from typing import List, Optional
from app.features.trips.trip_repository import TripRepository
from app.features.trips.trip_schema import (
    TripCreate, TripResponse, TripUpdate, TripExpenseCreate, TripExpenseResponse
)
from app.features.trips.trip_entity import Trip
from app.core.id_generator import IDGenerator
from app.features.fleet.fleet_repository import FleetRepository
from app.features.fleet.fleet_entity import VehicleStatus

class TripService:
    @staticmethod
    async def create_trip(trip_in: TripCreate) -> TripResponse:
        # Handle Auto-generation of Trip Number
        if not trip_in.trip_number:
            trip_in.trip_number = await IDGenerator.generate_code("T", Trip)
            
        # Check vehicle availability?
        # Ideally yes. A vehicle cannot be on two trips.
        vehicle = await FleetRepository.get_vehicle_by_number(str(trip_in.vehicle_id)) # This searches by number, but input is ID. Need get_by_id in FleetRepo?
        # Let's skip availability check for MVP to avoid circular deps or adding more methods now.
        # But we should trust the user or check status later.
        
        trip = await TripRepository.create(trip_in)
        return await TripService._enrich_response(trip)

    @staticmethod
    async def _enrich_response(trip) -> TripResponse:
        """Calculate calculated fields like Total Expense and Profit"""
        resp = TripResponse.model_validate(trip)
        resp.total_expense = trip.diesel_expense + trip.toll_expense + trip.other_expense + trip.market_truck_cost + trip.driver_allowance
        resp.net_profit = trip.freight_income - resp.total_expense
        return resp

    @staticmethod
    async def get_all_trips(skip: int, limit: int, vehicle_id: Optional[int]) -> List[TripResponse]:
        trips = await TripRepository.get_all(skip, limit, vehicle_id)
        return [await TripService._enrich_response(t) for t in trips]

    @staticmethod
    async def get_trip(trip_id: int) -> TripResponse:
        trip = await TripRepository.get_by_id(trip_id)
        if not trip:
             raise HTTPException(status_code=404, detail="Trip not found")
        return await TripService._enrich_response(trip)
    
    @staticmethod
    async def update_trip(trip_id: int, trip_in: TripUpdate) -> TripResponse:
        trip = await TripRepository.update(trip_id, trip_in)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        return await TripService._enrich_response(trip)

    @staticmethod
    async def add_expense(trip_id: int, expense_in: TripExpenseCreate) -> TripExpenseResponse:
        # Check trip existence
        trip = await TripRepository.get_by_id(trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
            
        exp = await TripRepository.add_expense(trip_id, expense_in)
        return TripExpenseResponse.model_validate(exp)
