from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.sql import func
from app.utils.db import Base
import enum
import uuid


class UserRole(str, enum.Enum):
    admin = "admin"
    hr = "hr"
    candidate = "candidate"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.candidate, nullable=False)
    is_active = Column(String(5), default="true")
    created_at = Column(DateTime(timezone=True), server_default=func.now())