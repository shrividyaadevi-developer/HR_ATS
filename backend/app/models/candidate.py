import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.utils.db import Base
import enum


class CandidateStatus(str, enum.Enum):
    pending = "pending"
    shortlisted = "shortlisted"
    rejected = "rejected"
    selected = "selected"


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    job_title = Column(String(100), nullable=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=False)       # required

    resume_path = Column(String(300), nullable=False)
    resume_text = Column(Text, nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    similarity_score = Column(Integer, nullable=True)
    ai_score = Column(Integer, nullable=True)
    ai_reason = Column(Text, nullable=True)
    ai_status = Column(String(20), nullable=True)

    hr_override = Column(Enum("yes", "no", "none"), default="none")
    final_status = Column(Enum(CandidateStatus), default=CandidateStatus.pending)

    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    job = relationship("Job", back_populates="candidates")
    interviews = relationship("Interview", back_populates="candidate", cascade="all, delete")
    selected_record = relationship("SelectedCandidate", back_populates="candidate", uselist=False, cascade="all, delete")