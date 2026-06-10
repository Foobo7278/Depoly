"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, Terminal, Users, Database, Server, Clock, Search, SlidersHorizontal,
  Ban, ShieldAlert, BadgeAlert, Trash2, UserX, UserCheck, AlertTriangle, FileText,
  VolumeX, Plus, Megaphone, Radio, FileDown, Check, UserPlus2, Sliders, Globe, Download,
  Activity, ArrowRight, Eye, ShieldCheck as VerifiedIcon, Lock, Settings, X
} from "lucide-react";

interface AdminPanelViewProps {
  onToast: (msg: string, type: "success" | "info" | "error") => void;
  theme: "dark" | "light";
}

// Typings for rich simulated datasets
interface AdminUser {
  id: string;
  username: string;
  email: string;
  ip: string;
  country: string;
  joinDate: string;
  totalSessions: number;
  reportsReceived: number;
  status: "active" | "warned" | "muted" | "banned";
  banHistory: string[];
}

interface ActiveChatSession {
  id: string;
  userA: { name: string; country: string; flag: string };
  userB: { name: string; country: string; flag: string };
  durationSeconds: number;
  flagged: boolean;
}

interface UserReport {
  id: string;
  reportedUserId: string;
  reportedUsername: string;
  reporterName: string;
  reason: string;
  status: "pending" | "reviewed" | "escalated";
  timestamp: string;
  chatTranscript: { sender: string; text: string }[];
}

interface BanRecord {
  id: string;
  userId?: string;
  ipAddress?: string;
  reason: string;
  adminName: string;
  expiryDate: string;
}

interface KeywordFilter {
  id: string;
  phrase: string;
  isRegex: boolean;
  action: "warn" | "mute" | "ban";
  triggersCount: number;
}

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Moderator" | "Viewer";
}

interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
}

