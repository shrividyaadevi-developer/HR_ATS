"""
AI Service — Updated for RAG-based screening and Human-in-the-Loop LinkedIn Verification.
1. FAISS similarity score (sentence-transformers)
2. Identity Verification Flagging
3. Groq LLM evaluation (score 0-100, reason, shortlist decision)
"""
import os
import json
import re
from groq import Groq
from dotenv import load_dotenv
from app.vectorstore.faiss_store import compute_similarity

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
GROQ_MODEL = "llama-3.3-70b-versatile"  

def screen_resume(resume_text: str, job: dict, linkedin_url: str = None) -> dict:
    """
    RAG-based AI screening pipeline with LinkedIn Verification logic.
    """

    # --- Step 1: Context Preparation ---
    job_full_text = f"""
Job Title: {job['title']}
Description: {job['description']}
Required Skills: {job['skills']}
Keywords: {job.get('keywords', '')}
""".strip()

    # --- Step 2: FAISS Similarity (The Mathematical Score) ---
    # Calculates the semantic distance between the job and the full resume text
    similarity_score = compute_similarity(resume_text, job_full_text, return_chunks=False)

    # --- Step 3: RAG Context Retrieval (Chunking) ---
    # Extracts the most relevant parts of the resume for the LLM to analyze
    try:
        retrieved_context = compute_similarity(
            resume_text,
            job_full_text,
            return_chunks=True
        )
    except Exception as e:
        print(f"[AI] RAG retrieval failed: {e}")
        retrieved_context = resume_text[:2000]  # Fallback to first 2000 chars

    # --- Step 4: Identity Context (No Bonus, Just Verification) ---
    verification_instruction = ""
    if linkedin_url:
        verification_instruction = f"IDENTITY EVIDENCE: LinkedIn Profile provided ({linkedin_url})."
    else:
        verification_instruction = "IDENTITY EVIDENCE: No LinkedIn profile provided. Flag as 'Unverified'."

    # --- Step 5: Groq LLM Evaluation ---
    prompt = f"""
You are a Senior Technical Recruiter and ATS Auditor.
You are an expert HR recruiter and ATS system.
Evaluate the candidate based ONLY on the retrieved relevant information.
TASK: Evaluate the candidate's skill match and verify their professional identity status based on the data below.

JOB DETAILS:
{job_full_text}

RETRIEVED RESUME CONTEXT:
{retrieved_context}

{verification_instruction}

IMPORTANT:
- Do NOT use external assumptions
- Do NOT infer missing skills
- Be strict with required skills

Your task:
1. Give a score from 0 to 100
2. Write a brief reason (2-3 sentences)
3. Decide shortlist (>= 60 → Shortlisted)


Respond ONLY with valid JSON:
{{
  "score": 85,
  "reason": "Explain match and verification check instructions here.",
  "status": "Shortlisted"
}}
"""

    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are a professional ATS system focusing on factual verification."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,  # Lower temperature for more factual, consistent responses
            max_tokens=400,
        )

        raw = response.choices[0].message.content.strip()
        # Clean potential markdown formatting from LLM output
        raw = re.sub(r"```json|```", "", raw).strip()
        result = json.loads(raw)

        ai_score = int(result.get("score", 0))
        ai_reason = result.get("reason", "No reason provided.")
        ai_status = result.get("status", "Not Shortlisted")

        # Logic-based Status Normalization
        if "shortlist" in ai_status.lower() and "not" not in ai_status.lower():
            ai_status = "Shortlisted"
        else:
            ai_status = "Not Shortlisted"

    except Exception as e:
        print(f"[AI] Groq error: {e}")
        ai_score = 0
        ai_reason = f"AI evaluation failed: {str(e)}"
        ai_status = "Not Shortlisted"

    # --- Step 6: Final Response Mapping ---
    return {
        # similarity_score * 100 converts the 0.0-1.0 float to a percentage (e.g., 85)
        "similarity_score": round(similarity_score * 100), 
        "ai_score": ai_score,
        "ai_reason": ai_reason,
        "ai_status": ai_status,
        "linkedin_url": linkedin_url
    }