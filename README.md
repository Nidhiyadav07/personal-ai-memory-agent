# Personal AI Memory Agent

A multi-user AI study assistant that uses **RAG and LLM reasoning** to help users learn from their own PDF study material.

Users can upload PDFs, ask questions, and receive context-grounded explanations or code based on the concepts found in their documents.

## Key Features

* PDF upload and text extraction
* RAG-based semantic search
* AI-powered reasoning over study material
* User-specific document knowledge
* JWT authentication
* MongoDB-based user management
* Conversational chat interface
* Java/code generation based on retrieved concepts

## Tech Stack

**Frontend**

* React 18
* Vite 6
* Tailwind CSS 4

**Backend**

* Python
* FastAPI
* Uvicorn
* PyMongo
* PyJWT
* bcrypt

**AI / RAG**

* Qdrant
* Sentence Transformers
* LangChain Text Splitters
* LangChain Hugging Face
* LangChain Groq
* Groq LLM

**Document Processing**

* PyPDF

## Architecture

```text
React + Tailwind
       │
       ▼
    FastAPI
       │
 ┌─────┼──────────────┐
 ▼     ▼              ▼
JWT  MongoDB       RAG Pipeline
                      │
                ┌─────┴─────┐
                ▼           ▼
             PyPDF       Qdrant
                │           ▲
                ▼           │
           Text Chunks → Embeddings
                            │
                            ▼
                       Groq LLM
                            │
                            ▼
                     Grounded Answer
```

## RAG Pipeline

```text
PDF
 ↓
Text Extraction
 ↓
Chunking
 ↓
Sentence Transformer Embeddings
 ↓
Qdrant Vector Search
 ↓
Relevant Context
 ↓
Groq LLM
 ↓
Answer
```

## Example

A user uploads a Data Structures PDF and asks:

> Write Binary Search code in Java based on my uploaded notes.

The system retrieves the relevant concepts from the PDF and uses the retrieved context to generate the response.

## Project Structure

```text
personal_ai_memory/
├── backend/
│   └── app/
├── frontend/
│   ├── src/
│   └── package.json
├── requirements.txt
├── .gitignore
└── README.md
```

## Setup

### Backend

```bash
python -m venv .venv
```

Windows:

```powershell
.venv\Scripts\activate
```

```bash
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file:

```env
MONGO_URL=your_mongodb_url
JWT_SECRET=your_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
GROQ_API_KEY=your_groq_api_key
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
```

> Never commit `.env` or API keys to the repository.

## What I Learned

* Retrieval-Augmented Generation
* Vector databases and semantic search
* Embeddings with Sentence Transformers
* LLM integration with Groq
* PDF processing and document chunking
* FastAPI backend development
* JWT authentication
* MongoDB integration
* React frontend development
* Building multi-user AI applications

## Future Improvements

* Long-term conversation memory
* Personalized quizzes and study notes
* Improved retrieval and reranking
* RAG evaluation
* AI guardrails
* Production deployment