export default function AdminPanelView({ onToast, theme }: AdminPanelViewProps) {
  const isDark = theme === "dark";

  // State: Selected Sub-Module tab
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Mobile Bottom-Sheet heights: "min" | "mid" | "max"
  const [mobileSheetState, setMobileSheetState] = useState<"min" | "mid" | "max">("mid");

  // --- Real-Time Metrics & Collections loaded via /api/admin ---
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveChatSession[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [bans, setBans] = useState<BanRecord[]>([]);
  const [keywords, setKeywords] = useState<KeywordFilter[]>([]);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [liveOnlineCount, setLiveOnlineCount] = useState<number>(318);
  const [cpuUsage, setCpuUsage] = useState<number>(14);
  const [ramUsage, setRamUsage] = useState<number>(42);
  const [activeConnections, setActiveConnections] = useState<number>(159);
  const [loading, setLoading] = useState<boolean>(true);

  // --- Form Insertion States ---
  const [newKeyword, setNewKeyword] = useState("");
  const [newKeywordIsRegex, setNewKeywordIsRegex] = useState(false);
  const [newKeywordAction, setNewKeywordAction] = useState<"warn" | "mute" | "ban">("warn");

  const [newIpBanInput, setNewIpBanInput] = useState("");
  const [newIpBanReason, setNewIpBanReason] = useState("");

  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"Super Admin" | "Moderator" | "Viewer">("Moderator");

  // --- Selected Elements for Modals ---
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUser | null>(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState<UserReport | null>(null);

  // --- Global Emergency States ---
  const [globalAnnouncementText, setGlobalAnnouncementText] = useState("");
  const [maintenanceCountdown, setMaintenanceCountdown] = useState<number | null>(null);
  const [clientSiteOnline, setClientSiteOnline] = useState(true);

  // Fetch real-time data from server
  const fetchAdminData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/admin");
      const json = await res.json();
      if (json.success) {
        setUsers(json.users);
        setActiveSessions(json.activeSessions);
        setReports(json.reports);
        setBans(json.bans);
        setKeywords(json.keywords);
        setAdmins(json.admins);
        setAuditLogs(json.auditLogs);

        setLiveOnlineCount(json.stats.onlineUsers);
        setCpuUsage(json.system.cpuUsage);
        setRamUsage(json.system.ramUsage);
        setActiveConnections(json.system.activeConnections);
      }
    } catch (err) {
      console.error("Failed fetching live admin state:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Dispatch action to server and refresh data
  const executeAdminAction = async (action: string, payload: any) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload: { ...payload, adminName: "Ayush" } }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchAdminData();
      } else {
        onToast(`Action failed: ${json.error}`, "error");
      }
    } catch (err: any) {
      onToast(`Network transmission failure: ${err.message}`, "error");
    }
  };

  // Synchronous tick and initial fetch load hooks
  useEffect(() => {
    fetchAdminData(true);
    const interval = setInterval(() => fetchAdminData(false), 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync active sessions counter tick (local visual feedback loop)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSessions(prev => prev.map(s => ({ ...s, durationSeconds: s.durationSeconds + 1 })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Maintenance countdown effect
  useEffect(() => {
    if (maintenanceCountdown === null) return;
    if (maintenanceCountdown <= 0) {
      onToast("⚠️ Scheduled maintenance window reached! System locked down.", "info");
      setMaintenanceCountdown(null);
      setClientSiteOnline(false);
      return;
    }
    const timer = setTimeout(() => {
      setMaintenanceCountdown(prev => prev && prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [maintenanceCountdown, onToast]);

  // Handle syncing emergency status to local visibility
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("flux_admin_site_online", clientSiteOnline ? "true" : "false");
    window.dispatchEvent(new Event("storage"));
  }, [clientSiteOnline]);

  // --- Search/Filter States ---
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserStatusFilter, setSelectedUserStatusFilter] = useState("all");
  const [bulkSelectedUsers, setBulkSelectedUsers] = useState<string[]>([]);
  const [banSearchQuery, setBanSearchQuery] = useState("");
  const [chatLogSearchQuery, setChatLogSearchQuery] = useState("");
  const [highlightKeywordsEnabled, setHighlightKeywordsEnabled] = useState(true);

  // Maintenance countdown effect
  useEffect(() => {
    if (maintenanceCountdown === null) return;
    if (maintenanceCountdown <= 0) {
      onToast("⚠️ Scheduled maintenance window reached! System locked down.", "info");
      setMaintenanceCountdown(null);
      setClientSiteOnline(false);
      return;
    }
    const timer = setTimeout(() => {
      setMaintenanceCountdown(prev => prev && prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [maintenanceCountdown, onToast]);

  // --- Utility Functions ---
  const recordAuditLog = (action: string, target: string) => {
    // Audit logs are fully server-authoritative and recorded automatically in server memory!
  };

  // 1. Dashboard calculations
  const totalBannedCount = useMemo(() => {
    return users.filter(u => u.status === "banned").length + bans.length;
  }, [users, bans]);

  const totalReportedCount = useMemo(() => {
    return reports.filter(r => r.status === "pending").length;
  }, [reports]);

  // 2. User searches
  const filteredUsers = useMemo(() => {
    return users.filter(usr => {
      const matchText = (usr.username + usr.id + usr.email + usr.ip + usr.country).toLowerCase();
      const matchesSearch = matchText.includes(userSearchQuery.toLowerCase());
      const matchesStatus = selectedUserStatusFilter === "all" || usr.status === selectedUserStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, userSearchQuery, selectedUserStatusFilter]);

  // Action: Export user list as CSV
  const handleExportUserListCSV = () => {
    const headers = "User ID,Username,Email,IP Address,Country,Join Date,Sessions,Status\n";
    const rows = users.map(u => `"${u.id}","${u.username}","${u.email}","${u.ip}","${u.country}","${u.joinDate}",${u.totalSessions},"${u.status}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `FluxUsersExport_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    onToast("📥 CSV user database list exported and downloaded successfully!", "success");
    recordAuditLog("EXPORT_CSV_USERS", `Exported database list of ${users.length} user records.`);
  };

  // Actions: User modification
  const handleUserMute = (userId: string) => {
    executeAdminAction("USER_MUTE", { userId });
    onToast(`🔇 User ${userId} has been restricted to read-only mute status.`, "info");
  };

  const handleUserUnban = (userId: string) => {
    executeAdminAction("USER_UNBAN", { userId });
    onToast(`🔓 User ${userId} is fully reinstated with active permissions.`, "success");
  };

  const handleUserWarn = (userId: string, reason: string) => {
    executeAdminAction("USER_WARN", { userId, reason });
    onToast(`⚠️ Warning dispatch sent to user ${userId} for: ${reason}`, "info");
  };

  const handleUserBan = (userId: string, reason: string) => {
    executeAdminAction("USER_BAN", { userId, reason });
    onToast(`🚫 Permanently banned user ID ${userId} from the portal.`, "error");
  };

  // Bulk actions on selected users
  const handleBulkBan = () => {
    if (bulkSelectedUsers.length === 0) {
      onToast("⚠️ Select at least one user first.", "error");
      return;
    }
    bulkSelectedUsers.forEach(id => {
      executeAdminAction("USER_BAN", { userId: id, reason: "Bulk moderation action triggered" });
    });
    setBulkSelectedUsers([]);
    onToast(`⚖️ Bulk action completed: ${bulkSelectedUsers.length} users permanently banned.`, "success");
  };

  const handleBulkWarn = () => {
    if (bulkSelectedUsers.length === 0) {
      onToast("⚠️ Select at least one user first.", "error");
      return;
    }
    bulkSelectedUsers.forEach(id => {
      executeAdminAction("USER_WARN", { userId: id, reason: "Bulk compliance notice issued" });
    });
    setBulkSelectedUsers([]);
    onToast(`⚖️ Bulk action completed: ${bulkSelectedUsers.length} users formatted with warnings.`, "info");
  };

  // Terminate Live Chat Session
  const handleTerminateSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    onToast(`💥 Signal severed: Session ${sessionId} terminated instantly. Users placed in default queue.`, "success");
  };

  // Reports decision handlers
  const handleReportAction = (reportId: string, action: "dismiss" | "warn" | "ban" | "escalate") => {
    const reportItem = reports.find(r => r.id === reportId);
    if (!reportItem) return;

    if (action === "dismiss") {
      executeAdminAction("RESOLVE_REPORT", { reportId, status: "reviewed" });
      onToast("✓ Reported user dismissed. Case marked as reviewed.", "success");
    } else if (action === "escalate") {
      executeAdminAction("RESOLVE_REPORT", { reportId, status: "escalated" });
      onToast("🚀 Case escalated to upper system engineering node.", "info");
    } else if (action === "warn") {
      executeAdminAction("USER_WARN", { userId: reportItem.reportedUserId, reason: `Report ${reportId}: Violating content standards.` });
      executeAdminAction("RESOLVE_REPORT", { reportId, status: "reviewed" });
    } else if (action === "ban") {
      executeAdminAction("USER_BAN", { userId: reportItem.reportedUserId, reason: `Reported in ${reportId}: Malicious behavior.` });
      executeAdminAction("RESOLVE_REPORT", { reportId, status: "reviewed" });
    }
    setSelectedReportDetail(null);
  };

  // Keyword management
  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    executeAdminAction("ADD_KEYWORD", { phrase: newKeyword.trim(), isRegex: newKeywordIsRegex, keywordAction: newKeywordAction });
    setNewKeyword("");
    onToast(`🔍 Restricted keyword added: "${newKeyword.trim()}"`, "success");
  };

  const handleDeleteKeyword = (id: string, phrase: string) => {
    executeAdminAction("DELETE_KEYWORD", { id, phrase });
    onToast(`🗑️ Keyword filter removed: "${phrase}"`, "info");
  };

  // Add custom manual IP Ban
  const handleAddIpBan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpBanInput.trim()) return;
    executeAdminAction("ADD_IP_BAN", { ipAddress: newIpBanInput.trim(), reason: newIpBanReason });
    setNewIpBanInput("");
    setNewIpBanReason("");
    onToast(`🚫 IP range ban configured successfully: [ ${newIpBanInput.trim()} ]`, "success");
  };

  const handleRemoveBan = (banId: string, itemStr: string) => {
    executeAdminAction("DELETE_IP_BAN", { id: banId, target: itemStr });
    onToast(`🔓 Removed ban constraints on item: ${itemStr}`, "success");
  };

  // Push System Announcements
  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalAnnouncementText.trim()) return;
    onToast(`📢 Broadcast sent to all online nodes: "${globalAnnouncementText.trim()}"`, "success");
    setGlobalAnnouncementText("");
  };

  // Schedule Maintenance Lockdown mode
  const handleScheduleMaintenance = (minutes: number) => {
    setMaintenanceCountdown(minutes * 60);
    onToast(`⏳ Scheduled maintenance initiated. Auto shutdown in ${minutes} minutes...`, "info");
  };

  // Standard interactive user search for ban table
  const filteredBans = useMemo(() => {
    return bans.filter(b => {
      const targetQuery = banSearchQuery.toLowerCase();
      const matchId = b.userId?.toLowerCase() || "";
      const matchIp = b.ipAddress?.toLowerCase() || "";
      const matchReason = b.reason.toLowerCase() || "";
      return matchId.includes(targetQuery) || matchIp.includes(targetQuery) || matchReason.includes(targetQuery);
    });
  }, [bans, banSearchQuery]);

  // Handle adding administrative moderator files
  const handleAddNewAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) {
      onToast("⚠️ Check missing administrative name fields.", "error");
      return;
    }
    executeAdminAction("ADD_ADMIN", { name: newAdminName.trim(), email: newAdminEmail.trim(), role: newAdminRole });
    setNewAdminName("");
    setNewAdminEmail("");
    onToast(`👑 Successfully commissioned ${newAdminRole}: ${newAdminName}`, "success");
  };

  const handleRevokeAdmin = (id: string, name: string) => {
    if (name === "Ayush") {
      onToast("🚫 Denied: Cannot demote Root Administrator.", "error");
      return;
    }
    executeAdminAction("REVOKE_ADMIN", { id, name });
    onToast(`🗑️ Revoked credentials for: ${name}`, "info");
  };

  // Custom keywords highlighter logic for Chat transcript viewer
  const renderHighlightedTranscript = (text: string) => {
    if (!highlightKeywordsEnabled) return text;
    let highlighted = text;
    keywords.forEach(kw => {
      const phrase = kw.phrase;
      if (phrase.length > 2) {
        // Simple case-insensitive highlight helper
        const regex = new RegExp(`(${phrase})`, "gi");
        highlighted = highlighted.replace(regex, `<span class="bg-[#ff4081]/30 text-white px-1 border border-[#ff4081]/40 rounded font-black">$1</span>`);
      }
    });
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  // Find dynamic session for Chat Log Viewer
  const queriedChatSession = useMemo(() => {
    if (!chatLogSearchQuery.trim()) return null;
    // We can search through the transcripts of historical reports or find match
    const targetQuery = chatLogSearchQuery.trim().toLowerCase();
    const foundReport = reports.find(r => r.id.toLowerCase().includes(targetQuery));
    if (foundReport) {
      return {
        id: foundReport.id,
        userA: foundReport.reporterName,
        userB: foundReport.reportedUsername,
        chatTranscript: foundReport.chatTranscript
      };
    }
    // Fallback default mock log
    return {
      id: chatLogSearchQuery,
      userA: "NeonPhoenix",
      userB: "GigaChadNode",
      chatTranscript: [
        { sender: "NeonPhoenix", text: "Nice connection today! Really feeling instant latency on this portal." },
        { sender: "GigaChadNode", text: "I agree, completely direct P2P. No middleman telemetry files saving messages." },
        { sender: "NeonPhoenix", text: "Wait, isn't there an admin checking chat safety for reports?" },
        { sender: "GigaChadNode", text: "Yes, only if a user manually presses Report! Otherwise it is totally private." }
      ]
    };
  }, [reports, chatLogSearchQuery]);

  const handleExportChatLogTxt = (id: string, transcript: { sender: string; text: string }[]) => {
    const formatted = transcript.map(t => `[${t.sender}]: ${t.text}`).join("\n");
    const fileContent = `FLUX CONVERSATION DUMP\nSession ID: ${id}\nTimestamp: ${new Date().toISOString()}\n\n${formatted}`;
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `ChatTranscript_${id}.txt`);
    a.click();
    onToast(`📥 Live chat log ${id} exported/downloaded successfully as text.`, "success");
    recordAuditLog("EXPORT_CHAT_LOG", `Downloaded unredacted transcript for room channel ${id}`);
  };

  // Bulk selector handlers
  const handleToggleBulkSelect = (userId: string) => {
    setBulkSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const renderActiveTabContent = () => {
    return (
      <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col gap-6"
          >
            
            {/* 1. DASHBOARD OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                
                {/* Visual Header Grid for Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: "Active Matchers (Live Log)", value: liveOnlineCount, desc: "Periodic random fluctuation ticks", icon: Users, color: "text-[#00e5ff]" },
                    { label: "Banned Users Count", value: totalBannedCount, desc: "Permanent list & current blocks", icon: Ban, color: "text-red-400" },
                    { label: "Active Queue Reports", value: totalReportedCount, desc: "Unsettled alerts requesting action", icon: BadgeAlert, color: "text-amber-400" },
                    { label: "Handshake Tunnels Today", value: "1,490 sessions", desc: "Total chat pairings made", icon: FileText, color: "text-emerald-400" }
                  ].map((metric, idx) => (
                    <div key={idx} className={`p-4 rounded-3xl border ${
                      isDark ? "bg-[#0c0c24]/50 border-slate-800" : "bg-white border-slate-200"
                    }`}>
                      <div className="flex items-center justify-between pb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">{metric.label}</span>
                        <metric.icon className={`w-4 h-4 ${metric.color}`} />
                      </div>
                      <h4 className="text-2xl font-black font-orbitron">{metric.value}</h4>
                      <p className="text-[9px] text-slate-500 mt-1">{metric.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Server Infrastructure Health & Visual Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Health checks */}
                  <div className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 ${
                    isDark ? "bg-[#0b0b1c] border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    <div>
                      <h3 className="text-xs font-bold font-orbitron tracking-wide text-white uppercase flex items-center gap-2">
                        <Server className="w-4 h-4 text-[#00e5ff]" />
                        <span>Core Cloud Run Infrastructure Diagnostics</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Real-time telemetry reading benchmarks from active Node server context</p>
                    </div>

                    <div className="space-y-4">
                      {/* CPU usage simulated loader */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-350">Server CPU Core Performance</span>
                          <span className={`${cpuUsage > 75 ? "text-red-400" : "text-[#00e5ff]"}`}>{cpuUsage}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-700 bg-gradient-to-r ${cpuUsage > 75 ? "from-red-500 to-amber-500" : "from-[#7c4dff] to-[#00e5ff]"}`}
                            style={{ width: `${cpuUsage}%` }}
                          />
                        </div>
                      </div>

                      {/* Ram usage simulated loader */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-350">Active Memory Heap Allocation</span>
                          <span className="text-emerald-400">{ramUsage}% (4.1 GB / 8.0 GB)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${ramUsage}%` }} />
                        </div>
                      </div>

                      {/* Active Connection state indicator */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-350">Open WebSocket Tunnel Handshakes</span>
                          <span className="text-cyan-400">{activeConnections} WebSockets / sec</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 transition-all duration-700" style={{ width: `${(activeConnections / 250) * 100}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#03030b] border border-cyan-500/20 rounded-xl flex items-center justify-between text-[10px] font-mono text-cyan-400 mt-2">
                      <span>PRIMARY GATEWAY SERVER ID: CLOUD-RUN-NODE-EAST</span>
                      <span className="text-emerald-400 animate-pulse">● STABLE STATE</span>
                    </div>
                  </div>

                  {/* Built-In High Fidelity SVG Analytics charts */}
                  <div className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 ${
                    isDark ? "bg-[#0b0b1c] border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    <div>
                      <h3 className="text-xs font-bold font-orbitron text-white uppercase tracking-wider">Weekly Daily Active Users (DAU)</h3>
                      <p className="text-[10px] text-slate-500">Fluctuation curve of peer matches completed per calendar day</p>
                    </div>

                    <div className="h-32 flex items-end justify-between gap-2 pt-4 border-b border-slate-800/65">
                      {[
                        { day: "Mon", count: 420 },
                        { day: "Tue", count: 590 },
                        { day: "Wed", count: 720 },
                        { day: "Thu", count: 680 },
                        { day: "Fri", count: 910 },
                        { day: "Sat", count: 1250 },
                        { day: "Sun", count: 1100 }
                      ].map((bar, i) => {
                        const pct = (bar.count / 1300) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                            <span className="text-[9px] text-cyan-400 font-mono opacity-0 group-hover:opacity-100 transition-all">
                              {bar.count}
                            </span>
                            <div 
                              className="w-full rounded-t-lg bg-gradient-to-t from-[#7c4dff] to-[#00e5ff] group-hover:brightness-125 transition-all text-center text-[10px]"
                              style={{ height: `${pct}%`, minHeight: "15%" }}
                            />
                            <span className="text-[9px] text-slate-500 font-bold uppercase mt-1">{bar.day}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>PEAK LOAD RATIO: Fridays 21:00 UTC</span>
                      <span className="text-purple-400">Avg chat duration: 3.4 mins</span>
                    </div>

                  </div>

                </div>

                {/* Dashboard Quick Actions Links */}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setActiveTab("users")} className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs rounded-xl hover:text-white cursor-pointer">
                    Manage Accounts
                  </button>
                  <button onClick={() => setActiveTab("sessions")} className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs rounded-xl hover:text-white cursor-pointer">
                    Monitor Broadcast State
                  </button>
                  <button onClick={() => setActiveTab("reports")} className="px-3.5 py-2 bg-[#ff4081]/15 border border-[#ff4081]/30 text-xs text-[#ff4081] rounded-xl hover:bg-[#ff4081]/25 cursor-pointer">
                    Examine Reported Queue
                  </button>
                </div>

              </div>
            )}

            {/* 2. USER MANAGEMENT */}
            {activeTab === "users" && (
              <div className="space-y-6">
                
                {/* Search query layout */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-grow flex items-center gap-3 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-2xl">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Search accounts database by username, ID, IP address, country..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-702"
                    />
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <select 
                      value={selectedUserStatusFilter}
                      onChange={(e) => setSelectedUserStatusFilter(e.target.value)}
                      className="bg-slate-950/75 border border-slate-800 text-xs text-slate-350 p-2.5 rounded-2xl focus:outline-none"
                    >
                      <option value="all">Show All Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="warned">Warned Only</option>
                      <option value="muted">Muted Only</option>
                      <option value="banned">Banned Only</option>
                    </select>

                    <button 
                      onClick={handleExportUserListCSV}
                      className="px-4 py-2 bg-[#00e5ff]/10 hover:bg-[#00e5ff] text-[#00e5ff] hover:text-black border border-[#00e5ff]/30 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>EXPORT CSV</span>
                    </button>
                  </div>
                </div>

                {/* Bulk Actions Menu Bar (appears when users are selected) */}
                {bulkSelectedUsers.length > 0 && (
                  <div className="p-3.5 bg-purple-950/20 border border-[#7c4dff]/40 rounded-2xl flex items-center justify-between text-xs text-white animate-fade-in">
                    <div className="font-mono">
                      Selected <strong>{bulkSelectedUsers.length}</strong> user records. Choose systematic moderation clamp override:
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleBulkWarn} className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-100 hover:text-black font-semibold rounded-xl text-xs cursor-pointer">
                        Warn Selected
                      </button>
                      <button onClick={handleBulkBan} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-100 hover:text-black font-semibold rounded-xl text-xs cursor-pointer">
                        Ban Selected
                      </button>
                      <button onClick={() => setBulkSelectedUsers([])} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl hover:text-white text-slate-400 cursor-pointer">
                        Deselect
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary User Directory Table */}
                <div className="overflow-x-auto rounded-3xl border border-slate-800/80 bg-slate-950/40">
                  <table className="w-full text-left text-xs text-slate-400">
                    <thead className="bg-[#0c0c20]/60 text-[10px] text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800/40">
                      <tr>
                        <th className="p-3 text-center w-12">
                          <input 
                            type="checkbox" 
                            checked={bulkSelectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBulkSelectedUsers(filteredUsers.map(u => u.id));
                              } else {
                                setBulkSelectedUsers([]);
                              }
                            }}
                            className="accent-purple-500"
                          />
                        </th>
                        <th className="p-3 text-center">User ID</th>
                        <th className="p-3">Username</th>
                        <th className="p-3">Country / IP</th>
                        <th className="p-3">Total Sessions</th>
                        <th className="p-3">Reports</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-6 text-center text-slate-500 font-mono">
                            No active matching user files found in session logs. Try resetting filters.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(usr => (
                          <tr key={usr.id} className="hover:bg-[#0c0c24]/30 transition-colors">
                            <td className="p-3 text-center">
                              <input 
                                type="checkbox"
                                checked={bulkSelectedUsers.includes(usr.id)}
                                onChange={() => handleToggleBulkSelect(usr.id)}
                                className="accent-purple-500"
                              />
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-[#00e5ff]">{usr.id}</td>
                            <td className="p-3">
                              <div>
                                <span className="font-semibold text-white block">{usr.username}</span>
                                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px] block">{usr.email}</span>
                              </div>
                            </td>
                            <td className="p-3 font-mono">
                              <div className="text-[11px] text-slate-300">{usr.country}</div>
                              <div className="text-[9px] text-slate-500">{usr.ip}</div>
                            </td>
                            <td className="p-3 text-center font-bold text-white">{usr.totalSessions}</td>
                            <td className="p-3 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                                usr.reportsReceived > 4 ? "bg-red-500/20 text-red-400" : "bg-slate-900 text-slate-500"
                              }`}>
                                {usr.reportsReceived} reports
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`text-[9px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded-full ${
                                usr.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                usr.status === "warned" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                                usr.status === "muted" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                                "bg-red-500/10 text-red-500 border border-red-500/20"
                              }`}>
                                {usr.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex gap-1.5 justify-end">
                                <button 
                                  onClick={() => setSelectedUserDetail(usr)}
                                  className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-350 cursor-pointer"
                                  title="Expand profile inspect history"
                                >
                                  VIEW PROFILE
                                </button>
                                {usr.status !== "muted" && (
                                  <button onClick={() => handleUserMute(usr.id)} className="p-1 text-purple-400 hover:bg-purple-500/10 rounded cursor-pointer" title="Mute Microphone text stream">
                                    <VolumeX className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {usr.status !== "banned" ? (
                                  <button onClick={() => handleUserBan(usr.id, "Administrative ban directive issued")} className="p-1 text-red-400 hover:bg-red-500/10 rounded cursor-pointer" title="Ban Account permanently">
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button onClick={() => handleUserUnban(usr.id)} className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded cursor-pointer" title="Restore active privilege file">
                                    <UserCheck className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* 3. ACTIVE SESSIONS MONITOR */}
            {activeTab === "sessions" && (
              <div className="space-y-6">
                
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider">WebSocket Broadcast Channel Monitor</h3>
                    <p className="text-[10px] text-slate-500">Real-time unredacted active room linkings on standard port 3000 proxies</p>
                  </div>
                  <span className="text-[10px] font-mono bg-purple-500/10 border border-[#7c4dff]/40 px-3 py-1 rounded-full text-[#7c4dff] font-bold animate-pulse">
                    ● {activeSessions.length} TUNNELS COMMITTED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeSessions.length === 0 ? (
                    <div className="col-span-full p-8 text-center border rounded-3xl bg-slate-950/20 text-slate-500 font-mono">
                      No active peer room connections configured currently on this node.
                    </div>
                  ) : (
                    activeSessions.map((sess) => (
                      <div key={sess.id} className="p-4 border rounded-3xl bg-slate-950/50 border-slate-800 hover:border-[#7c4dff]/55 transition-all flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-purple-400 font-bold">{sess.id}</span>
                            <span className="text-[10px] font-mono text-slate-450 text-right flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {Math.floor(sess.durationSeconds / 60)}m {sess.durationSeconds % 60}s
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between bg-[#040410] border border-slate-800 p-2.5 rounded-xl">
                            <div>
                              <span className="text-white font-bold block text-xs truncate max-w-[90px]">{sess.userA.name}</span>
                              <span className="text-[9px] text-slate-500 font-mono">{sess.userA.flag} {sess.userA.country}</span>
                            </div>
                            <div className="text-[#00e5ff] font-bold font-orbitron text-[10px] text-center px-1">◀ P2P ▶</div>
                            <div className="text-right">
                              <span className="text-white font-bold block text-xs truncate max-w-[90px]">{sess.userB.name}</span>
                              <span className="text-[9px] text-slate-500 font-mono">{sess.userB.flag} {sess.userB.country}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          {sess.flagged ? (
                            <span className="text-[9px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                              SUSPICIOUS TELEMETRY
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                              ✓ SECURE CHANNEL
                            </span>
                          )}

                          <button 
                            onClick={() => handleTerminateSession(sess.id)}
                            className="px-3 py-1.5 bg-red-650 hover:bg-red-700 hover:text-white text-xs font-bold text-slate-200 transition-all rounded-lg cursor-pointer"
                          >
                            DISCONNECT
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

            {/* 4. REPORTS & MODERATION QUEUE */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider">Reports & System Abuse Escalations</h3>
                    <p className="text-[10px] text-slate-500">Unsettled complaints submitted manually by peer matchers with active encrypted traces</p>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full animate-bounce">
                    {reports.filter(r => r.status === "pending").length} PENDING IN QUEUE
                  </span>
                </div>

                <div className="space-y-3.5">
                  {reports.map((rep) => (
                    <div key={rep.id} className="p-4 rounded-3xl border bg-[#080816]/70 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      <div className="space-y-1.5 flex-grow">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-amber-500 font-bold">{rep.id}</span>
                          <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase ${
                            rep.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                            rep.status === "escalated" ? "bg-purple-500/20 text-purple-400" : "bg-slate-800 text-slate-400"
                          }`}>
                            {rep.status}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{rep.timestamp}</span>
                        </div>

                        <p className="text-xs text-white">
                          Reporter: <span className="font-bold text-slate-350">{rep.reporterName}</span> 
                          ➡ Reported: <span className="font-extrabold text-red-400">{rep.reportedUsername}</span>
                        </p>

                        <p className="text-xs text-slate-400 leading-normal font-mono bg-black/45 p-2 rounded-xl border border-slate-850">
                          ⚙ Action Reason: {rep.reason}
                        </p>
                      </div>

                      <div className="flex-shrink-0 flex gap-2">
                        <button 
                          onClick={() => setSelectedReportDetail(rep)}
                          className="px-3 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>EXAMINE TRANSCRIPT</span>
                        </button>

                        <button 
                          onClick={() => handleReportAction(rep.id, "dismiss")}
                          className="px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Dismiss
                        </button>

                        <button 
                          onClick={() => handleReportAction(rep.id, "escalate")}
                          className="px-3 py-2 bg-indigo-500/15 hover:bg-indigo-500 text-indigo-400 hover:text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Escalate
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* 5. BAN MANAGEMENT */}
            {activeTab === "bans" && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left: Input for IP address clamp */}
                  <div className="p-5 rounded-3xl border bg-slate-950/40 border-slate-800 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold font-orbitron text-[#00e5ff] uppercase tracking-wider">Configure IP Range clamp</h3>
                      <p className="text-[10px] text-slate-500 mt-1">Restrict malicious subnets or block individual computers instantly</p>
                    </div>

                    <form onSubmit={handleAddIpBan} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] text-[#00e5ff] uppercase font-mono font-bold block">IP Target Range (Wildcards allowed)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 192.168.1.* or 45.10.22.90"
                          value={newIpBanInput}
                          onChange={(e) => setNewIpBanInput(e.target.value)}
                          className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#00e5ff]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-[#00e5ff] uppercase font-mono font-bold block">Ban Enforcement Reason</label>
                        <input 
                          type="text" 
                          placeholder="Toxic language behavior or DDoS vector"
                          value={newIpBanReason}
                          onChange={(e) => setNewIpBanReason(e.target.value)}
                          className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-red-650 hover:bg-red-700 text-white font-sans text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                      >
                        ENFORCE RANGE BLOCKAGE
                      </button>
                    </form>
                  </div>

                  {/* Right: Active banned elements searches */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-bold font-orbitron text-white uppercase tracking-wider">Active Lock constraints database</h3>
                        <p className="text-[10px] text-slate-500">Search restrictions by identity profiles or remote subnet IPs</p>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-2xl w-full md:w-64">
                        <Search className="w-3.5 h-3.5 text-slate-500" />
                        <input 
                          type="text" 
                          placeholder="Query matching bans..."
                          value={banSearchQuery}
                          onChange={(e) => setBanSearchQuery(e.target.value)}
                          className="bg-transparent border-none text-[11px] text-white focus:outline-none w-full"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-3xl border border-slate-800/80 bg-slate-950/45 text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-[#0b0b1c] text-slate-500 text-[10px] font-mono uppercase tracking-wider border-b border-slate-800/40">
                          <tr>
                            <th className="p-3">Target Identity</th>
                            <th className="p-3">Enforcement Reason</th>
                            <th className="p-3">Issuing Officer</th>
                            <th className="p-3">Expiry Deadline</th>
                            <th className="p-3 text-right">Lift Restriction</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/35">
                          {filteredBans.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-900/30">
                              <td className="p-3 font-mono">
                                {b.userId ? (
                                  <div>
                                    <span className="text-purple-400 block font-bold">User {b.userId}</span>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-red-400 block font-bold">IP subnet {b.ipAddress}</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-3">{b.reason}</td>
                              <td className="p-3 text-slate-350">{b.adminName}</td>
                              <td className="p-3 font-mono font-bold text-slate-400">{b.expiryDate}</td>
                              <td className="p-3 text-right">
                                <button 
                                  onClick={() => handleRemoveBan(b.id, b.userId || b.ipAddress || "")}
                                  className="px-2.5 py-1 bg-slate-900 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 border border-slate-800 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                                >
                                  LIFT CONSTRAINT
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 6. CHAT LOG VIEWER */}
            {activeTab === "chatlogs" && (
              <div className="space-y-6">
                
                <div className="p-5 rounded-3xl border bg-slate-950/40 border-slate-800 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold font-orbitron text-white uppercase tracking-wider">Unredacted Chat transcript Decryption Viewer</h3>
                    <p className="text-[10px] text-slate-500 mt-1">Provide an active report case ID or Session ID to search anonymized text payload history</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-2.5">
                    <input 
                      type="text" 
                      placeholder="e.g. rep_201 or enter arbitrary session identifiers to compile mock logs..."
                      value={chatLogSearchQuery}
                      onChange={(e) => setChatLogSearchQuery(e.target.value)}
                      className="flex-grow bg-black border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white font-mono placeholder-slate-705 focus:outline-none focus:border-[#7c4dff]"
                    />
                    
                    <button 
                      onClick={() => {
                        if (!chatLogSearchQuery.trim()) {
                          setChatLogSearchQuery("rep_201");
                        }
                      }}
                      className="px-4 py-2.5 bg-[#7c4dff] hover:bg-[#6c3df0] text-white text-xs font-bold rounded-2xl cursor-pointer"
                    >
                      DECRYPT HISTORY
                    </button>
                  </div>

                  <div className="flex items-center gap-3.5 bg-black/45 p-3 rounded-xl border border-slate-850">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input 
                        type="checkbox" 
                        checked={highlightKeywordsEnabled}
                        onChange={(e) => setHighlightKeywordsEnabled(e.target.checked)}
                        className="accent-purple-500"
                      />
                      <span>Highlight Suspicious Trigger Phrases (scam, payout, casino, win big, https://)</span>
                    </label>
                  </div>
                </div>

                {queriedChatSession ? (
                  <div className="p-5 border rounded-3xl bg-[#03030d] border-slate-800 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-purple-400 font-bold block">RECORD COMPRISING CHANNEL: {queriedChatSession.id}</span>
                        <span className="text-xs text-slate-400">Pair targets: <strong>{queriedChatSession.userA}</strong> paired with <strong>{queriedChatSession.userB}</strong></span>
                      </div>

                      <button 
                        onClick={() => handleExportChatLogTxt(queriedChatSession.id, queriedChatSession.chatTranscript)}
                        className="px-3.5 py-1.5 bg-[#00e5ff]/10 hover:bg-[#00e5ff] text-[#00e5ff] hover:text-black border border-[#00e5ff]/30 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>EXPORT PLAINTEXT LOG</span>
                      </button>
                    </div>

                    <div className="p-4 bg-slate-950/60 rounded-3xl space-y-3 max-h-80 overflow-y-auto border border-slate-900 scrollbar-thin">
                      {queriedChatSession.chatTranscript.map((msg, idx) => (
                        <div key={idx} className={`p-3 rounded-2xl text-xs max-w-lg ${
                          msg.sender === queriedChatSession.userA 
                            ? "bg-slate-900 text-slate-200 border border-slate-800" 
                            : "bg-[#0c0c2a] text-[#00e5ff]/90 border border-purple-950 ml-auto text-right"
                        }`}>
                          <span className="font-mono text-[9px] text-slate-500 block mb-0.5 uppercase tracking-wider">{msg.sender}</span>
                          <p>{renderHighlightedTranscript(msg.text)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 border rounded-3xl bg-slate-950/20 text-slate-500 font-mono">
                    Awaiting search parameters. Type &quot;rep_201&quot; to inspect AliceCrypto phishing log audit case transcript.
                  </div>
                )}

              </div>
            )}

            {/* 7. KEYWORD / CONTENT FILTER */}
            {activeTab === "filters" && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Form input */}
                  <div className="p-5 rounded-3xl border bg-slate-950/40 border-slate-800 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold font-orbitron text-[#00e5ff] uppercase tracking-wider">Add Restricted Directive</h3>
                      <p className="text-[10px] text-slate-500 mt-1">Restrict custom terms or standard expressions dynamically</p>
                    </div>

                    <form onSubmit={handleAddKeyword} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] text-[#00e5ff] uppercase font-mono font-bold block">Banned word or phrase</label>
                        <input 
                          type="text" 
                          placeholder="e.g. transfer giftcard"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1.5 flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="regex-check"
                          checked={newKeywordIsRegex}
                          onChange={(e) => setNewKeywordIsRegex(e.target.checked)}
                          className="accent-[#00e5ff] cursor-pointer"
                        />
                        <label htmlFor="regex-check" className="text-[10px] text-slate-400 cursor-pointer select-none">
                          Interpret as regular expression patterns (Regex)
                        </label>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-[#00e5ff] uppercase font-mono font-bold block">Action on trigger matches</label>
                        <select
                          value={newKeywordAction}
                          onChange={(e) => setNewKeywordAction(e.target.value as any)}
                          className="w-full bg-black border border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none"
                        >
                          <option value="warn">Warn User dynamically (Warn alert)</option>
                          <option value="mute">Mute micro message channels (Safe Mute)</option>
                          <option value="ban">Permanent Administrative Clamp (Auto Ban)</option>
                        </select>
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-[#7c4dff] hover:bg-[#6c3df0] text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                      >
                        DEPLOY PHRASE FILTER
                      </button>
                    </form>
                  </div>

                  {/* Listings table */}
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold font-orbitron text-white uppercase tracking-wider font-bold">Active Content Filter Directives</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Filter rules processed on client message payloads automatically</p>
                    </div>

                    <div className="overflow-x-auto rounded-3xl border border-slate-800/80 bg-slate-950/45 text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-[#0b0b1c] text-slate-500 text-[10px] font-mono uppercase tracking-wider border-b border-slate-800/40">
                          <tr>
                            <th className="p-3">Restricted Word / Phrase</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Compliance Mitigation Action</th>
                            <th className="p-3 text-center">Triggers Count</th>
                            <th className="p-3 text-right">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/35">
                          {keywords.map((kw) => (
                            <tr key={kw.id} className="hover:bg-slate-900/30">
                              <td className="p-3 font-mono font-bold text-white">&quot;{kw.phrase}&quot;</td>
                              <td className="p-3 font-mono text-[10px] text-slate-400">
                                {kw.isRegex ? "Regex Match Pattern" : "Plain phrase text"}
                              </td>
                              <td className="p-3">
                                <span className={`text-[9px] font-bold uppercase tracking-wider font-mono px-2.5 py-0.5 rounded-full ${
                                  kw.action === "warn" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                                  kw.action === "mute" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                                  "bg-red-500/10 text-red-500 border border-red-500/20"
                                }`}>
                                  {kw.action}
                                </span>
                              </td>
                              <td className="p-3 text-center font-bold font-sans text-cyan-400 text-xs">{kw.triggersCount} times</td>
                              <td className="p-3 text-right">
                                <button 
                                  onClick={() => handleDeleteKeyword(kw.id, kw.phrase)}
                                  className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded cursor-pointer transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 8. ANNOUNCEMENTS & NOTICES */}
            {activeTab === "events" && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* System Announcement form */}
                  <div className="p-5 rounded-3xl border bg-slate-950/40 border-slate-800 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold font-orbitron text-white uppercase tracking-wider">Publish Global Announcement</h3>
                      <p className="text-[10px] text-slate-500 mt-1">This will display a live broadcast alert across all connected user interfaces immediately</p>
                    </div>

                    <form onSubmit={handleSendAnnouncement} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] text-[#00e5ff] uppercase font-mono font-bold block font-mono">Broadcast Alert text</label>
                        <textarea 
                          rows={3}
                          placeholder="e.g. SYSTEM NOTICE: Maintenance period is commencing on Sunday 03:00 UTC."
                          value={globalAnnouncementText}
                          onChange={(e) => setGlobalAnnouncementText(e.target.value)}
                          className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-[#00e5ff]/10 hover:bg-[#00e5ff] text-[#00e5ff] hover:text-black border border-[#00e5ff]/35 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg"
                      >
                        TRANSMIT BROADCAST MARQUEE
                      </button>
                    </form>
                  </div>

                  {/* Scheduled offline Countdown Form */}
                  <div className="p-5 rounded-3xl border bg-slate-950/40 border-slate-800 flex flex-col justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold font-orbitron text-[#ff4081] uppercase tracking-wider">Offline Maintenance Countdown</h3>
                      <p className="text-[10px] text-slate-500 mt-1">Warn active users with a real-time countdown. At zero, standard chat routes will reject new sessions</p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs text-slate-350">Choose shutdown countdown timer prefix:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { min: 1, text: "1 Minute Limit" },
                          { min: 5, text: "5 Minutes Notice" },
                          { min: 15, text: "15 Minutes Notice" }
                        ].map((btn, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleScheduleMaintenance(btn.min)}
                            className="bg-black/60 hover:bg-[#ff4081]/15 text-slate-350 hover:text-[#ff4081] p-3 text-center rounded-xl border border-slate-850 hover:border-[#ff4081]/30 transition-all text-[11px] font-bold font-mono cursor-pointer"
                          >
                            {btn.text}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-red-950/10 border border-red-500/20 text-[10px] font-mono text-red-400 rounded-xl leading-normal">
                      ⚠️ Engaging any countdown triggers localized event listeners. Users will see a ticking red countdown clock in page headers to persist safety.
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 9. ANALYTICS */}
            {activeTab === "charts" && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Top countries usage */}
                  <div className="md:col-span-8 p-5 rounded-3xl border bg-slate-950/40 border-slate-800 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold font-orbitron text-white uppercase tracking-wider">Top countries by active use</h3>
                      <p className="text-[10px] text-slate-500">Global regions matched today on available nodes</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {[
                        { country: "United States", flag: "🇺🇸", ratio: "42%", count: 914, fill: "bg-[#00e5ff]" },
                        { country: "Japan", flag: "🇯🇵", ratio: "21%", count: 457, fill: "bg-[#7c4dff]" },
                        { country: "United Kingdom", flag: "🇬🇧", ratio: "15%", count: 326, fill: "bg-indigo-500" },
                        { country: "Germany", flag: "🇩🇪", ratio: "12%", count: 261, fill: "bg-emerald-500" },
                        { country: "Canada", flag: "🇨🇦", ratio: "10%", count: 218, fill: "bg-pink-500" }
                      ].map((bar, idx) => (
                        <div key={idx} className="space-y-1 text-xs">
                          <div className="flex justify-between font-mono">
                            <span className="text-white block font-sans">{bar.flag} {bar.country}</span>
                            <span className="text-slate-400 font-bold">{bar.count} connections ({bar.ratio})</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                            <div className={`h-full ${bar.fill}`} style={{ width: bar.ratio }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Heatmap & Skip rates widgets */}
                  <div className="md:col-span-4 p-5 rounded-3xl border bg-slate-950/40 border-slate-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold font-orbitron text-white uppercase tracking-wider">Skip Match metrics</h3>
                      <p className="text-[10px] text-slate-500 mt-1">Ratio of users clicking &quot;Next&quot; before 10s</p>
                    </div>

                    <div className="py-4 text-center">
                      <div className="text-4xl font-extrabold font-orbitron text-amber-400">41.8%</div>
                      <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">AVERAGE SKIP RETENTION RATIO</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Returning Active Users</span>
                        <span className="font-bold text-white">64%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-mono">New Sign-up peer count</span>
                        <span className="font-bold text-white">36%</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 7-Day Hours density heatmap */}
                <div className="p-5 rounded-3xl border bg-slate-950/40 border-slate-800 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold font-orbitron text-white uppercase tracking-wider">7-Day Hours Traffic Density Heatmap</h3>
                    <p className="text-[10px] text-slate-500">Darker shades correspond to higher concurrent socket handshakes</p>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono select-none">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <span className="text-slate-500 font-bold block mb-1">{day}</span>
                        {[
                          { hour: "00-06", density: "bg-[#00e5ff]/10" },
                          { hour: "06-12", density: "bg-[#7c4dff]/25" },
                          { hour: "12-18", density: "bg-[#7c4dff]/45" },
                          { hour: "18-24", density: idx > 3 ? "bg-[#ff4081]/70 font-bold text-white shadow-lg" : "bg-[#7c4dff]/60" }
                        ].map((cell, cidx) => (
                          <div 
                            key={cidx} 
                            className={`p-2.5 rounded-lg border border-slate-800/10 cursor-help transition-all ${cell.density}`}
                            title={`Traffic Density period ${cell.hour}:00`}
                          >
                            {cell.hour}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 10. ADMIN ACCOUNTS & ROLES + AUDIT LOGS */}
            {activeTab === "admins" && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Commission form */}
                  <div className="p-5 rounded-3xl border bg-slate-950/40 border-slate-800 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold font-orbitron text-[#00e5ff] uppercase tracking-wider">Commission Administrator account</h3>
                      <p className="text-[10px] text-slate-500 mt-1">Enroll verified team members with customized action authorities</p>
                    </div>

                    <form onSubmit={handleAddNewAdmin} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] text-[#00e5ff] uppercase font-mono font-bold block">Officer Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Commander Squidward"
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-[#00e5ff] uppercase font-mono font-bold block">Email Address</label>
                        <input 
                          type="email" 
                          placeholder="squidward@gmail.com"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          className="w-full bg-black border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-[#00e5ff] uppercase font-mono font-bold block">Permission Level Rule</label>
                        <select
                          value={newAdminRole}
                          onChange={(e) => setNewAdminRole(e.target.value as any)}
                          className="w-full bg-black border border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none"
                        >
                          <option value="Super Admin">Super Admin (Universal Override)</option>
                          <option value="Moderator">Moderator (Ban/Kick commands)</option>
                          <option value="Viewer">Viewer (Read-only monitor)</option>
                        </select>
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-[#7c4dff] hover:bg-[#6c3df0] text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                      >
                        COMMISSION OFFICER
                      </button>
                    </form>
                  </div>

                  {/* List of current administrators */}
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold font-orbitron text-white uppercase tracking-wider">Commissioned Officers list</h3>
                      <p className="text-[10px] text-slate-500 mt-1">Authorized personnel with active session access token logs</p>
                    </div>

                    <div className="overflow-x-auto rounded-3xl border border-slate-800/80 bg-slate-950/45 text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-[#0b0b1c] text-indigo-400 text-[10px] font-mono uppercase tracking-wider border-b border-slate-800/40">
                          <tr>
                            <th className="p-3">Identity Name</th>
                            <th className="p-3">Email coordinate</th>
                            <th className="p-3">Permission Role</th>
                            <th className="p-3 text-right">Revoke Access</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/35">
                          {admins.map((adm) => (
                            <tr key={adm.id} className="hover:bg-slate-900/10">
                              <td className="p-3 font-semibold text-white">{adm.name}</td>
                              <td className="p-3 font-mono text-slate-400">{adm.email}</td>
                              <td className="p-3">
                                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${
                                  adm.role === "Super Admin" ? "bg-red-500/10 text-red-400" :
                                  adm.role === "Moderator" ? "bg-[#00e5ff]/10 text-[#00e5ff]" : "bg-slate-800 text-slate-400"
                                }`}>
                                  {adm.role}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button 
                                  onClick={() => handleRevokeAdmin(adm.id, adm.name)}
                                  className="px-2 py-1 hover:text-red-500 hover:bg-red-500/10 rounded-lg text-[10px] text-slate-400 font-bold transition-all cursor-pointer"
                                >
                                  REVOKE
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* Secure Audit logs chronological stream */}
                <div className="p-5 rounded-3xl border bg-[#050514]/75 border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap">
                    <div>
                      <h3 className="text-xs font-bold font-orbitron text-white uppercase tracking-wider">Administrative Action Audit Logs</h3>
                      <p className="text-[10px] text-slate-500">Unalterable logging registry tracing all actions executed on this panel interface</p>
                    </div>

                    <button 
                      onClick={() => {
                        setAuditLogs([
                          { id: `log_init_${Date.now()}`, adminName: "System Guardian", action: "RESET_AUDIT_TIMELINE", target: "System logs registry reset manually", timestamp: new Date().toISOString() },
                          ...auditLogs
                        ]);
                        onToast("✓ Timeline audit logged successfully.", "info");
                      }}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[10px] border border-slate-800 rounded-lg cursor-pointer"
                    >
                      Audit Push Trigger
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[10px] text-slate-400 scrollbar-thin">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex justify-between p-2 rounded bg-black/40 border border-slate-900 leading-normal hover:border-slate-850 transition-colors">
                        <div className="space-x-1">
                          <span className="text-[#00e5ff] font-bold">[{log.adminName}]</span>
                          <span className="text-purple-400 font-semibold">{log.action}:</span>
                          <span className="text-slate-300">{log.target}</span>
                        </div>
                        <span className="text-slate-500 text-[9px] flex-shrink-0 ml-4">{log.timestamp.split('T')[1].replace('Z', '')} UTC</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </motion.div>
        </AnimatePresence>
      );
    };

  return (
    <div className={`flex-grow h-full min-h-0 select-none relative ${
      isDark ? "bg-[#04040e] text-white" : "bg-slate-50 text-slate-800"
    }`}>
      
      {/* DESKTOP SPLIT VIEWPORT */}
      <div className="hidden md:flex flex-grow flex-row h-full min-h-0 w-full">
        {/* --- LEFT HAND MODULAR SIDEBAR --- */}
        <div className={`w-64 flex-shrink-0 border-r p-4 flex-col gap-2 overflow-y-auto flex ${
          isDark ? "bg-[#060613] border-slate-800/80" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center gap-2 px-2 pb-4 border-b border-slate-800/40">
            <Terminal className="w-5 h-5 text-[#00e5ff] animate-pulse" />
            <div>
              <h3 className="text-xs font-bold font-orbitron tracking-wider text-[#00e5ff] uppercase">Flux Terminal</h3>
              <span className="text-[9px] text-slate-500 font-mono tracking-widest block">ADMIN PANEL v4.1</span>
            </div>
          </div>

          {/* Categories navigation links */}
          <div className="space-y-1 py-3 flex-grow">
            {[
              { id: "overview", label: "Dashboard Overview", icon: Activity },
              { id: "users", label: "User Management", icon: Users },
              { id: "sessions", label: "Active Sessions", icon: Radio },
              { id: "reports", label: "Reports Queue", icon: BadgeAlert, badge: reports.filter(r => r.status === "pending").length },
              { id: "bans", label: "Ban & IP Controls", icon: Ban },
              { id: "chatlogs", label: "Chat Log Viewer", icon: FileText },
              { id: "filters", label: "Keyword Filters", icon: SlidersHorizontal },
              { id: "events", label: "Announcements & Offline", icon: Megaphone },
              { id: "charts", label: "Deep Analytics", icon: Sliders },
              { id: "admins", label: "Admin Roles & Logs", icon: ShieldCheck }
            ].map(tab => {
              const IconComp = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setUserSearchQuery("");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isSel
                      ? isDark 
                        ? "bg-gradient-to-r from-[#7c4dff]/20 to-[#00e5ff]/10 text-[#00e5ff] border-l-4 border-[#00e5ff] font-bold"
                        : "bg-[#7c4dff]/10 text-[#7c4dff] border-l-4 border-[#7c4dff] font-bold"
                      : isDark 
                        ? "text-slate-400 hover:text-white hover:bg-slate-900/50" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp className={`w-4 h-4 ${isSel ? "text-[#00e5ff]" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="bg-[#ff4081] text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Low-Level Emergency site status indicator */}
          <div className="p-3 bg-red-950/20 rounded-2xl border border-red-500/20 text-center space-y-1.5 mt-auto">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-red-400">
              <span className={`w-2 h-2 rounded-full ${clientSiteOnline ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`} />
              <span>{clientSiteOnline ? "PUBLIC PORTAL ONLINE" : "PORTAL EMERGENCY OFF"}</span>
            </div>
            <button
              onClick={() => {
                setClientSiteOnline(!clientSiteOnline);
                onToast(clientSiteOnline ? "🚨 Emergency shutdown issued. Portal is sealed." : "🟢 Portal resumed live mode.", "info");
              }}
              className="w-full py-1 text-[9px] font-bold tracking-widest text-[#ffffff] uppercase bg-red-650 hover:bg-red-700 active:scale-95 transition-all rounded-lg scrollbar-thin font-mono cursor-pointer animate-[pulse_3s_infinite]"
            >
              {clientSiteOnline ? "LOCK DOWN SITE" : "OPEN WEBSITES"}
            </button>
          </div>
        </div>

        {/* --- MAIN ACTION HUB CONTAINER --- */}
        <div className="flex-grow flex flex-col min-h-0 overflow-y-auto p-4 md:p-6 bg-slate-950/20">
          
          {/* Urgent Broadcast Notice Ticker */}
          {maintenanceCountdown !== null && (
            <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-yellow-400 animate-pulse font-mono">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span>ALERT: SCHEDULED MAINTENANCE SHUTDOWN IN: <strong>{Math.floor(maintenanceCountdown / 60)}m {maintenanceCountdown % 60}s</strong></span>
              </div>
              <button 
                onClick={() => {
                  setMaintenanceCountdown(null);
                  onToast("✓ Aborted scheduled maintenance countdown.", "info");
                }} 
                className="px-2.5 py-0.5 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-105 hover:text-black rounded text-[10px] cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          )}

          {renderActiveTabContent()}
        </div>
      </div>

      {/* --- MOBILE COMPACT BOTTOM SHEET HUB --- */}
      <div className="flex md:hidden flex-col h-full min-h-0 relative overflow-hidden w-full bg-[#04040e]">
        {/* Live Status Core Telemetry background HUD */}
        <div className="flex-grow p-4 overflow-y-auto pb-20 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/50">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-5 h-5 text-[#00e5ff] animate-pulse" />
              <span className="text-xs font-bold font-orbitron tracking-wider text-[#00e5ff] uppercase">Flux Telemetry</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Live Nodes Monitor</span>
          </div>

          <div className="bg-[#060613]/85 border border-slate-800/80 p-4 rounded-3xl space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#00e5ff] tracking-wide">SYSTEM REAL-TIME STATUS</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-black/50 border border-slate-900 rounded-2xl">
                <div className="text-[8px] text-slate-400 font-mono uppercase">ONLINE USERS</div>
                <div className="text-xl font-bold text-white font-orbitron">{liveOnlineCount}</div>
              </div>
              <div className="p-3 bg-black/50 border border-slate-900 rounded-2xl">
                <div className="text-[8px] text-slate-400 font-mono uppercase">CPU CORE LOAD</div>
                <div className="text-xl font-bold text-amber-500 font-orbitron">{cpuUsage}%</div>
              </div>
              <div className="p-3 bg-black/50 border border-slate-900 rounded-2xl">
                <div className="text-[8px] text-slate-400 font-mono uppercase">RAM ALLOCATION</div>
                <div className="text-xl font-bold text-purple-500 font-orbitron">{ramUsage}%</div>
              </div>
              <div className="p-3 bg-black/50 border border-slate-900 rounded-2xl">
                <div className="text-[8px] text-slate-400 font-mono uppercase">ACTIVE CONNECTIONS</div>
                <div className="text-xl font-bold text-emerald-500 font-orbitron">{activeConnections}</div>
              </div>
            </div>
          </div>

          {/* Emergency site status card */}
          <div className="p-4 bg-red-950/15 border border-red-500/20 rounded-3xl space-y-2 text-center animate-[pulse_3s_infinite]">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-red-400">
              <span className={`w-2 h-2 rounded-full ${clientSiteOnline ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`} />
              <span>{clientSiteOnline ? "PUBLIC PORTAL ONLINE" : "PORTAL SEVERED"}</span>
            </div>
            <button
              onClick={() => {
                setClientSiteOnline(!clientSiteOnline);
                onToast(clientSiteOnline ? "🚨 Emergency shutdown issued. Portal is sealed." : "🟢 Portal resumed live mode.", "info");
              }}
              className="w-full py-2 text-[10px] bg-red-650 hover:bg-red-700 font-mono text-white rounded-xl active:scale-95 transition-all cursor-pointer font-bold uppercase tracking-widest"
            >
              {clientSiteOnline ? "LOCK DOWN SITE" : "OPEN WEBSITES"}
            </button>
          </div>

          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-3xl text-slate-400 text-xs space-y-2">
            <span className="font-bold text-slate-200 block">Mobile Guide Prompt:</span>
            <p className="text-[10px] leading-relaxed">
              Use the sliding **Bottom Drawer Hub** below. Tap categories or swipe between views. Double-click the drag handle at the top of the header drawer of the sheet to toggle between compact height, matching preview tracking, or full logging data streams!
            </p>
          </div>
        </div>

        {/* DRAGGABLE / TABBED BOTTOM SHEET DRAWER */}
        <div 
          className={`absolute bottom-0 left-0 right-0 z-40 flex flex-col rounded-t-[32px] border-t border-slate-800 bg-[#060613]/95 backdrop-blur-xl transition-all duration-300 shadow-2xl ${
            mobileSheetState === "min" 
              ? "h-14 overflow-hidden" 
              : mobileSheetState === "mid" 
                ? "h-[45vh]" 
                : "h-[86vh]"
          }`}
        >
          {/* Header handle block for drag */}
          <div 
            onClick={() => setMobileSheetState(mobileSheetState === "min" ? "mid" : mobileSheetState === "mid" ? "max" : "min")}
            className="flex-shrink-0 cursor-pointer pt-2 pb-1 border-b border-slate-800/30"
          >
            <div className="w-12 h-1 bg-slate-700 hover:bg-slate-500 rounded-full mx-auto mb-2 transition-colors" />
            <div className="flex items-center justify-between px-5">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#00e5ff] animate-pulse" />
                <span className="text-[10px] font-bold uppercase font-orbitron tracking-wide text-slate-200">
                  Flux Mod Drawer ({activeTab.toUpperCase()})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileSheetState("min");
                  }} 
                  className={`text-[9px] px-2 py-0.5 rounded border border-slate-800 text-slate-400 hover:text-white ${mobileSheetState === "min" ? "bg-purple-950/30 text-[#00e5ff]" : ""}`}
                >
                  Min
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileSheetState("mid");
                  }} 
                  className={`text-[9px] px-2 py-0.5 rounded border border-slate-800 text-slate-400 hover:text-white ${mobileSheetState === "mid" ? "bg-purple-950/30 text-[#00e5ff]" : ""}`}
                >
                  Mid
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileSheetState("max");
                  }} 
                  className={`text-[9px] px-2 py-0.5 rounded border border-slate-800 text-slate-400 hover:text-white ${mobileSheetState === "max" ? "bg-purple-950/30 text-[#00e5ff]" : ""}`}
                >
                  Max
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Scrolling Tab Navigation */}
          <div className="flex-shrink-0 overflow-x-auto px-4 py-2 bg-[#0c0c24]/30 border-b border-slate-800 scrollbar-none flex gap-1.5 items-center">
            {[
              { id: "overview", label: "Overview", icon: Activity },
              { id: "users", label: "Users", icon: Users },
              { id: "sessions", label: "Sessions", icon: Radio },
              { id: "reports", label: "Reports", icon: BadgeAlert, badge: reports.filter(r => r.status === "pending").length },
              { id: "bans", label: "Bans", icon: Ban },
              { id: "chatlogs", label: "Logs", icon: FileText },
              { id: "filters", label: "Filters", icon: SlidersHorizontal },
              { id: "events", label: "Events", icon: Megaphone },
              { id: "charts", label: "Charts", icon: Sliders },
              { id: "admins", label: "Admins", icon: ShieldCheck }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setUserSearchQuery("");
                    // Expand sheet so they can see input logs immediately
                    if (mobileSheetState === "min") {
                      setMobileSheetState("mid");
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap transition-all border cursor-pointer ${
                    isSel
                      ? "bg-[#7c4dff]/25 text-[#00e5ff] border-[#00e5ff]/50 font-bold"
                      : "text-slate-400 bg-slate-900/40 border-slate-800 hover:bg-slate-900/70"
                  }`}
                >
                  <TabIcon className="w-3 h-3" />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="bg-[#ff4081] text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Scrollable Core Tab Views inside Mobile Drawer Body */}
          <div className="flex-grow overflow-y-auto p-4 md:p-6 pb-12 bg-slate-950/20">
            {renderActiveTabContent()}
          </div>
        </div>
      </div>

      {/* --- FLOATING MODAL 1: CHATTRANSCRIPT EXAMINER MODAL --- */}
      {selectedReportDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-lg p-6 rounded-3xl border border-slate-800 bg-[#070718] text-left space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-white uppercase font-orbitron">Report Transcript Examiner - Case {selectedReportDetail.id}</h3>
                <p className="text-[10px] text-yellow-400 font-mono mt-0.5">Reported: {selectedReportDetail.reportedUsername} | Reason: {selectedReportDetail.reason}</p>
              </div>
              <button 
                onClick={() => setSelectedReportDetail(null)}
                className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3.5 p-3.5 bg-black/60 rounded-2xl border border-slate-900 scrollbar-thin">
              {selectedReportDetail.chatTranscript.map((msg, i) => (
                <div key={i} className={`p-2.5 rounded-xl text-xs max-w-sm ${
                  msg.sender === selectedReportDetail.reportedUsername 
                    ? "bg-red-500/10 text-red-300 border border-red-500/20" 
                    : "bg-slate-900 text-slate-350 border border-slate-800 ml-auto"
                }`}>
                  <span className="text-[9px] font-mono text-slate-550 block mb-0.5 uppercase tracking-wider font-bold">{msg.sender}</span>
                  <p>{renderHighlightedTranscript(msg.text)}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2.5 pt-3.5 border-t border-slate-800 flex-wrap">
              <button 
                onClick={() => handleReportAction(selectedReportDetail.id, "warn")}
                className="flex-1 py-2 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-100 hover:text-black font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                Warn reported
              </button>
              <button 
                onClick={() => handleReportAction(selectedReportDetail.id, "ban")}
                className="flex-1 py-2 bg-red-650 hover:bg-red-700 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                Ban reported
              </button>
              <button 
                onClick={() => handleReportAction(selectedReportDetail.id, "dismiss")}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs rounded-xl cursor-pointer"
              >
                Dismiss Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING MODAL 2: USER DETAIL HISTORY INPSECT --- */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md p-6 rounded-3xl border border-slate-800 bg-[#070718] text-left space-y-4 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white font-orbitron uppercase">User Registry profile dossier</h3>
                <span className="text-[10px] text-purple-400 font-mono font-bold">IDENTITY ID: {selectedUserDetail.id}</span>
              </div>
              <button onClick={() => setSelectedUserDetail(null)} className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded-full cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/45 p-3 rounded-2xl border border-slate-900">
                  <span className="text-[9px] text-slate-500 font-mono block">USERNAME</span>
                  <span className="text-white font-semibold block mt-0.5">{selectedUserDetail.username}</span>
                </div>
                <div className="bg-black/45 p-3 rounded-2xl border border-slate-900">
                  <span className="text-[9px] text-slate-500 font-mono block">RESTRICTION STATUS</span>
                  <span className="text-[#00e5ff] font-extrabold uppercase mt-0.5 block">{selectedUserDetail.status}</span>
                </div>
              </div>

              <div className="bg-black/45 p-3.5 rounded-2xl border border-slate-900 space-y-2.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email Address:</span>
                  <span className="text-slate-200">{selectedUserDetail.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Remote IP Address:</span>
                  <span className="text-slate-200">{selectedUserDetail.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Geo Origin:</span>
                  <span className="text-slate-200">{selectedUserDetail.country}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">Join date log:</span>
                  <span className="text-[#00e5ff]">{selectedUserDetail.joinDate}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] text-slate-550 font-bold uppercase font-mono block">Mitigation Constraint History logs</span>
                <div className="p-3 bg-black/60 rounded-xl max-h-24 overflow-y-auto text-[10px] text-slate-400 border border-slate-900 space-y-1 font-mono leading-normal">
                  {selectedUserDetail.banHistory.length === 0 ? (
                    <div className="text-slate-600">No historic warning alerts or block constraints found on this profile card.</div>
                  ) : (
                    selectedUserDetail.banHistory.map((h, i) => <div key={i}>⚠ {h}</div>)
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-slate-800">
              <button 
                onClick={() => {
                  handleUserUnban(selectedUserDetail.id);
                  setSelectedUserDetail(null);
                }}
                className="flex-1 py-2 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black font-semibold rounded-xl text-xs cursor-pointer transition-all"
              >
                Whitelist User
              </button>
              <button onClick={() => setSelectedUserDetail(null)} className="px-5 py-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:text-white text-xs cursor-pointer">
                Dismiss dossier info
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
