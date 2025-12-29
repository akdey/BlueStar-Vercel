import asyncio
from fastapi import APIRouter, status, Request
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Optional
from app.features.trips.trip_schema import TripCreate, TripUpdate, TripExpenseCreate
from app.features.trips.trip_service import TripService
from app.features.trips.trip_broadcaster import trip_broadcaster

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

@router.get("/{trip_id}/tracking-stream")
async def stream_trip_location(trip_id: int, request: Request):
    # Fetch initial state to send immediately
    trip = await TripService.get_trip(trip_id)
    
    async def event_generator():
        # 0. Check Status
        # access status via model_dump in schema or directly if it's there
        # trip is TripResponse (Pydantic model)
        is_active = (trip.status.value == "in_transit") # TripStatus enum check
        
        import json
        # 1. Send Initial State (if available, regardless of status)
        if trip.current_lat and trip.current_lng:
            initial_data = json.dumps({"lat": trip.current_lat, "lng": trip.current_lng})
            yield f"data: {initial_data}\n\n"
        
        # 2. If not active, send status and close
        if not is_active:
            # Send a custom event or just data with status
            # Standard SSE 'event' field
            yield f"event: status\n"
            yield f"data: {json.dumps({'status': trip.status.value, 'message': 'Trip is not active'})}\n\n"
            return # Close stream

        # 3. Stream Updates (Only for active trips)
        q = await trip_broadcaster.subscribe(trip_id)
        try:
            while True:
                if await request.is_disconnected():
                    break
                # Wait for new data (lat/lng)
                data = await q.get()
                yield data
        except asyncio.CancelledError:
            pass
        finally:
            await trip_broadcaster.unsubscribe(trip_id, q)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
