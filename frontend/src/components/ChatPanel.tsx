"use client";
import { Message } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

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
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-8">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-[#7c6af7]/10 border border-[#7c6af7]/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#7c6af7]/20 border border-[#7c6af7]/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#7c6af7]/60" />
            </div>
          </div>
          <div className="absolute inset-0 rounded-full animate-ping bg-[#7c6af7]/5" style={{ animationDuration: "3s" }} />
        </div>
        <div className="space-y-2">
          <p className="text-[#4a4a6a] text-sm tracking-wide">
            Was beschäftigt dich?
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-xl mx-auto space-y-8">
        {messages.map((msg, i) => (
          <div key={i} className={clsx("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
            {msg.role === "user" ? (
              <p className="text-sm text-[#4a4a6a] text-right max-w-[85%] leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            ) : (
              <div className="max-w-[92%]">
                <div className="prose prose-invert prose-sm text-[#9090b0] leading-relaxed [&>*]:text-[#9090b0] [&_strong]:text-[#b0b0d0] [&_code]:text-[#7c6af7] [&_a]:text-[#7c6af7]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}

        {isStreaming && (
          <div className="flex flex-col items-start">
            <div className="max-w-[92%]">
              {streamingContent ? (
                <div className="prose prose-invert prose-sm text-[#9090b0] leading-relaxed [&>*]:text-[#9090b0] [&_strong]:text-[#b0b0d0] [&_code]:text-[#7c6af7]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex gap-1.5 items-center h-5">
                  <span className="w-1 h-1 rounded-full bg-[#7c6af7]/40 animate-pulse" />
                  <span className="w-1 h-1 rounded-full bg-[#7c6af7]/40 animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1 h-1 rounded-full bg-[#7c6af7]/40 animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              )}
            </div>
          </div>
        )}

        {relevantMemories.length > 0 && (
          <div className="flex items-start gap-2 opacity-50">
            <Sparkles size={11} className="text-[#7c6af7] mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {relevantMemories.map((m, i) => (
                <span key={i} className="text-[10px] text-[#5a5a7a] leading-relaxed">{m}</span>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
