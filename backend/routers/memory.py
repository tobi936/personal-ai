from fastapi import APIRouter, HTTPException
from services.memory_service import get_all_memories, delete_memory

router = APIRouter(prefix="/memories", tags=["memories"])


@router.get("")
def list_memories(user_id: str = "default"):
    memories = get_all_memories(user_id)
    return {"memories": memories, "count": len(memories)}


@router.delete("/{memory_id}")
def remove_memory(memory_id: str):
    try:
        delete_memory(memory_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
