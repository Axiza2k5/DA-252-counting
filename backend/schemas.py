from pydantic import BaseModel
from typing import List

class Detection(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float

class PredictResponse(BaseModel):
    count: int
    detections: List[Detection]
    processing_time_ms: float
    result_image_base64: str