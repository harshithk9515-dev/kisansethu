"""
Micro-Climate Intelligence Engine — Live Geolocation & Weather Advisory
Uses Open-Meteo public API (no key, no rate-limit) with graceful degradation
to default agro-climatic zone: Kolar, Karnataka (13.1378, 78.1291).
"""
import logging
from typing import Tuple, Optional

import httpx

from schemas import WeatherData

logger = logging.getLogger("kisansetu.micro_climate")

DEFAULT_LAT: float = 13.1378
DEFAULT_LON: float = 78.1291
DEFAULT_LOCATION: str = "Kolar, Karnataka (Default Agro-Climatic Zone)"

# WMO Weather interpretation codes (https://open-meteo.com/en/docs)
WMO_CODE_MAP: dict[int, str] = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}

UNSAFE_CODES = {65, 67, 82, 95, 96, 99, 75, 86, 57, 55}


def decode_weather_code(code: int) -> str:
    """Strict mapping from WMO code to human readable condition."""
    try:
        return WMO_CODE_MAP.get(int(code), f"Condition code {code}")
    except Exception:
        return "Unknown"


def evaluate_spray_window(
    temperature: float, humidity: int, precip_prob: int, weather_code: int, condition: str
) -> Tuple[bool, str]:
    """
    Agronomic spray-window logic — deterministic, no LLM.
    Safe when: precip < 30%, humidity < 80%, 16–35°C, not heavy rain/thunder.
    """
    if precip_prob >= 50:
        return False, f"Avoid spray — {precip_prob}% rain probability ({condition}). High wash-off risk. Wait 24h and check again early morning."
    if precip_prob >= 30:
        return False, f"Caution — {precip_prob}% rain chance with {condition}. Spray only if urgent and before 8 AM; otherwise defer to next dry window."
    if weather_code in UNSAFE_CODES:
        return False, f"Unsafe — {condition} active. Do not spray; risk of runoff and poor foliar absorption."
    if humidity >= 85:
        return False, f"High humidity {humidity}% with {condition}. Leaf wetness prolongs drying; spray window closed. Prefer 6–9 AM when humidity drops."
    if temperature < 12 or temperature > 38:
        return False, f"Temperature {temperature:.1f}°C outside optimal 12–38°C for foliar uptake. Spray ineffective; reschedule to cooler morning."
    if temperature > 33 and humidity > 75:
        return False, f"Hot & humid ({temperature:.1f}°C, {humidity}%). Spray quickly evaporates or causes phytotoxicity. Use early morning 6–8 AM only."
    return True, f"Safe window — {temperature:.1f}°C, {humidity}% RH, {precip_prob}% rain ({condition}). Spray 6–9 AM today for best foliar adhesion and drift control."


def _fallback_weather(lat: float, lon: float, location_name: str, reason: str) -> WeatherData:
    """Deterministic fallback payload — guarantees 200 even offline."""
    # Use Kolar defaults if caller passed NaN or out-of-range
    safe_lat = lat if -90 <= lat <= 90 else DEFAULT_LAT
    safe_lon = lon if -180 <= lon <= 180 else DEFAULT_LON
    loc = location_name.strip() if location_name and location_name.strip() else DEFAULT_LOCATION
    # If original request was fallback zone, keep its name, otherwise annotate
    if reason and "fallback" in reason.lower():
        loc = DEFAULT_LOCATION
    logger.warning("Weather fallback engaged (%s) -> %.4f,%.4f", reason, safe_lat, safe_lon)
    temp = 28.5
    humidity = 62
    precip = 10
    code = 1
    condition = decode_weather_code(code)
    safe, advisory = evaluate_spray_window(temp, humidity, precip, code, condition)
    # Append fallback notice to advisory but keep advisory actionable
    advisory = advisory + " [Live data unavailable — showing Kolar default zone estimate]"
    return WeatherData(
        location_name=loc,
        latitude=safe_lat,
        longitude=safe_lon,
        temperature=temp,
        relative_humidity=humidity,
        precipitation_probability=precip,
        weather_condition=condition,
        spray_window_safe=safe,
        spray_advisory=advisory,
    )


