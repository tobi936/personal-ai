from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import Optional, List
from datetime import datetime
import uuid
import os

DATABASE_URL = f"sqlite:////app/data/personal_ai.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


class Conversation(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    title: str = "Neue Unterhaltung"
    user_id: str = "default"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Message(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    conversation_id: str = Field(foreign_key="conversation.id")
    role: str  # "user" | "assistant"
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


def get_conversation_messages(session: Session, conversation_id: str) -> List[Message]:
    return session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    ).all()


def get_or_create_conversation(session: Session, conversation_id: Optional[str], user_id: str) -> Conversation:
    if conversation_id:
        conv = session.get(Conversation, conversation_id)
        if conv:
            return conv
    conv = Conversation(user_id=user_id)
    session.add(conv)
    session.commit()
    session.refresh(conv)
    return conv


def list_conversations(session: Session, user_id: str) -> List[Conversation]:
    return session.exec(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    ).all()
