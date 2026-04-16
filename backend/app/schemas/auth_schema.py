from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class AdminRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class CreateHRRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class CandidateRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UpdateProfileRequest(BaseModel):
    name: str | None = None
    email: EmailStr | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str        # ← str UUID
    name: str
    role: str


class UserResponse(BaseModel):
    id: str             # ← str UUID
    name: str
    email: str
    role: UserRole
    is_active: str

    model_config = {"from_attributes": True}