from datetime import datetime
from typing import Optional, Dict, List
from pydantic import BaseModel, Field, validator

class ConfidenceDict(BaseModel):
    vendor: Optional[float] = None
    date: Optional[float] = None
    currency: Optional[float] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    total: Optional[float] = None
    category: Optional[float] = None

class DocumentCreate(BaseModel):
    # Used for POST /documents (multipart handled separately)
    pass

class DocumentRead(BaseModel):
    id: int
    filename: str
    status: str
    vendor: Optional[str]
    date: Optional[datetime]
    currency: Optional[str]
    subtotal: Optional[float]
    tax: Optional[float]
    total: Optional[float]
    category: Optional[str]
    confidence: ConfidenceDict = Field(default_factory=ConfidenceDict)
    created_at: datetime
    approved_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class DocumentUpdate(BaseModel):
    vendor: Optional[str] = None
    date: Optional[datetime] = None
    currency: Optional[str] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    total: Optional[float] = None
    category: Optional[str] = None
    confidence: Optional[ConfidenceDict] = None

class VendorRuleCreate(BaseModel):
    vendor_normalized: str
    category: str

class VendorRuleRead(BaseModel):
    vendor_normalized: str
    category: str
    class Config:
        from_attributes = True
