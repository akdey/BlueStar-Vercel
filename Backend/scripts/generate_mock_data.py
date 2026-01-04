import asyncio
import sys
import os
import random
from datetime import datetime, timedelta, date as date_type
from sqlalchemy import select

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

from app.core.database import SessionLocal, init_db, engine
from app.core.logger import setup_logging
import logging

from app.features.users.user_entity import User, UserRole
from app.features.users.user_helper import AuthHelper
from app.features.parties.party_entity import Party, PartyType, PartyStatus
from app.features.inventory.inventory_entity import Item, ItemType, ItemCategory
from app.features.fleet.fleet_entity import Vehicle, Driver, VehicleType, VehicleStatus, DriverStatus
from app.features.trips.trip_entity import Trip, TripExpense, TripStatus
from app.features.vouchers.voucher_entity import TradeVoucher, VoucherItem, VoucherType, VoucherStatus

setup_logging()
logger = logging.getLogger(__name__)

def get_random_date_last_week():
    current_time = datetime.now()
    days_ago = random.randint(0, 6)
    hours_ago = random.randint(0, 23)
    minutes_ago = random.randint(0, 59)
    return current_time - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)

async def generate_mock_data():
    print("Starting mock data generation...", flush=True)
    logger.info("Initializing database connection...")
    try:
        await init_db()
    except Exception as e:
        logger.error(f"Failed to initialize DB: {e}")
        return
    
    print("Database initialized.", flush=True)
    
    async with SessionLocal() as db:
        print("Scrubbing/Preparing data...", flush=True)
        
        # 1. Ensure we have an admin and some users
        hashed_password = AuthHelper.hash_password("password123")
        
        users = [
            User(username="manager1", email="m1@bluestart.com", full_name="Manager One", role=UserRole.MANAGER, hashed_password=hashed_password),
            User(username="staff1", email="s1@bluestart.com", full_name="Staff One", role=UserRole.USER, hashed_password=hashed_password),
        ]
        
        for u in users:
            res = await db.execute(select(User).where(User.username == u.username))
            if not res.scalar_one_or_none():
                db.add(u)
        
        await db.flush()
        
        # 2. Parties
        party_names = ["UltraTech Cement", "Reliance Petroleum", "Ambuja Co.", "Tata Steel", "Adani Logistics"]
        parties = []
        for i, name in enumerate(party_names):
            p_type = PartyType.BOTH if i % 2 == 0 else PartyType.CUSTOMER
            party = Party(
                code=f"P-{str(i+1).zfill(3)}",
                name=name,
                party_type=p_type,
                email=f"contact@{name.lower().replace(' ', '')}.com",
                phone=f"987654321{i}",
                city="Kolkata",
                state="West Bengal",
                gstin=f"19AAAAA000{i}A1Z1",
                status=PartyStatus.ACTIVE
            )
            res = await db.execute(select(Party).where(Party.code == party.code))
            if not res.scalar_one_or_none():
                db.add(party)
                parties.append(party)
        
        await db.flush()
        
        # 3. Items
        items_data = [
            ("C-001", "PPC Cement", ItemType.GOODS, ItemCategory.CEMENT, "Bag", 18.0, 450.0),
            ("C-002", "OPC Cement", ItemType.GOODS, ItemCategory.CEMENT, "Bag", 18.0, 480.0),
            ("D-001", "Diesel", ItemType.GOODS, ItemCategory.DIESEL, "Litre", 5.0, 92.0),
            ("T-001", "Freight Service", ItemType.SERVICE, ItemCategory.TRANSPORT, "Trip", 12.0, 15000.0),
        ]
        items = []
        for code, name, itype, cat, unit, tax, price in items_data:
            item = Item(
                code=code, name=name, item_type=itype, category=cat, 
                unit=unit, tax_rate=tax, base_price=price, current_stock=1000.0
            )
            res = await db.execute(select(Item).where(Item.code == item.code))
            if not res.scalar_one_or_none():
                db.add(item)
                items.append(item)
        
        await db.flush()
        
        # 4. Fleet
        vehicles = []
        for i in range(1, 6):
            v = Vehicle(
                vehicle_number=f"WB25-{str(random.randint(1000, 9999))}",
                vehicle_type=VehicleType.TRUCK,
                capacity_ton=25.0,
                is_owned=True,
                current_status=VehicleStatus.AVAILABLE
            )
            res = await db.execute(select(Vehicle).where(Vehicle.vehicle_number == v.vehicle_number))
            if not res.scalar_one_or_none():
                db.add(v)
                vehicles.append(v)
        
        drivers = []
        for i in range(1, 6):
            d = Driver(
                name=f"Driver {i}",
                phone=f"912345678{i}",
                status=DriverStatus.ACTIVE
            )
            db.add(d)
            drivers.append(d)
            
        await db.flush()
        
        # Refresh lists in case they were already there
        if not parties:
            res = await db.execute(select(Party))
            parties = list(res.scalars().all())
        if not items:
            res = await db.execute(select(Item))
            items = list(res.scalars().all())
        if not vehicles:
            res = await db.execute(select(Vehicle))
            vehicles = list(res.scalars().all())
        if not drivers:
            res = await db.execute(select(Driver))
            drivers = list(res.scalars().all())
        
        # 5. Trips (Last 7 days)
        trips = []
        for i in range(15):
            start_dt = get_random_date_last_week()
            end_dt = start_dt + timedelta(hours=random.randint(12, 48))
            
            # Use timestamp to ensure uniqueness
            t_number = f"TRP-{start_dt.strftime('%y%m%d')}-{random.randint(100, 999)}"
            
            # Check if exists
            res = await db.execute(select(Trip).where(Trip.trip_number == t_number))
            if res.scalar_one_or_none():
                continue

            trip = Trip(
                trip_number=t_number,
                start_date=start_dt,
                end_date=end_dt if end_dt < datetime.now() else None,
                source_location="Kolkata",
                destination_location=random.choice(["Durgapur", "Asansol", "Haldia", "Siliguri"]),
                vehicle_id=random.choice(vehicles).id,
                driver_id=random.choice(drivers).id,
                status=TripStatus.COMPLETED if end_dt < datetime.now() else TripStatus.IN_TRANSIT,
                freight_income=random.randint(15000, 25000),
                diesel_expense=random.randint(5000, 8000),
                toll_expense=random.randint(500, 1500)
            )
            db.add(trip)
            trips.append(trip)
            
        await db.flush()
        
        # 6. Vouchers (Last 7 days)
        for i in range(20):
            v_dt = get_random_date_last_week()
            v_type = random.choice([VoucherType.CHALLAN, VoucherType.INVOICE, VoucherType.BILL])
            
            # Link to a trip optionally
            related_trip = random.choice(trips) if trips and random.random() > 0.3 else None
            
            # Find vehicle and driver if trip is linked
            v_num = None
            d_name = None
            if related_trip:
                # Find the vehicle number
                for v in vehicles:
                    if v.id == related_trip.vehicle_id:
                        v_num = v.vehicle_number
                        break
                # Find the driver name
                for d in drivers:
                    if d.id == related_trip.driver_id:
                        d_name = d.name
                        break
            
            if not v_num:
                v_num = f"WB-{random.randint(10,99)}-{random.randint(1000,9999)}"
            
            # Use random suffix for voucher number
            voucher_number = f"{v_type.value[:3].upper()}-{v_dt.strftime('%y%m%d')}-{random.randint(1000, 9999)}"
            
            # Check if exists
            res = await db.execute(select(TradeVoucher).where(TradeVoucher.voucher_number == voucher_number))
            if res.scalar_one_or_none():
                continue

            voucher = TradeVoucher(
                voucher_number=voucher_number,
                voucher_type=v_type,
                voucher_date=v_dt.date(),
                party_id=random.choice(parties).id,
                trip_id=related_trip.id if related_trip else None,
                vehicle_number=v_num,
                driver_name=d_name,
                status=VoucherStatus.ISSUED,
                notes=f"Mock data for {v_type.value}"
            )
            db.add(voucher)
            await db.flush() # Get voucher ID
            
            # Add items to voucher
            v_item = VoucherItem(
                voucher_id=voucher.id,
                item_id=random.choice(items).id,
                quantity=random.randint(10, 50),
                rate=random.randint(400, 500),
                amount=0.0 # Will calculate
            )
            v_item.amount = v_item.quantity * v_item.rate
            voucher.total_amount = v_item.amount
            voucher.tax_amount = v_item.amount * 0.18
            voucher.grand_total = voucher.total_amount + voucher.tax_amount
            db.add(v_item)

        # 7. Trip Expenses
        for trip in trips:
            if trip.diesel_expense > 0:
                db.add(TripExpense(
                    trip_id=trip.id,
                    expense_type="Diesel",
                    amount=trip.diesel_expense,
                    description="Fuel refill",
                    date=trip.start_date
                ))
            if trip.toll_expense > 0:
                db.add(TripExpense(
                    trip_id=trip.id,
                    expense_type="Toll",
                    amount=trip.toll_expense,
                    description="NHAI Toll",
                    date=trip.start_date
                ))

        await db.commit()
        print("Mock data generated successfully for the last 1 week!", flush=True)

if __name__ == "__main__":
    asyncio.run(generate_mock_data())
