"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { 
  ShieldAlert, 
  UserPlus, 
  Send, 
  PhoneOff, 
  Search, 
  Sparkles, 
  Bot, 
  AlertCircle,
  Flag,
  RotateCcw,
  Volume2,
  VolumeX,
  Plus,
  Globe,
  Wifi,
  Cpu,
  Radio,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, MatchResult, Message, Friend } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";
import ReportModal from "./Shared/ReportModal";

const SEARCH_LOGS = [
  "CONNECTING REGIONAL MATCHMAKING SERVICES...",
  "LOOKING FOR COMPATIBLE CHAT CHANNELS...",
  "DECRYPTION TUNNEL READY AND ESTABLISHED...",
  "VERIFYING SENTIENT COMMUNICATOR SIGNATURES...",
  "ENGAGING HIGH-SPEED CONVERSATION PIPELINE...",
  "SCANNING GLOBALLY ACTIVE CHAT CHANNELS..."
];

interface ChatViewProps {
  profile: UserProfile;
  friends: Friend[];
  onAddFriend: (username: string, displayName: string, country: string) => void;
  onToast: (msg: string, type: "success" | "info" | "error") => void;
  onAddHistory: (item: {
    id: string;
    partnerName: string;
    partnerCountry: string;
    messagesCount: number;
    durationSeconds: number;
    date: string;
  }) => void;
}

