from ultralytics import YOLO
import base64
import time
import io
import os
from dotenv import load_dotenv
from PIL import Image
from schemas import Detection, PredictResponse

# Load environment variables
load_dotenv()

# Load model once when starting the server
model_path = os.getenv("YOLO_MODEL_PATH", "models/best.pt")
model = YOLO(model_path)

def run_inference(image: Image.Image) -> PredictResponse:
    start = time.time()

    results = model.predict(image, conf=0.5)
    result = results[0]

    #Bounding boxes
    detections = []
    for box in result.boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        conf = float(box.conf[0])
        detections.append(Detection(x1=x1, y1=y1, x2=x2, y2=y2, confidence=conf))

    # Convert image result to base64
    result_image = Image.fromarray(result.plot()[:, :, ::-1])
    buffer = io.BytesIO()
    result_image.save(buffer, format="JPEG")
    img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    elapsed = (time.time() - start) * 1000

    return PredictResponse(
        count=len(detections),
        detections=detections,
        processing_time_ms=round(elapsed, 2),
        result_image_base64=img_base64
    )