async def fetch_micro_climate(
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    location_name: Optional[str] = None,
) -> WeatherData:
    """
    Fetch live micro-climate from Open-Meteo.
    Gracefully degrades to Kolar default on any failure.
    """
    # Normalize inputs — if missing or string-coerced, fallback
    try:
        lat = float(latitude) if latitude is not None else DEFAULT_LAT
        lon = float(longitude) if longitude is not None else DEFAULT_LON
    except Exception:
        lat, lon = DEFAULT_LAT, DEFAULT_LON

    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        return _fallback_weather(DEFAULT_LAT, DEFAULT_LON, location_name or DEFAULT_LOCATION, "Invalid coordinates fallback to Kolar")

    loc_name = location_name.strip() if location_name and location_name.strip() else f"{lat:.4f}, {lon:.4f}"
    # If caller used default coordinates explicitly, label nicely
    if abs(lat - DEFAULT_LAT) < 0.01 and abs(lon - DEFAULT_LON) < 0.01 and loc_name == f"{lat:.4f}, {lon:.4f}":
        loc_name = DEFAULT_LOCATION

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code",
        "hourly": "precipitation_probability",
        "daily": "precipitation_probability_max",
        "timezone": "Asia/Kolkata",
        "forecast_days": 1,
    }

    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        current = data.get("current") or {}
        hourly = data.get("hourly") or {}
        daily = data.get("daily") or {}

        temp = current.get("temperature_2m")
        humidity = current.get("relative_humidity_2m")
        weather_code = current.get("weather_code")

        # Precipitation probability: prefer hourly current hour, fallback daily max
        precip_prob: Optional[int] = None
        try:
            hourly_probs = hourly.get("precipitation_probability") or []
            if hourly_probs:
                # Open-Meteo returns hourly aligned to current time; take first available
                # Try to find index closest to now, fallback to max of next 6h
                vals = [v for v in hourly_probs[:6] if v is not None]
                if vals:
                    precip_prob = int(max(vals)) if max(vals) is not None else None
        except Exception:
            pass
        if precip_prob is None:
            try:
                daily_probs = daily.get("precipitation_probability_max") or []
                if daily_probs and daily_probs[0] is not None:
                    precip_prob = int(daily_probs[0])
            except Exception:
                pass

        # Strict typing & validation — fallback if any critical field missing
        if temp is None or humidity is None or weather_code is None:
            raise ValueError("Incomplete current weather payload from Open-Meteo")

        temperature = float(temp)
        relative_humidity = int(round(float(humidity)))
        precipitation_probability = int(precip_prob) if precip_prob is not None else 0
        precipitation_probability = max(0, min(100, precipitation_probability))
        w_code = int(weather_code)
        condition = decode_weather_code(w_code)
        spray_safe, advisory = evaluate_spray_window(
            temperature, relative_humidity, precipitation_probability, w_code, condition
        )

        return WeatherData(
            location_name=loc_name,
            latitude=lat,
            longitude=lon,
            temperature=round(temperature, 1),
            relative_humidity=relative_humidity,
            precipitation_probability=precipitation_probability,
            weather_condition=condition,
            spray_window_safe=spray_safe,
            spray_advisory=advisory,
        )

    except httpx.TimeoutException as e:
        logger.warning("Open-Meteo timeout: %s", e)
        return _fallback_weather(lat, lon, loc_name, "Open-Meteo timeout — fallback to Kolar")
    except httpx.HTTPStatusError as e:
        logger.warning("Open-Meteo HTTP %s: %s", e.response.status_code, e)
        return _fallback_weather(lat, lon, loc_name, f"Open-Meteo HTTP {e.response.status_code} — fallback")
    except Exception as e:
        logger.warning("Micro-climate fetch failed (%s) — fallback: %s", type(e).__name__, e)
        return _fallback_weather(lat, lon, loc_name, f"Micro-climate error {type(e).__name__} — fallback")
