import asyncio
import json
from typing import Dict, List
from app.core.logger import logger

class TripBroadcaster:
    """
    Simple in-memory pub/sub for Trip Live Tracking.
    When Telegram webhook receives an update, it publishes here.
    SSE endpoints subscribe to this.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TripBroadcaster, cls).__new__(cls)
            cls._instance.listeners = {} # trip_id -> List[asyncio.Queue]
        return cls._instance

    def __init__(self):
        # Already initialized in __new__ to ensure singleton behavior safety 
        # but typical python singleton pattern just needs ensured state
        if not hasattr(self, 'listeners'):
            self.listeners: Dict[int, List[asyncio.Queue]] = {}

    async def subscribe(self, trip_id: int) -> asyncio.Queue:
        q = asyncio.Queue()
        if trip_id not in self.listeners:
            self.listeners[trip_id] = []
        self.listeners[trip_id].append(q)
        logger.debug(f"Client joined tracking for Trip {trip_id}. Total listeners: {len(self.listeners[trip_id])}")
        return q

    async def unsubscribe(self, trip_id: int, q: asyncio.Queue):
        if trip_id in self.listeners:
            if q in self.listeners[trip_id]:
                self.listeners[trip_id].remove(q)
                logger.debug(f"Client left tracking for Trip {trip_id}.")
            if not self.listeners[trip_id]:
                del self.listeners[trip_id]

    async def broadcast(self, trip_id: int, lat: float, lng: float):
        if trip_id not in self.listeners:
            return
        
        data = json.dumps({"lat": lat, "lng": lng})
        # Format as SSE event
        # field: value\n\n
        message = f"data: {data}\n\n"
        
        for q in self.listeners[trip_id]:
            await q.put(message)

# Global Instance
trip_broadcaster = TripBroadcaster()
