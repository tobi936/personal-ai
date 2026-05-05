from typing import TypedDict, Annotated, AsyncGenerator
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from services.memory_service import search_memories, add_memories
from services.llm import stream_chat, chat
import json

SYSTEM_PROMPT = """Du bist ein persönlicher KI-Assistent – ein "Second Brain". Du hilfst dabei,
Gedanken zu ordnen, Informationen zu verknüpfen und als langfristiges Gedächtnis zu dienen.

Du erinnerst dich an frühere Gespräche und nutzt dieses Wissen aktiv.
Antworte präzise, klar und auf Deutsch (oder der Sprache des Nutzers).
"""


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    user_id: str
    memories: list[dict]
    current_input: str


def _build_context_from_memories(memories: list[dict]) -> str:
    if not memories:
        return ""
    lines = ["Relevante Erinnerungen aus früheren Gesprächen:"]
    for m in memories:
        text = m.get("memory", m.get("text", str(m)))
        lines.append(f"• {text}")
    return "\n".join(lines)


async def retrieve_memories_node(state: AgentState) -> AgentState:
    memories = search_memories(state["current_input"], user_id=state["user_id"])
    return {**state, "memories": memories}


async def save_memories_node(state: AgentState) -> AgentState:
    msgs = state["messages"]
    if len(msgs) >= 2:
        last_pair = [
            {"role": "user", "content": msgs[-2].content if hasattr(msgs[-2], "content") else str(msgs[-2])},
            {"role": "assistant", "content": msgs[-1].content if hasattr(msgs[-1], "content") else str(msgs[-1])},
        ]
        add_memories(last_pair, user_id=state["user_id"])
    return state


def build_graph() -> StateGraph:
    graph = StateGraph(AgentState)
    graph.add_node("retrieve_memories", retrieve_memories_node)
    graph.add_node("save_memories", save_memories_node)
    graph.set_entry_point("retrieve_memories")
    graph.add_edge("retrieve_memories", "save_memories")
    graph.add_edge("save_memories", END)
    return graph.compile()


compiled_graph = build_graph()


async def run_chat_stream(
    user_message: str,
    conversation_history: list[dict],
    user_id: str,
    memories: list[dict] | None = None,
) -> AsyncGenerator[str, None]:
    if memories is None:
        memories = search_memories(user_message, user_id=user_id)

    memory_context = _build_context_from_memories(memories)

    system_content = SYSTEM_PROMPT
    if memory_context:
        system_content += f"\n\n{memory_context}"

    messages = [{"role": "system", "content": system_content}]
    messages.extend(conversation_history)
    messages.append({"role": "user", "content": user_message})

    full_response = ""
    async for token in stream_chat(messages):
        full_response += token
        yield token

    add_memories(
        [{"role": "user", "content": user_message}, {"role": "assistant", "content": full_response}],
        user_id=user_id,
    )
