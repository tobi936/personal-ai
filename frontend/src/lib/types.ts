export interface Message {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  message_count: number;
}

export interface MemoryItem {
  id: string;
  memory: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
}
