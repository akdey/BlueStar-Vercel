from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from typing import Optional
from app.features.trips.trip_schema import TripCreate, TripUpdate, TripExpenseCreate
from app.features.trips.trip_service import TripService

router = APIRouter(prefix="/trips", tags=["Logistics (Trips & Expenses)"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_trip(trip_in: TripCreate):
    """
    Start a new Trip.
    Supports 'Direct Delivery' by linking Supplier and Customer directly.
    """
    trip = await TripService.create_trip(trip_in)
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={"success": True, "message": "Trip started", "data": trip.model_dump(mode='json')}
    )

@router.get("/")
async def list_trips(skip: int = 0, limit: int = 100, vehicle_id: Optional[int] = None):
    trips = await TripService.get_all_trips(skip, limit, vehicle_id)
    return JSONResponse(
        content={
            "success": True,
            "message": f"Retrieved {len(trips)} trips",
            "data": [t.model_dump(mode='json') for t in trips]
        }
    )

@router.get("/{trip_id}")
async def get_trip_detail(trip_id: int):
    trip = await TripService.get_trip(trip_id)
    return JSONResponse(
        content={"success": True, "message": "Trip retrieved", "data": trip.model_dump(mode='json')}
    )

@router.patch("/{trip_id}")
async def update_trip(trip_id: int, trip_in: TripUpdate):
    """Close trip, update readings, or update financials."""
    trip = await TripService.update_trip(trip_id, trip_in)
    return JSONResponse(
        content={"success": True, "message": "Trip updated", "data": trip.model_dump(mode='json')}
    )

@router.post("/{trip_id}/expenses")
async def add_trip_expense(trip_id: int, expense_in: TripExpenseCreate):
    """
    Log an expense for this specific trip (Diesel, Toll).
    Automatically updates the Trip's profit calculation.
    """
    exp = await TripService.add_expense(trip_id, expense_in)
    return JSONResponse(
        content={"success": True, "message": "Expense added", "data": exp.model_dump(mode='json')}
    )
