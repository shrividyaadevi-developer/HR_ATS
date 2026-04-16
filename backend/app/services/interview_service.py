from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.interview import Interview
from app.models.candidate import Candidate, CandidateStatus
from app.schemas.interview_schema import InterviewCreate, InterviewUpdate
from app.services.email_service import (
    send_round_selection_email,
    send_interview_email,
    send_final_selection_email,
    send_reschedule_email,
)


def schedule_interview(data: InterviewCreate, db: Session) -> Interview:
    candidate = db.query(Candidate).filter(Candidate.id == data.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    if candidate.hr_override != "yes":
        raise HTTPException(status_code=400, detail="Only HR-approved candidates can be scheduled for interviews.")

    # Use job_id and job_title from data, fallback to candidate's applied job
    job_id = data.job_id or candidate.job_id
    job_title = data.job_title or getattr(candidate.job, "job_title", "N/A")

    # Check if this specific round already scheduled
    existing_round = db.query(Interview).filter(
        Interview.candidate_id == candidate.id,
        Interview.round == data.round
    ).first()
    if existing_round:
        raise HTTPException(status_code=400, detail=f"Round {data.round} already scheduled. Use update to reschedule.")

    interview = Interview(
        candidate_id=candidate.id,
        job_id=job_id,
        job_title=job_title,
        scheduled_at=data.scheduled_at,
        round=data.round,
        mode=data.mode,
        location=data.location,
        notes=data.notes,
    )
    db.add(interview)

    # Set candidate status to shortlisted
    candidate.final_status = CandidateStatus.shortlisted
    db.commit()
    db.refresh(interview)

    if data.send_email:
        try:
            send_round_selection_email(
                candidate_name=candidate.name,
                candidate_email=candidate.email,
                job_title=job_title,
                round_number=data.round,
            )
            send_interview_email(
                candidate_name=candidate.name,
                candidate_email=candidate.email,
                job_title=job_title,
                round_number=data.round,
                scheduled_at=interview.scheduled_at.strftime("%d %B %Y, %I:%M %p"),
                mode=interview.mode,
                location=interview.location,
                notes=interview.notes,
            )
            print(f"[EMAIL] Round {data.round} emails sent to {candidate.email}")
            interview.email_sent = "true"
            db.commit()
        except Exception as e:
            print(f"[EMAIL] Failed: {e}")

    return interview

def send_final_selection(candidate_id: str, db: Session) -> dict:
    """HR sends final selection email after all rounds cleared."""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    
    if candidate.final_status != CandidateStatus.shortlisted:
        raise HTTPException(status_code=400, detail="Candidate must be shortlisted to send final selection email.")
    
    # Safely get job title
    job_title = getattr(candidate.job, "job_title", "N/A") if candidate.job else "N/A"
    
    try:
        send_final_selection_email(
            candidate_name=candidate.name,
            candidate_email=candidate.email,
            job_title=job_title,
        )
        print(f"[EMAIL] Final selection email sent to {candidate.email}")
        return {"message": f"Final selection email sent to {candidate.name} ({candidate.email})"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email failed: {str(e)}")


def update_interview(interview_id: str, data: InterviewUpdate, db: Session) -> Interview:
    """Update interview details and send reschedule email if needed."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found.")
    
    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(interview, field, val)
    
    db.commit()
    db.refresh(interview)

    # Send reschedule email
    try:
        candidate = db.query(Candidate).filter(Candidate.id == interview.candidate_id).first()
        job_title = getattr(candidate.job, "job_title", interview.job_title or "N/A") if candidate.job else (interview.job_title or "N/A")
        
        send_reschedule_email(
            candidate_name=candidate.name,
            candidate_email=candidate.email,
            job_title=job_title,
            round_number=interview.round,
            scheduled_at=interview.scheduled_at.strftime("%d %B %Y, %I:%M %p"),
            mode=interview.mode,
            location=interview.location,
            notes=interview.notes,
        )
        print(f"[EMAIL] Reschedule email sent to {candidate.email}")
    except Exception as e:
        print(f"[EMAIL] Reschedule email failed: {e}")

    return interview


def get_all_interviews(db: Session) -> list[Interview]:
    """Fetch all interviews."""
    return db.query(Interview).all()


def delete_interview(interview_id: str, db: Session):
    """Delete an interview."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found.")
    
    db.delete(interview)
    db.commit()
    
    return {"message": "Interview deleted."}