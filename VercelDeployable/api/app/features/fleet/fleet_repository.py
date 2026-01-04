from typing import Optional, Sequence, List
from sqlalchemy import select
from app.core.database import SessionLocal
from app.features.fleet.fleet_entity import Vehicle, Driver
from app.features.fleet.fleet_schema import VehicleCreate, VehicleUpdate, DriverCreate, DriverUpdate
from app.core.logger import logger

class FleetRepository:
    # --- Vehicle ---
    @staticmethod
    async def create_vehicle(vehicle_in: VehicleCreate) -> Vehicle:
        async with SessionLocal() as db:
            try:
                db_veh = Vehicle(**vehicle_in.model_dump())
                db.add(db_veh)
                await db.commit()
                await db.refresh(db_veh)
                return db_veh
            except Exception as e:
                logger.error(f"Error creating vehicle: {e}")
                await db.rollback()
                raise

    @staticmethod
    async def get_all_vehicles(skip: int = 0, limit: int = 100) -> Sequence[Vehicle]:
        async with SessionLocal() as db:
            result = await db.execute(select(Vehicle).offset(skip).limit(limit))
            return result.scalars().all()
    
    @staticmethod
    async def get_vehicle_by_number(number: str) -> Optional[Vehicle]:
        async with SessionLocal() as db:
            result = await db.execute(select(Vehicle).where(Vehicle.vehicle_number == number))
            return result.scalar_one_or_none()

    # --- Driver ---
    @staticmethod
    async def create_driver(driver_in: DriverCreate) -> Driver:
        async with SessionLocal() as db:
            try:
                db_drv = Driver(**driver_in.model_dump())
                db.add(db_drv)
                await db.commit()
                await db.refresh(db_drv)
                return db_drv
            except Exception as e:
                logger.error(f"Error creating driver: {e}")
                await db.rollback()
                raise
    
    @staticmethod
    async def get_all_drivers(skip: int = 0, limit: int = 100) -> Sequence[Driver]:
        async with SessionLocal() as db:
            result = await db.execute(select(Driver).offset(skip).limit(limit))
            return result.scalars().all()

    @staticmethod
    async def get_driver_by_id(driver_id: int) -> Optional[Driver]:
        async with SessionLocal() as db:
            result = await db.execute(select(Driver).where(Driver.id == driver_id))
            return result.scalar_one_or_none()

    @staticmethod
    async def get_driver_by_phone(phone: str) -> Optional[Driver]:
        async with SessionLocal() as db:
            result = await db.execute(select(Driver).where(Driver.phone == phone))
            return result.scalar_one_or_none()

    @staticmethod
    async def get_driver_by_telegram_id(chat_id: str) -> Optional[Driver]:
        async with SessionLocal() as db:
            result = await db.execute(select(Driver).where(Driver.telegram_chat_id == chat_id))
            return result.scalar_one_or_none()
            
    @staticmethod
    async def update_driver_telegram_id(driver_id: int, chat_id: str) -> bool:
        async with SessionLocal() as db:
            try:
                result = await db.execute(select(Driver).where(Driver.id == driver_id))
                driver = result.scalar_one_or_none()
                if driver:
                    driver.telegram_chat_id = chat_id
                    await db.commit()
                    return True
                return False
            except Exception as e:
                logger.error(f"Error updating driver telegram ID: {e}")
                return False
