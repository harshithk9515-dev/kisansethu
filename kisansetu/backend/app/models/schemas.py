from pydantic import BaseModel, Field
from typing import List, Literal, Optional

class DiagnosisResponse(BaseModel):
    disease: str = Field(description="Detected disease name")
    confidence: str = Field(description="Confidence percentage string e.g. 92%")
    pathogen: str = Field(description="Pathogen type e.g. Fungal, Bacterial, Viral")
    severity: Literal["Low", "Moderate", "Severe"] = Field(description="Severity level")
    description: str = Field(description="Symptom description")
    organic_remedy: str = Field(description="Organic treatment")
    chemical_remedy: str = Field(description="Chemical treatment")
    advisory_en: str = Field(description="Advisory in English")
    advisory_kn: str = Field(description="Advisory in Kannada")

class SoilAnalysisRequest(BaseModel):
    nitrogen: float = Field(ge=0, le=200, description="Nitrogen kg/ha")
    phosphorus: float = Field(ge=0, le=150, description="Phosphorus kg/ha")
    potassium: float = Field(ge=0, le=200, description="Potassium kg/ha")
    ph: float = Field(ge=3.5, le=9.5, description="Soil pH")
    crop: str = Field(description="Crop name e.g. Tomato, Potato, Wheat, Cotton, Paddy")

class SoilAnalysisResponse(BaseModel):
    status: str = Field(description="Overall soil health status")
    deficiencies: List[str] = Field(description="List of deficiencies")
    recommendation: str = Field(description="Fertilizer and amendment recommendation")
    suitability_score: int = Field(ge=0, le=100, description="Suitability score 0-100")

class MandiRate(BaseModel):
    crop: str
    mandi: str
    state: str
    modal_price: float = Field(description="Modal price per quintal in INR")
    change_pct: float = Field(description="Percent change vs previous")
    trend: Literal["up", "down", "neutral"]
    signal: Literal["BUY", "SELL", "HOLD"]

class UnifiedActionPlanResponse(BaseModel):
    soil_summary: SoilAnalysisResponse
    disease_summary: Optional[DiagnosisResponse] = None
    mandi_highlights: List[MandiRate]
    executive_advisory_en: str
    executive_advisory_kn: str
    priority_action: str

class WeatherData(BaseModel):
    location_name: str = Field(description="Human-readable location or agro-climatic zone")
    latitude: float = Field(ge=-90, le=90, description="Latitude in decimal degrees")
    longitude: float = Field(ge=-180, le=180, description="Longitude in decimal degrees")
    temperature: float = Field(description="Current temperature in °C")
    relative_humidity: int = Field(ge=0, le=100, description="Relative humidity %")
    precipitation_probability: int = Field(ge=0, le=100, description="Precipitation probability %")
    weather_condition: str = Field(description="WMO decoded condition e.g. Clear sky, Light rain")
    spray_window_safe: bool = Field(description="True if conditions are safe for foliar spray")
    spray_advisory: str = Field(description="Actionable spray window advisory for farmer")

# Auth schemas
class OTPRequest(BaseModel):
    phone: str = Field(description="10-digit Indian mobile number without +91", pattern=r"^[6-9]\d{9}$")

class OTPVerifyRequest(BaseModel):
    phone: str = Field(description="10-digit Indian mobile number", pattern=r"^[6-9]\d{9}$")
    otp: str = Field(description="4-digit OTP", pattern=r"^\d{4}$")

class FarmerProfile(BaseModel):
    id: str = Field(description="Farmer ID e.g. FARM-9021")
    name: str = Field(description="Farmer display name")
    phone: str = Field(description="Full phone with +91 prefix")
    raw_phone: str = Field(description="10-digit raw phone")
    district: str
    state: str
    landSize: str = Field(description="e.g. 3.5 Acres")
    primaryCrop: str
    acres: float = Field(description="Numeric acres for calculators")

class AuthResponse(BaseModel):
    success: bool
    message: str
    farmer: Optional[FarmerProfile] = None
    demo_otp: Optional[str] = Field(default=None, description="Demo OTP for evaluator")

class SearchQueryRequest(BaseModel):
    query: str
    language: Optional[str] = "EN"

class OrchestratePayload(BaseModel):
    user_query: Optional[str] = None
    soil: Optional[SoilAnalysisRequest] = None
    crop_filter: Optional[str] = "Tomato"
    last_diagnosis: Optional[DiagnosisResponse] = None
