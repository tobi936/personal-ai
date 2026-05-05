"use client";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import MemoryPanel from "@/components/MemoryPanel";
import QuickCapture from "@/components/QuickCapture";
import { Conversation, Message, MemoryItem } from "@/lib/types";
import { getConversations, getMessages, getMemories, sendMessage } from "@/lib/api";
import { Menu, X } from "lucide-react";

const USER_ID = "default";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [relevantMemories, setRelevantMemories] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<"chat" | "memories">("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadConversations = useCallback(async () => {
    const data = await getConversations(USER_ID);
    setConversations(data);
  }, []);

  const loadMemories = useCallback(async () => {
    const data = await getMemories(USER_ID);
    setMemories(data);
  }, []);

  useEffect(() => {
    loadConversations();
    loadMemories();
  }, [loadConversations, loadMemories]);

  async function handleSelectConversation(id: string) {
    setActiveConversationId(id);
    setRelevantMemories([]);
    const msgs = await getMessages(id);
    setMessages(msgs);
    setSidebarOpen(false);
  }

  function handleNewConversation() {
    setActiveConversationId(null);
    setMessages([]);
    setRelevantMemories([]);
    setSidebarOpen(false);
  }

  async function handleSend(text: string) {
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setStreamingContent("");
    setRelevantMemories([]);

    let currentConvId = activeConversationId;
    let accumulated = "";

    try {
      await sendMessage(text, currentConvId, USER_ID, {
        onConversationId: (id) => {
          currentConvId = id;
          setActiveConversationId(id);
        },
        onMemories: (mems) => setRelevantMemories(mems),
        onToken: (token) => {
          accumulated += token;
          setStreamingContent(accumulated);
        },
        onDone: () => {
          setMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
          setStreamingContent("");
          setIsStreaming(false);
          loadConversations();
          loadMemories();
        },
      });
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Fehler beim Verbinden mit dem Backend. Läuft Ollama?" },
      ]);
      setStreamingContent("");
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar – desktop always visible, mobile as overlay */}
      <div
        className={`
          fixed md:relative z-30 h-full transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          activeView={activeView}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onViewChange={(v) => { setActiveView(v); setSidebarOpen(false); }}
          onClose={() => setSidebarOpen(false)}
          isMobile={true}
        />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e2e] md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-[#6b6b8a]">
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-[#e2e2f0]">
            {activeView === "memories" ? "Vault" : "Second Brain"}
          </span>
        </div>

        {activeView === "memories" ? (
          <MemoryPanel memories={memories} onRefresh={loadMemories} />
        ) : (
          <>
            <ChatPanel
              messages={messages}
              streamingContent={streamingContent}
              isStreaming={isStreaming}
              relevantMemories={relevantMemories}
            />
            <QuickCapture onSend={handleSend} isStreaming={isStreaming} />
          </>
        )}
      </div>
    </div>
  );
}
