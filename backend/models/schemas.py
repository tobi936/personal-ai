from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    user_id: str = "default"


class MemoryItem(BaseModel):
    id: str
    memory: str
    created_at: Optional[str] = None
    metadata: Optional[dict] = None


class ConversationSummary(BaseModel):
    id: str
    title: str
    created_at: datetime
    message_count: int
