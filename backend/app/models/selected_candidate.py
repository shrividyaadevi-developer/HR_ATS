import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.utils.db import Base
import enum


class OfferLetterStatus(str, enum.Enum):
    pending = "pending"
    sent = "sent"


class SelectedCandidate(Base):
    __tablename__ = "selected_candidates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), unique=True, nullable=False)

    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    job_title = Column(String(200), nullable=False)
    job_id = Column(String(36), nullable=False)

    rounds_cleared = Column(String(10), nullable=True)   # e.g. "3"
    offer_letter_path = Column(String(300), nullable=True)
    selected_at = Column(DateTime(timezone=True), server_default=func.now())
    offer_letter_status = Column(Enum(OfferLetterStatus), default=OfferLetterStatus.pending)

    candidate = relationship("Candidate", back_populates="selected_record")