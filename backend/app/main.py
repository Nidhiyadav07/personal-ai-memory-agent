from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from app.auth.routes import router as auth_router, get_current_user
from app.routes.documents import router as documents_router
from app.rag.rag_chain import ask_question
from app.memory.chat_memory import (
    get_history, list_sessions, delete_session, session_owner,
)

app = FastAPI(title="Personal AI Memory Agent")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(documents_router)


class ChatRequest(BaseModel):
    session_id: str
    question: str


class ChatResponse(BaseModel):
    answer: str


def check_session_access(session_id: str, user_id: str):
    owner = session_owner(session_id)
    if owner is not None and owner != user_id:
        raise HTTPException(status_code=403, detail="This chat belongs to another user.")


@app.get("/")
def home():
    return RedirectResponse("/ui/")


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, user: dict = Depends(get_current_user)):
    user_id = str(user["_id"])
    check_session_access(request.session_id, user_id)
    return {"answer": ask_question(request.question, request.session_id, user_id)}


@app.get("/sessions")
def sessions(user: dict = Depends(get_current_user)):
    return list_sessions(str(user["_id"]))


@app.get("/sessions/{session_id}")
def session_messages(session_id: str, user: dict = Depends(get_current_user)):
    user_id = str(user["_id"])
    check_session_access(session_id, user_id)
    return get_history(session_id, user_id)


@app.delete("/sessions/{session_id}")
def remove_session(session_id: str, user: dict = Depends(get_current_user)):
    delete_session(session_id, str(user["_id"]))
    return {"deleted": session_id}


DIST = Path("frontend/dist")
if DIST.exists():
    app.mount("/ui", StaticFiles(directory=DIST, html=True), name="ui")
