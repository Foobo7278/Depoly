"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  Users, 
  UserX, 
  MessageSquare, 
  ShieldAlert, 
  UserPlus, 
  Globe, 
  Terminal, 
  Send,
  X,
  ShieldCheck
} from "lucide-react";
import { Friend, Message } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FriendsViewProps {
  friends: Friend[];
  onRemoveFriend: (id: string) => void;
  onOpenAddFriend: () => void;
  onToast: (msg: string, type: "success" | "info" | "error") => void;
  userName: string;
}

export default function FriendsView({
  friends,
  onRemoveFriend,
  onOpenAddFriend,
  onToast,
  userName,
}: FriendsViewProps) {
  const [activeDmFriend, setActiveDmFriend] = useState<Friend | null>(null);
  const [dmMessages, setDmMessages] = useState<Message[]>([]);
  const [dmInput, setDmInput] = useState("");

  const handleOpenDm = (friend: Friend) => {
    setActiveDmFriend(friend);
    onToast(`💬 Opened direct line with ${friend.displayName}`, "info");

    const initialDms: Message[] = [
      { id: "dm_1", senderId: "sys", senderName: "SYSTEM", text: `🔒 Ephemeral point-to-point secure channel established with verified handle.`, timestamp: Date.now() - 3600000, isSystem: true }
    ];

    if (friend.online) {
      initialDms.push({
        id: "dm_2",
        senderId: friend.id,
        senderName: friend.displayName,
        text: "Hey! Glad to see you online. Handshake protocol working green.",
        timestamp: Date.now() - 180000,
      });
    } else {
      initialDms.push({
        id: "dm_2",
        senderId: "system",
        senderName: "SYSTEM WARNING",
        text: "Peer node currently offline. Packets will be queued in cache relays.",
        timestamp: Date.now() - 120000,
        isSystem: true,
      });
    }

    setDmMessages(initialDms);
  };

  const submitDm = () => {
    const text = dmInput.trim();
    if (!text || !activeDmFriend) return;

    setDmInput("");

    const userMsg: Message = {
      id: `dm_usr_${Date.now()}`,
      senderId: "me",
      senderName: `${userName} (You)`,
      text,
      timestamp: Date.now(),
    };

    setDmMessages(prev => [...prev, userMsg]);

    if (activeDmFriend.online) {
      setTimeout(() => {
        const replies = [
          "Awesome. I'll load those specs in my local node shortly.",
          "Perfect. Let's schedule a modular compilation session later.",
          "Symmetric check cleared. Protocol running perfectly.",
          "Received. Packet check cleared."
        ];
        const reply: Message = {
          id: `dm_reply_${Date.now()}`,
          senderId: activeDmFriend.id,
          senderName: activeDmFriend.displayName,
          text: replies[Math.floor(Math.random() * replies.length)],
          timestamp: Date.now(),
        };
        setDmMessages(prev => [...prev, reply]);
      }, 1500);
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full min-h-0 bg-[#080816] p-6 overflow-y-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00e676]" />
            <h1 className="font-orbitron font-black text-lg tracking-wide text-white uppercase">CONTACTS MODULE</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Persisted network peer definitions. Direct lines operate cryptographically without external servers logs.
          </p>
        </div>

        <button
          onClick={onOpenAddFriend}
          className="px-4 py-2 bg-[#12122b] hover:bg-[#1b1b45] active:scale-[0.98] border border-[#00e676]/40 hover:border-[#00e676] text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-all"
        >
          <UserPlus className="w-4 h-4 text-[#00e676]" />
          <span>LINK NEW PEER</span>
        </button>
      </div>

      {/* FRIENDS LIST */}
      {friends.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono text-xs max-w-sm mx-auto">
          <Terminal className="w-10 h-10 text-slate-700 mb-2" />
          <span>Your contacts bank is currently unseeded. Generate random matches and add them to persistence.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="bg-[#0c0c20]/80 border border-[#1b1b45] hover:border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg"
            >
              <div className="flex items-start gap-3.5">
                {friend.avatar ? (
                  <Image src={friend.avatar} alt={friend.displayName} width={40} height={40} unoptimized referrerPolicy="no-referrer" className="w-10 h-10 rounded-full border border-slate-700" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#12122b] to-[#1b1b3f] border border-slate-800 flex items-center justify-center text-slate-300 font-bold font-orbitron text-xs uppercase">
                    {friend.displayName.substring(0, 1)}
                  </div>
                )}

                <div className="flex-grow">
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className="text-xs font-bold font-orbitron text-white flex items-center gap-1.5 leading-normal">
                      {friend.displayName}
                      {friend.online ? (
                        <span className="w-2 h-2 rounded-full bg-[#00e676]" title="Online" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-600" title="Offline" />
                      )}
                    </span>
                    
                    <button
                      onClick={() => onRemoveFriend(friend.id)}
                      className="p-1 hover:bg-[#1a1a3a] rounded text-slate-500 hover:text-[#ff4081] transition-all cursor-pointer"
                      title="Delete peer handle connection"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] font-mono text-[#00e5ff] mt-0.5">{friend.username}</p>
                  <p className="text-[9px] text-slate-500 font-mono flex items-center gap-1 mt-1">
                    <Globe className="w-3 h-3" />
                    <span>{friend.country}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-[#1b1b45]/50 pt-3 flex items-center justify-between">
                <span className="text-[8px] font-mono text-slate-600">
                  Added on: {new Date(friend.addedAt).toLocaleDateString()}
                </span>

                <button
                  onClick={() => handleOpenDm(friend)}
                  className="px-3 py-1.5 bg-[#11112b] border border-slate-800 hover:border-[#00e5ff]/50 text-white text-[10px] font-bold font-orbitron tracking-tight rounded-md flex items-center gap-1.5 transition-all cursor-pointer uppercase"
                >
                  <MessageSquare className="w-3 h-3 text-[#00e5ff]" />
                  <span>DIRECT DM</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DIRECT CHAT MODAL INTERACTION */}
      {activeDmFriend && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e0e24] border border-[#1b1b45] rounded-xl overflow-hidden shadow-[0_0_25px_rgba(0,229,255,0.15)] flex flex-col h-[500px]">
            {/* Header info */}
            <div className="p-4 bg-[#111129] border-b border-[#1b1b45] flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#00e676]" />
                <div>
                  <h4 className="font-orbitron font-bold text-xs text-white leading-normal">
                    Secure DM line: {activeDmFriend.displayName}
                  </h4>
                  <div className="text-[9px] font-mono text-[#00e5ff]">
                    {activeDmFriend.username} • {activeDmFriend.online ? "ONLINE SOURCE" : "OFFLINE SOURCE"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveDmFriend(null)}
                className="p-1 hover:bg-[#1a1a3d] border border-transparent hover:border-[#1b1b45] rounded cursor-pointer text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scroll messages log */}
            <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3">
              {dmMessages.map((msg) => {
                const isMe = msg.senderId === "me";

                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2 text-center">
                      <span className="px-3 py-1 rounded bg-[#10102b] border border-[#1b1b3c]/60 text-[8px] font-mono text-[#00e5ff] uppercase tracking-wider">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[75%]",
                      isMe ? "self-end items-end" : "self-start items-start"
                    )}
                  >
                    <span className="text-[8px] font-mono text-slate-500 mb-0.5">
                      {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs leading-relaxed",
                        isMe
                          ? "bg-[#0b0b1f] border border-[#00e5ff]/20 text-white rounded-tr-none"
                          : "bg-[#11112e] border border-[#1b1b42] text-slate-200 rounded-tl-none"
                      )}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Entry fields */}
            <div className="p-3 bg-[#0d0d21] border-t border-[#1b1b45] flex-shrink-0 flex gap-2 items-center">
              <input
                type="text"
                placeholder={activeDmFriend.online ? "Enter packets line..." : "Node offline. System queue active..."}
                value={dmInput}
                onChange={(e) => setDmInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitDm()}
                className="flex-grow bg-[#060613] border border-[#1b1b42] focus:border-[#00e5ff] text-xs font-mono text-white placeholder-slate-600 outline-none rounded-lg py-2 px-3 transition-all"
              />
              <button
                onClick={submitDm}
                disabled={!dmInput.trim()}
                className="p-2 bg-gradient-to-r from-[#00e676] to-[#00e5ff] hover:opacity-90 disabled:opacity-40 rounded-lg text-black font-bold cursor-pointer transition-all flex items-center justify-center.shadow-lg"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
