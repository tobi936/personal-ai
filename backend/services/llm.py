import os
from litellm import completion, acompletion
from typing import AsyncGenerator

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")

# LiteLLM model string: ollama/modelname
def get_model_string() -> str:
    return f"ollama/{OLLAMA_MODEL}"


async def stream_chat(messages: list[dict]) -> AsyncGenerator[str, None]:
    response = await acompletion(
        model=get_model_string(),
        messages=messages,
        stream=True,
        api_base=OLLAMA_HOST,
    )
    async for chunk in response:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


async def chat(messages: list[dict]) -> str:
    response = await acompletion(
        model=get_model_string(),
        messages=messages,
        api_base=OLLAMA_HOST,
    )
    return response.choices[0].message.content
