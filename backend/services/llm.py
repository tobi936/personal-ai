import os
from litellm import acompletion
from typing import AsyncGenerator

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


def get_model_config() -> dict:
    if ANTHROPIC_API_KEY:
        return {"model": "claude-haiku-4-5", "api_key": ANTHROPIC_API_KEY}
    if OPENAI_API_KEY:
        return {"model": "gpt-4o-mini", "api_key": OPENAI_API_KEY}
    return {"model": f"ollama/{OLLAMA_MODEL}", "api_base": OLLAMA_HOST}


async def stream_chat(messages: list[dict]) -> AsyncGenerator[str, None]:
    response = await acompletion(**get_model_config(), messages=messages, stream=True)
    async for chunk in response:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


async def chat(messages: list[dict]) -> str:
    response = await acompletion(**get_model_config(), messages=messages)
    return response.choices[0].message.content
