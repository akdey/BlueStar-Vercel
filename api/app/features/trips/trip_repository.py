from typing import Optional, Sequence, List
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import SessionLocal
from app.features.trips.trip_entity import Trip, TripExpense, TripStatus
from app.features.trips.trip_schema import TripCreate, TripUpdate, TripExpenseCreate
from app.core.logger import logger

class TripRepository:
    @staticmethod
    async def create(trip_in: TripCreate) -> Trip:
        async with SessionLocal() as db:
            try:
                db_trip = Trip(**trip_in.model_dump())
                if not db_trip.start_date:
                    db_trip.start_date = func.now()
                
                db.add(db_trip)
                await db.commit()
                # Re-fetch with selectinload to avoid DetachedInstanceError later
                result = await db.execute(
                    select(Trip)
                    .options(selectinload(Trip.expenses))
                    .where(Trip.id == db_trip.id)
                )
                return result.scalar_one()
            except Exception as e:
                logger.error(f"Error creating trip: {e}")
                await db.rollback()
                raise

    @staticmethod
    async def get_all(skip: int = 0, limit: int = 100, vehicle_id: Optional[int] = None) -> Sequence[Trip]:
        async with SessionLocal() as db:
            query = select(Trip).options(selectinload(Trip.expenses)).order_by(Trip.start_date.desc()).offset(skip).limit(limit)
            if vehicle_id:
                query = query.where(Trip.vehicle_id == vehicle_id)
            result = await db.execute(query)
            return result.scalars().all()

    @staticmethod
    async def get_by_id(trip_id: int) -> Optional[Trip]:
        async with SessionLocal() as db:
            result = await db.execute(select(Trip).options(selectinload(Trip.expenses)).where(Trip.id == trip_id))
            return result.scalar_one_or_none()
    
    @staticmethod
    async def update(trip_id: int, trip_in: TripUpdate) -> Optional[Trip]:
        async with SessionLocal() as db:
            result = await db.execute(
                select(Trip)
                .options(selectinload(Trip.expenses))
                .where(Trip.id == trip_id)
            )
            db_trip = result.scalar_one_or_none()
            if not db_trip:
                return None
            
            update_data = trip_in.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_trip, key, value)
            
            await db.commit()
            
            # Re-fetch with selectinload to ensure everything is loaded for the response
            result = await db.execute(
                select(Trip)
                .options(selectinload(Trip.expenses))
                .where(Trip.id == db_trip.id)
            )
            return result.scalar_one()
    
    # --- Expenses ---
    @staticmethod
    async def add_expense(trip_id: int, expense_in: TripExpenseCreate) -> TripExpense:
        async with SessionLocal() as db:
            try:
                # 1. Add Expense Record
                db_exp = TripExpense(trip_id=trip_id, **expense_in.model_dump())
                db.add(db_exp)
                
                # 2. Update Aggregates on Trip Table for fast reporting
                result = await db.execute(select(Trip).where(Trip.id == trip_id))
                db_trip = result.scalar_one()
                
                exp_type = expense_in.expense_type.lower()
                amount = expense_in.amount
                
                if "diesel" in exp_type or "fuel" in exp_type:
                    db_trip.diesel_expense += amount
                elif "toll" in exp_type:
                    db_trip.toll_expense += amount
                else:
                    db_trip.other_expense += amount
                
                await db.commit()
                await db.refresh(db_exp)
                return db_exp
            except Exception as e:
                logger.error(f"Error adding trip expense: {e}")
                await db.rollback()
                raise

    @staticmethod
    async def get_expenses(trip_id: int) -> Sequence[TripExpense]:
        async with SessionLocal() as db:
            result = await db.execute(select(TripExpense).where(TripExpense.trip_id == trip_id))
            return result.scalars().all()

    @staticmethod
    async def update_location(trip_id: int, lat: float, lng: float) -> Optional[Trip]:
        async with SessionLocal() as db:
            result = await db.execute(select(Trip).where(Trip.id == trip_id))
            db_trip = result.scalar_one_or_none()
            if not db_trip:
                return None
            
            db_trip.current_lat = lat
            db_trip.current_lng = lng
            db_trip.last_tracking_at = func.now()
            
            await db.commit()
            await db.refresh(db_trip)
            return db_trip

    @staticmethod
    async def get_active_trip_by_driver(driver_id: int) -> Optional[Trip]:
        """Get the current in-transit trip for a driver."""
        async with SessionLocal() as db:
            result = await db.execute(
                select(Trip)
                .where(Trip.driver_id == driver_id, Trip.status == TripStatus.IN_TRANSIT)
                .order_by(Trip.updated_at.desc())
            )
            return result.scalars().first()
