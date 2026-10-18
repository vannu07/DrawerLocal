import os
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    # General settings
    DEBUG: bool = Field(default=False, env="DEBUG")
    DEMO_MODE: bool = Field(default=False, env="DEMO_MODE")
    # Ollama model settings
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", env="OLLAMA_BASE_URL")
    OLLAMA_MODEL: str = Field(default="gemma3:4b", env="OLLAMA_MODEL")
    # OpenAI compatible fallback
    OPENAI_API_BASE: str | None = Field(default=None, env="OPENAI_API_BASE")
    OPENAI_API_KEY: str | None = Field(default=None, env="OPENAI_API_KEY")
    # Database
    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///./drawerlocal.db", env="DATABASE_URL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
