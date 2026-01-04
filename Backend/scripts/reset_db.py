import asyncio
import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

from app.core.database import engine, Base
from app.core.logger import logger, setup_logging

async def reset_database():
    setup_logging()
    logger.info("Starting database reset...")

    async with engine.begin() as conn:
        # Import all entities to ensure they are registered with Base.metadata
        from app.features.users.user_entity import User
        from app.features.parties.party_entity import Party
        from app.features.transactions.transaction_entity import Transaction
        from app.features.inventory.inventory_entity import Item, CustomerItemRate
        from app.features.vouchers.voucher_entity import TradeVoucher, VoucherItem
        from app.features.fleet.fleet_entity import Vehicle, Driver
        from app.features.trips.trip_entity import Trip, TripExpense
        from app.features.notifications.notification_entity import Notification

        logger.info("Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)
        
        logger.info("Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Database reset complete. All tables recreated.")

if __name__ == "__main__":
    confirm = input("Are you sure you want to RESET the database? This will delete ALL data. (y/n): ")
    if confirm.lower() == 'y':
        asyncio.run(reset_database())
    else:
        print("Operation cancelled.")
