import uuid
from sqlalchemy import Column, String, Text, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.utils.db import Base
import enum


class JobStatus(str, enum.Enum):
    active = "active"
    expired = "expired"


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    job_title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    skills = Column(Text, nullable=False)
    keywords = Column(Text, nullable=True)
    status = Column(Enum(JobStatus), default=JobStatus.active)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    candidates = relationship("Candidate", back_populates="job", cascade="all, delete")