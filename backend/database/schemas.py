from pydantic import BaseModel, Field
from typing import List, Optional

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

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    password: str = Field(..., min_length=8, max_length=64)

class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    password: str = Field(..., min_length=8, max_length=64)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenWithRefresh(Token):
    refresh_token: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenData(BaseModel):
    username: Optional[str] = None