import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.auth.routes import get_current_user
from app.rag.loader import load_pdf
from app.rag.splitter import split_documents
from app.rag.embeddings import embeddings
from app.rag.vector_store import create_collection, add_documents

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    user_id = str(user["_id"])
    user_dir = UPLOAD_DIR / user_id          # each user gets their own folder
    user_dir.mkdir(exist_ok=True)
    file_path = user_dir / Path(file.filename).name

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    documents = load_pdf(str(file_path))
    if not documents:
        raise HTTPException(status_code=422, detail="No readable text found in this PDF.")

    chunks = split_documents(documents)
    create_collection()
    add_documents(chunks, embeddings, user_id, file.filename)

    return {
        "message": "PDF uploaded successfully",
        "filename": file.filename,
        "pages": len(documents),
        "chunks": len(chunks),
    }
