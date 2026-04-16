from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InterviewCreate(BaseModel):
    candidate_id: str
    job_id: Optional[str] = None        # new
    job_title: Optional[str] = None      # new
    scheduled_at: datetime
    round: str = "1"
    mode: str = "Online"
    location: Optional[str] = None
    notes: Optional[str] = None
    send_email: bool = True


class InterviewUpdate(BaseModel):
    job_id: Optional[str] = None
    job_title: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    round: Optional[str] = None
    mode: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class InterviewResponse(BaseModel):
    id: str
    candidate_id: str
    job_id: Optional[str] = None
    job_title: Optional[str] = None
    scheduled_at: datetime
    round: str
    mode: str
    location: Optional[str]
    notes: Optional[str]
    email_sent: str
    created_at: datetime

    model_config = {"from_attributes": True}