from fastapi import APIRouter

from app.api.v1 import auth, diagnose, soil, mandi, weather, search
from app.models.schemas import OrchestratePayload, UnifiedActionPlanResponse
from app.services.agronomy_engine import analyze_soil
from app.services.mandi_engine import get_rates
from app.services.gemini_service import orchestrate_decision
from app.models.schemas import SoilAnalysisResponse
from fastapi import HTTPException
from app.core.logger import logger

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(diagnose.router)
api_router.include_router(soil.router)
api_router.include_router(mandi.router)
api_router.include_router(weather.router)
api_router.include_router(search.router)

@api_router.post("/orchestrate", response_model=UnifiedActionPlanResponse, tags=["orchestrate"])
async def orchestrate(payload: OrchestratePayload):
    try:
        if payload.soil:
            soil_result = analyze_soil(payload.soil)
        else:
            soil_result = SoilAnalysisResponse(status="Good", deficiencies=[], recommendation="Standard maintenance schedule. Soil profile within range.", suitability_score=85)
        rates = get_rates(payload.crop_filter)
        action_plan = await orchestrate_decision(user_query=payload.user_query, soil=soil_result, disease=payload.last_diagnosis, mandi_rates=rates)
        return action_plan
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Orchestrate failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
