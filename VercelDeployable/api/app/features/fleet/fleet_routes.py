from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from app.features.fleet.fleet_schema import VehicleCreate, DriverCreate
from app.features.fleet.fleet_service import FleetService

router = APIRouter(prefix="/fleet", tags=["Fleet (Vehicles & Drivers)"])

# --- Vehicles ---

@router.post("/vehicles", status_code=status.HTTP_201_CREATED)
async def add_vehicle(vehicle_in: VehicleCreate):
    """Add a new truck/vehicle."""
    veh = await FleetService.create_vehicle(vehicle_in)
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={"success": True, "message": "Vehicle added", "data": veh.model_dump(mode='json')}
    )

@router.get("/vehicles")
async def list_vehicles(skip: int = 0, limit: int = 100):
    vehs = await FleetService.get_all_vehicles(skip, limit)
    return JSONResponse(
        content={
            "success": True,
            "message": f"Retrieved {len(vehs)} vehicles",
            "data": [v.model_dump(mode='json') for v in vehs]
        }
    )

# --- Drivers ---

@router.post("/drivers", status_code=status.HTTP_201_CREATED)
async def add_driver(driver_in: DriverCreate):
    """Add a new driver."""
    drv = await FleetService.create_driver(driver_in)
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={"success": True, "message": "Driver added", "data": drv.model_dump(mode='json')}
    )

@router.get("/drivers")
async def list_drivers(skip: int = 0, limit: int = 100):
    drvs = await FleetService.get_all_drivers(skip, limit)
    return JSONResponse(
        content={
            "success": True,
            "message": f"Retrieved {len(drvs)} drivers",
            "data": [d.model_dump(mode='json') for d in drvs]
        }
    )
