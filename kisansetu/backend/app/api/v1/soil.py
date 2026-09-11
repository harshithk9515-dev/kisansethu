from fastapi import APIRouter, HTTPException

from app.models.schemas import SoilAnalysisRequest, SoilAnalysisResponse
from app.services.agronomy_engine import analyze_soil
from app.core.logger import logger

router = APIRouter(prefix="/soil", tags=["soil"])

@router.post("/analyze", response_model=SoilAnalysisResponse)
async def analyze(req: SoilAnalysisRequest):
    try:
        return analyze_soil(req)
    except Exception as e:
        logger.exception(f"Soil analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
