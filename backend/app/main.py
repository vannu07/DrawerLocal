from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .router import documents, stats, health
from .config import settings

app = FastAPI(title="DrawerLocal API", version="0.1.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with versioned prefix
app.include_router(documents.router, prefix="/api/v1")
app.include_router(stats.router, prefix="/api/v1")
app.include_router(health.router, prefix="/api/v1")
