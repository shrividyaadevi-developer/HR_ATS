#faiss_Store
"""
FAISS Vector Store using sentence-transformers.
Model is downloaded automatically by pip on first use — no manual HuggingFace download needed.
Model used: all-MiniLM-L6-v2 (~90MB, fast, good quality)
"""
import os
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

# Singleton model — loaded once on startup
_model: SentenceTransformer = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print(f"[FAISS] Loading embedding model: {MODEL_NAME}")
        _model = SentenceTransformer(MODEL_NAME)
        print("[FAISS] Model loaded successfully.")
    return _model


def get_embedding(text: str) -> np.ndarray:
    """Convert text to a normalized embedding vector."""
    model = get_model()
    embedding = model.encode([text], normalize_embeddings=True)
    return embedding.astype(np.float32)


def compute_similarity(resume_text: str, job_description: str, return_chunks: bool = False):
    """
    Compute similarity OR return top relevant chunks (RAG mode).
    """
    if not resume_text or not job_description:
        return 0.0 if not return_chunks else ""

    model = get_model()

    # 🔹 MODE 1: Normal similarity (Used for the UI Score)
    if not return_chunks:
        embeddings = model.encode(
            [resume_text, job_description],
            normalize_embeddings=True
        )
        resume_vec = embeddings[0]
        job_vec = embeddings[1]
        
        # Dot product of normalized vectors = Cosine Similarity
        score = float(np.dot(resume_vec, job_vec))
        
        # Ensure result is between 0 and 1
        return round(max(0.0, min(1.0, score)), 4)

    # 🔥 MODE 2: RAG MODE (Used to feed Groq LLM the best parts of the resume)
    # Step 1: Split resume into chunks (approx 200 words)
    words = resume_text.split()
    chunk_size = 200
    chunks = [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]

    if not chunks:
        return resume_text[:1000]

    # Step 2: Vectorize chunks and job description
    chunk_vecs = model.encode(chunks, normalize_embeddings=True).astype(np.float32)
    job_vec = model.encode([job_description], normalize_embeddings=True).astype(np.float32)

    # Step 3: FAISS indexing
    dim = chunk_vecs.shape[1]
    index = faiss.IndexFlatIP(dim) # Inner Product for Cosine Similarity
    index.add(chunk_vecs)

    # Step 4: Retrieve top 3 most relevant segments
    top_k = min(3, len(chunks))
    distances, indices = index.search(job_vec, top_k)

    # Step 5: Combine chunks into a context string for the AI
    top_chunks = [chunks[i] for i in indices[0] if i != -1]
    return "\n\n".join(top_chunks)

def rank_resumes_against_job(resumes: list[dict], job_description: str) -> list[dict]:
    """
    Rank a list of resumes against a job description using FAISS.
    Each resume dict must have: {"id": int, "text": str}
    Returns sorted list with similarity_score added.
    """
    if not resumes:
        return []

    model = get_model()
    job_vec = model.encode([job_description], normalize_embeddings=True).astype(np.float32)

    texts = [r["text"] for r in resumes]
    resume_vecs = model.encode(texts, normalize_embeddings=True).astype(np.float32)

    dim = resume_vecs.shape[1]
    index = faiss.IndexFlatIP(dim)  # Inner product = cosine for normalized vecs
    index.add(resume_vecs)

    distances, indices = index.search(job_vec, len(resumes))

    results = []
    for rank, (dist, idx) in enumerate(zip(distances[0], indices[0])):
        item = resumes[idx].copy()
        item["similarity_score"] = round(float(dist), 4)
        item["rank"] = rank + 1
        results.append(item)

    return results