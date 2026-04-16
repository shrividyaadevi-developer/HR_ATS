# app/scripts/populate_faiss.py
from app.vectorstore import faiss_store
from app.models.job import Job
from app.utils.db import SessionLocal
import numpy as np

db = SessionLocal()
jobs = db.query(Job).all()

# Collect job descriptions
job_texts = [job.description for job in jobs]

# Encode all job descriptions
vectors = faiss_store.model.encode(job_texts)

# Build FAISS index
import faiss
dimension = vectors.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(vectors).astype("float32"))

# Save to vectorstore
faiss_store.faiss_index = index
faiss_store.job_texts = job_texts

print(f"FAISS index populated with {len(job_texts)} jobs")