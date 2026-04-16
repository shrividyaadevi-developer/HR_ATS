from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.selected_candidate import OfferLetterStatus


class SelectedCandidateResponse(BaseModel):
    id: str
    candidate_id: str
    name: str
    email: str
    job_title: str
    job_id: str
    rounds_cleared: str
    offer_letter_path: Optional[str] = None
    selected_at: datetime
    offer_letter_status: OfferLetterStatus

    model_config = {"from_attributes": True}


class UpdateOfferLetterStatus(BaseModel):
    offer_letter_status: OfferLetterStatus