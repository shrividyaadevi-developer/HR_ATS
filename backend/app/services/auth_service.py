from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.schemas.auth_schema import (
    AdminRegisterRequest,
    CreateHRRequest,
    CandidateRegisterRequest,
    LoginRequest,
    TokenResponse,
)
from app.utils.security import hash_password, verify_password, create_access_token


def register_admin(data: AdminRegisterRequest, db: Session) -> dict:
    existing_admin = db.query(User).filter(User.role == UserRole.admin).first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="An admin already exists. Ask the admin to create your account.",
        )
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=UserRole.admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Admin registered successfully.", "user_id": str(user.id)}


def create_hr_user(data: CreateHRRequest, db: Session, admin: User) -> dict:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=UserRole.hr,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": f"HR user '{data.name}' created successfully.", "user_id": str(user.id)}


def register_candidate(data: CandidateRegisterRequest, db: Session) -> dict:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=UserRole.candidate,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Candidate registered successfully.", "user_id": str(user.id), "role": "candidate"}


def login_user(data: LoginRequest, db: Session) -> TokenResponse:
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    if user.is_active != "true":
        raise HTTPException(status_code=403, detail="Your account has been deactivated.")

    token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user_id=str(user.id),    # ← str()
        name=user.name,
        role=user.role.value,
    )


def get_all_hr_users(db: Session) -> list:
    return db.query(User).filter(User.role == UserRole.hr).all()


def deactivate_user(user_uuid: str, db: Session) -> dict:    # ← str not int
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.role == UserRole.admin:
        raise HTTPException(status_code=400, detail="Cannot deactivate an admin account.")
    user.is_active = "false"
    db.commit()
    return {"message": f"User '{user.name}' ({user.role.value}) deactivated."}


def change_password(user: User, current_password: str, new_password: str, db: Session) -> dict:
    if not verify_password(current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")
    user.hashed_password = hash_password(new_password)
    db.commit()
    return {"message": "Password updated successfully."}


def update_profile(user: User, name: str | None, email: str | None, db: Session) -> User:
    if name:
        user.name = name
    if email:
        existing = db.query(User).filter(User.email == email, User.id != user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use.")
        user.email = email
    db.commit()
    db.refresh(user)
    return user