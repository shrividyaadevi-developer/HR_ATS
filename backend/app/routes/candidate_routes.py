import os, shutil, uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, Integer, case
from app.utils.db import get_db, SessionLocal
from app.utils.dependencies import require_admin_or_hr, require_candidate
from app.models.user import User
from app.models.job import Job as JobModel
from app.models.candidate import Candidate, CandidateStatus
from app.schemas.candidate_schema import CandidateResponse, HROverrideRequest, MyApplicationResponse
from app.services.ai_service import screen_resume
from app.services.email_service import send_rejection_email
from app.utils.resume_parser import extract_text_from_pdf, extract_linkedin_url # 🔥 Added LinkedIn Parser
from dotenv import load_dotenv

load_dotenv()
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/api/candidates")

# ── Candidate ───────────────────────────────────────────────
@router.post("/apply", tags=["Candidate"])
async def apply_for_job(
    background_tasks: BackgroundTasks,
    job_id: str = Form(...),
    phone: str = Form(...),
    linkedin_url: str = Form(...), # 🔥 NEW: Explicit input field from user
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    # 1. Standard Validations
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    if job.status.value != "active":
        raise HTTPException(status_code=400, detail="This job is no longer accepting applications.")
    if db.query(Candidate).filter(Candidate.job_id == job_id, Candidate.email == current_user.email).first():
        raise HTTPException(status_code=400, detail="You have already applied for this job.")
    if not resume.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes are accepted.")

    # 2. File Handling
    file_name = f"{uuid.uuid4()}_{resume.filename}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(resume.file, f)

    # 3. Parsing & URL Logic
    try:
        from app.utils.resume_parser import extract_text_from_pdf, extract_linkedin_url
        resume_text = extract_text_from_pdf(file_path)
        
        # 🔥 LOGIC: Use the manually typed link if provided, otherwise try to find it in the PDF
        final_linkedin_url = linkedin_url
        
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=422, detail=f"Could not parse resume: {str(e)}")

    # 4. Save to Database
    candidate = Candidate(
        job_id=job_id,
        job_title=job.job_title, 
        name=current_user.name, 
        email=current_user.email,
        phone=phone, 
        resume_path=file_path, 
        resume_text=resume_text,
        linkedin_url=final_linkedin_url, # 🔥 Save the chosen URL
        final_status=CandidateStatus.pending,
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    # 5. Background AI Screening
    job_dict = {
        "title": job.job_title,
        "description": job.description,
        "skills": job.skills,
        "keywords": job.keywords or "",
    }

    background_tasks.add_task(_run_ai_screening, candidate.id, resume_text, job_dict, final_linkedin_url)
    
    return {
        "message": "Application submitted! AI screening in progress.", 
        "candidate_id": candidate.id,
        "linkedin_source": "user_input" if linkedin_url else "resume_extracted" if final_linkedin_url else "not_provided"
    }

@router.get("/my-applications", response_model=list[MyApplicationResponse], tags=["Candidate"])
def my_applications(db: Session = Depends(get_db), current_user: User = Depends(require_candidate)):
    return db.query(Candidate).filter(Candidate.email == current_user.email).all()


# ── HR (Admin + HR) ─────────────────────────────────────────
@router.get("/", response_model=list[CandidateResponse], tags=["HR"])
def get_all_candidates(
    job_id: str = None,
    final_status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr),
):
    query = db.query(Candidate)
    if job_id:
        query = query.filter(Candidate.job_id == job_id)
    if final_status:
        query = query.filter(Candidate.final_status == final_status)
    return query.order_by(Candidate.ai_score.desc()).all()

@router.get("/analytics/summary", tags=["HR"])
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_hr)):
    from app.models.job import Job as JobModel
    total_jobs       = db.query(JobModel).count()
    total_candidates = db.query(Candidate).count()
    shortlisted      = db.query(Candidate).filter(Candidate.final_status == CandidateStatus.shortlisted).count()
    rejected         = db.query(Candidate).filter(Candidate.final_status == CandidateStatus.rejected).count()
    pending          = db.query(Candidate).filter(Candidate.final_status == CandidateStatus.pending).count()
    jobs = db.query(JobModel).all()
    job_stats = [
        {
            "job_id": j.id,
            "job_title": j.job_title,
            "total_applicants": db.query(Candidate).filter(Candidate.job_id == j.id).count(),
            "shortlisted": db.query(Candidate).filter(
                Candidate.job_id == j.id,
                Candidate.final_status == CandidateStatus.shortlisted
            ).count()
        }
        for j in jobs
    ]
    return {
        "total_jobs": total_jobs, "total_candidates": total_candidates,
        "shortlisted": shortlisted, "rejected": rejected,
        "pending": pending, "job_breakdown": job_stats,
    }


