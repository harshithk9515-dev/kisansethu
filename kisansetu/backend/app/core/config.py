from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    app_name: str = Field(default="KisanSetu Backend")
    version: str = Field(default="2.0.0")
    environment: str = Field(default="production")

    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    google_api_key: str = Field(default="", alias="GOOGLE_API_KEY")

    # CORS — dynamic FRONTEND_URL + localhost + Vercel previews
    cors_origins: List[str] = Field(default_factory=lambda: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ])
    frontend_url: str = Field(default="", alias="FRONTEND_URL")
    # Allow Vercel preview wildcard via regex in main.py (https://*.vercel.app)

    # Upload limits
    max_upload_mb: int = Field(default=8)

    # Weather defaults
    default_lat: float = Field(default=13.1378)
    default_lon: float = Field(default=78.1291)
    default_location: str = Field(default="Kolar, Karnataka (Default Agro-Climatic Zone)")

    # OTP demo
    demo_otp: str = Field(default="1234")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"
        populate_by_name = True

settings = Settings()
