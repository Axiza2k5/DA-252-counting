from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
from model import run_inference

app = FastAPI(title="Aquatic Seed Counter")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Check file type
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Chỉ chấp nhận JPG, PNG, WEBP")

    # Read image
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="File quá lớn, tối đa 10MB")

    image = Image.open(io.BytesIO(contents)).convert("RGB")

    result = run_inference(image)
    return result