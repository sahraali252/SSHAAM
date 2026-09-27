from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session=Depends(get_db)):

    email_in_use = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )
    if email_in_use is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="An account with this email already exists"
        )

    user = User(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
        role=user_data.role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

@router.post("/login")
def login_user(email: str, password: str, db: Session = Depends(get_db)):

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )
    if user is None or user.password != password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="incorrect email or password"
        )

    return {
        "message": "Login successful",
        "user_id": user.id,
        "email": user.email
    }