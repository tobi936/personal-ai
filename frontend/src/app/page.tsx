"use client";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import MemoryPanel from "@/components/MemoryPanel";
import QuickCapture from "@/components/QuickCapture";
import { Conversation, Message, MemoryItem } from "@/lib/types";
import { getConversations, getMessages, getMemories, sendMessage } from "@/lib/api";
import { Menu, Archive } from "lucide-react";

const USER_ID = "default";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [relevantMemories, setRelevantMemories] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<"chat" | "memories">("chat");

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
    setActiveView("chat");
  }

  function handleNewConversation() {
    setActiveConversationId(null);
    setMessages([]);
    setRelevantMemories([]);
    setSidebarOpen(false);
    setActiveView("chat");
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
        { role: "assistant", content: "Fehler beim Verbinden mit dem Backend." },
      ]);
      setStreamingContent("");
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#080810]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed z-30 h-full transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
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

      <div className="flex flex-col flex-1 min-w-0 relative">
        {/* Minimal header */}
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#3a3a5c] hover:text-[#6b6b8a] transition-colors"
          >
            <Menu size={18} />
          </button>

          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xs font-medium tracking-[0.15em] text-[#3a3a5c] uppercase">
              Second Brain
            </span>
          </div>

          <button
            onClick={() => { setActiveView("memories"); setSidebarOpen(false); }}
            className="flex items-center gap-1.5 text-[#3a3a5c] hover:text-[#6b6b8a] transition-colors"
          >
            <Archive size={15} />
            {memories.length > 0 && (
              <span className="text-[10px] tabular-nums">{memories.length}</span>
            )}
          </button>
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
