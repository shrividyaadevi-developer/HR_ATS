from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.candidate import CandidateStatus


class JobBasicInfo(BaseModel):
    job_title: str
    skills: str
   
    model_config = {"from_attributes": True}


class MyApplicationResponse(BaseModel):
    job_id: str
    job: JobBasicInfo          # ← nested job info
    final_status: CandidateStatus
    applied_at: datetime

    model_config = {"from_attributes": True}


class CandidateResponse(BaseModel):
    id: str
    job_id: str
    job_title: Optional[str]
    name: str
    email: str
    resume_path: str
    linkedin_url: Optional[str] = None
    similarity_score: Optional[int]   # was float
    ai_score: Optional[int]           # was float
    ai_reason: Optional[str]
    ai_status: Optional[str]
    hr_override: str
    final_status: CandidateStatus
    applied_at: datetime

    model_config = {"from_attributes": True}


class HROverrideRequest(BaseModel):
    override: str  # "yes" | "no" | "none"