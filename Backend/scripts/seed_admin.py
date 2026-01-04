import asyncio
import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

from app.core.database import SessionLocal, init_db
from app.features.users.user_entity import User, UserRole
from app.features.users.user_helper import AuthHelper

async def create_initial_admin():
    # Initialize database first
    print("Initializing database...")
    await init_db()
    print("Database initialized.")
    
    async with SessionLocal() as db:
        username = "admin"
        password = "admin" # You should change this later
        
        # Check if exists
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.username == username))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print(f"User '{username}' already exists. Resetting password change requirement...")
            existing_user.password_change_required = False
            await db.commit()
            print("Password change requirement cleared for existing admin.")
            return

        hashed_password = AuthHelper.hash_password(password)
        
        new_user = User(
            username=username,
            hashed_password=hashed_password,
            email="ad@bluestart.com",
            full_name="Amit Kumar Dey",
            role=UserRole.ADMIN,
            active=True,
            password_change_required=False,
            phone_number="7980641037"
        )
        
        db.add(new_user)
        await db.commit()
        print(f"[SUCCESS] Admin user created successfully!")
        print(f"Username: {username}")
        print(f"Password: {password}")

if __name__ == "__main__":
    asyncio.run(create_initial_admin())
