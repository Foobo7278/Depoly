"use client";

import React, { useState } from "react";
import { X, Search, ShieldAlert, UserPlus, Sparkles } from "lucide-react";

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (username: string, displayName: string, country: string) => void;
}

export default function AddFriendModal({
  isOpen,
  onClose,
  onAddFriend,
}: AddFriendModalProps) {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedUser, setResolvedUser] = useState<{ displayName: string; country: string } | null>(null);

  if (!isOpen) return null;

  const handleResolve = () => {
    setError(null);
    setResolvedUser(null);
    const cleaned = handle.trim().toLowerCase();

    if (!cleaned) {
      setError("Please key in a valid node handle username!");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Let's resolve some cool predetermined users
      if (cleaned === "@alex_m" || cleaned === "alex") {
        setError("You are already connected to @alex_m!");
      } else if (cleaned.startsWith("@")) {
        const dName = cleaned.replace("@", "").charAt(0).toUpperCase() + cleaned.slice(2).replace("@", "");
        setResolvedUser({
          displayName: dName,
          country: "🇪🇺 Europe Node"
        });
      } else {
        setError("User handles must begin with @ symbol (e.g., @cyberpunk_9)");
      }
    }, 700);
  };

  const handleSubmit = () => {
    if (resolvedUser) {
      onAddFriend(handle.toLowerCase(), resolvedUser.displayName, resolvedUser.country);
      setHandle("");
      setResolvedUser(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0e0e24] border border-[#1b1b45] rounded-xl overflow-hidden shadow-[0_0_25px_rgba(0,229,255,0.15)]">
        <div className="p-4 bg-[#111129] border-b border-[#1b1b45] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#00e5ff]" />
            <h3 className="font-orbitron font-bold text-sm tracking-wide text-white">ADD NETWORK PEER</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#1c1c3f] rounded transition-all cursor-pointer">
            <X className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            Specify the cryptographic username handle of your partner to establish a verified, persistent line of communication.
          </p>

          <div>
            <label className="block text-[10px] font-bold font-mono text-[#00e5ff] uppercase mb-1.5">User Handle</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="@username_handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-[#060613]/90 border border-[#1b1b45] focus:border-[#00e5ff] rounded-lg py-2 pl-3 pr-8 text-xs font-mono text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>
              <button
                onClick={handleResolve}
                disabled={loading}
                className="px-4 bg-[#11112d] hover:bg-[#1a1a45] active:scale-[0.98] border border-[#1b1b45] text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border-2 border-[#00e5ff] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-[#00e5ff]" />
                )}
                <span>Lookup</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-[#ff4081]/10 border border-[#ff4081]/30 rounded text-[11px] text-[#ff4081] font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resolvedUser && (
            <div className="p-4 bg-[#0a0a1a] border border-[#00e676]/30 rounded-lg flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold font-orbitron text-white">{resolvedUser.displayName}</div>
                  <div className="text-[10px] font-mono text-[#00e676]">{handle}</div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">{resolvedUser.country}</div>
                </div>
                <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/30">
                  Ready to link
                </span>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full py-2 bg-gradient-to-r from-[#00e5ff] to-[#7c4dff] hover:from-[#00e5ff] hover:to-[#5c2dff] text-white font-bold font-orbitron text-xs rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.25)]"
              >
                <Sparkles className="w-4 h-4" />
                <span>CONFIRM PROTOCOL HANDSHAKE</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
