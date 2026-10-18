from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.responses import FileResponse
from sqlmodel import Session, select
from pathlib import Path
import shutil
import uuid
import os

from ..config import settings
from ..models import Document, VendorRule
from ..schemas import DocumentRead, DocumentUpdate
from ..services.extraction import extract_document

router = APIRouter()

# Dependency to get DB session (simple for demo)
from sqlmodel import create_engine
engine = create_engine(settings.DATABASE_URL, echo=False)

def get_session():
    with Session(engine) as session:
        yield session

UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/documents", response_model=list[DocumentRead])
async def upload_documents(files: list[UploadFile] = File(...), background_tasks: BackgroundTasks = None, session: Session = Depends(get_session)):
    docs = []
    for upload in files:
        if upload.content_type not in ["image/jpeg", "image/png", "application/pdf"]:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        uid = uuid.uuid4().hex
        ext = Path(upload.filename).suffix
        dest_path = UPLOAD_DIR / f"{uid}{ext}"
        with dest_path.open("wb") as out:
            shutil.copyfileobj(upload.file, out)
        doc = Document(filename=upload.filename, file_path=str(dest_path), status="queued")
        session.add(doc)
        session.commit()
        session.refresh(doc)
        docs.append(doc)
        # launch extraction in background
        if background_tasks:
            background_tasks.add_task(extract_document, doc.id, settings.DEMO_MODE)
    return [DocumentRead.from_orm(d) for d in docs]

@router.get("/documents", response_model=list[DocumentRead])
def list_documents(status: str | None = None, category: str | None = None, session: Session = Depends(get_session)):
    stmt = select(Document)
    if status:
        stmt = stmt.where(Document.status == status)
    if category:
        stmt = stmt.where(Document.category == category)
    docs = session.exec(stmt).all()
    return [DocumentRead.from_orm(d) for d in docs]

@router.get("/documents/{doc_id}", response_model=DocumentRead)
def get_document(doc_id: int, session: Session = Depends(get_session)):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentRead.from_orm(doc)

@router.patch("/documents/{doc_id}", response_model=DocumentRead)
def update_document(doc_id: int, payload: DocumentUpdate, session: Session = Depends(get_session)):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(doc, field, value)
    session.add(doc)
    session.commit()
    session.refresh(doc)
    return DocumentRead.from_orm(doc)

@router.post("/documents/{doc_id}/approve")
def approve_document(doc_id: int, session: Session = Depends(get_session)):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.status = "approved"
    doc.approved_at = datetime.utcnow()
    session.add(doc)
    session.commit()
    return {"detail": "Document approved"}

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: int, session: Session = Depends(get_session)):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # remove file
    try:
        Path(doc.file_path).unlink()
    except Exception:
        pass
    session.delete(doc)
    session.commit()
    return {"detail": "Document deleted"}

@router.get("/documents/{doc_id}/file")
def download_file(doc_id: int, session: Session = Depends(get_session)):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return FileResponse(path=doc.file_path, filename=doc.filename)
