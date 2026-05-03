from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database.schemas import UserRegister, Token, TokenWithRefresh, RefreshTokenRequest
from services.auth import (
    create_access_token, 
    create_refresh_token,
    get_password_hash, 
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    verify_password,
    verify_refresh_token
)
from datetime import timedelta

from database.database import get_db
from database.models import DBUser
from utils.limiter import limiter

router = APIRouter(tags=["users"])

@router.post("/register")
@limiter.limit("3/minute")
async def register(request: Request, user_in: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.username == user_in.username).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST , detail="Username already registered")
    
    hashed_password = get_password_hash(user_in.password)
    
    new_user = DBUser(
        username=user_in.username,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"detail": "User registered successfully"}

@router.post("/login", response_model=TokenWithRefresh)
@limiter.limit("5/minute")
async def login_for_refresh_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(
        data={"sub": user.username}, expires_delta=refresh_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}

@router.post("/refresh", response_model=Token)
async def refresh_access_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    username = verify_refresh_token(request.refresh_token)
    user = db.query(DBUser).filter(DBUser.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
