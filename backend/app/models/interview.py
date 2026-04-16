import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.utils.db import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)  # new
    job_title = Column(String(100), nullable=True)  # new: role candidate is applying for

    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    round = Column(String(10), default="1")
    mode = Column(String(50), default="Online")
    location = Column(String(200), nullable=True)
    notes = Column(String(500), nullable=True)
    email_sent = Column(String(5), default="false")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    candidate = relationship("Candidate", back_populates="interviews")