@router.get("/reports/export", tags=["HR"])
def export_report(
    job_id: str = None,
    report_type: str = "all",   # 🔥 NEW PARAM
    format: str = "csv",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr),
):
    import pandas as pd, tempfile
    from sqlalchemy import func, extract

# ─── 📊 MONTHLY REPORT ─────────────────────────────
    if report_type == "monthly":
        data = db.query(
            func.date_format(Candidate.applied_at, "%Y-%m").label("Month"),
            func.count(Candidate.id).label("Total Applications"),
            func.sum(case((Candidate.final_status == "selected", 1), else_=0)).label("Selected"),
            func.sum(case((Candidate.final_status == "rejected", 1), else_=0)).label("Rejected"),
            func.count(func.distinct(JobModel.id)).label("Total Jobs"),
            func.group_concat(func.distinct(JobModel.job_title)).label("Job Titles"),
            func.group_concat(func.distinct(JobModel.id)).label("Job IDs"),
        ).join(JobModel, Candidate.job_id == JobModel.id) \
        .group_by("Month").all()

        rows = [
            {
                "Month": r[0],
                "Total Applications": r[1],
                "Selected": r[2],
                "Rejected": r[3],
                "Total Jobs Posted": r[4],
                "Job Titles": r[5],
                "Job IDs": r[6],
            }
            for r in data
        ]

    # ─── 📅 SUMMARY REPORT ─────────────────────────────
    elif report_type == "summary":
        data = db.query(
            Candidate.job_id,
            JobModel.job_title,
            Candidate.name,
            Candidate.email,
            func.count(Candidate.id).over(partition_by=Candidate.job_id).label("Total Candidates"),
            case((Candidate.final_status == "selected", 1), else_=0).label("Selected"),
            case((Candidate.final_status == "rejected", 1), else_=0).label("Rejected"),
        ).join(JobModel, Candidate.job_id == JobModel.id).all()

        rows = [
            {
                "Job ID": r[0],
                "Job Title": r[1],
                "Candidate Name": r[2],
                "Email": r[3],
                "Total Candidates": r[4],
                "Selected": r[5],
                "Rejected": r[6],
            }
            for r in data
        ]

    # ─── 📈 YEARLY REPORT ─────────────────────────────
    elif report_type == "yoy":
        data = db.query(
            extract("year", Candidate.applied_at).label("Year"),
            JobModel.job_title,
            func.count(Candidate.id).label("Applications"),
            func.sum(case((Candidate.final_status == "selected", 1), else_=0)).label("Selected"),
            func.sum(case((Candidate.final_status == "rejected", 1), else_=0)).label("Rejected"),
        ).join(JobModel, Candidate.job_id == JobModel.id) \
        .group_by("Year", JobModel.job_title).all()

        rows = [
            {
                "Year": int(r[0]),
                "Job Role": r[1],
                "Applications": r[2],
                "Selected": r[3],
                "Rejected": r[4],
            }
            for r in data
        ]

    # ─── 📋 DEFAULT (FULL DATA) ─────────────────
    else:
        query = db.query(Candidate)
        if job_id:
            query = query.filter(Candidate.job_id == job_id)

        candidates = query.all()

        rows = [
            {
                "ID": c.id,
                "Name": c.name,
                "Email": c.email,
                "Phone": c.phone,
                "Job ID": c.job_id,
                "Similarity Score": c.similarity_score,
                "AI Score": c.ai_score,
                "AI Status": c.ai_status,
                "HR Override": c.hr_override,
                "Final Status": c.final_status.value,
                "AI Reason": c.ai_reason,
                "Applied At": c.applied_at,
            }
            for c in candidates
        ]

    # ─── Convert to DataFrame ─────────────────
    df = pd.DataFrame(rows)

    suffix = ".xlsx" if format == "excel" else ".csv"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)

    if format == "excel":
        df.to_excel(tmp.name, index=False)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    else:
        df.to_csv(tmp.name, index=False)
        media_type = "text/csv"

    return FileResponse(
        tmp.name,
        media_type=media_type,
        filename=f"{report_type}_report{suffix}"
    )


