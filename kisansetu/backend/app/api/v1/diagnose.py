from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.models.schemas import DiagnosisResponse
from app.services.gemini_service import diagnose_leaf
from app.core.logger import logger

router = APIRouter(prefix="/diagnose", tags=["diagnose"])

ALLOWED_MIME = {"image/jpeg", "image/png", "image/jpg", "image/webp", "image/bmp"}

@router.post("", response_model=DiagnosisResponse)
async def diagnose(image: UploadFile = File(...), plant_type: str = Form("Tomato")):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image format.")
    try:
        image_bytes = await image.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded image is empty.")
        if len(image_bytes) > 8 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image too large, max 8MB")
        result = await diagnose_leaf(image_bytes, plant_type, image.content_type)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Diagnosis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
