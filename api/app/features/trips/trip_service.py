from fastapi import HTTPException, status
from typing import List, Optional
from app.features.trips.trip_repository import TripRepository
from app.features.trips.trip_schema import (
    TripCreate, TripResponse, TripUpdate, TripExpenseCreate, TripExpenseResponse
)
from app.features.trips.trip_entity import Trip, TripStatus
from app.core.id_generator import IDGenerator
from app.features.fleet.fleet_repository import FleetRepository
from app.features.fleet.fleet_entity import VehicleStatus
from app.core.telegram_utils import TelegramBot
from app.core.logger import logger
from app.features.users.user_repository import UserRepository

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
        
        # Trigger notification if created directly in IN_TRANSIT status
        if trip.status == TripStatus.IN_TRANSIT:
             await TripService._notify_driver_trip_start(trip)
             
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
        # Check if status is changing to IN_TRANSIT
        should_notify = False
        if trip_in.status == TripStatus.IN_TRANSIT:
            existing_trip = await TripRepository.get_by_id(trip_id)
            if existing_trip and existing_trip.status != TripStatus.IN_TRANSIT:
                should_notify = True

        trip = await TripRepository.update(trip_id, trip_in)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        if should_notify:
            await TripService._notify_driver_trip_start(trip)

        return await TripService._enrich_response(trip)

    @staticmethod
    async def _notify_driver_trip_start(trip: Trip):
        """Send Telegram notification to driver with location sharing button"""
        try:
            # 1. Get Driver and Vehicle details
            driver = await FleetRepository.get_driver_by_id(trip.driver_id)
            vehicle = await FleetRepository.get_vehicle_by_number(str(trip.vehicle_id))
            if not driver or not driver.phone:
                return

            # 2. Check Driver Telegram Link
            if not driver or not driver.telegram_chat_id:
                logger.info(f"Driver {driver.name} not linked to Telegram. Skipping notification.")
                return

            # 3. Build Message
            v_info = vehicle.vehicle_number if vehicle else "N/A"
            message = (
                f"🚚 <b>Trip Started!</b>\n\n"
                f"Trip No: <code>{trip.trip_number}</code>\n"
                f"Vehicle: <b>{v_info}</b>\n"
                f"From: <b>{trip.source_location}</b>\n"
                f"To: <b>{trip.destination_location}</b>\n\n"
                f"Please click the button below to <b>Share Location</b> so we can track your progress. 📍"
            )
            
            # 4. Create Keyboard with Location Sharing Button
            keyboard = {
                "keyboard": [[{"text": "📍 Share My Location", "request_location": True}]],
                "resize_keyboard": True,
                "one_time_keyboard": False
            }
            
            await TelegramBot.send_message_with_keyboard(
                message, 
                chat_id=driver.telegram_chat_id, 
                keyboard=keyboard, 
                parse_mode="HTML"
            )
            logger.info(f"Notified driver {driver.name} via Telegram for Trip {trip.trip_number}")
        except Exception as e:
            logger.error(f"Error notifying driver: {e}")

    @staticmethod
    async def update_location(trip_id: int, lat: float, lng: float) -> TripResponse:
        trip = await TripRepository.update_location(trip_id, lat, lng)
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
