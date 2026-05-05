"use client";
import { Message } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Brain } from "lucide-react";
import clsx from "clsx";
import { useEffect, useRef } from "react";

interface ChatPanelProps {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  relevantMemories: string[];
}

export default function ChatPanel({
  messages,
  streamingContent,
  isStreaming,
  relevantMemories,
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
        <div className="w-14 h-14 rounded-full bg-[#1e1e2e] flex items-center justify-center">
          <Brain size={24} className="text-[#7c6af7]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#e2e2f0] mb-1">Dein Second Brain</h2>
          <p className="text-sm text-[#6b6b8a] max-w-xs">
            Schreib einen Gedanken, stelle eine Frage oder halte etwas fest. Die KI erinnert sich.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={clsx("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
        >
          {msg.role === "assistant" && (
            <div className="w-7 h-7 rounded-full bg-[#1e1e2e] flex items-center justify-center flex-shrink-0 mt-1">
              <Brain size={13} className="text-[#7c6af7]" />
            </div>
          )}
          <div
            className={clsx(
              "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
              msg.role === "user"
                ? "bg-[#7c6af7] text-white rounded-tr-sm"
                : "bg-[#12121a] border border-[#1e1e2e] text-[#e2e2f0] rounded-tl-sm"
            )}
          >
            {msg.role === "assistant" ? (
              <div className="prose prose-invert text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
            ) : (
              <span className="whitespace-pre-wrap">{msg.content}</span>
            )}
          </div>
        </div>
      ))}

      {isStreaming && (
        <div className="flex gap-3 justify-start">
          <div className="w-7 h-7 rounded-full bg-[#1e1e2e] flex items-center justify-center flex-shrink-0 mt-1">
            <Brain size={13} className="text-[#7c6af7]" />
          </div>
          <div className="max-w-[80%] bg-[#12121a] border border-[#1e1e2e] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-[#e2e2f0]">
            {streamingContent ? (
              <div className="prose prose-invert text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
              </div>
            ) : (
              <span className="inline-flex gap-1 items-center text-[#6b6b8a]">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: "0.15s" }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: "0.3s" }}>●</span>
              </span>
            )}
          </div>
        </div>
      )}

      {relevantMemories.length > 0 && (
        <div className="mx-auto max-w-lg bg-[#0e0e16] border border-[#1e1e2e] rounded-xl px-4 py-2.5">
          <p className="text-[10px] text-[#6b6b8a] mb-1.5 uppercase tracking-wider font-medium">Relevante Erinnerungen</p>
          <ul className="space-y-0.5">
            {relevantMemories.map((m, i) => (
              <li key={i} className="text-xs text-[#7c6af7] flex gap-1.5">
                <span className="text-[#6b6b8a]">•</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
