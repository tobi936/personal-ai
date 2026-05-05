import os
from ollama import AsyncClient
from typing import AsyncGenerator

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "")
OLLAMA_CLOUD_MODEL = os.getenv("OLLAMA_CLOUD_MODEL", "gpt-oss:120b-cloud")


def _client() -> AsyncClient:
    if OLLAMA_API_KEY:
        return AsyncClient(
            host="https://ollama.com",
            headers={"Authorization": f"Bearer {OLLAMA_API_KEY}"},
        )
    return AsyncClient(host=OLLAMA_HOST)


def _model() -> str:
    return OLLAMA_CLOUD_MODEL if OLLAMA_API_KEY else OLLAMA_MODEL


async def stream_chat(messages: list[dict]) -> AsyncGenerator[str, None]:
    async for part in await _client().chat(_model(), messages=messages, stream=True):
        content = part["message"]["content"]
        if content:
            yield content


async def chat(messages: list[dict]) -> str:
    response = await _client().chat(_model(), messages=messages)
    return response["message"]["content"]
