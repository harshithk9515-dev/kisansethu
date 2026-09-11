from typing import Optional, List

from fastapi import APIRouter, Query, HTTPException

from app.models.schemas import MandiRate
from app.services.mandi_engine import get_rates
from app.core.logger import logger

router = APIRouter(prefix="/mandi", tags=["mandi"])

@router.get("/rates", response_model=List[MandiRate])
async def rates(crop: Optional[str] = Query(None, description="Filter by crop name")):
    try:
        return get_rates(crop)
    except Exception as e:
        logger.exception(f"Mandi rates failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
