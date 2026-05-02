from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status 
from PIL import Image
import io

from services.model import run_inference
from database.schemas import PredictResponse
from database.models import DBUser
from services.auth import get_current_user

router = APIRouter(prefix="/predict", tags=["model"])

@router.post("", response_model=PredictResponse)
async def predict(file: UploadFile = File(...), current_user: DBUser = Depends(get_current_user)):
    # Check file type
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only accept JPG, PNG, WEBP")

    # Read image
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large, maximum 10MB")

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        result = run_inference(image)
        return result
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image file or cannot be processed")
