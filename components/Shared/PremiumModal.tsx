"use client";

import React, { useState } from "react";
import { X, Sparkles, Gem, ArrowRight, ShieldCheck, Zap, Globe, MessageSquareDiff } from "lucide-react";
import confetti from "canvas-confetti";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
  currentTier: "Free" | "Premium";
}

export default function PremiumModal({
  isOpen,
  onClose,
  onUpgradeSuccess,
  currentTier,
}: PremiumModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Trigger confetti blowout!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#00e5ff", "#7c4dff", "#ff4081", "#00e676"]
      });
      onUpgradeSuccess();
      onClose();
    }, 1200);
  };

  const perks = [
    { icon: ShieldCheck, title: "Verified Blue Badge", desc: "Gain instant authenticity tags on your handshakes to secure trust.", color: "text-[#00e5ff]" },
    { icon: Zap, title: "Zero Match Latency", desc: "Hop straight to the front of the node matchmaking queues.", color: "text-[#ff4081]" },
    { icon: Globe, title: "Priority Geo-location Filtering", desc: "Sort strangers easily by specific continents & global countries.", color: "text-[#00e676]" },
    { icon: MessageSquareDiff, title: "Continuous Ephemeral Chats", desc: "No timeouts on chat durations. Transmit limitless files or loops.", color: "text-[#7c4dff]" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0e0e28] border border-[#7c4dff]/40 rounded-xl overflow-hidden shadow-[0_0_35px_rgba(124,77,255,0.25)] relative">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00e5ff] via-[#7c4dff] to-[#ff4081]" />

        {/* Header */}
        <div className="p-5 flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Gem className="w-5 h-5 text-[#ff4081] animate-bounce" />
            <span className="font-orbitron font-black text-sm tracking-widest text-[#00e5ff] uppercase">FLUX PREMIUM SUITE</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#1a1a45] rounded cursor-pointer transition-all">
            <X className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Body content */}
        <div className="px-6 py-2 flex flex-col gap-6">
          <div className="text-center">
            <h3 className="font-orbitron text-xl font-bold tracking-tight text-white mb-2">
              UPGRADE MODULE TO FLUX PREMIUM
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Unshackle full cryptographic matchmaking power, custom filters, and telemetry controls.
            </p>
          </div>

          {/* Perks list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <div key={i} className="p-3 bg-[#11112e] border border-[#1b1b45] hover:border-[#7c4dff]/40 rounded-lg transition-all flex gap-3">
                  <div className="flex-shrink-0">
                    <Icon className={`w-5 h-5 ${perk.color}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{perk.title}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-1 leading-normal">{perk.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Price plan card */}
          <div className="p-4 bg-[#0a0a20] border border-[#1b1b45] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold font-orbitron text-white">$4.99</span>
                <span className="text-[10px] text-slate-500 font-mono">/ Month / Per Node</span>
              </div>
              <div className="text-[10px] text-[#00e676] font-mono font-semibold mt-1">✓ Instant protocol deployment</div>
            </div>

            {currentTier === "Premium" ? (
              <span className="px-5 py-2.5 rounded-lg bg-[#00e676]/10 border border-[#00e676] text-[#00e676] text-xs font-bold font-orbitron shadow-[0_0_10px_rgba(0,230,118,0.2)]">
                ACTIVE SUBSCRIPTION
              </span>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#7c4dff] via-[#ff4081] to-[#00e5ff] hover:opacity-90 active:scale-[0.98] text-white text-xs font-bold font-orbitron tracking-wide shadow-[0_0_15px_rgba(124,77,255,0.4)] cursor-pointer transition-all flex items-center gap-1.5"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>PURCHASE PASS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[#11112d] border-t border-[#1b1b45] mt-4 flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-500">Secure AES transaction processing. Cancel anytime.</span>
          <span className="text-[10px] text-[#7c4dff] font-bold font-orbitron flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#ff4081]" />
            <span>Flux Sec</span>
          </span>
        </div>
      </div>
    </div>
  );
}
