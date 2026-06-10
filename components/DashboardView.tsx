"use client";

import React from "react";
import Image from "next/image";
import { 
  ShieldCheck, 
  MessageSquare, 
  ArrowRight, 
  Play, 
  Users,
  Compass,
  Globe,
  UserCheck
} from "lucide-react";
import { UserProfile, Room } from "@/lib/types";

interface DashboardViewProps {
  profile: UserProfile;
  onlineUsers: number;
  chatsToday: number;
  countriesCount: number;
  messagesSent: number;
  featuredRooms: Room[];
  onViewChange: (view: string) => void;
  onJoinRoom: (room: Room) => void;
  onOpenPremium: () => void;
  theme: "dark" | "light";
}

export default function DashboardView({
  profile,
  onlineUsers,
  chatsToday,
  countriesCount,
  messagesSent,
  featuredRooms,
  onViewChange,
  onJoinRoom,
  onOpenPremium,
  theme,
}: DashboardViewProps) {
  const isDark = theme === "dark";
  
  const telemetryStats = [
    { label: "Online Members", value: onlineUsers.toLocaleString(), icon: Users, color: isDark ? "text-[#00e5ff]" : "text-indigo-600" },
    { label: "Matches Today", value: chatsToday.toLocaleString(), icon: ShieldCheck, color: "text-emerald-500" },
    { label: "Global Regions", value: `${countriesCount} countries`, icon: Globe, color: "text-purple-500" },
    { label: "Total Messages", value: messagesSent.toLocaleString(), icon: MessageSquare, color: "text-pink-500" },
  ];

  return (
    <div className={`flex-1 p-6 flex flex-col gap-6 overflow-y-auto h-full min-h-0 transition-colors duration-300 ${
      isDark ? "bg-[#080816] text-white" : "bg-[#f8fafc] text-slate-800"
    }`}>
      
      {/* Premium Glassmorphic Hero Banner */}
      <div className={`relative p-8 rounded-2xl border overflow-hidden transition-all shadow-md ${
        isDark 
          ? "bg-gradient-to-br from-[#0f0f2d] via-[#0b0b23] to-[#141433] border-white/5" 
          : "bg-white border-slate-200"
      }`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00e5ff]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                isDark 
                  ? "bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/20" 
                  : "bg-indigo-50 text-indigo-700 border-indigo-200/50"
              }`}>
                Peers Ready to Connect
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            
            <h1 className="font-sans font-extrabold text-2xl tracking-normal">
              Meet new friends, instantly.
            </h1>
            
            <p className="text-xs text-slate-450 leading-relaxed">
              Welcome back, <span className="font-bold text-[#00e5ff]">{profile.displayName}</span>. 
              FluxMeet matching connects you securely with random verified people worldwide. Feel free to search group rooms or start a 1-on-1 private dialogue!
            </p>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() => onViewChange("match")}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#7c4dff] hover:opacity-95 active:scale-[0.98] transition-all text-white font-bold text-xs tracking-wide flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Start Matching Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simplified Highlight Statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {telemetryStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className={`p-4 border rounded-2xl transition-all flex items-center justify-between group shadow-sm ${
                isDark 
                  ? "bg-[#0d0d22]/90 border-white/5 hover:border-slate-800" 
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <span className={`text-lg font-bold mt-0.5 ${isDark ? "text-white" : "text-slate-800"}`}>
                  {stat.value}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl border transition-all ${
                isDark 
                  ? "bg-slate-900/50 border-slate-800/80 group-hover:border-[#00e5ff]/50" 
                  : "bg-slate-50 border-slate-200 group-hover:border-slate-300"
              }`}>
                <Icon className={`w-4.5 h-4.5 ${stat.color} transition-transform group-hover:scale-105`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main split dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommended Rooms block */}
        <div className="lg:col-span-2 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-[#7c4dff]" />
              <h2 className="font-bold text-sm">Featured Chat Rooms</h2>
            </div>
            <button
              onClick={() => onViewChange("rooms")}
              className="text-[11px] text-purple-500 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Explore all rooms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {featuredRooms.slice(0, 3).map((room) => (
              <div 
                key={room.id}
                onClick={() => onJoinRoom(room)}
                className={`p-4 border rounded-2xl transition-all flex items-center justify-between group cursor-pointer ${
                  isDark 
                    ? "bg-[#0d0d22]/80 hover:bg-[#11112e] border-white/5 hover:border-[#7c4dff]/40" 
                    : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-350"
                }`}
              >
                <div className="flex gap-4 items-center">
                  <span className={`text-2xl p-2 rounded-xl border flex-shrink-0 transition-transform group-hover:scale-105 ${
                    isDark ? "bg-[#11112b] border-[#1b1b3f]" : "bg-slate-50 border-slate-200"
                  }`}>
                    {room.emoji}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold leading-normal group-hover:text-purple-600 transition-colors">
                      {room.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-lg">
                      {room.description}
                    </p>
                    <div className="flex gap-1.5 mt-1.5">
                      {room.tags.slice(0, 3).map((tag, tIdx) => (
                        <span key={tIdx} className={`text-[8px] font-semibold px-2 py-0.5 rounded-full uppercase border ${
                          isDark 
                            ? "bg-[#10102b] border-slate-800 text-slate-400" 
                            : "bg-slate-100 border-slate-200 text-slate-500"
                        }`}>
                          #{tag.toLowerCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pl-3">
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span>{room.onlineCount} chatting</span>
                  </span>
                  <span className="text-[10px] font-bold text-purple-500 uppercase">
                    Join Room →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Card status */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4.5 h-4.5 text-[#00e5ff]" />
            <h2 className="font-bold text-sm">My Active Profile</h2>
          </div>

          <div className={`p-5 border rounded-2xl flex flex-col gap-4 ${
            isDark 
              ? "bg-[#0d0d22]/90 border-white/5" 
              : "bg-white border-slate-200"
          }`}>
            <div className="flex gap-3.5 items-center">
              {profile.avatar ? (
                <Image src={profile.avatar} alt="Profile" width={48} height={48} unoptimized referrerPolicy="no-referrer" className="w-12 h-12 rounded-full border border-[#00e5ff] object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border border-transparent flex items-center justify-center font-bold text-lg text-white">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-xs font-bold flex items-center gap-1.5">
                  {profile.displayName}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </h3>
                <p className="text-[10px] font-semibold text-purple-500 leading-tight">{profile.username}</p>
                <p className="text-[9px] text-slate-500 font-semibold mt-1 uppercase tracking-wide">{profile.country}</p>
              </div>
            </div>

            <div className={`border-t pt-3.5 flex flex-col gap-2.5 text-xs ${
              isDark ? "border-[#1b1b3e]" : "border-slate-100"
            }`}>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Account Level:</span>
                <span className={`font-semibold ${profile.memberType === "Premium" ? "text-pink-500" : "text-slate-500"}`}>
                  {profile.memberType} Tier
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Matched Rating:</span>
                <span className="text-emerald-500 font-bold">{profile.rating} ★</span>
              </div>
            </div>

            <button
              onClick={() => onViewChange("profile")}
              className={`w-full py-2.5 border rounded-xl text-[10px] font-bold tracking-wider hover:scale-[1.01] transition-all cursor-pointer ${
                isDark 
                  ? "border-[#1b1b3f] hover:border-[#00e5ff] text-slate-350 hover:text-white bg-[#10102b]/50" 
                  : "border-slate-200 hover:border-slate-300 text-slate-600 hover:text-indigo-600 bg-slate-50"
              }`}
            >
              EDIT MY PROFILE
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
