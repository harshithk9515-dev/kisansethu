from fastapi import APIRouter

from app.models.schemas import SearchQueryRequest
from app.services.gemini_service import search_advisory

router = APIRouter(prefix="/search", tags=["search"])

@router.post("/ask")
async def ask(req: SearchQueryRequest):
    result = await search_advisory(query=req.query, language=req.language or "EN")
    return result
