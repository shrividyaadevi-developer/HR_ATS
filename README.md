
# HR ATS (AI-Powered Applicant Tracking System)

An AI-powered full-stack Applicant Tracking System built using **FastAPI (Python)** for backend and **React** for frontend.  
The system automates resume screening, candidate management, and hiring workflows using AI, embeddings, and RAG-based matching.

---

## Features

### HR Panel
- Post and manage job listings  
- View and filter candidates  
- AI-based resume ranking  
- Schedule interviews  
- Select candidates and upload offer letters

### Candidate Portal
- Apply for jobs  
- Upload resumes  
- Track application status  

### AI Features
- Resume parsing and skill extraction  
- Semantic matching using embeddings  
- FAISS-based vector search for candidates  
- AI-powered ranking and scoring using LLM  

---

## 🏗️ Tech Stack

### Backend
- FastAPI
- Python
- MySQL
- FAISS (Vector Database)
- Sentence Transformers (all-MiniLM-L6-v2)

### Frontend
- React.js
- JavaScript
- Axios
- CSS

### Database
- MySQL

---

## 📁 Project Structure

HR_ATS/
│
├── backend/
│   ├── app/
│   ├── uploads/
│   ├── venv/
│   └── main files
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── requirements.txt
└── README.md


## ⚙️ Setup Instructions

### 1. Clone Repository

git clone https://github.com/shrividyaadevi-developer/HR_ATS.git
cd HR_ATS


### 2. Backend Setup


cd backend
python -m venv venv
venv\Scripts\activate
pip install -r ../requirements.txt
uvicorn app.main:app --reload

### 3. Frontend Setup

cd frontend
npm install
npm start


## 🔐 Environment Variables

Create a `.env` file inside `backend/`:

DATABASE_URL=your_database_url_here
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256

GROQ_API_KEY=your_groq_api_key_here

MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
MAIL_FROM=your_email
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587

EMBEDDING_MODEL=all-MiniLM-L6-v2
REACT_APP_API_URL=http://localhost:8000
