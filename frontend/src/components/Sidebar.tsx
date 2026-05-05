"use client";
import { Conversation } from "@/lib/types";
import { MessageSquare, Brain, Plus, Trash2, X } from "lucide-react";
import clsx from "clsx";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeView: "chat" | "memories";
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onViewChange: (view: "chat" | "memories") => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({
  conversations,
  activeConversationId,
  activeView,
  onSelectConversation,
  onNewConversation,
  onViewChange,
  onClose,
  isMobile,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-[#0e0e16] border-r border-[#1e1e2e] w-64">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1e1e2e]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#7c6af7] flex items-center justify-center">
            <Brain size={13} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-[#e2e2f0]">Second Brain</span>
        </div>
        {isMobile && (
          <button onClick={onClose} className="text-[#6b6b8a] hover:text-[#e2e2f0]">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="px-3 py-3 flex gap-2">
        <button
          onClick={() => onViewChange("chat")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors",
            activeView === "chat"
              ? "bg-[#1e1e2e] text-[#7c6af7]"
              : "text-[#6b6b8a] hover:text-[#e2e2f0]"
          )}
        >
          <MessageSquare size={13} />
          Chats
        </button>
        <button
          onClick={() => onViewChange("memories")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors",
            activeView === "memories"
              ? "bg-[#1e1e2e] text-[#7c6af7]"
              : "text-[#6b6b8a] hover:text-[#e2e2f0]"
          )}
        >
          <Brain size={13} />
          Vault
        </button>
      </div>

      {activeView === "chat" && (
        <>
          <button
            onClick={onNewConversation}
            className="mx-3 mb-2 flex items-center gap-2 px-3 py-2 rounded-md border border-[#1e1e2e] text-[#6b6b8a] hover:text-[#e2e2f0] hover:border-[#7c6af7] text-xs transition-colors"
          >
            <Plus size={13} />
            Neue Unterhaltung
          </button>

          <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
            {conversations.length === 0 && (
              <p className="text-xs text-[#6b6b8a] px-2 py-4 text-center">Noch keine Gespräche</p>
            )}
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={clsx(
                  "w-full text-left px-3 py-2 rounded-md text-xs transition-colors group",
                  activeConversationId === conv.id
                    ? "bg-[#1e1e2e] text-[#e2e2f0]"
                    : "text-[#6b6b8a] hover:bg-[#16161f] hover:text-[#e2e2f0]"
                )}
              >
                <div className="truncate">{conv.title}</div>
                <div className="text-[10px] text-[#6b6b8a] mt-0.5">
                  {conv.message_count} Nachrichten
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
