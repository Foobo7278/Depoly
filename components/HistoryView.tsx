"use client";

import React, { useState } from "react";
import { 
  History, 
  Trash2, 
  Search, 
  Terminal, 
  ShieldAlert, 
  Clock, 
  MessageSquare,
  Globe
} from "lucide-react";
import { HistoryItem } from "@/lib/types";
import { formatTime } from "@/lib/utils";

interface HistoryViewProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onRemoveHistoryItem: (id: string) => void;
  onToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function HistoryView({
  history,
  onClearHistory,
  onRemoveHistoryItem,
  onToast,
}: HistoryViewProps) {
  const [search, setSearch] = useState("");

  const filtered = history.filter(item => 
    item.partnerName.toLowerCase().includes(search.toLowerCase()) || 
    item.partnerCountry.toLowerCase().includes(search.toLowerCase())
  );

  const handleClearAll = () => {
    if (history.length === 0) return;
    onClearHistory();
    onToast("🗑️ History logs successfully cleared from local node storage.", "success");
  };

  return (
    <div className="flex-grow flex flex-col h-full min-h-0 bg-[#080816] p-6 overflow-y-auto">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#7c4dff]" />
            <h1 className="font-orbitron font-black text-lg tracking-wide text-white uppercase">DECRYPTION SESSION LOGS</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Historical point-to-point tunnel telemetry. All chat buffers are wiped, saving only connection durations and metrics.
          </p>
        </div>

        <div className="flex gap-2 items-center">
          {/* Search bar */}
          <div className="relative w-48 sm:w-56">
            <input
              type="text"
              placeholder="Search history hashes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d0d22] border border-[#1b1b45] focus:border-[#7c4dff] text-xs font-mono text-white placeholder-slate-600 rounded-lg pl-3 pr-8 py-2 outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-600 absolute right-2.5 top-2.5" />
          </div>

          <button
            onClick={handleClearAll}
            disabled={history.length === 0}
            className="px-3.5 py-2 border border-[#ff4081]/30 hover:border-[#ff4081] text-[#ff4081] hover:bg-[#ff4081]/10 disabled:opacity-40 text-xs font-mono font-bold rounded-lg cursor-pointer transition-all uppercase flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Purge logs</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono text-xs max-w-sm mx-auto">
          <Terminal className="w-10 h-10 text-slate-700 mb-2" />
          <span>No historical node handshakes registered in this local slice.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Telemetry Console Table */}
          <div className="w-full bg-[#0d0d22]/80 border border-[#1b1b45] rounded-xl overflow-hidden shadow-lg">
            
            {/* Table headers */}
            <div className="grid grid-cols-4 px-4 py-3 bg-[#111129] border-b border-[#1b1b45] text-[10px] font-bold font-mono text-[#7c4dff] uppercase tracking-wider">
              <span>Verified Partner</span>
              <span>Node Location</span>
              <span>Total Packets</span>
              <span className="text-right">Action</span>
            </div>

            {/* Logs lines */}
            <div className="divide-y divide-[#1b1b45]/40">
              {filtered.map((item) => (
                <div 
                  key={item.id}
                  className="grid grid-cols-4 px-4 py-3.5 text-xs font-mono text-slate-300 hover:bg-[#11112d]/50 transition-all items-center"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-white font-orbitron">{item.partnerName}</span>
                    <span className="text-[9px] text-slate-500">{item.date}</span>
                  </div>

                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-[#00e5ff]" />
                    <span>{item.partnerCountry}</span>
                  </span>

                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1 text-slate-300 font-semibold">
                      <MessageSquare className="w-3 h-3 text-[#00e676]" />
                      <span>{item.messagesCount} msgs</span>
                    </span>
                    <span className="text-[9px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(item.durationSeconds)} duration</span>
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        onRemoveHistoryItem(item.id);
                        onToast("🗑️ Telemetry line erased.", "info");
                      }}
                      className="p-1.5 bg-[#12122b] hover:bg-[#ff4081]/10 rounded border border-transparent hover:border-[#ff4081]/30 text-slate-500 hover:text-[#ff4081] transition-all cursor-pointer"
                      title="Erase log line"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className="text-[9px] text-slate-500 font-mono text-right px-1">
            Showing {filtered.length} of {history.length} decrypted connection vectors.
          </div>
        </div>
      )}

    </div>
  );
}
