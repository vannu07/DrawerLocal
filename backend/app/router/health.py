from fastapi import APIRouter
from fastapi.responses import JSONResponse
from ..config import settings

router = APIRouter()

@router.get("/health")
def health_check():
    mode = "demo" if settings.DEMO_MODE else "local"
    return JSONResponse(content={
        "status": "ok",
        "demo_mode": settings.DEMO_MODE,
        "model": settings.OLLAMA_MODEL if not settings.OPENAI_API_BASE else "openai-compatible",
        "mode": mode,
    })
