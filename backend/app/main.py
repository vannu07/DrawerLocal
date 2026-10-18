from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, create_engine

from .router import documents, stats, health
from .config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and tables
    engine = create_engine(settings.DATABASE_URL, echo=False)
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(
    title="DrawerLocal API",
    version="0.1.0",
    description="Offline-first receipt extraction with open-weight AI",
    lifespan=lifespan,
)

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
