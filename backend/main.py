from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import model, auth
from database.database import engine
from database import models as db_models
from utils.limiter import limiter
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

# Create database tables
db_models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Aquatic Seed Counter")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda request, exc: JSONResponse(status_code=429, content={"detail": "Too many requests"}))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(model.router)

@app.get("/")
def health():
    return {"status": "ok"}