export default function ChatView({
  profile,
  friends,
  onAddFriend,
  onToast,
  onAddHistory,
}: ChatViewProps) {
  const [chatState, setChatState] = useState<"idle" | "searching" | "connected" | "ended">("idle");
  const [activeMatch, setActiveMatch] = useState<MatchResult | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchDuration, setSearchDuration] = useState(0);
  const [queueTimerMessage, setQueueTimerMessage] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [sending, setSending] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [localTyping, setLocalTyping] = useState(false);
  const localTypingTimeoutRef = useRef<any>(null);
  const [autoSkip, setAutoSkip] = useState<boolean>(false);
  const isAutoSkipLoaded = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAutoSkip(localStorage.getItem("fm_autoskip") === "true");
      isAutoSkipLoaded.current = true;
    }
  }, []);

  useEffect(() => {
    if (isAutoSkipLoaded.current) {
      localStorage.setItem("fm_autoskip", String(autoSkip));
    }
  }, [autoSkip]);

  // Modals Info
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Futuristic radar telemetry states
  const [activeLog, setActiveLog] = useState(0);
  const [nodesCount, setNodesCount] = useState(14);

  useEffect(() => {
    let interval: any = null;
    if (chatState === "searching") {
      interval = setInterval(() => {
        setActiveLog(prev => (prev + 1) % SEARCH_LOGS.length);
        setNodesCount(prev => Math.max(8, Math.min(32, prev + (Math.random() > 0.5 ? 1 : -1))));
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [chatState]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<any>(null);
  const chatPollTimerRef = useRef<any>(null);

  // Auto scroll messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Search Countdown / queue trigger
  useEffect(() => {
    if (chatState === "searching") {
      setSearchDuration(0);
      searchTimerRef.current = setInterval(() => {
        setSearchDuration(prev => {
          if (prev >= 6) {
            setQueueTimerMessage(true);
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
        searchTimerRef.current = null;
      }
    }

    return () => {
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
      }
    };
  }, [chatState]);

  // Matching actions callbacks
  const joinMatchmakingQueue = useCallback(async () => {
    try {
      const res = await fetch("/api/match/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", profile }),
      });
      const data = await res.json();
      if (data.success) {
        setChatState("searching");
      }
    } catch (e) {
      console.error("Join Queue issue:", e);
      onToast("Unable to reach matchmaking server.", "error");
    }
  }, [profile, onToast]);

  const cancelSearch = useCallback(async () => {
    try {
      await fetch("/api/match/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", profile }),
      });
      setChatState("idle");
    } catch (e) {
      console.error("Cancel search issue:", e);
    }
  }, [profile]);

  const handleEndedState = useCallback((explanation: string) => {
    if (localTypingTimeoutRef.current) {
      clearTimeout(localTypingTimeoutRef.current);
    }
    setPartnerTyping(false);
    setLocalTyping(false);

    if (messages.length > 0 && activeMatch) {
      onAddHistory({
        id: activeMatch.id,
        partnerName: activeMatch.partner.displayName,
        partnerCountry: activeMatch.partner.country,
        messagesCount: messages.length,
        durationSeconds: Math.floor((Date.now() - activeMatch.createdTime) / 1000),
        date: new Date().toLocaleDateString(),
      });
    }

    setActiveMatch(null);
    onToast(explanation, "info");

    // Check if autoSkip is saved or currently toggled to trigger seamless next match
    const isAutoSkipEnabled = localStorage.getItem("fm_autoskip") === "true";
    if (isAutoSkipEnabled) {
      onToast("🤖 Auto-Skip: Initializing next random node match...", "info");
      setChatState("searching");
      setTimeout(() => {
        joinMatchmakingQueue();
      }, 800);
    } else {
      setChatState("ended");
    }
  }, [messages, activeMatch, onAddHistory, onToast, joinMatchmakingQueue]);

  const establishChat = useCallback((match: MatchResult) => {
    setActiveMatch(match);
    setMessages(match.messages);
    setChatState("connected");
    onToast(`🎉 Handshake verified with ${match.partner.displayName}!`, "success");
    
    // Play alert audio if unmuted
    if (!audioMuted) {
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1435/1435-84.wav");
        audio.volume = 0.15;
        audio.play().catch(() => {});
      } catch (err) {}
    }
  }, [audioMuted, onToast]);

  // Polling searches when searching
  useEffect(() => {
    let pollInterval: any = null;

    if (chatState === "searching") {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/match/queue?userId=${profile.id}`);
          const data = await res.json();
          if (data.success && data.status === "matched" && data.match) {
            clearInterval(pollInterval);
            establishChat(data.match);
          }
        } catch (e) {
          console.error("Queue poll error:", e);
        }
      }, 1000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [chatState, profile.id, establishChat]);

  // Polling chat messages when connected
  useEffect(() => {
    if (chatState === "connected" && activeMatch) {
      chatPollTimerRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/chat/messages?matchId=${activeMatch.id}`);
          const data = await res.json();
          if (data.success) {
            setMessages(data.messages);
            if (data.typingUsers) {
              setPartnerTyping(!!data.typingUsers[activeMatch.partner.id]);
            }
            if (data.status === "ended") {
              clearInterval(chatPollTimerRef.current);
              handleEndedState(data.endedBy === profile.id ? "Tunnel disconnected." : "Stranger has disconnected from the port.");
            }
          }
        } catch (e) {
          console.error("Messages poll err:", e);
        }
      }, 1200);
    } else {
      if (chatPollTimerRef.current) {
        clearInterval(chatPollTimerRef.current);
        chatPollTimerRef.current = null;
      }
    }

    return () => {
      if (chatPollTimerRef.current) {
        clearInterval(chatPollTimerRef.current);
      }
      if (localTypingTimeoutRef.current) {
        clearTimeout(localTypingTimeoutRef.current);
      }
      setPartnerTyping(false);
      setLocalTyping(false);
    };
  }, [chatState, activeMatch, profile.id, handleEndedState]);

  // Disconnect active match
  const disconnectCall = async () => {
    if (!activeMatch) return;
    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect", matchId: activeMatch.id, userId: profile.id }),
      });
      handleEndedState("You terminated the communication tunnel.");
    } catch (e) {
      console.error("Terminating match error:", e);
    }
  };

  const handleInputChange = async (val: string) => {
    setInputText(val);

    if (chatState !== "connected" || !activeMatch) return;

    if (!localTyping) {
      setLocalTyping(true);
      try {
        await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "typing",
            matchId: activeMatch.id,
            userId: profile.id,
            isTyping: true,
          }),
        });
      } catch (e) {
        console.error("Local typing report error:", e);
      }
    }

    if (localTypingTimeoutRef.current) {
      clearTimeout(localTypingTimeoutRef.current);
    }

    localTypingTimeoutRef.current = setTimeout(async () => {
      setLocalTyping(false);
      try {
        await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "typing",
            matchId: activeMatch.id,
            userId: profile.id,
            isTyping: false,
          }),
        });
      } catch (e) {}
    }, 2500);
  };

  // Submit messages
  // Submit messages
  const submitSendMessage = async () => {
    const rawText = inputText.trim();
    if (!rawText || !activeMatch) return;

    // Check if user is muted or banned in local state before transmitting
    const isMuted = profile.status === "muted";
    const isBanned = profile.status === "banned";
    if (isMuted || isBanned) {
      onToast("🔇 Transmission Blocked: Your account features have been temporarily restricted by the administration.", "error");
      setInputText("");
      return;
    }

    // --- Content Filtering Check ---
    if (typeof window !== "undefined") {
      const savedKeywordsRaw = localStorage.getItem("flux_admin_keywords");
      if (savedKeywordsRaw) {
        try {
          const loadedKeywords = JSON.parse(savedKeywordsRaw);
          const rawLower = rawText.toLowerCase();
          
          for (const kw of loadedKeywords) {
            let matched = false;
            if (kw.isRegex) {
              try {
                const reg = new RegExp(kw.phrase, "i");
                matched = reg.test(rawText);
              } catch (e) {}
            } else {
              matched = rawLower.includes(kw.phrase.toLowerCase());
            }

            if (matched) {
              // Increment triggers count
              kw.triggersCount = (kw.triggersCount || 0) + 1;
              localStorage.setItem("flux_admin_keywords", JSON.stringify(loadedKeywords));

              // Report or log incident
              const currentUsername = profile.username || "@stranger_user";
              const currentId = profile.id;

              // Record in Audit logs
              const savedLogsRaw = localStorage.getItem("flux_admin_audit_logs");
              if (savedLogsRaw) {
                try {
                  const parsedLogs = JSON.parse(savedLogsRaw);
                  const newIncident = {
                    id: `log_inc_${Date.now()}`,
                    adminName: "System Sentinel",
                    action: "KEYWORD_VIOLATION",
                    target: `${currentUsername} triggered phrase: [ ${kw.phrase} ]`,
                    timestamp: new Date().toISOString()
                  };
                  localStorage.setItem("flux_admin_audit_logs", JSON.stringify([newIncident, ...parsedLogs]));
                } catch (e) {}
              }

              if (kw.action === "warn") {
                onToast(`🚨 SYSTEM SENTINEL: Phrase [ ${kw.phrase} ] violates content policies. Session flagged.`, "error");
                setInputText("");
                return; // Block message, warn user
              } else if (kw.action === "mute") {
                onToast(`🔇 SYSTEM MUTED: Your transmission console has been muted for policy violation.`, "error");
                
                // Set muted in profile
                const activeUserRaw = localStorage.getItem("fm_profile");
                if (activeUserRaw) {
                  try {
                    const parsedP = JSON.parse(activeUserRaw);
                    parsedP.status = "muted";
                    localStorage.setItem("fm_profile", JSON.stringify(parsedP));
                  } catch (e) {}
                }

                // Set muted in admin users database
                const adminUsersRaw = localStorage.getItem("flux_admin_users");
                if (adminUsersRaw) {
                  try {
                    const parsedAdmins = JSON.parse(adminUsersRaw);
                    const idx = parsedAdmins.findIndex((u: any) => u.id === currentId || u.username === currentUsername);
                    if (idx !== -1) {
                      parsedAdmins[idx].status = "muted";
                      parsedAdmins[idx].banHistory = [...(parsedAdmins[idx].banHistory || []), `Muted by Filter system for keyword: [ ${kw.phrase} ]`];
                      localStorage.setItem("flux_admin_users", JSON.stringify(parsedAdmins));
                    }
                  } catch (e) {}
                }

                setInputText("");
                // Force window storage sync call
                window.dispatchEvent(new Event("storage"));
                return;
              } else if (kw.action === "ban") {
                onToast(`🚫 SYSTEM BANNED: Your access is permanently restricted for severe violations.`, "error");
                
                // Set banned in profile
                const activeUserRaw = localStorage.getItem("fm_profile");
                if (activeUserRaw) {
                  try {
                    const parsedP = JSON.parse(activeUserRaw);
                    parsedP.status = "banned";
                    localStorage.setItem("fm_profile", JSON.stringify(parsedP));
                  } catch (e) {}
                }

                // Add to bans list
                const bansRaw = localStorage.getItem("flux_admin_bans");
                if (bansRaw) {
                  try {
                    const parsedBans = JSON.parse(bansRaw);
                    const newBan = {
                      id: `ban_sys_${Date.now()}`,
                      userId: currentId,
                      reason: `Triggered restricted keyword filter: [ ${kw.phrase} ]`,
                      adminName: "System Sentinel",
                      expiryDate: "Permanent"
                    };
                    localStorage.setItem("flux_admin_bans", JSON.stringify([newBan, ...parsedBans]));
                  } catch (e) {}
                }

                // Set banned in admin list
                const adminUsersRaw = localStorage.getItem("flux_admin_users");
                if (adminUsersRaw) {
                  try {
                    const parsedAdmins = JSON.parse(adminUsersRaw);
                    const idx = parsedAdmins.findIndex((u: any) => u.id === currentId || u.username === currentUsername);
                    if (idx !== -1) {
                      parsedAdmins[idx].status = "banned";
                      parsedAdmins[idx].banHistory = [...(parsedAdmins[idx].banHistory || []), `Hardware Banned by System Sentinel: [ ${kw.phrase} ]`];
                      localStorage.setItem("flux_admin_users", JSON.stringify(parsedAdmins));
                    }
                  } catch (e) {}
                }

                setInputText("");
                // Force window storage sync call
                window.dispatchEvent(new Event("storage"));
                return;
              }
            }
          }
        } catch (e) {}
      }
    }

    setInputText("");
    setSending(true);

    if (localTypingTimeoutRef.current) {
      clearTimeout(localTypingTimeoutRef.current);
    }
    setLocalTyping(false);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: activeMatch.id,
          senderId: profile.id,
          senderName: profile.displayName,
          text: rawText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch (e) {
      console.error("Send failure:", e);
    } finally {
      setSending(false);
    }
  };

  // Safe handler for entering keypresses
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submitSendMessage();
    }
  };

  // Add stranger as friend
  const attemptAddFriend = () => {
    if (!activeMatch) return;
    const { username, displayName, country } = activeMatch.partner;
    
    // Check if duplicate friend
    const alreadyConnected = friends.some(f => f.username === username);
    if (alreadyConnected) {
      onToast("This node handle is already connected in your contacts console!", "info");
      return;
    }

    onAddFriend(username, displayName, country);
    onToast(`🎉 Added ${displayName} to contacts successfully!`, "success");
  };

  // Submit Safety Report
  const submitReportFiling = async (reportedUserId: string, reason: string) => {
    try {
      await fetch("/api/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportedUserId, reason }),
      });
      onToast("Reports received on server filters. Safety logs registered.", "success");
      disconnectCall();
    } catch (e) {
      onToast("Unable to register moderation file.", "error");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#080816]">
      
      {/* 1. STATE IDLE SCREEN */}
      {chatState === "idle" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00e5ff]/20 to-[#7c4dff]/20 border border-[#00e5ff]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,e5,ff,0.15)] mb-6 animate-pulse">
            <Search className="w-8 h-8 text-[#00e5ff]" />
          </div>

          <h2 className="font-orbitron font-black text-xl tracking-wider text-white uppercase">
            FLUX HANDSHAKE ROUTE
          </h2>
          <p className="text-xs text-slate-400 font-mono leading-relaxed mt-2.5">
            Link up instantly and cryptographically with random active verified users from other world nodes. Your symmetric identity stays completely hidden unless you verify contact coordinates.
          </p>

          {/* Quick instructions check list */}
          <div className="mt-6 p-4 rounded-xl bg-[#0d0d22] border border-[#1b1b3f] text-left w-full flex flex-col gap-3 font-mono">
            <div className="flex gap-2.5 items-start">
              <span className="text-[#00e5ff] text-xs font-semibold leading-normal">01.</span>
              <p className="text-[10px] text-slate-300">Identity stays safe under random verification hashes.</p>
            </div>
            <div className="flex gap-2.5 items-start border-t border-[#1b1b3f]/60 pt-2.5">
              <span className="text-[#00e676] text-xs font-semibold leading-normal">02.</span>
              <p className="text-[10px] text-slate-300">Add active peers seamlessly to contacts console for later direct lines.</p>
            </div>
            <div className="flex gap-2.5 items-start border-t border-[#1b1b3f]/60 pt-2.5">
              <span className="text-[#ff4081] text-xs font-semibold leading-normal">03.</span>
              <p className="text-[10px] text-slate-300">Violent triggers or security probing leads to instantaneous node bans.</p>
            </div>
          </div>

          <button
            onClick={joinMatchmakingQueue}
            className="mt-8 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00e5ff] via-[#7c4dff] to-[#ff4081] hover:opacity-95 active:scale-[0.98] text-white font-extrabold font-orbitron tracking-wider text-xs shadow-[0_0_20px_rgba(124,77,255,0.3)] cursor-pointer transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>CONNECT RANDOM NODE SEED</span>
          </button>

          {/* Auto-Skip toggle */}
          <div className="mt-5 flex flex-col items-center gap-1">
            <button
              onClick={() => setAutoSkip(!autoSkip)}
              className={cn(
                "px-4 py-2 rounded-xl text-[11px] font-mono font-bold uppercase transition-all border flex items-center gap-2 cursor-pointer shadow-md",
                autoSkip 
                  ? "bg-[#00e5ff]/10 border-[#00e5ff]/45 text-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.1)]"
                  : "bg-[#0d0d22] border-[#1b1b3f] text-slate-400 hover:text-slate-350"
              )}
            >
              <div className={cn("w-2 h-2 rounded-full", autoSkip ? "bg-[#00e5ff] animate-ping" : "bg-slate-600")} />
              <span>Auto-Skip Mode: {autoSkip ? "ENABLED" : "DISABLED"}</span>
            </button>
            <span className="text-[9px] text-slate-500 font-mono">
              Automatically logs into next random peer channel if connection is lost
            </span>
          </div>
        </div>
      )}

      {/* 2. STATE SEARCHING SCREEN */}
      {chatState === "searching" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto w-full">
          {/* Cybernetic Holographic Radar Container */}
          <div className="relative w-52 h-52 flex items-center justify-center mb-10">
            {/* Ambient outer aura */}
            <div className="absolute inset-0 rounded-full bg-[#00e5ff]/2 blur-xl animate-pulse" />
            
            {/* The main radar bezel */}
            <div className="absolute inset-0 rounded-full border-2 border-[#1b1b42] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" />
            <div className="absolute inset-0.5 rounded-full border border-[#00e5ff]/20 bg-[#060613]/90 overflow-hidden flex items-center justify-center">
              
              {/* Polar Grid System */}
              <div className="absolute inset-0 border-t border-[#00e5ff]/10 top-1/2 -translate-y-1/2 w-full" />
              <div className="absolute inset-0 border-l border-[#00e5ff]/10 left-1/2 -translate-x-1/2 h-full" />
              
              {/* Concentric rings */}
              <div className="absolute w-40 h-40 rounded-full border border-[#00e5ff]/10 border-dashed" />
              <div className="absolute w-28 h-28 rounded-full border border-[#00e5ff]/5" />
              <div className="absolute w-16 h-16 rounded-full border border-[#00e5ff]/5" />

              {/* Conic Sweeper sweep */}
              <motion.div 
                className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_55%,rgba(0,229,255,0.16)_100%)] rounded-full origin-center" 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3.2, ease: "linear" }}
              />

              {/* Active holographic blips representing other peers online */}
              {/* Node Tokyo */}
              <motion.div 
                className="absolute w-2 h-2 rounded-full bg-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.8)]" 
                style={{ top: "25%", left: "28%" }}
                animate={{ opacity: [0.1, 1, 0.1], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute w-5 h-5 rounded-full border border-[#00e5ff]/40" 
                style={{ top: "20.5%", left: "23.5%" }}
                animate={{ scale: [0.5, 1.8], opacity: [0.8, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
              />

              {/* Node Paris */}
              <motion.div 
                className="absolute w-2 h-2 rounded-full bg-[#7c4dff] shadow-[0_0_8px_rgba(124,77,255,0.8)]" 
                style={{ top: "45%", right: "20%" }}
                animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.9, 1.3, 0.9] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              />
              <motion.div 
                className="absolute w-5 h-5 rounded-full border border-[#7c4dff]/40" 
                style={{ top: "40.5%", right: "15.5%" }}
                animate={{ scale: [0.5, 1.8], opacity: [0.7, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
              />

              {/* Node Sydney */}
              <motion.div 
                className="absolute w-1.5 h-1.5 rounded-full bg-[#ff4081] shadow-[0_0_8px_rgba(255,64,129,0.8)]" 
                style={{ bottom: "24%", left: "38%" }}
                animate={{ opacity: [0.1, 1, 0.1] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 1.2 }}
              />
              <motion.div 
                className="absolute w-4 h-4 rounded-full border border-[#ff4081]/30" 
                style={{ bottom: "21.5%", left: "35.5%" }}
                animate={{ scale: [0.5, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 1.2 }}
              />

              {/* Center Globe focal point */}
              <div className="z-10 w-12 h-12 rounded-full bg-[#04040d]/90 border border-[#00e5ff]/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.3)] relative">
                <motion.div
                  className="absolute inset-0 rounded-full border border-[#00e5ff]/35 w-12 h-12"
                  animate={{ scale: [1, 2.5], opacity: [0.7, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  className="z-20 text-[#00e5ff]"
                >
                  <Globe className="w-5 h-5 text-[#00e5ff]" />
                </motion.div>
              </div>

            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20 uppercase mb-4 animate-pulse">
            <Radio className="w-3 h-3 text-[#00e5ff]" />
            ACTIVE CHANNELS: {nodesCount} PEERS AVAILABLE
          </span>

          <h3 className="font-orbitron font-extrabold text-lg tracking-widest text-[#00e5ff] uppercase">
            FINDING AN INTERESTING PARTNER...
          </h3>

          <p className="text-xs font-mono font-bold text-[#00e676] tracking-wider mt-2.5 bg-[#00e676]/10 px-3 py-1 rounded-md border border-[#00e676]/20 inline-block shadow-[0_0_10px_rgba(0,230,118,0.1)]">
            ELAPSED TIME: {formatTime(searchDuration)}
          </p>

          {/* Dynamic rotating diagnostics log panel */}
          <div className="h-10 text-center w-full mt-6 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeLog}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-[11px] text-slate-400 font-mono tracking-wider max-w-sm mx-auto uppercase flex items-center justify-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5 text-[#7c4dff] shrink-0 animate-pulse" />
                <span>{SEARCH_LOGS[activeLog]}</span>
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="text-[10px] text-slate-500 font-mono mt-2 select-none">
            Connecting you securely with random individuals worldwide...
          </p>

          {queueTimerMessage && (
            <div className="mt-6 p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-400/20 text-left text-[10px] text-slate-300 font-mono flex items-start gap-3 max-w-sm">
              <AlertCircle className="w-4 h-4 text-[#7c4dff] flex-shrink-0 mt-0.5 animate-bounce" />
              <span>
                Matching filters active. Waiting to pair you with the best available matches...
              </span>
            </div>
          )}

          <button
            onClick={cancelSearch}
            className="mt-8 px-6 py-2.5 rounded-xl border border-[#ff4081]/30 hover:border-[#ff4081] text-[#ff4081] hover:bg-[#ff4081]/10 text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer transition-all hover:shadow-[0_0_12px_rgba(255,64,129,0.15)] flex items-center gap-1.5"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>CANCEL MATCHMAKING</span>
          </button>
        </div>
      )}

      {/* 3. STATE CONNECTED SCREEN */}
      {chatState === "connected" && activeMatch && (
        <div className="flex-1 flex flex-col justify-between h-full min-h-0 relative">
          
          {/* Chat header info bar */}
          <div className="p-4 border-b border-[#12122d] bg-[#0c0c1e] flex flex-col md:flex-row md:items-center justify-between gap-3.5 z-10 animate-fade-in">
            <div className="flex items-center gap-3">
              {activeMatch.partner.avatar ? (
                <Image src={activeMatch.partner.avatar} alt="Partner" width={36} height={36} unoptimized referrerPolicy="no-referrer" className="w-9 h-9 rounded-full border border-[#00e5ff] object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#12122b] to-[#1b1b3f] border border-[#ff4081] flex items-center justify-center font-orbitron font-bold text-[#ff4081] text-xs">
                  {activeMatch.partner.displayName.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="text-xs font-bold font-orbitron text-white flex items-center gap-1.5 leading-normal">
                  {activeMatch.partner.displayName}
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]" />
                </h4>
                <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400">
                  <span>{activeMatch.partner.country}</span>
                  <span>•</span>
                  <span className="text-[#00e5ff]">{activeMatch.partner.rating} ★</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Add peer */}
              <button
                onClick={attemptAddFriend}
                className="p-2 rounded bg-[#111129] border border-[#1b1b3c] hover:border-[#00e5ff] text-slate-300 hover:text-[#00e5ff] transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold"
                title="Save Partner to Contacts"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Contact</span>
              </button>

              {/* Report button */}
              <button
                onClick={() => setIsReportOpen(true)}
                className="p-2 rounded bg-[#111129] border border-[#1b1b3c] hover:border-[#ff4081] text-slate-300 hover:text-[#ff4081] transition-all cursor-pointer flex items-center gap-1.5 text-[10px]"
                title="Report Node violations"
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Report</span>
              </button>

              {/* Audio mute switch */}
              <button
                onClick={() => setAudioMuted(!audioMuted)}
                className="p-2 rounded bg-[#111129] border border-[#1b1b3c] text-slate-400 hover:text-white cursor-pointer transition-all"
              >
                {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Auto Skip Toggle */}
              <button
                onClick={() => setAutoSkip(!autoSkip)}
                className={cn(
                  "p-2 rounded font-mono uppercase transition-all tracking-wider flex items-center gap-1.5 cursor-pointer border text-[10px] font-bold",
                  autoSkip 
                    ? "bg-[#00e5ff]/10 border-[#00e5ff]/40 text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.1)]" 
                    : "bg-[#111129] border-[#1b1b3c] text-slate-400 hover:text-slate-200"
                )}
                title="Toggle Auto-Skip (autostart matchmaking when disconnected)"
              >
                <div className={cn("w-1.5 h-1.5 rounded-full", autoSkip ? "bg-[#00e5ff] animate-pulse" : "bg-slate-500")} />
                <span><span className="hidden sm:inline">Auto-</span>Skip: {autoSkip ? "ON" : "OFF"}</span>
              </button>

              {/* Instant Next/Skip Peer Button */}
              <button
                onClick={async () => {
                  try {
                    await fetch("/api/chat/messages", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "disconnect", matchId: activeMatch.id, userId: profile.id }),
                    });
                  } catch (e) {}
                  
                  onToast("Skipping to next random node...", "info");
                  setActiveMatch(null);
                  setChatState("searching");
                  setTimeout(() => {
                    joinMatchmakingQueue();
                  }, 650);
                }}
                className="p-2 rounded bg-gradient-to-r from-[#00e5ff]/20 to-[#7c4dff]/20 border border-[#00e5ff]/30 hover:border-[#00e5ff]/75 text-[#00e5ff] transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold animate-[pulse_4s_infinite]"
                title="Disconnect from this node and instantly find a new match"
              >
                <RotateCcw className="w-3.5 h-3.5 animate-[spin_8s_linear_infinite]" />
                <span>Skip<span className="hidden sm:inline"> Match</span></span>
              </button>

              {/* Terminate call */}
              <button
                onClick={disconnectCall}
                className="p-2 rounded bg-[#ff4081]/10 border border-[#ff4081]/30 hover:border-[#ff4081] text-[#ff4081] transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span><span className="hidden sm:inline">Disconnect</span><span className="sm:hidden text-rose-450 font-bold">End</span></span>
              </button>
            </div>
          </div>

          {/* Chat Messages scroll logs */}
          <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3.5">
            {messages.map((msg) => {
              const isMe = msg.senderId === profile.id;
              
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
                  <span className="text-[9px] font-mono text-slate-500 mb-1">
                    {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  <div 
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed",
                      isMe 
                        ? "bg-[#0b0b1f] border border-[#00e5ff]/30 text-white rounded-tr-none shadow-[0_0_10px_rgba(0,229,255,0.05)]"
                        : "bg-[#11112e] border border-[#1b1b42] text-slate-100 rounded-tl-none"
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            
            {partnerTyping && (
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono self-start ml-2 mb-2">
                <div className="flex items-center gap-1 bg-[#11112e] border border-[#1b1b42] px-3.5 py-2 rounded-2xl rounded-tl-none shadow-md">
                  <span className="text-[#00e5ff] font-bold">{activeMatch.partner.displayName}</span>
                  <span className="text-slate-400">typing</span>
                  <span className="flex items-center gap-0.5 ml-1">
                    <span className="w-1 h-1 rounded-full bg-[#00e5ff] animate-[bounce_1.4s_infinite]" />
                    <span className="w-1 h-1 rounded-full bg-[#00e5ff] animate-[bounce_1.4s_infinite_0.2s]" />
                    <span className="w-1 h-1 rounded-full bg-[#00e5ff] animate-[bounce_1.4s_infinite_0.4s]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing console bar */}
          <div className="p-4 border-t border-[#12122d] bg-[#0c0c1e] flex gap-2 items-center z-10">
            <input
              type="text"
              placeholder={
                profile.status === "muted"
                  ? "🔇 You have been muted by the system administrators."
                  : profile.status === "banned"
                  ? "🚫 Account suspension directive active."
                  : "Key in transmission packets..."
              }
              disabled={profile.status === "muted" || profile.status === "banned"}
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-grow bg-[#060613] border border-[#1b1b42] focus:border-[#00e5ff] text-xs font-mono text-white placeholder-slate-600 outline-none rounded-lg py-2.5 px-3.5 transition-all ${
                (profile.status === "muted" || profile.status === "banned") ? "opacity-50 cursor-not-allowed border-red-500/30" : ""
              }`}
            />
            <button
              onClick={submitSendMessage}
              disabled={sending || !inputText.trim() || profile.status === "muted" || profile.status === "banned"}
              className="p-2.5 bg-gradient-to-r from-[#00e5ff] to-[#7c4dff] hover:opacity-90 disabled:opacity-40 rounded-lg text-white font-bold cursor-pointer transition-all flex items-center justify-center shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Render Safety Modal */}
          <ReportModal
            isOpen={isReportOpen}
            onClose={() => setIsReportOpen(false)}
            onSubmitReport={submitReportFiling}
            partnerName={activeMatch.partner.displayName}
            partnerId={activeMatch.partner.id}
          />
        </div>
      )}

      {/* 4. STATE ENDED SCREEN */}
      {chatState === "ended" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#ff4081]/10 border border-[#ff4081]/40 flex items-center justify-center text-[#ff4081] mb-6">
            <PhoneOff className="w-6 h-6 animate-pulse" />
          </div>

          <h3 className="font-orbitron font-extrabold text-[#ff4081] text-base uppercase tracking-widest leading-normal">
            CONNECTION TERMINATED
          </h3>
          <p className="text-xs text-slate-400 font-mono leading-relaxed mt-2.5">
            Active session tunnel ended successfully. Safety keys cleared out, caches purged and encryption matrices re-seeded.
          </p>

          <div className="flex flex-col gap-2.5 w-full mt-6">
            <button
              onClick={joinMatchmakingQueue}
              className="py-3 bg-gradient-to-r from-[#00e5ff] to-[#7c4dff] text-white font-black font-orbitron text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.25)] hover:shadow-[0_0_20px_rgba(124,77,255,0.4)]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ACQUIRE FRESH PEER SEED</span>
            </button>

            {/* Ended Screen Auto Skip Toggle */}
            <button
              onClick={() => setAutoSkip(!autoSkip)}
              className={cn(
                "py-2.5 border rounded-lg text-[10px] font-bold font-mono tracking-tight uppercase transition-all cursor-pointer flex items-center justify-center gap-2",
                autoSkip 
                  ? "bg-[#00e5ff]/10 border-[#00e5ff]/40 text-[#00e5ff]" 
                  : "bg-[#111129]/40 border-[#1b1b3c] text-slate-400 hover:text-slate-200"
              )}
            >
              <div className={cn("w-1.5 h-1.5 rounded-full", autoSkip ? "bg-[#00e5ff] animate-ping" : "bg-slate-500")} />
              <span>Auto-Skip: {autoSkip ? "ENABLED" : "DISABLED"}</span>
            </button>

            <button
              onClick={() => setChatState("idle")}
              className="py-2.5 border border-[#1b1b3d] hover:border-slate-800 rounded-lg text-[10px] font-bold font-mono tracking-tight text-slate-400 hover:text-white transition-all cursor-pointer bg-[#10102b]/40"
            >
              Return to Terminal Hub
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
