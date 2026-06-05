"use client";

import React from "react";
import Image from "next/image";
import { Shield, Sparkles, Bell, Wifi, Activity, Moon, Sun, Menu } from "lucide-react";
import { UserProfile, LiveNotification } from "@/lib/types";
import PremiumLogo from "./Shared/PremiumLogo";

interface NavbarProps {
  profile: UserProfile;
  notifications: LiveNotification[];
  onlineUsers: number;
  chatsToday: number;
  onViewChange: (view: string) => void;
  onOpenNotifications: () => void;
  onOpenPremium: () => void;
  currentView: string;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onToggleMobileMenu?: () => void;
}

export default function Navbar({
  profile,
  notifications,
  onlineUsers,
  chatsToday,
  onViewChange,
  onOpenNotifications,
  onOpenPremium,
  currentView,
  theme,
  onToggleTheme,
  onToggleMobileMenu,
}: NavbarProps) {
  const unreadCount = notifications.filter(n => !n.read).length;
  const isDark = theme === "dark";

  return (
    <header className={`border-b sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between transition-colors duration-300 ${
      isDark 
        ? "border-slate-800/80 bg-[#0a0a16]/90 backdrop-blur-md" 
        : "border-slate-200 bg-white/90 backdrop-blur-md"
    }`}>
      {/* Brand logo upgrade with animated premium loops logo */}
      <div className="flex items-center gap-4">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer lg:hidden ${
              isDark 
                ? "bg-slate-900/40 border-slate-800 text-slate-300 hover:text-white" 
                : "bg-slate-100 border-slate-200 text-slate-700 hover:text-indigo-600"
            }`}
            aria-label="Toggle Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div 
          onClick={() => onViewChange("dashboard")}
          className="cursor-pointer flex items-center gap-3 group transition-all"
        >
          {/* Mini active premium logo */}
          <PremiumLogo size="sm" animated={true} />
          
          <div>
            <span className={`font-sans tracking-tight text-base font-bold transition-all ${
              isDark ? "text-white" : "text-slate-850"
            }`}>
              Flux<span className="text-[#00e5ff] font-medium ml-0.5">Meet</span>
            </span>
            <div className="text-[9px] text-slate-500 font-medium tracking-wide">
              PEER-TO-PEER NETWORK
            </div>
          </div>
        </div>
      </div>

      {/* Modern minimal statistics panel (Replaces visual clutter) */}
      <div className="hidden md:flex items-center gap-4 text-xs font-semibold">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
          isDark 
            ? "bg-slate-900/50 border-slate-800/80 text-white" 
            : "bg-slate-100 border-slate-200 text-slate-700"
        }`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] tracking-tight">
            {onlineUsers.toLocaleString()} online matchers
          </span>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
          isDark 
            ? "bg-slate-900/50 border-slate-800/80 text-slate-300" 
            : "bg-slate-100 border-slate-200 text-slate-650"
        }`}>
          <Activity className="w-3.5 h-3.5 text-[#7c4dff]" />
          <span className="text-[10px] tracking-tight">
            {chatsToday.toLocaleString()} sessions today
          </span>
        </div>
      </div>

      {/* Right controllers */}
      <div className="flex items-center gap-3">
        
        {/* Dark/Light mode toggle switch */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isDark 
              ? "bg-slate-900/50 border-slate-800 text-amber-400 hover:text-white hover:border-slate-700" 
              : "bg-slate-100 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-slate-300"
          }`}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Premium badge */}
        {profile.memberType === "Free" ? (
          <button
            onClick={onOpenPremium}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-[#7c4dff] to-[#ff4081] hover:opacity-90 text-white cursor-pointer transition-all shadow-md"
          >
            <Sparkles className="w-3 h-3 text-white" />
            <span className="hidden sm:inline">GO PREMIUM</span>
          </button>
        ) : (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-extrabold bg-[#ff4081]/15 border border-[#ff4081]/40 text-[#ff4081] uppercase">
            👑 Premium
          </span>
        )}

        {/* Notification bell and badge */}
        <button
          onClick={onOpenNotifications}
          className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
            isDark 
              ? "bg-slate-900/50 border-slate-800 text-slate-300 hover:text-white" 
              : "bg-slate-100 border-slate-200 text-slate-600 hover:text-indigo-600"
          }`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff4081] text-white text-[8px] font-extrabold flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User identification badge */}
        <div 
          onClick={() => onViewChange("profile")}
          className={`flex items-center gap-2 pl-3 border-l border-slate-300/30 cursor-pointer hover:opacity-85 transition-all`}
        >
          {profile.avatar ? (
            <Image 
              src={profile.avatar} 
              alt={profile.displayName} 
              width={28}
              height={28}
              unoptimized
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full border border-[#00e5ff] object-cover" 
            />
          ) : (
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
              isDark ? "bg-[#111129] border border-[#7c4dff]/40 text-[#00e5ff]" : "bg-slate-100 border border-slate-300 text-slate-700"
            }`}>
              {profile.displayName.substring(0, 1).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <div className={`text-xs font-bold flex items-center gap-1 leading-tight ${
              isDark ? "text-slate-200" : "text-slate-800"
            }`}>
              {profile.displayName}
              {profile.verified && <Shield className="w-2.5 h-2.5 text-[#00e5ff] fill-[#00e5ff]/20" />}
            </div>
            <div className="text-[9px] font-semibold text-slate-400 leading-none">{profile.username}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
