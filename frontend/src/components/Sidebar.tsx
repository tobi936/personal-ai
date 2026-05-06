"use client";
import { Conversation } from "@/lib/types";
import { Brain, Plus, X, Archive, MessageSquare } from "lucide-react";
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
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-[#080810] border-r border-[#141420] w-60">
      <div className="flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-[#7c6af7]/20 border border-[#7c6af7]/30 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#7c6af7]/60" />
          </div>
          <span className="text-[11px] font-medium tracking-[0.15em] text-[#3a3a5c] uppercase">Second Brain</span>
        </div>
        <button onClick={onClose} className="text-[#2a2a40] hover:text-[#6b6b8a] transition-colors">
          <X size={15} />
        </button>
      </div>

      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={() => onViewChange("chat")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] transition-colors",
            activeView === "chat"
              ? "bg-[#7c6af7]/10 text-[#7c6af7]"
              : "text-[#2e2e4a] hover:text-[#6b6b8a]"
          )}
        >
          <MessageSquare size={12} />
          Threads
        </button>
        <button
          onClick={() => onViewChange("memories")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] transition-colors",
            activeView === "memories"
              ? "bg-[#7c6af7]/10 text-[#7c6af7]"
              : "text-[#2e2e4a] hover:text-[#6b6b8a]"
          )}
        >
          <Archive size={12} />
          Vault
        </button>
      </div>

      <div className="h-px bg-[#0f0f1e] mx-4 mb-3" />

      {activeView === "chat" && (
        <>
          <button
            onClick={onNewConversation}
            className="mx-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg border border-[#141420] text-[#2e2e4a] hover:text-[#6b6b8a] hover:border-[#2a2a40] text-[11px] transition-colors"
          >
            <Plus size={12} />
            Neuer Thread
          </button>

          <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
            {conversations.length === 0 && (
              <p className="text-[11px] text-[#1e1e2e] px-2 py-6 text-center">Noch keine Threads</p>
            )}
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={clsx(
                  "w-full text-left px-3 py-2.5 rounded-lg text-[11px] transition-colors",
                  activeConversationId === conv.id
                    ? "bg-[#7c6af7]/10 text-[#6060a0]"
                    : "text-[#2a2a40] hover:bg-[#0e0e1a] hover:text-[#4a4a6a]"
                )}
              >
                <div className="truncate leading-relaxed">{conv.title}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
