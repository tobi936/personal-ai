import os
from mem0 import Memory
from typing import List, Optional

CHROMA_HOST = os.getenv("CHROMA_HOST", "http://localhost:8000")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")

_memory: Optional[Memory] = None


ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


def _llm_config() -> dict:
    if ANTHROPIC_API_KEY:
        return {"provider": "litellm", "config": {"model": "claude-haiku-4-5", "api_key": ANTHROPIC_API_KEY}}
    if OPENAI_API_KEY:
        return {"provider": "litellm", "config": {"model": "gpt-4o-mini", "api_key": OPENAI_API_KEY}}
    return {"provider": "litellm", "config": {"model": f"ollama/{OLLAMA_MODEL}", "ollama_base_url": OLLAMA_HOST}}


def _embedder_config() -> dict:
    if OPENAI_API_KEY:
        return {"provider": "openai", "config": {"api_key": OPENAI_API_KEY, "model": "text-embedding-ada-002"}}
    return {"provider": "ollama", "config": {"model": "nomic-embed-text", "ollama_base_url": OLLAMA_HOST}}


def get_memory() -> Memory:
    global _memory
    if _memory is None:
        config = {
            "llm": _llm_config(),
            "embedder": _embedder_config(),
            "vector_store": {
                "provider": "chroma",
                "config": {
                    "host": CHROMA_HOST.replace("http://", "").split(":")[0],
                    "port": int(CHROMA_HOST.split(":")[-1]) if ":" in CHROMA_HOST else 8000,
                    "collection_name": "personal_ai_memories",
                },
            },
        }
        _memory = Memory.from_config(config)
    return _memory


def add_memories(messages: list[dict], user_id: str) -> None:
    try:
        get_memory().add(messages, user_id=user_id)
    except Exception as e:
        print(f"Memory add error (non-fatal): {e}")


def search_memories(query: str, user_id: str, limit: int = 5) -> List[dict]:
    try:
        results = get_memory().search(query, user_id=user_id, limit=limit)
        return results.get("results", []) if isinstance(results, dict) else results
    except Exception as e:
        print(f"Memory search error (non-fatal): {e}")
        return []


def get_all_memories(user_id: str) -> List[dict]:
    try:
        results = get_memory().get_all(user_id=user_id)
        return results.get("results", []) if isinstance(results, dict) else results
    except Exception as e:
        print(f"Memory get_all error (non-fatal): {e}")
        return []


def delete_memory(memory_id: str) -> None:
    get_memory().delete(memory_id)
