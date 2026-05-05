from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from db.database import (
    get_session, get_or_create_conversation, get_conversation_messages,
    list_conversations, Message, Conversation,
)
from models.schemas import ChatRequest, ConversationSummary
from services.graph import run_chat_stream
from services.memory_service import search_memories
from datetime import datetime
import json

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
async def chat_endpoint(req: ChatRequest, session: Session = Depends(get_session)):
    conv = get_or_create_conversation(session, req.conversation_id, req.user_id)

    history_msgs = get_conversation_messages(session, conv.id)
    conversation_history = [
        {"role": m.role, "content": m.content} for m in history_msgs
    ]

    user_msg = Message(conversation_id=conv.id, role="user", content=req.message)
    session.add(user_msg)

    if conv.title == "Neue Unterhaltung" and not history_msgs:
        conv.title = req.message[:60] + ("..." if len(req.message) > 60 else "")
    conv.updated_at = datetime.utcnow()
    session.add(conv)
    session.commit()

    memories = search_memories(req.message, user_id=req.user_id)

    async def event_stream():
        full_response = ""
        yield f"data: {json.dumps({'type': 'conversation_id', 'id': conv.id})}\n\n"

        if memories:
            yield f"data: {json.dumps({'type': 'memories', 'memories': [m.get('memory', '') for m in memories]})}\n\n"

        async for token in run_chat_stream(
            req.message, conversation_history, req.user_id, memories
        ):
            full_response += token
            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

        ai_msg = Message(conversation_id=conv.id, role="assistant", content=full_response)
        with Session(session.bind) as s:
            s.add(ai_msg)
            s.commit()

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/conversations")
def get_conversations(user_id: str = "default", session: Session = Depends(get_session)):
    convs = list_conversations(session, user_id)
    result = []
    for c in convs:
        msgs = session.exec(
            select(Message).where(Message.conversation_id == c.id)
        ).all()
        result.append({
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at.isoformat(),
            "message_count": len(msgs),
        })
    return result


@router.get("/conversations/{conversation_id}/messages")
def get_messages(conversation_id: str, session: Session = Depends(get_session)):
    msgs = get_conversation_messages(session, conversation_id)
    return [{"role": m.role, "content": m.content, "created_at": m.created_at.isoformat()} for m in msgs]
