from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.utils.db import get_db
from app.utils.dependencies import get_current_user, require_admin
from app.models.user import User
from app.schemas.auth_schema import (
    AdminRegisterRequest, CreateHRRequest, CandidateRegisterRequest,
    LoginRequest, TokenResponse, UserResponse,
    ChangePasswordRequest, UpdateProfileRequest,
)
from app.services.auth_service import (
    register_admin, create_hr_user, register_candidate,
    login_user, get_all_hr_users, deactivate_user,
    change_password, update_profile,
)

router = APIRouter(prefix="/api/auth")

# ── Public ──────────────────────────────────────────────────
@router.post("/register/candidate", tags=["Public"])
def candidate_register(data: CandidateRegisterRequest, db: Session = Depends(get_db)):
    return register_candidate(data, db)

@router.post("/login", response_model=TokenResponse, tags=["Public"])
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Single login endpoint for Admin, HR, and Candidate."""
    return login_user(data, db)

# ── Admin setup (one-time, blocked after first admin exists) ─
@router.post("/register/admin", tags=["Admin"])
def admin_register(data: AdminRegisterRequest, db: Session = Depends(get_db)):
    """One-time admin setup. Automatically blocked once an admin exists."""
    return register_admin(data, db)

# ── Admin only ──────────────────────────────────────────────
@router.post("/create-hr", tags=["Admin"])
def create_hr(data: CreateHRRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    """Admin creates HR account with name + password. HR can change password later."""
    return create_hr_user(data, db, admin)

@router.get("/hr-users", response_model=list[UserResponse], tags=["Admin"])
def list_hr_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return get_all_hr_users(db)

@router.delete("/deactivate/{user_uuid}", tags=["Admin"])
def deactivate(user_uuid: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    """Deactivate any HR or Candidate account. Deactivated users cannot login."""
    return deactivate_user(user_uuid, db)

# ── My Account — all 3 roles ────────────────────────────────
@router.get("/me", response_model=UserResponse, tags=["My Account"])
def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me/profile", response_model=UserResponse, tags=["My Account"])
def update_my_profile(data: UpdateProfileRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return update_profile(current_user, data.name, data.email, db)

@router.patch("/me/change-password", tags=["My Account"])
def change_my_password(data: ChangePasswordRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return change_password(current_user, data.current_password, data.new_password, db)