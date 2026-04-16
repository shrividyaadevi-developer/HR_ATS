from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.utils.db import get_db
from app.utils.dependencies import require_admin_or_hr
from app.models.user import User
from app.models.job import Job
from app.models.candidate import Candidate
from app.schemas.job_schema import JobCreate, JobUpdate, JobResponse

router = APIRouter(prefix="/api/jobs")


@router.get("/search", response_model=list[JobResponse], tags=["Candidate"])
def search_jobs(
    q: str = None,
    skills: str = None,
    db: Session = Depends(get_db)
):
    """
    Candidate job search.
    - ?q=python developer  → searches title + description
    - ?skills=fastapi       → searches required skills
    - combine both: ?q=backend&skills=python
    """
    query = db.query(Job).filter(Job.status == "active")
    if q:
        query = query.filter(
            Job.job_title.ilike(f"%{q}%") | Job.description.ilike(f"%{q}%")
        )
    if skills:
        query = query.filter(Job.skills.ilike(f"%{skills}%"))
    jobs = query.order_by(Job.created_at.desc()).all()
    return [_job_with_count(j, db) for j in jobs]


@router.get("/", response_model=list[JobResponse], tags=["Public"])
def get_all_jobs(
    job_title: str = None,
    skills: str = None,
    status: str = None,
    db: Session = Depends(get_db)
):
    """
    Browse all jobs. Candidates can search using:
    - ?title=python       → filter by job title keyword
    - ?skills=react       → filter by skills keyword
    - ?status=active      → filter by status (active/expired)
    """
    query = db.query(Job)
    if job_title:
        query = query.filter(Job.job_title.ilike(f"%{job_title}%"))
    if skills:
        query = query.filter(Job.skills.ilike(f"%{skills}%"))
    if status:
        query = query.filter(Job.status == status)
    jobs = query.order_by(Job.created_at.desc()).all()
    return [_job_with_count(j, db) for j in jobs]


@router.get("/{job_id}", response_model=JobResponse, tags=["Public"])
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return _job_with_count(job, db)


@router.post("/", response_model=JobResponse, tags=["HR"])
def create_job(data: JobCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_hr)):
    job = Job(**data.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return _job_with_count(job, db)


@router.put("/{job_id}", response_model=JobResponse, tags=["HR"])
def update_job(job_id: str, data: JobUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_hr)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(job, field, val)
    db.commit()
    db.refresh(job)
    return _job_with_count(job, db)


@router.delete("/{job_id}", tags=["HR"])
def delete_job(job_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_hr)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully."}


def _job_with_count(job: Job, db: Session) -> dict:
    count = db.query(Candidate).filter(Candidate.job_id == job.id).count()
    data = JobResponse.model_validate(job).model_dump()
    data["applicant_count"] = count
    return data