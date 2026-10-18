import abc
import httpx
import json
import os
from typing import Any, Dict, Optional
from ..config import settings


class ModelProvider(abc.ABC):
    """Abstract base for any LLM/Vision provider.
    Implementations must expose an async `infer` method that receives a list of image
    file paths and returns a JSON‑serializable dict (or raises).
    """

    @abc.abstractmethod
    async def infer(self, images: list[str], prompt: str) -> Dict[str, Any]:
        ...


class OllamaProvider(ModelProvider):
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip('/')
        self.model = settings.OLLAMA_MODEL
        self.client = httpx.AsyncClient(timeout=60)

    async def infer(self, images: list[str], prompt: str) -> Dict[str, Any]:
        # Ollama expects multipart with base64 image data; simplify by sending the image paths as is
        # (the real implementation would read and base64‑encode each image).
        # For this demo we just send a JSON payload; the mock Ollama container will accept it.
        payload = {
            "model": self.model,
            "prompt": prompt,
            "images": images,
        }
        resp = await self.client.post(f"{self.base_url}/api/generate", json=payload)
        resp.raise_for_status()
        return resp.json()


class OpenAICompatibleProvider(ModelProvider):
    def __init__(self):
        if not settings.OPENAI_API_BASE:
            raise RuntimeError("OpenAI compatible endpoint not configured")
        self.base_url = settings.OPENAI_API_BASE.rstrip('/')
        self.api_key = settings.OPENAI_API_KEY or ""
        self.client = httpx.AsyncClient(timeout=60)
        self.model = settings.OLLAMA_MODEL  # reuse env var for model name

    async def infer(self, images: list[str], prompt: str) -> Dict[str, Any]:
        files = []
        for p in images:
            with open(p, "rb") as f:
                files.append(("file", (os.path.basename(p), f.read(), "image/png")))
        data = {"model": self.model, "prompt": prompt}
        resp = await self.client.post(
            f"{self.base_url}/v1/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            data=data,
            files=files,
        )
        resp.raise_for_status()
        return resp.json()


class MockProvider(ModelProvider):
    """Deterministic mock used when DEMO_MODE=True.
    Returns a fixed, well‑formed JSON payload that matches the `DocumentRead` schema.
    """

    async def infer(self, images: list[str], prompt: str) -> Dict[str, Any]:
        # Very simple fake extraction – vendor derived from filename, random values.
        return {
            "vendor": "Acme Corp",
            "date": "2023-07-15",
            "currency": "USD",
            "subtotal": 123.45,
            "tax": 10.00,
            "total": 133.45,
            "category": "Software",
            "confidence": {
                "vendor": 0.96,
                "date": 0.98,
                "currency": 0.99,
                "subtotal": 0.95,
                "tax": 0.90,
                "total": 0.97,
                "category": 0.92,
            },
        }


def get_provider() -> ModelProvider:
    """Factory that returns the appropriate provider based on env vars.
    Preference order: OpenAI‑compatible > Ollama > Mock (demo).
    """
    if settings.OPENAI_API_BASE:
        return OpenAICompatibleProvider()
    if not settings.DEMO_MODE:
        return OllamaProvider()
    return MockProvider()
