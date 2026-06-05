"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  MessageSquare, 
  ShieldAlert, 
  ArrowLeft, 
  Hash, 
  Send, 
  Sparkles,
  Search,
  Check
} from "lucide-react";
import { Room, Message } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RoomsViewProps {
  rooms: Room[];
  onToast: (msg: string, type: "success" | "info" | "error") => void;
  userId: string;
  userName: string;
}

export default function RoomsView({
  rooms,
  onToast,
  userId,
  userName,
}: RoomsViewProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const endRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<any>(null);

  // Group tags filters
  const tagsList = ["all", "Sec", "LLMs", "Synth", "SaaS", "LoFi", "Ambient", "Vaporwave", "Crypto"];

  // Filtered rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          room.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && room.tags.some(tag => tag.toLowerCase() === activeTab.toLowerCase());
  });

  // Scroll to new group messages
  useEffect(() => {
    if (selectedRoom) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedRoom]);

  // Simulated Room conversation loops
  useEffect(() => {
    if (!selectedRoom) return;

    // Load initial room messages based on topic
    let seedMessages: Message[] = [
      { id: "sm_1", senderId: "sys", senderName: "SYSTEM-VERIFIER", text: `🔒 Encrypted channel established. Re-routing through ${selectedRoom.slug} interface.`, timestamp: Date.now() - 60000, isSystem: true }
    ];

    if (selectedRoom.id === "r1") {
      seedMessages.push(
        { id: "sm_2", senderId: "u_rust_h", senderName: "Rust_Hacker 🦀", text: "Are you guys checking those secure container proxies? Vite proxy was misrouting websocket handshakes.", timestamp: Date.now() - 30000 },
        { id: "sm_3", senderId: "u_sec_dev", senderName: "SecDev_Omega 🛡️", text: "Yeah, default nginx block on port 3000 solved it. All assets must pass local server proxies.", timestamp: Date.now() - 15000 }
      );
    } else if (selectedRoom.id === "r2") {
      seedMessages.push(
        { id: "sm_2", senderId: "u_ai_e", senderName: "AgentMaker 🤖", text: "Checking model weight drift on Gemini 1.5 flash vs 2.0. Proposing strict system bounds.", timestamp: Date.now() - 32000 },
        { id: "sm_3", senderId: "u_prom", senderName: "PromptArchitect 🧠", text: "Yes! System directives act as the absolute design ceiling. Always check for unrequested over-engineering.", timestamp: Date.now() - 17000 }
      );
    } else if (selectedRoom.id === "r3") {
      seedMessages.push(
        { id: "sm_2", senderId: "u_anal", senderName: "AnalogWaves 🎹", text: "Just patched my Moog filter into a retro cassette recorder. The saturation is super warm.", timestamp: Date.now() - 40000 },
        { id: "sm_3", senderId: "u_lo", senderName: "LofiFilter 🎧", text: "Nice. Drop a screenshot of your patch grid later. High resonance is golden.", timestamp: Date.now() - 25000 }
      );
    } else {
      seedMessages.push(
        { id: "sm_2", senderId: "u_sol", senderName: "Solaris_X 🪐", text: "Hey folks. Welcome to the discussion port. Keep ideas clean and secure.", timestamp: Date.now() - 22000 }
      );
    }

    setMessages(seedMessages);

    // Periodic live simulation messages
    const liveSimulationInterval = setInterval(() => {
      // Pick random simulated user
      const testParticipants = [
        { name: "SymmetricHacker 🔐", id: "sim_p1", msgs: ["Totally agree with that. The layout is highly pristine.", "Caching active headers on memory avoids infinite loops.", "Anyone building NextJS layouts tonight?"] },
        { name: "ByteCrutus 🛸", id: "sim_p2", msgs: ["What's the handshake delay right now? Feeling instant.", "Awesome. The telemetry graphs look stellar.", "Using standard tailwind utility classes keep code footprint tiny."] },
        { name: "CassetteLover 📼", id: "sim_p3", msgs: ["Perfect midnight cassettes playing.", "Ambient drift is perfect.", "Always inspect manifest files first."] },
      ];

      const participant = testParticipants[Math.floor(Math.random() * testParticipants.length)];
      const responseText = participant.msgs[Math.floor(Math.random() * participant.msgs.length)];

      setTypingUsers([participant.name]);

      setTimeout(() => {
        setTypingUsers([]);
        setMessages(prev => [
          ...prev,
          {
            id: `rm_sim_${Date.now()}`,
            senderId: participant.id,
            senderName: participant.name,
            text: responseText,
            timestamp: Date.now(),
          }
        ]);
      }, 1500);

    }, 12000);

    return () => {
      clearInterval(liveSimulationInterval);
    };

  }, [selectedRoom]);

  // Handlers
  const handleJoin = (room: Room) => {
    setSelectedRoom(room);
    onToast(`💬 Joined Room: ${room.name}`, "info");
  };

  const handleSendMessage = () => {
    const rawText = inputText.trim();
    if (!rawText) return;

    setInputText("");

    const newMsg: Message = {
      id: `rm_usr_${Date.now()}`,
      senderId: userId,
      senderName: `${userName} (You)`,
      text: rawText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMsg]);

    // Simulated short response occasionally
    setTimeout(() => {
      if (!selectedRoom) return;
      const responsePool = [
        "Symmetric response received.",
        "Excellent point! Let's examine the server store for that.",
        "Interesting observation. Keep transmitting logs.",
        "That balances perfectly with other console telemetry values."
      ];
      const botMsg: Message = {
        id: `rm_sim_usr_reply_${Date.now()}`,
        senderId: "sim_room_bot",
        senderName: "Verifier bot 🤖",
        text: responsePool[Math.floor(Math.random() * responsePool.length)],
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1800);
  };

  return (
    <div className="flex-grow flex flex-col h-full min-h-0 bg-[#080816]">
      
      {/* CASE A: LIST OF ROOMS */}
      {!selectedRoom ? (
        <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-6">
          
          {/* Header topic banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#7c4dff]" />
                <h1 className="font-orbitron font-black text-lg tracking-wide text-white uppercase">TOPIC DISCUSSIONS</h1>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Participate in high fidelity topic-controlled discussion forums with active worldwide cryptographic nodes.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search forum logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d0d22] border border-[#1b1b45] focus:border-[#7c4dff] text-xs font-mono text-white placeholder-slate-600 rounded-lg pl-3 pr-8 py-2 outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-600 absolute right-2.5 top-2.5" />
            </div>
          </div>

          {/* Tags list filters */}
          <div className="flex flex-wrap gap-2">
            {tagsList.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTab(tag)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] font-bold font-mono border tracking-wide transition-all cursor-pointer uppercase",
                  activeTab === tag
                    ? "bg-[#7c4dff]/20 text-[#8d62ff] border-[#7c4dff]"
                    : "bg-[#111129] text-slate-400 border-slate-800 hover:text-white"
                )}
              >
                {tag === "all" ? "SHOW ALL" : `#${tag}`}
              </button>
            ))}
          </div>

          {/* Grid Rooms display */}
          {filteredRooms.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono text-xs">
              <ShieldAlert className="w-10 h-10 text-slate-700 mb-2" />
              <span>No channels matching search constraints found.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRooms.map((room) => (
                <div 
                  key={room.id}
                  className="bg-[#0c0c20]/80 border border-[#1b1b45] hover:border-[#00e5ff]/50 rounded-xl p-5 transition-all duration-300 flex flex-col justify-between group shadow-lg hover:shadow-[0_0_20px_rgba(0,229,255,0.05)]"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl p-2 rounded-xl bg-[#11112b] border border-slate-900 group-hover:scale-110 transition-transform">
                        {room.emoji}
                      </span>
                      <span className="text-[10px] text-[#00e676] font-mono font-semibold bg-[#00e676]/10 px-2 py-0.5 rounded border border-[#00e676]/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-ping" />
                        {room.onlineCount} active
                      </span>
                    </div>

                    <div className="mt-2">
                      <h3 className="text-xs font-bold font-orbitron text-white group-hover:text-[#00e5ff] transition-all flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-[#00e5ff]" />
                        {room.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono leading-relaxed mt-1.5">
                        {room.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#1b1b45]/60 pt-3 flex items-center justify-between">
                    <div className="flex gap-1">
                      {room.tags.map((tag) => (
                        <span key={tag} className="text-[8px] font-mono text-slate-500 bg-[#12122b] px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleJoin(room)}
                      className="text-[10px] font-extrabold font-orbitron tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00e5ff] group-hover:from-[#00e5ff] group-hover:to-[#7c4dff] transition-all cursor-pointer uppercase"
                    >
                      Enter Room →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        
        // CASE B: IN-ROOM GROUP CHAT TERMINAL
        <div className="flex-grow flex flex-col justify-between h-full min-h-0 relative">
          
          {/* Header */}
          <div className="p-4 border-b border-[#12122d] bg-[#0c0c1e] flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedRoom(null)}
                className="p-1.5 hover:bg-[#1a1a45] border border-slate-900 hover:border-slate-800 rounded transition-all cursor-pointer text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedRoom.emoji}</span>
                <div>
                  <h3 className="text-xs font-bold font-orbitron text-white flex items-center gap-1.5">
                    {selectedRoom.name}
                    <span className="px-2 py-0.2 rounded bg-[#00e5ff]/10 text-[#00e5ff] text-[8px] font-mono border border-[#00e5ff]/20">
                      ROOM IDLE Verified
                    </span>
                  </h3>
                  <p className="text-[9px] font-mono text-slate-400">Total verified members on this shard: {selectedRoom.onlineCount}</p>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono hidden md:block">
              EPHEMERAL COMM • Shard: #{selectedRoom.slug.slice(0, 8)}
            </div>
          </div>

          {/* Group messages box */}
          <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3.5">
            {messages.map((msg) => {
              const isMe = msg.senderId === userId;
              
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2 text-center">
                    <span className="px-3 py-1 rounded bg-[#10102b] border border-[#1b1b3c]/60 text-[9px] font-mono text-[#00e5ff] uppercase tracking-wide">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col max-w-[70%]",
                    isMe ? "self-end items-end" : "self-start items-start"
                  )}
                >
                  <span className="text-[9px] font-mono text-slate-500 mb-1 flex items-center gap-1">
                    <Hash className="w-2.5 h-2.5 text-[#7c4dff]" />
                    {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  
                  <div 
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed",
                      isMe 
                        ? "bg-[#0b0b1f] border border-[#7c4dff]/30 text-white rounded-tr-none shadow-[0_0_10px_rgba(124,77,255,0.05)]"
                        : "bg-[#11112e] border border-[#1b1b42] text-slate-100 rounded-tl-none"
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <div className="self-start text-[10px] font-mono text-[#00e676] animate-pulse flex items-center gap-1">
                <span>●</span>
                <span>{typingUsers[0]} is transcribing telemetry...</span>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Chat entry bar */}
          <div className="p-4 border-t border-[#12122d] bg-[#0c0c1e] flex gap-2 items-center z-10">
            <input
              type="text"
              placeholder={`Send message to #${selectedRoom.slug}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-grow bg-[#060613] border border-[#1b1b42] focus:border-[#7c4dff] text-xs font-mono text-white placeholder-slate-600 outline-none rounded-lg py-2.5 px-3.5 transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="p-2.5 bg-gradient-to-r from-[#7c4dff] to-[#ff4081] hover:opacity-90 disabled:opacity-40 rounded-lg text-white font-bold cursor-pointer transition-all flex items-center justify-center shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
