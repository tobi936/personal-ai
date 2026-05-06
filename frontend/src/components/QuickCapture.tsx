"use client";
import { useState, useRef, KeyboardEvent } from "react";
import { Loader2, ArrowUp } from "lucide-react";

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
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  return (
    <div className="px-4 pb-6 pt-2">
      <div className="max-w-xl mx-auto">
        <div className="flex items-end gap-3 bg-[#0e0e1a] border border-[#1a1a2e] rounded-2xl px-4 py-3 focus-within:border-[#7c6af7]/40 transition-colors duration-300">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Schreib einen Gedanken…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-[#9090b0] placeholder-[#2e2e4a] outline-none resize-none leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-[#7c6af7]/80 disabled:bg-[#1a1a2e] flex items-center justify-center transition-all hover:bg-[#7c6af7] disabled:cursor-not-allowed"
          >
            {isStreaming ? (
              <Loader2 size={12} className="text-white/40 animate-spin" />
            ) : (
              <ArrowUp size={12} className="text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
