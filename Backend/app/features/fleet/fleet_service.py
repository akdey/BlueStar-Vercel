from fastapi import HTTPException, status
from typing import List
from app.features.fleet.fleet_repository import FleetRepository
from app.features.fleet.fleet_schema import (
    VehicleCreate, VehicleResponse, VehicleUpdate,
    DriverCreate, DriverResponse, DriverUpdate
)

class FleetService:
    # --- Vehicle ---
    @staticmethod
    async def create_vehicle(vehicle_in: VehicleCreate) -> VehicleResponse:
        # Check uniqueness
        if await FleetRepository.get_vehicle_by_number(vehicle_in.vehicle_number):
            raise HTTPException(status_code=400, detail="Vehicle number already exists")
        
        veh = await FleetRepository.create_vehicle(vehicle_in)
        return VehicleResponse.model_validate(veh)

    @staticmethod
    async def get_all_vehicles(skip: int, limit: int) -> List[VehicleResponse]:
        vehs = await FleetRepository.get_all_vehicles(skip, limit)
        return [VehicleResponse.model_validate(v) for v in vehs]

    # --- Driver ---
    @staticmethod
    async def create_driver(driver_in: DriverCreate) -> DriverResponse:
        # Check phone uniqueness handled by DB, but we can catch error
        drv = await FleetRepository.create_driver(driver_in)
        return DriverResponse.model_validate(drv)

    @staticmethod
    async def get_all_drivers(skip: int, limit: int) -> List[DriverResponse]:
        drvs = await FleetRepository.get_all_drivers(skip, limit)
        return [DriverResponse.model_validate(d) for d in drvs]
