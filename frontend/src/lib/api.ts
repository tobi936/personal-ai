import { Conversation, MemoryItem, Message } from "./types";

const API = "/api";

export async function getConversations(userId = "default"): Promise<Conversation[]> {
  const res = await fetch(`${API}/chat/conversations?user_id=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const res = await fetch(`${API}/chat/conversations/${conversationId}/messages`);
  if (!res.ok) return [];
  return res.json();
}

export async function getMemories(userId = "default"): Promise<MemoryItem[]> {
  const res = await fetch(`${API}/memories?user_id=${userId}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.memories || [];
}

export async function deleteMemory(memoryId: string): Promise<void> {
  await fetch(`${API}/memories/${memoryId}`, { method: "DELETE" });
}

export interface StreamCallbacks {
  onConversationId?: (id: string) => void;
  onMemories?: (memories: string[]) => void;
  onToken?: (token: string) => void;
  onDone?: () => void;
}

export async function sendMessage(
  message: string,
  conversationId: string | null,
  userId = "default",
  callbacks: StreamCallbacks
): Promise<void> {
  const res = await fetch(`${API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, conversation_id: conversationId, user_id: userId }),
  });

  if (!res.ok || !res.body) throw new Error("Request failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const payload = JSON.parse(line.slice(6));
        if (payload.type === "conversation_id") callbacks.onConversationId?.(payload.id);
        if (payload.type === "memories") callbacks.onMemories?.(payload.memories);
        if (payload.type === "token") callbacks.onToken?.(payload.content);
        if (payload.type === "done") callbacks.onDone?.();
      } catch {}
    }
  }
}
