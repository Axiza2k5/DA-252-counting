import os
import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import uvicorn

app = FastAPI(title="Fish AI Count Backend")

# Cấu hình CORS cực kỳ quan trọng để Vercel gọi thiết bị Local (qua Ngrok)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong môi trường production thực có thể giới hạn URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo model AI (bạn cần đảm bảo best.pt ở cùng thư mục hoặc chỉnh path)
MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "best.pt")
model = None

@app.on_event("startup")
def load_model():
    global model
    try:
        model = YOLO(MODEL_PATH)
        print(f"Loaded model from {MODEL_PATH}")
    except Exception as e:
        print(f"Warning: Could not load model from {MODEL_PATH}. Error: {e}")

@app.get("/")
def read_root():
    return {"message": "Fish AI Count API is running", "model_loaded": model is not None}

@app.post("/predict")
async def predict_fish(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Mô hình AI chưa được tải (không tìm thấy best.pt)")
    
    try:
        # Đọc ảnh từ request
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Nhận diện cá với YOLO
        results = model.predict(source=image, conf=0.25)
        
        # Đếm số lượng cá được nhận diện
        count = len(results[0].boxes)
        
        return {
            "count": count,
            "message": "Phát hiện thành công"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
