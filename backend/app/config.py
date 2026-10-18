import os
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # General settings
    DEBUG: bool = Field(default=False)
    DEMO_MODE: bool = Field(default=True)
    # Ollama model settings
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434")
    OLLAMA_MODEL: str = Field(default="gemma3:4b")
    # OpenAI compatible fallback
    OPENAI_API_BASE: str | None = Field(default=None)
    OPENAI_API_KEY: str | None = Field(default=None)
    # Database
    DATABASE_URL: str = Field(default="sqlite:///./drawerlocal.db")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
