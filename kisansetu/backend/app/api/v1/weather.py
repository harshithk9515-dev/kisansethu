from typing import Optional

from fastapi import APIRouter, Query

from app.models.schemas import WeatherData
from app.services.weather_engine import fetch_weather, DEFAULT_LAT, DEFAULT_LON
from app.core.logger import logger

router = APIRouter(prefix="/weather", tags=["weather"])

@router.get("", response_model=WeatherData)
async def weather(
    latitude: Optional[float] = Query(None, ge=-90, le=90, description="Latitude from GPS"),
    longitude: Optional[float] = Query(None, ge=-180, le=180, description="Longitude from GPS"),
    location_name: Optional[str] = Query(None, description="Optional human-readable location"),
):
    try:
        lat = latitude if latitude is not None else DEFAULT_LAT
        lon = longitude if longitude is not None else DEFAULT_LON
        loc = location_name
        if latitude is None and longitude is None and not loc:
            loc = None
        result = await fetch_weather(latitude=lat, longitude=lon, location_name=loc)
        return result
    except Exception as e:
        logger.exception(f"Weather endpoint fallback: {e}")
        return await fetch_weather(latitude=DEFAULT_LAT, longitude=DEFAULT_LON, location_name=None)
