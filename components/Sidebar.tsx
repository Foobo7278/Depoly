"use client";

import React from "react";
import { 
  Compass, 
  MessageSquare, 
  Users, 
  History, 
  Settings, 
  User, 
  HelpCircle,
  Gem,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onOpenPremium: () => void;
  theme: "dark" | "light";
  isMobileDrawer?: boolean;
  onCloseDrawer?: () => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  onOpenPremium,
  theme,
  isMobileDrawer = false,
  onCloseDrawer,
}: SidebarProps) {
  const isDark = theme === "dark";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Compass },
    { id: "match", label: "Match Chat", icon: MessageSquare },
    { id: "rooms", label: "Group Rooms", icon: Users },
    { id: "friends", label: "Friends", icon: Users },
    { id: "history", label: "Chat History", icon: History },
    { id: "profile", label: "My Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className={cn(
      "w-64 border-r flex flex-col justify-between transition-all duration-300",
      isMobileDrawer
        ? "h-full bg-[#0a0a16] border-slate-800 text-white"
        : cn(
            "hidden lg:flex h-full z-30",
            isDark 
              ? "bg-[#0a0a16] border-slate-800/80 text-white" 
              : "bg-white border-slate-200 text-slate-800"
          )
    )}>
      <div className="p-4 flex-grow flex flex-col gap-6 overflow-y-auto">
        
        {/* Core Navigation Links */}
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 px-3.5 mb-2 uppercase">
            NAVIGATION
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  if (isMobileDrawer && onCloseDrawer) {
                    onCloseDrawer();
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all border group cursor-pointer text-left",
                  isActive
                    ? isDark
                      ? "bg-[#161633]/60 text-white border-purple-500/50 shadow-md font-semibold"
                      : "bg-indigo-50/70 text-indigo-700 border-indigo-200/50 shadow-sm font-semibold"
                    : isDark
                      ? "text-slate-400 hover:text-white hover:bg-slate-900/45 border-transparent"
                      : "text-slate-650 hover:text-indigo-600 hover:bg-slate-50 border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    className={cn(
                      "w-4.5 h-4.5 transition-transform group-hover:scale-105",
                      isActive 
                        ? isDark ? "text-[#00e5ff]" : "text-indigo-600"
                        : "text-slate-400 group-hover:text-slate-500"
                    )} 
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full animate-ping", 
                    isDark ? "bg-[#00e5ff]" : "bg-indigo-600"
                  )} />
                )}
              </button>
            );
          })}
        </div>

        {/* Informative minimal support card */}
        <div className={cn(
          "mt-auto p-4 rounded-xl border flex flex-col gap-2 transition-all",
          isDark || isMobileDrawer
            ? "bg-slate-900/40 border-slate-800/80" 
            : "bg-slate-50 border-slate-200"
        )}>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-450 tracking-wide uppercase">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <span>Secure Ephemeral Chat</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Every session is completely private. Conversations are stored directly on your phone and disappear once you clear them.
          </p>
          <a
            href="https://ai.studio/build"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-purple-500 hover:text-[#00e5ff] font-semibold transition-all"
          >
            <span>Learn about features</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Footer block upgrade */}
      <div className={cn(
        "p-4 border-t transition-colors",
        isDark || isMobileDrawer ? "border-slate-800/80 bg-slate-950/60" : "border-slate-200 bg-slate-50"
      )}>
        <button
          onClick={() => {
            onOpenPremium();
            if (isMobileDrawer && onCloseDrawer) {
              onCloseDrawer();
            }
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-95 active:scale-[0.98] transition-all text-white font-bold text-[10px] rounded-xl cursor-pointer shadow"
        >
          <Gem className="w-3.5 h-3.5 text-white" />
          <span>UPGRADE ACCOUNT</span>
        </button>
        <div className="text-[9px] text-center text-slate-400 mt-2 font-semibold">
          FluxMeet • Release v1.12.0
        </div>
      </div>
    </aside>
  );
}