@router.get("/{candidate_uuid}", response_model=CandidateResponse, tags=["HR"])
def get_candidate(candidate_uuid: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_hr)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_uuid).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    return candidate


@router.get("/{candidate_uuid}/resume", tags=["HR"])
def download_resume(candidate_uuid: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_hr)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_uuid).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    if not os.path.exists(candidate.resume_path):
        raise HTTPException(status_code=404, detail="Resume file not found.")
    return FileResponse(candidate.resume_path, media_type="application/pdf", filename=f"{candidate.name}_resume.pdf")


@router.patch("/{candidate_uuid}/override", response_model=CandidateResponse, tags=["HR"])
def hr_override(
    candidate_uuid: str, data: HROverrideRequest,
    db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_hr),
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_uuid).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    override = data.override.lower()
    if override not in ("yes", "no", "none"):
        raise HTTPException(status_code=400, detail="Override must be 'yes', 'no', or 'none'.")

    candidate.hr_override = override

    if override == "yes":
        # Keep final_status PENDING — only changes to shortlisted when interview is scheduled
        candidate.final_status = CandidateStatus.pending
        print(f"[HR] {candidate.name} marked yes — stays pending until interview scheduled")

    elif override == "no":
        candidate.final_status = CandidateStatus.rejected
        # Send rejection email immediately
        try:
            send_rejection_email(
                candidate_name=candidate.name,
                candidate_email=candidate.email,
                job_title=candidate.job.job_title,
            )
            print(f"[EMAIL] Rejection email sent to {candidate.email}")
        except Exception as e:
            print(f"[EMAIL] Rejection email failed: {e}")

    else:  # none — revert to pending
        candidate.final_status = CandidateStatus.pending

    db.commit()
    db.refresh(candidate)
    return candidate


@router.patch("/{candidate_uuid}/round-reject", response_model=CandidateResponse, tags=["HR"])
def round_reject(
    candidate_uuid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_hr),
):
    """Reject a candidate who was already shortlisted (failed Round 2/3 etc.)"""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_uuid).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    if candidate.final_status != CandidateStatus.shortlisted:
        raise HTTPException(status_code=400, detail="Candidate must be shortlisted to round-reject.")

    candidate.final_status = CandidateStatus.rejected
    candidate.hr_override = "no"
    db.commit()
    db.refresh(candidate)

    # Send rejection email
    try:
        from app.services.email_service import send_rejection_email
        send_rejection_email(
            candidate_name=candidate.name,
            candidate_email=candidate.email,
            job_title=candidate.job.title,
        )
        print(f"[EMAIL] Round rejection email sent to {candidate.email}")
    except Exception as e:
        print(f"[EMAIL] Round rejection email failed: {e}")

    return candidate
def delete_candidate(candidate_uuid: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_hr)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_uuid).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    if os.path.exists(candidate.resume_path):
        os.remove(candidate.resume_path)
    db.delete(candidate)
    db.commit()
    return {"message": "Candidate deleted."}


# ── Background AI screening ──────────────────────────
def _run_ai_screening(candidate_id: str, resume_text: str, job_dict: dict, linkedin_url: str = None):
    db = SessionLocal()
    print(f"[AI] Starting screening for candidate {candidate_id}")

    try:
        db_candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not db_candidate:
            return

        # 🔥 Call screen_resume with the LinkedIn URL
        result = screen_resume(resume_text, job_dict, linkedin_url=linkedin_url)
        
        db_candidate.similarity_score = result["similarity_score"]
        db_candidate.ai_score = result["ai_score"]
        db_candidate.ai_reason = result["ai_reason"]
        db_candidate.ai_status = result["ai_status"]
        
        db.commit()
        print(f"[AI] Done: {db_candidate.name} score={result['ai_score']}")

    except Exception as e:
        import traceback
        print(f"[AI] Failed: {e}")
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()