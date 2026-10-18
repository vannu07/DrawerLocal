from fastapi import APIRouter, Depends
from sqlmodel import Session, select, create_engine
from datetime import datetime, date
from typing import List

from ..models import Document
from ..schemas import DocumentRead
from ..config import settings

router = APIRouter()

engine = create_engine(settings.DATABASE_URL, echo=False)

def get_session():
    with Session(engine) as session:
        yield session

@router.get("/stats/summary")
def get_summary(session: Session = Depends(get_session)):
    stmt = select(Document).where(Document.status == "approved")
    docs: List[Document] = session.exec(stmt).all()
    total = sum(d.total or 0 for d in docs)
    tax = sum(d.tax or 0 for d in docs)
    subtotal = sum(d.subtotal or 0 for d in docs)
    return {"total": total, "tax": tax, "subtotal": subtotal, "count": len(docs)}

@router.get("/stats/by-category")
def by_category(session: Session = Depends(get_session)):
    stmt = select(Document).where(Document.status == "approved")
    docs = session.exec(stmt).all()
    result = {}
    for d in docs:
        cat = d.category or "Uncategorized"
        result.setdefault(cat, 0)
        result[cat] += d.total or 0
    return result

@router.get("/stats/timeline")
def timeline(session: Session = Depends(get_session)):
    stmt = select(Document).where(Document.status == "approved")
    docs = session.exec(stmt).all()
    timeline = {}
    for d in docs:
        if d.date:
            key = d.date.strftime("%Y-%m-%d")
            timeline.setdefault(key, 0)
            timeline[key] += d.total or 0
    # Return sorted by date
    return dict(sorted(timeline.items()))
