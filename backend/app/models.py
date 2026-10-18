from datetime import datetime
from typing import Optional, Dict
from sqlmodel import SQLModel, Field

class Document(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str = Field(index=True)
    file_path: str
    status: str = Field(default="queued")  # queued, processing, needs_review, approved, failed
    vendor: Optional[str] = None
    date: Optional[datetime] = None
    currency: Optional[str] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    total: Optional[float] = None
    category: Optional[str] = None
    confidence: Optional[Dict[str, float]] = Field(default_factory=dict)  # per-field confidence
    raw_model_output: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None

class VendorRule(SQLModel, table=True):
    vendor_normalized: str = Field(primary_key=True, index=True)
    category: str
