"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Cpu, 
  X,
  Compass,
  MessageSquare,
  Users,
  History,
  User,
  Settings as SettingsIcon,
  Bell
} from "lucide-react";
import { UserProfile, Friend, LiveNotification, Room, HistoryItem } from "@/lib/types";
import { setCookie, getCookie, deleteCookie } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

// Core View Imports
import DashboardView from "@/components/DashboardView";
import ChatView from "@/components/ChatView";
import RoomsView from "@/components/RoomsView";
import FriendsView from "@/components/FriendsView";
import HistoryView from "@/components/HistoryView";
import ProfileView from "@/components/ProfileView";
import SettingsView from "@/components/SettingsView";
import NotificationsView from "@/components/NotificationsView";
import AdminPanelView from "@/components/AdminPanelView";
import AuthGateway from "@/components/AuthGateway";

// Modals
import AddFriendModal from "@/components/Shared/AddFriendModal";
import PremiumModal from "@/components/Shared/PremiumModal";
import PremiumLogo from "@/components/Shared/PremiumLogo";

const getNowTimestamp = () => Date.now();

// Resilient fetch helper with retry strategy for development environments
async function fetchWithRetry(url: string, retries = 4, delayMs = 800): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP Status ${res.status}`);
      }
      const data = await res.json();
      return data;
    } catch (err) {
      if (i === retries) throw err;
      console.warn(`Resilient fetch warning targeting ${url} (Attempt ${i + 1}/${retries + 1} failed). Retrying in ${delayMs}ms. Error:`, err);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      delayMs = delayMs * 1.5; // Exponential backoff multiplier
    }
  }
}

export default function Page({ initialView = "dashboard" }: { initialView?: string }) {
  const [isReady, setIsReady] = useState(false);
  const [currentView, setCurrentView] = useState<string>(initialView);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (typeof window !== "undefined") {
      const newPath = view === "dashboard" ? "/" : `/${view}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({ fmView: view }, "", newPath);
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = (e: PopStateEvent) => {
      const path = window.location.pathname;
      const view = path === "/" ? "dashboard" : path.slice(1);
      if (view) {
        setCurrentView(view);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const [bootStep, setBootStep] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Modern Dark/Light Theme State
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Core Persisted States
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    username: "@stranger_0000",
    displayName: "Anonymous Stranger",
    bio: "Connected & verified on Flux Meet.",
    country: "🌍 Worldwide",
    age: 18,
    avatar: null,
    verified: true,
    memberType: "Free",
    chatsCount: 0,
    messagesCount: 0,
    friendsCount: 3,
    rating: 4.9,
  });

  const [friends, setFriends] = useState<Friend[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState({
    audioEnabled: true,
    streamstats: true,
    telemetryLogging: true,
  });

  // Server counters & metrics
  const [onlineUsers, setOnlineUsers] = useState(1428);
  const [chatsToday, setChatsToday] = useState(894);
  const [countriesCount, setCountriesCount] = useState(114);
  const [messagesSent, setMessagesSent] = useState(24890);

  // Modals Core Toggle
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);

  // Toast notification alerts state
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: "success" | "info" | "error" }[]>([]);

  // Telemetry APIs
  const fetchRooms = React.useCallback(async () => {
    try {
      const data = await fetchWithRetry("/api/rooms");
      if (data && data.success) {
        setRooms(data.rooms);
      }
    } catch (e) {
      console.error("Rooms fetch error:", e);
    }
  }, []);

  const fetchStats = React.useCallback(async () => {
    try {
      const data = await fetchWithRetry("/api/stats");
      if (data && data.success) {
        setOnlineUsers(data.onlineUsers);
        setChatsToday(data.chatsToday);
        setCountriesCount(data.countriesCount);
        setMessagesSent(data.messagesSentCount);
      }
    } catch (e) {
      console.error("Stats fetch error:", e);
    }
  }, []);

  // Load and cycle through progress triggers during modern 3.2 second loader duration
  useEffect(() => {
    const timer = setInterval(() => {
      setBootStep(prev => {
        if (prev >= 4) {
          clearInterval(timer);
          return 4;
        }
        return prev + 1;
      });
    }, 750);

    return () => clearInterval(timer);
  }, []);

  // Safe De-serialization from LocalStorage & Cookies inside animation frames to avoid SSR differences
  useEffect(() => {
    // Theme restore
    let savedTheme = localStorage.getItem("fm_theme") || getCookie("fm_theme");
    if (savedTheme) {
      setTheme(savedTheme as "dark" | "light");
      localStorage.setItem("fm_theme", savedTheme);
      setCookie("fm_theme", savedTheme, 30);
    }

    if (bootStep < 4) return;

    const frameId = requestAnimationFrame(() => {
      // Create random user identity hash or restore from cookies/localStorage
      let localUid = localStorage.getItem("fm_uid") || getCookie("fm_uid");
      if (!localUid) {
        localUid = `u_${Math.random().toString(36).substr(2, 9)}`;
      }
      localStorage.setItem("fm_uid", localUid);
      setCookie("fm_uid", localUid, 30);

      // Restore authentication state
      let savedAuth = localStorage.getItem("fm_authenticated") || getCookie("fm_authenticated");
      const localAuth = savedAuth === "true";
      setIsAuthenticated(localAuth);
      localStorage.setItem("fm_authenticated", String(localAuth));
      setCookie("fm_authenticated", String(localAuth), 30);

      // Restore User Profile
      let localProf = localStorage.getItem("fm_profile") || getCookie("fm_profile");
      if (localProf) {
        try {
          const parsed = JSON.parse(localProf);
          setProfile(parsed);
          localStorage.setItem("fm_profile", JSON.stringify(parsed));
          setCookie("fm_profile", JSON.stringify(parsed), 30);
        } catch (e) {
          console.error("Profile cache error:", e);
        }
      } else {
        const defaultProf: UserProfile = {
          id: localUid,
          username: `@stranger_${localUid.slice(-4)}`,
          displayName: "Anonymous Stranger",
          bio: "Connected & verified on Flux Meet protocol.",
          country: "🌍 Worldwide",
          age: 18,
          avatar: null,
          verified: true,
          memberType: "Free",
          chatsCount: 0,
          messagesCount: 0,
          friendsCount: 3,
          rating: 4.9,
        };
        setProfile(defaultProf);
        localStorage.setItem("fm_profile", JSON.stringify(defaultProf));
        setCookie("fm_profile", JSON.stringify(defaultProf), 30);
      }

      // Restore Preferences settings
      const localSett = localStorage.getItem("fm_settings");
      if (localSett) {
        try {
          setSettings(JSON.parse(localSett));
        } catch (e) {
          console.error(e);
        }
      }

      // Restore Contacts List
      const localFriends = localStorage.getItem("fm_friends");
      if (localFriends) {
        try {
          setFriends(JSON.parse(localFriends));
        } catch (e) {}
      } else {
        const defaultFriends: Friend[] = [
          { id: "f1", username: "@alex_m", displayName: "Alex M.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80", online: true, country: "🇺🇸 USA Node", addedAt: getNowTimestamp() - 172800000 },
          { id: "f2", username: "@mia_k", displayName: "Mia K.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80", online: false, country: "🇯🇵 Japan Node", addedAt: getNowTimestamp() - 432000000 },
          { id: "f3", username: "@carlos_r", displayName: "Carlos R.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80", online: true, country: "🇧🇷 Brazil Node", addedAt: getNowTimestamp() - 86400000 },
        ];
        setFriends(defaultFriends);
        localStorage.setItem("fm_friends", JSON.stringify(defaultFriends));
      }

      // Restore Alerts system notifications
      const localNotifs = localStorage.getItem("fm_notifs");
      if (localNotifs) {
        try {
          setNotifications(JSON.parse(localNotifs));
        } catch (e) {}
      } else {
        const defaultNotifs: LiveNotification[] = [
          { id: "n1", icon: "👥", title: "Friend Match Pending", desc: "Alex M. sent you a direct message invitation link.", time: "2h ago", read: false, actions: true, actionPayload: { type: "friend_request", senderId: "f1", senderName: "Alex M.", senderUsername: "@alex_m" } },
          { id: "n2", icon: "⚡", title: "Handshake Channel Ready", desc: "You are successfully fully connected on global chat relays.", time: "1d ago", read: true },
        ];
        setNotifications(defaultNotifs);
        localStorage.setItem("fm_notifs", JSON.stringify(defaultNotifs));
      }

      // Restore History items
      const localHist = localStorage.getItem("fm_history");
      if (localHist) {
        try {
          setHistory(JSON.parse(localHist));
        } catch (e) {}
      }

      // Initial API pulls
      fetchRooms();
      fetchStats();

      setIsReady(true);
    });

    return () => cancelAnimationFrame(frameId);
  }, [bootStep, fetchRooms, fetchStats]);

  // Network Administration Event & Control Sync Checklist
  const [siteLockdown, setSiteLockdown] = useState(false);
  const [userBannedState, setUserBannedState] = useState(false);

  useEffect(() => {
    if (!isReady || !profile.id) return;

    const checkLockAndBan = () => {
      // 1. Check if portal is disabled
      const isOnline = localStorage.getItem("flux_admin_site_online") !== "false";
      setSiteLockdown(!isOnline);

      // 2. Check if active profile status is banned
      const adminUsersRaw = localStorage.getItem("flux_admin_users");
      let activeStatus: "active" | "warned" | "muted" | "banned" = "active";
      if (adminUsersRaw) {
        try {
          const authUsers = JSON.parse(adminUsersRaw);
          const matched = authUsers.find((u: any) => u.id === profile.id || u.username === profile.username || u.email === profile.email);
          if (matched) {
            activeStatus = matched.status;
          }
        } catch (e) {}
      }

      // 3. Fallback to check bans table specifically
      const adminBansRaw = localStorage.getItem("flux_admin_bans");
      if (adminBansRaw) {
        try {
          const authBans = JSON.parse(adminBansRaw);
          const matchedBan = authBans.some((b: any) => b.userId === profile.id || b.ipAddress === "192.168.1.104" || b.userId === profile.username);
          if (matchedBan) {
            activeStatus = "banned";
          }
        } catch (e) {}
      }

      setUserBannedState(activeStatus === "banned");

      // Keep active user object profile status in absolute sync
      if (profile.status !== activeStatus) {
        const nextProf = { ...profile, status: activeStatus };
        setProfile(nextProf);
        localStorage.setItem("fm_profile", JSON.stringify(nextProf));
      }
    };

    checkLockAndBan();

    // Fast polling in sandbox + storage callbacks
    const timer = setInterval(checkLockAndBan, 1800);
    window.addEventListener("storage", checkLockAndBan);

    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", checkLockAndBan);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, profile.id, profile.username, profile.email, profile.status]);

  // Periodic polling for statistics update
  useEffect(() => {
    if (!isReady) return;
    const statsPollInterval = setInterval(() => {
      if (settings.streamstats) {
        fetchStats();
      }
    }, 8500);

    return () => clearInterval(statsPollInterval);
  }, [isReady, settings.streamstats, fetchStats]);

  // Virtual Keyboard and focus state listener to handle on-screen keyboard positioning cleanly
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFocusIn = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    const handleViewportResize = () => {
      if (window.visualViewport) {
        // A visual viewport height contraction indicates keyboard is open
        const isCollapsed = window.visualViewport.height < window.innerHeight * 0.85;
        if (isCollapsed) {
          setIsKeyboardOpen(true);
        } else {
          // If viewport resize recovered, confirm that no typing inputs are focused
          const activeEl = document.activeElement;
          const isInputFocused = activeEl && (
            activeEl.tagName === "INPUT" ||
            activeEl.tagName === "TEXTAREA" ||
            (activeEl as HTMLElement).isContentEditable
          );
          if (!isInputFocused) {
            setIsKeyboardOpen(false);
          }
        }
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportResize);
    }

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleViewportResize);
      }
    };
  }, []);

  // Toast dismissers
  const triggerToast = (msg: string, type: "success" | "info" | "error" = "info") => {
    const id = `toast-${getNowTimestamp()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts(prev => [...prev, { id, msg, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const removeToastItem = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Profile modifier triggers
  const handleSaveProfile = (nextProfile: UserProfile) => {
    setProfile(nextProfile);
    localStorage.setItem("fm_profile", JSON.stringify(nextProfile));
    setCookie("fm_profile", JSON.stringify(nextProfile), 30);
  };

  // Contacts modifiers
  const handleAddFriend = (username: string, displayName: string, country: string) => {
    const nextFriend: Friend = {
      id: `f_${Math.random().toString(36).substr(2, 9)}`,
      username,
      displayName,
      avatar: null,
      online: true,
      country,
      addedAt: getNowTimestamp(),
    };
    const nextList = [nextFriend, ...friends];
    setFriends(nextList);
    localStorage.setItem("fm_friends", JSON.stringify(nextList));
    triggerToast(`Matched connection stored with peer: ${username}`, "success");
  };

  const handleRemoveFriend = (id: string) => {
    const nextList = friends.filter(f => f.id !== id);
    setFriends(nextList);
    localStorage.setItem("fm_friends", JSON.stringify(nextList));
  };

  const handleAcceptFriendRequest = (senderId: string, senderName: string, senderUsername: string) => {
    const nextFriend: Friend = {
      id: senderId,
      username: senderUsername,
      displayName: senderName,
      avatar: null,
      online: true,
      country: "🌍 Worldwide Node",
      addedAt: getNowTimestamp(),
    };
    const nextList = [nextFriend, ...friends];
    setFriends(nextList);
    localStorage.setItem("fm_friends", JSON.stringify(nextList));
  };

  // Alerts controls
  const handleMarkAllNotificationsRead = () => {
    const next = notifications.map(n => ({ ...n, read: true }));
    setNotifications(next);
    localStorage.setItem("fm_notifs", JSON.stringify(next));
    triggerToast("All inbox notifications checked as read", "success");
  };

  const handleClearNotification = (id: string) => {
    const next = notifications.filter(n => n.id !== id);
    setNotifications(next);
    localStorage.setItem("fm_notifs", JSON.stringify(next));
  };

  // History logs database
  const handleAddHistory = (item: { id: string; partnerName: string; partnerCountry: string; messagesCount: number; durationSeconds: number; date: string }) => {
    if (!settings.telemetryLogging) return;
    const nextList = [item, ...history];
    setHistory(nextList);
    localStorage.setItem("fm_history", JSON.stringify(nextList));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.setItem("fm_history", JSON.stringify([]));
  };

  const handleRemoveHistoryItem = (id: string) => {
    const nextList = history.filter(item => item.id !== id);
    setHistory(nextList);
    localStorage.setItem("fm_history", JSON.stringify(nextList));
  };

  // Preferences settings
  const handleSaveSettings = (nextSettings: any) => {
    setSettings(nextSettings);
    localStorage.setItem("fm_settings", JSON.stringify(nextSettings));
  };

  const handleClearCaches = () => {
    localStorage.clear();
    triggerToast("Clearing local configuration registries. Re-routing...", "info");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleLoginSuccess = (userPayload: Partial<UserProfile>) => {
    const updatedProf = {
      ...profile,
      ...userPayload,
    };
    setProfile(updatedProf);
    localStorage.setItem("fm_profile", JSON.stringify(updatedProf));
    setCookie("fm_profile", JSON.stringify(updatedProf), 30);
    localStorage.setItem("fm_authenticated", "true");
    setCookie("fm_authenticated", "true", 30);
    setIsAuthenticated(true);
    triggerToast(`Welcome back, ${userPayload.displayName || "Explorer"}!`, "success");
  };

  const handleLogout = () => {
    localStorage.removeItem("fm_authenticated");
    localStorage.removeItem("fm_profile");
    deleteCookie("fm_authenticated");
    deleteCookie("fm_profile");
    setIsAuthenticated(false);
    
    // reset profile to empty stranger
    const defaultUid = `u_${Math.random().toString(36).substr(2, 9)}`;
    const defaultProf: UserProfile = {
      id: defaultUid,
      username: `@stranger_${defaultUid.slice(-4)}`,
      displayName: "Anonymous Stranger",
      bio: "Connected & verified on Flux Meet.",
      country: "🌍 Worldwide",
      age: 18,
      avatar: null,
      verified: true,
      memberType: "Free",
      chatsCount: 0,
      messagesCount: 0,
      friendsCount: 3,
      rating: 4.9,
    };
    setProfile(defaultProf);
    localStorage.setItem("fm_profile", JSON.stringify(defaultProf));
    setCookie("fm_profile", JSON.stringify(defaultProf), 30);
    triggerToast("Google session disconnected safely.", "info");
    handleViewChange("dashboard");
  };

  const handleUpgradePremiumSuccess = () => {
    const nextProf = { ...profile, memberType: "Premium" as const };
    setProfile(nextProf);
    localStorage.setItem("fm_profile", JSON.stringify(nextProf));
    setCookie("fm_profile", JSON.stringify(nextProf), 30);
    triggerToast("👑 Upgraded to Premium Verified membership!", "success");
  };

  // Settle theme toggle callback
  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("fm_theme", nextTheme);
    setCookie("fm_theme", nextTheme, 30);
  };

  // Switch rooms handler
  const handleJoinFeaturedRoom = (room: Room) => {
    handleViewChange("rooms");
  };

  return (
    <div className={`h-screen max-h-screen overflow-hidden flex flex-col font-sans relative select-none transition-colors duration-300 ${
      theme === "dark" ? "bg-[#080816] text-[#f8fafc]" : "bg-[#f8fafc] text-slate-850"
    }`}>
      
      {/* 🔮 ULTRA-POLISHED PREMIUM ENTRANCE INTRO ANIMATION (2-4 seconds) */}
      {(!isReady || bootStep < 4) && (
        <div className="fixed inset-0 z-50 bg-[#060612] flex flex-col items-center justify-center p-6 text-slate-300 font-sans transition-all duration-700">
          
          {/* Gentle background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-3xl top-1/4 left-1/4 animate-pulse" />
            <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-3xl bottom-1/4 right-1/4" />
          </div>

          <div className="w-full max-w-sm text-center relative z-10 flex flex-col items-center gap-7">
            {/* Glowing scaled premium loops SVG logo */}
            <PremiumLogo size="xl" animated={true} />

            {/* Glowing title caption */}
            <div className="flex flex-col gap-1 mt-2">
              <h2 className="font-sans font-extrabold text-2xl tracking-normal text-white">
                Flux<span className="text-[#00e5ff] font-medium ml-0.5">Meet</span>
              </h2>
              <div className="text-[10px] tracking-widest text-[#7c4dff] font-bold uppercase">
                Connecting worlds instantly
              </div>
            </div>

            {/* Premium SaaS text load messages */}
            <div className="h-6 overflow-hidden">
              <p className="text-xs text-slate-400 font-medium animate-pulse">
                {bootStep === 0 && "Seeding secure local sockets..."}
                {bootStep === 1 && "Verifying cryptographic protocols..."}
                {bootStep === 2 && "Synchronizing region node metrics..."}
                {bootStep === 3 && "Finalizing pristine glass layouts..."}
                {bootStep >= 4 && "Gateway established successfully!"}
              </p>
            </div>

            {/* Subtle progress wire */}
            <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-gradient-to-r from-[#00e5ff] to-[#7c4dff] rounded-full transition-all duration-300"
                style={{ width: `${(bootStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* CORE WEB APP LAYOUT */}
      {isReady && bootStep >= 4 && (
        <div className="flex-grow flex flex-col min-h-0 h-full overflow-hidden">
          
          {/* Auth Security Shield screen when unauthorized */}
          {!isAuthenticated ? (
            <AuthGateway onLoginSuccess={handleLoginSuccess} theme={theme} />
          ) : userBannedState ? (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#04040a] text-center text-white font-sans">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6 animate-bounce animate-pulse">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-orbitron font-extrabold tracking-wider text-red-500 uppercase">ACCESS RESTRICTED</h2>
              <p className="max-w-md text-xs text-slate-400 font-mono mt-3 leading-relaxed w-full">
                Your profile <strong>{profile.username}</strong> has been permanently banned from the FluxMeet network due to content guidelines violations.
              </p>
              <div className="mt-8 p-4 rounded-xl bg-slate-950 border border-slate-900 text-left w-full max-w-sm font-mono text-[10px] text-slate-500">
                <p>IP ADDRESS: 192.168.1.104</p>
                <p className="mt-1">REASON: Violating community standards & guidelines.</p>
                <p className="mt-1">ENFORCER: Administration Security Node</p>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setUserBannedState(false);
                }}
                className="mt-6 px-6 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs transition-all font-bold cursor-pointer"
              >
                RETURN HOME / LOG OUT
              </button>
            </div>
          ) : siteLockdown && currentView !== "admin" ? (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#04040a] text-center text-white font-sans">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500 mb-6 animate-pulse">
                <Cpu className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-orbitron font-extrabold tracking-wider text-yellow-500 uppercase font-glow-yellow">PORTAL OFFLINE</h2>
              <p className="max-w-md text-xs text-slate-400 font-mono mt-3 leading-relaxed w-full">
                Emergency Scheduled Lockdown: FluxMeet is currently undergoing scheduled engineering maintenance. Our nodes will resume shortly.
              </p>
              <p className="text-[10px] text-yellow-400/80 font-semibold font-mono mt-3 animate-pulse">
                ⚠️ LOCKOUT ACTIVE • PLANNED DOWNTIME INTERVAL
              </p>
              {profile?.id === "admin_ayush" || (typeof window !== "undefined" && localStorage.getItem("flux_is_admin") === "true") ? (
                <button
                  onClick={() => handleViewChange("admin")}
                  className="mt-6 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  ENTER TERMINAL OVERRIDE
                </button>
              ) : null}
            </div>
          ) : (
            <>
          
          {/* Header navigation */}
          <Navbar
            profile={profile}
            notifications={notifications}
            onlineUsers={onlineUsers}
            chatsToday={chatsToday}
            onViewChange={handleViewChange}
            onOpenNotifications={() => handleViewChange("notifications")}
            onOpenPremium={() => setIsPremiumOpen(true)}
            currentView={currentView}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />

          {/* Slide-out mobile drawer menu overlay */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden bg-black/70 backdrop-blur-sm transition-all duration-300">
              {/* Drawer Content */}
              <div className="relative w-64 h-full flex flex-col shadow-2xl">
                <Sidebar
                  currentView={currentView}
                  onViewChange={handleViewChange}
                  onOpenPremium={() => setIsPremiumOpen(true)}
                  theme={theme}
                  isMobileDrawer={true}
                  onCloseDrawer={() => setIsMobileMenuOpen(false)}
                />
                
                {/* Close handle inside the drawer side */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute right-4 top-4 p-1 rounded-md border border-slate-850 bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Close Menu"
                  id="close-mobile-drawer-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Tap backdrop to close */}
              <div 
                className="flex-grow cursor-pointer" 
                onClick={() => setIsMobileMenuOpen(false)}
              />
            </div>
          )}

          {/* Main split dashboard layout */}
          <div className="flex-grow flex min-h-0 overflow-hidden">
            
            {/* Sidebar menu navigation */}
            <Sidebar
              currentView={currentView}
              onViewChange={handleViewChange}
              onOpenPremium={() => setIsPremiumOpen(true)}
              theme={theme}
            />

            {/* Main panels views routing */}
            <main className="flex-grow flex flex-col min-h-0 h-full overflow-hidden">
              {currentView === "dashboard" && (
                <DashboardView
                  profile={profile}
                  onlineUsers={onlineUsers}
                  chatsToday={chatsToday}
                  countriesCount={countriesCount}
                  messagesSent={messagesSent}
                  featuredRooms={rooms}
                  onViewChange={handleViewChange}
                  onJoinRoom={handleJoinFeaturedRoom}
                  onOpenPremium={() => setIsPremiumOpen(true)}
                  theme={theme}
                />
              )}

              {currentView === "match" && (
                <ChatView
                  profile={profile}
                  friends={friends}
                  onAddFriend={handleAddFriend}
                  onToast={triggerToast}
                  onAddHistory={handleAddHistory}
                  // Let ChatView styles map dynamically
                />
              )}

              {currentView === "rooms" && (
                <RoomsView
                  rooms={rooms}
                  onToast={triggerToast}
                  userId={profile.id}
                  userName={profile.displayName}
                />
              )}

              {currentView === "friends" && (
                <FriendsView
                  friends={friends}
                  onRemoveFriend={handleRemoveFriend}
                  onOpenAddFriend={() => setIsAddFriendOpen(true)}
                  onToast={triggerToast}
                  userName={profile.displayName}
                />
              )}

              {currentView === "history" && (
                <HistoryView
                  history={history}
                  onClearHistory={handleClearHistory}
                  onRemoveHistoryItem={handleRemoveHistoryItem}
                  onToast={triggerToast}
                />
              )}

              {currentView === "profile" && (
                <ProfileView
                  profile={profile}
                  onSaveProfile={handleSaveProfile}
                  onToast={triggerToast}
                  theme={theme}
                  onLogout={handleLogout}
                />
              )}

              {currentView === "settings" && (
                <SettingsView
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                  onClearCaches={handleClearCaches}
                  onToast={triggerToast}
                />
              )}

              {currentView === "notifications" && (
                <NotificationsView
                  notifications={notifications}
                  onMarkAllRead={handleMarkAllNotificationsRead}
                  onClearNotification={handleClearNotification}
                  onAcceptFriendRequest={handleAcceptFriendRequest}
                  onToast={triggerToast}
                />
              )}

              {currentView === "admin" && (
                <AdminPanelView
                  onToast={triggerToast}
                  theme={theme}
                />
              )}
            </main>

          </div>

          {/* OVERLAY MODALS REGISTRY */}
          <AddFriendModal
            isOpen={isAddFriendOpen}
            onClose={() => setIsAddFriendOpen(false)}
            onAddFriend={handleAddFriend}
          />

          <PremiumModal
            isOpen={isPremiumOpen}
            onClose={() => setIsPremiumOpen(false)}
            onUpgradeSuccess={handleUpgradePremiumSuccess}
            currentTier={profile.memberType}
          />

          {/* FLOATING TOAST SYSTEM */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold shadow-2xl backdrop-blur-md animate-[slideIn_0.2s_ease-out] border-glow-cyan ${
                  toast.type === "success"
                    ? "bg-[#090e1c] border-[#00e676]/60 text-white font-glow-green"
                    : toast.type === "error"
                    ? "bg-[#180710] border-[#ff4081]/60 text-[#ff4081]"
                    : "bg-[#08081a] border-[#00e5ff]/50 text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-300" />
                  <span>{toast.msg}</span>
                </div>
                <button
                  onClick={() => removeToastItem(toast.id)}
                  className="p-1 hover:bg-white/10 rounded cursor-pointer text-slate-450 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Sticky thumb-centric bottom navigation bar (shown on mobile/tablet screens only) */}
          <div className={`mt-auto shrink-0 lg:hidden border-t py-2 px-2 sticky bottom-0 z-40 justify-around items-center transition-colors duration-300 ${
            isKeyboardOpen ? "hidden" : "flex"
          } ${
            theme === "dark" 
              ? "border-slate-900 bg-[#060613]/95 backdrop-blur-md text-white" 
              : "border-slate-200 bg-white/95 backdrop-blur-md text-slate-800"
          }`} id="mobile-bottom-navigation-bar">
            {[
              { id: "dashboard", label: "Dashboard", icon: Compass },
              { id: "match", label: "Match", icon: MessageSquare },
              { id: "rooms", label: "Rooms", icon: Users },
              { id: "friends", label: "Contacts", icon: Users },
              { id: "profile", label: "Profile", icon: User },
            ].map((navItem) => {
              const Icon = navItem.icon;
              const isActive = currentView === navItem.id;
              
              return (
                <button
                  key={navItem.id}
                  onClick={() => {
                    if (typeof window !== "undefined" && "vibrate" in navigator) {
                      try {
                        if (navItem.id === "dashboard" || navItem.id === "match" || navItem.id === "profile") {
                          // Distinct micro double-pulse for core requested views
                          navigator.vibrate([15, 30, 15]);
                        } else {
                          // Simple gentle pulse for other tabs
                          navigator.vibrate(15);
                        }
                      } catch (e) {
                        console.warn("Haptic feedback error:", e);
                      }
                    }
                    handleViewChange(navItem.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1 cursor-pointer py-1.5 px-3 rounded-xl transition-all relative ${
                    isActive 
                      ? theme === "dark" ? "text-[#00e5ff]" : "text-indigo-650 font-bold"
                      : "text-slate-500 hover:text-slate-400"
                  }`}
                  id={`nav-bottom-${navItem.id}`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-105" : "hover:scale-105"}`} />
                  <span className="text-[9px] font-bold tracking-tight font-sans">
                    {navItem.label}
                  </span>
                  {isActive && (
                    <span className={`absolute -top-0.5 w-1 h-1 rounded-full ${
                      theme === "dark" ? "bg-[#00e5ff]" : "bg-indigo-600"
                    }`} />
                  )}
                </button>
              );
            })}
          </div>

            </>
          )}
        </div>
      )}

    </div>
  );
}
