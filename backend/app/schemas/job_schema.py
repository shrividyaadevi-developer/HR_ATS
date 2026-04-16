from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.job import JobStatus


class JobCreate(BaseModel):
    job_title: str
    description: str
    skills: str
    keywords: Optional[str] = None


class JobUpdate(BaseModel):
    job_title: Optional[str] = None
    description: Optional[str] = None
    skills: Optional[str] = None
    keywords: Optional[str] = None
    status: Optional[JobStatus] = None


class JobResponse(BaseModel):
    id: str
    job_title: str
    description: str
    skills: str
    keywords: Optional[str]
    status: JobStatus
    created_at: datetime
    applicant_count: Optional[int] = 0

    model_config = {"from_attributes": True}