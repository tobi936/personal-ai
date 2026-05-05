"use client";
import { MemoryItem } from "@/lib/types";
import { deleteMemory } from "@/lib/api";
import { Brain, Trash2, RefreshCw } from "lucide-react";
import { useState } from "react";

interface MemoryPanelProps {
  memories: MemoryItem[];
  onRefresh: () => void;
}

export default function MemoryPanel({ memories, onRefresh }: MemoryPanelProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const filtered = memories.filter((m) =>
    m.memory?.toLowerCase().includes(filter.toLowerCase())
  );

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteMemory(id);
    onRefresh();
    setDeletingId(null);
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-[#7c6af7]" />
            <h2 className="text-sm font-semibold text-[#e2e2f0]">Vault – Gespeicherte Erinnerungen</h2>
          </div>
          <button
            onClick={onRefresh}
            className="text-[#6b6b8a] hover:text-[#e2e2f0] transition-colors"
            title="Aktualisieren"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <input
          type="text"
          placeholder="Erinnerungen durchsuchen..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-[#12121a] border border-[#1e1e2e] rounded-xl px-4 py-2.5 text-sm text-[#e2e2f0] placeholder-[#6b6b8a] outline-none focus:border-[#7c6af7] mb-4 transition-colors"
        />

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#6b6b8a] text-sm">
            {memories.length === 0
              ? "Noch keine Erinnerungen gespeichert. Führe ein paar Gespräche!"
              : "Keine Erinnerungen gefunden."}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((memory) => (
              <div
                key={memory.id}
                className="group bg-[#12121a] border border-[#1e1e2e] rounded-xl px-4 py-3 flex items-start gap-3 hover:border-[#2a2a3e] transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#7c6af7] mt-1.5 flex-shrink-0" />
                <p className="flex-1 text-sm text-[#e2e2f0] leading-relaxed">{memory.memory}</p>
                <button
                  onClick={() => handleDelete(memory.id)}
                  disabled={deletingId === memory.id}
                  className="opacity-0 group-hover:opacity-100 text-[#6b6b8a] hover:text-red-400 transition-all flex-shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
