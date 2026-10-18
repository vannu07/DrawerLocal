import asyncio
import json
import os
from datetime import datetime
from pathlib import Path
from typing import List

import fitz  # PyMuPDF
from sqlmodel import Session, select

from ..config import settings
from ..models import Document, VendorRule
from ..schemas import DocumentRead, ConfidenceDict
from .provider import get_provider

# Prompt template – strict JSON output
BASE_PROMPT = """
You are an AI extracting structured receipt data. For the given image, output a JSON object with the following fields:
- vendor (string)
- date (ISO 8601, e.g., 2023-07-15)
- currency (3‑letter code)
- subtotal (float)
- tax (float)
- total (float)
- category (one of: Software, Travel, Meals, Equipment, Office, Marketing, Other)
- confidence (object with per‑field confidence scores between 0 and 1)

Only respond with the JSON object, no extra text.
"""

REPAIR_PROMPT = """
The previous JSON was malformed or missing fields. Please regenerate a **complete** JSON object matching the schema exactly.
"""

engine = None  # Will be created lazily

def get_session():
    global engine
    if engine is None:
        from sqlmodel import create_engine
        engine = create_engine(settings.DATABASE_URL, echo=False)
    with Session(engine) as session:
        yield session

async def _convert_pdf_to_images(pdf_path: Path) -> List[Path]:
    doc = fitz.open(pdf_path)
    img_paths = []
    for page_num in range(len(doc)):
        pix = doc.load_page(page_num).get_pixmap()
        img_path = pdf_path.parent / f"{pdf_path.stem}_page_{page_num}.png"
        pix.save(img_path)
        img_paths.append(img_path)
    return img_paths

async def _call_model(images: List[Path], prompt: str) -> dict:
    provider = get_provider()
    return await provider.infer([str(p) for p in images], prompt)

async def extract_document(doc_id: int, demo_mode: bool = False):
    # Update status to processing
    for session in get_session():
        doc = session.get(Document, doc_id)
        if not doc:
            return
        doc.status = "processing"
        session.add(doc)
        session.commit()
        break

    # Load file and turn PDFs into image list
    file_path = Path(doc.file_path)
    if file_path.suffix.lower() == ".pdf":
        images = await _convert_pdf_to_images(file_path)
    else:
        images = [file_path]

    # First attempt
    raw = await _call_model(images, BASE_PROMPT)
    # Validate JSON against schema – we use a simple try/except here
    try:
        # Convert raw (may be string) to dict
        if isinstance(raw, str):
            raw = json.loads(raw)
        parsed = DocumentRead(**raw)
    except Exception as e:
        # Retry once with repair prompt
        raw = await _call_model(images, REPAIR_PROMPT)
        try:
            if isinstance(raw, str):
                raw = json.loads(raw)
            parsed = DocumentRead(**raw)
        except Exception as e2:
            # Mark failed
            for session in get_session():
                doc = session.get(Document, doc_id)
                doc.status = "failed"
                doc.raw_model_output = {"error": str(e2)}
                session.add(doc)
                session.commit()
            return

    # Persist results
    for session in get_session():
        doc = session.get(Document, doc_id)
        doc.vendor = parsed.vendor
        doc.date = parsed.date
        doc.currency = parsed.currency
        doc.subtotal = parsed.subtotal
        doc.tax = parsed.tax
        doc.total = parsed.total
        doc.category = parsed.category
        doc.confidence = parsed.confidence.model_dump() if parsed.confidence else {}
        doc.raw_model_output = raw
        doc.status = "needs_review"
        session.add(doc)
        session.commit()
        # Apply vendor rule learning if exists
        if doc.vendor:
            normalized = doc.vendor.lower().strip()
            stmt = select(VendorRule).where(VendorRule.vendor_normalized == normalized)
            rule = session.exec(stmt).first()
            if rule:
                doc.category = rule.category
                session.add(doc)
                session.commit()
        break

    # Clean up temporary PDF images (if any)
    if file_path.suffix.lower() == ".pdf":
        for p in images:
            try:
                p.unlink()
            except Exception:
                pass

    return
