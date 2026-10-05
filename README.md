# Personal AI Memory Agent

## Backend
1. pip install -r requirements.txt
2. Copy .env.example to .env and fill in the values
3. uvicorn app.main:app --reload

## Frontend (React + Tailwind, in frontend/)
Development (hot reload, proxies API calls to :8000):
    cd frontend && npm install && npm run dev      -> http://localhost:5173

Production (FastAPI serves the build):
    cd frontend && npm install && npm run build    -> http://localhost:8000
