from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.utils.db import engine, Base
from app.models import user, job, candidate, interview, selected_candidate  # noqa: F401
from app.routes import auth_routes, job_routes, candidate_routes, interview_routes, selected_candidate_routes

Base.metadata.create_all(bind=engine)
os.makedirs("uploads/resumes", exist_ok=True)

app = FastAPI(
    title="ATS - Applicant Tracking System",
    version="1.0.0",
    openapi_tags=[
        {
            "name": "Admin",
        },
        {
            "name": "HR",
        },
        {
            "name": "Candidate",
        },
        {
            "name": "Public",
        },
        {
            "name": "My Account",
        },
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173","http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_routes.router)
app.include_router(job_routes.router)
app.include_router(candidate_routes.router)
app.include_router(interview_routes.router)
app.include_router(selected_candidate_routes.router)


@app.get("/", tags=["Public"])
def root():
    return {"message": "ATS Backend is running"}