"use client";

import React, { useState } from "react";
import { X, ShieldAlert, Sparkles } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (reportedUserId: string, reason: string) => void;
  partnerName?: string;
  partnerId?: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  onSubmitReport,
  partnerName = "Stranger",
  partnerId = "default_id",
}: ReportModalProps) {
  const [reason, setReason] = useState("harassment");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmitReport(partnerId, `${reason}: ${desc}`);
      setDesc("");
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0e0e24] border border-[#ff4081]/30 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(255,64,129,0.15)]">
        <div className="p-4 bg-[#111129] border-b border-[#1b1b45] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#ff4081]" />
            <h3 className="font-orbitron font-bold text-sm tracking-wide text-white">SUBMIT SAFETY REPORT</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#1c1c3f] rounded transition-all cursor-pointer">
            <X className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            Report node <span className="text-[#ff4081] font-bold font-orbitron">{partnerName}</span> if they triggered offensive behaviors, server exploits, or harassment codes.
          </p>

          <div>
            <label className="block text-[10px] font-bold font-mono text-[#ff4081] uppercase mb-1.5">Violation Category</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#060613]/90 border border-[#1b1b45] focus:border-[#ff4081] rounded-lg py-2 px-3 text-xs font-mono text-white outline-none transition-all cursor-pointer"
            >
              <option value="harassment">Aggressive Behavior / Harassment</option>
              <option value="spam">Botting / Spamming Protocol</option>
              <option value="hate_speech">Hateful / Malicious Texts</option>
              <option value="exploit">Server Hacks / Attempted Phishing</option>
              <option value="inappropriate">Explicit / Inappropriate Actions</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold font-mono text-[#ff4081] uppercase mb-1.5">Context Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Provide terminal lines or log context..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-[#060613]/90 border border-[#1b1b45] focus:border-[#ff4081] rounded-lg py-2 px-3 text-xs font-mono text-white placeholder-slate-600 outline-none transition-all resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2.5 bg-gradient-to-r from-[#ff4081] to-[#7c4dff] hover:from-[#e11c5e] hover:to-[#5d2edf] text-white font-bold font-orbitron text-xs rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,64,129,0.25)]"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>TRANSMIT SYSTEM BAN INQUIRY</span>
          </button>
        </div>
      </div>
    </div>
  );
}
