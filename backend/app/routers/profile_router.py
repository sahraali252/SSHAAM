from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ProfessionalProfile, User
from app.schemas import ProfessionalProfileResponse, ProfessionalProfileUpsert


router = APIRouter(
    prefix="/profiles",
    tags=["Professional Profiles"],
)


@router.get("/{user_id}", response_model=ProfessionalProfileResponse)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    profile = (
        db.query(ProfessionalProfile)
        .filter(ProfessionalProfile.user_id == user_id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Professional profile not found",
        )

    return profile


@router.put("/{user_id}", response_model=ProfessionalProfileResponse)
def create_or_update_profile(
    user_id: int,
    profile_data: ProfessionalProfileUpsert,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    profile = (
        db.query(ProfessionalProfile)
        .filter(ProfessionalProfile.user_id == user_id)
        .first()
    )

    if profile:
        for field, value in profile_data.model_dump().items():
            setattr(profile, field, value)
    else:
        profile = ProfessionalProfile(
            user_id=user_id,
            **profile_data.model_dump(),
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)

    return profile