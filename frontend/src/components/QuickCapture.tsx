"use client";
import { useState, useRef, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";

interface QuickCaptureProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
}

export default function QuickCapture({ onSend, isStreaming }: QuickCaptureProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  return (
    <div className="border-t border-[#1e1e2e] px-4 py-3">
      <div className="flex items-end gap-2 bg-[#12121a] border border-[#1e1e2e] rounded-2xl px-4 py-3 focus-within:border-[#7c6af7] transition-colors">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Gedanke, Frage oder Notiz eingeben... (Enter zum Senden, Shift+Enter für Zeilenumbruch)"
          rows={1}
          className="flex-1 bg-transparent text-sm text-[#e2e2f0] placeholder-[#6b6b8a] outline-none resize-none leading-relaxed"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#7c6af7] disabled:bg-[#2a2a3e] flex items-center justify-center transition-colors hover:bg-[#6b59e6] disabled:cursor-not-allowed"
        >
          {isStreaming ? (
            <Loader2 size={14} className="text-white animate-spin" />
          ) : (
            <Send size={14} className="text-white" />
          )}
        </button>
      </div>
      <p className="text-[10px] text-[#6b6b8a] mt-1.5 text-center">
        Enter zum Senden · Shift+Enter für neue Zeile
      </p>
    </div>
  );
}
