from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.utils.db import get_db
from app.utils.dependencies import require_admin_or_hr
from app.models.user import User
from app.schemas.interview_schema import InterviewCreate, InterviewUpdate, InterviewResponse
from app.services.interview_service import (
    schedule_interview, update_interview, get_all_interviews, delete_interview,
)

router = APIRouter(prefix="/api/interviews")


@router.get("/", response_model=list[InterviewResponse], tags=["HR"])
def list_interviews(db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_hr)):
    """List all scheduled interviews across all rounds."""
    return get_all_interviews(db)


@router.post("/", response_model=InterviewResponse, tags=["HR"])
def create_interview(data: InterviewCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_hr)):
    """
    Schedule an interview for any round.
    - Round 1 → shortlist email + interview details email
    - Round 2, 3... → selected for next round email + interview details email
    - Same candidate can have multiple rounds (Round 1, Round 2, Round 3...)
    - Same round cannot be scheduled twice — use PUT to reschedule
    """
    return schedule_interview(data, db)


@router.put("/{interview_id}", response_model=InterviewResponse, tags=["HR"])
def reschedule(interview_id: str, data: InterviewUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_hr)):
    """Reschedule an existing interview. Sends reschedule email to candidate."""
    return update_interview(interview_id, data, db)


@router.delete("/{interview_id}", tags=["HR"])
def delete(interview_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_hr)):
    """Delete/cancel an interview."""
    return delete_interview(interview_id, db)