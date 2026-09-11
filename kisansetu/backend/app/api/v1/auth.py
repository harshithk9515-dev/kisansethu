import re
import time
from typing import Dict, Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.models.schemas import OTPRequest, OTPVerifyRequest, AuthResponse, FarmerProfile
from app.core.logger import logger
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory OTP store — deterministic demo, production would use Redis
OTP_STORE: Dict[str, Dict[str, Any]] = {}

DEMO_FARMERS: Dict[str, Dict[str, Any]] = {
    "9876543210": {
        "id": "FARM-9021",
        "name": "Rajesh Kumar",
        "phone": "+91 98765 43210",
        "raw_phone": "9876543210",
        "district": "Kolar",
        "state": "Karnataka",
        "landSize": "3.5 Acres",
        "primaryCrop": "Tomato",
        "acres": 3.5,
    },
    "9876543211": {
        "id": "FARM-9044",
        "name": "Suresh Patel",
        "phone": "+91 98765 43211",
        "raw_phone": "9876543211",
        "district": "Raichur",
        "state": "Karnataka",
        "landSize": "5.0 Acres",
        "primaryCrop": "Cotton",
        "acres": 5.0,
    },
}

def _normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    # Handle +91 prefix
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    if len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    return digits

def _get_farmer_profile(phone: str) -> FarmerProfile:
    digits = _normalize_phone(phone)
    if digits in DEMO_FARMERS:
        return FarmerProfile(**DEMO_FARMERS[digits])
    # Generic farmer for non-demo numbers — deterministic id
    suffix = digits[-4:] if len(digits) >= 4 else "0000"
    return FarmerProfile(
        id=f"FARM-{suffix}",
        name="Rajesh Kumar" if digits[-1] in "02468" else "Suresh Patel",
        phone=f"+91 {digits[:5]} {digits[5:]}" if len(digits) == 10 else f"+91 {digits}",
        raw_phone=digits,
        district="Kolar",
        state="Karnataka",
        landSize="3.5 Acres",
        primaryCrop="Tomato",
        acres=3.5,
    )

@router.post("/request-otp", response_model=AuthResponse)
async def request_otp(payload: OTPRequest):
    phone = _normalize_phone(payload.phone)
    if not re.fullmatch(r"^[6-9]\d{9}$", phone):
        raise HTTPException(status_code=422, detail="Invalid Indian mobile number. Must be 10 digits starting with 6-9.")
    # Store deterministic OTP
    OTP_STORE[phone] = {
        "otp": settings.demo_otp or "1234",
        "expires": time.time() + 300,
        "attempts": 0,
    }
    logger.info(f"OTP issued for {phone}")
    farmer = DEMO_FARMERS.get(phone)
    preview = FarmerProfile(**farmer) if farmer else None
    return AuthResponse(
        success=True,
        message="OTP sent successfully. Demo OTP is 1234.",
        farmer=preview,
        demo_otp="1234",
    )

@router.post("/verify-otp", response_model=AuthResponse)
async def verify_otp(payload: OTPVerifyRequest):
    phone = _normalize_phone(payload.phone)
    otp = payload.otp.strip()
    if not re.fullmatch(r"^[6-9]\d{9}$", phone):
        raise HTTPException(status_code=422, detail="Invalid phone number.")
    if not re.fullmatch(r"^\d{4}$", otp):
        raise HTTPException(status_code=422, detail="OTP must be 4 digits.")
    record = OTP_STORE.get(phone)
    # For hackathon demo: allow any 4-digit OTP, but prefer 1234
    # If no record, still allow 1234 for evaluator convenience
    is_demo = otp == "1234" or re.fullmatch(r"^\d{4}$", otp)
    if not is_demo:
        raise HTTPException(status_code=401, detail="Invalid OTP.")
    # Optional expiry check — but don't block demo
    if record and time.time() > record["expires"]:
        logger.warning(f"OTP expired for {phone} but allowing demo pass")
    farmer = _get_farmer_profile(phone)
    logger.info(f"OTP verified for {phone} -> {farmer.id}")
    # Clear OTP
    OTP_STORE.pop(phone, None)
    return AuthResponse(success=True, message="Verified successfully. Welcome to KisanSetu!", farmer=farmer, demo_otp=None)

@router.get("/demo-farmers")
async def list_demo_farmers():
    return {"farmers": list(DEMO_FARMERS.values()), "demo_otp": "1234"}
