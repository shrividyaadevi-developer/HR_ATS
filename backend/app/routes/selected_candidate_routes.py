import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from app.utils.db import get_db
from app.utils.dependencies import require_admin_or_hr
from app.models.user import User
from app.models.candidate import Candidate, CandidateStatus
from app.models.selected_candidate import SelectedCandidate, OfferLetterStatus
from app.schemas.selected_candidate_schema import SelectedCandidateResponse

router = APIRouter(prefix="/api/selected")


@router.get("/", response_model=list[SelectedCandidateResponse], tags=["HR"])
def get_all_selected(db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_hr)):
    """View all finally selected candidates."""
    return db.query(SelectedCandidate).order_by(SelectedCandidate.selected_at.desc()).all()

@router.get("/{selected_uuid}/offer-letter", tags=["HR"])
def view_offer_letter(
    selected_uuid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr),
):
    selected = (
        db.query(SelectedCandidate)
        .filter(SelectedCandidate.id == selected_uuid)
        .first()
    )
    if not selected:
        raise HTTPException(status_code=404, detail="Selected candidate not found.")

    file_path = selected.offer_letter_path
    if not file_path or not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Offer letter not found.")

    return FileResponse(
        path=file_path,
        filename="offer_letter.pdf",
        media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=offer_letter.pdf"},
    )



@router.post("/{candidate_uuid}", response_model=SelectedCandidateResponse, tags=["HR"])
def mark_as_selected(
    candidate_uuid: str,
    rounds_cleared: str = "1",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr),
):
    """
    Mark a shortlisted candidate as finally selected.
    Moves them to selected_candidates table.
    Sends final selection email.
    Updates final_status to 'selected'.
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_uuid).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    if candidate.final_status != CandidateStatus.shortlisted:
        raise HTTPException(status_code=400, detail="Only shortlisted candidates can be marked as selected.")

    # Check if already selected
    existing = db.query(SelectedCandidate).filter(SelectedCandidate.candidate_id == candidate_uuid).first()
    if existing:
        raise HTTPException(status_code=400, detail="Candidate already marked as selected.")

    # Create selected record
    selected = SelectedCandidate(
        candidate_id=candidate.id,
        name=candidate.name,
        email=candidate.email,
        job_title=candidate.job.job_title,
        job_id=candidate.job_id,
        rounds_cleared=rounds_cleared,
    )
    db.add(selected)

    # Update final_status to selected
    candidate.final_status = CandidateStatus.selected
    db.commit()
    db.refresh(selected)

    # Send final selection email
    try:
        from app.services.email_service import send_final_selection_email
        send_final_selection_email(
            candidate_name=candidate.name,
            candidate_email=candidate.email,
            job_title=candidate.job.job_title,
        )
        print(f"[EMAIL] Final selection email sent to {candidate.email}")
    except Exception as e:
        print(f"[EMAIL] Final selection email failed: {e}")

    return selected


@router.patch("/{selected_uuid}/offer-letter", response_model=SelectedCandidateResponse, tags=["HR"])
async def send_offer_letter(
    selected_uuid: str,
    offer_letter: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr),
):
    """Upload offer letter PDF and send it to the candidate via email."""
    selected = db.query(SelectedCandidate).filter(SelectedCandidate.id == selected_uuid).first()
    if not selected:
        raise HTTPException(status_code=404, detail="Selected candidate not found.")
    if not offer_letter.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Offer letter must be a PDF file.")

    # Save offer letter
    os.makedirs("uploads/offer_letters", exist_ok=True)
    file_name = f"{uuid.uuid4()}_{offer_letter.filename}"
    file_path = os.path.join("uploads/offer_letters", file_name)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(offer_letter.file, f)

    # Send email with attachment
    try:
        from app.services.email_service import send_offer_letter_email
        send_offer_letter_email(
            candidate_name=selected.name,
            candidate_email=selected.email,
            job_title=selected.job_title,
            offer_letter_path=file_path,
        )
        print(f"[EMAIL] Offer letter sent to {selected.email}")
        selected.offer_letter_status = OfferLetterStatus.sent
        selected.offer_letter_path = file_path
        db.commit()
        db.refresh(selected)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email failed: {str(e)}")

    return selected


@router.delete("/{selected_uuid}", tags=["HR"])
def remove_selected(
    selected_uuid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr),
):
    selected = db.query(SelectedCandidate).filter(SelectedCandidate.id == selected_uuid).first()
    if not selected:
        raise HTTPException(status_code=404, detail="Not found.")
    db.delete(selected)
    db.commit()
    return {"message": "Removed from selected candidates."}